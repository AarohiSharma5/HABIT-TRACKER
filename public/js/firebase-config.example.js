/**
 * Firebase Client SDK Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to 'firebase-config.js' in the same directory
 * 2. Replace the placeholder values with your actual Firebase credentials
 * 3. Get these values from: Firebase Console > Project Settings > General > Your apps
 * 
 * IMPORTANT: 
 * - Never commit firebase-config.js to Git (it's in .gitignore)
 * - The firebase-config.js file contains your actual API keys
 * - This template is safe to commit as it only has placeholders
 */

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let app, auth, googleProvider;

try {
    // Initialize Firebase App
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication
    auth = firebase.auth();
    
    // Configure Google Auth Provider
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    console.log('🔥 Firebase initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
}

/**
 * Sign in with Google popup
 * @returns {Promise<object>} User credentials
 */
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();
        
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            },
            idToken
        };
    } catch (error) {
        console.error('❌ Google sign-in error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sign out from Firebase
 */
async function signOutFromFirebase() {
    try {
        await auth.signOut();
        console.log('✅ Signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current Firebase user
 */
function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}
