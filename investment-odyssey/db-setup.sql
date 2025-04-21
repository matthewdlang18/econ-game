-- Investment Odyssey Database Setup

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  current_round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 20,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game States Table
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  asset_prices JSONB NOT NULL,
  price_history JSONB NOT NULL,
  cpi FLOAT NOT NULL,
  cpi_history JSONB NOT NULL,
  last_bitcoin_crash_round INTEGER DEFAULT 0,
  bitcoin_shock_range JSONB DEFAULT '[-0.5, -0.75]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id, round_number)
);

-- Player States Table
CREATE TABLE IF NOT EXISTS player_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cash FLOAT NOT NULL DEFAULT 10000,
  portfolio JSONB NOT NULL DEFAULT '{}',
  trade_history JSONB NOT NULL DEFAULT '[]',
  portfolio_value_history JSONB NOT NULL DEFAULT '[10000]',
  total_value FLOAT NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('single', 'class')),
  game_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  final_value FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Row Level Security Policies

-- Game Sessions RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow instructors to manage their own sections' game sessions
CREATE POLICY game_sessions_instructor_policy ON game_sessions
  FOR ALL
  USING (
    section_id IN (
      SELECT id FROM sections WHERE ta_id = auth.uid()
    )
  );

-- Allow students to view game sessions for their section
CREATE POLICY game_sessions_student_view_policy ON game_sessions
  FOR SELECT
  USING (
    section_id IN (
      SELECT section_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Game States RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own game states
CREATE POLICY game_states_user_policy ON game_states
  FOR ALL
  USING (user_id = auth.uid());

-- Allow instructors to view game states for their sections
CREATE POLICY game_states_instructor_view_policy ON game_states
  FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM game_sessions WHERE section_id IN (
        SELECT id FROM sections WHERE ta_id = auth.uid()
      )
    )
  );

-- Player States RLS
ALTER TABLE player_states ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own player states
CREATE POLICY player_states_user_policy ON player_states
  FOR ALL
  USING (user_id = auth.uid());

-- Allow instructors to view player states for their sections
CREATE POLICY player_states_instructor_view_policy ON player_states
  FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM game_sessions WHERE section_id IN (
        SELECT id FROM sections WHERE ta_id = auth.uid()
      )
    )
  );

-- Leaderboard RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow all users to view the leaderboard
CREATE POLICY leaderboard_view_policy ON leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to add their own scores
CREATE POLICY leaderboard_insert_policy ON leaderboard
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow instructors to view and manage leaderboard entries for their sections
CREATE POLICY leaderboard_instructor_policy ON leaderboard
  FOR ALL
  USING (
    section_id IN (
      SELECT id FROM sections WHERE ta_id = auth.uid()
    )
  );
