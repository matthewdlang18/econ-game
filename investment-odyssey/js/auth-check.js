/**
 * Authentication Check Script for Investment Odyssey
 * 
 * This script checks if a user is already authenticated and updates the UI accordingly.
 * It also provides a global Auth object for other scripts to use.
 */

// Create the Auth object
window.Auth = {
    // Check if user is logged in
    isLoggedIn: function() {
        const userId = localStorage.getItem('student_id');
        const userName = localStorage.getItem('student_name');
        return !!(userId && userName);
    },

    // Check if user is a guest
    isGuest: function() {
        return localStorage.getItem('is_guest') === 'true';
    },

    // Get current user
    getCurrentUser: function() {
        const userId = localStorage.getItem('student_id');
        const userName = localStorage.getItem('student_name');
        const sectionId = localStorage.getItem('section_id');
        const sectionName = localStorage.getItem('section_name');

        if (!userId || !userName) {
            return null;
        }

        return {
            id: userId,
            name: userName,
            sectionId: sectionId,
            sectionName: sectionName
        };
    },

    // Set guest mode
    setGuestMode: function() {
        localStorage.setItem('is_guest', 'true');
        return true;
    },

    // Logout
    logout: function() {
        localStorage.removeItem('student_id');
        localStorage.removeItem('student_name');
        localStorage.removeItem('section_id');
        localStorage.removeItem('section_name');
        localStorage.removeItem('is_guest');
        return true;
    }
};

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const userInfoContainer = document.getElementById('user-info-container');
    const userNameDisplay = document.getElementById('user-name-display');
    const signOutBtn = document.getElementById('sign-out-btn');
    const signInLink = document.getElementById('sign-in-link');
    const guestLink = document.getElementById('guest-link');

    // Update user display based on authentication status
    function updateUserDisplay() {
        if (Auth.isLoggedIn()) {
            // User is logged in
            const user = Auth.getCurrentUser();
            
            if (userNameDisplay) {
                userNameDisplay.textContent = user.name;
            }
            
            if (userInfoContainer) {
                userInfoContainer.style.display = 'flex';
            }
            
            if (signInLink) {
                signInLink.style.display = 'none';
            }
            
            if (guestLink) {
                guestLink.style.display = 'none';
            }
        } else if (Auth.isGuest()) {
            // Guest user
            if (userNameDisplay) {
                userNameDisplay.textContent = 'Guest';
            }
            
            if (userInfoContainer) {
                userInfoContainer.style.display = 'flex';
            }
            
            if (signInLink) {
                signInLink.style.display = 'none';
            }
            
            if (guestLink) {
                guestLink.style.display = 'none';
            }
        } else {
            // Not logged in
            if (userInfoContainer) {
                userInfoContainer.style.display = 'none';
            }
            
            if (signInLink) {
                signInLink.style.display = 'inline-block';
            }
            
            if (guestLink) {
                guestLink.style.display = 'inline-block';
            }
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Handle sign out
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function() {
                Auth.logout();
                window.location.href = '../../index.html';
            });
        }

        // Handle guest access
        if (guestLink) {
            guestLink.addEventListener('click', function(e) {
                e.preventDefault();
                Auth.setGuestMode();
                window.location.reload();
            });
        }
    }

    // Initialize
    updateUserDisplay();
    setupEventListeners();
});
