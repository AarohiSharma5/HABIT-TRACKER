# Habit Tracker - Full Stack Web Application

A modern, full-stack habit tracker application built with Node.js, Express, MongoDB, and EJS.

## 📋 Features

- ✅ Add and track daily habits
- 🔥 View and maintain habit streaks
- 📊 Store data persistently in MongoDB
- 🎨 Clean, responsive UI design
- 🚀 RESTful API architecture
- 💾 Session management

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **EJS** - Templating engine
- **Express Session** - Session management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with responsive design
- **JavaScript (ES6+)** - Client-side functionality
- **Fetch API** - HTTP requests

## 📁 Project Structure

```
HABIT TRACKER/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   └── Habit.js            # Mongoose schema and model
├── routes/
│   └── habits.js           # API routes for habit CRUD operations
├── views/
│   ├── partials/
│   │   ├── header.ejs      # Reusable header partial
│   │   └── footer.ejs      # Reusable footer partial
│   ├── index.ejs           # Main habit tracker page
│   └── 404.ejs             # 404 error page
├── public/
│   ├── css/
│   │   └── styles.css      # Application styles
│   └── js/
│       └── script.js       # Client-side JavaScript
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

**Happy Habit Tracking! 🎯**
