/**
 * Authentication Middleware
 * Protect routes that require authentication
 */

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated
        return next();
    } else {
        // User is not authenticated
        if (req.path.startsWith('/api/')) {
            // For API requests, return JSON
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                redirect: '/login'
            });
        } else {
            // For page requests, redirect to login
            return res.redirect('/login');
        }
    }
}

function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User is already logged in, redirect to home
        return res.redirect('/');
    }
    next();
}

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};
