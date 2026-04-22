# Auth.js (NextAuth) Setup Guide

This guide walks through the Auth.js integration for Google OAuth and credentials-based authentication.

## What's Changed

The authentication system has been migrated from custom JWT tokens to Auth.js v5, enabling:
- **Credentials Provider**: Email/password login (backward compatible with existing users)
- **Google OAuth**: Sign in with Google
- **Better Session Management**: Automatic session handling via Auth.js

## Database Schema Migration

Auth.js requires extending the users table with OAuth provider fields:

```bash
npm install @neondatabase/serverless dotenv

# Create a .env.local file with your DATABASE_URL
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# Run the migration
npx tsx scripts/migrate-oauth.ts
```

### What the migration does:
1. Adds `provider` column (VARCHAR, defaults to 'credentials')
2. Adds `provider_id` column (VARCHAR, nullable)
3. Adds `name` column (VARCHAR, nullable)
4. Creates a unique index on `provider_id`
5. Updates existing users to `provider='credentials'`

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in the required variables:

### Required
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXTAUTH_URL`: http://localhost:3000 (for development)
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`

### Optional (for Google OAuth)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://your-domain.com/api/auth/callback/google
7. Copy Client ID and Secret to `.env.local`

## What Was Updated

### New Files
- `/lib/auth-adapter.ts` - Custom Neon database adapter for Auth.js
- `/app/api/auth/[...nextauth]/route.ts` - Auth.js configuration
- `/components/GoogleSignInButton.tsx` - Google sign-in button component

### Modified Files
- `/app/layout.tsx` - Added SessionProvider wrapper
- `/app/login/page.tsx` - Added GoogleSignInButton
- `/components/AuthForm.tsx` - Now uses Auth.js credentials provider
- `/components/Navbar.tsx` - Uses Auth.js signOut() instead of manual logout
- `/app/api/ideas/route.ts` - Now uses getServerSession() for auth
- `/app/api/ideas/[id]/route.ts` - Now uses getServerSession() for auth
- `/app/api/ideas/like/route.ts` - Now uses getServerSession() for auth
- `/app/api/auth/me/route.ts` - Now uses getServerSession() for auth
- `/app/dashboard/page.tsx` - Now uses getServerSession() for auth
- `/app/ideas/[id]/page.tsx` - Now uses getServerSession() for auth
- `/app/api/auth/signup/route.ts` - Updated to set provider field
- `/types/index.ts` - Added Auth.js type augmentations

## Testing the Implementation

### Email/Password Flow
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Sign Up"
4. Create account with test email/password
5. Verify redirect to dashboard
6. Create an idea to test authenticated API
7. Log out and log back in to verify session persistence

### Google OAuth Flow
1. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Verify user is created with provider='google'

### Session Persistence
1. Log in (either method)
2. Refresh page multiple times
3. Verify you remain logged in
4. Navigate to different pages
5. Check that session is maintained

## Troubleshooting

### "Unauthorized" errors on API routes
- Ensure database migration ran successfully
- Check NEXTAUTH_URL and NEXTAUTH_SECRET are set
- Verify session cookie is being sent (check Network tab in DevTools)

### Database connection errors
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check that Neon connection pool is not exhausted
- Ensure @neondatabase/serverless is installed

### Google sign-in not working
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check authorized redirect URIs in Google Console
- Ensure NEXTAUTH_URL matches deployment URL

### Type errors with Session
- Rebuild TypeScript: `npm run build`
- Clear Next.js cache: `rm -rf .next`

## Backward Compatibility

Existing email/password users:
- Continue using credentials provider automatically
- Provider field set to 'credentials' during migration
- No re-authentication required

To link an OAuth account to existing email account:
- Set `allowDangerousEmailAccountLinking: true` in Auth.js config (already enabled)
- User can sign in with Google using same email
- User will be matched to existing account

## Additional Resources

- [Auth.js Documentation](https://authjs.dev/)
- [Google OAuth Setup](https://authjs.dev/getting-started/providers/google)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Neon Documentation](https://neon.tech/docs)
