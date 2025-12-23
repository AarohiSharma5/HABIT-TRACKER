/**
 * Rate Limiting Middleware
 * Protects authentication endpoints from brute force attacks
 */

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5,
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    google: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxAttempts: 10,
        message: 'Too many Google sign-in attempts. Please try again in 5 minutes.'
    }
};

/**
 * Clean up expired entries (run periodically)
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000); // Clean every minute

/**
 * Rate limiter middleware factory
 * @param {string} type - Type of rate limit (auth, google)
 * @returns {Function} Express middleware
 */
function createRateLimiter(type = 'auth') {
    const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.auth;
    
    return (req, res, next) => {
        // Use IP address as identifier (in production, consider using user ID too)
        const identifier = req.ip || req.connection.remoteAddress;
        const key = `${type}:${identifier}`;
        const now = Date.now();
        
        // Get or create rate limit entry
        let limitData = rateLimitStore.get(key);
        
        if (!limitData || now > limitData.resetTime) {
            // Create new entry or reset expired one
            limitData = {
                attempts: 1,
                resetTime: now + config.windowMs
            };
            rateLimitStore.set(key, limitData);
            return next();
        }
        
        // Increment attempts
        limitData.attempts++;
        
        // Check if limit exceeded
        if (limitData.attempts > config.maxAttempts) {
            const timeLeft = Math.ceil((limitData.resetTime - now) / 60000);
            return res.status(429).json({
                success: false,
                message: config.message,
                retryAfter: timeLeft
            });
        }
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', config.maxAttempts);
        res.setHeader('X-RateLimit-Remaining', config.maxAttempts - limitData.attempts);
        res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());
        
        next();
    };
}

/**
 * Reset rate limit for a specific identifier (useful after successful auth)
 * @param {string} identifier - IP or user ID
 * @param {string} type - Type of rate limit
 */
function resetRateLimit(identifier, type = 'auth') {
    const key = `${type}:${identifier}`;
    rateLimitStore.delete(key);
}

module.exports = {
    authLimiter: createRateLimiter('auth'),
    googleAuthLimiter: createRateLimiter('google'),
    resetRateLimit
};
