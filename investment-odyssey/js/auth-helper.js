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
    // Generate a random guest name
    const guestName = 'Guest_' + Math.floor(Math.random() * 10000);

    // Create a guest profile without auth
    const customId = crypto.randomUUID();

    // First, check what roles are allowed in the profiles table
    const { data: roleInfo, error: roleError } = await supabase
      .rpc('get_allowed_roles');

    // Default to 'student' if we can't get the allowed roles
    let guestRole = 'student';

    if (!roleError && roleInfo && roleInfo.length > 0) {
      // Use the first allowed role that's appropriate for guests
      if (roleInfo.includes('guest')) {
        guestRole = 'guest';
      } else if (roleInfo.includes('student')) {
        guestRole = 'student';
      }
    }

    console.log('Using role for guest:', guestRole);

    // Use a passcode that meets the minimum length requirement (6 characters)
    const guestPasscode = 'guest123';

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        name: guestName,
        custom_id: customId,
        role: guestRole,
        passcode: guestPasscode,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Guest profile creation error:', error);
      return { success: false, error };
    }

    // Now create an auth user for this profile
    const email = `${customId}@example.com`;

    // Try to create an auth user
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: guestPasscode,
        options: {
          data: {
            name: guestName,
            role: guestRole
          }
        }
      });

      if (authError) {
        console.log('Note: Could not create auth user for guest, but profile was created:', authError);
      } else {
        console.log('Auth user created for guest profile');
      }
    } catch (authErr) {
      console.log('Auth creation error (non-critical):', authErr);
    }

    return { success: true, profile };
  } catch (err) {
    console.error('Create guest profile error:', err);
    return { success: false, error: err };
  }
}

// Check if user is logged in on main page
async function checkMainPageAuth() {
  try {
    // Try to get the session from localStorage
    const localStorageData = localStorage.getItem('supabase.auth.token');
    if (localStorageData) {
      console.log('Found auth token in localStorage');
      return true;
    }

    // If not in localStorage, check for cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('supabase-auth-token=')) {
        console.log('Found auth token in cookies');
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('Error checking main page auth:', err);
    return false;
  }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.authHelper = {
    isAuthenticated,
    getCurrentUser,
    getUserProfile,
    createGuestProfile,
    checkMainPageAuth
  };
}
