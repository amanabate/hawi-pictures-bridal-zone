# Hawi Pictures & Bridal Zone - Deployment Guide

## Overview

This guide covers deploying the Hawi Pictures & Bridal Zone application with frontend on Vercel and database on Supabase.

---

## Prerequisites

- [ ] Node.js 18+ or Bun 1.0+ installed
- [ ] Git repository created
- [ ] Supabase account
- [ ] Vercel account (or alternative hosting)
- [ ] Telegram Bot Token (optional, for notifications)

---

## Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and set:
   - **Project Name**: `hawi-pictures-production`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: `eu-central-1` (Frankfurt) or `me-central-1` (Dubai) - closest to Ethiopia
   - **Pricing Plan**: Free tier initially, upgrade as needed

4. Wait 2-3 minutes for project provisioning

### 1.2 Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended for first deployment)**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each migration file from `/backend/supabase/migrations/` in order:
   ```
   001_initial_schema.sql
   002_row_level_security.sql
   003_storage_buckets.sql
   004_functions_and_triggers.sql
   005_seed_data.sql
   ```
3. Run each file one at a time, verifying "Success" message

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (find reference ID in dashboard settings)
supabase link --project-ref your-project-ref

# Run migrations
cd backend/supabase
supabase db push
```

### 1.3 Verify Database Setup

1. Go to **Table Editor** in Supabase Dashboard
2. Confirm tables exist:
   - ✅ `profiles`
   - ✅ `packages` (should have 9 seed packages)
   - ✅ `services`
   - ✅ `bookings`
   - ✅ `payments`
   - ✅ `capacity_rules`
   - ✅ `gallery_items`
   - ✅ `reviews`
   - ✅ `activity_log`
   - ✅ `site_settings`

3. Go to **Storage** → Verify buckets exist:
   - ✅ `payment-screenshots` (Private)
   - ✅ `gallery` (Public)

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ **Keep secret!**)

---

## Phase 2: Telegram Bot Setup (Optional)

### 2.1 Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow prompts to create bot:
   - **Bot Name**: `Hawi Pictures Notifications`
   - **Username**: `hawipictures_bot` (must end with `_bot`)
4. Copy the **Bot Token**: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`

### 2.2 Get Your Chat ID

1. Start a chat with your new bot (click link from BotFather)
2. Send any message to the bot (e.g., "Hello")
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find `"chat":{"id":987654321}` in JSON response
5. Copy your **Chat ID**: `987654321`

---

## Phase 3: Frontend Deployment (Vercel)

### 3.1 Prepare for Deployment

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
bun install
# or: npm install

# Test build locally
bun run build
# or: npm run build

# If build succeeds, you're ready to deploy!
```

### 3.2 Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `bun run build` or `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install` or `npm install`

5. Add Environment Variables (see section 3.3)
6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from repository root
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root directory to "frontend"
# - Confirm settings
```

### 3.3 Environment Variables (Vercel)

Add these in Vercel Dashboard → Project Settings → Environment Variables:

**Frontend Variables** (from `/frontend/.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Backend Variables** (from `/backend/.env.backend.example`):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
DATABASE_URL=postgresql://postgres.your-project:password@...
ADMIN_OWNER_PIN=your-secure-owner-pin
ADMIN_RECEPTIONIST_PIN=your-secure-receptionist-pin
ADMIN_STAFF_PIN=your-secure-staff-pin
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_OWNER_CHAT_ID=987654321
SUPABASE_SCREENSHOTS_BUCKET=payment-screenshots
SUPABASE_GALLERY_BUCKET=gallery
```

⚠️ **Important**: Set ALL variables for **Production**, **Preview**, and **Development** environments

### 3.4 Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://hawi-pictures.vercel.app`)
2. Test key functionality:
   - [ ] Home page loads
   - [ ] Language switching works (EN/OM/AM)
   - [ ] Theme toggle works (light/dark)
   - [ ] Packages page displays 9 packages
   - [ ] Booking form loads
   - [ ] Date availability check works
   - [ ] Admin login works with PIN
   - [ ] PWA manifest loads (`/manifest.json`)

---

## Phase 4: Cron Job Setup (Booking Expiration)

The system needs to run a cron job every 15 minutes to expire pending bookings after 48 hours.

### Option A: Vercel Cron (Recommended)

1. In `frontend/` directory, create `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/expire-bookings",
         "schedule": "*/15 * * * *"
       }
     ]
   }
   ```

2. Deploy to apply cron configuration:
   ```bash
   vercel --prod
   ```

3. Verify cron in Vercel Dashboard → Settings → Cron Jobs

### Option B: External Cron Service (Alternative)

Use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create account
2. Set up job:
   - **URL**: `https://your-domain.vercel.app/api/cron/expire-bookings`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Method**: GET
3. Add authentication header if needed

### Option C: Supabase pg_cron (Database-Level)

1. Enable `pg_cron` extension in Supabase Dashboard → Database → Extensions
2. Run in SQL Editor:
   ```sql
   SELECT cron.schedule(
     'expire-hawi-bookings-every-15-mins',
     '*/15 * * * *',
     $$ SELECT public.check_and_expire_bookings(); $$
   );
   ```

3. Verify schedule:
   ```sql
   SELECT * FROM cron.job;
   ```

---

## Phase 5: Custom Domain Setup (Optional)

### 5.1 Purchase Domain

Purchase domain from registrar like:
- Namecheap
- GoDaddy
- Cloudflare Domains
- Google Domains

Recommended: `hawipictures.et` (Ethiopian domain)

### 5.2 Configure DNS in Vercel

1. Go to Vercel Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `hawipictures.et`)
4. Follow Vercel's instructions to add DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. Wait for DNS propagation (can take 24-48 hours)

### 5.3 Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` in Vercel:
```
NEXT_PUBLIC_APP_URL=https://hawipictures.et
```

---

## Phase 6: Production Testing Checklist

### 6.1 Functional Tests

- [ ] **Public Pages**
  - [ ] Home page loads with all sections
  - [ ] Packages page shows 9 packages with Afaan Oromoo descriptions
  - [ ] Language switching (EN/OM/AM) persists across pages
  - [ ] Theme toggle (light/dark) works and persists
  - [ ] Mobile responsive design works on 375px, 768px, 1440px widths

- [ ] **Booking Flow**
  - [ ] Date availability check shows correct status
  - [ ] Blocked dates cannot be selected
  - [ ] Fully booked dates show "Fully Booked"
  - [ ] Payment screenshot upload works (max 10MB, JPG/PNG/WEBP only)
  - [ ] Form validation catches invalid phone numbers (must be 09xxxxxxxx or 07xxxxxxxx)
  - [ ] Success message displays booking code (e.g., HAWI-0001)
  - [ ] Booking status check page works with code + phone

- [ ] **Admin Dashboard**
  - [ ] Owner PIN login works
  - [ ] Receptionist PIN login works
  - [ ] Staff PIN login works (limited access)
  - [ ] Calendar view shows bookings correctly
  - [ ] Booking status update works (confirm, reject, cancel)
  - [ ] Payment screenshot viewing works (signed URL)
  - [ ] Package management works (create, edit, soft delete, restore)
  - [ ] Gallery management works (upload, hide, delete)
  - [ ] Capacity override works with mandatory reason
  - [ ] Activity log displays all actions

- [ ] **PWA Features**
  - [ ] Manifest loads at `/manifest.json`
  - [ ] Service worker registers (check DevTools → Application → Service Workers)
  - [ ] Install prompt appears on supported browsers
  - [ ] Offline page displays when no internet
  - [ ] App shortcuts work (Admin, Booking, Packages)

- [ ] **Backend/API**
  - [ ] Concurrency test: Two users booking last slot simultaneously (only one succeeds)
  - [ ] Capacity counting works (pending + confirmed = capacity)
  - [ ] 48-hour expiration runs (check cron logs)
  - [ ] Telegram notifications send (if configured)
  - [ ] Duplicate payment reference detection works

### 6.2 Performance Tests

- [ ] Lighthouse score:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100

- [ ] Page load times:
  - Home page: < 2s
  - Booking page: < 3s
  - Admin dashboard: < 3s

- [ ] Image optimization:
  - WebP format served to supported browsers
  - Lazy loading works for below-the-fold images
  - Proper aspect ratios (no layout shift)

### 6.3 Security Tests

- [ ] Admin pages redirect to login when PIN not set
- [ ] API routes reject requests without proper authentication
- [ ] Service role key is NOT exposed in browser DevTools → Network
- [ ] Payment screenshots are NOT directly accessible (require signed URL)
- [ ] SQL injection attempts are blocked (test with `'; DROP TABLE bookings;--`)
- [ ] XSS attempts are sanitized (test with `<script>alert('xss')</script>`)
- [ ] Rate limiting works (test rapid API calls)

---

## Phase 7: Monitoring & Maintenance

### 7.1 Set Up Monitoring

**Vercel Analytics** (Built-in):
1. Go to Vercel Dashboard → Analytics
2. Enable Real Experience Score (RUM)

**Error Tracking** (Optional - Sentry):
```bash
# Install Sentry SDK
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

**Uptime Monitoring** (Optional):
- Use [UptimeRobot](https://uptimerobot.com) (free tier)
- Monitor URL: `https://your-domain.vercel.app`
- Check interval: Every 5 minutes
- Alert via email/SMS on downtime

### 7.2 Database Backups

Supabase provides automatic daily backups on paid plans. For additional safety:

**Manual Backup**:
```bash
# Install PostgreSQL client tools
# Then run:
pg_dump --host=db.your-project.supabase.co \
        --username=postgres \
        --dbname=postgres \
        --file=hawi-backup-$(date +%Y%m%d).sql \
        --clean --if-exists
```

**Automated Backups** (GitHub Actions):
Create `.github/workflows/backup.yml`:
```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup.sql
      - name: Upload to storage
        # Use your preferred storage (AWS S3, Google Cloud Storage, etc.)
```

### 7.3 Regular Maintenance Tasks

**Weekly**:
- [ ] Review activity logs for suspicious activity
- [ ] Check error rates in Vercel Dashboard
- [ ] Verify cron job execution (expire-bookings)
- [ ] Review Telegram notification logs

**Monthly**:
- [ ] Update dependencies: `npm outdated` → `npm update`
- [ ] Review and archive old bookings (6+ months old)
- [ ] Empty trash bin (packages with deleted_at > 30 days)
- [ ] Analyze booking trends and capacity usage

**Quarterly**:
- [ ] Rotate admin PINs
- [ ] Review and update package pricing
- [ ] Audit user roles and permissions
- [ ] Performance audit with Lighthouse

---

## Phase 8: Scaling Considerations

### When to Upgrade Supabase Plan

**Free Tier Limits**:
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**Upgrade Triggers**:
- Database approaching 400MB (80% capacity)
- Consistent API response times > 2s
- File storage approaching 800MB
- Need for automatic backups

### When to Upgrade Vercel Plan

**Hobby Plan Limits**:
- 100GB bandwidth/month
- 6,000 build minutes/month
- No commercial usage

**Upgrade Triggers**:
- Monthly bandwidth > 80GB
- Need for team collaboration
- Commercial usage (accepting payments)
- Need for advanced analytics

### Optimization Tips

1. **Database**:
   - Add indexes on frequently queried columns (`booking_date`, `status`)
   - Archive old bookings to separate table after 1 year
   - Use database connection pooling (Supabase Pooler)

2. **Frontend**:
   - Enable Vercel Edge Network (CDN)
   - Use `next/image` for all images
   - Implement ISR (Incremental Static Regeneration) for packages page

3. **Caching**:
   - Cache package data (revalidate every hour)
   - Cache gallery items (revalidate on upload)
   - Use SWR for client-side data fetching

---

## Rollback Procedure

If deployment fails or introduces critical bugs:

### 1. Immediate Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or via Vercel Dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### 2. Database Rollback (Supabase)

⚠️ **Last resort only** - will lose recent data!

```sql
-- Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

### 3. Notify Users

If rollback is required:
1. Post status update on social media
2. Display maintenance banner on site
3. Send Telegram message to active users (if applicable)

---

## Support Contacts

### Technical Issues
- **Supabase Support**: [support.supabase.com](https://support.supabase.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

### Documentation
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

**Deployment Checklist Version**: 1.0
**Last Updated**: November 2, 2026
**Next Review**: February 2, 2027
