# Discover Udupi Setup Checklist

## ✅ **Immediate Actions Required**

### 1. **Create Supabase Project** (5 minutes)
1. Go to [supabase.com](https://supabase.com) 
2. Create new project
3. Wait for setup to complete
4. Go to Settings → API
5. Copy these values to `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. **Setup Database** (10 minutes)
1. In Supabase dashboard, go to SQL Editor
2. Copy-paste the database schema code I provided earlier
3. Run the SQL commands
4. Verify tables are created in Table Editor

### 3. **Get Google Maps API Key** (10 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. **Fix Component Imports**
Update your `app/page.tsx` to import components properly:

```typescript
// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import DiscoverUdupi from '@/components/DiscoverUdupi'; // Your main component

export default function Home() {
  const { loading, initialized } = useAuth();
  
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Loading Discover Udupi...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <DiscoverUdupi />
      <Toaster position="top-right" />
    </>
  );
}
```

### 5. **Update Layout for PWA**
Update your `app/layout.tsx`:

```typescript
// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Discover Udupi - Your Local Guide',
  description: 'Explore the soul of Udupi with authentic local insights',
  manifest: '/manifest.json',
  themeColor: '#667eea',
  icons: {
    apple: '/icon-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Discover Udupi',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

## 🚀 **Testing Steps**

### Local Testing:
```bash
npm run dev
# Visit http://localhost:3000
```

### Check These Features:
- [ ] App loads without errors
- [ ] Categories filter works
- [ ] Location cards display
- [ ] Modal opens for location details
- [ ] Search functionality works
- [ ] PWA install prompt appears (mobile/Chrome)

## 📱 **Icon Generation for PWA**

Use this free tool to generate all icon sizes:
1. Go to [favicon.io](https://favicon.io/favicon-converter/)
2. Upload a 512x512 image of your logo
3. Download and place in `/public/` folder

## 🎯 **Next Priority Features**

Once basic setup works:

### Week 1:
- [ ] Google Maps integration 
- [ ] Image galleries
- [ ] User authentication
- [ ] Review system

### Week 2:
- [ ] Admin panel
- [ ] Content management
- [ ] Push notifications
- [ ] Offline functionality

## 🔧 **Common Issues & Fixes**

### "Module not found" errors:
```bash
npm install --save-dev @types/google.maps
```

### Supabase connection issues:
- Check `.env.local` values
- Verify project URL format
- Ensure no trailing slashes

### Build errors:
```bash
npm run build
# Fix any TypeScript errors before deploying
```

## 📈 **Performance Monitoring**

Add to `.env.local` for analytics:
```
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_id
```

## 🌐 **Domain Setup (When Ready)**

1. Buy domain (recommend Namecheap/GoDaddy)
2. Update Vercel project settings
3. Add custom domain
4. Update environment variables
5. Set up email forwarding

---

## 🎯 **Success Metrics to Track**

- [ ] Page load speed < 3 seconds
- [ ] Mobile-friendly (test on phone)
- [ ] PWA installable
- [ ] Database queries working
- [ ] Authentication flows working
- [ ] Maps loading properly 