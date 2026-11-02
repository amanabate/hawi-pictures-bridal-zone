export interface ServiceItem {
  id: string;
  name: string;
  nameI18n?: {
    en: string;
    om: string;
    am: string;
  };
  category: string;
  tagline: string;
  description: string;
  descriptionI18n?: {
    en: string;
    om: string;
    am: string;
  };
  iconName: 'Camera' | 'Crown' | 'Sparkles' | 'Palette' | 'Heart';
  bookingUrl: string;
  highlights: string[];
}

export const SERVICES_SECTION_DATA = {
  title: 'Our Services',
  subtitle: 'Everything for your special day, in one place.',
  viewPackagesUrl: '/packages',
  viewPackagesLabel: 'View Packages',
  services: [
    {
      id: 'photography',
      name: 'Photography (Studio and Video 4K)',
      nameI18n: {
        en: 'Photography (Studio & Video 4K)',
        om: 'Suuraa (Isteediyoo fi Viidiyoo 4K)',
        am: 'ፎቶግራፍ (ስቱዲዮ እና 4K ቪዲዮ)',
      },
      category: 'Photography & Cinema',
      tagline: 'High-Definition Editorial Storytelling',
      description: 'Master studio portraiture, multi-camera 4K cinematography, and drone coverage capturing every emotional tear and royal celebration.',
      descriptionI18n: {
        en: 'Master studio portraiture, multi-camera 4K cinematography, and drone coverage capturing every emotional tear and royal celebration.',
        om: 'Kaameraawwan 4K, suuraa qilleensa irraa (drone), fi albaamii kiristaalaa qulqullina olaanaa.',
        am: 'በዘመናዊ 4K ካሜራዎች፣ በድሮን የሰማይ ላይ ቀረጻ፣ እና የክሪስታል አልበም ዝግጅት።',
      },
      iconName: 'Camera',
      bookingUrl: '/booking?service=photography',
      highlights: ['Studio & Mask Shoots', '4K Drone & Video', 'Custom Photo Boards'],
    },
    {
      id: 'bridal',
      name: 'Bridal',
      nameI18n: {
        en: 'Bridal',
        om: 'Uffata Misirroo',
        am: 'የሙሽራ ሳሎን',
      },
      category: 'Haute Bridal Suite',
      tagline: 'Gowns & Royal Styling for the Queen',
      description: 'Exclusive imported European wedding gowns, custom veillo veil draping, cathedral trains, and royal tiaras for the discerning bride.',
      descriptionI18n: {
        en: 'Exclusive imported European wedding gowns, custom veillo veil draping, cathedral trains, and royal tiaras for the discerning bride.',
        om: 'Uffata misirroo Awurooppaa irraa dhufe, golgaa (veil), gonfoo mootii, fi safara qophaa\'e.',
        am: 'ከአውሮፓ የመጡ የሙሽራ ጋውኖች፣ የሙሽራ ቬል፣ ዘውድ እና ልኬት ማስተካከያ።',
      },
      iconName: 'Crown',
      bookingUrl: '/booking?service=bridal',
      highlights: ['Paris & Milan Gowns', 'Veillo & Suufii Styling', 'Bridal Suite Fitting'],
    },
    {
      id: 'beauty',
      name: 'Beauty',
      nameI18n: {
        en: 'Beauty',
        om: 'Miidhagina',
        am: 'የውበት ሳሎን',
      },
      category: 'Hawi Beauty Salon',
      tagline: 'Mana Miidhagina Dhiiraafi Shamarranii',
      description: 'Comprehensive luxury salon treatments for both bride and groom: pre-wedding skin therapies, hair artistry, and rejuvenating pampering.',
      descriptionI18n: {
        en: 'Comprehensive luxury salon treatments for both bride and groom: pre-wedding skin therapies, hair artistry, and rejuvenating pampering.',
        om: 'Sirna rifeensa misirroo haala ammayyaatiin tolchuu fi qophii miidhaginaa guutuu.',
        am: 'ልዩ የሙሽራ ፀጉር አሰራር፣ የውበት እንክብካቤ እና ለሚዜዎች የተሟላ አገልግሎት።',
      },
      iconName: 'Sparkles',
      bookingUrl: '/booking?service=beauty',
      highlights: ['Men & Women Grooming', 'Scalp & Hair Artistry', 'Bridal Radiance Prep'],
    },
    {
      id: 'makeup',
      name: 'Makeup',
      nameI18n: {
        en: 'Makeup',
        om: 'Make-up',
        am: 'ሜካፕ',
      },
      category: 'Glamour & Aesthetics',
      tagline: 'Flawless 24-Hour HD Bridal Glam',
      description: 'Sweatproof, camera-ready airbrush artistry, customized contouring, and luminous glow tailored to your unique features and skin tone.',
      descriptionI18n: {
        en: 'Sweatproof, camera-ready airbrush artistry, customized contouring, and luminous glow tailored to your unique features and skin tone.',
        om: 'Make-up qulqullina HD qabu, bishaanin hin dhiqamne fi ifa suuraatiif kan qophaa\'e.',
        am: 'በውሃ የማይጠፋ፣ ለካሜራ ብርሃን ተስማሚ የሆነ ጥራት ያለው HD ሜካፕ።',
      },
      iconName: 'Palette',
      bookingUrl: '/booking?service=makeup',
      highlights: ['24-Hour HD Waterproof', 'Custom Shade Match', 'Bridesmaids & Mother Glam'],
    },
    {
      id: 'aadaa',
      name: 'Aadaa (Traditional)',
      nameI18n: {
        en: 'Aadaa (Traditional)',
        om: 'Aadaa (Uffata Aadaa)',
        am: 'ባህላዊ አልባሳት (አዳ)',
      },
      category: 'Cultural Heritage & Melse',
      tagline: 'Uffata Aadaa fi Qamisii Irbaataa',
      description: 'Authentic Day-2 Melse styling, golden Kaba robes, royal Kebero drum celebrations, and heirloom cultural photography that honors heritage.',
      descriptionI18n: {
        en: 'Authentic Day-2 Melse styling, golden Kaba robes, royal Kebero drum celebrations, and heirloom cultural photography that honors heritage.',
        om: 'Uffata aadaa Oromoo fi Habashaa kan tilfii qabu, fi uffata qophii melseetiif ta\'u.',
        am: 'ጥልፍ ያላቸው የኦሮሞ እና የሀበሻ ባህላዊ አልባሳት፣ እና ለመልስ ዝግጅት የሚሆኑ ልብሶች።',
      },
      iconName: 'Heart',
      bookingUrl: '/booking?service=aadaa',
      highlights: ['Royal Kaba & Kebero Shoots', 'Habesha Kemis & Tilf', 'Melse Heritage Books'],
    },
  ] as ServiceItem[],
};

export function getServiceName(service: ServiceItem, lang: string): string {
  if (service.nameI18n && service.nameI18n[lang as keyof typeof service.nameI18n]) {
    return service.nameI18n[lang as keyof typeof service.nameI18n];
  }
  return service.name;
}

export function getServiceDescription(service: ServiceItem, lang: string): string {
  if (service.descriptionI18n && service.descriptionI18n[lang as keyof typeof service.descriptionI18n]) {
    return service.descriptionI18n[lang as keyof typeof service.descriptionI18n];
  }
  return service.description;
}
