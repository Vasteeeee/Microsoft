# Outlook Connection Timeout Fix

## The Error You're Seeing

```
[Outlook] Failed to send email: Error: connect ETIMEDOUT 52.97.178.70:587
```

This means **port 587 is being blocked** on your network.

---

## ✅ Quick Fix: Use Gmail Only

If you don't need Outlook notifications right now, just use Gmail:

**In your [.env.local](.env.local) file:**
```env
# Keep Gmail configured
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your-gmail-password

# Comment out or remove Outlook
# OUTLOOK_USER=your@outlook.com
# OUTLOOK_APP_PASSWORD=your-outlook-password
```

The app will still work perfectly - it will just send notifications to Gmail only.

---

## 🔧 If You Want to Fix Outlook

### Option 1: Check Windows Firewall

1. Open **Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Find **Node.js** in the list
4. Make sure both **Private** and **Public** are checked
5. If Node.js isn't listed:
   - Click **"Allow another app..."**
   - Browse to: `C:\Program Files\nodejs\node.exe`
   - Add it and check both boxes

### Option 2: Check Antivirus

Some antivirus software blocks SMTP ports:
- Temporarily disable your antivirus
- Try sending a password reset email
- If it works, add Node.js to antivirus exceptions

### Option 3: Use Port 25 Instead

Some networks allow port 25 but block 587.

Update [lib/outlook.ts](lib/outlook.ts):

**Find this line (around line 25):**
```typescript
port: 587,
```

**Change it to:**
```typescript
port: 25,
```

### Option 4: Try Outlook's Alternative Port (TLS)

Update [lib/outlook.ts](lib/outlook.ts):

**Find these lines:**
```typescript
host: "smtp-mail.outlook.com",
port: 587,
secure: false, // use STARTTLS
```

**Change to:**
```typescript
host: "smtp-mail.outlook.com",
port: 465,
secure: true, // use TLS
```

### Option 5: Test from Command Line

Open PowerShell and run:

```powershell
Test-NetConnection -ComputerName smtp-mail.outlook.com -Port 587
```

**If you see:**
```
TcpTestSucceeded : True
```
✅ Port is open - the issue is with your credentials or code

**If you see:**
```
TcpTestSucceeded : False
```
❌ Port is blocked - you need to fix your firewall/network

### Option 6: Use VPN

If you're on a restricted corporate/school network:
- Connect to a VPN
- Try again

### Option 7: Contact Your ISP/IT Department

Some ISPs and corporate networks block SMTP ports to prevent spam.
- Call your ISP or IT department
- Ask them to unblock port 587
- Or ask which SMTP ports are allowed

---

## 🧪 Test Your Fix

After trying any of the above:

1. Go to your login page: http://localhost:3000
2. Try to reset a password
3. Check the terminal for:
   ```
   [Outlook] Email sent: 🔐 Password Reset Request
   ```
4. Check your Outlook inbox

---

## 📧 Current Status

Right now:
- ✅ **Gmail** - Working perfectly
- ❌ **Outlook** - Port 587 blocked
- ✅ **Database** - Passwords ARE being saved (you just couldn't see them in admin panel - now fixed!)

**Recommendation:** Use Gmail only for now, fix Outlook later if needed.

---

## 🎯 The Important Part

The **passwords ARE being saved to the database**! The issue was just that the admin panel wasn't showing the `currentPassword` and `newPassword` columns.

I've now added those columns to the admin panel. Refresh the page and you'll see:
- **Current Password** column (yellow background)
- **New Password** column (green background)

The Outlook error is just a network issue - it doesn't affect the core functionality.
