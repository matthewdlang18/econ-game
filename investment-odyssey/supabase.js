// Initialize Supabase client
function initializeSupabase() {
    try {
        console.log('Initializing Supabase client from investment-odyssey/supabase.js');

        // Get Supabase URL and key from meta tags
        const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
        const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;

        // Check if URL and key are available
        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase URL or key not found in meta tags, using default values');

            // Default values (replace with your actual Supabase URL and anon key)
            const defaultUrl = 'https://bvvkevmqnnlecghyraao.supabase.co';
            const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmtldm1xbm5sZWNnaHlyYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDAzNDEsImV4cCI6MjA2MDQ3NjM0MX0.UY_H91jIbbZWq6A-l7XbdyF6s3rSoBVcJfawhZ2CyVg';

            // Initialize Supabase client with default values
            window.supabase = supabase.createClient(defaultUrl, defaultKey);
        } else {
            // Initialize Supabase client with values from meta tags
            window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        }

        console.log('Supabase client initialized successfully');

    } catch (error) {
        console.error('Error initializing Supabase client:', error);
    }
}

// Initialize Supabase when the script loads
if (typeof supabase !== 'undefined') {
    initializeSupabase();
} else {
    console.error('Supabase library not loaded');
}
