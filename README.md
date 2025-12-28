# Habit Tracker - Full Stack Web Application

A modern, production-ready full-stack habit tracker application with Google Authentication, built with Node.js, Express, MongoDB, Firebase Auth, and EJS.

## 🌟 Features

### Core Features
- ✅ **Add and track daily habits** with customizable frequencies
- 🔥 **View and maintain habit streaks** with visual indicators
- 📊 **Analytics and progress tracking** with charts
- 🗓️ **Weekly progress view** with calendar visualization
- ⏭️ **Skip days feature** for flexible tracking
- 🏆 **Achievement system** with unlockable badges
- 📱 **Fully responsive design** - works on mobile, tablet, and desktop

### Authentication & Security
- 🔐 **Google Sign-In** with Firebase Authentication
- 👤 **User ID/Password authentication** as alternative
- 🔒 **Secure sessions** with MongoDB store
- 🛡️ **Production-ready security headers** (CSP, XSS protection)
- 🍪 **Secure cookies** (httpOnly, sameSite, secure in production)

### Technical Features
- 💾 **Persistent data storage** in MongoDB
- 🚀 **RESTful API architecture**
- 🎨 **Clean, modern UI** with gradient design
- ⚡ **Client-side state management**
- 📦 **MVC architecture** for maintainability

## 🛠️ Technologies Used

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Firebase Admin SDK** - Server-side authentication
- **Express Session** - Session management with MongoDB store
- **bcryptjs** - Password hashing

### Frontend
- **EJS** - Server-side templating
- **Firebase Client SDK** - Google Sign-In
- **HTML5/CSS3** - Modern responsive design
- **JavaScript (ES6+)** - Client-side functionality
- **Chart.js** - Data visualization

### Security & DevOps
- **Content Security Policy** (CSP) - XSS protection
- **Helmet-style headers** - Security best practices
- **dotenv** - Environment variable management
- **PM2 ready** - Production process management

## 📁 Project Structure

```
HABIT TRACKER/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── firebase.js          # Firebase Admin SDK config
│   └── email.js             # Email configuration (optional)
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── habitController.js   # Habit CRUD operations
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── security.js          # Security middleware
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── User.js              # User model
│   └── Habit.js             # Habit model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── habits.js            # Habit API routes
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Reusable header
│   │   └── footer.ejs       # Reusable footer
│   ├── index.ejs            # Main application
│   ├── login.html           # Login page
│   ├── signup.html          # Signup page
│   └── 404.ejs              # Error page
├── public/
│   ├── css/
│   │   └── styles.css       # Application styles
│   └── js/
│       ├── script.js        # Main application logic
│       ├── firebase-config.js    # Firebase client config
│       ├── auth.js          # Login page handler
│       └── auth-signup.js   # Signup page handler
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry
├── Procfile                 # Heroku deployment
├── render.yaml              # Render deployment
├── railway.json             # Railway deployment
├── DEPLOYMENT.md            # Comprehensive deployment guide
└── PRE_DEPLOYMENT_CHECKLIST.md  # Pre-flight checklist
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local installation or MongoDB Atlas account)
- **Firebase project** (for Google Authentication)
- **Git** (optional, for cloning)

### Installation

1. **Clone or download the repository**
   ```bash
   cd "HABIT TRACKER"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   SESSION_SECRET=your-secret-key-here
   MONGODB_URI=mongodb://localhost:27017/habit-tracker
   
   # Firebase Configuration (for Google Auth)
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   # ... other Firebase credentials
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new user account |
| POST | `/auth/login` | Login with User ID/Password |
| POST | `/auth/google` | Authenticate with Google |
| GET | `/auth/logout` | Logout user |

### Habits (Protected Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all user's habits |
| GET | `/api/habits/:id` | Get single habit |
| POST | `/api/habits` | Create new habit |
| POST | `/api/habits/:id/complete` | Mark habit complete |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/skip` | Skip habit for today |
| POST | `/api/habits/:id/reset-streak` | Reset streak |

## 🗄️ Database Schemas

### User Model
```javascript
{
  userId: String (unique),
  name: String,
  email: String,
  password: String (hashed),
  googleId: String,
  photoURL: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Habit Model
```javascript
{
  userId: String (indexed),
  name: String,
  description: String,
  category: String,
  frequency: String,
  streak: Number,
  skipDays: [String],
  completionHistory: [{
    date: Date,
    completed: Boolean,
    status: String
  }],
  achievements: [String],
  isActive: Boolean
}
```

## 🔐 Security Features

- **CSP Headers** - Prevents XSS attacks
- **Secure Cookies** - httpOnly, secure (in production), sameSite
- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - Secure MongoDB-backed sessions
- **Firebase Authentication** - Industry-standard OAuth 2.0
- **Input Validation** - Sanitized user inputs
- **Rate Limiting** - Prevents abuse (optional middleware)

## 📱 Responsive Design

Works perfectly on:
- 📱 **Mobile phones** (320px - 480px)
- 📱 **Tablets** (481px - 768px)
- 💻 **Laptops** (769px - 1024px)
- 🖥️ **Desktops** (1025px+)

Features:
- Touch-friendly buttons (48px+ tap targets)
- Optimized font sizes for readability
- Prevents iOS zoom on input focus
- Responsive navigation and layouts

## 🚀 Production Deployment

### Quick Deploy (Choose One)

**Railway:**
```bash
# Push to GitHub, connect in Railway dashboard
git push origin main
```

**Render:**
```bash
# Connect GitHub repo in Render dashboard
# Uses render.yaml for configuration
```

**Heroku:**
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide**

### Environment Requirements

**Required:**
- `NODE_ENV=production`
- `SESSION_SECRET` (64+ character random string)
- `MONGODB_URI` (MongoDB Atlas or production database)

**For Google Auth:**
- All Firebase environment variables
- Firebase service account JSON

### Pre-Deployment Checklist

See [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) for complete checklist

Key items:
- [ ] Strong SESSION_SECRET set
- [ ] Production MongoDB configured
- [ ] Firebase credentials added
- [ ] HTTPS enabled
- [ ] Security headers verified

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run prod` | Start in production mode locally |
| `npm audit` | Check for security vulnerabilities |

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options.

**Critical variables:**
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<64-char-random-string>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

**Generate secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication
3. Add authorized domains
4. Download service account JSON
5. Add credentials to `.env`

See [GOOGLE_SIGNIN_FIX.md](GOOGLE_SIGNIN_FIX.md) for detailed setup.

## 🐛 Troubleshooting

### Google Sign-In Issues
- Check all Firebase env variables are set
- Verify authorized domains in Firebase Console
- Ensure popup isn't blocked by browser
- Check browser console for errors

### MongoDB Connection Failed
- Verify connection string format
- Check MongoDB Atlas IP whitelist
- Ensure MongoDB service is running
- Test connection with MongoDB Compass

### Session Problems
- Clear browser cookies
- Verify SESSION_SECRET is set
- Check MongoDB connection (sessions stored there)

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting.

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-flight checklist
- **[GOOGLE_SIGNIN_FIX.md](GOOGLE_SIGNIN_FIX.md)** - Google Auth implementation details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Feature overview

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License - see LICENSE file

## 👤 Author

**Aarohi Sharma**

## 🙏 Acknowledgments

- Express.js and MongoDB for robust backend
- Firebase for authentication
- Chart.js for data visualization
- Modern CSS techniques for responsive design

---

**🎯 Start tracking your habits today!**

**Production Ready** ✅ | **Mobile Responsive** 📱 | **Secure** 🔒 | **Fast** ⚡
├── assets/                 # Static assets (images, icons, etc.)
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── .gitignore             # Git ignore file
├── package.json           # Node.js dependencies and scripts
├── server.js              # Main server file
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository** (or navigate to the project folder)
   ```bash
   cd "HABIT TRACKER"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/habit-tracker
   PORT=3000
   SESSION_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   
   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Navigate to: `http://localhost:3000`

## 📡 API Endpoints

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all active habits |
| GET | `/api/habits/:id` | Get a single habit by ID |
| GET | `/api/habits/category/:category` | Get habits by category |
| POST | `/api/habits` | Create a new habit |
| POST | `/api/habits/:id/complete` | Mark habit as completed for today |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| POST | `/api/habits/:id/reset-streak` | Reset habit streak to 0 |

## 🗄️ Database Schema

### Habit Model

```javascript
{
  name: String (required),
  streak: Number (default: 0),
  lastCompleted: Date,
  completionHistory: [{ date: Date, completed: Boolean }],
  description: String,
  category: String (default: 'general'),
  isActive: Boolean (default: true),
  frequency: String (enum: ['daily', 'weekly', 'custom']),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🎨 Features Overview

### Frontend
- Modern gradient UI design
- Responsive layout for mobile and desktop
- Real-time habit tracking
- Streak visualization with fire emoji
- Smooth animations and transitions

### Backend
- RESTful API architecture
- MongoDB integration with Mongoose ORM
- Session management
- Error handling and validation
- Automatic timestamps
- Streak calculation logic

## 📝 Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon (auto-restart)

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/habit-tracker` |
| `PORT` | Server port number | `3000` |
| `SESSION_SECRET` | Secret key for sessions | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

ISC License

## 👤 Author

Aarohi Sharma

## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- Styled with custom CSS
- Icons and emojis from Unicode

---

**🎯 Start tracking your habits today!**

**Production Ready** ✅ | **Mobile Responsive** 📱 | **Secure** 🔒 | **Fast** ⚡

## 🌐 Live Demo

Deploy your own instance:
- [Railway](https://railway.app) - One-click deploy
- [Render](https://render.com) - Free tier available
- [Heroku](https://heroku.com) - Easy deployment

## 📞 Support

For issues or questions:
- Review documentation files in this repository
- Check Firebase Console for auth issues
- Review MongoDB Atlas metrics
- Check server logs for errors

## 🔄 Updates

**Latest Version:** 1.0.0  
**Last Updated:** December 28, 2025  
**Status:** Production Ready ✅

### Recent Improvements
- ✅ Fixed Google Sign-In popup issues
- ✅ Added CSP compliance (no unsafe-inline)
- ✅ Enhanced mobile responsiveness
- ✅ Production security headers
- ✅ Comprehensive deployment guides
