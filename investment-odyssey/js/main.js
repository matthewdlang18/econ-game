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
    // Use auth helper to check if user is authenticated
    const isAuth = await authHelper.isAuthenticated();

    if (!isAuth) {
      console.log('No active session found');
      showLogin();
      return;
    }

    // Get current user
    const user = await authHelper.getCurrentUser();

    if (!user) {
      console.log('No user found in session');
      showLogin();
      return;
    }

    console.log('User authenticated:', user.id);

    // Get user profile
    let profile = await authHelper.getUserProfile(user.id);

    if (!profile) {
      // If profile not found by ID, try to find by email
      const email = user.email || `${user.id}@example.com`;
      const emailParts = email.split('@');
      const customId = emailParts[0];

      const { data: profileByCustomId } = await supabase
        .from('profiles')
        .select('*')
        .eq('custom_id', customId)
        .maybeSingle();

      if (profileByCustomId) {
        profile = profileByCustomId;
      }
    }

    if (!profile) {
      console.error('Profile not found');
      showLogin();
      return;
    }

    console.log('Profile loaded:', profile.name);

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
    // First, try to find the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .eq('passcode', passcode)
      .maybeSingle();

    if (profileError || !profile) {
      loginError.textContent = 'Invalid name or passcode.';
      return;
    }

    console.log('Profile found:', profile.name);

    // Create a unique email for authentication
    const email = `${profile.custom_id}@example.com`;

    // Check if user already exists in auth
    try {
      // Try to sign in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: passcode
      });

      if (signInError) {
        // If sign in fails, try to sign up
        console.log('Sign in failed, trying to sign up');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: passcode,
          options: {
            data: {
              name: profile.name,
              role: profile.role
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          loginError.textContent = 'Authentication error. Please try again.';
          return;
        }
      }
    } catch (authError) {
      console.error('Auth error:', authError);
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
    // Generate a random guest name and email
    const guestName = 'Guest_' + Math.floor(Math.random() * 10000);
    const guestEmail = `guest_${Math.random().toString(36).substring(2, 10)}@example.com`;
    const guestPassword = 'guest123';

    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: guestEmail,
      password: guestPassword,
      options: {
        data: {
          name: guestName,
          role: 'guest'
        }
      }
    });

    if (authError) {
      console.error('Guest auth creation error:', authError);
      loginError.textContent = 'Failed to create guest account.';
      return;
    }

    // Get the user ID from the auth response
    const userId = authData.user.id;
    const customId = crypto.randomUUID();

    // Create a guest profile linked to the auth user
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId, // Link to auth user
        name: guestName,
        custom_id: customId,
        role: 'guest',
        passcode: guestPassword,
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

    // Sign in the guest
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPassword
    });

    if (signInError) {
      console.error('Guest sign in error:', signInError);
      loginError.textContent = 'Failed to sign in as guest.';
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
  // Check if we were redirected from the main page with a session
  const urlParams = new URLSearchParams(window.location.search);
  const hasSession = urlParams.get('session');

  if (hasSession === 'true') {
    console.log('Redirected from main page with session');
    // Remove the query parameter to avoid confusion on refresh
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  // Check authentication status
  checkAuth();

  // Initialize game UI components
  if (typeof gameUI !== 'undefined') {
    gameUI.initGameUI();
  }

  // Add event listener to handle page visibility changes
  // This helps maintain authentication state when user returns to the page
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !currentProfile) {
      checkAuth();
    }
  });
});
