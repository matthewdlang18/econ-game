// Supabase initialization for Investment Odyssey

// Initialize Supabase client if the library is available
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Check if Supabase is already initialized
        if (typeof window.supabase !== 'undefined') {
            console.log('Supabase client already initialized');
            return;
        }

        // Check if Supabase library is available
        if (typeof supabase === 'undefined') {
            console.warn('Supabase library not available');
            return;
        }

        // Get Supabase URL and key from meta tags
        const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
        const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase URL or key not found in meta tags');
            return;
        }

        // Initialize Supabase client
        window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized successfully');

        // Check if user is already authenticated
        window.supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('User is authenticated:', session.user.id);
            } else {
                console.log('User is not authenticated');
            }
        }).catch(error => {
            console.error('Error checking authentication status:', error);
        });
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
    }
});
