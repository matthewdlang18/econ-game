// Local Storage Scores for Investment Odyssey

// Save score to local storage
function saveScoreToLocalStorage(score) {
    try {
        // Get existing scores
        const scores = JSON.parse(localStorage.getItem('investment-odyssey-scores') || '[]');
        
        // Add new score
        scores.push(score);
        
        // Sort by score (descending)
        scores.sort((a, b) => b.finalPortfolio - a.finalPortfolio);
        
        // Save back to local storage
        localStorage.setItem('investment-odyssey-scores', JSON.stringify(scores));
        
        return true;
    } catch (error) {
        console.error('Error saving score to local storage:', error);
        return false;
    }
}

// Get scores from local storage
function getScoresFromLocalStorage() {
    try {
        // Get scores
        const scores = JSON.parse(localStorage.getItem('investment-odyssey-scores') || '[]');
        
        return scores;
    } catch (error) {
        console.error('Error getting scores from local storage:', error);
        return [];
    }
}

// Clear scores from local storage
function clearScoresFromLocalStorage() {
    try {
        localStorage.removeItem('investment-odyssey-scores');
        return true;
    } catch (error) {
        console.error('Error clearing scores from local storage:', error);
        return false;
    }
}

// Display leaderboard
function displayLeaderboard() {
    const leaderboardTable = document.getElementById('leaderboard-table-body');
    if (!leaderboardTable) return;
    
    // Clear table
    leaderboardTable.innerHTML = '';
    
    // Get scores
    const scores = getScoresFromLocalStorage();
    
    // Check if scores is empty
    if (scores.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center">
                <em>No scores yet</em>
            </td>
        `;
        leaderboardTable.appendChild(row);
        return;
    }
    
    // Add rows for each score
    scores.forEach((score, index) => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(score.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.studentName}${score.isGuest ? ' (Guest)' : ''}</td>
            <td>$${formatCurrency(score.finalPortfolio)}</td>
            <td>${formattedDate}</td>
        `;
        
        leaderboardTable.appendChild(row);
    });
}

// Initialize leaderboard
document.addEventListener('DOMContentLoaded', function() {
    // Display leaderboard if on leaderboard page
    if (document.getElementById('leaderboard-table-body')) {
        displayLeaderboard();
    }
    
    // Clear leaderboard button
    const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
    if (clearLeaderboardBtn) {
        clearLeaderboardBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the leaderboard? This cannot be undone.')) {
                clearScoresFromLocalStorage();
                displayLeaderboard();
            }
        });
    }
});
