/**
 * Security Middleware
 * Additional security checks for Firebase authentication
 */

/**
 * Validate Firebase token freshness
 * Ensures tokens are not too old
 */
function validateTokenFreshness(maxAgeMinutes = 60) {
    return (req, res, next) => {
        const decodedToken = req.firebaseUser;
        
        if (!decodedToken) {
            return next();
        }
        
        const tokenAge = Date.now() / 1000 - decodedToken.auth_time;
        const maxAgeSeconds = maxAgeMinutes * 60;
        
        if (tokenAge > maxAgeSeconds) {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please sign in again.',
                code: 'TOKEN_TOO_OLD'
            });
        }
        
        next();
    };
}

/**
 * Validate email verification (if required)
 * Ensures user has verified their email
 */
function requireEmailVerification(req, res, next) {
    const decodedToken = req.firebaseUser;
    
    if (!decodedToken) {
        return next();
    }
    
    if (!decodedToken.email_verified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required. Please verify your email.',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
    
    next();
}

/**
 * Restrict authentication to specific domains
 * Useful for enterprise apps
 */
function restrictDomains(allowedDomains = []) {
    return (req, res, next) => {
        const decodedToken = req.firebaseUser;
        
        if (!decodedToken || !decodedToken.email) {
            return next();
        }
        
        if (allowedDomains.length === 0) {
            return next();
        }
        
        const emailDomain = decodedToken.email.split('@')[1];
        
        if (!allowedDomains.includes(emailDomain)) {
            return res.status(403).json({
                success: false,
                message: `Access restricted to: ${allowedDomains.join(', ')}`,
                code: 'DOMAIN_NOT_ALLOWED'
            });
        }
        
        next();
    };
}

/**
 * Log suspicious authentication attempts
 */
function logSuspiciousActivity(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    // Log failed attempts (implement your logging solution)
    res.on('finish', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn('⚠️  Suspicious auth attempt:', {
                ip,
                userAgent,
                path: req.path,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    next();
}

/**
 * Validate request origin (CORS protection)
 */
function validateOrigin(allowedOrigins = []) {
    return (req, res, next) => {
        const origin = req.get('origin');
        
        // Skip if no origin (same-origin requests)
        if (!origin) {
            return next();
        }
        
        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return next();
        }
        
        // Check if origin is allowed
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return next();
        }
        
        return res.status(403).json({
            success: false,
            message: 'Origin not allowed',
            code: 'INVALID_ORIGIN'
        });
    };
}

/**
 * Prevent duplicate Google sign-ins (idempotency)
 */
const recentSignIns = new Map();
const DUPLICATE_WINDOW = 5000; // 5 seconds

function preventDuplicateSignIn(req, res, next) {
    const { idToken } = req.body;
    
    if (!idToken) {
        return next();
    }
    
    const now = Date.now();
    const existing = recentSignIns.get(idToken);
    
    if (existing && (now - existing) < DUPLICATE_WINDOW) {
        return res.status(429).json({
            success: false,
            message: 'Duplicate request detected. Please wait.',
            code: 'DUPLICATE_REQUEST'
        });
    }
    
    recentSignIns.set(idToken, now);
    
    // Clean up old entries
    setTimeout(() => recentSignIns.delete(idToken), DUPLICATE_WINDOW);
    
    next();
}

module.exports = {
    validateTokenFreshness,
    requireEmailVerification,
    restrictDomains,
    logSuspiciousActivity,
    validateOrigin,
    preventDuplicateSignIn
};
