/**
 * Investment Odyssey - Main Application
 * Handles authentication, navigation, and game initialization
 */

// DOM Elements
const loadingSection = document.getElementById('loading-section');
const notAuthenticatedSection = document.getElementById('not-authenticated-section');
const gameDashboard = document.getElementById('game-dashboard');
const gameInterface = document.getElementById('game-interface');
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
    // Show loading section
    loadingSection.classList.remove('d-none');
    notAuthenticatedSection.classList.add('d-none');
    gameDashboard.classList.add('d-none');

    // Use auth helper to check if user is authenticated
    const isAuth = await authHelper.isAuthenticated();

    if (!isAuth) {
      console.log('No active session found');
      showNotAuthenticated();
      return;
    }

    // Get current user
    const user = await authHelper.getCurrentUser();

    if (!user) {
      console.log('No user found in session');
      showNotAuthenticated();
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
      showNotAuthenticated();
      return;
    }

    console.log('Profile loaded:', profile.name);

    // User is logged in, show dashboard
    currentProfile = profile;
    showDashboard(profile);
  } catch (err) {
    console.error('Auth check error:', err);
    showNotAuthenticated();
  }
}

// Show not authenticated section
function showNotAuthenticated() {
  loadingSection.classList.add('d-none');
  notAuthenticatedSection.classList.remove('d-none');
  gameDashboard.classList.add('d-none');
  gameInterface.classList.add('d-none');
  userInfo.classList.add('d-none');
}

// Show dashboard
function showDashboard(profile) {
  // Hide loading and not authenticated sections, show dashboard
  loadingSection.classList.add('d-none');
  notAuthenticatedSection.classList.add('d-none');
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

// Handle guest mode button click
guestModeBtn.addEventListener('click', async () => {
  try {
    // Show loading section
    loadingSection.classList.remove('d-none');
    notAuthenticatedSection.classList.add('d-none');

    // Create a guest profile using the auth helper
    const result = await authHelper.createGuestProfile();

    if (!result.success) {
      console.error('Failed to create guest profile:', result.error);
      showNotAuthenticated();
      return;
    }

    // Sign in the guest
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${result.profile.custom_id}@example.com`,
      password: result.profile.passcode
    });

    if (signInError) {
      console.error('Guest sign in error:', signInError);
      showNotAuthenticated();
      return;
    }

    // Show dashboard with guest profile
    currentProfile = result.profile;
    showDashboard(result.profile);
  } catch (err) {
    console.error('Guest mode error:', err);
    showNotAuthenticated();
  }
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Investment Odyssey initializing...');

  // Remove any query parameters to avoid confusion on refresh
  if (window.location.search) {
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
