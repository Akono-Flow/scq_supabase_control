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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dXZ0Z2diZGhieW54Z3JmYWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDE0ODksImV4cCI6MjA4MTU3NzQ4OX0.XtL9tSdDX-pil97p-AZqAwXTmvpkM32w9voJnC16nAc';

// =====================================================
// Initialize Supabase Client
// =====================================================

// Check if credentials are set
if (SUPABASE_URL === 'https://twuvtggbdhbynxgrfabs.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dXZ0Z2diZGhieW54Z3JmYWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDE0ODksImV4cCI6MjA4MTU3NzQ4OX0.XtL9tSdDX-pil97p-AZqAwXTmvpkM32w9voJnC16nAc') {
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
