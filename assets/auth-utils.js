// =====================================================
// Authentication Utilities
// =====================================================
// Device fingerprinting, session management, and auth helpers
// =====================================================

// =====================================================
// DEVICE FINGERPRINTING
// =====================================================

/**
 * Generate a device fingerprint based on browser/system properties
 * Not 100% unique but good enough for tracking and basic security
 */
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    
    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: hashString(canvasData),
        plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
        hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
    
    const fingerprintString = JSON.stringify(fingerprint);
    return hashString(fingerprintString);
}

/**
 * Simple hash function for fingerprint generation
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Get detailed device information
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    
    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    // Detect device type
    let deviceType = 'Desktop';
    if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';
    
    return {
        browser,
        os,
        deviceType,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

// =====================================================
// SESSION MANAGEMENT
// =====================================================

/**
 * Store session token in localStorage
 */
function storeSession(sessionToken, userId, userName, expiresAt) {
    const session = {
        token: sessionToken,
        userId: userId,
        userName: userName,
        expiresAt: expiresAt,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('edu_session', JSON.stringify(session));
}

/**
 * Get current session from localStorage
 */
function getSession() {
    const sessionStr = localStorage.getItem('edu_session');
    if (!sessionStr) return null;
    
    try {
        const session = JSON.parse(sessionStr);
        
        // Check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
            clearSession();
            return null;
        }
        
        return session;
    } catch (e) {
        clearSession();
        return null;
    }
}

/**
 * Clear session from localStorage
 */
function clearSession() {
    localStorage.removeItem('edu_session');
}

/**
 * Store admin session
 */
function storeAdminSession(adminId, username, fullName) {
    const session = {
        adminId: adminId,
        username: username,
        fullName: fullName,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('edu_admin_session', JSON.stringify(session));
}

/**
 * Get admin session
 */
function getAdminSession() {
    const sessionStr = localStorage.getItem('edu_admin_session');
    if (!sessionStr) return null;
    
    try {
        return JSON.parse(sessionStr);
    } catch (e) {
        clearAdminSession();
        return null;
    }
}

/**
 * Clear admin session
 */
function clearAdminSession() {
    localStorage.removeItem('edu_admin_session');
}

// =====================================================
// USER AUTHENTICATION
// =====================================================

/**
 * Validate access code and create session
 */
async function loginWithAccessCode(accessCode) {
    try {
        // Validate access code
        const { data, error } = await supabase.rpc('validate_access_code', {
            code: accessCode
        });
        
        if (error || !data || data.length === 0) {
            return {
                success: false,
                message: 'Invalid or inactive access code'
            };
        }
        
        const user = data[0];
        const fingerprint = generateDeviceFingerprint();
        const deviceInfo = getDeviceInfo();
        
        // Register/update device
        await supabase.rpc('upsert_device', {
            p_user_id: user.user_id,
            p_fingerprint: fingerprint,
            p_device_info: deviceInfo
        });
        
        // Create session
        const sessionResult = await supabase.rpc('create_session', {
            p_user_id: user.user_id,
            p_device_fingerprint: fingerprint,
            p_duration_hours: 24
        });
        
        if (sessionResult.error || !sessionResult.data || sessionResult.data.length === 0) {
            return {
                success: false,
                message: 'Failed to create session'
            };
        }
        
        const session = sessionResult.data[0];
        
        // Store session locally
        storeSession(
            session.session_token,
            user.user_id,
            user.full_name,
            session.expires_at
        );
        
        return {
            success: true,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email
            },
            session: session
        };
        
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'An error occurred during login'
        };
    }
}

/**
 * Validate current session
 */
async function validateCurrentSession() {
    const session = getSession();
    if (!session) return false;
    
    try {
        const { data, error } = await supabase.rpc('validate_session', {
            p_token: session.token
        });
        
        if (error || !data || data.length === 0) {
            clearSession();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Session validation error:', error);
        clearSession();
        return false;
    }
}

/**
 * Logout user
 */
function logout() {
    clearSession();
    window.location.href = 'user-login.html';
}

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

/**
 * Admin login
 */
async function adminLogin(username, password) {
    try {
        const { data, error } = await supabase.rpc('validate_admin_credentials', {
            uname: username,
            pass: password
        });
        
        if (error || !data || data.length === 0) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        const admin = data[0];
        
        // Update last login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.admin_id);
        
        // Store admin session
        storeAdminSession(admin.admin_id, admin.username, admin.full_name);
        
        return {
            success: true,
            admin: {
                id: admin.admin_id,
                username: admin.username,
                fullName: admin.full_name,
                email: admin.email
            }
        };
        
    } catch (error) {
        console.error('Admin login error:', error);
        return {
            success: false,
            message: 'An error occurred during login'
        };
    }
}

/**
 * Check if admin is logged in
 */
function isAdminLoggedIn() {
    return getAdminSession() !== null;
}

/**
 * Admin logout
 */
function adminLogout() {
    clearAdminSession();
    window.location.href = 'admin-auth.html';
}

// =====================================================
// ACCESS LOGGING
// =====================================================

/**
 * Log gallery access
 */
async function logGalleryAccess(galleryId, galleryName) {
    const session = getSession();
    if (!session) return;
    
    try {
        const fingerprint = generateDeviceFingerprint();
        const deviceInfo = getDeviceInfo();
        
        await supabase.rpc('log_access', {
            p_user_id: session.userId,
            p_gallery_id: galleryId,
            p_gallery_name: galleryName,
            p_device_fingerprint: fingerprint,
            p_device_info: deviceInfo,
            p_session_id: null // Can add session ID if tracking sessions
        });
        
    } catch (error) {
        console.error('Error logging access:', error);
    }
}

/**
 * Log app launch
 */
async function logAppLaunch(appUrl, appTitle, galleryId) {
    const session = getSession();
    if (!session) return;
    
    try {
        const fingerprint = generateDeviceFingerprint();
        
        await supabase
            .from('app_interactions')
            .insert({
                user_id: session.userId,
                app_url: appUrl,
                app_title: appTitle,
                gallery_id: galleryId,
                device_fingerprint: fingerprint
            });
        
    } catch (error) {
        console.error('Error logging app launch:', error);
    }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate random access code
 */
function generateAccessCode(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7) code += '-'; // Format: XXXX-XXXX-XXXX
    }
    return code;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    setTimeout(() => toast.remove(), 3000);
}
