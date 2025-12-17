// =====================================================
// Supabase Configuration
// =====================================================
// IMPORTANT: Replace with your actual Supabase credentials
// Get these from: Supabase Dashboard → Settings → API Keys
// =====================================================

// Your Supabase Project URL
const SUPABASE_URL = 'https://twuvtggbdhbynxgrfabs.supabase.co';

// Your Supabase Anon/Public Key (Publishable Key)
const SUPABASE_ANON_KEY = 'sb_publishable_f1B8rSN3qp-oBEJ8hjeNRA_206IQshu';

// =====================================================
// Initialize Supabase Client
// =====================================================

// Check if credentials are set
if (SUPABASE_URL === 'YOUR_PROJECT_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE' || SUPABASE_ANON_KEY === 'PASTE_YOUR_PUBLISHABLE_KEY_HERE') {
    console.error('⚠️ SUPABASE CONFIGURATION ERROR ⚠️');
    console.error('Please update supabase-config.js with your actual credentials');
    console.error('Get them from: Supabase Dashboard → Settings → API Keys');
}

// Create Supabase client - use window.supabase to avoid conflicts
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    // Initialize the client and store it globally
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Also make it available as 'supabase' for convenience
    window.supabase = window.supabaseClient;
    
    // Test connection (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        testSupabaseConnection();
    }
    
    console.log('✅ Supabase client initialized');
} else {
    console.error('❌ Supabase library not loaded. Make sure the CDN script is included before this file.');
}

// Test connection function
async function testSupabaseConnection() {
    try {
        const { data, error } = await window.supabase.from('users').select('count');
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (err) {
        console.error('Supabase connection failed:', err);
        return false;
    }
}
