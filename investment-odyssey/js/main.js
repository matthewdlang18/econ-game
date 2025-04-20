/**
 * Investment Odyssey - Main Application
 * Handles authentication, navigation, and game initialization
 */

// DOM Elements
const loadingSection = document.getElementById('loading-section');
const notAuthenticatedSection = document.getElementById('not-authenticated-section');
const mainPageAuthMessage = document.getElementById('main-page-auth-message');
const useMainSessionBtn = document.getElementById('use-main-session-btn');
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

    // First, try to get the session directly from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!sessionError && session) {
      console.log('Active session found:', session.user.id);

      // Try to get the profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        console.log('Profile found:', profile.name);
        currentProfile = profile;
        showDashboard(profile);
        return;
      }

      console.log('No profile found for session user');
    } else {
      console.log('No active session found');
    }

    // If we get here, either there's no session or no profile found
    // Show the not authenticated section
    showNotAuthenticated();
  } catch (err) {
    console.error('Auth check error:', err);
    showNotAuthenticated();
  }
}

// Show not authenticated section
async function showNotAuthenticated() {
  loadingSection.classList.add('d-none');
  notAuthenticatedSection.classList.remove('d-none');
  gameDashboard.classList.add('d-none');
  gameInterface.classList.add('d-none');
  userInfo.classList.add('d-none');

  // Check if user is logged in on main page
  const isMainPageAuth = await authHelper.checkMainPageAuth();
  if (isMainPageAuth) {
    mainPageAuthMessage.classList.remove('d-none');
  } else {
    mainPageAuthMessage.classList.add('d-none');
  }
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
    // Show loading section
    loadingSection.classList.remove('d-none');
    gameDashboard.classList.add('d-none');

    // Sign out from Supabase Auth
    await supabase.auth.signOut();

    // Reset current profile
    currentProfile = null;

    // Redirect to main page
    window.location.href = '../index.html';
  } catch (err) {
    console.error('Logout error:', err);
    showNotAuthenticated();
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
      alert('Failed to create guest profile. Please try again or log in.');
      showNotAuthenticated();
      return;
    }

    // Try to sign in with the guest profile
    const email = `${result.profile.custom_id}@example.com`;
    const authPassword = 'password123'; // Same as in auth-helper.js

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: authPassword
    });

    if (signInError) {
      console.error('Guest sign in error:', signInError);
      // Continue anyway, just show the profile
    } else {
      console.log('Guest signed in successfully');
    }

    // Show dashboard with guest profile
    currentProfile = result.profile;
    showDashboard(result.profile);
  } catch (err) {
    console.error('Guest mode error:', err);
    alert('An error occurred. Please try again or log in.');
    showNotAuthenticated();
  }
});

// Handle use main session button click
useMainSessionBtn.addEventListener('click', async () => {
  // Show loading section
  loadingSection.classList.remove('d-none');
  notAuthenticatedSection.classList.add('d-none');

  // Redirect to main page and back to refresh the session
  window.location.href = '../index.html?redirect=investment-odyssey';
});

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Investment Odyssey initializing...');

  // Check if we were redirected from the main page
  const urlParams = new URLSearchParams(window.location.search);
  const redirected = urlParams.get('redirected');

  // Remove any query parameters to avoid confusion on refresh
  if (window.location.search) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  // If redirected from main page, force refresh the auth state
  if (redirected === 'true') {
    console.log('Redirected from main page, refreshing auth state');
    await supabase.auth.refreshSession();
  }

  // First check if we have an active session
  const { session, error } = await window.isAuthenticated();

  if (session) {
    console.log('Active session found, user is authenticated');
  } else {
    console.log('No active session found, will try to create guest profile');
  }

  // Check authentication status - this will automatically create a guest profile if needed
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
