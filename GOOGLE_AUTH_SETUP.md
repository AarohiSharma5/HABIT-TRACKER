# Google Authentication Setup Guide

This guide will walk you through setting up Google authentication for your Habit Tracker app using Firebase.

---

## 📋 **Prerequisites**

- A Google account
- Node.js installed (you already have this)
- Your Habit Tracker project

---

## 🔥 **Step 1: Create a Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `habit-tracker` (or any name you prefer)
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**
6. Wait for project to be created, then click **"Continue"**

---

## 🌐 **Step 2: Register Your Web App**

1. In Firebase Console, click the **web icon** (`</>`) to add a web app
2. Register app nickname: `Habit Tracker Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. Copy the Firebase configuration object - you'll need this!
   
   It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456:web:abc123"
   };
   ```

6. Click **"Continue to console"**

---

## 🔑 **Step 3: Enable Google Authentication**

1. In Firebase Console, go to **"Authentication"** (left sidebar)
2. Click **"Get started"** if this is your first time
3. Go to **"Sign-in method"** tab
4. Click on **"Google"** provider
5. Click the **"Enable"** toggle
6. Select a **"Support email"** from dropdown (your email)
7. Click **"Save"**

---

## 🔐 **Step 4: Generate Service Account Key (for Backend)**

1. In Firebase Console, click the **gear icon** ⚙️ (Project settings)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the dialog
5. A JSON file will be downloaded - **KEEP THIS SECURE!**

---

## 📝 **Step 5: Update Firebase Client Configuration**

1. Open `/public/js/firebase-config.js` in your project
2. Replace the placeholder config with YOUR Firebase config from Step 2:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Save the file

---

## 🌍 **Step 6: Configure Environment Variables**

1. Open your `.env` file in the root project folder
2. Add these Firebase variables using the service account JSON from Step 4:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

**How to find these values in the service account JSON:**
- Open the downloaded JSON file
- Map the values:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n)
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `client_id` → `FIREBASE_CLIENT_ID`
  - `client_x509_cert_url` → `FIREBASE_CERT_URL`

3. Save the `.env` file

---

## 📦 **Step 7: Install Firebase Dependencies**

Run these commands in your terminal:

```bash
cd "/Users/aarohi_sharma/HABIT TRACKER"
npm install firebase firebase-admin --save
```

Wait for installation to complete.

---

## 🚀 **Step 8: Start Your Server**

```bash
npm start
```

Or if you want auto-restart on file changes:

```bash
npm run dev
```

You should see:
```
🔥 Firebase Admin initialized successfully
🚀 Server is running on http://localhost:3000
```

---

## ✅ **Step 9: Test Google Authentication**

1. Open your browser to `http://localhost:3000/login`
2. Click **"Sign in with Google"** button
3. Choose your Google account
4. You should be redirected to the habit tracker dashboard
5. Check if your name appears in the top right corner

---

## 🔒 **Security Notes**

1. **Never commit** your `.env` file or service account JSON to Git
2. The `.env` file should already be in `.gitignore`
3. Keep your Firebase private key secure
4. For production, use Firebase environment config or secret management

---

## 🐛 **Troubleshooting**

### Error: "Firebase not configured"
- Check that all environment variables are set in `.env`
- Make sure the private key has proper quotes and \n characters
- Restart the server after adding env variables

### Error: "Invalid Firebase token"
- Check that Firebase client config in `/public/js/firebase-config.js` is correct
- Make sure Google sign-in is enabled in Firebase Console

### Google sign-in popup doesn't appear
- Check browser console for errors
- Make sure Firebase SDKs are loading (check Network tab)
- Verify your domain is authorized in Firebase Console

### "This email is already registered"
- This means the email is already used with password login
- Users can't switch between auth methods for the same email
- Either login with password or use a different Google account

---

## 📊 **How It Works**

### Frontend Flow:
1. User clicks "Sign in with Google"
2. Firebase popup opens for Google account selection
3. User selects account and grants permission
4. Firebase returns ID token
5. Frontend sends token to backend `/auth/google`

### Backend Flow:
1. Receives ID token from frontend
2. Verifies token with Firebase Admin SDK
3. Extracts user info (email, name, photo)
4. Checks if user exists in MongoDB
5. Creates new user or logs in existing user
6. Sets session and returns success

### Data Security:
- All habit data is linked to user by `userId` field
- Each user can only see their own habits
- Sessions are stored in MongoDB
- Passwords are hashed with bcrypt
- Google auth doesn't store passwords

---

## 🎯 **Features Enabled**

✅ Sign up with Google (no password needed)  
✅ Sign in with Google  
✅ Profile photo from Google account  
✅ Automatic account creation  
✅ Secure session management  
✅ User-specific habit data  
✅ Traditional username/password still works  

---

## 📧 **Need Help?**

- Check Firebase Console logs
- Check browser console (F12)
- Check server logs in terminal
- Verify all config values are correct

---

**You're all set!** Users can now sign in with Google or create accounts the traditional way. All habits are stored securely per user. 🎉
