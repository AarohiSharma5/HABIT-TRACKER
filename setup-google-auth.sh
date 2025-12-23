#!/bin/bash

# Google Authentication Setup Script
# This script installs Firebase dependencies and guides you through setup

echo "🔥 Google Authentication Setup for Habit Tracker"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the Habit Tracker root directory"
    exit 1
fi

# Install Firebase packages
echo "📦 Installing Firebase packages..."
npm install firebase firebase-admin --save

if [ $? -eq 0 ]; then
    echo "✅ Firebase packages installed successfully!"
else
    echo "❌ Failed to install Firebase packages"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Read GOOGLE_AUTH_SETUP.md for detailed setup instructions"
echo "2. Create a Firebase project at https://console.firebase.google.com/"
echo "3. Update /public/js/firebase-config.js with your Firebase config"
echo "4. Add Firebase credentials to your .env file"
echo "5. Restart your server with: npm start"
echo ""
echo "📖 For detailed instructions, open: GOOGLE_AUTH_SETUP.md"
echo ""
