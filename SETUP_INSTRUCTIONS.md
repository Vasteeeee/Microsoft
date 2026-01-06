# MongoDB and Gmail Setup Instructions

## MongoDB Configuration

### Option 1: Local MongoDB
1. Install MongoDB on your machine: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. In your `env` file, set:
   ```
   MONGODB_URI=mongodb://localhost:27017/outlook-login
   ```

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and add it to `env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/outlook-login
   ```

## Gmail Configuration (Optional)

Gmail notifications are optional. If not configured, the app will still work but won't send email notifications.

### Setup Gmail App Password:
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords" (search for it in settings)
5. Generate a new app password for "Mail"
6. Copy the 16-character password

### Configure in env file:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Note:** Remove spaces from the app password when copying it.

## Admin Configuration

Set a secure admin password in your `env` file:
```
ADMIN_PASSWORD=your-secure-admin-password
```

This password will be used to access the admin dashboard at `/admin`

## Environment File

Your complete `env` file should look like this:

```env
# Google Sheets (existing configuration)
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_USERS_SHEET=Users
GOOGLE_SHEETS_AUDIT_SHEET=AuditLog
GOOGLE_SHEETS_FORGOT_SHEET=ForgotRequests

# Telegram (existing configuration)
TELEGRAM_BOT_TOKEN=123456:ABCDEF
TELEGRAM_CHAT_ID=987654321

# MongoDB Configuration (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/outlook-login
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/outlook-login

# Gmail Notification Configuration (OPTIONAL)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Admin Configuration (REQUIRED)
ADMIN_PASSWORD=your-secure-admin-password
```

## Running the Application

1. Make sure MongoDB is running (if using local installation)
2. Start your Next.js development server:
   ```bash
   npm run dev
   ```
3. The application will be available at http://localhost:3000
4. Access the admin dashboard at http://localhost:3000/admin

## Features

### Database Logging
All authentication events are now logged to MongoDB:
- User identification attempts
- Successful login attempts
- Failed login attempts
- Password reset requests

### Gmail Notifications
When configured, you'll receive email notifications for:
- Successful logins
- Failed login attempts
- Password reset requests

### Admin Dashboard
Access at `/admin` to view:
- Login attempt statistics
- Detailed logs of all authentication events
- Password reset requests
- Filter by email or event type
- Real-time data refresh

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` (for local) or test connection in Atlas
- Check your connection string is correct in `env` file
- Ensure your IP is whitelisted in MongoDB Atlas (if using cloud)

### Gmail Not Sending
- Verify 2-Step Verification is enabled on your Google account
- Make sure you're using an App Password, not your regular password
- Check for typos in GMAIL_USER and GMAIL_APP_PASSWORD
- The app will continue to work even if Gmail is not configured

### Admin Login Issues
- Verify ADMIN_PASSWORD is set in your `env` file
- Clear browser cookies and try again
- Check browser console for errors

## Security Notes

- Never commit your `env` file to version control
- Use strong passwords for admin access
- In production, use HTTPS
- Consider implementing rate limiting for login attempts
- Regularly review admin dashboard logs for suspicious activity
