/**
 * Supabase Configuration for Investment Odyssey
 *
 * This file initializes Supabase and exports the client.
 */

// Use the global Supabase client from the UMD bundle
// This assumes the Supabase UMD script is loaded in the HTML

// Import environment variables
import { supabaseUrl, supabaseKey } from './env.js';

// Create Supabase client using the global supabaseClient
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Export the client
export default supabase;
