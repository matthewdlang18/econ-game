-- Create game_states table for storing game progress
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS game_states_user_id_game_type_idx ON game_states (user_id, game_type);

-- Add RLS policies
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own game states
CREATE POLICY "Users can read their own game states" 
ON game_states FOR SELECT 
USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own game states
CREATE POLICY "Users can insert their own game states" 
ON game_states FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own game states
CREATE POLICY "Users can update their own game states" 
ON game_states FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Policy to allow users to delete their own game states
CREATE POLICY "Users can delete their own game states" 
ON game_states FOR DELETE 
USING (auth.uid()::text = user_id);

-- Allow anonymous access for guest users
CREATE POLICY "Allow anonymous access" 
ON game_states 
USING (user_id LIKE 'guest_%');
