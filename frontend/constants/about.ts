export type LanguageCode = 'en' | 'om' | 'am';

export interface OwnerPlaceholders {
  ownerName: string;
  role: string;
  founderImage: string;
  address: string;
  city: string;
  landmark: string;
  openingHours: string;
  openingHoursDetails: string;
  googleMapsUrl: string;
  phonePrimary: string;
  phonePrimaryDisplay: string;
  phoneSecondary: string;
  phoneSecondaryDisplay: string;
  socialLinks: {
    instagram: string;
    tiktok: string;
    facebook: string;
    telegram: string;
  };
}

/**
 * ============================================================================
 * EDITABLE OWNER PLACEHOLDERS
 * The client/owner can easily customize names, roles, addresses, hours & links.
 * ============================================================================
 */
export const OWNER_PLACEHOLDERS: OwnerPlaceholders = {
  ownerName: 'Hawi Habtamu',
  role: 'Founder & Lead Photographer',
  founderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
  address: 'Shager, Burayu Mariam',
  city: 'Burayu',
  landmark: 'Shager Area, Burayu Mariam',
  openingHours: 'Monday – Sunday: 8:00 AM – 7:30 PM',
  openingHoursDetails: 'Wedding & Melse shoots scheduled 24/7 on booked event dates',
  googleMapsUrl: 'https://maps.google.com/?q=Shager+Burayu+Mariam+Ethiopia',
  phonePrimary: '0988018016',
  phonePrimaryDisplay: '0988 01 80 16',
  phoneSecondary: '0914878007',
  phoneSecondaryDisplay: '0914 87 80 07',
  socialLinks: {
    instagram: 'https://instagram.com/hawipictures',
    tiktok: 'https://tiktok.com/@hawipictures',
    facebook: 'https://facebook.com/hawipictures',
    telegram: 'https://t.me/hawipictures',
  },
};

export interface StudioPhoto {
  id: string;
  title: string;
  caption: string;
  image: string;
}

export const STUDIO_PHOTOS: StudioPhoto[] = [
  {
    id: 'studio-1',
    title: 'Master Photography & Portrait Stage',
    caption: 'State-of-the-art continuous lighting, backdrops, and portrait studio staging.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-2',
    title: 'Haute Couture Bridal Gown Suite',
    caption: 'Private fitting rooms featuring imported European gowns, crystal veils, and royal tiaras.',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-3',
    title: 'Bridal Glam & Makeup Salon',
    caption: 'Dedicated professional makeup mirrors, hair styling stations, and luxury skincare prep.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-4',
    title: 'Traditional Aadaa & Cultural Lounge',
    caption: 'Authentic Habesha cultural attire, Tilfi embroidery, and Melse celebration wardrobe.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-5',
    title: '4K Cinema & Aerial Drone Editing Suite',
    caption: 'Color-calibrated editing workstations producing master 4K film and highlight teasers.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-6',
    title: 'Album Showcase & Consultation Lounge',
    caption: 'Browse physical crystal albums, 60x120 canvas boards, and hexagon wall displays in comfort.',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
  },
];

export interface WhyChooseUsFeature {
  icon: 'Sparkles' | 'PackageCheck' | 'Video' | 'Crown';
  title: string;
  description: string;
}

export interface AboutTranslations {
  nav: {
    home: string;
    services: string;
    gallery: string;
    about: string;
    contact: string;
    packages: string;
    booking: string;
    admin: string;
  };
  hero: {
    badge: string;
    subservicesLine: string;
    sentences: string[];
    bookNow: string;
    viewPackages: string;
    weddingsCount: string;
    weddingsLabel: string;
    coutureTitle: string;
    coutureLabel: string;
    destinationTitle: string;
    destinationLabel: string;
    callStudio: string;
  };
  aboutHeader: {
    badge: string;
    title: string;
    subtitle: string;
  };
  founder: {
    meetHeadingPrefix: string;
    role: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  insideStudio: {
    badge: string;
    title: string;
    subtitle: string;
    clickToView: string;
    closeModal: string;
    photoCount: string;
  };
  whyChooseUs: {
    badge: string;
    title: string;
    subtitle: string;
    features: WhyChooseUsFeature[];
  };
  cta: {
    title: string;
    subtitle: string;
    bookNow: string;
    viewPackages: string;
  };
  contactInfo: {
    badge: string;
    title: string;
    subtitle: string;
    callUs: string;
    callUsNote: string;
    location: string;
    locationDetail: string;
    openingHours: string;
    openingHoursNote: string;
    viewGoogleMaps: string;
    followExplore: string;
    tapToCall: string;
  };
  footer: {
    brandName: string;
    servicesLine: string;
    copyright: string;
  };
}

/**
 * ============================================================================
 * TRANSLATION DICTIONARIES
 * English is filled in completely.
 * Afaan Oromoo and Amharic are marked for review as requested.
 * ============================================================================
 */
export const ABOUT_TRANSLATIONS: Record<LanguageCode, AboutTranslations> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      gallery: 'Gallery',
      about: 'About',
      contact: 'Contact',
      packages: 'Packages',
      booking: 'Book Now',
      admin: 'Admin',
    },
    hero: {
      badge: 'Wedding Photography & Bridal Zone in Ethiopia',
      subservicesLine: 'Photography • Bridal • Beauty • Makeup • Aadaa',
      sentences: [
        'Bakka Miidhaginaafi Yaadannoon Itti argamu',
        'Your Wedding, Beautifully Captured',
        'Bridal Looks That Shine',
        'Photography, Makeup and Aadaa in One Place',
        'Memories That Last a Lifetime',
      ],
      bookNow: 'Book Now',
      viewPackages: 'View Packages',
      weddingsCount: '1,200+',
      weddingsLabel: 'Weddings Captured',
      coutureTitle: 'Haute Couture',
      coutureLabel: 'Custom Bridal Gowns',
      destinationTitle: 'Finfinnee & Beyond',
      destinationLabel: 'Destination Coverage',
      callStudio: 'Call Studio',
    },
    aboutHeader: {
      badge: 'About Hawi Pictures',
      title: 'About Hawi Pictures & Bridal Zone',
      subtitle: 'Where beautiful moments become lasting memories.',
    },
    founder: {
      meetHeadingPrefix: 'Meet',
      role: 'Founder & Lead Photographer',
      paragraph1:
        'Founder of Hawi Pictures & Bridal Zone, Hawi Habtamu built a place where photography, bridal styling, beauty and traditional wear come together for your wedding day.',
      paragraph2:
        'From studio portraits and 4K video to makeup, hair and traditional dress (Aadaa), every detail is prepared with care so you can enjoy your day.',
      paragraph3:
        'Our vision is simple: every couple should feel beautiful, confident, and leave with memories they will treasure for life.',
    },
    insideStudio: {
      badge: 'Studio Walkthrough',
      title: 'Inside Our Studio',
      subtitle: 'A warm and elegant space for photography, beauty and bridal preparation.',
      clickToView: 'Click any photo to view in full screen',
      closeModal: 'Close Viewer',
      photoCount: 'Photo',
    },
    whyChooseUs: {
      badge: 'Why Couples Love Us',
      title: 'Why Choose Us',
      subtitle: 'The standard of Ethiopian wedding luxury, crafted with heartfelt care.',
      features: [
        {
          icon: 'Sparkles',
          title: 'Everything in One Place',
          description:
            'Photography, 4K video, designer bridal gowns, hair styling, glam makeup, and traditional Habesha attire all under one trusted roof.',
        },
        {
          icon: 'PackageCheck',
          title: 'Clear Packages and Prices',
          description:
            'Complete transparency with all 8 curated wedding packages plus our signature Special Package, including albums and framed canvas boards.',
        },
        {
          icon: 'Video',
          title: 'Photos and 4K Video',
          description:
            'Multi-camera 4K ultra-HD cinematography, drone aerials, and high-resolution master studio portraits retouched to international standards.',
        },
        {
          icon: 'Crown',
          title: 'Beautiful Bridal Looks',
          description:
            'Imported designer wedding gowns, bespoke bridal glam makeup, royal veils, and authentic traditional Aadaa wedding wear.',
        },
      ],
    },
    cta: {
      title: 'Ready for Your Special Day?',
      subtitle: 'Choose a package and book your date today.',
      bookNow: 'Book Now',
      viewPackages: 'View Packages',
    },
    contactInfo: {
      badge: 'Direct Connect',
      title: 'Contact Information',
      subtitle: 'Visit our Addis Ababa studio or contact our team directly for consultations.',
      callUs: 'Call Us',
      callUsNote: 'Direct phone line to studio team',
      location: 'Location',
      locationDetail: 'Shager, Burayu Mariam Studio',
      openingHours: 'Opening Hours',
      openingHoursNote: 'Monday – Sunday: 8:00 AM – 7:30 PM (Shoots 24/7 on booked dates)',
      viewGoogleMaps: 'View on Google Maps',
      followExplore: 'Follow & Explore',
      tapToCall: 'Tap to call now',
    },
    footer: {
      brandName: 'Hawi Pictures & Bridal Zone',
      servicesLine: 'Photography, Bridal, Beauty, Makeup, Aadaa',
      copyright: '© 2026 Hawi Pictures & Bridal Zone. All rights reserved.',
    },
  },

  om: {
    nav: {
      home: 'Mana',
      services: 'Tajaajila',
      gallery: 'Gaalarii',
      about: "Waa'ee Keenya",
      contact: 'Nu Qunnamaa',
      packages: 'Paakeejjiiwwan',
      booking: 'Amma Qabadhaa',
      admin: 'Bulchiinsa',
    },
    hero: {
      badge: 'Wedding Photography & Bridal Zone in Ethiopia',
      subservicesLine: 'Photography • Bridal • Beauty • Makeup • Aadaa',
      sentences: [
        'Bakka Miidhaginaafi Yaadannoon Itti argamu',
        '[Oromo: Review] Your Wedding, Beautifully Captured',
        '[Oromo: Review] Bridal Looks That Shine',
        '[Oromo: Review] Photography, Makeup and Aadaa in One Place',
        '[Oromo: Review] Memories That Last a Lifetime',
      ],
      bookNow: '[Oromo: Review] Amma Qabadhaa',
      viewPackages: '[Oromo: Review] Paakeejjiiwwan Ilaalaa',
      weddingsCount: '1,200+',
      weddingsLabel: '[Oromo: Review] Cidha Waraabame',
      coutureTitle: 'Haute Couture',
      coutureLabel: '[Oromo: Review] Uffata Misirroo Qophaa\'e',
      destinationTitle: 'Finfinnee & Beyond',
      destinationLabel: '[Oromo: Review] Bakka Hundatti',
      callStudio: '[Oromo: Review] Nuuf Bilbilaa',
    },
    aboutHeader: {
      badge: "[Oromo: Review] Waa'ee Hawi",
      title: "[Oromo: Review] Waa'ee Hawi Pictures & Bridal Zone",
      subtitle: '[Oromo: Review] Bakka Miidhaginaafi Yaadannoon Itti argamu !',
    },
    founder: {
      meetHeadingPrefix: '[Oromo: Review] Waliin Wal-Baraa',
      role: '[Oromo: Review] Hundeeffamaa & Hojii Gaggeessaa Suuraa',
      paragraph1:
        '[Oromo: Review] Founder of Hawi Pictures & Bridal Zone, Hawi Habtamu built a place where photography, bridal styling, beauty and traditional wear come together for your wedding day.',
      paragraph2:
        '[Oromo: Review] From studio portraits and 4K video to makeup, hair and traditional dress (Aadaa), every detail is prepared with care so you can enjoy your day.',
      paragraph3:
        '[Oromo: Review] Our vision is simple: every couple should feel beautiful, confident, and leave with memories they will treasure for life.',
    },
    insideStudio: {
      badge: '[Oromo: Review] Isteediyoo Keenya',
      title: '[Oromo: Review] Inside Our Studio',
      subtitle: '[Oromo: Review] A warm and elegant space for photography, beauty and bridal preparation.',
      clickToView: '[Oromo: Review] Suuraa guutuu arguuf cuqaasaa',
      closeModal: '[Oromo: Review] Cufaa',
      photoCount: '[Oromo: Review] Suuraa',
    },
    whyChooseUs: {
      badge: '[Oromo: Review] Maaliif Nu Filattu?',
      title: '[Oromo: Review] Why Choose Us',
      subtitle: '[Oromo: Review] The standard of Ethiopian wedding luxury, crafted with heartfelt care.',
      features: [
        {
          icon: 'Sparkles',
          title: '[Oromo: Review] Everything in One Place',
          description:
            '[Oromo: Review] Photography, 4K video, designer bridal gowns, hair styling, glam makeup, and traditional Habesha attire all under one trusted roof.',
        },
        {
          icon: 'PackageCheck',
          title: '[Oromo: Review] Clear Packages and Prices',
          description:
            '[Oromo: Review] Complete transparency with all 8 curated wedding packages plus our signature Special Package, including albums and framed canvas boards.',
        },
        {
          icon: 'Video',
          title: '[Oromo: Review] Photos and 4K Video',
          description:
            '[Oromo: Review] Multi-camera 4K ultra-HD cinematography, drone aerials, and high-resolution master studio portraits retouched to international standards.',
        },
        {
          icon: 'Crown',
          title: '[Oromo: Review] Beautiful Bridal Looks',
          description:
            '[Oromo: Review] Imported designer wedding gowns, bespoke bridal glam makeup, royal veils, and authentic traditional Aadaa wedding wear.',
        },
      ],
    },
    cta: {
      title: '[Oromo: Review] Ready for Your Special Day?',
      subtitle: '[Oromo: Review] Choose a package and book your date today.',
      bookNow: '[Oromo: Review] Book Now',
      viewPackages: '[Oromo: Review] View Packages',
    },
    contactInfo: {
      badge: '[Oromo: Review] Nu Qunnamaa',
      title: '[Oromo: Review] Contact Information',
      subtitle: '[Oromo: Review] Visit our Addis Ababa studio or contact our team directly for consultations.',
      callUs: '[Oromo: Review] Nuuf Bilbilaa',
      callUsNote: '[Oromo: Review] Sarara bilbilaa kallattii isteediyootiif',
      location: '[Oromo: Review] Teessoo',
      locationDetail: '[Oromo: Review] Shager, Burayu Mariam Studio',
      openingHours: '[Oromo: Review] Saaatii Hojii',
      openingHoursNote: '[Oromo: Review] Wiixata – Dilbata: 8:00 AM – 7:30 PM',
      viewGoogleMaps: '[Oromo: Review] View on Google Maps',
      followExplore: '[Oromo: Review] Follow & Explore',
      tapToCall: '[Oromo: Review] Bilbiluuf cuqaasaa',
    },
    footer: {
      brandName: 'Hawi Pictures & Bridal Zone',
      servicesLine: 'Photography, Bridal, Beauty, Makeup, Aadaa',
      copyright: '© 2026 Hawi Pictures & Bridal Zone. Mirgi Qopheessaa Seeraan Eegameera.',
    },
  },

  am: {
    nav: {
      home: 'ዋና ገጽ',
      services: 'አገልግሎቶች',
      gallery: 'ጋለሪ',
      about: 'ስለ እኛ',
      contact: 'አግኙን',
      packages: 'ፓኬጆች',
      booking: 'ቀጠሮ ይያዙ',
      admin: 'አድሚን',
    },
    hero: {
      badge: 'Wedding Photography & Bridal Zone in Ethiopia',
      subservicesLine: 'Photography • Bridal • Beauty • Makeup • Aadaa',
      sentences: [
        'ባካ ሚድሃጊናፊ ያዳኖን ኢቲ አርገሙ',
        '[Amharic: Review] Your Wedding, Beautifully Captured',
        '[Amharic: Review] Bridal Looks That Shine',
        '[Amharic: Review] Photography, Makeup and Aadaa in One Place',
        '[Amharic: Review] Memories That Last a Lifetime',
      ],
      bookNow: '[Amharic: Review] አሁን ያስይዙ',
      viewPackages: '[Amharic: Review] ፓኬጆችን ይመልከቱ',
      weddingsCount: '1,200+',
      weddingsLabel: '[Amharic: Review] የተነሱ ሰርጎች',
      coutureTitle: 'Haute Couture',
      coutureLabel: '[Amharic: Review] የተመረጡ የሙሽራ ጋውኖች',
      destinationTitle: 'Finfinnee & Beyond',
      destinationLabel: '[Amharic: Review] በመላው ኢትዮጵያ',
      callStudio: '[Amharic: Review] ይደውሉልን',
    },
    aboutHeader: {
      badge: '[Amharic: Review] ስለ ሀዊ',
      title: '[Amharic: Review] About Hawi Pictures & Bridal Zone',
      subtitle: '[Amharic: Review] Where beautiful moments become lasting memories.',
    },
    founder: {
      meetHeadingPrefix: '[Amharic: Review] ይወቁ',
      role: '[Amharic: Review] Founder & Lead Photographer',
      paragraph1:
        '[Amharic: Review] Founder of Hawi Pictures & Bridal Zone, Hawi Habtamu built a place where photography, bridal styling, beauty and traditional wear come together for your wedding day.',
      paragraph2:
        '[Amharic: Review] From studio portraits and 4K video to makeup, hair and traditional dress (Aadaa), every detail is prepared with care so you can enjoy your day.',
      paragraph3:
        '[Amharic: Review] Our vision is simple: every couple should feel beautiful, confident, and leave with memories they will treasure for life.',
    },
    insideStudio: {
      badge: '[Amharic: Review] የስቱዲዮ ጉብኝት',
      title: '[Amharic: Review] Inside Our Studio',
      subtitle: '[Amharic: Review] A warm and elegant space for photography, beauty and bridal preparation.',
      clickToView: '[Amharic: Review] ሙሉ ፎቶውን ለማየት ይጫኑ',
      closeModal: '[Amharic: Review] ዝጋ',
      photoCount: '[Amharic: Review] ፎቶ',
    },
    whyChooseUs: {
      badge: '[Amharic: Review] ለምን እኛን?',
      title: '[Amharic: Review] Why Choose Us',
      subtitle: '[Amharic: Review] The standard of Ethiopian wedding luxury, crafted with heartfelt care.',
      features: [
        {
          icon: 'Sparkles',
          title: '[Amharic: Review] Everything in One Place',
          description:
            '[Amharic: Review] Photography, 4K video, designer bridal gowns, hair styling, glam makeup, and traditional Habesha attire all under one trusted roof.',
        },
        {
          icon: 'PackageCheck',
          title: '[Amharic: Review] Clear Packages and Prices',
          description:
            '[Amharic: Review] Complete transparency with all 8 curated wedding packages plus our signature Special Package, including albums and framed canvas boards.',
        },
        {
          icon: 'Video',
          title: '[Amharic: Review] Photos and 4K Video',
          description:
            '[Amharic: Review] Multi-camera 4K ultra-HD cinematography, drone aerials, and high-resolution master studio portraits retouched to international standards.',
        },
        {
          icon: 'Crown',
          title: '[Amharic: Review] Beautiful Bridal Looks',
          description:
            '[Amharic: Review] Imported designer wedding gowns, bespoke bridal glam makeup, royal veils, and authentic traditional Aadaa wedding wear.',
        },
      ],
    },
    cta: {
      title: '[Amharic: Review] Ready for Your Special Day?',
      subtitle: '[Amharic: Review] Choose a package and book your date today.',
      bookNow: '[Amharic: Review] Book Now',
      viewPackages: '[Amharic: Review] View Packages',
    },
    contactInfo: {
      badge: '[Amharic: Review] አግኙን',
      title: '[Amharic: Review] Contact Information',
      subtitle: '[Amharic: Review] Visit our Addis Ababa studio or contact our team directly for consultations.',
      callUs: '[Amharic: Review] ደውሉልን',
      callUsNote: '[Amharic: Review] ቀጥታ የስልክ መስመር',
      location: '[Amharic: Review] አድራሻ',
      locationDetail: '[Amharic: Review] Shager, Burayu Mariam Studio',
      openingHours: '[Amharic: Review] የስራ ሰዓት',
      openingHoursNote: '[Amharic: Review] ሰኞ – እሁድ፡ 8:00 AM – 7:30 PM',
      viewGoogleMaps: '[Amharic: Review] View on Google Maps',
      followExplore: '[Amharic: Review] Follow & Explore',
      tapToCall: '[Amharic: Review] ለመደወል ይጫኑ',
    },
    footer: {
      brandName: 'Hawi Pictures & Bridal Zone',
      servicesLine: 'Photography, Bridal, Beauty, Makeup, Aadaa',
      copyright: '© 2026 Hawi Pictures & Bridal Zone. All rights reserved.',
    },
  },
};
