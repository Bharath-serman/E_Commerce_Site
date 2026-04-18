# Authentication Setup Guide

This guide will help you set up authentication for your E-commerce site using Better Auth.

## Prerequisites

You need to install the following packages manually (PowerShell execution policy is blocking npm install):

```bash
npm install better-auth bcrypt
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Better Auth
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (required for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env.local`

## Database Setup

Run the SQL migration in your Supabase SQL editor:

```sql
-- File: supabase/migrations/001_create_users.sql
-- Run this in your Supabase SQL editor
```

The migration creates:
- `user` table - for regular user authentication
- `session` table - for user sessions
- `account` table - for OAuth providers
- `verification` table - for email verification
- `admin_users` table - for admin authentication (separate from regular users)

## Admin User Setup

The migration includes a default admin user. You should update the password hash:

1. Generate a bcrypt hash for your admin password:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10).then(console.log);"
   ```

2. Update the migration file with your hashed password before running it, or update it directly in Supabase:
   ```sql
   UPDATE admin_users 
   SET password_hash = '$2b$10$YourHashedPasswordHere'
   WHERE email = 'admin@aesthetic.com';
   ```

3. You can also add more admin users:
   ```sql
   INSERT INTO admin_users (id, email, name, password_hash)
   VALUES (
     'admin-002',
     'your-email@example.com',
     'Your Name',
     '$2b$10$YourHashedPasswordHere'
   );
   ```

## Features Implemented

### Main Site Authentication
- Email/Password sign in
- Email/Password sign up
- Google OAuth sign in
- Session management
- Auth button in Navbar (shows Sign In/Sign Up when logged out, user info and Sign Out when logged in)

### Admin Dashboard Authentication
- Separate admin login at `/admin/login`
- Admin users stored in `admin_users` table
- Middleware protects all `/admin/*` routes
- Session-based authentication with httpOnly cookies
- Regular users cannot access admin dashboard

## File Structure

```
lib/
  auth.ts              # Better Auth configuration
  auth-client.ts       # React auth client

app/
  (auth)/
    sign-in/page.tsx   # Sign in page
    sign-up/page.tsx   # Sign up page
  api/
    auth/[[...all]]/   # Auth API handler
    admin/login/       # Admin login API
  admin/
    login/page.tsx     # Admin login page

components/
  AuthButton.tsx       # Auth button component for Navbar

middleware.ts          # Protects admin routes

supabase/
  migrations/
    001_create_users.sql  # Database schema
```

## Testing

1. Start your dev server: `npm run dev`
2. Navigate to `/sign-in` to test regular user authentication
3. Navigate to `/admin/login` to test admin authentication
4. Test Google OAuth (requires valid Google credentials)

## Troubleshooting

### "Cannot find module 'better-auth'"
- Make sure you've run `npm install better-auth`

### "Cannot find module 'bcrypt'"
- Make sure you've run `npm install bcrypt`

### Google OAuth not working
- Verify your Google OAuth credentials are correct
- Check that the redirect URI matches your app URL
- Make sure the OAuth consent screen is configured

### Admin login not working
- Check that the admin user exists in the `admin_users` table
- Verify the password hash is correct
- Check browser console for errors

### Middleware not protecting admin routes
- Ensure middleware.ts is in the project root
- Check that the matcher configuration is correct
- Verify the admin_session cookie is being set
