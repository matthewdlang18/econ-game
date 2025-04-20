-- Create game_states table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    game_type TEXT NOT NULL,
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id and game_type for faster lookups
CREATE INDEX IF NOT EXISTS game_states_user_id_game_type_idx ON game_states (user_id, game_type);

-- Create RLS policies for game_states table
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read game_states
CREATE POLICY game_states_select_policy ON game_states
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own game_states
CREATE POLICY game_states_insert_policy ON game_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own game_states
CREATE POLICY game_states_update_policy ON game_states
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own game_states
CREATE POLICY game_states_delete_policy ON game_states
    FOR DELETE USING (auth.uid() = user_id);
