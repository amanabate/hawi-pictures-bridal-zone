export interface GalleryPhoto {
  id: string;
  category: 'Wedding' | 'Bridal' | 'Makeup' | 'Traditional' | 'Studio';
  imageUrl: string;
  caption: string;
  captionI18n?: {
    en: string;
    om: string;
    am: string;
  };
  altText: string;
  location?: string;
}

export type GalleryCategoryFilter = 'All' | 'Wedding' | 'Bridal' | 'Makeup' | 'Traditional' | 'Studio';

export const GALLERY_CATEGORIES: GalleryCategoryFilter[] = [
  'All',
  'Wedding',
  'Bridal',
  'Makeup',
  'Traditional',
  'Studio',
];

export const GALLERY_SECTION_DATA = {
  title: 'Our Gallery',
  subtitle: 'Moments we have captured with love.',
  viewFullGalleryLabel: 'View Full Gallery',
  photos: [
    {
      id: 'photo-1',
      category: 'Wedding',
      imageUrl: '/images/hawi_hero_wedding_1793302555646.jpg',
      caption: 'Royal garden vows and breathtaking embrace under romantic natural sunlight.',
      captionI18n: {
        en: 'Royal garden vows and breathtaking embrace under romantic natural sunlight.',
        om: 'Sirna eebba iddoo abaaboo keessatti ifa aduu uumamaa jalatti waraabame.',
        am: 'በተፈጥሮ የፀሐይ ብርሃን ስር የተካሄደ ውብ የጓሮ ሰርግ እና የቃል ኪዳን ስነ-ስርዓት።',
      },
      altText: 'Ethiopian couple garden wedding ceremony in Addis Ababa',
      location: 'Botanical Garden, Addis Ababa',
    },
    {
      id: 'photo-2',
      category: 'Bridal',
      imageUrl: '/images/hawi_bridal_gown_1793302558528.jpg',
      caption: 'Handcrafted Parisian bridal gown with cathedral veil and Swarovski crystal tiara.',
      captionI18n: {
        en: 'Handcrafted Parisian bridal gown with cathedral veil and Swarovski crystal tiara.',
        om: 'Uffata misirroo Paarisii golgaa dheeraa fi gonfoo kiristaalaa qabu.',
        am: 'የፓሪስ የሙሽራ ጋውን ከረጅም ቬል እና ከክሪስታል ዘውድ ጋር።',
      },
      altText: 'Haute couture bridal gown showroom fitting',
      location: 'Hawi Bridal Zone Suite',
    },
    {
      id: 'photo-3',
      category: 'Makeup',
      imageUrl: '/images/hawi_bridal_makeup_1793302556782.jpg',
      caption: 'Radiant 24-hour waterproof airbrush bridal beauty and flawless sculpt.',
      captionI18n: {
        en: 'Radiant 24-hour waterproof airbrush bridal beauty and flawless sculpt.',
        om: 'Make-up ogummaa sa\'aatii 24 bishaaniin hin badne fi qulqullina olaanaa.',
        am: 'ለ24 ሰዓት በውሃ የማይጠፋ ፍጹም የሆነ የሙሽራ ኤርብረሽ ሜካፕ።',
      },
      altText: 'Bridal glam airbrush makeup and tiara styling',
      location: 'Hawi Beauty Salon',
    },
    {
      id: 'photo-4',
      category: 'Wedding',
      imageUrl: '/images/hawi_wedding_photography_1793302557354.jpg',
      caption: 'Timeless cathedral terrace vow exchange with emotional family blessings.',
      captionI18n: {
        en: 'Timeless cathedral terrace vow exchange with emotional family blessings.',
        om: 'Sirna eebba maatii fi fuudhaa fi heerumaa bataskaana keessatti.',
        am: 'በቤተክርስቲያን ቅጥር ግቢ ውስጥ የተደረገ ስሜት ቀስቃሽ የቤተሰብ ምርቃት እና የጋብቻ ቃል ኪዳን።',
      },
      altText: 'Candid wedding ceremony photography in Ethiopia',
      location: 'Holy Trinity Cathedral',
    },
    {
      id: 'photo-5',
      category: 'Traditional',
      imageUrl: '/images/hawi_reception_celebration_1793302558086.jpg',
      caption: 'Joyful Day-2 Melse celebration in royal gold Kaba robes and Kebero dance.',
      captionI18n: {
        en: 'Joyful Day-2 Melse celebration in royal gold Kaba robes and Kebero dance.',
        om: 'Ayyaana Melse guyyaa 2ffaa uffata Kaabaa warqee fi sirba kaballaan miidhage.',
        am: 'በወርቃማ ካባ እና በከበሮ ጭፈራ የተዋበ ደማቅ የሁለተኛ ቀን መልስ ዝግጅት።',
      },
      altText: 'Traditional Ethiopian Melse celebration with Kaba robes',
      location: 'Skylight Grand Ballroom',
    },
    {
      id: 'photo-6',
      category: 'Studio',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      caption: 'Editorial studio lighting setup with fine-art portraiture backdrop.',
      captionI18n: {
        en: 'Editorial studio lighting setup with fine-art portraiture backdrop.',
        om: 'Isteediyoo ifa ammayyaa fi duubbee suuraa aartii qulqullina olaanaa qabu.',
        am: 'ዘመናዊ የስቱዲዮ መብራቶች እና ለስነ-ጥበብ ፎቶግራፍ የሚሆን ምቹ ዝግጅት።',
      },
      altText: 'Master studio photography setup and romantic portraits',
      location: 'Hawi Bole Studio',
    },
    {
      id: 'photo-7',
      category: 'Bridal',
      imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80',
      caption: 'Intimate morning veil draping and vintage bridal lace details.',
      captionI18n: {
        en: 'Intimate morning veil draping and vintage bridal lace details.',
        om: 'Qophii ganamaa uffachisa golgaa fi leeyisii misirroo miidhagaa.',
        am: 'የጥዋት ዝግጅት፣ የሙሽራ ቬል ማስተካከል እና የጋውን ውበት ዝርዝሮች።',
      },
      altText: 'Bride getting ready with delicate veil and jewelry',
      location: 'Hyatt Regency Suite',
    },
    {
      id: 'photo-8',
      category: 'Makeup',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Champagne gold eye artistry and luminous skin hydration prep.',
      captionI18n: {
        en: 'Champagne gold eye artistry and luminous skin hydration prep.',
        om: 'Bifa ijaa warqee fi qophii gogaa calaqqisu mana miidhaginaa Hawi keessatti.',
        am: 'የዓይን ውበት ማድመቂያ እና ቆዳን የሚያበራ የፊት ሜካፕ ዝግጅት።',
      },
      altText: 'High definition bridal beauty and luminous glow',
      location: 'Hawi Beauty Suite',
    },
    {
      id: 'photo-9',
      category: 'Traditional',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      caption: 'Exquisite Habesha Kemis with authentic handwoven golden Tilf embroidery.',
      captionI18n: {
        en: 'Exquisite Habesha Kemis with authentic handwoven golden Tilf embroidery.',
        om: 'Uffata aadaa Oromoo fi Habashaa kan tilfii warqee harkaan hojjetame.',
        am: 'በእጅ በተሰራ የወርቅ ጥልፍ ያጌጠ ያማረ ባህላዊ የሀበሻ ቀሚስ።',
      },
      altText: 'Traditional Ethiopian and Oromo bridal elegance',
      location: 'Entoto Park',
    },
    {
      id: 'photo-10',
      category: 'Studio',
      imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
      caption: 'Cinematic studio mask, signboard session, and fine art album portraits.',
      captionI18n: {
        en: 'Cinematic studio mask, signboard session, and fine art album portraits.',
        om: 'Waraabsa suuraa maaskii isteediyoo, boordii fi albaamii addaa.',
        am: 'የስቱዲዮ ማክስ፣ ሳይንቦርድ እና ለክሪስታል አልበም የሚሆኑ ውብ ፎቶዎች።',
      },
      altText: 'Master wedding studio portraits for signboards and boards',
      location: 'Hawi Main Studio',
    },
  ] as GalleryPhoto[],
};

export function getGalleryCaption(photo: GalleryPhoto, lang: string): string {
  if (photo.captionI18n && photo.captionI18n[lang as keyof typeof photo.captionI18n]) {
    return photo.captionI18n[lang as keyof typeof photo.captionI18n];
  }
  return photo.caption;
}
