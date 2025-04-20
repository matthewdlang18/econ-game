// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Fetch user profile by name and passcode
async function fetchProfile(name, passcode) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('name', name)
    .eq('passcode', passcode)
    .maybeSingle();
  return { data, error };
}

// Helper: Fetch all sections with TA name joined from profiles
async function fetchSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*, profiles:ta_id(name)');
  return { data, error };
}

// Helper: Fetch all sections for a TA by custom_id
async function fetchTASections(taCustomId) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('ta_id', taCustomId);
  return { data, error };
}

// Helper: Fetch all students in a section
async function fetchStudentsBySection(sectionId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, custom_id')
    .eq('role', 'student')
    .eq('section_id', sectionId);
  return { data, error };
}

// Helper: Fetch games for a section
async function fetchGamesBySection(sectionId) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Helper: Fetch games for a student
async function fetchGamesByStudent(studentId) {
  const { data, error } = await supabase
    .from('player_states')
    .select('*, games(*)')
    .eq('user_id', studentId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Helper: Update user's section_id
async function updateUserSection(userId, sectionId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ section_id: sectionId })
    .eq('id', userId)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Create a new game
async function createGame(gameData) {
  const { data, error } = await supabase
    .from('games')
    .insert(gameData)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Update game status
async function updateGameStatus(gameId, status) {
  const { data, error } = await supabase
    .from('games')
    .update({ status: status })
    .eq('id', gameId)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Advance game round
async function advanceGameRound(gameId, currentRound) {
  const { data, error } = await supabase
    .from('games')
    .update({ current_round: currentRound + 1 })
    .eq('id', gameId)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Create game round
async function createGameRound(roundData) {
  const { data, error } = await supabase
    .from('game_rounds')
    .insert(roundData)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Get game round
async function getGameRound(gameId, roundNumber) {
  const { data, error } = await supabase
    .from('game_rounds')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .maybeSingle();
  return { data, error };
}

// Helper: Create player state
async function createPlayerState(playerData) {
  const { data, error } = await supabase
    .from('player_states')
    .insert(playerData)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Update player state
async function updatePlayerState(gameId, userId, playerData) {
  const { data, error } = await supabase
    .from('player_states')
    .update(playerData)
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Get player state
async function getPlayerState(gameId, userId) {
  const { data, error } = await supabase
    .from('player_states')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

// Helper: Get game participants
async function getGameParticipants(gameId) {
  const { data, error } = await supabase
    .from('player_states')
    .select('*, profiles:user_id(name)')
    .eq('game_id', gameId)
    .order('portfolio_value', { ascending: false });
  return { data, error };
}

// Helper: Add to leaderboard
async function addToLeaderboard(leaderboardData) {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert(leaderboardData)
    .select()
    .maybeSingle();
  return { data, error };
}

// Helper: Get leaderboard
async function getLeaderboard(options = {}) {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('final_portfolio', { ascending: false })
    .limit(options.limit || 20);

  if (options.gameType) {
    query = query.eq('game_type', options.gameType);
  }

  if (options.sectionId) {
    query = query.eq('section_id', options.sectionId);
  }

  if (options.fromDate) {
    query = query.gte('created_at', options.fromDate);
  }

  const { data, error } = await query;
  return { data, error };
}
