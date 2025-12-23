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

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse incoming request bodies (JSON and URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow PUT and DELETE methods in forms
app.use(methodOverride('_method'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'habit-tracker-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // Update session once per 24 hours unless changed
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
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

// ========== Start Server ==========

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n🌐 Open your browser and navigate to: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
});
