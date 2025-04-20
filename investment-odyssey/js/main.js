/**
 * Investment Odyssey - Main Application
 * Handles authentication, navigation, and game initialization
 */

// DOM Elements
const loginSection = document.getElementById('login-section');
const gameDashboard = document.getElementById('game-dashboard');
const gameInterface = document.getElementById('game-interface');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const guestModeBtn = document.getElementById('guest-mode-btn');
const singlePlayerBtn = document.getElementById('single-player-btn');
const classGameBtn = document.getElementById('class-game-btn');

// Current user profile
let currentProfile = null;

// Check if user is already logged in
async function checkAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // No active session, show login
      showLogin();
      return;
    }
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      showLogin();
      return;
    }
    
    // User is logged in, show dashboard
    currentProfile = profile;
    showDashboard(profile);
  } catch (err) {
    console.error('Auth check error:', err);
    showLogin();
  }
}

// Show login section
function showLogin() {
  loginSection.classList.remove('d-none');
  gameDashboard.classList.add('d-none');
  gameInterface.classList.add('d-none');
  userInfo.classList.add('d-none');
}

// Show dashboard
function showDashboard(profile) {
  // Hide login, show dashboard
  loginSection.classList.add('d-none');
  gameDashboard.classList.remove('d-none');
  gameInterface.classList.add('d-none');
  
  // Update user info
  userName.textContent = profile.name;
  userInfo.classList.remove('d-none');
  
  // Load player stats
  loadPlayerStats(profile);
}

// Load player statistics
async function loadPlayerStats(profile) {
  const playerStats = document.getElementById('player-stats');
  
  try {
    // Fetch player's games from leaderboard
    const { data: games, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching player stats:', error);
      playerStats.innerHTML = '<p>Error loading statistics.</p>';
      return;
    }
    
    if (!games || games.length === 0) {
      playerStats.innerHTML = '<p>You haven\'t played any games yet.</p>';
      return;
    }
    
    // Calculate statistics
    const totalGames = games.length;
    const bestScore = Math.max(...games.map(game => game.final_portfolio));
    const avgScore = games.reduce((sum, game) => sum + game.final_portfolio, 0) / totalGames;
    const lastGame = games[0];
    
    // Display statistics
    playerStats.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <p><strong>Total Games:</strong> ${totalGames}</p>
          <p><strong>Best Score:</strong> $${gameUI.formatCurrency(bestScore)}</p>
          <p><strong>Average Score:</strong> $${gameUI.formatCurrency(avgScore)}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Last Game:</strong> $${gameUI.formatCurrency(lastGame.final_portfolio)}</p>
          <p><strong>Return:</strong> ${gameUI.formatPercentage(((lastGame.final_portfolio / 10000) - 1) * 100)}</p>
          <p><strong>Date:</strong> ${new Date(lastGame.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div class="mt-2">
        <a href="leaderboard.html" class="btn btn-sm btn-outline-primary">View Leaderboard</a>
      </div>
    `;
  } catch (err) {
    console.error('Error loading player stats:', err);
    playerStats.innerHTML = '<p>Error loading statistics.</p>';
  }
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  
  const name = document.getElementById('name').value.trim();
  const passcode = document.getElementById('passcode').value.trim();
  
  try {
    // Fetch profile by name and passcode
    const { data: profile, error } = await fetchProfile(name, passcode);
    
    if (error || !profile) {
      loginError.textContent = 'Invalid name or passcode.';
      return;
    }
    
    // Sign in with Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${profile.custom_id}@example.com`, // Using custom_id as email
      password: passcode
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      loginError.textContent = 'Authentication error. Please try again.';
      return;
    }
    
    // Update last_login timestamp
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id);
    
    // Show dashboard
    currentProfile = profile;
    showDashboard(profile);
  } catch (err) {
    console.error('Login error:', err);
    loginError.textContent = 'An error occurred. Please try again.';
  }
});

// Handle guest mode button click
guestModeBtn.addEventListener('click', async () => {
  try {
    // Generate a random guest ID
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    
    // Create a guest profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        name: `Guest_${guestId.substring(6)}`,
        custom_id: guestId,
        role: 'guest',
        passcode: 'guest',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Guest profile creation error:', error);
      loginError.textContent = 'Failed to create guest account.';
      return;
    }
    
    // Show dashboard with guest profile
    currentProfile = profile;
    showDashboard(profile);
  } catch (err) {
    console.error('Guest mode error:', err);
    loginError.textContent = 'An error occurred. Please try again.';
  }
});

// Handle single player button click
singlePlayerBtn.addEventListener('click', () => {
  gameFunctions.startSinglePlayerGame();
});

// Handle class game button click
classGameBtn.addEventListener('click', () => {
  // Redirect to class game page
  window.location.href = 'class-game.html';
});

// Handle logout button click
logoutBtn.addEventListener('click', async () => {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Reset current profile
    currentProfile = null;
    
    // Show login
    showLogin();
  } catch (err) {
    console.error('Logout error:', err);
  }
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Initialize game UI components
  if (typeof gameUI !== 'undefined') {
    gameUI.initGameUI();
  }
});
