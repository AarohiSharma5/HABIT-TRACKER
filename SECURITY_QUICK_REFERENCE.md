# 🔒 Security Quick Reference

## Before Every Commit - Run Security Scan

```bash
./security-scan.sh
```

This script checks for:
- ❌ Firebase API keys
- ❌ MongoDB connection strings  
- ❌ Private keys
- ❌ OAuth secrets
- ❌ Hardcoded passwords

## Currently Protected Files

### Never Commit These:
```
.env                           ← Server secrets (MongoDB, Firebase Admin)
public/js/firebase-config.js   ← Firebase client config (API keys)
*.json (service accounts)      ← Firebase Admin credentials
```

### Safe to Commit:
```
.env.example                           ← Template with placeholders
public/js/firebase-config.example.js   ← Template with placeholders
SECURITY.md                            ← Security documentation
security-scan.sh                       ← Security scan script
```

## Quick Security Checks

**Check what's being tracked:**
```bash
git status
```

**Verify no secrets in staged files:**
```bash
git diff --cached | grep -E "AIzaSy|mongodb+srv|BEGIN PRIVATE KEY"
```

**Check if .env is ignored:**
```bash
git ls-files | grep "^\.env$"
# Should return nothing
```

## If You Accidentally Expose Secrets

1. **Stop immediately** - Don't push!
2. **Remove from staging:**
   ```bash
   git reset HEAD <file-with-secret>
   ```
3. **Regenerate ALL exposed credentials**
4. **Update .env with new credentials**
5. **Never commit the same secret again**

## Common Mistakes to Avoid

❌ **DON'T:**
- Commit `.env` file
- Commit `firebase-config.js`
- Hardcode passwords in code
- Store API keys in JavaScript files
- Commit Firebase service account JSON files

✅ **DO:**
- Use `.env` for all secrets
- Use template files with placeholders
- Run `./security-scan.sh` before committing
- Keep `.gitignore` up to date
- Review `git diff` before committing

## Files Summary

| File | Status | Contains |
|------|--------|----------|
| `.env` | **IGNORED** | MongoDB URI, Firebase Admin keys, Session secret |
| `.env.example` | Tracked | Template with placeholders only |
| `public/js/firebase-config.js` | **IGNORED** | Firebase client config with real API key |
| `public/js/firebase-config.example.js` | Tracked | Template with placeholders only |
| `*.json` (service accounts) | **IGNORED** | Firebase Admin private keys |
| `GOOGLE_AUTH*.md` | **IGNORED** | Development notes with credentials |
| `SECURITY_ARCHITECTURE.md` | **IGNORED** | Architecture docs with examples |

## Need Help?

Read the full documentation:
- `SECURITY.md` - Complete security guide
- `README.md` - Project setup instructions
- `GOOGLE_OAUTH_SETUP.md` - OAuth configuration (not committed)

---

**Remember:** When in doubt, run `./security-scan.sh` before committing!
