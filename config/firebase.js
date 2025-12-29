/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase configuration for authentication
 */

const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            console.log('🔥 Firebase Admin already initialized');
            return admin;
        }

        // Initialize with service account
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID?.trim(),
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID?.trim(),
            private_key: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
            client_id: process.env.FIREBASE_CLIENT_ID?.trim(),
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CERT_URL?.trim()
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log('🔥 Firebase Admin initialized successfully');
        return admin;
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error.message);
        return null;
    }
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<object>} - Decoded token with user info
 */
async function verifyIdToken(idToken) {
    try {
        // Verify token with additional security checks
        const decodedToken = await admin.auth().verifyIdToken(idToken, true); // checkRevoked = true
        
        // Additional security validations
        const now = Math.floor(Date.now() / 1000);
        
        // Check if token is too old (issued more than 1 hour ago)
        if (decodedToken.auth_time && (now - decodedToken.auth_time) > 3600) {
            throw new Error('Token expired. Please sign in again.');
        }
        
        // Verify token issuer
        const expectedIssuer = `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`;
        if (decodedToken.iss !== expectedIssuer) {
            throw new Error('Invalid token issuer');
        }
        
        // Verify audience matches project ID
        if (decodedToken.aud !== process.env.FIREBASE_PROJECT_ID) {
            throw new Error('Invalid token audience');
        }
        
        // Return the decoded token directly
        return decodedToken;
    } catch (error) {
        console.error('❌ Error verifying token:', error.message);
        
        // Provide specific error messages
        if (error.code === 'auth/id-token-expired') {
            throw new Error('Token expired. Please sign in again.');
        } else if (error.code === 'auth/id-token-revoked') {
            throw new Error('Token has been revoked. Please sign in again.');
        } else if (error.code === 'auth/invalid-id-token') {
            throw new Error('Invalid authentication token');
        } else if (error.code === 'auth/user-disabled') {
            throw new Error('User account has been disabled');
        }
        
        throw error;
    }
}

module.exports = {
    initializeFirebase,
    verifyIdToken,
    admin
};
