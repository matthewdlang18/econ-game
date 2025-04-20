/**
 * Investment Odyssey - Authentication Helper
 * Provides functions to help with authentication across pages
 */

// Check if user is authenticated
async function isAuthenticated() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && session;
  } catch (err) {
    console.error('Auth check error:', err);
    return false;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return error ? null : user;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

// Get user profile
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    return error ? null : data;
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.authHelper = {
    isAuthenticated,
    getCurrentUser,
    getUserProfile
  };
}
