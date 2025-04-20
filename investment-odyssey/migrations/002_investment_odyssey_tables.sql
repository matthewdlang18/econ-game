-- Investment Odyssey Tables
-- This migration adds the necessary tables for the Investment Odyssey game

-- Games Table (if not exists)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('single_player', 'class_game')),
  section_id UUID,
  creator_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  current_round INTEGER NOT NULL DEFAULT 0,
  max_rounds INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Game Rounds Table (if not exists)
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL,
  round_number INTEGER NOT NULL,
  asset_prices JSONB NOT NULL,
  price_history JSONB NOT NULL,
  cpi NUMERIC NOT NULL,
  cpi_history JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE (game_id, round_number)
);

-- Player States Table (if not exists)
CREATE TABLE IF NOT EXISTS player_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL,
  user_id UUID NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 0,
  cash NUMERIC NOT NULL DEFAULT 10000,
  portfolio JSONB NOT NULL,
  portfolio_value NUMERIC NOT NULL DEFAULT 10000,
  portfolio_history JSONB NOT NULL,
  trade_history JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (game_id, user_id)
);

-- Leaderboard Table (if not exists)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  game_id UUID,
  game_type TEXT NOT NULL CHECK (game_type IN ('single_player', 'class_game')),
  game_mode TEXT NOT NULL DEFAULT 'standard',
  final_portfolio NUMERIC NOT NULL,
  ta_name TEXT,
  section_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
);

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_games_section_id ON games(section_id);
CREATE INDEX IF NOT EXISTS idx_games_creator_id ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_player_states_game_id ON player_states(game_id);
CREATE INDEX IF NOT EXISTS idx_player_states_user_id ON player_states(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_id ON leaderboard(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_section_id ON leaderboard(section_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);

CREATE POLICY "Users can create games" ON games
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their games" ON games
  FOR UPDATE USING (auth.uid() = creator_id);

-- Game rounds policies
CREATE POLICY "Game rounds are viewable by everyone" ON game_rounds
  FOR SELECT USING (true);

CREATE POLICY "TAs can create game rounds" ON game_rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      JOIN profiles ON profiles.id = games.creator_id
      WHERE games.id = game_id
      AND profiles.id = auth.uid()
      AND profiles.role = 'ta'
    )
  );

-- Player states policies
CREATE POLICY "Player states are viewable by everyone" ON player_states
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own player states" ON player_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player states" ON player_states
  FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard policies
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can add their own scores to leaderboard" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);
