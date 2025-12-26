# Email Configuration Setup

## Required Environment Variables

To enable email notifications (welcome emails, login notifications, password reset), add these variables to your `.env` file:

```env
# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Note: For Gmail, you need to:
# 1. Enable 2-factor authentication on your Google account
# 2. Generate an App-Specific Password at: https://myaccount.google.com/apppasswords
# 3. Use that app-specific password (not your regular Gmail password)
```

## Development Mode

If environment variables are not set, the system will:
- Log email content to console instead of sending
- Continue working normally (non-blocking)
- Display a warning: "⚠️  Email credentials not configured"

## Alternative Email Services

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@habittracker.com
```

### Outlook/Office365
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
```

## Implemented Features

### 1. Welcome Email
- Sent automatically on signup
- Includes getting started tips
- Beautiful HTML template

### 2. Login Notification
- Sent on each login
- Includes timestamp
- Security alert for unauthorized access

### 3. Password Reset
- "Forgot Password?" link on login page
- Secure token-based reset (expires in 1 hour)
- Email with reset link

## Testing Without Email

To test the forgot password flow without email:
1. Check server console logs
2. Look for the reset URL in the logs
3. Copy and open that URL in your browser
4. The token system works even without email sending
