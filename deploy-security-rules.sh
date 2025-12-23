#!/bin/bash

# Firebase Security Rules Deployment Script
# This script helps you deploy security rules to Firebase Console

echo "🔐 Firebase Security Rules Deployment"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo ""
    echo "To install Firebase CLI, run:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Login to Firebase
echo "📝 Logging into Firebase..."
firebase login

# Initialize Firebase if needed
if [ ! -f "firebase.json" ]; then
    echo ""
    echo "📦 Initializing Firebase project..."
    echo ""
    echo "When prompted:"
    echo "  1. Select: Firestore, Realtime Database, and Storage"
    echo "  2. Use existing project: habit-tracker-a72a1"
    echo "  3. For rules files, use the default suggested paths"
    echo ""
    firebase init
fi

# Deploy rules
echo ""
echo "🚀 Deploying security rules..."
echo ""

# Deploy Firestore rules (if exists)
if [ -f "firestore.rules" ]; then
    echo "📤 Deploying Firestore rules..."
    firebase deploy --only firestore:rules
fi

# Deploy Realtime Database rules (if exists)
if [ -f "firebase-database-rules.json" ]; then
    echo "📤 Deploying Realtime Database rules..."
    firebase deploy --only database
fi

# Deploy Storage rules (if exists)
if [ -f "storage.rules" ]; then
    echo "📤 Deploying Storage rules..."
    firebase deploy --only storage
fi

echo ""
echo "✅ Security rules deployment complete!"
echo ""
echo "🔍 To verify:"
echo "  1. Visit: https://console.firebase.google.com"
echo "  2. Select project: habit-tracker-a72a1"
echo "  3. Check Firestore/Database/Storage → Rules tabs"
echo ""
