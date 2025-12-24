#!/bin/bash

# Security Scan Script for Habit Tracker
# Run this before every commit to ensure no secrets are exposed

echo "🔍 Starting security scan..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Check 1: Look for Firebase API keys in tracked files
echo "Checking for Firebase API keys..."
if git ls-files | xargs grep -l "AIzaSy" 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: Firebase API key found in tracked files!${NC}"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No Firebase API keys in tracked files${NC}"
fi

# Check 2: Look for MongoDB connection strings in tracked files
echo "Checking for MongoDB connection strings..."
if git ls-files | xargs grep -l "mongodb+srv://.*@" 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: MongoDB URI found in tracked files!${NC}"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No MongoDB URIs in tracked files${NC}"
fi

# Check 3: Look for private keys in tracked files
echo "Checking for private keys..."
if git ls-files | xargs grep -l "BEGIN PRIVATE KEY" 2>/dev/null | grep -v ".md$"; then
    echo -e "${RED}❌ CRITICAL: Private key found in tracked files!${NC}"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No private keys in tracked files${NC}"
fi

# Check 4: Look for OAuth client secrets
echo "Checking for OAuth secrets..."
if git ls-files | xargs grep -l "client_secret" 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: OAuth client secret found in tracked files!${NC}"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No OAuth secrets in tracked files${NC}"
fi

# Check 5: Verify .env is not tracked
echo "Checking .env file status..."
if git ls-files | grep -q "^.env$"; then
    echo -e "${RED}❌ CRITICAL: .env file is being tracked by git!${NC}"
    echo "Run: git rm --cached .env"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ .env file is properly ignored${NC}"
fi

# Check 6: Verify firebase-config.js is not tracked
echo "Checking firebase-config.js status..."
if git ls-files | grep -q "public/js/firebase-config.js"; then
    echo -e "${RED}❌ CRITICAL: firebase-config.js is being tracked by git!${NC}"
    echo "Run: git rm --cached public/js/firebase-config.js"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ firebase-config.js is properly ignored${NC}"
fi

# Check 7: Look for hardcoded passwords
echo "Checking for hardcoded passwords..."
if git ls-files "*.js" "*.ts" "*.json" | xargs grep -iE "(password|passwd|pwd)\s*[:=]\s*['\"][^'\"]{8,}" 2>/dev/null | grep -v "placeholder" | grep -v "example" | grep -v "your-password" | grep -v "Enter your password"; then
    echo -e "${YELLOW}⚠️  WARNING: Possible hardcoded password found${NC}"
    echo "Please review the above matches"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded passwords detected${NC}"
fi

# Check 8: Look for TODO or FIXME with security implications
echo "Checking for security-related TODOs..."
if git ls-files "*.js" "*.ts" | xargs grep -iE "TODO.*security|FIXME.*security|TODO.*auth|FIXME.*auth" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Security-related TODOs found${NC}"
    echo "Consider addressing these before deploying"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Security scan passed! Safe to commit.${NC}"
    exit 0
else
    echo -e "${RED}❌ Security scan failed! DO NOT COMMIT!${NC}"
    echo ""
    echo "Fix the issues above before committing."
    echo "If credentials were exposed:"
    echo "  1. Remove them from the files"
    echo "  2. Regenerate the compromised credentials"
    echo "  3. Update your .env file with new credentials"
    exit 1
fi
