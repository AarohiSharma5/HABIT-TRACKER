# 📋 Pre-Deployment Checklist

## ✅ Essential Pre-Deployment Tasks

Use this checklist before deploying to production:

### 1. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Generate strong `SESSION_SECRET` (64+ characters random string)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI (MongoDB Atlas recommended)
- [ ] Add all Firebase credentials (if using Google Auth)
- [ ] Set correct `PORT` (if not using default 3000)

### 2. Security Review

- [ ] Strong session secret configured
- [ ] `.env` file in `.gitignore`
- [ ] Firebase service account JSON in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] HTTPS enabled for production domain
- [ ] MongoDB connection uses authentication
- [ ] Security headers enabled (check server.js)
- [ ] Cookies configured for production (secure, httpOnly, sameSite)

### 3. Firebase Setup (for Google Auth)

- [ ] Firebase project created
- [ ] Web app added to Firebase project
- [ ] Google Authentication enabled
- [ ] Production domain added to authorized domains
- [ ] Service account JSON downloaded and secured
- [ ] All Firebase env variables set in `.env`

### 4. MongoDB Setup

- [ ] MongoDB Atlas cluster created (or other production DB)
- [ ] Database user created with strong password
- [ ] Network access configured (IP whitelist or 0.0.0.0/0)
- [ ] Connection string tested
- [ ] Connection string added to `.env`

### 5. Code Quality

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] All dependencies installed: `npm install`
- [ ] Remove `console.log` from production code (optional)
- [ ] Test locally in production mode: `npm run prod`
- [ ] All features working locally

### 6. Testing

- [ ] Test user signup/login
- [ ] Test Google Sign-In
- [ ] Test habit creation/editing/deletion
- [ ] Test on mobile devices (responsive)
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Test error handling

### 7. Deployment Platform Setup

Choose one platform and complete setup:

#### Railway
- [ ] Account created
- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Deploy button clicked

#### Render
- [ ] Account created
- [ ] New web service created
- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Deploy triggered

#### Heroku
- [ ] Heroku CLI installed
- [ ] App created: `heroku create`
- [ ] Environment variables set: `heroku config:set`
- [ ] MongoDB add-on added (or Atlas URI set)
- [ ] Pushed to Heroku: `git push heroku main`

#### VPS (DigitalOcean, AWS, etc.)
- [ ] Server provisioned
- [ ] Node.js installed
- [ ] MongoDB installed or Atlas configured
- [ ] PM2 installed globally
- [ ] Application code deployed
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] PM2 started and saved

### 8. Post-Deployment Verification

- [ ] Application accessible via production URL
- [ ] HTTPS working (secure connection)
- [ ] Login page loads correctly
- [ ] Google Sign-In working
- [ ] User can create habits
- [ ] Session persists across page reloads
- [ ] Mobile view working
- [ ] No console errors in browser
- [ ] Server logs look healthy

### 9. Monitoring Setup

- [ ] Health check endpoint working
- [ ] Logs accessible and monitored
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring configured (optional)
- [ ] Database backup strategy in place

### 10. Documentation

- [ ] README.md updated with deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented (if applicable)
- [ ] Known issues documented
- [ ] Team members have access

## 🚨 Critical Production Settings

These MUST be configured for production:

```env
NODE_ENV=production
SESSION_SECRET=<strong-64-character-random-string>
MONGODB_URI=<production-mongodb-connection-string>
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔍 Quick Test Commands

**Test production mode locally:**
```bash
NODE_ENV=production npm start
```

**Check for security vulnerabilities:**
```bash
npm audit
npm audit fix
```

**Test MongoDB connection:**
```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e.message))"
```

## 📱 Mobile Testing

Test on multiple devices:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad/Android)
- [ ] Different screen sizes

## 🎯 Performance Checklist

- [ ] Static assets served efficiently
- [ ] Database queries optimized
- [ ] Session store configured (MongoDB)
- [ ] Compression enabled (optional)
- [ ] CDN configured (optional)

## 🔐 Security Final Check

Before going live:

1. **No secrets in code:**
```bash
git grep -E "(password|secret|api_key)" --ignore-case
```

2. **Check .gitignore:**
```bash
cat .gitignore | grep -E "(.env|firebase.*\.json)"
```

3. **Verify HTTPS:**
- Open production URL
- Check for 🔒 padlock icon
- Verify certificate is valid

4. **Test security headers:**
```bash
curl -I https://your-domain.com
# Look for X-Frame-Options, X-Content-Type-Options, etc.
```

## ✨ Optional Enhancements

After deployment, consider:

- [ ] Custom domain name
- [ ] Email notifications
- [ ] Analytics integration
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] CDN for static assets
- [ ] Database replica set
- [ ] Automated backups
- [ ] CI/CD pipeline

## 📞 Deployment Support

If you encounter issues:

1. **Check logs first:**
   - Platform dashboard logs
   - Server logs (`pm2 logs` if using PM2)
   
2. **Common issues:**
   - Missing environment variables
   - MongoDB connection failed
   - Firebase not configured
   - Port conflicts
   
3. **Resources:**
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
   - [GOOGLE_SIGNIN_FIX.md](GOOGLE_SIGNIN_FIX.md) - Google Auth troubleshooting
   - Platform-specific documentation

## 🎉 Ready to Deploy!

Once all checkboxes are complete, you're ready to deploy to production!

**Deploy command examples:**

```bash
# Railway (automatic on git push)
git push origin main

# Render (automatic on git push)
git push origin main

# Heroku
git push heroku main

# VPS with PM2
pm2 start server.js --name habit-tracker
pm2 save
```

---

**Last Updated:** December 28, 2025  
**Status:** Production Ready ✅
