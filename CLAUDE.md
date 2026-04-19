# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Discover Udupi** is a Next.js 15 web application for discovering and exploring local attractions in Udupi, India. It features user authentication via Supabase, location browsing with maps, reviews, favorites management, and PWA support.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript 5
- **Auth**: Supabase Auth (email/password)
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Styling**: Tailwind CSS 4 with PostCSS
- **Maps**: Leaflet + react-leaflet (OpenStreetMap) + Google Maps API
- **UI Components**: lucide-react icons, Framer Motion animations, Headless UI
- **Build Tool**: Next.js with Turbopack enabled
- **Linting**: ESLint (flat config with Next.js rules)

### Directory Structure

```
/app                      # Next.js App Router pages
  /auth                   # Auth pages (signin/signup, with callback route)
  /page.tsx               # Home page with locations, map, reviews
  /layout.tsx             # Root layout with error boundary, PWA setup
  /globals.css            # Global styles and Tailwind directives

/components               # Reusable React components
  /LeafletMap.tsx         # Leaflet map with markers
  /MapModal.tsx           # Modal view for browsing locations on map
  /ImageGallery.tsx       # Image gallery with carousel
  /ReviewSystem.tsx       # Review submission and display
  /LocationCard.tsx       # Location preview card
  /ErrorBoundary.tsx      # Error handling component
  /PWAInstallPrompt.tsx   # PWA installation prompt
  /OfflineIndicator.tsx   # Network status indicator
  /ServiceWorkerRegistration.tsx

/lib                      # Utility libraries and services
  /supabase.ts            # Supabase client, locationService, reviewService, profileService

/hooks                    # Custom React hooks
  /useAuth.ts             # Authentication context with signIn/signUp/signOut/updateProfile

/types                    # TypeScript type definitions
  /database.ts            # Supabase database schema (generated types)
  /Location.ts            # Location domain types
  /maps.ts                # Map-related types

/data                     # Static data
  /locations.ts           # Seed locations array with categories

/utils                    # Utility functions
  /maps.ts                # getDirectionsUrl() for native map apps
  /locationUtils.ts       # Coordinate validation utilities
  /image.ts               # Image processing utilities

/public                   # Static assets
  /manifest.json          # PWA manifest
  /icon-*.png             # PWA icons (72x72 to 512x512)
  /images/locations/      # Location images
```

### Key Data Flow

1. **Authentication**: `useAuth` hook manages auth state via Supabase, syncs with session on mount, listens for auth state changes
2. **Locations**: Loaded from `/data/locations.ts` (seed data) and Supabase `location_details` view
3. **Reviews**: Submitted to Supabase `reviews` table, fetched with user profile relations
4. **Favorites**: Toggle in Supabase `favorites` table, synced across sessions
5. **Maps**: Leaflet for OSM tiles, Google Maps API for directions

### Database Schema

Key tables (see `SUPABASE_SCHEMA.sql`):
- `profiles` - User data (auth synced)
- `locations` - Place information
- `reviews` - User reviews with ratings
- `favorites` - User favorites (user_id + location_id unique constraint)
- `location_images` - Location images with metadata
- `categories` - Location categories

Views:
- `location_details` - Joined locations with category and image data

Functions (RPC):
- `get_nearby_locations(user_lat, user_lng, radius_km)` - Distance-based search

RLS is enabled on all user-related tables; locations are publicly readable.

## Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Create production build
npm start            # Run production server
npm run lint         # Run ESLint (Next.js + TypeScript rules)
```

### Setup
1. Create Supabase project at supabase.com
2. Run `SUPABASE_SCHEMA.sql` in SQL editor to create tables
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` - Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

## Configuration Files

- **next.config.ts**: Turbopack enabled, image remote patterns (Unsplash, Google, GitHub), webpack fallback for `fs`
- **tsconfig.json**: ES2017 target, strict mode, `@/*` path alias
- **tailwind.config**: Uses Tailwind CSS v4 with PostCSS plugin
- **eslint.config.mjs**: Flat config extending Next.js core-web-vitals + TypeScript
- **postcss.config.mjs**: Tailwind CSS PostCSS plugin

## Common Development Scenarios

### Adding a New Location
Add to `/data/locations.ts` with required fields: id, name, category, image, description, rating, lat/lng, address. Categories: temples, beaches, food, photography.

### Creating a New Auth Page
Place `.tsx` files in `/app/auth/`. Use `useAuth()` hook from `/hooks/useAuth.ts` for auth operations. Wrap forms with error handling via toast notifications.

### Adding a Feature with Database
1. Create/update table in Supabase
2. Update `/types/database.ts` with generated types (use Supabase CLI or manual)
3. Add service functions to `/lib/supabase.ts` (locationService, reviewService, profileService pattern)
4. Use `supabase` client in components with error handling and toast feedback

### Debugging Auth Issues
- Check `.env.local` has all 4 variables
- Monitor `useAuth` hook state: `user`, `profile`, `session`, `loading`, `initialized`
- Supabase auth state listener logs to console on auth changes
- Profile auto-creation happens on first sign-in (matches auth user)

### Maps Integration
- Leaflet map available in `LeafletMap.tsx` (uses OpenStreetMap tiles)
- Google Maps for directions via `getDirectionsUrl()` utility
- Mobile apps open native maps (Apple Maps on iOS, Google Maps on Android)

### PWA Features
- Manifest at `/public/manifest.json` with icons and metadata
- Service worker registration in `ServiceWorkerRegistration.tsx`
- Install prompt managed by `PWAInstallPrompt.tsx`
- Works offline for static content, shows `OfflineIndicator.tsx` when disconnected

## State Management Pattern

- **Auth/Profile**: Centralized in `useAuth()` hook with Supabase listener
- **Component State**: React hooks (useState, useEffect) for UI state
- **Server Data**: Fetched from Supabase on demand, no global cache (consider adding React Query for caching if needed)
- **Notifications**: react-hot-toast for user feedback (success, error, loading)

## Key Dependencies & Versions

- `next@15.5.4` - Framework with Turbopack
- `react@19.2.0` - UI library
- `@supabase/supabase-js@2.57.0` - Database + Auth
- `@supabase/auth-helpers-nextjs@0.10.0` - Auth helpers
- `tailwindcss@4` - Styling
- `framer-motion@12.23.12` - Animations
- `lucide-react@0.542.0` - Icons
- `react-leaflet@5.0.0` - Map component
- `react-hot-toast@2.6.0` - Notifications
- `@googlemaps/js-api-loader@1.16.10` - Google Maps

## Important Notes

- **Image Remote Patterns**: Only Unsplash, Google user content, and GitHub avatars allowed. Update `next.config.ts` for new sources.
- **Webpack Config**: `fs` module fallback set to false (not needed for browser code).
- **TypeScript Strict Mode**: Enabled; all types must be explicit.
- **Path Alias**: `@/*` maps to repository root.
- **Turbopack**: Enabled for faster dev builds; some tools may have compatibility issues.
- **RLS Security**: All user data queries respect RLS policies; ensure auth context is available.
- **Mobile Directions**: Uses platform-specific URL schemes; test on both iOS and Android.

## Documentation

- `QUICKSTART.md` - Setup instructions for new developers
- `IMPLEMENTATION.md` - Detailed implementation phases and next steps
- `/docs/` - Additional guides (image guidelines, production setup, adding locations)
