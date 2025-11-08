# Production Setup Guide for Discover Udupi

This guide explains how to configure the sign-in pages for production deployment.

## OAuth Configuration in Supabase

The sign-in pages are ready, but you need to configure the redirect URLs in your Supabase project.

### Step 1: Configure Redirect URLs in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add your production and development URLs to **Redirect URLs**:

**For Production (Vercel):**
```
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/*
```

**For Development (Local):**
```
http://localhost:3000/auth/callback
http://localhost:3000/*
```

**Important:** Replace `your-domain` with your actual Vercel domain.

### Step 2: Configure Site URL

In the same **URL Configuration** section, set the **Site URL**:

**For Production:**
```
https://your-domain.vercel.app
```

**For Development:**
```
http://localhost:3000
```

### Step 3: Enable Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Enable it
4. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### Step 4: Google Cloud Console Setup

If you haven't set up Google OAuth yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type:** Web application
   - **Authorized JavaScript origins:**
     - `https://your-domain.vercel.app`
     - `http://localhost:3000` (for development)
   - **Authorized redirect URIs:**
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - (Find this in Supabase Dashboard → Settings → API → Project URL)
6. Copy the **Client ID** and **Client Secret** to Supabase

## How OAuth Flow Works

1. User clicks "Continue with Google" on `/auth/signin`
2. User is redirected to Google's OAuth page
3. User authorizes the application
4. Google redirects back to: `https://your-domain.vercel.app/auth/callback?code=...`
5. The callback route exchanges the code for a session
6. User is redirected to the home page (`/`)

## Environment Variables

Make sure these are set in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

## Testing the Sign-In Flow

1. **Test Google OAuth:**
   - Click "Continue with Google"
   - Should redirect to Google
   - After authorization, should redirect back to your site
   - Should be signed in

2. **Test Email/Password:**
   - Enter email and password
   - Click "Sign In"
   - Should redirect to home page if successful
   - Should show error toast if failed

3. **Test Error Handling:**
   - Try signing in with wrong credentials
   - Should show error message
   - URL should not have error parameters after showing toast

## Troubleshooting

### Issue: Redirecting to Vercel URL instead of home page

**Solution:** This is normal! The OAuth flow redirects to Google first, then back to your callback URL. The callback route should then redirect to home. Check:
- Callback route is working (`/auth/callback`)
- Redirect URLs are configured in Supabase
- No errors in browser console

### Issue: "Invalid redirect URL" error

**Solution:** 
- Check redirect URLs in Supabase match your domain exactly
- Include both `/auth/callback` and wildcard `/*` patterns
- Make sure Site URL is set correctly

### Issue: OAuth works but user not signed in

**Solution:**
- Check callback route is processing the code correctly
- Verify cookies are being set
- Check browser console for errors
- Verify Supabase session is being created

### Issue: Error messages not showing

**Solution:**
- Check that toast notifications are working
- Verify error handling in callback route
- Check browser console for errors

## Production Checklist

- [ ] Redirect URLs configured in Supabase
- [ ] Site URL set in Supabase
- [ ] Google OAuth provider enabled in Supabase
- [ ] Google OAuth credentials added to Supabase
- [ ] Environment variables set in Vercel
- [ ] Tested Google OAuth flow
- [ ] Tested email/password sign-in
- [ ] Tested error handling
- [ ] Verified redirects work correctly

## Additional Notes

- The callback route (`/auth/callback`) handles all OAuth redirects
- Error messages are displayed via toast notifications
- URL parameters are cleaned up after showing errors
- Loading states are shown during OAuth redirects
- The sign-in page automatically redirects authenticated users to home

