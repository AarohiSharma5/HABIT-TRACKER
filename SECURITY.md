# Security Guide - Habit Tracker

## 🔒 Sensitive Files Protection

This document outlines all sensitive files and how they're protected from GitHub exposure.

### Files Currently Protected (in .gitignore)

#### 1. Environment Variables
```
.env                    ← Contains ALL server-side secrets
.env.local
.env.*.local
```

**What's in .env:**
- `MONGODB_URI` - Database connection string with password
- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK private key (CRITICAL)
- `FIREBASE_PRIVATE_KEY_ID` - Key identifier
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_CLIENT_ID` - Service account client ID
- `FIREBASE_CERT_URL` - Certificate URL
- `SESSION_SECRET` - Session encryption key

#### 2. Firebase Client Configuration
```
public/js/firebase-config.js    ← Contains Firebase client API key
```

**What's in firebase-config.js:**
- `apiKey` - Firebase Web API key (public but rate-limited)
- `authDomain` - Firebase authentication domain
- `projectId` - Project identifier
- `appId` - Firebase app identifier
- `measurementId` - Analytics measurement ID

**Note:** While Firebase client API keys are designed to be exposed (they work with domain restrictions), we still protect them to prevent abuse.

#### 3. Firebase Service Account Files
```
*.json                  ← All JSON files (excluding package files)
!package.json           ← Exception: package.json is tracked
!package-lock.json      ← Exception: package-lock.json is tracked
```

**These contain:**
- Private keys for Firebase Admin SDK
- Service account credentials
- OAuth 2.0 client secrets

#### 4. Documentation with Sensitive Data
```
GOOGLE_OAUTH_SETUP.md   ← Setup guide that may contain credentials
```

#### 5. Other Protected Files
```
node_modules/           ← Dependencies
logs/                   ← Application logs
*.log                   ← Log files
.DS_Store              ← macOS system files
.vscode/               ← Editor settings
.idea/                 ← IDE settings
dist/                  ← Build output
build/                 ← Build output
```

---

## ✅ Safe Files (Committed to GitHub)

### Template Files
- `.env.example` - Template showing required environment variables (no actual values)
- `public/js/firebase-config.example.js` - Template for Firebase configuration

### Application Code
- All `.js` files in `routes/`, `models/`, `config/`, `middleware/`
- All `.ejs` files in `views/`
- All `.css` files in `public/css/`
- `public/js/script.js` - Client-side logic (no secrets)
- `server.js` - Server entry point (reads from .env, doesn't hardcode secrets)
- `package.json` - Dependency list
- `README.md` - Project documentation

---

## 🚨 Security Best Practices

### Before Committing Code

1. **Check git status**
   ```bash
   git status
   ```

2. **Verify no sensitive files are staged**
   ```bash
   git diff --cached
   ```

3. **Search for exposed secrets**
   ```bash
   # Search for API keys
   grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git
   
   # Search for private keys
   grep -r "BEGIN PRIVATE KEY" . --exclude-dir=node_modules --exclude-dir=.git
   
   # Search for connection strings
   grep -r "mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git
   ```

4. **Use git diff before committing**
   ```bash
   git diff
   ```

### If You Accidentally Committed Secrets

1. **Remove the file from git history**
   ```bash
   git rm --cached <file-with-secrets>
   git commit -m "Remove sensitive file"
   ```

2. **If already pushed to GitHub**
   - Immediately regenerate ALL exposed credentials:
     - Generate new Firebase service account
     - Rotate MongoDB password
     - Create new session secret
     - Generate new Firebase API key (if possible)
   - Remove the file from git history using `git filter-branch` or `BFG Repo-Cleaner`
   - Force push the cleaned history

3. **Better approach: Use GitHub's secret scanning alerts**
   - GitHub will notify you if secrets are detected
   - Act immediately on any alerts

---

## 🔐 Environment Setup for New Developers

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HABIT\ TRACKER
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

4. **Get credentials from project admin:**
   - MongoDB URI
   - Firebase service account JSON
   - Session secret

5. **Update .env file** with actual credentials

6. **Copy Firebase client config template**
   ```bash
   cp public/js/firebase-config.example.js public/js/firebase-config.js
   ```

7. **Update firebase-config.js** with Firebase Console credentials

8. **Verify files are ignored**
   ```bash
   git status
   # Should NOT show .env or firebase-config.js
   ```

---

## 📋 Security Checklist

- [ ] `.env` file exists and is in `.gitignore`
- [ ] `firebase-config.js` exists and is in `.gitignore`
- [ ] No API keys in committed code
- [ ] No hardcoded passwords or secrets
- [ ] `.env.example` has placeholder values only
- [ ] `firebase-config.example.js` has placeholder values only
- [ ] Firebase service account JSON files are not tracked
- [ ] `git status` shows no sensitive files
- [ ] Rate limiting enabled on API endpoints
- [ ] CORS properly configured
- [ ] Session secret is strong and random

---

## 🔧 Additional Security Measures

### Already Implemented

1. **Rate Limiting** - Prevents brute force attacks
2. **CSRF Protection** - Prevents cross-site request forgery
3. **Session Management** - Secure cookie handling
4. **Token Verification** - Firebase tokens validated server-side
5. **Input Validation** - User input sanitized
6. **Password Hashing** - Bcrypt for password storage
7. **HTTPS Ready** - Works with HTTPS in production

### Recommended for Production

1. **Enable Firebase API Key Restrictions**
   - Go to Google Cloud Console → Credentials
   - Restrict API key to specific domains
   - Enable only necessary APIs

2. **MongoDB IP Whitelist**
   - Add only your server's IP address
   - Remove 0.0.0.0/0 (allow all) if present

3. **Environment Variables in Production**
   - Use hosting platform's secret management (Heroku Config Vars, Vercel Env Variables, etc.)
   - Never store .env in production servers

4. **Enable Two-Factor Authentication**
   - GitHub account
   - Google Cloud Console
   - MongoDB Atlas
   - Firebase Console

5. **Regular Security Audits**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 🆘 Emergency Response

### If Credentials Are Compromised

1. **Immediately revoke all credentials:**
   - Delete Firebase service account
   - Change MongoDB password
   - Regenerate session secret
   - Revoke OAuth client if needed

2. **Create new credentials:**
   - Generate new Firebase service account
   - Create new MongoDB user with new password
   - Update .env file

3. **Clean git history** (if pushed to GitHub)

4. **Force restart all servers** with new credentials

5. **Monitor for unusual activity:**
   - Check MongoDB Atlas activity logs
   - Check Firebase Console usage
   - Review server logs for suspicious requests

---

## ✅ Current Security Status

✅ All sensitive files are properly ignored  
✅ Template files created for new developers  
✅ Environment variables properly configured  
✅ Firebase credentials secured  
✅ MongoDB credentials secured  
✅ Rate limiting enabled  
✅ Session management secured  

---

**Last Updated:** December 24, 2025  
**Maintained By:** Development Team  
**Review Frequency:** Before every commit
