// =====================================================
// Supabase Configuration
// =====================================================
// IMPORTANT: Replace with your actual Supabase credentials
// Get these from: Supabase Dashboard → Settings → API
// =====================================================

// Your Supabase Project URL
// Example: 'https://abcdefghijk.supabase.co'
const SUPABASE_URL = 'https://twuvtggbdhbynxgrfabs.supabase.co';

// Your Supabase Anon/Public Key
// Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const SUPABASE_ANON_KEY = 'sb_publishable_f1B8rSN3qp-oBEJ8hjeNRA_206IQshu';

// =====================================================
// Initialize Supabase Client
// =====================================================

// Check if credentials are set
if (SUPABASE_URL === 'YOUR_PROJECT_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
    console.error('⚠️ SUPABASE CONFIGURATION ERROR ⚠️');
    console.error('Please update supabase-config.js with your actual credentials');
    console.error('Get them from: Supabase Dashboard → Settings → API');
}

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count');
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

// Run connection test on load (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    testSupabaseConnection();
}

// Export for use in other files
window.supabaseClient = supabase;
