import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { LanguageProvider } from '@/lib/language-context';
import { AdminAuthProvider } from '@/lib/admin-auth-context';

export const viewport: Viewport = {
  themeColor: '#0B0803',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hawi Pictures & Bridal Zone Ethiopia',
  description: 'Studio administration dashboard to review, confirm, and manage wedding bookings and receipts.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash script for theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'hawi_theme_preference';
                  var saved = localStorage.getItem(storageKey);
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text)]" suppressHydrationWarning>
        <LanguageProvider>
          <AdminAuthProvider>
            {children}
          </AdminAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
