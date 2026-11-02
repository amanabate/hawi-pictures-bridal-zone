import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { LanguageProvider } from '@/lib/language-context';
import OfflineBanner from '@/components/pwa/OfflineBanner';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import PWAUpdateToast from '@/components/pwa/PWAUpdateToast';
import StandaloneHeader from '@/components/pwa/StandaloneHeader';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0803' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Hawi Pictures & Bridal Zone | Wedding Photography & Bridal Salon Ethiopia',
  description:
    'Premier wedding photography, bridal gowns, hair & beauty salon in Addis Ababa, Ethiopia. Explore wedding & Melse packages and book online.',
  applicationName: 'Hawi',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hawi',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Hawi Pictures & Bridal Zone',
    description:
      'Premier wedding photography, bridal gowns, hair & beauty salon in Addis Ababa, Ethiopia.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hawi Pictures & Bridal Zone',
    description:
      'Premier wedding photography, bridal gowns, hair & beauty salon in Addis Ababa, Ethiopia.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="om" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hawi" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/apple-splash-portrait.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://picsum.photos https://images.unsplash.com; connect-src 'self' blob:; media-src 'self' blob:; worker-src 'self' blob:; child-src 'self' blob:; form-action 'self';"
        />

        {/* Anti-flash script: executes synchronously before paint to prevent theme flickering */}
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
      <body
        className="antialiased bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--gold)]/30 selection:text-[var(--gold)] min-h-screen"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <StandaloneHeader />
          {children}
          {/* PWA Enhancements: Offline banner, auto install prompt, update notification */}
          <OfflineBanner />
          <PWAInstallPrompt />
          <PWAUpdateToast />
        </LanguageProvider>
      </body>
    </html>
  );
}
