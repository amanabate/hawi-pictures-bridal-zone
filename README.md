# Hawi Pictures & Bridal Zone - Backend Architecture & Integration Guide
**Wedding Photography, Bridal Salon & Aadaa Cultural Wear (Addis Ababa, Ethiopia)**

---

## 1. Executive Summary

This document describes the complete production-grade backend for **Hawi Pictures & Bridal Zone**, integrating PostgreSQL via Supabase, Row Level Security (RLS), atomic concurrency-locked booking creation, dual storage buckets (private receipts & public gallery), role-based administration (Owner, Receptionist, Staff), Telegram notification tracking, and automated 15-minute hold expiration.

The existing frontend design, light/dark themes, trilingual support (**Afaan Oromoo (OM)**, **English (EN)**, **Amharic (AM)**), and Progressive Web App (PWA) offline capabilities are fully preserved.

---

## 2. Database Architecture (PostgreSQL / Supabase)

### 2.1 Table Schemas & Relations
1. **`profiles`**: User profiles linked to `auth.users(id)` with roles: `owner`, `receptionist`, `staff`, `client`.
2. **`packages`**: The 9 real flyer packages with complete Afaan Oromoo flyer item lists, codes (`PKG-SPECIAL`, `PKG-01` to `PKG-08`), pricing in Ethiopian Birr (ETB), deposit rules, badges (`special`, `popular`), sort order, and soft-delete (`deleted_at`) with 30-day restore.
3. **`services`**: Photography (Studio and 4K Video), Bridal, Beauty, Makeup, and Aadaa (Traditional).
4. **`gallery_items`**: Portfolio media by category (`wedding`, `bridal`, `makeup`, `traditional`, `studio`), type (`image`, `video_link`), captions in 3 languages, and soft-delete.
5. **`bookings`**: Customer bookings with unique sequence-generated code (`HAWI-0001`), customer phone (Ethiopian `09xxxxxxxx`), optional Telegram handle, snapshot of package details at booking time, date, period (`morning`, `afternoon`, `evening`, `full_day`), venue, hold expiration (`hold_expires_at = now() + 48 hours`), assigned staff, and notification logs.
6. **`payments`**: Transaction records linked to bookings, amount, payment method (`telebirr`, `cbe`, `abyssinia`, `dashen`, `cash`), reference number, private screenshot storage path, and duplicate reference number detection flag (`is_duplicate_ref`).
7. **`capacity_rules`**: Base studio daily limits (`default_per_day: 4`, `default_per_period: 2`) and day-of-week limits (`per_weekday` where Fri=5, Sat=6).
8. **`capacity_overrides`**: Date-specific capacity overrides (`max_per_day`, `max_per_period`, `note`).
9. **`blocked_dates`**: Studio maintenance or holiday blocks (`date`, `reason`).
10. **`waitlist`**: Priority waitlist submissions when desired dates are at full capacity.
11. **`reviews`**: Customer ratings (1-5) and testimonials with moderation (`pending`, `approved`, `hidden`).
12. **`site_settings`**: Studio phone numbers (`0988018016`, `0914878007`), social links, bank and Telebirr account numbers, cancellation policy, Telegram templates, and Hubachiisa notice.
13. **`activity_log`**: Strictly **insert-only** immutable audit log (`id`, `actor_name`, `action`, `entity`, `entity_id`, `before`, `after`, `created_at`). Updates and deletes are permanently forbidden via triggers.

### 2.2 Migrations Directory Structure
All ordered SQL migration files are located in `/supabase/migrations/`:
- `001_initial_schema.sql` - Core tables, enums, sequences, indexes, and updated_at triggers.
- `002_row_level_security.sql` - Comprehensive RLS policies and immutable log trigger.
- `003_storage_buckets.sql` - Storage bucket definitions and object policies.
- `004_functions_and_triggers.sql` - `get_availability()`, `create_booking_atomic()`, `check_and_expire_bookings()`.
- `005_seed_data.sql` - Real flyer package prices, flyer notice, services, contacts, and bank accounts.
- `seed.sql` - Master reset seed file for Supabase CLI.

---

## 3. Security & Storage (Row Level Security)

### 3.1 Role Hierarchy & Permissions
- **Public**:
  - Read-only access to active packages, visible services, visible gallery items, approved reviews, and public settings.
  - No direct write access to bookings or payments tables. All submissions route through server API handlers.
- **Client**:
  - Read access to their own bookings via authenticated profile phone matching.
- **Staff**:
  - Read access only to bookings assigned to them.
- **Receptionist**:
  - Manage bookings, calendar, gallery, reviews, waitlist, and edit package content.
  - Cannot delete packages, alter package prices, change staff roles, or override capacity.
- **Owner**:
  - Full administrative access: pricing, capacity overrides with mandatory reason, staff assignments, activity logs.

### 3.2 Storage Buckets
- **`payment-screenshots` (Private)**:
  - Accessible only by Owner and Receptionist via short-lived signed URLs (15 minutes).
  - Maximum size: 10MB.
  - Validated by content magic bytes (JPG, PNG, WEBP).
- **`gallery` (Public)**:
  - Public read access for portfolio images.
  - Upload and deletion restricted to Owner and Receptionist.

---

## 4. API Endpoints Inventory

| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Atomic booking creation with concurrency lock & file check | Public (Rate-limited) |
| `GET` | `/api/bookings/check` | Check status by `code` AND `phone` | Public |
| `GET` | `/api/availability` | Monthly date & period availability (`?month=YYYY-MM`) | Public |
| `GET` | `/api/packages` | List active, non-deleted packages | Public |
| `GET` | `/api/services` | List visible services | Public |
| `GET` | `/api/gallery` | List visible gallery items (`?category=...`) | Public |
| `GET` | `/api/reviews` | List approved customer reviews | Public |
| `POST` | `/api/reviews` | Submit a customer review (status: pending) | Public |
| `POST` | `/api/waitlist` | Join priority waitlist for full dates | Public |
| `GET` | `/api/settings/public` | Public contacts, accounts, and flyer notice | Public |
| `POST` | `/api/admin/auth` | Verify admin PIN & session role | Staff / Admin |
| `GET` | `/api/admin/bookings` | Filtered, searchable, paginated bookings list | Staff / Admin |
| `POST` | `/api/admin/bookings` | Manual booking creation with optional owner override | Receptionist / Owner |
| `PATCH`| `/api/admin/bookings/[id]` | Status updates (confirm, reject, cancel, balance, staff) | Receptionist / Owner |
| `GET` | `/api/admin/bookings/[id]/screenshot` | Generate short-lived signed URL for payment receipt | Receptionist / Owner |
| `GET` | `/api/admin/packages` | List all packages (including drafts/trash) | Staff / Admin |
| `POST` | `/api/admin/packages` | Create new package | Owner |
| `PATCH`| `/api/admin/packages/[id]` | Update, duplicate, or restore package | Receptionist / Owner |
| `DELETE`| `/api/admin/packages/[id]` | Soft delete (blocked if package has bookings) | Owner |
| `GET` | `/api/admin/gallery` | List all gallery items | Staff / Admin |
| `POST` | `/api/admin/gallery` | Upload new photo or video link | Receptionist / Owner |
| `PATCH`| `/api/admin/gallery` | Bulk hide, show, delete, move, or reorder gallery items | Receptionist / Owner |
| `GET` | `/api/admin/capacity` | Get capacity rules, overrides, and blocked dates | Staff / Admin |
| `POST` | `/api/admin/capacity` | Update rules, set overrides, or block dates | Owner |
| `GET` | `/api/admin/reports` | Summary reports or downloadable Excel/CSV (`?export=excel`) | Receptionist / Owner |
| `GET` | `/api/admin/activity-log` | View immutable audit logs | Receptionist / Owner |
| `GET/POST`| `/api/cron/expire-bookings` | 15-minute cron for 24h reminders & 48h expiration | System / Cron |
| `GET` | `/api/admin/tests` | Execute automated backend test suite | Admin |

---

## 5. Automated Verification Tests

Automated backend unit and integration tests are located in `/tests/backend.test.ts`. Run them via API at:
`GET /api/admin/tests`

The test suite validates:
1. **Concurrency lock**: Two customers attempting to book the final slot simultaneously (one succeeds, the other receives `DATE_UNAVAILABLE`).
2. **Capacity counting by status**: Verifies `pending` and `confirmed` bookings count towards daily limits; `rejected`, `cancelled`, and `expired` do not.
3. **Blocked date enforcement**: Blocks booking attempts on studio maintenance dates.
4. **Owner capacity override**: Requires mandatory reason and logs to immutable activity log.
5. **Duplicate reference number detection**: Flags duplicate transaction numbers.
6. **File validation**: Validates magic bytes (JPG, PNG, WEBP) and 10MB size limit.
7. **Status check authorization**: Proves wrong phone number rejects access.
8. **Role permission boundaries**: Enforces that Receptionist cannot delete packages or change prices.
9. **48-hour expiration cron**: Verifies pending reservations past 48 hours are transitioned to `expired`, date capacity is freed, and booking is flagged as "not notified".

---

## 6. Supabase Deployment & Setup Guide

### Step 1: Create Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Select your closest region (e.g. `eu-central-1` Frankfurt or `me-central-1` Dubai).

### Step 2: Apply SQL Migrations
In the Supabase Dashboard, open the **SQL Editor** and run the migration files in numerical order:
1. Copy & run `supabase/migrations/001_initial_schema.sql`
2. Copy & run `supabase/migrations/002_row_level_security.sql`
3. Copy & run `supabase/migrations/003_storage_buckets.sql`
4. Copy & run `supabase/migrations/004_functions_and_triggers.sql`
5. Copy & run `supabase/migrations/005_seed_data.sql`

Alternatively, using the Supabase CLI:
```bash
supabase db push
# or
supabase db reset
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local` and provide your project keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Schedule the 15-Minute Expiry Cron
In Supabase Dashboard -> **Database** -> **Extensions**, enable `pg_cron`.
Then run:
```sql
SELECT cron.schedule(
  'expire-hawi-bookings-every-15-mins',
  '*/15 * * * *',
  $$ SELECT public.check_and_expire_bookings(); $$
);
```
Alternatively, configure a webhook in Vercel Cron or GitHub Actions calling `POST /api/cron/expire-bookings`.

---

## 7. Go-Live Checklist & Human Decisions Required

| Item | Status | Action Required |
| :--- | :--- | :--- |
| Database Schema & RLS | **Completed** | Run migrations on target Supabase instance. |
| Real Flyer Seed Packages | **Completed** | Flyer packages 1ffaa to 8ffaa and Special Package seeded. |
| Deposit Values | **Decision Needed** | Deposit amounts were left empty as requested; owner can set either fixed Birr or percentage per package in Admin -> Packages. |
| Telegram Bot Token | **Decision Needed** | Register bot with `@BotFather` on Telegram and set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OWNER_CHAT_ID` in `.env.local`. |
| Admin PINs | **Ready** | Default PINs are configured (`hawi2026`, `reception123`, `staff123`). Change to custom private PINs in production. |
| Telebirr & Bank Accounts | **Configured** | Populated with real studio contact (`0988018016`) and placeholder bank accounts. Update in Admin -> Settings if bank accounts change. |
# hawi-pictures-bridal-zone
