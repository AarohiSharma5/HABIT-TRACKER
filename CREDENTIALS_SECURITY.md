# 🔒 CREDENTIALS & SECRETS SECURITY GUIDE

## ⚠️ CRITICAL SECURITY RULES

### **NEVER DO THIS:**
- ❌ **Never** hardcode credentials in source code
- ❌ **Never** commit .env file to Git
- ❌ **Never** include real passwords in documentation
- ❌ **Never** share credentials in screenshots or logs
- ❌ **Never** use the same credentials for dev and production
- ❌ **Never** commit connection strings with passwords
- ❌ **Never** push API keys or secrets to public repositories

### **ALWAYS DO THIS:**
- ✅ **Always** use environment variables for sensitive data
- ✅ **Always** keep .env in .gitignore
- ✅ **Always** use placeholder credentials in documentation
- ✅ **Always** rotate credentials if accidentally exposed
- ✅ **Always** use different credentials per environment
- ✅ **Always** store production secrets in deployment platform
- ✅ **Always** generate strong random SESSION_SECRET

## 🔐 How Credentials Are Handled in This Project

### 1. Environment Variables (CORRECT ✅)

All sensitive data is read from environment variables:

```javascript
// ✅ CORRECT - Reading from environment
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const firebaseKey = process.env.FIREBASE_API_KEY;
```

### 2. .env File (Local Development Only)

Create `.env` file locally (NEVER commit it):

```env
# .env (LOCAL ONLY - NOT IN GIT)
MONGODB_URI=mongodb://localhost:27017/habit-tracker
SESSION_SECRET=your-local-dev-secret
NODE_ENV=development
```

**Why .env is safe:**
- ✅ Listed in `.gitignore` - Git will never track it
- ✅ Only exists on your local machine
- ✅ Each developer has their own .env file
- ✅ Production uses platform environment variables, not .env

### 3. Production Secrets (Deployment Platform)

**For Railway/Render/Heroku:**
- Add environment variables in platform dashboard
- Platform injects them at runtime
- Never stored in code or Git

**Example in Railway:**
1. Go to Variables tab
2. Add `MONGODB_URI` = `mongodb+srv://...`
3. Railway injects it as `process.env.MONGODB_URI`

## 📋 Credential Checklist

### Before Committing Code

- [ ] No hardcoded passwords in any file
- [ ] .env file is in .gitignore
- [ ] .env file is NOT staged for commit
- [ ] Documentation uses placeholders like `<username>:<password>`
- [ ] No real API keys in code or comments

**Check with:**
```bash
# Search for potential secrets
git grep -i "password" | grep -v "placeholder\|<password>\|your-password"
git grep "mongodb+srv://" | grep -v "<username>\|<password>"

# Verify .env is gitignored
git check-ignore .env
# Should output: .env
```

### When Setting Up New Environment

- [ ] Create new .env file from .env.example
- [ ] Generate new SESSION_SECRET (don't reuse)
- [ ] Use appropriate MongoDB URI for environment
- [ ] Verify .env is NOT tracked by Git

**Verify:**
```bash
git status | grep .env
# Should output nothing (file is ignored)
```

## 🚨 If Credentials Are Accidentally Exposed

**Immediate Actions:**

1. **Rotate all exposed credentials immediately**
   - MongoDB: Change user password in Atlas
   - Firebase: Regenerate API keys
   - Session: Generate new SESSION_SECRET

2. **Remove from Git history** (if committed)
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   # DO NOT use git filter-branch (deprecated)
   ```

3. **Force push cleaned history**
   ```bash
   git push --force origin main
   ```

4. **Update all deployments** with new credentials

5. **Review access logs** for unauthorized access

## 📝 Safe Placeholder Examples

### MongoDB Connection Strings

**❌ NEVER (Bad Example - Don't Use Real Credentials):**
```env
# ⚠️ THIS IS AN EXAMPLE OF WHAT NOT TO DO - FAKE CREDENTIALS FOR DEMONSTRATION
# MONGODB_URI=mongodb+srv://fakeuser:FakeP@ss123@example.mongodb.net/db
```

**✅ CORRECT in documentation:**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
```

**✅ CORRECT in .env.example:**
```env
MONGODB_URI=mongodb://localhost:27017/habit-tracker
# Production: mongodb+srv://<username>:<password>@<cluster-url>/habit-tracker
```

### Firebase Credentials

**❌ NEVER:**
```env
FIREBASE_API_KEY=AIzaSyC_RealApiKey12345678901234567890
```

**✅ CORRECT:**
```env
FIREBASE_API_KEY=your-firebase-api-key-here
```

### Session Secrets

**❌ NEVER:**
```env
SESSION_SECRET=mysupersecretkey123
```

**✅ CORRECT:**
```env
SESSION_SECRET=your-64-character-random-string-here
```

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗂️ Files That Should Never Contain Real Secrets

### Allowed to Commit (No Real Secrets)
- ✅ `.env.example` - Template with placeholders only
- ✅ `README.md` - Documentation with placeholders
- ✅ `DEPLOYMENT.md` - Guides with placeholder examples
- ✅ `*.js` - Source code (reads from process.env)

### Never Commit (Contains Real Secrets)
- ❌ `.env` - Your actual environment variables
- ❌ `firebase-service-account.json` - Firebase credentials
- ❌ Any file with real passwords/keys/tokens

## 🔍 Pre-Commit Verification

**Before every commit, verify:**

```bash
# 1. Check what files are staged
git status

# 2. If .env appears, unstage it immediately
git reset HEAD .env

# 3. Search for potential secrets in staged files
git diff --cached | grep -i "password\|secret\|mongodb+srv"
# Review any matches carefully

# 4. Verify .env is gitignored
git check-ignore .env
# Should output: .env
```

## 🏷️ Environment Variable Naming

**Use descriptive names:**
- ✅ `MONGODB_URI` (clear purpose)
- ✅ `SESSION_SECRET` (clear purpose)
- ✅ `FIREBASE_API_KEY` (clear purpose)

**Avoid generic names:**
- ❌ `SECRET` (unclear)
- ❌ `KEY` (unclear)
- ❌ `PASSWORD` (unclear)

## 📚 Additional Resources

- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [12 Factor App - Config](https://12factor.net/config)

## ✅ Verification

**Your project is secure if:**
- ✅ `.env` is in `.gitignore`
- ✅ No hardcoded credentials in code
- ✅ `.env.example` only has placeholders
- ✅ Documentation uses placeholder credentials
- ✅ All real credentials in environment variables only
- ✅ Production credentials stored in deployment platform

**Run this check:**
```bash
# Should find NO real credentials
grep -r "mongodb+srv://[^<]" --include="*.md" --include="*.js" --include="*.json" --exclude-dir=node_modules .
```

---

**Last Updated:** December 28, 2025  
**Status:** ✅ Secure Configuration Verified

**Remember:** When in doubt, assume it's sensitive and use environment variables!
