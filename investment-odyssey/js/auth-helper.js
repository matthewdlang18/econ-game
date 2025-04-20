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
    // First try by ID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      return data;
    }

    // If not found, try by custom_id
    const { data: dataByCustomId, error: errorByCustomId } = await supabase
      .from('profiles')
      .select('*')
      .eq('custom_id', userId)
      .maybeSingle();

    if (dataByCustomId) {
      return dataByCustomId;
    }

    // If still not found, try to get user from auth and find by email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user && user.email) {
      const emailParts = user.email.split('@');
      const customId = emailParts[0];

      const { data: dataByEmail, error: errorByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('custom_id', customId)
        .maybeSingle();

      if (dataByEmail) {
        return dataByEmail;
      }
    }

    return null;
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }
}

// Create a guest profile
async function createGuestProfile() {
  try {
    // Generate a random guest name and email
    const guestName = 'Guest_' + Math.floor(Math.random() * 10000);
    const guestEmail = `guest_${Math.random().toString(36).substring(2, 10)}@example.com`;
    const guestPassword = 'guest123456'; // At least 6 characters

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
      return { success: false, error: authError };
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
      return { success: false, error };
    }

    return { success: true, profile };
  } catch (err) {
    console.error('Create guest profile error:', err);
    return { success: false, error: err };
  }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.authHelper = {
    isAuthenticated,
    getCurrentUser,
    getUserProfile,
    createGuestProfile
  };
}
