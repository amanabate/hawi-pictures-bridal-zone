# Hawi Pictures & Bridal Zone - Coding Standards

## File and Folder Naming

### Files
- **React Components**: PascalCase (e.g., `Navbar.tsx`, `BookingForm.tsx`)
- **Utilities/Hooks**: kebab-case (e.g., `use-theme.ts`, `i18n-check.ts`)
- **Constants**: kebab-case (e.g., `packages.ts`, `services.ts`)
- **Scripts**: kebab-case (e.g., `generate-pwa-icons.js`, `migrate.sh`)
- **Tests**: kebab-case with `.test.ts` suffix (e.g., `backend.test.ts`)

### Folders
- Always kebab-case (e.g., `frontend/lib/hooks/`, `backend/supabase/migrations/`)
- Route groups in Next.js use parentheses: `(public)`, `(admin)`

## TypeScript Conventions

### Naming
- **Interfaces/Types**: PascalCase (e.g., `BookingRow`, `LanguageCode`)
- **Enums**: PascalCase keys (e.g., `BookingStatus`, `UserRole`)
- **Variables**: camelCase (e.g., `customerPhone`, `packageData`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `DEFAULT_LANGUAGE`, `CONTACT_PHONES`)
- **Functions**: camelCase (e.g., `formatCurrency`, `getAvailability`)

### Type Safety
```tsx
// ✅ Good - Explicit types
interface BookingFormData {
  customerName: string;
  phone: string;
  date: string;
  packageId: string;
}

function createBooking(data: BookingFormData): Promise<BookingRow> {
  // ...
}

// ❌ Bad - Any types
function createBooking(data: any): any {
  // ...
}
```

### Import Organization
```tsx
// 1. React/Next.js imports
import React, { useState } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { Calendar, Phone } from 'lucide-react';

// 3. Internal imports (path alias)
import { useLanguage } from '@/lib/context/language-context';
import { PACKAGES_DATA } from '@/constants/packages';

// 4. Backend imports (API routes only)
import { createBookingAtomic } from '@/backend/lib/supabase/db';

// 5. Types
import type { BookingRow, PackageRow } from '@/backend/lib/supabase/types';
```

## React Component Standards

### Component Structure
```tsx
'use client'; // Only if needed (client components)

import React from 'react';
// imports...

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export default function ComponentName({ title, onClick }: ComponentProps) {
  // 1. Hooks first
  const [state, setState] = useState<string>('');
  const { t } = useLanguage();

  // 2. Derived state
  const displayTitle = title.toUpperCase();

  // 3. Event handlers
  function handleClick() {
    onClick?.();
  }

  // 4. Effects
  React.useEffect(() => {
    // ...
  }, []);

  // 5. Early returns
  if (!title) return null;

  // 6. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Component Exports
- **Default export** for page components and main feature components
- **Named exports** for reusable utilities and helper components

## Styling with Tailwind CSS

### Class Name Organization
```tsx
// ✅ Good - Logical grouping
<div className="
  flex items-center justify-between gap-4
  rounded-lg border border-gray-200
  bg-white p-4 shadow-sm
  hover:shadow-md transition-shadow
  dark:bg-gray-800 dark:border-gray-700
">

// ❌ Bad - Random order
<div className="p-4 hover:shadow-md flex dark:bg-gray-800 shadow-sm border-gray-200 rounded-lg">
```

### Order of Classes
1. Layout (flex, grid, position)
2. Spacing (padding, margin, gap)
3. Sizing (width, height)
4. Typography (font, text color, text size)
5. Borders (border, rounded)
6. Background (bg)
7. Effects (shadow, opacity, transform)
8. Transitions
9. Dark mode variants

### cn() Utility Usage
```tsx
import { cn } from '@/lib/utils';

// ✅ Good - Conditional classes
<button className={cn(
  "px-4 py-2 rounded-lg font-medium transition-colors",
  variant === 'primary' && "bg-purple-600 text-white hover:bg-purple-700",
  variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

## API Route Standards

### File Structure
```tsx
import { NextRequest, NextResponse } from 'next/server';

// 1. Constants at top
const RATE_LIMIT = 10;

// 2. Helper functions
function validateInput(data: unknown) {
  // ...
}

// 3. HTTP method exports
export async function GET(req: NextRequest) {
  try {
    // Logic
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // ...
}
```

### Response Format
```tsx
// ✅ Success response
return NextResponse.json({
  success: true,
  data: bookings,
  meta: { total: 42, page: 1 }
}, { status: 200 });

// ✅ Error response
return NextResponse.json({
  success: false,
  error: 'BOOKING_NOT_FOUND',
  message: 'No booking found with code HAWI-0001'
}, { status: 404 });

// ❌ Bad - Inconsistent format
return NextResponse.json({
  bookings: data, // Should be in "data" field
  err: 'failed'   // Should be "error"
});
```

## Database Conventions

### SQL Style
```sql
-- ✅ Good - Uppercase keywords, lowercase identifiers
SELECT
  booking_id,
  customer_name,
  booking_date
FROM bookings
WHERE status = 'pending'
  AND hold_expires_at < NOW()
ORDER BY created_at DESC;

-- ❌ Bad - Inconsistent casing
select booking_id, Customer_Name FROM BOOKINGS where Status='pending';
```

### Table Naming
- Lowercase with underscores: `bookings`, `capacity_rules`, `activity_log`
- Plural names for entity tables: `profiles`, `packages`, `reviews`
- Descriptive names for junction tables: `booking_staff_assignments` (not `bookings_staff`)

### Column Naming
- Lowercase with underscores: `customer_name`, `created_at`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)
- Foreign keys: `{table}_id` (e.g., `package_id`, `user_id`)
- Booleans: `is_{adjective}` (e.g., `is_active`, `is_duplicate_ref`)

## Git Commit Conventions

### Commit Message Format
```
<type>: <short description>

<optional detailed description>

<optional footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring (no functional change)
- `docs:` Documentation only
- `style:` Code style changes (formatting, no logic change)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks (dependencies, build config)
- `perf:` Performance improvements

### Examples
```bash
# Good commits
git commit -m "feat: Add Telegram notification for new bookings"
git commit -m "fix: Prevent double-booking on concurrent requests"
git commit -m "refactor: Move components to features/ directory"
git commit -m "docs: Update API documentation with new endpoints"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

## Comments and Documentation

### When to Comment
```tsx
// ✅ Good - Explain WHY, not WHAT
// Use row-level lock to prevent race condition when two users
// book the final available slot simultaneously
await tx.execute('SELECT * FROM bookings WHERE date = $1 FOR UPDATE', [date]);

// ❌ Bad - States the obvious
// Set the name variable to the customer name
const name = customerName;
```

### JSDoc for Complex Functions
```tsx
/**
 * Creates a new booking with atomic concurrency lock to prevent double-booking.
 *
 * @param data - Booking form data including customer info, date, package ID, and payment proof
 * @returns Promise resolving to the created booking record
 * @throws {Error} DATE_UNAVAILABLE if the selected date/period is at capacity
 * @throws {Error} FILE_TOO_LARGE if payment screenshot exceeds 10MB
 *
 * @example
 * const booking = await createBookingAtomic({
 *   customerName: 'Abebe Kebede',
 *   phone: '0988018016',
 *   date: '2026-12-15',
 *   period: 'full_day',
 *   packageId: 'PKG-SPECIAL',
 *   paymentScreenshot: file
 * });
 */
export async function createBookingAtomic(data: BookingFormData): Promise<BookingRow> {
  // ...
}
```

## Error Handling

### Try-Catch Pattern
```tsx
// ✅ Good - Specific error handling
try {
  const booking = await createBookingAtomic(formData);
  return NextResponse.json({ success: true, data: booking });
} catch (error) {
  if (error instanceof DatabaseError) {
    if (error.code === 'DATE_UNAVAILABLE') {
      return NextResponse.json(
        { error: 'DATE_UNAVAILABLE', message: 'Selected date is fully booked' },
        { status: 409 }
      );
    }
  }

  console.error('Unexpected error in booking creation:', error);
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: 'Something went wrong' },
    { status: 500 }
  );
}

// ❌ Bad - Silent failures
try {
  await createBookingAtomic(formData);
} catch (e) {
  // Do nothing
}
```

### Frontend Error Display
```tsx
// ✅ Good - User-friendly messages
const [error, setError] = useState<string | null>(null);

try {
  await submitBooking();
} catch (err) {
  setError(
    t('bookings.errors.creation_failed') // Translated error
  );
}

// Display
{error && (
  <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20">
    {error}
  </div>
)}
```

## Security Best Practices

### Environment Variables
```tsx
// ✅ Good - Check existence
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

// ❌ Bad - Runtime failure
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Could be undefined
```

### Input Validation
```tsx
// ✅ Good - Validate before use
function validatePhone(phone: string): boolean {
  // Ethiopian phone format: 09xxxxxxxx or 07xxxxxxxx
  return /^0[79]\d{8}$/.test(phone);
}

if (!validatePhone(formData.phone)) {
  return NextResponse.json(
    { error: 'INVALID_PHONE', message: 'Phone must be 10 digits starting with 09 or 07' },
    { status: 400 }
  );
}
```

### SQL Injection Prevention
```tsx
// ✅ Good - Parameterized queries
await supabase
  .from('bookings')
  .select('*')
  .eq('customer_phone', phone); // Parameterized

// ❌ Bad - String concatenation (DO NOT USE)
await db.query(`SELECT * FROM bookings WHERE phone = '${phone}'`); // VULNERABLE!
```

## Accessibility Standards

### Semantic HTML
```tsx
// ✅ Good - Semantic elements
<nav>
  <ul>
    <li><Link href="/booking">Book Now</Link></li>
  </ul>
</nav>

<main>
  <h1>Welcome to Hawi Pictures</h1>
  <section aria-labelledby="services-heading">
    <h2 id="services-heading">Our Services</h2>
  </section>
</main>

// ❌ Bad - Div soup
<div>
  <div>
    <div><a href="/booking">Book Now</a></div>
  </div>
</div>
```

### ARIA Labels
```tsx
// ✅ Good - Descriptive labels
<button aria-label="Switch to dark mode">
  <Moon className="w-5 h-5" aria-hidden="true" />
</button>

<img src="/images/wedding.jpg" alt="Bride and groom at outdoor ceremony" />

// ❌ Bad - Missing labels
<button>
  <Moon className="w-5 h-5" />
</button>

<img src="/images/wedding.jpg" /> {/* No alt */}
```

## Performance Guidelines

### Image Optimization
```tsx
// ✅ Good - Next.js Image with priority
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Wedding photography"
  width={1200}
  height={600}
  priority // Above the fold
  className="rounded-lg"
/>

// ❌ Bad - Regular img tag
<img src="/images/hero.jpg" alt="Wedding" />
```

### Code Splitting
```tsx
// ✅ Good - Dynamic imports for large components
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/features/admin/AdminDashboard'), {
  loading: () => <div>Loading dashboard...</div>
});

// ❌ Bad - Import everything upfront
import { AdminDashboard } from '@/components/features/admin/AdminDashboard';
```

---

**Maintained by**: Hawi Pictures Development Team
**Last Updated**: November 2, 2026
