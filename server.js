/**
 * Habit Tracker Server
 * Main Express server file with MongoDB integration
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import database configuration
const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Import routes
const habitRoutes = require('./routes/habits');
const authRoutes = require('./routes/auth');
const { requireAuth, redirectIfAuthenticated } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Firebase Admin (optional - only if Firebase env vars are set)
if (process.env.FIREBASE_PROJECT_ID) {
    initializeFirebase();
} else {
    console.log('⚠️  Firebase not configured - Google auth will not work');
    console.log('   Add Firebase credentials to .env file to enable Google authentication');
}

// ========== Middleware Configuration ==========

// Security headers for production
if (process.env.NODE_ENV === 'production') {
    // Trust proxy - required for secure cookies behind reverse proxy
    app.set('trust proxy', 1);
    
    // Security headers
    app.use((req, res, next) => {
        // Content Security Policy - Updated for Firebase Google Sign-In
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' https://www.gstatic.com https://apis.google.com; " +
            "style-src 'self' 'unsafe-inline' https://www.gstatic.com; " +
            "img-src 'self' data: https: https://lh3.googleusercontent.com; " +
            "font-src 'self' data: https://www.gstatic.com; " +
            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; " +
            "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com; " +
            "object-src 'none'; " +
            "base-uri 'self';"
        );
        
        // Other security headers
        res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to allow Firebase iframe
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.removeHeader('X-Powered-By');
        
        next();
    });
}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse incoming request bodies (JSON and URL-encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Allow PUT and DELETE methods in forms
app.use(methodOverride('_method'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with MongoDB store
// Using the existing mongoose connection instead of creating a new one
app.use(session({
    secret: process.env.SESSION_SECRET || 'habit-tracker-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        touchAfter: 24 * 3600 // Update session once per 24 hours unless changed
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax' // CSRF protection
    },
    name: 'sessionId' // Custom name (don't reveal tech stack)
}));

// ========== Routes ==========

// Authentication routes (public)
app.use('/auth', authRoutes);

// Login page
app.get('/login', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Signup page
app.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Firebase client config endpoint (public - needed for login page)
app.get('/config/firebase-client', (req, res) => {
    if (!process.env.FIREBASE_API_KEY || !process.env.FIREBASE_PROJECT_ID) {
        return res.status(503).json({
            success: false,
            message: 'Firebase not configured'
        });
    }
    
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    });
});

// Protected routes - require authentication
// Home route - renders the main habit tracker page
app.get('/', requireAuth, (req, res) => {
    res.render('index', { 
        title: 'Habit Tracker',
        currentYear: new Date().getFullYear(),
        userName: req.session.userName
    });
});

// Habit API routes (protected)
app.use('/api/habits', requireAuth, habitRoutes);

// ========== Error Handling ==========

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page Not Found',
        currentYear: new Date().getFullYear()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ========== Environment Validation ==========

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// ========== Start Server ==========

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Only start server if not running in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on ${isProduction ? 'production' : `http://localhost:${PORT}`}`);
        console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
        
        if (!isProduction) {
            console.log(`\n🌐 Open your browser and navigate to: http://localhost:${PORT}`);
        }
        
        // Production readiness check
        if (isProduction) {
            console.log('✅ Production mode: Security headers enabled');
            console.log('✅ Secure cookies enabled');
            console.log('✅ CSP headers enabled');
        } else {
            console.log('⚠️  Development mode: Some security features disabled');
        }
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    // Log stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
});

// Export for Vercel serverless
module.exports = app;
