# Hawi Pictures & Bridal Zone - Architecture Overview

## Project Structure

This is a **frontend-backend separated** Next.js wedding photography and bridal salon booking system with the following structure:

```
/
├── frontend/          # Next.js application (pages, components, client code)
├── backend/           # Supabase database configuration and server utilities
├── docs/              # Project documentation
├── shared/            # Shared TypeScript types between frontend and backend
└── .kiro/             # Kiro AI agent configuration
```

## Frontend Architecture (`/frontend/`)

### Technology Stack
- **Framework**: Next.js 15.4.9 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.11
- **UI Library**: Lucide React icons, Motion for animations
- **State Management**: React hooks with external sync stores
- **Package Manager**: Bun

### Folder Organization

#### `/frontend/app/` - Next.js App Router
- **Route Groups**:
  - `(public)/` - Public-facing pages (home, booking, packages, offline)
  - `(admin)/` - Admin dashboard protected by PIN authentication
- **API Routes**:
  - `api/public/` - Public endpoints (no auth): availability, bookings, packages, services, gallery, reviews, waitlist, settings
  - `api/admin/` - Admin endpoints (PIN auth): auth, bookings management, packages CRUD, gallery management, capacity, reports, activity log, tests
  - `api/cron/` - System cron jobs: expire-bookings (48-hour hold expiration)

#### `/frontend/components/` - React Components
- **`layout/`** - Shared layout components
  - `Navbar.tsx` - Navigation with language switcher and theme toggle
  - `Footer.tsx` - Footer with contact info and social links
  - `MobileCallBar.tsx` - Mobile call-to-action bar
  - `ThemeToggle.tsx` - Light/dark theme switcher
  - `LanguageSwitcher.tsx` - EN/OM/AM language selector

- **`features/`** - Feature-specific components organized by domain
  - `home/` - Homepage sections (Hero, Services, Gallery, About, Packages, Testimonials, Contact)
  - `booking/` - Booking form with payment proof upload
  - `packages/` - Package listing and display
  - `admin/` - Admin dashboard (Calendar, Packages Manager, Gallery Manager, Capacity Manager, Activity Log)
  - `pwa/` - Progressive Web App components (Install prompt, Offline banner, Update toast, Standalone header)

- **`ui/`** - Reusable UI primitives (reserved for future design system)

#### `/frontend/lib/` - Utilities and Helpers
- **`hooks/`** - Custom React hooks
  - `use-theme.ts` - Theme management (light/dark)
  - `use-mobile.ts` - Mobile viewport detection
  - `use-pwa.ts` - PWA installation and offline status
  - `use-mounted.ts` - Client-side mount detection

- **`context/`** - React Context providers
  - `language-context.tsx` - Multi-language state (EN/OM/AM) with translation helpers

- **`i18n/`** - Internationalization utilities
  - `i18n.ts` - Translation functions (translate, formatCurrency, formatDate)
  - `i18n-check.ts` - Translation completeness validation

- **`stores/`** - Client-side state management
  - `data-store.ts` - Packages state with soft-delete and trash management
  - `capacity-store.ts` - Booking capacity calculation and date availability
  - `storage.ts` - LocalStorage persistence for bookings

- `utils.ts` - Generic utility functions (cn for className merging, etc.)

#### `/frontend/locales/` - Translation Files
- `en.ts` - English translations
- `om.ts` - Afaan Oromoo (Oromo) translations
- `am.ts` - Amharic translations
- `types.ts` - Translation schema types
- `index.ts` - Locale exports

#### `/frontend/constants/` - Static Data
- `packages.ts` - Real flyer package definitions with Afaan Oromoo item lists
- `services.ts` - Studio services (Photography, Bridal, Beauty, Makeup, Aadaa)
- `gallery.ts` - Portfolio gallery data
- `about.ts` - Studio information and contact details

#### `/frontend/public/` - Static Assets
- `icons/` - PWA icons, Apple touch icons, shortcuts, screenshots
- `images/` - Wedding and bridal photos
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline functionality
- `placeholder-offline.png/svg` - Offline fallback images

#### `/frontend/scripts/` - Build and Utility Scripts
- `generate-pwa-icons.js` - PWA icon generation script

## Backend Architecture (`/backend/`)

### Technology Stack
- **Database**: PostgreSQL via Supabase
- **Auth**: Row Level Security (RLS) with role-based access (owner, receptionist, staff, client)
- **Storage**: Supabase Storage (private payment screenshots + public gallery)
- **Functions**: PostgreSQL functions and triggers for atomic operations

### Folder Organization

#### `/backend/supabase/` - Database Configuration
- **`migrations/`** - Ordered SQL migration files
  - `001_initial_schema.sql` - Core tables, enums, sequences, indexes
  - `002_row_level_security.sql` - RLS policies and immutable audit log trigger
  - `003_storage_buckets.sql` - Storage bucket definitions and policies
  - `004_functions_and_triggers.sql` - Database functions (`get_availability`, `create_booking_atomic`, `check_and_expire_bookings`)
  - `005_seed_data.sql` - Real flyer packages and studio configuration

- `seed.sql` - Master seed file for Supabase CLI (`supabase db reset`)

#### `/backend/lib/supabase/` - Database Operations
- `client.ts` - Browser Supabase client (uses NEXT_PUBLIC_SUPABASE_ANON_KEY)
- `server.ts` - Server-side Supabase client (uses SUPABASE_SERVICE_ROLE_KEY)
- `db.ts` - Database operations wrapper with in-memory fallback store
- `types.ts` - TypeScript types for all database tables and enums

#### `/backend/lib/validation/` - Input Validation
- Reserved for Zod schemas or other validation logic

#### `/backend/lib/utils/` - Backend Utilities
- Reserved for rate limiting, logging, Telegram notification helpers

#### `/backend/tests/` - Integration Tests
- `backend.test.ts` - Comprehensive test suite (9 tests covering concurrency, capacity, RLS, expiration, file validation)

#### `/backend/scripts/` - Database Scripts
- `migrate.sh` - Run migrations (to be created)
- `seed.sh` - Seed database (to be created)

## Data Flow

### Public Booking Flow
1. User visits `/booking` page
2. `BookingForm` component checks date availability via `GET /api/public/availability`
3. User fills form, uploads payment screenshot
4. Form submits to `POST /api/public/bookings`
5. API route calls `backend/lib/supabase/db.ts` → `createBookingAtomic()`
6. PostgreSQL function uses row-level lock to prevent double-booking
7. Payment screenshot uploaded to private `payment-screenshots` bucket
8. Booking created with status `pending` and 48-hour hold expiration
9. Telegram notification sent to studio owner (server-side)

### Admin Management Flow
1. Admin visits `/admin` and enters PIN
2. `POST /api/admin/auth` validates PIN against environment variables
3. Admin views calendar with bookings fetched from `GET /api/admin/bookings`
4. Admin updates booking status via `PATCH /api/admin/bookings/[id]`
5. All actions logged to immutable `activity_log` table

### Cron Job Flow
1. Vercel Cron or external scheduler calls `GET /api/cron/expire-bookings` every 15 minutes
2. API route calls `check_and_expire_bookings()` PostgreSQL function
3. Function identifies bookings with `hold_expires_at < now()` and status `pending`
4. Updates status to `expired`, frees date capacity
5. Sends 24-hour reminder Telegram notifications

## Security Architecture

### Environment Variable Separation
- **Frontend** (`.env.example`): Only `NEXT_PUBLIC_*` keys (safe for browser)
- **Backend** (`.env.backend.example`): Server-side secrets (service role key, admin PINs, Telegram tokens)

### Row Level Security (RLS)
- **Public**: Read-only access to active packages, visible services, visible gallery items, approved reviews
- **Client**: Read access to their own bookings (phone number match)
- **Staff**: Read access to bookings assigned to them
- **Receptionist**: Manage bookings, calendar, gallery, reviews; cannot delete packages or change prices
- **Owner**: Full administrative access including pricing, capacity overrides, staff assignments

### Storage Security
- **`payment-screenshots` bucket**: Private, accessible only by Owner and Receptionist via short-lived signed URLs (15 minutes)
- **`gallery` bucket**: Public read, upload/delete restricted to Owner and Receptionist

## Import Path Conventions

### TypeScript Path Aliases (`tsconfig.json`)
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./*"],
    "@/backend/*": ["../backend/*"]
  }
}
```

### Usage Examples
```tsx
// Frontend components
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/features/home/HeroSection';

// Frontend utilities
import { useLanguage } from '@/lib/context/language-context';
import { useTheme } from '@/lib/hooks/use-theme';

// Constants
import { PACKAGES_DATA } from '@/constants/packages';

// Backend (from API routes only)
import { createBookingAtomic } from '@/backend/lib/supabase/db';
import { BookingRow } from '@/backend/lib/supabase/types';
```

## Progressive Web App (PWA)

### Features
- **Offline Support**: Service worker caches pages and assets
- **Installable**: Prompts users to add to home screen
- **Shortcuts**: Quick access to admin, booking, and packages pages
- **Standalone Mode**: Custom header when running as installed app

### Service Worker Strategy
- Cache-first for static assets (images, icons, CSS)
- Network-first for API calls
- Offline fallback page for navigation

## Multilingual Support

### Languages
1. **English (EN)** - Primary language
2. **Afaan Oromoo (OM)** - Ethiopian Oromo language (used in flyer package descriptions)
3. **Amharic (AM)** - Ethiopian Amharic language

### Implementation
- All UI strings in `/frontend/locales/` files
- Context provider wraps entire app
- Helper functions: `t()` for translation, `formatCurrency()` for ETB formatting, `formatDate()` for locale-aware dates

## Deployment

### Frontend Deployment (Vercel Recommended)
1. Set root directory to `/frontend/`
2. Set environment variables from `/frontend/.env.example`
3. Build command: `bun run build` or `npm run build`
4. Output: Standalone Next.js app

### Backend Deployment (Supabase)
1. Create Supabase project
2. Run migrations from `/backend/supabase/migrations/` in order
3. Set environment variables from `/backend/.env.backend.example`
4. Configure Vercel Cron or pg_cron for `expire-bookings` job (every 15 minutes)

## Performance Optimizations

- **Image Optimization**: Next.js Image component for automatic WebP conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting via App Router
- **Lazy Loading**: React Suspense for booking form and packages list
- **Optimistic Updates**: Immediate UI feedback for admin actions
- **Memoization**: React.memo for expensive components (calendar grid, package cards)

## Accessibility

- **Semantic HTML**: Proper heading hierarchy, landmark regions
- **Keyboard Navigation**: All interactive elements keyboard-accessible
- **Screen Reader Support**: ARIA labels for icons and actions
- **Color Contrast**: WCAG AA compliant in light and dark themes
- **Focus Indicators**: Visible focus rings for keyboard users

## Testing Strategy

- **Backend Integration Tests**: `/backend/tests/backend.test.ts` (9 tests)
- **API Endpoint Tests**: Accessible via `GET /api/admin/tests` (requires admin auth)
- **Manual Testing**: E2E user flows (booking creation, admin management, offline mode)

## Future Enhancements

- [ ] Add frontend component unit tests (Vitest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Implement backend input validation with Zod
- [ ] Add rate limiting middleware
- [ ] Implement structured logging
- [ ] Add performance monitoring (Vercel Analytics)
- [ ] Add error tracking (Sentry)
- [ ] Create API documentation with OpenAPI/Swagger

---

**Last Updated**: November 2, 2026
**Architecture Version**: 1.0 (Post-Restructure)
