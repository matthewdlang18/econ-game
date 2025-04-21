-- SQL functions to create tables for Investment Odyssey game

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to create leaderboard table
CREATE OR REPLACE FUNCTION create_leaderboard_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    game_mode TEXT NOT NULL,
    game_id TEXT,
    section_id TEXT,
    final_value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS leaderboard_user_id_idx ON leaderboard(user_id);
  
  -- Create index on section_id for filtering by section
  CREATE INDEX IF NOT EXISTS leaderboard_section_id_idx ON leaderboard(section_id);
  
  -- Enable RLS
  ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow all authenticated users to read
  DROP POLICY IF EXISTS "Allow all users to read leaderboard" ON leaderboard;
  CREATE POLICY "Allow all users to read leaderboard" 
    ON leaderboard FOR SELECT 
    USING (true);
  
  -- Create policy to allow users to insert their own scores
  DROP POLICY IF EXISTS "Allow users to insert their own scores" ON leaderboard;
  CREATE POLICY "Allow users to insert their own scores" 
    ON leaderboard FOR INSERT 
    WITH CHECK (true);
  
  -- Create policy to allow users to update their own scores
  DROP POLICY IF EXISTS "Allow users to update their own scores" ON leaderboard;
  CREATE POLICY "Allow users to update their own scores" 
    ON leaderboard FOR UPDATE 
    USING (true);
END;
$$;

-- Function to create game_sessions table
CREATE OR REPLACE FUNCTION create_game_sessions_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id TEXT NOT NULL,
    max_rounds INTEGER NOT NULL DEFAULT 20,
    current_round INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Create index on section_id for faster lookups
  CREATE INDEX IF NOT EXISTS game_sessions_section_id_idx ON game_sessions(section_id);
  
  -- Enable RLS
  ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow all authenticated users to read
  DROP POLICY IF EXISTS "Allow all users to read game_sessions" ON game_sessions;
  CREATE POLICY "Allow all users to read game_sessions" 
    ON game_sessions FOR SELECT 
    USING (true);
  
  -- Create policy to allow all authenticated users to insert
  DROP POLICY IF EXISTS "Allow all users to insert game_sessions" ON game_sessions;
  CREATE POLICY "Allow all users to insert game_sessions" 
    ON game_sessions FOR INSERT 
    WITH CHECK (true);
  
  -- Create policy to allow all authenticated users to update
  DROP POLICY IF EXISTS "Allow all users to update game_sessions" ON game_sessions;
  CREATE POLICY "Allow all users to update game_sessions" 
    ON game_sessions FOR UPDATE 
    USING (true);
END;
$$;

-- Function to create game_states table
CREATE OR REPLACE FUNCTION create_game_states_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 0,
    asset_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
    price_history JSONB NOT NULL DEFAULT '{}'::jsonb,
    cpi NUMERIC NOT NULL DEFAULT 100,
    cpi_history JSONB NOT NULL DEFAULT '[100]'::jsonb,
    last_bitcoin_crash_round INTEGER,
    bitcoin_shock_range JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(game_id, user_id)
  );
  
  -- Create index on game_id for faster lookups
  CREATE INDEX IF NOT EXISTS game_states_game_id_idx ON game_states(game_id);
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS game_states_user_id_idx ON game_states(user_id);
  
  -- Enable RLS
  ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow all authenticated users to read
  DROP POLICY IF EXISTS "Allow all users to read game_states" ON game_states;
  CREATE POLICY "Allow all users to read game_states" 
    ON game_states FOR SELECT 
    USING (true);
  
  -- Create policy to allow all authenticated users to insert
  DROP POLICY IF EXISTS "Allow all users to insert game_states" ON game_states;
  CREATE POLICY "Allow all users to insert game_states" 
    ON game_states FOR INSERT 
    WITH CHECK (true);
  
  -- Create policy to allow all authenticated users to update
  DROP POLICY IF EXISTS "Allow all users to update game_states" ON game_states;
  CREATE POLICY "Allow all users to update game_states" 
    ON game_states FOR UPDATE 
    USING (true);
END;
$$;

-- Function to create player_states table
CREATE OR REPLACE FUNCTION create_player_states_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS player_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    cash NUMERIC NOT NULL DEFAULT 10000,
    portfolio JSONB NOT NULL DEFAULT '{}'::jsonb,
    trade_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    portfolio_value_history JSONB NOT NULL DEFAULT '[10000]'::jsonb,
    total_value NUMERIC NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(game_id, user_id)
  );
  
  -- Create index on game_id for faster lookups
  CREATE INDEX IF NOT EXISTS player_states_game_id_idx ON player_states(game_id);
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS player_states_user_id_idx ON player_states(user_id);
  
  -- Enable RLS
  ALTER TABLE player_states ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow all authenticated users to read
  DROP POLICY IF EXISTS "Allow all users to read player_states" ON player_states;
  CREATE POLICY "Allow all users to read player_states" 
    ON player_states FOR SELECT 
    USING (true);
  
  -- Create policy to allow all authenticated users to insert
  DROP POLICY IF EXISTS "Allow all users to insert player_states" ON player_states;
  CREATE POLICY "Allow all users to insert player_states" 
    ON player_states FOR INSERT 
    WITH CHECK (true);
  
  -- Create policy to allow all authenticated users to update
  DROP POLICY IF EXISTS "Allow all users to update player_states" ON player_states;
  CREATE POLICY "Allow all users to update player_states" 
    ON player_states FOR UPDATE 
    USING (true);
END;
$$;
