# 🔧 MongoDB Authentication Error - Quick Fix Guide

## ❌ Current Error
```
MongoServerError: bad auth : authentication failed
```

## 🎯 Solutions (Try in Order)

### **Solution 1: Fix Your MongoDB Atlas Password**

1. **Go to MongoDB Atlas** → https://cloud.mongodb.com/
2. Click **Database Access** (left sidebar)
3. Find your database user (e.g., `aarohi` or `admin`)
4. Click **EDIT** button
5. Click **Edit Password**
6. **Generate a NEW password** or set a simple one (e.g., `Test1234`)
7. ⚠️ **IMPORTANT**: Avoid special characters like `@`, `#`, `$`, `%`, `/`, `:` in password
8. Click **Update User**

### **Solution 2: Get Fresh Connection String**

1. In MongoDB Atlas, go to **Database** → Click **Connect**
2. Choose **Connect your application**
3. Copy the **connection string** (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/habit-tracker
   ```
4. Replace `<username>` with your actual username
5. Replace `<password>` with the password you just set

### **Solution 3: Update Your .env File**

1. **Open your `.env` file** in the project root
2. Find the `MONGODB_URI` line
3. **Replace it completely** with your new connection string:
   ```
   MONGODB_URI=mongodb+srv://aarohi:Test1234@cluster0.zmibrqq.mongodb.net/habit-tracker?retryWrites=true&w=majority
   ```
4. **Make sure**:
   - No spaces before or after `=`
   - Username matches your MongoDB Atlas user
   - Password matches exactly what you set
   - Database name is `habit-tracker` (at the end before `?`)

### **Solution 4: Verify IP Whitelist**

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Make sure you have one of:
   - `0.0.0.0/0` (allows all IPs - for development)
   - Your current IP address
3. If not, click **ADD IP ADDRESS** → **ALLOW ACCESS FROM ANYWHERE** → **Confirm**

### **Solution 5: Restart Your Server**

After updating `.env`:
```bash
# Press Ctrl+C to stop nodemon if running
# Then restart:
npx nodemon server.js
```

---

## 📝 Example .env Configuration

Your `.env` file should look like this:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.zmibrqq.mongodb.net/habit-tracker?retryWrites=true&w=majority

# Session Secret
SESSION_SECRET=your-secret-key-here

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Port
PORT=3000
```

---

## ✅ Success Check

When fixed correctly, you should see:
```
🔗 Mongoose connected to MongoDB
✅ MongoDB Connected: ac-a801yj7-shard-00-00.zmibrqq.mongodb.net
📊 Database Name: habit-tracker
```

No more `bad auth` errors! 🎉

---

## 🆘 Still Having Issues?

### Check for Password Special Characters

If your password has special characters, URL-encode them:

| Character | URL-Encoded |
|-----------|-------------|
| `@`       | `%40`       |
| `#`       | `%23`       |
| `$`       | `%24`       |
| `%`       | `%25`       |
| `/`       | `%2F`       |
| `:`       | `%3A`       |

**Example:**
- Password: `MyP@ss#123`
- URL-Encoded: `MyP%40ss%23123`
- Full URI: `mongodb+srv://user:MyP%40ss%23123@cluster.mongodb.net/db`

### Or Just Use a Simple Password

**Easiest solution**: Set a password without special characters:
- ✅ Good: `Test1234`, `MyPassword123`, `SecurePass2024`
- ❌ Avoid: `P@ssw0rd!`, `Test#123`, `My$ecret`

---

## 🔍 Debug Commands

Check your MongoDB connection string format:
```bash
# See your MONGODB_URI (password will be hidden by grep)
grep MONGODB_URI .env
```

Test MongoDB connection manually:
```bash
# Install MongoDB shell (if not installed)
brew install mongosh

# Test connection (replace with your actual URI)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/habit-tracker"
```

---

**Next Steps After Fix:**
1. Restart your server with `npx nodemon server.js`
2. Check terminal for successful connection message
3. Test login/signup at http://localhost:3000
