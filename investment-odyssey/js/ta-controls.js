/**
 * Investment Odyssey - TA Controls
 * Handles TA dashboard and game management
 */

// DOM Elements
const taDashboard = document.getElementById('ta-dashboard');
const taAuthCheck = document.getElementById('ta-auth-check');
const sectionsList = document.getElementById('sections-list');
const noSectionsMessage = document.getElementById('no-sections-message');
const gameManagement = document.getElementById('game-management');
const activeGamePanel = document.getElementById('active-game-panel');
const gameHistoryTable = document.getElementById('game-history');
const nextRoundBtn = document.getElementById('next-round-btn');
const endGameBtn = document.getElementById('end-game-btn');
const marketData = document.getElementById('market-data');
const participantsList = document.getElementById('participants-list');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Current user profile and selected section
let currentProfile = null;
let selectedSection = null;
let activeGame = null;
let gameState = null;

// Check if user is logged in and is a TA
async function checkAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // No active session, show error
      taAuthCheck.innerHTML = `
        <p>You need to be logged in as a TA to access this page.</p>
        <a href="index.html" class="btn btn-primary">Go to Login</a>
      `;
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
      taAuthCheck.innerHTML = `
        <p>Error fetching your profile. Please try again.</p>
        <a href="index.html" class="btn btn-primary">Go to Login</a>
      `;
      return;
    }
    
    // Check if user is a TA
    if (profile.role !== 'ta') {
      taAuthCheck.innerHTML = `
        <p>You need to be a TA to access this page.</p>
        <a href="index.html" class="btn btn-primary">Go to Dashboard</a>
      `;
      return;
    }
    
    // User is a TA, show dashboard
    currentProfile = profile;
    taAuthCheck.classList.add('d-none');
    taDashboard.classList.remove('d-none');
    
    // Update user info
    userName.textContent = profile.name;
    userInfo.classList.remove('d-none');
    
    // Load TA sections
    loadTASections(profile.custom_id);
  } catch (err) {
    console.error('Auth check error:', err);
    taAuthCheck.innerHTML = `
      <p>An error occurred. Please try again.</p>
      <a href="index.html" class="btn btn-primary">Go to Login</a>
    `;
  }
}

// Load TA sections
async function loadTASections(taCustomId) {
  try {
    // Fetch sections for this TA
    const { data, error } = await fetchTASections(taCustomId);
    
    if (error) {
      console.error('Error fetching sections:', error);
      sectionsList.innerHTML = '<p class="text-danger">Error loading sections.</p>';
      return;
    }
    
    if (!data || data.length === 0) {
      // No sections assigned
      sectionsList.innerHTML = '';
      noSectionsMessage.classList.remove('d-none');
      return;
    }
    
    // Hide no sections message
    noSectionsMessage.classList.add('d-none');
    
    // Render sections
    sectionsList.innerHTML = data.map(section => `
      <div class="card section-card mb-2" data-section-id="${section.id}">
        <div class="card-body">
          <h5 class="card-title">${section.day} ${section.time}</h5>
          <p class="card-text">${section.location}</p>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to section cards
    document.querySelectorAll('.section-card').forEach(card => {
      card.addEventListener('click', () => {
        // Remove active class from all cards
        document.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));
        
        // Add active class to selected card
        card.classList.add('active');
        
        // Get section ID
        const sectionId = card.getAttribute('data-section-id');
        
        // Load section details
        loadSectionDetails(sectionId);
      });
    });
    
    // Select first section by default
    if (data.length > 0) {
      document.querySelector('.section-card').classList.add('active');
      loadSectionDetails(data[0].id);
    }
  } catch (err) {
    console.error('Error loading sections:', err);
    sectionsList.innerHTML = '<p class="text-danger">Error loading sections.</p>';
  }
}

// Load section details
async function loadSectionDetails(sectionId) {
  try {
    // Store selected section
    selectedSection = sectionId;
    
    // Fetch section details
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .maybeSingle();
    
    if (sectionError || !section) {
      console.error('Error fetching section:', sectionError);
      gameManagement.innerHTML = '<p class="text-danger">Error loading section details.</p>';
      return;
    }
    
    // Fetch students in section
    const { data: students, error: studentsError } = await fetchStudentsBySection(sectionId);
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError);
    }
    
    const studentCount = students ? students.length : 0;
    
    // Check for active game
    const { data: activeGames, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('section_id', sectionId)
      .eq('status', 'in_progress')
      .maybeSingle();
    
    if (gamesError) {
      console.error('Error fetching active games:', gamesError);
    }
    
    // Store active game
    activeGame = activeGames;
    
    // Show game management UI
    if (activeGames) {
      // Active game exists, show game controls
      gameManagement.innerHTML = `
        <div class="alert alert-info">
          <h5>Active Game</h5>
          <p>Round ${activeGames.current_round} of ${activeGames.max_rounds}</p>
          <p>Created: ${new Date(activeGames.created_at).toLocaleString()}</p>
        </div>
        <div class="d-grid">
          <button id="manage-game-btn" class="btn btn-primary">Manage Active Game</button>
        </div>
      `;
      
      // Add event listener to manage game button
      document.getElementById('manage-game-btn').addEventListener('click', () => {
        loadActiveGame(activeGames);
      });
    } else {
      // No active game, show create game button
      gameManagement.innerHTML = `
        <div class="alert alert-secondary">
          <h5>Section Information</h5>
          <p><strong>Day/Time:</strong> ${section.day} ${section.time}</p>
          <p><strong>Location:</strong> ${section.location}</p>
          <p><strong>Students:</strong> ${studentCount}</p>
        </div>
        <div class="d-grid">
          <button id="create-game-btn" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#create-game-modal">Create New Game</button>
        </div>
      `;
      
      // Update section select in create game modal
      const sectionSelect = document.getElementById('section-select');
      sectionSelect.innerHTML = `<option value="${section.id}">${section.day} ${section.time} (${section.location})</option>`;
    }
    
    // Load game history
    loadGameHistory(sectionId);
  } catch (err) {
    console.error('Error loading section details:', err);
    gameManagement.innerHTML = '<p class="text-danger">Error loading section details.</p>';
  }
}

// Load active game
async function loadActiveGame(game) {
  try {
    // Show active game panel
    activeGamePanel.classList.remove('d-none');
    
    // Update round display
    document.getElementById('current-round').textContent = game.current_round;
    document.getElementById('max-rounds').textContent = game.max_rounds;
    
    // Create game state
    gameState = new GameState(game.max_rounds);
    gameState.roundNumber = game.current_round;
    
    // Fetch current round data
    const { data: roundData, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('game_id', game.id)
      .eq('round_number', game.current_round)
      .maybeSingle();
    
    if (roundError) {
      console.error('Error fetching round data:', roundError);
    } else if (roundData) {
      // Update game state with round data
      gameState.assetPrices = roundData.asset_prices;
      gameState.priceHistory = roundData.price_history;
      gameState.cpi = roundData.cpi;
      gameState.cpiHistory = roundData.cpi_history;
      
      // Update market data display
      updateMarketDataDisplay();
    }
    
    // Load participants
    loadParticipants(game.id);
    
    // Add event listeners to game control buttons
    nextRoundBtn.onclick = () => advanceRound(game.id);
    endGameBtn.onclick = () => endGame(game.id);
  } catch (err) {
    console.error('Error loading active game:', err);
  }
}

// Update market data display
function updateMarketDataDisplay() {
  marketData.innerHTML = '';
  
  Object.keys(assetClasses).forEach(asset => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${assetClasses[asset].name}</td>
      <td>$${formatCurrency(gameState.assetPrices[asset])}</td>
      <td>-</td>
    `;
    
    marketData.appendChild(row);
  });
}

// Load participants
async function loadParticipants(gameId) {
  try {
    // Fetch player states for this game
    const { data, error } = await supabase
      .from('player_states')
      .select('*, profiles:user_id(name)')
      .eq('game_id', gameId)
      .order('portfolio_value', { ascending: false });
    
    if (error) {
      console.error('Error fetching participants:', error);
      participantsList.innerHTML = '<tr><td colspan="3">Error loading participants.</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      participantsList.innerHTML = '<tr><td colspan="3">No participants yet.</td></tr>';
      return;
    }
    
    // Render participants
    participantsList.innerHTML = data.map((player, index) => {
      const playerName = player.profiles ? player.profiles.name : 'Unknown';
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      
      return `
        <tr>
          <td class="${rankClass}">${index + 1}</td>
          <td>${playerName}</td>
          <td>$${formatCurrency(player.portfolio_value)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading participants:', err);
    participantsList.innerHTML = '<tr><td colspan="3">Error loading participants.</td></tr>';
  }
}

// Load game history
async function loadGameHistory(sectionId) {
  try {
    // Fetch games for this section
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching game history:', error);
      gameHistoryTable.innerHTML = '<tr><td colspan="6">Error loading game history.</td></tr>';
      return;
    }
    
    if (!data || data.length === 0) {
      gameHistoryTable.innerHTML = '<tr><td colspan="6">No games found.</td></tr>';
      return;
    }
    
    // Render game history
    gameHistoryTable.innerHTML = data.map(game => {
      const date = new Date(game.created_at).toLocaleDateString();
      const statusClass = game.status === 'in_progress' ? 'bg-in-progress' : (game.status === 'completed' ? 'bg-completed' : 'bg-cancelled');
      
      return `
        <tr>
          <td>${game.id.substring(0, 8)}...</td>
          <td>${game.section_id.substring(0, 8)}...</td>
          <td>${date}</td>
          <td><span class="badge ${statusClass}">${game.status}</span></td>
          <td id="participant-count-${game.id}">Loading...</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-results-btn" data-game-id="${game.id}" ${game.status !== 'completed' ? 'disabled' : ''}>
              View Results
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Add event listeners to view results buttons
    document.querySelectorAll('.view-results-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gameId = btn.getAttribute('data-game-id');
        viewGameResults(gameId);
      });
    });
    
    // Load participant counts
    data.forEach(game => {
      loadParticipantCount(game.id);
    });
  } catch (err) {
    console.error('Error loading game history:', err);
    gameHistoryTable.innerHTML = '<tr><td colspan="6">Error loading game history.</td></tr>';
  }
}

// Load participant count for a game
async function loadParticipantCount(gameId) {
  try {
    // Fetch count of player states for this game
    const { count, error } = await supabase
      .from('player_states')
      .select('id', { count: 'exact' })
      .eq('game_id', gameId);
    
    if (error) {
      console.error('Error fetching participant count:', error);
      document.getElementById(`participant-count-${gameId}`).textContent = 'Error';
      return;
    }
    
    // Update participant count
    document.getElementById(`participant-count-${gameId}`).textContent = count;
  } catch (err) {
    console.error('Error loading participant count:', err);
    document.getElementById(`participant-count-${gameId}`).textContent = 'Error';
  }
}

// View game results
async function viewGameResults(gameId) {
  try {
    // Fetch game details
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (gameError || !game) {
      console.error('Error fetching game:', gameError);
      return;
    }
    
    // Fetch player states for this game
    const { data: players, error: playersError } = await supabase
      .from('player_states')
      .select('*, profiles:user_id(name)')
      .eq('game_id', gameId)
      .order('portfolio_value', { ascending: false });
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
      return;
    }
    
    // Show game results modal
    const gameResultsContent = document.getElementById('game-results-content');
    
    // Format date
    const gameDate = new Date(game.created_at).toLocaleString();
    
    // Calculate statistics
    const avgPortfolioValue = players.reduce((sum, player) => sum + player.portfolio_value, 0) / players.length;
    const bestPortfolioValue = players.length > 0 ? players[0].portfolio_value : 0;
    const worstPortfolioValue = players.length > 0 ? players[players.length - 1].portfolio_value : 0;
    
    // Render game results
    gameResultsContent.innerHTML = `
      <div class="mb-4">
        <h5>Game Summary</h5>
        <p><strong>Date:</strong> ${gameDate}</p>
        <p><strong>Status:</strong> ${game.status}</p>
        <p><strong>Rounds:</strong> ${game.current_round} of ${game.max_rounds}</p>
        <p><strong>Participants:</strong> ${players.length}</p>
      </div>
      
      <div class="mb-4">
        <h5>Statistics</h5>
        <p><strong>Average Portfolio Value:</strong> $${formatCurrency(avgPortfolioValue)}</p>
        <p><strong>Best Portfolio Value:</strong> $${formatCurrency(bestPortfolioValue)}</p>
        <p><strong>Worst Portfolio Value:</strong> $${formatCurrency(worstPortfolioValue)}</p>
      </div>
      
      <div>
        <h5>Leaderboard</h5>
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Portfolio Value</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              ${players.map((player, index) => {
                const playerName = player.profiles ? player.profiles.name : 'Unknown';
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                const returnPercentage = ((player.portfolio_value / 10000) - 1) * 100;
                
                return `
                  <tr>
                    <td class="${rankClass}">${index + 1}</td>
                    <td>${playerName}</td>
                    <td>$${formatCurrency(player.portfolio_value)}</td>
                    <td>${formatPercentage(returnPercentage)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Show modal
    const gameResultsModal = new bootstrap.Modal(document.getElementById('game-results-modal'));
    gameResultsModal.show();
  } catch (err) {
    console.error('Error viewing game results:', err);
  }
}

// Create new game
async function createGame() {
  try {
    // Get form values
    const sectionId = document.getElementById('section-select').value;
    const maxRounds = parseInt(document.getElementById('rounds-input').value);
    
    if (!sectionId || isNaN(maxRounds) || maxRounds < 5 || maxRounds > 50) {
      alert('Please fill in all fields correctly.');
      return;
    }
    
    // Create game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        type: 'class_game',
        section_id: sectionId,
        creator_id: currentProfile.id,
        status: 'in_progress',
        current_round: 0,
        max_rounds: maxRounds,
        created_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();
    
    if (gameError) {
      console.error('Error creating game:', gameError);
      alert('Error creating game. Please try again.');
      return;
    }
    
    // Initialize game state
    const initialGameState = new GameState(maxRounds);
    
    // Create initial game round
    const { error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: game.id,
        round_number: 0,
        asset_prices: initialGameState.assetPrices,
        price_history: initialGameState.priceHistory,
        cpi: initialGameState.cpi,
        cpi_history: initialGameState.cpiHistory,
        created_at: new Date().toISOString()
      });
    
    if (roundError) {
      console.error('Error creating game round:', roundError);
      alert('Error initializing game. Please try again.');
      return;
    }
    
    // Hide modal
    const createGameModal = bootstrap.Modal.getInstance(document.getElementById('create-game-modal'));
    createGameModal.hide();
    
    // Reload section details
    loadSectionDetails(sectionId);
    
    // Show success message
    alert('Game created successfully!');
  } catch (err) {
    console.error('Error creating game:', err);
    alert('An error occurred. Please try again.');
  }
}

// Advance to next round
async function advanceRound(gameId) {
  try {
    // Confirm action
    if (!confirm('Are you sure you want to advance to the next round?')) {
      return;
    }
    
    // Get current game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (gameError || !game) {
      console.error('Error fetching game:', gameError);
      alert('Error fetching game. Please try again.');
      return;
    }
    
    // Check if game is already at max rounds
    if (game.current_round >= game.max_rounds) {
      alert('Game has already reached the maximum number of rounds.');
      return;
    }
    
    // Generate new prices
    const newRoundNumber = game.current_round + 1;
    gameState.roundNumber = newRoundNumber;
    const { prices, changes } = gameState.generateNewPrices();
    
    // Create new game round
    const { error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: newRoundNumber,
        asset_prices: gameState.assetPrices,
        price_history: gameState.priceHistory,
        cpi: gameState.cpi,
        cpi_history: gameState.cpiHistory,
        created_at: new Date().toISOString()
      });
    
    if (roundError) {
      console.error('Error creating game round:', roundError);
      alert('Error advancing round. Please try again.');
      return;
    }
    
    // Update game
    const { error: updateError } = await supabase
      .from('games')
      .update({
        current_round: newRoundNumber
      })
      .eq('id', gameId);
    
    if (updateError) {
      console.error('Error updating game:', updateError);
      alert('Error advancing round. Please try again.');
      return;
    }
    
    // Update UI
    document.getElementById('current-round').textContent = newRoundNumber;
    updateMarketDataDisplay();
    
    // Show success message
    alert(`Advanced to round ${newRoundNumber}`);
    
    // Check if game is now at max rounds
    if (newRoundNumber >= game.max_rounds) {
      alert('This was the final round. The game will now end.');
      endGame(gameId);
    }
  } catch (err) {
    console.error('Error advancing round:', err);
    alert('An error occurred. Please try again.');
  }
}

// End game
async function endGame(gameId) {
  try {
    // Confirm action
    if (!confirm('Are you sure you want to end the game? This cannot be undone.')) {
      return;
    }
    
    // Update game status
    const { error: updateError } = await supabase
      .from('games')
      .update({
        status: 'completed'
      })
      .eq('id', gameId);
    
    if (updateError) {
      console.error('Error ending game:', updateError);
      alert('Error ending game. Please try again.');
      return;
    }
    
    // Fetch player states for this game
    const { data: players, error: playersError } = await supabase
      .from('player_states')
      .select('*, profiles:user_id(name)')
      .eq('game_id', gameId);
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
    } else if (players && players.length > 0) {
      // Save to leaderboard
      const leaderboardEntries = players.map(player => ({
        user_id: player.user_id,
        user_name: player.profiles ? player.profiles.name : 'Unknown',
        game_id: gameId,
        game_type: 'class_game',
        game_mode: 'standard',
        final_portfolio: player.portfolio_value,
        ta_name: currentProfile.name,
        section_id: selectedSection,
        created_at: new Date().toISOString()
      }));
      
      // Insert leaderboard entries
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .insert(leaderboardEntries);
      
      if (leaderboardError) {
        console.error('Error saving to leaderboard:', leaderboardError);
      }
    }
    
    // Reload section details
    loadSectionDetails(selectedSection);
    
    // Hide active game panel
    activeGamePanel.classList.add('d-none');
    
    // Show success message
    alert('Game ended successfully!');
  } catch (err) {
    console.error('Error ending game:', err);
    alert('An error occurred. Please try again.');
  }
}

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

// Handle logout button click
logoutBtn.addEventListener('click', async () => {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Redirect to login
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
});

// Add event listener to create game button
document.getElementById('create-game-btn').addEventListener('click', createGame);

// Initialize TA controls page
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
});
