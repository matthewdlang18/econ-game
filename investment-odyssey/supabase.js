// This is a local copy of the Supabase configuration for the Investment Odyssey game
// It's used when the game is accessed directly, not through the main application

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

// Make these available globally
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase client if it doesn't exist yet
if (!window.supabase) {
  console.log('Creating Supabase client from local config');
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper functions for database access
window.dbHelpers = {
  // Fetch user profile by name and passcode
  async fetchProfile(name, passcode) {
    const { data, error } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .eq('passcode', passcode)
      .maybeSingle();
    return { data, error };
  },
  
  // Fetch all sections with TA name joined from profiles
  async fetchSections() {
    const { data, error } = await window.supabase
      .from('sections')
      .select('*, profiles:ta_id(name)');
    return { data, error };
  },
  
  // Fetch all sections for a TA by custom_id
  async fetchTASections(taCustomId) {
    const { data, error } = await window.supabase
      .from('sections')
      .select('*')
      .eq('ta_id', taCustomId);
    return { data, error };
  },
  
  // Fetch all students in a section
  async fetchStudentsBySection(sectionId) {
    const { data, error } = await window.supabase
      .from('profiles')
      .select('id, name, custom_id')
      .eq('role', 'student')
      .eq('section_id', sectionId);
    return { data, error };
  }
};
