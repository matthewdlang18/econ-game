// Import Supabase configuration from root directory
// This file ensures that the Supabase client is properly initialized
// for the Investment Odyssey game

// Check if the root supabase.js file has been loaded
if (typeof initializeSupabase !== 'function') {
    console.warn('Root supabase.js not loaded, attempting to load it now');
    
    // Create a script element to load the root supabase.js file
    const script = document.createElement('script');
    script.src = '../../supabase.js';
    script.async = false;
    script.onload = function() {
        console.log('Root supabase.js loaded successfully');
        if (typeof initializeSupabase === 'function') {
            initializeSupabase();
        } else {
            console.error('initializeSupabase function not found in root supabase.js');
        }
    };
    script.onerror = function() {
        console.error('Failed to load root supabase.js');
    };
    
    // Append the script to the head
    document.head.appendChild(script);
} else {
    console.log('Root supabase.js already loaded');
    initializeSupabase();
}
