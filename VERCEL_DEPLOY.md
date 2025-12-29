# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Login to Vercel
```bash
vercel login
```
Choose GitHub authentication and authorize with your GitHub account (AarohiSharma5).

### 2. Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project? **N** (first time)
- Project name: **habit-tracker** (or press Enter)
- Directory: **./** (press Enter)
- Override settings? **N** (press Enter)

### 3. Add Environment Variables

After deployment, add your environment variables in Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Click your project → **Settings** → **Environment Variables**
3. Add these variables:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/habit-tracker?retryWrites=true&w=majority

SESSION_SECRET=<your-random-secret-key>

FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_PRIVATE_KEY_ID=<your-private-key-id>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<your-private-key-content>\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<your-service-account-email>

FIREBASE_API_KEY=<your-firebase-api-key>
FIREBASE_AUTH_DOMAIN=<your-project-id>.firebaseapp.com
FIREBASE_STORAGE_BUCKET=<your-project-id>.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
FIREBASE_APP_ID=<your-app-id>

NODE_ENV=production
```

**Important:** Make sure to select **Production** for each variable.

### 4. Redeploy After Adding Variables
```bash
vercel --prod
```

### 5. Update MongoDB Atlas Network Access

Add Vercel's IP addresses to MongoDB Atlas:
1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

---

## ⚠️ Important Notes

### Session Management
Vercel uses serverless functions which are stateless. This means:
- Sessions work but may not persist perfectly across requests
- For production use, consider these alternatives:
  - **Railway** (recommended for Express apps with sessions)
  - **Render** (better for stateful apps)
  - **Heroku**

### Firebase Domain Configuration
After deployment, update Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-app.vercel.app`

---

## 🔧 Common Issues

### Issue: "Error: Cannot find module..."
**Solution:** Make sure all dependencies are in `package.json` dependencies (not devDependencies)

### Issue: "MongoDB connection timeout"
**Solution:** Check MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Issue: "Session not persisting"
**Solution:** This is a Vercel serverless limitation. Consider Railway or Render instead.

---

## 📊 Monitoring

After deployment:
1. Check logs: `vercel logs`
2. View dashboard: https://vercel.com/dashboard
3. Custom domain: Settings → Domains

---

## 🚀 Alternative: Deploy to Railway (Recommended)

Railway is better for Express apps with sessions:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

Railway advantages:
- ✅ Better for stateful apps
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL/MongoDB
- ✅ WebSocket support
- ✅ Always-on containers (not serverless)

---

**Your app is configured for Vercel, but Railway is recommended for better session management!**
