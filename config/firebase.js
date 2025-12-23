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
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CERT_URL
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
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            success: true,
            user: decodedToken
        };
    } catch (error) {
        console.error('❌ Error verifying token:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    initializeFirebase,
    verifyIdToken,
    admin
};
