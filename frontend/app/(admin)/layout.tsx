import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { LanguageProvider } from '@/lib/language-context';

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
      <body className="antialiased min-h-screen bg-stone-900 text-stone-100" suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
