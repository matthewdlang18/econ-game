// Supabase Configuration for Investment Odyssey
// This file contains the direct Supabase client initialization

// Supabase project URL and anon key (replace with your actual values)
const SUPABASE_URL = 'https://bvvkevmqnnlecghyraao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

// Initialize the Supabase client directly
if (typeof supabase !== 'undefined') {
    console.log('Initializing Supabase client directly from supabase-config.js');
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} else {
    console.error('Supabase library not loaded. Make sure to include the Supabase JS library before this script.');
}

// Test function to verify Supabase connection
async function testSupabaseConnection() {
    try {
        if (!window.supabase) {
            console.error('Supabase client not available');
            return false;
        }
        
        // Simple query to test connection
        const { data, error } = await window.supabase
            .from('leaderboard')
            .select('count(*)', { count: 'exact' })
            .limit(1);
            
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        
        console.log('Supabase connection successful!', data);
        return true;
    } catch (err) {
        console.error('Error testing Supabase connection:', err);
        return false;
    }
}

// Run connection test when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testSupabaseConnection, 1000); // Slight delay to ensure everything is loaded
});
