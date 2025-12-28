#!/bin/bash
# Quick commit script for security fixes

echo "🔒 Committing Security Fixes..."
echo ""

# Add all changes
git add README.md DEPLOYMENT.md DEPLOY_NOW.md .env.example .gitignore
git add CREDENTIALS_SECURITY.md SECURITY_FIXES_SUMMARY.md

# Commit with descriptive message
git commit -m "🔒 Security: Remove hardcoded credentials and add security documentation

- Replace all MongoDB connection strings with safe placeholders
- Update README.md, DEPLOYMENT.md, DEPLOY_NOW.md with placeholders
- Update .env.example with security warnings
- Add CREDENTIALS_SECURITY.md comprehensive guide
- Add SECURITY_FIXES_SUMMARY.md documenting all fixes
- Verify .env is gitignored and not tracked
- All code uses process.env for credentials only

Resolves GitHub secret scanning alerts
No real credentials in any committed files"

echo ""
echo "✅ Changes committed!"
echo ""
echo "Next steps:"
echo "1. Review commit: git show"
echo "2. Push to GitHub: git push origin main"
echo ""
echo "GitHub secret scanning should clear after push."
