/**
 * Investment Odyssey - Leaderboard
 * Handles leaderboard display and filtering
 */

// DOM Elements
const singlePlayerLeaderboard = document.getElementById('single-player-leaderboard');
const classGamesLeaderboard = document.getElementById('class-games-leaderboard');
const overallLeaderboard = document.getElementById('overall-leaderboard');
const sectionFilter = document.getElementById('section-filter');
const singleTimeFilter = document.getElementById('single-time-filter');
const classTimeFilter = document.getElementById('class-time-filter');
const overallTimeFilter = document.getElementById('overall-time-filter');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
}

// Format percentage
function formatPercentage(percentage) {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(percentage) + '%';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Get time filter date
function getTimeFilterDate(filter) {
  const now = new Date();
  
  switch (filter) {
    case 'week':
      // One week ago
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    case 'month':
      // One month ago
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
    default:
      // All time (beginning of time)
      return new Date(2000, 0, 1).toISOString();
  }
}

// Load single player leaderboard
async function loadSinglePlayerLeaderboard() {
  try {
    const timeFilter = singleTimeFilter.value;
    const fromDate = getTimeFilterDate(timeFilter);
    
    // Fetch leaderboard data
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('game_type', 'single_player')
      .gte('created_at', fromDate)
      .order('final_portfolio', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching single player leaderboard:', error);
      singlePlayerLeaderboard.innerHTML = '<tr><td colspan="5">Error loading leaderboard data.</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      singlePlayerLeaderboard.innerHTML = '<tr><td colspan="5">No leaderboard data available.</td></tr>';
      return;
    }
    
    // Render leaderboard
    singlePlayerLeaderboard.innerHTML = data.map((entry, index) => {
      const returnPercentage = ((entry.final_portfolio / 10000) - 1) * 100;
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      
      return `
        <tr>
          <td class="${rankClass}">${index + 1}</td>
          <td>${entry.user_name}</td>
          <td>$${formatCurrency(entry.final_portfolio)}</td>
          <td>${formatPercentage(returnPercentage)}</td>
          <td>${formatDate(entry.created_at)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading single player leaderboard:', err);
    singlePlayerLeaderboard.innerHTML = '<tr><td colspan="5">Error loading leaderboard data.</td></tr>';
  }
}

// Load class games leaderboard
async function loadClassGamesLeaderboard() {
  try {
    const timeFilter = classTimeFilter.value;
    const sectionId = sectionFilter.value;
    const fromDate = getTimeFilterDate(timeFilter);
    
    // Build query
    let query = supabase
      .from('leaderboard')
      .select('*, sections(*)')
      .eq('game_type', 'class_game')
      .gte('created_at', fromDate)
      .order('final_portfolio', { ascending: false })
      .limit(20);
    
    // Add section filter if not "all"
    if (sectionId !== 'all') {
      query = query.eq('section_id', sectionId);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching class games leaderboard:', error);
      classGamesLeaderboard.innerHTML = '<tr><td colspan="7">Error loading leaderboard data.</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      classGamesLeaderboard.innerHTML = '<tr><td colspan="7">No leaderboard data available.</td></tr>';
      return;
    }
    
    // Render leaderboard
    classGamesLeaderboard.innerHTML = data.map((entry, index) => {
      const returnPercentage = ((entry.final_portfolio / 10000) - 1) * 100;
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      const sectionInfo = entry.sections ? `${entry.sections.day} ${entry.sections.time}` : 'Unknown';
      
      return `
        <tr>
          <td class="${rankClass}">${index + 1}</td>
          <td>${entry.user_name}</td>
          <td>${sectionInfo}</td>
          <td>${entry.ta_name || 'Unknown'}</td>
          <td>$${formatCurrency(entry.final_portfolio)}</td>
          <td>${formatPercentage(returnPercentage)}</td>
          <td>${formatDate(entry.created_at)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading class games leaderboard:', err);
    classGamesLeaderboard.innerHTML = '<tr><td colspan="7">Error loading leaderboard data.</td></tr>';
  }
}

// Load overall leaderboard
async function loadOverallLeaderboard() {
  try {
    const timeFilter = overallTimeFilter.value;
    const fromDate = getTimeFilterDate(timeFilter);
    
    // Fetch leaderboard data
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .gte('created_at', fromDate)
      .order('final_portfolio', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching overall leaderboard:', error);
      overallLeaderboard.innerHTML = '<tr><td colspan="6">Error loading leaderboard data.</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      overallLeaderboard.innerHTML = '<tr><td colspan="6">No leaderboard data available.</td></tr>';
      return;
    }
    
    // Render leaderboard
    overallLeaderboard.innerHTML = data.map((entry, index) => {
      const returnPercentage = ((entry.final_portfolio / 10000) - 1) * 100;
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      const gameType = entry.game_type === 'single_player' ? 'Single Player' : 'Class Game';
      
      return `
        <tr>
          <td class="${rankClass}">${index + 1}</td>
          <td>${entry.user_name}</td>
          <td>${gameType}</td>
          <td>$${formatCurrency(entry.final_portfolio)}</td>
          <td>${formatPercentage(returnPercentage)}</td>
          <td>${formatDate(entry.created_at)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading overall leaderboard:', err);
    overallLeaderboard.innerHTML = '<tr><td colspan="6">Error loading leaderboard data.</td></tr>';
  }
}

// Load sections for filter
async function loadSections() {
  try {
    // Fetch sections
    const { data, error } = await supabase
      .from('sections')
      .select('*, profiles:ta_id(name)');
    
    if (error) {
      console.error('Error fetching sections:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      return;
    }
    
    // Add options to section filter
    data.forEach(section => {
      const taName = section.profiles ? section.profiles.name : 'Unknown';
      const option = document.createElement('option');
      option.value = section.id;
      option.textContent = `${section.day} ${section.time} - TA: ${taName}`;
      sectionFilter.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading sections:', err);
  }
}

// Check if user is logged in
async function checkAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // No active session
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
      return;
    }
    
    // Update user info
    userName.textContent = profile.name;
    userInfo.classList.remove('d-none');
  } catch (err) {
    console.error('Auth check error:', err);
  }
}

// Handle logout button click
logoutBtn.addEventListener('click', async () => {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Hide user info
    userInfo.classList.add('d-none');
    
    // Reload page
    window.location.reload();
  } catch (err) {
    console.error('Logout error:', err);
  }
});

// Add event listeners for filters
singleTimeFilter.addEventListener('change', loadSinglePlayerLeaderboard);
classTimeFilter.addEventListener('change', loadClassGamesLeaderboard);
overallTimeFilter.addEventListener('change', loadOverallLeaderboard);
sectionFilter.addEventListener('change', loadClassGamesLeaderboard);

// Initialize leaderboard
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Load sections for filter
  loadSections();
  
  // Load leaderboards
  loadSinglePlayerLeaderboard();
  loadClassGamesLeaderboard();
  loadOverallLeaderboard();
});
