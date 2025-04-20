-- Investment Odyssey Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_id UUID DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'ta', 'guest')),
  passcode TEXT NOT NULL,
  section_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  ta_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (ta_id) REFERENCES profiles(custom_id) ON DELETE CASCADE
);

-- Add foreign key constraint to profiles.section_id
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_section
FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL;

-- Games Table
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

-- Game Rounds Table
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

-- Player States Table
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

-- Leaderboard Table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_section_id ON profiles(section_id);
CREATE INDEX IF NOT EXISTS idx_games_section_id ON games(section_id);
CREATE INDEX IF NOT EXISTS idx_games_creator_id ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_player_states_game_id ON player_states(game_id);
CREATE INDEX IF NOT EXISTS idx_player_states_user_id ON player_states(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_id ON leaderboard(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_section_id ON leaderboard(section_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at);

-- Create Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sections policies
CREATE POLICY "Sections are viewable by everyone" ON sections
  FOR SELECT USING (true);

CREATE POLICY "TAs can create sections" ON sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ta'
    )
  );

CREATE POLICY "TAs can update their own sections" ON sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ta'
      AND profiles.custom_id = ta_id
    )
  );

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

-- Create sample data for testing
-- Create a TA profile
INSERT INTO profiles (name, role, passcode, custom_id)
VALUES ('Demo TA', 'ta', 'ta123', uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- Create a section
INSERT INTO sections (day, time, location, ta_id)
SELECT 'Monday', '10:00 AM', 'Room 101', custom_id
FROM profiles
WHERE name = 'Demo TA' AND role = 'ta'
ON CONFLICT DO NOTHING;

-- Create a student profile
INSERT INTO profiles (name, role, passcode, section_id, custom_id)
SELECT 'Demo Student', 'student', 'student123', id, uuid_generate_v4()
FROM sections
WHERE day = 'Monday' AND time = '10:00 AM'
ON CONFLICT DO NOTHING;

-- Create a guest profile
INSERT INTO profiles (name, role, passcode, custom_id)
VALUES ('Guest User', 'guest', 'guest', uuid_generate_v4())
ON CONFLICT DO NOTHING;
