# 🚀 Production Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ MongoDB database (local or MongoDB Atlas)
- ✅ Firebase project configured (for Google Auth)
- ✅ Domain name (optional, for custom domain)
- ✅ SSL certificate (required for production)

## Quick Start Deployment

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set all required values:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-generated-secret-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/habit-tracker
FIREBASE_API_KEY=your-firebase-api-key
# ... other Firebase credentials
```

**Generate a secure session secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install Dependencies

```bash
npm install --production
```

Or for development:

```bash
npm install
```

### 3. Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Or:
```bash
npm run prod
```

## Deployment Platforms

### Option 1: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy automatically

**Railway-specific settings:**
- Set `NODE_ENV=production`
- Railway auto-detects Node.js and runs `npm start`
- Add MongoDB plugin or use MongoDB Atlas

### Option 2: Deploy to Render

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables
6. Deploy

**Render-specific settings:**
```yaml
# render.yaml
services:
  - type: web
    name: habit-tracker
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: SESSION_SECRET
        generateValue: true
```

### Option 3: Deploy to Heroku

1. Install Heroku CLI
2. Login and create app:

```bash
heroku login
heroku create your-app-name
```

3. Add MongoDB add-on:

```bash
heroku addons:create mongolab:sandbox
```

4. Set environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set FIREBASE_API_KEY=your-key
# ... set other variables
```

5. Deploy:

```bash
git push heroku main
```

6. Open app:

```bash
heroku open
```

### Option 4: Deploy to DigitalOcean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create new App
3. Connect GitHub repository
4. Configure:
   - **HTTP Port:** 3000 (or from env)
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
5. Add environment variables
6. Deploy

### Option 5: Deploy to VPS (Ubuntu)

#### Setup Server

1. SSH into your server:
```bash
ssh user@your-server-ip
```

2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install MongoDB (or use Atlas):
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. Install PM2 (process manager):
```bash
sudo npm install -g pm2
```

#### Deploy Application

1. Clone repository:
```bash
cd /var/www
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install --production
```

3. Create .env file:
```bash
nano .env
# Paste your environment variables
```

4. Start with PM2:
```bash
pm2 start server.js --name habit-tracker
pm2 save
pm2 startup
```

5. Setup Nginx reverse proxy:
```bash
sudo nano /etc/nginx/sites-available/habit-tracker
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/habit-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. Setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Useful PM2 Commands

```bash
pm2 list                 # List all processes
pm2 logs habit-tracker   # View logs
pm2 restart habit-tracker # Restart app
pm2 stop habit-tracker   # Stop app
pm2 delete habit-tracker # Remove app
pm2 monit                # Monitor resources
```

## MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create new cluster (free M0 tier available)
3. Create database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

Example connection string:
```
mongodb+srv://username:password@cluster0.abcde.mongodb.net/habit-tracker?retryWrites=true&w=majority
```

## Firebase Configuration

### 1. Firebase Console Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create or select project
3. Go to **Project Settings** > **General**
4. Copy web app configuration values
5. Add these to your `.env` file

### 2. Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Add authorized domains:
   - `localhost` (for development)
   - Your production domain

### 3. Service Account (for Admin SDK)

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate new private key**
3. Save JSON file securely
4. Set path in `.env`: `FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/file.json`

⚠️ **Never commit service account JSON to version control!**

## Environment Variables Checklist

Required for production:

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (or your preferred port)
- [ ] `SESSION_SECRET=<strong-random-string>`
- [ ] `MONGODB_URI=<your-mongodb-connection-string>`

Required for Google Auth:

- [ ] `FIREBASE_API_KEY=<your-api-key>`
- [ ] `FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com`
- [ ] `FIREBASE_PROJECT_ID=<your-project-id>`
- [ ] `FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com`
- [ ] `FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>`
- [ ] `FIREBASE_APP_ID=<your-app-id>`
- [ ] `FIREBASE_SERVICE_ACCOUNT_PATH=<path-to-json>`

Optional (for email features):

- [ ] `EMAIL_SERVICE=gmail`
- [ ] `EMAIL_USER=<your-email>`
- [ ] `EMAIL_PASSWORD=<app-password>`

## Security Checklist

Before deploying to production:

- [ ] Set strong `SESSION_SECRET`
- [ ] Use HTTPS (SSL certificate)
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB connection string with authentication
- [ ] Add Firebase service account JSON to `.gitignore`
- [ ] Never commit `.env` file
- [ ] Whitelist MongoDB IPs
- [ ] Add authorized domains to Firebase
- [ ] Enable Firebase security rules
- [ ] Review CSP headers in server.js
- [ ] Keep dependencies updated (`npm audit`)

## Production Features Enabled

When `NODE_ENV=production`:

✅ **Security headers** (CSP, X-Frame-Options, etc.)  
✅ **Secure cookies** (httpOnly, secure, sameSite)  
✅ **Trust proxy** (for reverse proxy setups)  
✅ **HTTPS-only cookies**  
✅ **Production logging** (less verbose)  
✅ **Environment validation** (checks required vars)

## Monitoring & Maintenance

### Health Check Endpoint

Add to `server.js` (optional):

```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

### Logs

**View logs in production:**

PM2:
```bash
pm2 logs habit-tracker
```

Heroku:
```bash
heroku logs --tail
```

Railway/Render: Check dashboard logs

### Database Backups

**MongoDB Atlas:** Automatic backups enabled

**Self-hosted MongoDB:**
```bash
mongodump --uri="mongodb://localhost:27017/habit-tracker" --out=/backup/$(date +%Y%m%d)
```

### Updates

1. Pull latest code:
```bash
git pull origin main
```

2. Install dependencies:
```bash
npm install --production
```

3. Restart application:
```bash
pm2 restart habit-tracker
# or
npm start
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

- Check connection string format
- Verify username/password
- Check IP whitelist in MongoDB Atlas
- Ensure MongoDB service is running

### Firebase Auth Not Working

- Verify all Firebase env variables are set
- Check authorized domains in Firebase Console
- Ensure service account JSON is accessible
- Check Firebase Console logs

### Session Issues

- Clear browser cookies
- Verify `SESSION_SECRET` is set
- Check MongoDB connection (sessions stored there)
- Ensure cookies work over HTTPS in production

## Performance Optimization

### Enable Compression

Add to server.js:

```javascript
const compression = require('compression');
app.use(compression());
```

Install:
```bash
npm install compression
```

### Static Asset Caching

Already configured in `app.use(express.static(...))`

For better caching, add:
```javascript
app.use(express.static('public', {
    maxAge: '1y',
    etag: true
}));
```

### Database Indexing

Indexes already created in models. Monitor slow queries.

## Support

For issues or questions:
- Check logs first
- Review this deployment guide
- Check Firebase Console for auth issues
- Review MongoDB Atlas metrics
- Check environment variables

---

**Last Updated:** December 28, 2025  
**Status:** ✅ Production Ready
