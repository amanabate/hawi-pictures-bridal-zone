import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: 'Hawi Pictures & Bridal Zone',
    short_name: 'Hawi',
    description:
      'Luxury wedding photography, bridal salon and beauty services in Ethiopia. Browse bridal packages, book your wedding date, and manage reservations.',
    lang: 'en',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FAF7F2',
    theme_color: '#D4AF37',
    categories: ['business', 'photo', 'lifestyle'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Book Now',
        short_name: 'Book',
        description: 'Reserve wedding photography, bridal styling, makeup & traditional attire',
        url: '/booking',
        icons: [
          {
            src: '/shortcut-booking.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Packages',
        short_name: 'Packages',
        description: 'Explore full wedding packages and photography collections',
        url: '/packages',
        icons: [
          {
            src: '/shortcut-packages.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Admin',
        short_name: 'Admin',
        description: 'Studio operations, bookings, calendar & capacity controls',
        url: '/admin',
        icons: [
          {
            src: '/shortcut-admin.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Hawi Pictures & Bridal Zone Showcase',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Hawi Wedding Booking & Date Reservations',
      },
      {
        src: '/screenshot-packages.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Luxury Wedding Packages',
      },
    ],
  };
}
