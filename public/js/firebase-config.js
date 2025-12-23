/**
 * Firebase Client SDK Configuration
 * Client-side Firebase configuration for Google authentication
 * 
 * IMPORTANT: Replace these values with your own Firebase project credentials
 * Get these from: Firebase Console > Project Settings > General > Your apps
 */

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBUO6u5MC2WFkAtU10RV0zaawfG7J858TI",
    authDomain: "habit-tracker-a72a1.firebaseapp.com",
    projectId: "habit-tracker-a72a1",
    storageBucket: "habit-tracker-a72a1.firebasestorage.app",
    messagingSenderId: "175957708756",
    appId: "1:175957708756:web:a2fbbf158890c6605cd041"
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
