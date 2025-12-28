#!/bin/bash

# Pre-Commit Security Check Script
# Run this before committing to ensure no sensitive data is exposed

echo "🔒 Running Security Checks..."
echo ""

ERRORS=0

# Check 1: Verify .env is not tracked
echo "1️⃣  Checking if .env is tracked..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "   ❌ DANGER: .env is tracked by git!"
    echo "   Run: git rm --cached .env"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ .env is not tracked"
fi
echo ""

# Check 2: Verify firebase-config.js is not tracked
echo "2️⃣  Checking if firebase-config.js is tracked..."
if git ls-files --error-unmatch public/js/firebase-config.js 2>/dev/null; then
    echo "   ❌ DANGER: firebase-config.js is tracked by git!"
    echo "   Run: git rm --cached public/js/firebase-config.js"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ firebase-config.js is not tracked"
fi
echo ""

# Check 3: Search for hardcoded MongoDB connection strings in tracked files
echo "3️⃣  Searching for hardcoded MongoDB URIs in code files..."
FOUND_CREDS=$(git ls-files '*.js' '*.json' | xargs grep -l 'mongodb+srv://[^<]' 2>/dev/null | grep -v node_modules || true)
if [ -n "$FOUND_CREDS" ]; then
    echo "   ❌ DANGER: Found potential hardcoded credentials in:"
    echo "$FOUND_CREDS" | sed 's/^/      /'
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ No hardcoded MongoDB URIs in code files"
fi
echo ""

# Check 4: Verify .gitignore contains necessary entries
echo "4️⃣  Verifying .gitignore..."
if grep -q "^\.env$" .gitignore && grep -q "firebase-config.js" .gitignore; then
    echo "   ✅ .gitignore has required entries"
else
    echo "   ❌ WARNING: .gitignore missing required entries"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Look for common password patterns in staged files
echo "5️⃣  Checking staged files for suspicious patterns..."
SUSPICIOUS=$(git diff --cached --name-only | xargs grep -l 'password.*=.*[^<]' 2>/dev/null | grep -v '.md' || true)
if [ -n "$SUSPICIOUS" ]; then
    echo "   ⚠️  WARNING: Found 'password=' patterns in staged files:"
    echo "$SUSPICIOUS" | sed 's/^/      /'
    echo "   Please review these files manually"
else
    echo "   ✅ No suspicious password patterns found"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo "   Safe to commit to GitHub"
    exit 0
else
    echo "❌ Found $ERRORS security issue(s)"
    echo "   DO NOT commit until resolved!"
    exit 1
fi
