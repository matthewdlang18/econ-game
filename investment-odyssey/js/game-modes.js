// Game Modes JavaScript for Investment Odyssey

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Load game statistics
    loadGameStatistics();
});

// Check authentication status
async function checkAuthStatus() {
    const studentId = localStorage.getItem('student_id');
    const studentName = localStorage.getItem('student_name');
    const isGuest = localStorage.getItem('is_guest') === 'true';
    
    const authAlert = document.getElementById('auth-alert');
    const sectionAlert = document.getElementById('section-alert');
    const classGameBtn = document.getElementById('class-game-btn');
    
    if (!studentId || !studentName || isGuest) {
        // User is not logged in or is a guest
        if (authAlert) {
            authAlert.classList.remove('d-none');
        }
        if (sectionAlert) {
            sectionAlert.classList.add('d-none');
        }
        
        // Disable class game button
        if (classGameBtn) {
            classGameBtn.classList.add('disabled');
            classGameBtn.setAttribute('aria-disabled', 'true');
            classGameBtn.href = '#';
            classGameBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('You need to sign in to join class games. Please sign in from the Games page.');
            });
        }
    } else {
        // User is logged in, check if they have a section
        if (authAlert) {
            authAlert.classList.add('d-none');
        }
        
        try {
            if (typeof window.Service !== 'undefined' && typeof window.Service.getStudent === 'function') {
                const result = await window.Service.getStudent(studentId);
                
                if (result.success) {
                    const student = result.data;
                    
                    if (!student.sectionId) {
                        // User doesn't have a section
                        if (sectionAlert) {
                            sectionAlert.classList.remove('d-none');
                        }
                        
                        // Disable class game button
                        if (classGameBtn) {
                            classGameBtn.classList.add('disabled');
                            classGameBtn.setAttribute('aria-disabled', 'true');
                            classGameBtn.href = '#';
                            classGameBtn.addEventListener('click', function(e) {
                                e.preventDefault();
                                alert('You need to select a TA section to join class games. Please select a section first.');
                            });
                        }
                    } else {
                        // User has a section, check if there's an active game
                        if (sectionAlert) {
                            sectionAlert.classList.add('d-none');
                        }
                        
                        // Check for active class game
                        if (typeof window.Service.getActiveClassGame === 'function') {
                            const gameResult = await window.Service.getActiveClassGame(student.sectionId);
                            
                            if (!gameResult.success || !gameResult.data) {
                                // No active game
                                if (classGameBtn) {
                                    classGameBtn.classList.add('disabled');
                                    classGameBtn.setAttribute('aria-disabled', 'true');
                                    classGameBtn.href = '#';
                                    classGameBtn.textContent = 'No Active Class Game';
                                    classGameBtn.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        alert('There is no active class game for your section at this time. Please check back later or ask your TA to start a game.');
                                    });
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking student section:', error);
        }
    }
}

// Load game statistics
function loadGameStatistics() {
    // These values are from the assetReturns object in game-core.js (S&P 500 asset)
    const avgReturnElement = document.getElementById('avg-return');
    const stdDevElement = document.getElementById('std-dev');
    const minReturnElement = document.getElementById('min-return');
    const maxReturnElement = document.getElementById('max-return');
    
    if (avgReturnElement) {
        avgReturnElement.textContent = '11.5%';
    }
    
    if (stdDevElement) {
        stdDevElement.textContent = '19.5%';
    }
    
    if (minReturnElement) {
        minReturnElement.textContent = '-43%';
    }
    
    if (maxReturnElement) {
        maxReturnElement.textContent = '50%';
    }
    
    // If the assetReturns object is available, use its values
    if (typeof window.assetReturns !== 'undefined' && window.assetReturns['S&P 500']) {
        const sp500 = window.assetReturns['S&P 500'];
        
        if (avgReturnElement) {
            avgReturnElement.textContent = `${(sp500.mean * 100).toFixed(1)}%`;
        }
        
        if (stdDevElement) {
            stdDevElement.textContent = `${(sp500.stdDev * 100).toFixed(1)}%`;
        }
        
        if (minReturnElement) {
            minReturnElement.textContent = `${(sp500.min * 100).toFixed(0)}%`;
        }
        
        if (maxReturnElement) {
            maxReturnElement.textContent = `${(sp500.max * 100).toFixed(0)}%`;
        }
    }
}
