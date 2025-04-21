/**
 * Header Authentication Script for Investment Odyssey
 * 
 * This script handles displaying the user's name and sign-out functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const userInfoContainer = document.getElementById('user-info-container');
    const userNameDisplay = document.getElementById('user-name-display');
    const signOutBtn = document.getElementById('sign-out-btn');
    const signInLink = document.getElementById('sign-in-link');
    const guestLink = document.getElementById('guest-link');

    // Wait for Service to be initialized
    const initHeaderAuth = () => {
        // Check if Service is available
        if (typeof window.Service !== 'undefined') {
            console.log('Service is available, using Service system');
            updateUserDisplay();
            setupEventListeners();
        } else {
            console.log('Service not available, using localStorage directly');
            // Fallback to direct localStorage access
            updateUserDisplayFallback();
            setupEventListenersFallback();
        }
    };

    // Update user display using Service
    function updateUserDisplay() {
        const user = window.Service.getCurrentUser();
        const isGuest = window.Service.isGuest();

        if (user && !isGuest) {
            // User is logged in
            if (userInfoContainer) userInfoContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = user.name;
            if (signInLink) signInLink.style.display = 'none';
            if (guestLink) guestLink.style.display = 'none';
        } else if (isGuest) {
            // User is in guest mode
            if (userInfoContainer) userInfoContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = 'Guest';
            if (signInLink) signInLink.style.display = 'none';
            if (guestLink) guestLink.style.display = 'none';
        } else {
            // No user logged in
            if (userInfoContainer) userInfoContainer.style.display = 'none';
            if (signInLink) signInLink.style.display = 'inline-block';
            if (guestLink) guestLink.style.display = 'inline-block';
        }
    }

    // Update user display using localStorage directly
    function updateUserDisplayFallback() {
        const userId = localStorage.getItem('investment_odyssey_user_id');
        const userName = localStorage.getItem('investment_odyssey_user_name');
        const isGuest = localStorage.getItem('investment_odyssey_guest_mode') === 'true';

        if (userId && userName && !isGuest) {
            // User is logged in
            if (userInfoContainer) userInfoContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = userName;
            if (signInLink) signInLink.style.display = 'none';
            if (guestLink) guestLink.style.display = 'none';
        } else if (isGuest) {
            // User is in guest mode
            if (userInfoContainer) userInfoContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = 'Guest';
            if (signInLink) signInLink.style.display = 'none';
            if (guestLink) guestLink.style.display = 'none';
        } else {
            // No user logged in
            if (userInfoContainer) userInfoContainer.style.display = 'none';
            if (signInLink) signInLink.style.display = 'inline-block';
            if (guestLink) guestLink.style.display = 'inline-block';
        }
    }

    // Set up event listeners using Service
    function setupEventListeners() {
        // Handle sign out
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function() {
                // Clear session
                window.Service.clearSession();

                // Redirect to home page
                window.location.href = '../index.html';
            });
        }

        // Handle guest access
        if (guestLink) {
            guestLink.addEventListener('click', function(e) {
                e.preventDefault();

                // Set guest mode
                window.Service.setGuestMode();

                // If we're on the game page, reload to update UI
                if (window.location.pathname.includes('index.html') ||
                    window.location.pathname.includes('class-game.html') ||
                    window.location.pathname.includes('leaderboard.html') ||
                    window.location.pathname.includes('about.html')) {
                    window.location.reload();
                } else {
                    // Otherwise redirect to the game page
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // Fallback event listeners using localStorage directly
    function setupEventListenersFallback() {
        // Handle sign out
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function() {
                // Clear user data from localStorage
                localStorage.removeItem('investment_odyssey_user_id');
                localStorage.removeItem('investment_odyssey_user_name');
                localStorage.removeItem('investment_odyssey_user_role');
                localStorage.removeItem('investment_odyssey_user_section');
                localStorage.removeItem('investment_odyssey_guest_mode');

                // Redirect to home page
                window.location.href = '../index.html';
            });
        }

        // Handle guest access
        if (guestLink) {
            guestLink.addEventListener('click', function(e) {
                e.preventDefault();

                // Store guest status in localStorage
                localStorage.setItem('investment_odyssey_guest_mode', 'true');
                localStorage.setItem('investment_odyssey_user_id', 'guest_' + Date.now());
                localStorage.setItem('investment_odyssey_user_name', 'Guest');
                localStorage.setItem('investment_odyssey_user_role', 'guest');

                // If we're on the game page, reload to update UI
                if (window.location.pathname.includes('index.html') ||
                    window.location.pathname.includes('class-game.html') ||
                    window.location.pathname.includes('leaderboard.html') ||
                    window.location.pathname.includes('about.html')) {
                    window.location.reload();
                } else {
                    // Otherwise redirect to the game page
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // Check if Service is already available
    if (typeof window.Service !== 'undefined') {
        initHeaderAuth();
    } else {
        // Wait for Service to be available
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = setInterval(function() {
            attempts++;
            if (typeof window.Service !== 'undefined') {
                clearInterval(checkInterval);
                initHeaderAuth();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.log('Service not available after maximum attempts, using fallback');
                updateUserDisplayFallback();
                setupEventListenersFallback();
            }
        }, 200);
    }
});
