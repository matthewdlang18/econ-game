// This is a local copy of the Supabase configuration for the Investment Odyssey game
// It's used when the game is accessed directly, not through the main application

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

// Make these available globally
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase client
console.log('Creating Supabase client from local config');

// Ensure the supabase object exists
if (typeof supabase === 'undefined') {
  console.error('Supabase library not loaded properly');

  // Create a dummy client to prevent errors
  window.supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          }),
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      })
    })
  };
} else {
  // Create the real client
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Create a local supabaseClient variable for use in this file
const supabaseClient = window.supabase;

// Helper functions for database access
window.dbHelpers = {
  // Fetch user profile by name and passcode
  async fetchProfile(name, passcode) {
    try {
      console.log('dbHelpers.fetchProfile called with:', name);

      if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        console.error('Supabase client not properly initialized');
        return { data: null, error: { message: 'Database connection not available' } };
      }

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('name', name)
        .eq('passcode', passcode)
        .maybeSingle();

      console.log('Profile fetch result:', data ? 'Found' : 'Not found');
      return { data, error };
    } catch (error) {
      console.error('Error in dbHelpers.fetchProfile:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Fetch all sections with TA name joined from profiles
  async fetchSections() {
    try {
      if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        return { data: [], error: { message: 'Database connection not available' } };
      }

      const { data, error } = await supabaseClient
        .from('sections')
        .select('*, profiles:ta_id(name)');

      return { data: data || [], error };
    } catch (error) {
      console.error('Error in dbHelpers.fetchSections:', error);
      return { data: [], error: { message: error.message } };
    }
  },

  // Fetch all sections for a TA by custom_id
  async fetchTASections(taCustomId) {
    try {
      if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        return { data: [], error: { message: 'Database connection not available' } };
      }

      const { data, error } = await supabaseClient
        .from('sections')
        .select('*')
        .eq('ta_id', taCustomId);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error in dbHelpers.fetchTASections:', error);
      return { data: [], error: { message: error.message } };
    }
  },

  // Fetch all students in a section
  async fetchStudentsBySection(sectionId) {
    try {
      if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        return { data: [], error: { message: 'Database connection not available' } };
      }

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, name, custom_id')
        .eq('role', 'student')
        .eq('section_id', sectionId);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error in dbHelpers.fetchStudentsBySection:', error);
      return { data: [], error: { message: error.message } };
    }
  }
};

// Create a dummy user for testing if needed
window.createDummyUser = function() {
  return {
    id: 'dummy-id',
    name: 'Test User',
    role: 'student',
    section_id: null,
    custom_id: 'test-user',
    passcode: '12345'
  };
};
