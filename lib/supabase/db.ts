import {
  BookingRow,
  PackageRow,
  ServiceRow,
  GalleryItemRow,
  PaymentRow,
  CapacityRulesRow,
  CapacityOverrideRow,
  BlockedDateRow,
  WaitlistRow,
  ReviewRow,
  SiteSettingsRow,
  ActivityLogRow,
  BookingPeriod,
  BookingStatus,
  PaymentMethod,
  UserRole
} from './types';
import { getSupabaseServerClient } from './server';

// ============================================================================
// Real In-Memory Fallback Store (Pre-seeded with real flyer data)
// Ensures the backend is completely operational before & during Supabase connection.
// ============================================================================

export const SEED_PACKAGES: PackageRow[] = [
  {
    id: 'special-package',
    code: 'PKG-SPECIAL',
    name: {
      en: 'Special Package',
      om: 'Special Package',
      am: 'ልዩ ፓኬጅ (Special Package)'
    },
    description: {
      en: 'Full wedding photography, 4K video, salon and traditional wear with luxury album and boards.',
      om: 'Sagantaa guutuu suuraa, viidiyoo 4K, mana miidhaginaafi uffata aadaa',
      am: 'የተሟላ የሰርግ ፎቶ፣ 4K ቪዲዮ፣ የውበት ሳሎን እና የባህል ልብስ ከቅንጦት አልበም ጋር።'
    },
    price_birr: 60000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '40x60 Album fuula 20', en: '40x60 Album 20 pages', am: '40x60 አልበም 20 ገጽ' },
      { om: '30x60 Album fuula 10', en: '30x60 Album 10 pages', am: '30x60 አልበም 10 ገጽ' },
      { om: 'Mana miidhagina dhiiraafi shamarranii', en: 'Salon for groom and bride', am: 'የወንድና የሴት የውበት ሳሎን' },
      { om: 'Suuraa Edit Softcopy 150 + all soft copy', en: '150 Edited softcopy photos + all raw soft copies', am: '150 የተስተካከለ ሶፍት ኮፒ + ሁሉም ሶፍት ኮፒ' },
      { om: 'Save the date 10', en: 'Save the date (10 copies)', am: 'ሴቭ ዘ ዴት 10' },
      { om: 'Thankyou card 200', en: '200 Thank You cards', am: '200 የምስጋና ካርድ' },
      { om: 'Camera 2', en: '2 Cameras coverage', am: '2 ካሜራ' },
      { om: 'Suuraa Studio, Mask, Video 4k', en: 'Studio photoshoot, Mask & 4K Video', am: 'የስቱዲዮ ፎቶ፣ ማስክ እና 4K ቪዲዮ' },
      { om: '60x120 Board + Hexagon Board 6', en: '60x120 Board + 6 Hexagon Boards', am: '60x120 ቦርድ + 6 ሄክሳጎን ቦርድ' },
      { om: '30x45 SignBoard', en: '30x45 Sign Board', am: '30x45 ሳይን ቦርድ' },
      { om: 'Suufii 3 fi Veelloo 4', en: '3 Suits & 4 Bridal Veils', am: '3 ሱፍ እና 4 ቬሎ' },
      { om: 'Uffata Aadaa fi Qamisii Irbaataa', en: 'Traditional cultural attire & Evening banquet gown', am: 'የባህል ልብስ እና የእራት ቀሚስ' }
    ],
    badge: 'special',
    status: 'active',
    sort_order: 1,
    old_price: 65000,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-1ffaa',
    code: 'PKG-01',
    name: {
      en: 'Package 1 (Paakeejii 1ffaa)',
      om: 'Paakeejii 1ffaa',
      am: 'ፓኬጅ 1 (Paakeejii 1ffaa)'
    },
    description: {
      en: '30x90 laminated album, large boards, salon for both, studio & video coverage.',
      om: 'Album laminated, board gurguddaa, suuraa studio fi viidiyoo gabaabaa',
      am: 'የተሸፈነ አልበም፣ ትላልቅ ቦርዶች፣ የወንድና የሴት ሳሎን እና ቪዲዮ።'
    },
    price_birr: 40000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '30x90 Laminated album fuula 20', en: '30x90 Laminated album 20 pages', am: '30x90 የተሸፈነ አልበም 20 ገጽ' },
      { om: '60x90 Board + 30x45 Board', en: '60x90 Board + 30x45 Board', am: '60x90 ቦርድ + 30x45 ቦርድ' },
      { om: 'Waraqaa Galataa 200', en: '200 Thank You cards', am: '200 የምስጋና ካርድ' },
      { om: 'Suuraa studio, Mask fi Video gabaabaa', en: 'Studio photos, Mask & Highlight video', am: 'የስቱዲዮ ፎቶ፣ ማስክ እና አጭር ቪዲዮ' },
      { om: 'Suuraa edit 100 + all soft copy', en: '100 Edited soft copies + all soft copies', am: '100 የተስተካከለ + ሁሉም ሶፍት ኮፒ' },
      { om: 'Mana miidhagina dhiiraafi shamarranii', en: 'Salon for groom and bride', am: 'የወንድና የሴት የውበት ሳሎን' },
      { om: 'Save the date 5', en: 'Save the date (5 copies)', am: 'ሴቭ ዘ ዴት 5' },
      { om: 'Veelloo 4 + Suufii 2', en: '4 Veils + 2 Suits', am: '4 ቬሎ + 2 ሱፍ' },
      { om: 'Uffata Aadaa + Qamisii Irbaataa', en: 'Traditional cultural dress + Evening gown', am: 'የባህል ልብስ + የእራት ቀሚስ' }
    ],
    badge: 'popular',
    status: 'active',
    sort_order: 2,
    old_price: 45000,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-2ffaa',
    code: 'PKG-02',
    name: {
      en: 'Package 2 (Paakeejii 2ffaa)',
      om: 'Paakeejii 2ffaa',
      am: 'ፓኬጅ 2 (Paakeejii 2ffaa)'
    },
    description: {
      en: 'Laminated album, 3 boards, studio photoshoot, mask and highlight video.',
      om: 'Laminated album, board sadii, suuraa studio, mask fi video',
      am: 'የተሸፈነ አልበም፣ 3 ቦርዶች፣ የስቱዲዮ ፎቶ እና ቪዲዮ።'
    },
    price_birr: 36000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '30x90 Laminated album Fuula 10', en: '30x90 Laminated album 10 pages', am: '30x90 የተሸፈነ አልበም 10 ገጽ' },
      { om: '50x80 Board + 20x30 Board', en: '50x80 Board + 20x30 Board', am: '50x80 ቦርድ + 20x30 ቦርድ' },
      { om: '30x45 sign board', en: '30x45 Sign Board', am: '30x45 ሳይን ቦርድ' },
      { om: 'Waraqaa Galataa 150', en: '150 Thank You cards', am: '150 የምስጋና ካርድ' },
      { om: 'Suura studio, mask fi video', en: 'Studio photos, mask & video', am: 'የስቱዲዮ ፎቶ፣ ማስክ እና ቪዲዮ' },
      { om: 'Edit soft copy 100', en: '100 Edited soft copies', am: '100 የተስተካከለ ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal hair and makeup salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Save the date 5', en: 'Save the date (5 copies)', am: 'ሴቭ ዘ ዴት 5' },
      { om: 'Veelloo 3 + Suufii 2', en: '3 Veils + 2 Suits', am: '3 ቬሎ + 2 ሱፍ' },
      { om: 'Uffata Aadaa + Qamisii Irbaataa', en: 'Traditional dress + Evening gown', am: 'የባህል ልብስ + የእራት ቀሚስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 3,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-3ffaa',
    code: 'PKG-03',
    name: {
      en: 'Package 3 (Paakeejii 3ffaa)',
      om: 'Paakeejii 3ffaa',
      am: 'ፓኬጅ 3 (Paakeejii 3ffaa)'
    },
    description: {
      en: '30x60 laminated album, 2 boards, 100 thank you cards, bridal salon & 3 veils.',
      om: '30x60 Laminated album, board lama, waraqaa galataa fi veelloo 3',
      am: '30x60 አልበም፣ 2 ቦርዶች፣ 100 የምስጋና ካርዶች እና 3 ቬሎ።'
    },
    price_birr: 32000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '30x60 laminated album fuula 10', en: '30x60 Laminated album 10 pages', am: '30x60 የተሸፈነ አልበም 10 ገጽ' },
      { om: '50x80 Board', en: '50x80 Board', am: '50x80 ቦርድ' },
      { om: '30x45 SignBord', en: '30x45 Sign Board', am: '30x45 ሳይን ቦርድ' },
      { om: 'Waraqaa Galataa 100', en: '100 Thank You cards', am: '100 የምስጋና ካርድ' },
      { om: 'Suura Studio, Mask fi video', en: 'Studio photos, mask & video', am: 'የስቱዲዮ ፎቶ፣ ማስክ እና ቪዲዮ' },
      { om: 'Softcopy 100', en: '100 Soft copies', am: '100 ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Save the date 1', en: 'Save the date (1 copy)', am: 'ሴቭ ዘ ዴት 1' },
      { om: 'Veelloo 3 fi Suufii 2', en: '3 Veils & 2 Suits', am: '3 ቬሎ እና 2 ሱፍ' },
      { om: 'Uffata Aadaa fi Qamisii Irbaataa', en: 'Traditional attire & Evening gown', am: 'የባህል ልብስ እና የእራት ቀሚስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 4,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-4ffaa',
    code: 'PKG-04',
    name: {
      en: 'Package 4 (Paakeejii 4ffaa)',
      om: 'Paakeejii 4ffaa',
      am: 'ፓኬጅ 4 (Paakeejii 4ffaa)'
    },
    description: {
      en: '50x80 Board, 20x30 sign board, 70 soft copies, bridal salon and 3 veils.',
      om: '50x80 Board, 20x30 SignBoard, softcopy 70, mana miidhaginaa fi veelloo 3',
      am: '50x80 ቦርድ፣ 20x30 ቦርድ፣ 70 ሶፍት ኮፒ እና 3 ቬሎ።'
    },
    price_birr: 28000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '50x80 Board', en: '50x80 Board', am: '50x80 ቦርድ' },
      { om: '20x30 SignBoard', en: '20x30 Sign Board', am: '20x30 ሳይን ቦርድ' },
      { om: 'Waraqaa Galataa 50', en: '50 Thank You cards', am: '50 የምስጋና ካርድ' },
      { om: 'Suuraa Studio + Suuraa Mask', en: 'Studio photos + Mask photos', am: 'የስቱዲዮ ፎቶ + ማስክ ፎቶ' },
      { om: 'Softcopy Edit 70', en: '70 Edited soft copies', am: '70 የተስተካከለ ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Veelloo 3 + Suufii 2', en: '3 Veils + 2 Suits', am: '3 ቬሎ + 2 ሱፍ' },
      { om: 'Uffata Aadaa fi Qamisii Irbaataa', en: 'Traditional dress & Evening gown', am: 'የባህል ልብስ እና የእራት ቀሚስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 5,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-5ffaa',
    code: 'PKG-05',
    name: {
      en: 'Package 5 (Paakeejii 5ffaa)',
      om: 'Paakeejii 5ffaa',
      am: 'ፓኬጅ 5 (Paakeejii 5ffaa)'
    },
    description: {
      en: '50x80 Board, studio & mask, 50 soft copies, bridal salon, 2 veils and 2 suits.',
      om: '50x80 Board, studio + mask, softcopy 50, mana miidhaginaa, veelloo 2 fi suufii 2',
      am: '50x80 ቦርድ፣ ስቱዲዮ እና ማስክ፣ 50 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 2 ቬሎ እና 2 ሱፍ።'
    },
    price_birr: 24000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '50x80 Board', en: '50x80 Board', am: '50x80 ቦርድ' },
      { om: 'Suuraa studio + Mask', en: 'Studio photos + Mask', am: 'የስቱዲዮ ፎቶ + ማስክ' },
      { om: 'Softcopy Edit 50', en: '50 Edited soft copies', am: '50 የተስተካከለ ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Veelloo 2 + Suufii 2', en: '2 Veils + 2 Suits', am: '2 ቬሎ + 2 ሱፍ' },
      { om: 'Uffata Aadaa + Qamisii Irbaataa', en: 'Traditional dress + Evening gown', am: 'የባህል ልብስ + የእራት ቀሚስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 6,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-6ffaa',
    code: 'PKG-06',
    name: {
      en: 'Package 6 (Paakeejii 6ffaa)',
      om: 'Paakeejii 6ffaa',
      am: 'ፓኬጅ 6 (Paakeejii 6ffaa)'
    },
    description: {
      en: '40x60 Board, studio or mask photos, 50 soft copies, bridal salon and traditional wear.',
      om: '40x60 Board, suuraa studio ykn mask, softcopy 50, mana miidhaginaa fi uffata aadaa',
      am: '40x60 ቦርድ፣ የስቱዲዮ ፎቶ፣ 50 ሶፍት ኮፒ፣ የውበት ሳሎን እና የባህል ልብስ።'
    },
    price_birr: 20000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '40x60 Board', en: '40x60 Board', am: '40x60 ቦርድ' },
      { om: 'Suuraa studio ykn Mask', en: 'Studio photos or Mask', am: 'የስቱዲዮ ፎቶ ወይም ማስክ' },
      { om: 'Softcopy edit 50', en: '50 Edited soft copies', am: '50 የተስተካከለ ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Veelloo 2 + Suufii 2', en: '2 Veils + 2 Suits', am: '2 ቬሎ + 2 ሱፍ' },
      { om: 'Uffata Aadaa', en: 'Traditional cultural attire', am: 'የባህል ልብስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 7,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-7ffaa',
    code: 'PKG-07',
    name: {
      en: 'Package 7 (Paakeejii 7ffaa)',
      om: 'Paakeejii 7ffaa',
      am: 'ፓኬጅ 7 (Paakeejii 7ffaa)'
    },
    description: {
      en: '30x45 Board, studio photos, 40 soft copies, bridal salon, 1 veil and 1 suit.',
      om: '30x45 Board, suuraa studio, softcopy 40, mana miidhaginaa, veelloo 1 fi suufii 1',
      am: '30x45 ቦርድ፣ የስቱዲዮ ፎቶ፣ 40 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 1 ቬሎ እና 1 ሱፍ።'
    },
    price_birr: 16000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '30x45 Board', en: '30x45 Board', am: '30x45 ቦርድ' },
      { om: 'Suuraa Studio', en: 'Studio photoshoot', am: 'የስቱዲዮ ፎቶ' },
      { om: 'Softcopy edit 40', en: '40 Edited soft copies', am: '40 የተስተካከለ ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Veelloo 1 + Suufii 1', en: '1 Veil + 1 Suit', am: '1 ቬሎ + 1 ሱፍ' },
      { om: 'Uffata Aadaa', en: 'Traditional dress', am: 'የባህል ልብስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 8,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'paakeejii-8ffaa',
    code: 'PKG-08',
    name: {
      en: 'Package 8 (Paakeejii 8ffaa)',
      om: 'Paakeejii 8ffaa',
      am: 'ፓኬጅ 8 (Paakeejii 8ffaa)'
    },
    description: {
      en: '20x30 Board, studio photoshoot, 30 soft copies, bridal salon, 1 veil and 1 suit.',
      om: '20x30 Board, suuraa studio, softcopy 30, mana miidhaginaa, veelloo 1 fi suufii 1',
      am: '20x30 ቦርድ፣ የስቱዲዮ ፎቶ፣ 30 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 1 ቬሎ እና 1 ሱፍ።'
    },
    price_birr: 12000,
    deposit_type: 'fixed',
    deposit_value: null,
    included_items: [
      { om: '20x30 Board', en: '20x30 Board', am: '20x30 ቦርድ' },
      { om: 'Suuraa Studio', en: 'Studio photoshoot', am: 'የስቱዲዮ ፎቶ' },
      { om: 'Softcopy 30', en: '30 Soft copies', am: '30 ሶፍት ኮፒ' },
      { om: 'Mana miidhagina shamarranii', en: 'Bridal salon', am: 'የሴት የውበት ሳሎን' },
      { om: 'Veelloo 1 + Suufii 1', en: '1 Veil + 1 Suit', am: '1 ቬሎ + 1 ሱፍ' },
      { om: 'Uffata Aadaa', en: 'Traditional dress', am: 'የባህል ልብስ' }
    ],
    badge: 'none',
    status: 'active',
    sort_order: 9,
    old_price: null,
    discount_ends_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const SEED_SERVICES: ServiceRow[] = [
  {
    id: 'srv-photography',
    name: { en: 'Photography & 4K Video', om: 'Suuraafi Viidiyoo 4K', am: 'ፎቶግራፍ እና 4K ቪዲዮ' },
    description: {
      en: 'Studio portraits, outdoor ceremonies, drone cinematography and 4K ultra-HD wedding films.',
      om: 'Suuraa istuudiyoo, bakkawwan alaa, fiilmii cidhaa qulqullina olaanaa 4K fi viidiyoo diroonii.',
      am: 'የስቱዲዮ ፎቶዎች፣ የውጪ ፕሮግራሞች፣ 4K ጥራት ያለው የሰርግ ቪዲዮ እና የድሮን ቀረጻ።'
    },
    image_url: '/images/hawi_wedding_photography_1793302557354.jpg',
    starting_price: 12000,
    sort_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-bridal',
    name: { en: 'Bridal Salon & Styling', om: 'Istudaayilii Misirroo', am: 'የሙሽራ ሳሎን እና ስታይሊንግ' },
    description: {
      en: 'Luxury wedding gowns, veils, accessories and complete royal bride transformations.',
      om: 'Uffata misirroo gurguddaa (Veelloo), faayaalee babbareedoo fi qophii kabajaa guutuu.',
      am: 'የቅንጦት የሰርግ ቬሎዎች፣ ጌጣጌጦች እና የተሟላ የሙሽራ ድምቀት።'
    },
    image_url: '/images/hawi_bridal_gown_1793302558528.jpg',
    starting_price: 16000,
    sort_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-beauty',
    name: { en: 'Beauty & Hair Salon', om: 'Mana Miidhagina Rifeensaa', am: 'የውበትና የፀጉር ሳሎን' },
    description: {
      en: 'Professional bridal hair styling, modern crowns, grooming for groom and bridal party.',
      om: 'Istudaayilii rifeensaa ammayyaa, gonfoo misirroo, fi qophii miidhagina dhiiraafi shamarranii.',
      am: 'ዘመናዊ የሙሽራ ፀጉር አሰራር፣ አክሊል እና ለሚዜዎች የተሟላ የውበት አገልግሎት።'
    },
    image_url: '/images/hawi_bridal_makeup_1793302556782.jpg',
    starting_price: 10000,
    sort_order: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-makeup',
    name: { en: 'Glamour Makeup', om: 'Meekappi Misirroo', am: 'የሙሽራ ሜካፕ' },
    description: {
      en: 'Long-lasting HD waterproof glam bridal and groom makeup crafted for 4K lenses.',
      om: 'Meekappii bishaan hin balleessine, ifa 4K dura dhaabbatu fi bareedina addaa kennu.',
      am: 'ለ4K ካሜራ ተስማሚ የሆነ፣ ውሀ የማያጠፋውና ለረጅም ሰዓት የሚቆይ የሙሽራ ሜካፕ።'
    },
    image_url: '/images/hawi_bridal_makeup_1793302556782.jpg',
    starting_price: 8000,
    sort_order: 4,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-aadaa',
    name: { en: 'Aadaa (Traditional Attire)', om: 'Uffata Aadaa (Melse)', am: 'የባህል ልብስ (መልስ)' },
    description: {
      en: 'Authentic Oromo and Habesha cultural wedding gowns, Melse wear, and traditional jewelry.',
      om: 'Uffata aadaa Oromoo fi Habashaa qulqullina olaanaa, uffata Melse fi faayaalee aadaa.',
      am: 'ጥራት ያላቸው የኦሮሞ እና የሀበሻ ባህላዊ የሰርግ እና የመልስ ልብሶች ከባህላዊ ጌጦች ጋር።'
    },
    image_url: '/images/hawi_traditional_aadaa_1793302559000.jpg',
    starting_price: 12000,
    sort_order: 5,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const SEED_GALLERY: GalleryItemRow[] = [
  {
    id: 'gal-1',
    category: 'wedding',
    type: 'image',
    url: '/images/hawi_hero_wedding_1793302555646.jpg',
    caption: {
      en: 'Romantic Sunset Wedding Couple',
      om: 'Jaalalleewwan Cidhaa Yeroo Lixa Aduu',
      am: 'የፍቅር የሰርግ ጥንዶች በጀምበር መጥለቂያ'
    },
    alt_text: 'Bride and Groom in Ethiopian wedding attire at sunset',
    album_name: 'Sunset Weddings',
    is_featured: true,
    is_visible: true,
    sort_order: 1,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gal-2',
    category: 'bridal',
    type: 'image',
    url: '/images/hawi_bridal_gown_1793302558528.jpg',
    caption: {
      en: 'Royal Bridal Gown and Veil',
      om: 'Veelloo fi Uffata Misirroo Mootummaa',
      am: 'የንግስት የሰርግ ቬሎ እና ጌጣጌጥ'
    },
    alt_text: 'Elegant bridal gown with detailed veil and sparkling tiara',
    album_name: 'Royal Bridal',
    is_featured: true,
    is_visible: true,
    sort_order: 2,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gal-3',
    category: 'makeup',
    type: 'image',
    url: '/images/hawi_bridal_makeup_1793302556782.jpg',
    caption: {
      en: 'High Definition Bridal Glam Makeup',
      om: 'Meekappii Misirroo Qulqullina Olaanaa',
      am: 'ዘመናዊ ጥራት ያለው የሙሽራ ሜካፕ'
    },
    alt_text: 'Close up of bridal makeup and hairstyling',
    album_name: 'Bridal Glam',
    is_featured: true,
    is_visible: true,
    sort_order: 3,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gal-4',
    category: 'traditional',
    type: 'image',
    url: '/images/hawi_traditional_aadaa_1793302559000.jpg',
    caption: {
      en: 'Habesha & Oromo Aadaa Attire',
      om: 'Uffata Aadaa Oromoo fi Habashaa',
      am: 'የሀበሻ እና የኦሮሞ ባህላዊ የሰርግ ልብስ'
    },
    alt_text: 'Traditional wedding ceremony clothing and cultural jewelry',
    album_name: 'Aadaa Oromoo',
    is_featured: true,
    is_visible: true,
    sort_order: 4,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gal-5',
    category: 'studio',
    type: 'image',
    url: '/images/hawi_wedding_photography_1793302557354.jpg',
    caption: {
      en: 'Studio Couple Portrait Session',
      om: 'Waraabbi Suuraa Istuudiyoo Misirroo',
      am: 'የስቱዲዮ ጥንዶች ፎቶግራፍ'
    },
    alt_text: 'Studio lighting portrait of wedding couple',
    album_name: 'Studio Masterpieces',
    is_featured: true,
    is_visible: true,
    sort_order: 5,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gal-6',
    category: 'wedding',
    type: 'image',
    url: '/images/hawi_reception_celebration_1793302558086.jpg',
    caption: {
      en: 'Grand Ballroom Reception Celebration',
      om: 'Sirna Gamachuu Galma Cidhaa',
      am: 'የሰርግ አዳራሽ ድምቀት እና ደስታ'
    },
    alt_text: 'Wedding reception entrance and celebration in Addis Ababa',
    album_name: 'Receptions',
    is_featured: false,
    is_visible: true,
    sort_order: 6,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const SEED_SITE_SETTINGS: SiteSettingsRow = {
  id: 'default',
  phones: ['0988018016', '0914878007'],
  social_links: {
    telegram: 'https://t.me/hawipictures',
    instagram: 'https://instagram.com/hawipictures',
    tiktok: 'https://tiktok.com/@hawipictures',
    facebook: 'https://facebook.com/hawipictures'
  },
  address: {
    en: 'Addis Ababa, Bole Road, Hawi Building 2nd Floor, Ethiopia',
    om: 'Finfinnee, Daandii Boolee, Gamoo Hawii Abbaa Fooxaa 2ffaa, Itoophiyaa',
    am: 'አዲስ አበባ፣ ቦሌ መንገድ፣ ሃዊ ህንፃ 2ኛ ፎቅ፣ ኢትዮጵያ'
  },
  opening_hours: {
    weekdays: '8:30 AM - 7:00 PM',
    saturday: '8:00 AM - 8:00 PM',
    sunday: '8:00 AM - 6:00 PM'
  },
  payment_accounts: {
    telebirr: { name: 'Hawi Pictures', number: '0988018016' },
    cbe: { name: 'Hawi Pictures & Bridal Zone', account: '1000234567890' },
    abyssinia: { name: 'Hawi Pictures', account: '98765432' },
    dashen: { name: 'Hawi Pictures', account: '54321098' }
  },
  cancellation_policy: {
    en: 'Deposits are fully refundable up to 30 days before the wedding date. Within 14-30 days, deposit may be credited toward rescheduling. Within 14 days, deposit is non-refundable.',
    om: 'Kaffaltiin qabsiisaa guyyaa cidhaa dura hanga guyyaa 30tti guutummaatti deebi\'a. Guyyoota 14-30 gidduutti, guyyaa biraatti jijjiirachuuf ni danda\'ama. Guyyoota 14 gadi yoo ta\'e garuu hin deebi\'u.',
    am: 'የቅድመ ክፍያ ተመላሽ ከሰርጉ ቀን 30 ቀናት በፊት ሙሉ በሙሉ ይመለሳል። ከ14-30 ቀናት ውስጥ ቀኑን ለመቀየር ይቻላል። ከ14 ቀናት በታች ከሆነ ተመላሽ አይሆንም።'
  },
  telegram_templates: {
    en: 'Hello {customer_name}! Your booking {booking_code} for {package_name} on {event_date} is now {status}. Reason/Notes: {reason}. Thank you for choosing Hawi Pictures!',
    om: 'Akkam jirtu {customer_name}! Qabannaan keessan {booking_code} paakeejii {package_name} guyyaa {event_date} haala {status} irra jira. Sababa/Yaada: {reason}. Hawi Pictures filachuu keessaniif galatoomaa!','am': 'ጤና ይስጥልን {customer_name}! የሰርግ ማስያዣዎ {booking_code} ለ{package_name} ቀን {event_date} ወደ {status} ተቀይሯል። ምክንያት/ማስታወሻ: {reason}። ሃዊ ፒክቸርስን ስለመረጡ እናመሰግናለን!'
  },
  notice_text: {
    title: { en: 'NOTICE (Hubachiisa)', om: 'HUBACHIISA', am: 'ማስታወሻ' },
    en: 'Not included in the packages: park entrance fee and other listed items (shirt, tie, shoes, and wig).',
    om: 'Gatii seensa paarkii, geekiness fi Shamizii, kaarabaataa, kophee fi wiiggiin Paakeejjii keessa hin jiru.',
    am: 'በጥቅሉ ውስጥ የማይካተቱ፡ የፓርክ መግቢያ ክፍያ፣ ሸሚዝ፣ ከረባት፣ ጫማ እና ዊግ።'
  },
  hold_times: {
    reminder_hours: 24,
    expiry_hours: 48
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const SEED_CAPACITY_RULES: CapacityRulesRow = {
  id: 'default',
  default_per_day: 4,
  default_per_period: 2,
  per_weekday: {
    '0': 2, // Sunday
    '1': 2, // Monday
    '2': 2, // Tuesday
    '3': 2, // Wednesday
    '4': 3, // Thursday
    '5': 5, // Friday
    '6': 6  // Saturday
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// ----------------------------------------------------------------------------
// In-Memory Database Store (Simulates PostgreSQL with full constraints)
// ----------------------------------------------------------------------------
class MemoryDatabase {
  packages: PackageRow[] = [...SEED_PACKAGES];
  services: ServiceRow[] = [...SEED_SERVICES];
  gallery: GalleryItemRow[] = [...SEED_GALLERY];
  bookings: BookingRow[] = [];
  payments: PaymentRow[] = [];
  capacityRules: CapacityRulesRow = { ...SEED_CAPACITY_RULES };
  capacityOverrides: CapacityOverrideRow[] = [];
  blockedDates: BlockedDateRow[] = [];
  waitlist: WaitlistRow[] = [];
  reviews: ReviewRow[] = [
    {
      id: 'rev-1',
      booking_id: null,
      customer_name: 'Bilen & Henok',
      rating: 5,
      text: 'Hawi Pictures made our wedding unforgettable! The 4K video and bridal styling exceeded all expectations.',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'rev-2',
      booking_id: null,
      customer_name: 'Tolasaa & Caaltuu',
      rating: 5,
      text: 'Uffanni aadaafi suuraan album laminated baay\'ee bareda. Hojii qulqullina qabu nuuf hojjetan.',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString()
    }
  ];
  siteSettings: SiteSettingsRow = { ...SEED_SITE_SETTINGS };
  activityLogs: ActivityLogRow[] = [];
  bookingSequence = 1;

  // Simple mutex for concurrency synchronization in Node
  private lockPromise: Promise<void> = Promise.resolve();

  async acquireLock<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void = () => {};
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lockPromise;
    this.lockPromise = currentLock.then(() => nextLock);
    await currentLock;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  getNextBookingCode(): string {
    const code = `HAWI-${String(this.bookingSequence).padStart(4, '0')}`;
    this.bookingSequence += 1;
    return code;
  }
}

// Global singleton instance
const globalDbKey = Symbol.for('hawi.memory.db');
const globalObject = globalThis as unknown as { [globalDbKey]?: MemoryDatabase };
if (!globalObject[globalDbKey]) {
  globalObject[globalDbKey] = new MemoryDatabase();
}
export const memDb: MemoryDatabase = globalObject[globalDbKey]!;

// ============================================================================
// Service Layer: Unified DB operations (Supabase when connected, Fallback when local)
// ============================================================================

/**
 * Retrieves monthly availability with priority rule order:
 * 1. blocked_dates
 * 2. capacity_overrides
 * 3. capacity_rules.per_weekday
 * 4. capacity_rules.default_per_day / default_per_period
 */
export async function getMonthlyAvailability(yearMonth: string): Promise<Array<{
  date: string;
  status: 'available' | 'limited' | 'full' | 'blocked';
  isBlocked: boolean;
  blockedReason?: string | null;
  bookedCount: number;
  maxCapacity: number;
  fullPeriods: string[];
  periodCounts: { morning: number; afternoon: number; evening: number; full_day: number };
}>> {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const results = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = String(dateObj.getDay());

    // 1. Check blocked date
    const blocked = memDb.blockedDates.find((b) => b.date === dateStr);
    if (blocked) {
      results.push({
        date: dateStr,
        status: 'blocked' as const,
        isBlocked: true,
        blockedReason: blocked.reason,
        bookedCount: 0,
        maxCapacity: 0,
        fullPeriods: ['morning', 'afternoon', 'evening', 'full_day'],
        periodCounts: { morning: 0, afternoon: 0, evening: 0, full_day: 0 }
      });
      continue;
    }

    // 2. Capacity limit (Override -> Weekday -> Default)
    const override = memDb.capacityOverrides.find((o) => o.date === dateStr);
    let maxDay = memDb.capacityRules.default_per_day;
    let maxPeriod = memDb.capacityRules.default_per_period;

    if (override) {
      maxDay = override.max_per_day;
      maxPeriod = override.max_per_period;
    } else if (memDb.capacityRules.per_weekday[dayOfWeek] !== undefined) {
      maxDay = memDb.capacityRules.per_weekday[dayOfWeek];
      maxPeriod = memDb.capacityRules.default_per_period;
    }

    // 3. Count active bookings (pending and confirmed count; rejected, cancelled, expired do NOT)
    const activeBookings = memDb.bookings.filter(
      (b) => b.event_date === dateStr && (b.status === 'pending' || b.status === 'confirmed')
    );

    const mCount = activeBookings.filter((b) => b.period === 'morning').length;
    const aCount = activeBookings.filter((b) => b.period === 'afternoon').length;
    const eCount = activeBookings.filter((b) => b.period === 'evening').length;
    const fCount = activeBookings.filter((b) => b.period === 'full_day').length;
    const bookedCount = activeBookings.length;

    const fullPeriods: string[] = [];
    if (mCount + fCount >= maxPeriod) fullPeriods.push('morning');
    if (aCount + fCount >= maxPeriod) fullPeriods.push('afternoon');
    if (eCount + fCount >= maxPeriod) fullPeriods.push('evening');
    if (bookedCount >= maxDay) fullPeriods.push('full_day');

    let status: 'available' | 'limited' | 'full' = 'available';
    if (bookedCount >= maxDay) {
      status = 'full';
    } else if (bookedCount >= Math.ceil(maxDay / 2)) {
      status = 'limited';
    }

    results.push({
      date: dateStr,
      status,
      isBlocked: false,
      blockedReason: null,
      bookedCount,
      maxCapacity: maxDay,
      fullPeriods,
      periodCounts: { morning: mCount, afternoon: aCount, evening: eCount, full_day: fCount }
    });
  }

  return results;
}

/**
 * Atomic booking creation with concurrency locking, validation,
 * snapshotting and duplicate payment reference checking.
 */
export async function createBookingAtomic(params: {
  customerName: string;
  phone: string;
  telegramUsername?: string | null;
  phoneOnly: boolean;
  packageId: string;
  eventDate: string;
  period: BookingPeriod;
  venue: string;
  city?: string;
  notes?: string;
  language: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  screenshotPath?: string;
  isOwnerOverride?: boolean;
  overrideReason?: string;
}): Promise<{
  success: boolean;
  booking: BookingRow;
  payment: PaymentRow;
  isDuplicateRef: boolean;
}> {
  return memDb.acquireLock(async () => {
    // 1. Phone validation: Ethiopian mobile 09xxxxxxxx
    const cleanPhone = params.phone.replace(/[\s-]/g, '');
    let normPhone = cleanPhone;
    if (normPhone.startsWith('+2519')) normPhone = '09' + normPhone.slice(5);
    else if (normPhone.startsWith('2519')) normPhone = '09' + normPhone.slice(4);

    if (!/^09\d{8}$/.test(normPhone)) {
      throw {
        code: 'INVALID_PHONE',
        messageKey: 'validation.phone_invalid',
        message: 'Phone number must be a valid Ethiopian mobile number (09xxxxxxxx).'
      };
    }

    // 2. Telegram username validation
    let cleanTelegram: string | null = null;
    if (!params.phoneOnly && params.telegramUsername) {
      let u = params.telegramUsername.trim();
      if (u.startsWith('@')) u = u.slice(1);
      if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(u)) {
        throw {
          code: 'INVALID_TELEGRAM',
          messageKey: 'validation.telegram_invalid',
          message: 'Telegram username must be 5 to 32 characters, start with a letter, and contain only letters, numbers, and underscores.'
        };
      }
      cleanTelegram = u;
    }

    // 3. Future date check
    const todayStr = new Date().toISOString().split('T')[0];
    if (params.eventDate <= todayStr) {
      throw {
        code: 'DATE_IN_PAST',
        messageKey: 'validation.date_in_past',
        message: 'Event date must be in the future.'
      };
    }

    // 4. Verify package
    const pkg = memDb.packages.find((p) => p.id === params.packageId && !p.deleted_at);
    if (!pkg) {
      throw {
        code: 'PACKAGE_NOT_FOUND',
        messageKey: 'validation.package_not_found',
        message: 'The selected wedding package is not available.'
      };
    }

    // 5. Blocked date check
    const blocked = memDb.blockedDates.find((b) => b.date === params.eventDate);
    if (blocked && !params.isOwnerOverride) {
      throw {
        code: 'DATE_BLOCKED',
        messageKey: 'errors.date_blocked',
        message: `This date is blocked for studio bookings: ${blocked.reason}`
      };
    }

    // 6. Capacity check with lock
    if (!params.isOwnerOverride) {
      const dayOfWeek = String(new Date(params.eventDate).getDay());
      const override = memDb.capacityOverrides.find((o) => o.date === params.eventDate);

      let maxDay = memDb.capacityRules.default_per_day;
      let maxPeriod = memDb.capacityRules.default_per_period;

      if (override) {
        maxDay = override.max_per_day;
        maxPeriod = override.max_per_period;
      } else if (memDb.capacityRules.per_weekday[dayOfWeek] !== undefined) {
        maxDay = memDb.capacityRules.per_weekday[dayOfWeek];
      }

      const activeBookings = memDb.bookings.filter(
        (b) => b.event_date === params.eventDate && (b.status === 'pending' || b.status === 'confirmed')
      );

      if (activeBookings.length >= maxDay) {
        throw {
          code: 'DATE_UNAVAILABLE',
          messageKey: 'errors.date_unavailable',
          message: 'This date just became unavailable, please choose another.'
        };
      }

      if (params.period !== 'full_day') {
        const periodBookings = activeBookings.filter(
          (b) => b.period === params.period || b.period === 'full_day'
        );
        if (periodBookings.length >= maxPeriod) {
          throw {
            code: 'DATE_UNAVAILABLE',
            messageKey: 'errors.period_unavailable',
            message: 'The selected time period is already fully booked for this date.'
          };
        }
      }
    }

    // 7. Duplicate reference number check
    const cleanRef = params.referenceNumber.trim();
    const isDuplicateRef = memDb.payments.some(
      (p) => p.reference_number.toLowerCase() === cleanRef.toLowerCase()
    );

    // 8. Calculate deposit snapshot
    let depositAmount = Math.round(pkg.price_birr * 0.3); // 30% default
    if (pkg.deposit_type === 'percent' && pkg.deposit_value) {
      depositAmount = Math.round((pkg.price_birr * pkg.deposit_value) / 100);
    } else if (pkg.deposit_value && pkg.deposit_value > 0) {
      depositAmount = pkg.deposit_value;
    }

    const bookingCode = memDb.getNextBookingCode();
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 11);
    const holdExpires = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    const newBooking: BookingRow = {
      id: bookingId,
      booking_code: bookingCode,
      customer_name: params.customerName.trim(),
      phone: normPhone,
      telegram_username: cleanTelegram,
      phone_only: params.phoneOnly,
      package_id: pkg.id,
      package_name_snapshot: pkg.name.om || pkg.name.en,
      package_price_snapshot: pkg.price_birr,
      deposit_amount_snapshot: depositAmount,
      event_date: params.eventDate,
      period: params.period,
      venue: params.venue.trim(),
      city: params.city?.trim() || 'Addis Ababa',
      notes: params.notes?.trim() || null,
      language: params.language || 'om',
      status: 'pending',
      payment_status: 'deposit_submitted',
      status_reason: null,
      hold_expires_at: holdExpires,
      assigned_staff_id: null,
      notified_at: null,
      notified_by: null,
      is_overridden_by_owner: Boolean(params.isOwnerOverride),
      override_reason: params.overrideReason || null,
      admin_private_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 11);
    const newPayment: PaymentRow = {
      id: paymentId,
      booking_id: bookingId,
      kind: 'deposit',
      amount: depositAmount,
      method: params.paymentMethod,
      reference_number: cleanRef,
      screenshot_path: params.screenshotPath || null,
      status: 'submitted',
      is_duplicate_ref: isDuplicateRef,
      recorded_by: null,
      created_at: new Date().toISOString()
    };

    memDb.bookings.unshift(newBooking);
    memDb.payments.unshift(newPayment);

    // Insert-only audit log
    memDb.activityLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      actor_id: null,
      actor_name: params.isOwnerOverride ? 'Owner (Override)' : 'Customer',
      action: 'CREATE_BOOKING',
      entity: 'bookings',
      entity_id: bookingId,
      before: null,
      after: {
        booking_code: bookingCode,
        customer_name: newBooking.customer_name,
        package_id: newBooking.package_id,
        event_date: newBooking.event_date,
        is_duplicate_ref: isDuplicateRef,
        is_owner_override: params.isOwnerOverride
      },
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      booking: newBooking,
      payment: newPayment,
      isDuplicateRef
    };
  });
}

/**
 * Secure Status Check: Requires both booking code AND phone number.
 * Returns only safe status info; never leaks other customers' data or screenshots.
 */
export async function checkBookingStatus(
  bookingCode: string,
  phone: string
): Promise<{
  booking_code: string;
  customer_name: string;
  status: BookingStatus;
  payment_status: string;
  package_name: string;
  event_date: string;
  period: string;
  venue: string;
  status_reason: string | null;
  hold_expires_at: string;
} | null> {
  const cleanCode = bookingCode.trim().toUpperCase();
  const cleanPhone = phone.replace(/[\s-]/g, '');

  const booking = memDb.bookings.find(
    (b) =>
      b.booking_code.toUpperCase() === cleanCode &&
      (b.phone === cleanPhone ||
        b.phone.endsWith(cleanPhone.slice(-8)) ||
        cleanPhone.endsWith(b.phone.slice(-8)))
  );

  if (!booking) {
    return null;
  }

  return {
    booking_code: booking.booking_code,
    customer_name: booking.customer_name,
    status: booking.status,
    payment_status: booking.payment_status,
    package_name: booking.package_name_snapshot,
    event_date: booking.event_date,
    period: booking.period,
    venue: booking.venue,
    status_reason: booking.status_reason,
    hold_expires_at: booking.hold_expires_at
  };
}

/**
 * 15-Minute Cron Job:
 * - Identifies pending bookings older than 24h needing owner reminders
 * - Automatically expires pending bookings older than 48h and releases their date
 */
export async function runExpireCron(): Promise<{
  expiredCount: number;
  remindersDue: number;
  expiredCodes: string[];
}> {
  const now = Date.now();
  const expiredCodes: string[] = [];
  let remindersDue = 0;

  for (const b of memDb.bookings) {
    if (b.status === 'pending') {
      const createdTime = new Date(b.created_at).getTime();
      const holdExpiresTime = new Date(b.hold_expires_at).getTime();

      // Check reminder (24h - 48h)
      if (now - createdTime >= 24 * 3600 * 1000 && now < holdExpiresTime) {
        remindersDue += 1;
      }

      // Check expiry (48h)
      if (now >= holdExpiresTime) {
        b.status = 'expired';
        b.status_reason = 'Payment deposit hold expired after 48 hours without verification.';
        b.notified_at = null; // Show as "not notified" in admin
        b.updated_at = new Date().toISOString();
        expiredCodes.push(b.booking_code);

        memDb.activityLogs.unshift({
          id: 'log_' + Math.random().toString(36).substring(2, 11),
          actor_id: null,
          actor_name: 'System Cron',
          action: 'EXPIRE_BOOKING',
          entity: 'bookings',
          entity_id: b.id,
          before: { status: 'pending' },
          after: { status: 'expired', hold_expires_at: b.hold_expires_at },
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return {
    expiredCount: expiredCodes.length,
    remindersDue,
    expiredCodes
  };
}
