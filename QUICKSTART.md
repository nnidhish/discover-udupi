# Quick Start Guide - Discover Udupi

## 📋 What's Been Done

✅ Project structure is complete
✅ Authentication pages (sign up/sign in) are ready
✅ All dependencies installed and working
✅ Code quality verified - build successful

## 🚀 To Get Up and Running

### Step 1: Get Supabase (5 min)
```
1. Go to supabase.com
2. Create account and new project
3. Copy 3 keys from Settings → API:
   - Project URL
   - anon public key
   - service role key
```

### Step 2: Create Database (10 min)
```
1. In Supabase, go to SQL Editor
2. Open SUPABASE_SCHEMA.sql from project root
3. Copy entire content into SQL Editor
4. Run it
5. Verify tables exist
```

### Step 3: Add Credentials (2 min)
Create `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_key
```

### Step 4: Start Development (1 min)
```bash
npm run dev
```

Visit `http://localhost:3000`

## ✨ What Works Right Now

- **Sign up** at `/auth/signup`
- **Sign in** at `/auth/signin`
- **Home page** at `/`
- View locations and details
- Responsive design
- PWA support (installable)

## 📲 Test the Auth Flow

1. Visit `http://localhost:3000/auth/signup`
2. Create account with:
   - Name: Your Name
   - Email: your-email@example.com
   - Password: password123
3. Should get email verification link
4. Visit sign in page and log in
5. Should redirect to home
6. Check user menu shows your profile

## 🐛 Troubleshooting

**Problem**: "Missing Supabase environment variables"
- **Solution**: Check `.env.local` has all 3 Supabase keys

**Problem**: Database tables don't exist
- **Solution**: Copy-paste entire SUPABASE_SCHEMA.sql into Supabase SQL Editor

**Problem**: Build fails
- **Solution**: Run `npm install` again

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `/hooks/useAuth.ts` | Authentication logic |
| `/lib/supabase.ts` | Supabase client & services |
| `/app/auth/signin/page.tsx` | Sign in page |
| `/app/auth/signup/page.tsx` | Sign up page |
| `/app/page.tsx` | Home page with locations |
| `IMPLEMENTATION.md` | Detailed implementation guide |
| `SUPABASE_SCHEMA.sql` | Database schema |

## 🎯 Next Features to Implement

After auth works:
1. User profile page
2. Favorites functionality
3. Review submission and display
4. Location search and filtering
5. Map integration with actual locations

## ✅ Success Criteria

- [ ] Can create account
- [ ] Can verify email
- [ ] Can sign in
- [ ] Can see locations on home
- [ ] Can view location details
- [ ] Can sign out
- [ ] Session persists on refresh

---

**Need help?** Check IMPLEMENTATION.md for detailed guide.
