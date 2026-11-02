export interface MultilingualText {
  en: string;
  om: string;
  am: string;
}

export interface MultilingualList {
  en: string[];
  om: string[];
  am: string[];
}

export interface WeddingPackage {
  id: string;
  name: string;
  nameEnglish?: string;
  nameAfaanOromoo?: string;
  nameAmharic?: string;
  nameI18n?: MultilingualText;
  tagline: string;
  taglineI18n?: MultilingualText;
  price: number; // In Ethiopian Birr (ETB)
  priceDisplay: string;
  depositAmount: string; // Left empty for now as requested
  badge?: 'special' | 'popular' | 'none';
  isSpecial?: boolean;
  popular?: boolean;
  category: 'photography' | 'bridal_salon' | 'full_wedding' | 'cinema' | 'special';
  categoryLabel: string;
  daysCoverage: string;
  team: string;
  image: string;
  features: string[]; // Every included item exactly as written in Afaan Oromoo
  featuresI18n?: MultilingualList;
  deliverables: string[];
  deliverablesI18n?: MultilingualList;
  idealFor: string;
  idealForI18n?: MultilingualText;
}

export function getPackageName(
  pkg: {
    name: string;
    nameEnglish?: string;
    nameAfaanOromoo?: string;
    nameAmharic?: string;
    nameI18n?: Partial<MultilingualText>;
  },
  lang: string
): string {
  if (pkg.nameI18n && pkg.nameI18n[lang as keyof MultilingualText]) {
    return pkg.nameI18n[lang as keyof MultilingualText]!;
  }
  if (lang === 'om') return pkg.nameAfaanOromoo || pkg.name;
  if (lang === 'am') return pkg.nameAmharic || pkg.name;
  if (lang === 'en') return pkg.nameEnglish || pkg.name;
  return pkg.name;
}

export function getPackageTagline(
  pkg: {
    tagline: string;
    taglineI18n?: Partial<MultilingualText>;
  },
  lang: string
): string {
  if (pkg.taglineI18n && pkg.taglineI18n[lang as keyof MultilingualText]) {
    return pkg.taglineI18n[lang as keyof MultilingualText]!;
  }
  return pkg.tagline;
}

export function getPackageFeatures(
  pkg: {
    features: string[];
    featuresI18n?: Partial<MultilingualList>;
  },
  lang: string
): string[] {
  if (pkg.featuresI18n && pkg.featuresI18n[lang as keyof MultilingualList]) {
    return pkg.featuresI18n[lang as keyof MultilingualList]!;
  }
  return pkg.features;
}

export function getPackageIdealFor(
  pkg: {
    idealFor: string;
    idealForI18n?: Partial<MultilingualText>;
  },
  lang: string
): string {
  if (pkg.idealForI18n && pkg.idealForI18n[lang as keyof MultilingualText]) {
    return pkg.idealForI18n[lang as keyof MultilingualText]!;
  }
  return pkg.idealFor;
}

export interface BrandInfo {
  name: string;
  subBrands: string[];
  tagline: string;
  services: string[];
  bottomIcons: Array<{ title: string; desc: string }>;
  closingGreeting: string;
  phones: string[];
}

export const BRAND_INFO: BrandInfo = {
  name: 'HAWI Pictures & Bridal Zone',
  subBrands: ['Hawi Beauty Salon', 'Hawi Habtamu'],
  tagline: 'Bakka Miidhaginaafi Yaadannoon Itti argamu !',
  services: ['Photography', 'Bridal', 'Beauty', 'Makeup', 'Aadaa (Traditional)'],
  bottomIcons: [
    { title: 'Studio', desc: 'Modern high-end indoor studio suites' },
    { title: 'Video 4K', desc: 'Cinematic 4K ultra-HD film & drone' },
    { title: 'Beauty', desc: 'Bridal salon, hair styling & glam makeup' },
    { title: 'Traditional', desc: 'Habesha cultural gowns & Melse attire' }
  ],
  closingGreeting: 'Nagaan Duha !',
  phones: ['0988018016', '0914878007']
};

export const FLYER_NOTICE = {
  title: 'HUBACHIISA (Notice)',
  oromo: 'Gatii seensa paarkii, geekiness fi Shamizii, kaarabaataa, kophee fi wiiggiin Paakeejjii keessa hin jiru.',
  english: 'Not included in the packages: park entrance fee and other listed items (shirt, tie, shoes, and wig). Wording to be confirmed with the owner.'
};

export const PACKAGES_DATA: WeddingPackage[] = [
  {
    id: 'special-package',
    name: 'Special Package',
    nameEnglish: 'Special Package',
    nameAfaanOromoo: 'Special Package',
    nameAmharic: 'ልዩ ፓኬጅ (Special Package)',
    tagline: 'Sagantaa guutuu suuraa, viidiyoo 4K, mana miidhaginaafi uffata aadaa',
    price: 60000,
    priceDisplay: '60,000 Birr',
    depositAmount: '',
    badge: 'special',
    isSpecial: true,
    popular: false,
    category: 'special',
    categoryLabel: 'Special Package',
    daysCoverage: 'Full Wedding Coverage',
    team: 'Camera 2 + Salon & Studio Crew',
    image: '/images/hawi_hero_wedding_1793302555646.jpg',
    features: [
      '40x60 Album fuula 20',
      '30x60 Album fuula 10',
      'Mana miidhagina dhiiraafi shamarranii',
      'Suuraa Edit Softcopy 150 + all soft copy',
      'Save the date 10',
      'Thankyou card 200',
      'Camera 2',
      'Suuraa Studio, Mask, Video 4k',
      '60x120 Board + Hexagon Board 6',
      '30x45 SignBoard',
      'Suufii 3 fi Veelloo 4',
      'Uffata Aadaa fi Qamisii Irbaataa'
    ],
    deliverables: [
      '40x60 Album fuula 20 & 30x60 Album fuula 10',
      '60x120 Board + Hexagon Board 6 + 30x45 SignBoard',
      'Suuraa Edit Softcopy 150 + all soft copy',
      'Camera 2, Suuraa Studio, Mask, Video 4k',
      'Save the date 10 & Thankyou card 200',
      'Suufii 3 fi Veelloo 4, Uffata Aadaa fi Qamisii Irbaataa'
    ],
    idealFor: 'Sagantaa cidhaa guddaa fi qananii guutuu barbaadaniif kan qophaa\'e.'
  },
  {
    id: 'paakeejii-1ffaa',
    name: 'Paakeejii 1ffaa',
    nameEnglish: 'Package 1 (Paakeejii 1ffaa)',
    nameAfaanOromoo: 'Paakeejii 1ffaa',
    nameAmharic: 'ፓኬጅ 1 (Paakeejii 1ffaa)',
    tagline: 'Album laminated, board gurguddaa, suuraa studio fi viidiyoo gabaabaa',
    price: 40000,
    priceDisplay: '40,000 Birr',
    depositAmount: '',
    badge: 'popular',
    isSpecial: false,
    popular: true,
    category: 'full_wedding',
    categoryLabel: 'Package 1',
    daysCoverage: 'Full Day Coverage',
    team: 'Senior Photographer + Video + Salon',
    image: '/images/hawi_wedding_photography_1793302557354.jpg',
    features: [
      '30x90 Laminated album fuula 20',
      '60x90 Board + 30x45 Board',
      'Waraqaa Galataa 200',
      'Suuraa studio, Mask fi Video gabaabaa',
      'Suuraa edit 100 + all soft copy',
      'Mana miidhagina dhiiraafi shamarranii',
      'Save the date 5',
      'Veelloo 4 + Suufii 2',
      'Uffata Aadaa + Qamisii Irbaataa'
    ],
    deliverables: [
      '30x90 Laminated album fuula 20',
      '60x90 Board + 30x45 Board',
      'Waraqaa Galataa 200 & Save the date 5',
      'Suuraa studio, Mask fi Video gabaabaa',
      'Mana miidhagina dhiiraafi shamarranii',
      'Veelloo 4 + Suufii 2, Uffata Aadaa + Qamisii Irbaataa'
    ],
    idealFor: 'Filannoo baay\'ee jaalatamaa! Mana miidhagina dhiiraafi shamarranii fi album laminated fuula 20.'
  },
  {
    id: 'paakeejii-2ffaa',
    name: 'Paakeejii 2ffaa',
    nameEnglish: 'Package 2 (Paakeejii 2ffaa)',
    nameAfaanOromoo: 'Paakeejii 2ffaa',
    nameAmharic: 'ፓኬጅ 2 (Paakeejii 2ffaa)',
    tagline: 'Laminated album, board sadii, suuraa studio, mask fi video',
    price: 36000,
    priceDisplay: '36,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'full_wedding',
    categoryLabel: 'Package 2',
    daysCoverage: 'Wedding Day Session',
    team: 'Master Photographer + Video + Salon',
    image: '/images/hawi_bridal_makeup_1793302556782.jpg',
    features: [
      '30x90 Laminated album Fuula 10',
      '50x80 Board + 20x30 Board',
      '30x45 sign board',
      'Waraqaa Galataa 150',
      'Suura studio, mask fi video',
      'Edit soft copy 100',
      'Mana miidhagina shamarranii',
      'Save the date 5',
      'Veelloo 3 + Suufii 2',
      'Uffata Aadaa + Qamisii Irbaataa'
    ],
    deliverables: [
      '30x90 Laminated album Fuula 10',
      '50x80 Board + 20x30 Board + 30x45 sign board',
      'Waraqaa Galataa 150 & Save the date 5',
      'Suura studio, mask fi video',
      'Mana miidhagina shamarranii',
      'Veelloo 3 + Suufii 2, Uffata Aadaa + Qamisii Irbaataa'
    ],
    idealFor: 'Cidha miidhaginaa fi yaadannoo boonsaa wajjin board sadii fi veelloo 3 qabu.'
  },
  {
    id: 'paakeejii-3ffaa',
    name: 'Paakeejii 3ffaa',
    nameEnglish: 'Package 3 (Paakeejii 3ffaa)',
    nameAfaanOromoo: 'Paakeejii 3ffaa',
    nameAmharic: 'ፓኬጅ 3 (Paakeejii 3ffaa)',
    tagline: '30x60 Laminated album, board lama, waraqaa galataa fi veelloo 3',
    price: 32000,
    priceDisplay: '32,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'full_wedding',
    categoryLabel: 'Package 3',
    daysCoverage: 'Wedding Ceremony',
    team: 'Senior Photographer + Salon Artist',
    image: '/images/hawi_reception_celebration_1793302558086.jpg',
    features: [
      '30x60 laminated album fuula 10',
      '50x80 Board',
      '30x45 SignBord',
      'Waraqaa Galataa 100',
      'Suura Studio, Mask fi video',
      'Softcopy 100',
      'Mana miidhagina shamarranii',
      'Save the date 1',
      'Veelloo 3 fi Suufii 2',
      'Uffata Aadaa fi Qamisii Irbaataa'
    ],
    deliverables: [
      '30x60 laminated album fuula 10',
      '50x80 Board & 30x45 SignBord',
      'Waraqaa Galataa 100 & Save the date 1',
      'Suura Studio, Mask fi video',
      'Mana miidhagina shamarranii',
      'Veelloo 3 fi Suufii 2, Uffata Aadaa fi Qamisii Irbaataa'
    ],
    idealFor: 'Waraqaa galataa 100, album laminated, board lama fi uffata aadaa guutuu.'
  },
  {
    id: 'paakeejii-4ffaa',
    name: 'Paakeejii 4ffaa',
    nameEnglish: 'Package 4 (Paakeejii 4ffaa)',
    nameAfaanOromoo: 'Paakeejii 4ffaa',
    nameAmharic: 'ፓኬጅ 4 (Paakeejii 4ffaa)',
    tagline: '50x80 Board, 20x30 SignBoard, softcopy 70, mana miidhaginaa fi veelloo 3',
    price: 28000,
    priceDisplay: '28,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'photography',
    categoryLabel: 'Package 4',
    daysCoverage: 'Ceremony & Reception',
    team: 'Senior Photographer + Salon',
    image: '/images/hawi_bridal_gown_1793302558528.jpg',
    features: [
      '50x80 Board',
      '20x30 SignBoard',
      'Waraqaa Galataa 50',
      'Suuraa Studio + Suuraa Mask',
      'Softcopy Edit 70',
      'Mana miidhagina shamarranii',
      'Veelloo 3 + Suufii 2',
      'Uffata Aadaa fi Qamisii Irbaataa'
    ],
    deliverables: [
      '50x80 Board & 20x30 SignBoard',
      'Waraqaa Galataa 50',
      'Suuraa Studio + Suuraa Mask',
      'Softcopy Edit 70',
      'Mana miidhagina shamarranii',
      'Veelloo 3 + Suufii 2, Uffata Aadaa fi Qamisii Irbaataa'
    ],
    idealFor: 'Board gurguddaa, suuraa studio mask, mana miidhaginaa fi suufii 2 wajjin.'
  },
  {
    id: 'paakeejii-5ffaa',
    name: 'Paakeejii 5ffaa',
    nameEnglish: 'Package 5 (Paakeejii 5ffaa)',
    nameAfaanOromoo: 'Paakeejii 5ffaa',
    nameAmharic: 'ፓኬጅ 5 (Paakeejii 5ffaa)',
    tagline: '50x80 Board, studio + mask, softcopy 50, mana miidhaginaa, veelloo 2 fi suufii 2',
    price: 24000,
    priceDisplay: '24,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'photography',
    categoryLabel: 'Package 5',
    daysCoverage: 'Ceremony Coverage',
    team: 'Professional Photographer + Salon',
    image: '/images/hawi_wedding_photography_1793302557354.jpg',
    features: [
      '50x80 Board',
      'Suuraa studio + Mask',
      'Softcopy Edit 50',
      'Mana miidhagina shamarranii',
      'Veelloo 2 + Suufii 2',
      'Uffata Aadaa + Qamisii Irbaataa'
    ],
    deliverables: [
      '50x80 Board',
      'Suuraa studio + Mask',
      'Softcopy Edit 50',
      'Mana miidhagina shamarranii',
      'Veelloo 2 + Suufii 2',
      'Uffata Aadaa + Qamisii Irbaataa'
    ],
    idealFor: 'Suuraa qulqullina olaanaa, board 50x80, mana miidhaginaa fi uffata aadaa.'
  },
  {
    id: 'paakeejii-6ffaa',
    name: 'Paakeejii 6ffaa',
    nameEnglish: 'Package 6 (Paakeejii 6ffaa)',
    nameAfaanOromoo: 'Paakeejii 6ffaa',
    nameAmharic: 'ፓኬጅ 6 (Paakeejii 6ffaa)',
    tagline: '40x60 Board, suuraa studio ykn mask, softcopy 50, mana miidhaginaa fi uffata aadaa',
    price: 20000,
    priceDisplay: '20,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'photography',
    categoryLabel: 'Package 6',
    daysCoverage: 'Ceremony Session',
    team: 'Professional Photographer + Salon',
    image: '/images/hawi_bridal_makeup_1793302556782.jpg',
    features: [
      '40x60 Board',
      'Suuraa studio ykn Mask',
      'Softcopy edit 50',
      'Mana miidhagina shamarranii',
      'Veelloo 2 + Suufii 2',
      'Uffata Aadaa'
    ],
    deliverables: [
      '40x60 Board',
      'Suuraa studio ykn Mask',
      'Softcopy edit 50',
      'Mana miidhagina shamarranii',
      'Veelloo 2 + Suufii 2',
      'Uffata Aadaa'
    ],
    idealFor: 'Gatii madaalawaan board 40x60, suuraa studio ykn mask fi mana miidhaginaa.'
  },
  {
    id: 'paakeejii-7ffaa',
    name: 'Paakeejii 7ffaa',
    nameEnglish: 'Package 7 (Paakeejii 7ffaa)',
    nameAfaanOromoo: 'Paakeejii 7ffaa',
    nameAmharic: 'ፓኬጅ 7 (Paakeejii 7ffaa)',
    tagline: '30x45 Board, suuraa studio, softcopy 40, mana miidhaginaa, veelloo 1 fi suufii 1',
    price: 16000,
    priceDisplay: '16,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'photography',
    categoryLabel: 'Package 7',
    daysCoverage: 'Ceremony Session',
    team: 'Professional Photographer + Salon',
    image: '/images/hawi_hero_wedding_1793302555646.jpg',
    features: [
      '30x45 Board',
      'Suuraa Studio',
      'Softcopy edit 40',
      'Mana miidhagina shamarranii',
      'Veelloo 1 + Suufii 1',
      'Uffata Aadaa'
    ],
    deliverables: [
      '30x45 Board',
      'Suuraa Studio',
      'Softcopy edit 40',
      'Mana miidhagina shamarranii',
      'Veelloo 1 + Suufii 1',
      'Uffata Aadaa'
    ],
    idealFor: 'Paakeejii bu\'uuraa board 30x45, suuraa studio, mana miidhaginaa fi uffata aadaa qabu.'
  },
  {
    id: 'paakeejii-8ffaa',
    name: 'Paakeejii 8ffaa',
    nameEnglish: 'Package 8 (Paakeejii 8ffaa)',
    nameAfaanOromoo: 'Paakeejii 8ffaa',
    nameAmharic: 'ፓኬጅ 8 (Paakeejii 8ffaa)',
    tagline: '20x30 Board, suuraa studio, softcopy 30, mana miidhaginaa, veelloo 1 fi suufii 1',
    price: 12000,
    priceDisplay: '12,000 Birr',
    depositAmount: '',
    badge: 'none',
    isSpecial: false,
    popular: false,
    category: 'photography',
    categoryLabel: 'Package 8',
    daysCoverage: 'Studio & Ceremony',
    team: 'Photographer + Salon',
    image: '/images/hawi_reception_celebration_1793302558086.jpg',
    features: [
      '20x30 Board',
      'Suuraa Studio',
      'Softcopy Edit 30',
      'Mana miidhagina shamarranii',
      'Veelloo 1 + Suufii 1'
    ],
    deliverables: [
      '20x30 Board',
      'Suuraa Studio',
      'Softcopy Edit 30',
      'Mana miidhagina shamarranii',
      'Veelloo 1 + Suufii 1'
    ],
    idealFor: 'Gatii salphaan suuraa studio, board 20x30 fi mana miidhagina shamarranii.'
  }
];

export const CONTACT_PHONES = [
  { display: '0988 01 80 16', raw: '0988018016', label: 'Studio & Bookings' },
  { display: '0914 87 80 07', raw: '0914878007', label: 'Bridal Salon & Gowns' }
];

export const PAYMENT_METHODS = [
  {
    name: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000123456789',
    accountName: 'Hawi Pictures & Bridal Zone'
  },
  {
    name: 'Telebirr',
    accountNumber: '0988018016',
    accountName: 'Hawi Pictures / Hawi Habtamu'
  },
  {
    name: 'Awash Bank',
    accountNumber: '01304567890100',
    accountName: 'Hawi Pictures & Bridal Zone'
  },
  {
    name: 'Bank of Abyssinia',
    accountNumber: '89102345',
    accountName: 'Hawi Pictures'
  }
];

export const VENUE_SUGGESTIONS = [
  'Ethiopian Skylight Hotel, Addis Ababa',
  'Sheraton Addis Luxury Collection',
  'Haile Grand Hotel, Addis Ababa',
  'Hyatt Regency Addis Ababa',
  'Capital Hotel and Spa',
  'Kuriftu Resort & Spa Bishoftu',
  'St. George Cathedral Addis Ababa',
  'Holy Trinity Cathedral (Kidist Selassie)',
  'Entoto Natural Park & Kuriftu Entoto',
  'Bole Ambassador Hotel'
];
