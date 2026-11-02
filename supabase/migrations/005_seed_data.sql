-- ============================================================================
-- 005_seed_data.sql
-- Hawi Pictures & Bridal Zone - Seed Data (Real Flyer Packages & Settings)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Site Settings (Notice / Hubachiisa, Contacts, Banks, Policies, Templates)
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (
  id,
  phones,
  social_links,
  address,
  opening_hours,
  payment_accounts,
  cancellation_policy,
  telegram_templates,
  notice_text,
  hold_times
) VALUES (
  'default',
  ARRAY['0988018016', '0914878007'],
  '{"telegram":"https://t.me/hawipictures","instagram":"https://instagram.com/hawipictures","tiktok":"https://tiktok.com/@hawipictures","facebook":"https://facebook.com/hawipictures"}'::jsonb,
  '{"en":"Addis Ababa, Bole Road, Hawi Building 2nd Floor, Ethiopia","om":"Finfinnee, Daandii Boolee, Gamoo Hawii Abbaa Fooxaa 2ffaa, Itoophiyaa","am":"አዲስ አበባ፣ ቦሌ መንገድ፣ ሃዊ ህንፃ 2ኛ ፎቅ፣ ኢትዮጵያ"}'::jsonb,
  '{"weekdays":"8:30 AM - 7:00 PM","saturday":"8:00 AM - 8:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  '{"telebirr":{"name":"Hawi Pictures","number":"0988018016"},"cbe":{"name":"Hawi Pictures & Bridal Zone","account":"1000234567890"},"abyssinia":{"name":"Hawi Pictures","account":"98765432"},"dashen":{"name":"Hawi Pictures","account":"54321098"}}'::jsonb,
  '{"en":"Deposits are fully refundable up to 30 days before the wedding date. Within 14-30 days, deposit may be credited toward rescheduling. Within 14 days, deposit is non-refundable.","om":"Kaffaltiin qabsiisaa guyyaa cidhaa dura hanga guyyaa 30tti guutummaatti deebi''a. Guyyoota 14-30 gidduutti, guyyaa biraatti jijjiirachuuf ni danda''ama. Guyyoota 14 gadi yoo ta''e garuu hin deebi''u.","am":"የቅድመ ክፍያ ተመላሽ ከሰርጉ ቀን 30 ቀናት በፊት ሙሉ በሙሉ ይመለሳል። ከ14-30 ቀናት ውስጥ ቀኑን ለመቀየር ይቻላል። ከ14 ቀናት በታች ከሆነ ተመላሽ አይሆንም።"}'::jsonb,
  '{"en":"Hello {customer_name}! Your booking {booking_code} for {package_name} on {event_date} is now {status}. Reason/Notes: {reason}. Thank you for choosing Hawi Pictures!","om":"Akkam jirtu {customer_name}! Qabannaan keessan {booking_code} paakeejii {package_name} guyyaa {event_date} haala {status} irra jira. Sababa/Yaada: {reason}. Hawi Pictures filachuu keessaniif galatoomaa!","am":"ጤና ይስጥልን {customer_name}! የሰርግ ማስያዣዎ {booking_code} ለ{package_name} ቀን {event_date} ወደ {status} ተቀይሯል። ምክንያት/ማስታወሻ: {reason}። ሃዊ ፒክቸርስን ስለመረጡ እናመሰግናለን!"}'::jsonb,
  '{"title":{"en":"NOTICE (Hubachiisa)","om":"HUBACHIISA","am":"ማስታወሻ"},"en":"Not included in the packages: park entrance fee and other listed items (shirt, tie, shoes, and wig).","om":"Gatii seensa paarkii, geekiness fi Shamizii, kaarabaataa, kophee fi wiiggiin Paakeejjii keessa hin jiru.","am":"በጥቅሉ ውስጥ የማይካተቱ፡ የፓርክ መግቢያ ክፍያ፣ ሸሚዝ፣ ከረባት፣ ጫማ እና ዊግ።"}'::jsonb,
  '{"reminder_hours":24,"expiry_hours":48}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  phones = EXCLUDED.phones,
  payment_accounts = EXCLUDED.payment_accounts,
  notice_text = EXCLUDED.notice_text;

-- ----------------------------------------------------------------------------
-- 2. Services Seed Data
-- ----------------------------------------------------------------------------
INSERT INTO public.services (id, name, description, image_url, starting_price, sort_order, is_visible)
VALUES
  (
    'srv-photography',
    '{"en":"Photography & 4K Video","om":"Suuraafi Viidiyoo 4K","am":"ፎቶግራፍ እና 4K ቪዲዮ"}'::jsonb,
    '{"en":"Studio portraits, outdoor ceremonies, drone cinematography and 4K ultra-HD wedding films.","om":"Suuraa istuudiyoo, bakkawwan alaa, fiilmii cidhaa qulqullina olaanaa 4K fi viidiyoo diroonii.","am":"የስቱዲዮ ፎቶዎች፣ የውጪ ፕሮግራሞች፣ 4K ጥራት ያለው የሰርግ ቪዲዮ እና የድሮን ቀረጻ።"}'::jsonb,
    '/images/hawi_wedding_photography_1793302557354.jpg',
    12000,
    1,
    true
  ),
  (
    'srv-bridal',
    '{"en":"Bridal Salon & Styling","om":"Istudaayilii Misirroo","am":"የሙሽራ ሳሎን እና ስታይሊንግ"}'::jsonb,
    '{"en":"Luxury wedding gowns, veils, accessories and complete royal bride transformations.","om":"Uffata misirroo gurguddaa (Veelloo), faayaalee babbareedoo fi qophii kabajaa guutuu.","am":"የቅንጦት የሰርግ ቬሎዎች፣ ጌጣጌጦች እና የተሟላ የሙሽራ ድምቀት።"}'::jsonb,
    '/images/hawi_bridal_gown_1793302558528.jpg',
    16000,
    2,
    true
  ),
  (
    'srv-beauty',
    '{"en":"Beauty & Hair Salon","om":"Mana Miidhagina Rifeensaa","am":"የውበትና የፀጉር ሳሎን"}'::jsonb,
    '{"en":"Professional bridal hair styling, modern crowns, grooming for groom and bridal party.","om":"Istudaayilii rifeensaa ammayyaa, gonfoo misirroo, fi qophii miidhagina dhiiraafi shamarranii.","am":"ዘመናዊ የሙሽራ ፀጉር አሰራር፣ አክሊል እና ለሚዜዎች የተሟላ የውበት አገልግሎት።"}'::jsonb,
    '/images/hawi_bridal_makeup_1793302556782.jpg',
    10000,
    3,
    true
  ),
  (
    'srv-makeup',
    '{"en":"Glamour Makeup","om":"Meekappi Misirroo","am":"የሙሽራ ሜካፕ"}'::jsonb,
    '{"en":"Long-lasting HD waterproof glam bridal and groom makeup crafted for 4K lenses.","om":"Meekappii bishaan hin balleessine, ifa 4K dura dhaabbatu fi bareedina addaa kennu.","am":"ለ4K ካሜራ ተስማሚ የሆነ፣ ውሀ የማያጠፋውና ለረጅም ሰዓት የሚቆይ የሙሽራ ሜካፕ።"}'::jsonb,
    '/images/hawi_bridal_makeup_1793302556782.jpg',
    8000,
    4,
    true
  ),
  (
    'srv-aadaa',
    '{"en":"Aadaa (Traditional Attire)","om":"Uffata Aadaa (Melse)","am":"የባህል ልብስ (መልስ)"}'::jsonb,
    '{"en":"Authentic Oromo and Habesha cultural wedding gowns, Melse wear, and traditional jewelry.","om":"Uffata aadaa Oromoo fi Habashaa qulqullina olaanaa, uffata Melse fi faayaalee aadaa.","am":"ጥራት ያላቸው የኦሮሞ እና የሀበሻ ባህላዊ የሰርግ እና የመልስ ልብሶች ከባህላዊ ጌጦች ጋር።"}'::jsonb,
    '/images/hawi_traditional_aadaa_1793302559000.jpg',
    12000,
    5,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  starting_price = EXCLUDED.starting_price;

-- ----------------------------------------------------------------------------
-- 3. The 9 Real Flyer Packages (Afaan Oromoo text kept exactly)
-- ----------------------------------------------------------------------------
INSERT INTO public.packages (
  id,
  code,
  name,
  description,
  price_birr,
  deposit_type,
  deposit_value,
  included_items,
  badge,
  status,
  sort_order,
  old_price
) VALUES
  -- 1. Special Package (60,000 Birr - Badge: special)
  (
    'special-package',
    'PKG-SPECIAL',
    '{"en":"Special Package","om":"Special Package","am":"ልዩ ፓኬጅ (Special Package)"}'::jsonb,
    '{"en":"Full wedding photography, 4K video, salon and traditional wear with luxury album and boards.","om":"Sagantaa guutuu suuraa, viidiyoo 4K, mana miidhaginaafi uffata aadaa","am":"የተሟላ የሰርግ ፎቶ፣ 4K ቪዲዮ፣ የውበት ሳሎን እና የባህል ልብስ ከቅንጦት አልበም ጋር።"}'::jsonb,
    60000,
    'fixed',
    NULL, -- Left empty for owner to fill
    '[
      {"om":"40x60 Album fuula 20","en":"40x60 Album 20 pages","am":"40x60 አልበም 20 ገጽ"},
      {"om":"30x60 Album fuula 10","en":"30x60 Album 10 pages","am":"30x60 አልበም 10 ገጽ"},
      {"om":"Mana miidhagina dhiiraafi shamarranii","en":"Salon for groom and bride","am":"የወንድና የሴት የውበት ሳሎን"},
      {"om":"Suuraa Edit Softcopy 150 + all soft copy","en":"150 Edited softcopy photos + all raw soft copies","am":"150 የተስተካከለ ሶፍት ኮፒ + ሁሉም ሶፍት ኮፒ"},
      {"om":"Save the date 10","en":"Save the date (10 copies)","am":"ሴቭ ዘ ዴት 10"},
      {"om":"Thankyou card 200","en":"200 Thank You cards","am":"200 የምስጋና ካርድ"},
      {"om":"Camera 2","en":"2 Cameras coverage","am":"2 ካሜራ"},
      {"om":"Suuraa Studio, Mask, Video 4k","en":"Studio photoshoot, Mask & 4K Video","am":"የስቱዲዮ ፎቶ፣ ማስክ እና 4K ቪዲዮ"},
      {"om":"60x120 Board + Hexagon Board 6","en":"60x120 Board + 6 Hexagon Boards","am":"60x120 ቦርድ + 6 ሄክሳጎን ቦርድ"},
      {"om":"30x45 SignBoard","en":"30x45 Sign Board","am":"30x45 ሳይን ቦርድ"},
      {"om":"Suufii 3 fi Veelloo 4","en":"3 Suits & 4 Bridal Veils","am":"3 ሱፍ እና 4 ቬሎ"},
      {"om":"Uffata Aadaa fi Qamisii Irbaataa","en":"Traditional cultural attire & Evening banquet gown","am":"የባህል ልብስ እና የእራት ቀሚስ"}
    ]'::jsonb,
    'special',
    'active',
    1,
    65000
  ),

  -- 2. Paakeejii 1ffaa (40,000 Birr - Badge: popular)
  (
    'paakeejii-1ffaa',
    'PKG-01',
    '{"en":"Package 1 (Paakeejii 1ffaa)","om":"Paakeejii 1ffaa","am":"ፓኬጅ 1 (Paakeejii 1ffaa)"}'::jsonb,
    '{"en":"30x90 laminated album, large boards, salon for both, studio & video coverage.","om":"Album laminated, board gurguddaa, suuraa studio fi viidiyoo gabaabaa","am":"የተሸፈነ አልበም፣ ትላልቅ ቦርዶች፣ የወንድና የሴት ሳሎን እና ቪዲዮ።"}'::jsonb,
    40000,
    'fixed',
    NULL,
    '[
      {"om":"30x90 Laminated album fuula 20","en":"30x90 Laminated album 20 pages","am":"30x90 የተሸፈነ አልበም 20 ገጽ"},
      {"om":"60x90 Board + 30x45 Board","en":"60x90 Board + 30x45 Board","am":"60x90 ቦርድ + 30x45 ቦርድ"},
      {"om":"Waraqaa Galataa 200","en":"200 Thank You cards","am":"200 የምስጋና ካርድ"},
      {"om":"Suuraa studio, Mask fi Video gabaabaa","en":"Studio photos, Mask & Highlight video","am":"የስቱዲዮ ፎቶ፣ ማስክ እና አጭር ቪዲዮ"},
      {"om":"Suuraa edit 100 + all soft copy","en":"100 Edited soft copies + all soft copies","am":"100 የተስተካከለ + ሁሉም ሶፍት ኮፒ"},
      {"om":"Mana miidhagina dhiiraafi shamarranii","en":"Salon for groom and bride","am":"የወንድና የሴት የውበት ሳሎን"},
      {"om":"Save the date 5","en":"Save the date (5 copies)","am":"ሴቭ ዘ ዴት 5"},
      {"om":"Veelloo 4 + Suufii 2","en":"4 Veils + 2 Suits","am":"4 ቬሎ + 2 ሱፍ"},
      {"om":"Uffata Aadaa + Qamisii Irbaataa","en":"Traditional cultural dress + Evening gown","am":"የባህል ልብስ + የእራት ቀሚስ"}
    ]'::jsonb,
    'popular',
    'active',
    2,
    45000
  ),

  -- 3. Paakeejii 2ffaa (36,000 Birr)
  (
    'paakeejii-2ffaa',
    'PKG-02',
    '{"en":"Package 2 (Paakeejii 2ffaa)","om":"Paakeejii 2ffaa","am":"ፓኬጅ 2 (Paakeejii 2ffaa)"}'::jsonb,
    '{"en":"Laminated album, 3 boards, studio photoshoot, mask and highlight video.","om":"Laminated album, board sadii, suuraa studio, mask fi video","am":"የተሸፈነ አልበም፣ 3 ቦርዶች፣ የስቱዲዮ ፎቶ እና ቪዲዮ።"}'::jsonb,
    36000,
    'fixed',
    NULL,
    '[
      {"om":"30x90 Laminated album Fuula 10","en":"30x90 Laminated album 10 pages","am":"30x90 የተሸፈነ አልበም 10 ገጽ"},
      {"om":"50x80 Board + 20x30 Board","en":"50x80 Board + 20x30 Board","am":"50x80 ቦርድ + 20x30 ቦርድ"},
      {"om":"30x45 sign board","en":"30x45 Sign Board","am":"30x45 ሳይን ቦርድ"},
      {"om":"Waraqaa Galataa 150","en":"150 Thank You cards","am":"150 የምስጋና ካርድ"},
      {"om":"Suura studio, mask fi video","en":"Studio photos, mask & video","am":"የስቱዲዮ ፎቶ፣ ማስክ እና ቪዲዮ"},
      {"om":"Edit soft copy 100","en":"100 Edited soft copies","am":"100 የተስተካከለ ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal hair and makeup salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Save the date 5","en":"Save the date (5 copies)","am":"ሴቭ ዘ ዴት 5"},
      {"om":"Veelloo 3 + Suufii 2","en":"3 Veils + 2 Suits","am":"3 ቬሎ + 2 ሱፍ"},
      {"om":"Uffata Aadaa + Qamisii Irbaataa","en":"Traditional dress + Evening gown","am":"የባህል ልብስ + የእራት ቀሚስ"}
    ]'::jsonb,
    'none',
    'active',
    3,
    NULL
  ),

  -- 4. Paakeejii 3ffaa (32,000 Birr)
  (
    'paakeejii-3ffaa',
    'PKG-03',
    '{"en":"Package 3 (Paakeejii 3ffaa)","om":"Paakeejii 3ffaa","am":"ፓኬጅ 3 (Paakeejii 3ffaa)"}'::jsonb,
    '{"en":"30x60 laminated album, 2 boards, 100 thank you cards, bridal salon & 3 veils.","om":"30x60 Laminated album, board lama, waraqaa galataa fi veelloo 3","am":"30x60 አልበም፣ 2 ቦርዶች፣ 100 የምስጋና ካርዶች እና 3 ቬሎ።"}'::jsonb,
    32000,
    'fixed',
    NULL,
    '[
      {"om":"30x60 laminated album fuula 10","en":"30x60 Laminated album 10 pages","am":"30x60 የተሸፈነ አልበም 10 ገጽ"},
      {"om":"50x80 Board","en":"50x80 Board","am":"50x80 ቦርድ"},
      {"om":"30x45 SignBord","en":"30x45 Sign Board","am":"30x45 ሳይን ቦርድ"},
      {"om":"Waraqaa Galataa 100","en":"100 Thank You cards","am":"100 የምስጋና ካርድ"},
      {"om":"Suura Studio, Mask fi video","en":"Studio photos, mask & video","am":"የስቱዲዮ ፎቶ፣ ማስክ እና ቪዲዮ"},
      {"om":"Softcopy 100","en":"100 Soft copies","am":"100 ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Save the date 1","en":"Save the date (1 copy)","am":"ሴቭ ዘ ዴት 1"},
      {"om":"Veelloo 3 fi Suufii 2","en":"3 Veils & 2 Suits","am":"3 ቬሎ እና 2 ሱፍ"},
      {"om":"Uffata Aadaa fi Qamisii Irbaataa","en":"Traditional attire & Evening gown","am":"የባህል ልብስ እና የእራት ቀሚስ"}
    ]'::jsonb,
    'none',
    'active',
    4,
    NULL
  ),

  -- 5. Paakeejii 4ffaa (28,000 Birr)
  (
    'paakeejii-4ffaa',
    'PKG-04',
    '{"en":"Package 4 (Paakeejii 4ffaa)","om":"Paakeejii 4ffaa","am":"ፓኬጅ 4 (Paakeejii 4ffaa)"}'::jsonb,
    '{"en":"50x80 Board, 20x30 sign board, 70 soft copies, bridal salon and 3 veils.","om":"50x80 Board, 20x30 SignBoard, softcopy 70, mana miidhaginaa fi veelloo 3","am":"50x80 ቦርድ፣ 20x30 ቦርድ፣ 70 ሶፍት ኮፒ እና 3 ቬሎ።"}'::jsonb,
    28000,
    'fixed',
    NULL,
    '[
      {"om":"50x80 Board","en":"50x80 Board","am":"50x80 ቦርድ"},
      {"om":"20x30 SignBoard","en":"20x30 Sign Board","am":"20x30 ሳይን ቦርድ"},
      {"om":"Waraqaa Galataa 50","en":"50 Thank You cards","am":"50 የምስጋና ካርድ"},
      {"om":"Suuraa Studio + Suuraa Mask","en":"Studio photos + Mask photos","am":"የስቱዲዮ ፎቶ + ማስክ ፎቶ"},
      {"om":"Softcopy Edit 70","en":"70 Edited soft copies","am":"70 የተስተካከለ ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Veelloo 3 + Suufii 2","en":"3 Veils + 2 Suits","am":"3 ቬሎ + 2 ሱፍ"},
      {"om":"Uffata Aadaa fi Qamisii Irbaataa","en":"Traditional dress & Evening gown","am":"የባህል ልብስ እና የእራት ቀሚስ"}
    ]'::jsonb,
    'none',
    'active',
    5,
    NULL
  ),

  -- 6. Paakeejii 5ffaa (24,000 Birr)
  (
    'paakeejii-5ffaa',
    'PKG-05',
    '{"en":"Package 5 (Paakeejii 5ffaa)","om":"Paakeejii 5ffaa","am":"ፓኬጅ 5 (Paakeejii 5ffaa)"}'::jsonb,
    '{"en":"50x80 Board, studio & mask, 50 soft copies, bridal salon, 2 veils and 2 suits.","om":"50x80 Board, studio + mask, softcopy 50, mana miidhaginaa, veelloo 2 fi suufii 2","am":"50x80 ቦርድ፣ ስቱዲዮ እና ማስክ፣ 50 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 2 ቬሎ እና 2 ሱፍ።"}'::jsonb,
    24000,
    'fixed',
    NULL,
    '[
      {"om":"50x80 Board","en":"50x80 Board","am":"50x80 ቦርድ"},
      {"om":"Suuraa studio + Mask","en":"Studio photos + Mask","am":"የስቱዲዮ ፎቶ + ማስክ"},
      {"om":"Softcopy Edit 50","en":"50 Edited soft copies","am":"50 የተስተካከለ ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Veelloo 2 + Suufii 2","en":"2 Veils + 2 Suits","am":"2 ቬሎ + 2 ሱፍ"},
      {"om":"Uffata Aadaa + Qamisii Irbaataa","en":"Traditional dress + Evening gown","am":"የባህል ልብስ + የእራት ቀሚስ"}
    ]'::jsonb,
    'none',
    'active',
    6,
    NULL
  ),

  -- 7. Paakeejii 6ffaa (20,000 Birr)
  (
    'paakeejii-6ffaa',
    'PKG-06',
    '{"en":"Package 6 (Paakeejii 6ffaa)","om":"Paakeejii 6ffaa","am":"ፓኬጅ 6 (Paakeejii 6ffaa)"}'::jsonb,
    '{"en":"40x60 Board, studio or mask photos, 50 soft copies, bridal salon and traditional wear.","om":"40x60 Board, suuraa studio ykn mask, softcopy 50, mana miidhaginaa fi uffata aadaa","am":"40x60 ቦርድ፣ የስቱዲዮ ፎቶ፣ 50 ሶፍት ኮፒ፣ የውበት ሳሎን እና የባህል ልብስ።"}'::jsonb,
    20000,
    'fixed',
    NULL,
    '[
      {"om":"40x60 Board","en":"40x60 Board","am":"40x60 ቦርድ"},
      {"om":"Suuraa studio ykn Mask","en":"Studio photos or Mask","am":"የስቱዲዮ ፎቶ ወይም ማስክ"},
      {"om":"Softcopy edit 50","en":"50 Edited soft copies","am":"50 የተስተካከለ ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Veelloo 2 + Suufii 2","en":"2 Veils + 2 Suits","am":"2 ቬሎ + 2 ሱፍ"},
      {"om":"Uffata Aadaa","en":"Traditional cultural attire","am":"የባህል ልብስ"}
    ]'::jsonb,
    'none',
    'active',
    7,
    NULL
  ),

  -- 8. Paakeejii 7ffaa (16,000 Birr)
  (
    'paakeejii-7ffaa',
    'PKG-07',
    '{"en":"Package 7 (Paakeejii 7ffaa)","om":"Paakeejii 7ffaa","am":"ፓኬጅ 7 (Paakeejii 7ffaa)"}'::jsonb,
    '{"en":"30x45 Board, studio photos, 40 soft copies, bridal salon, 1 veil and 1 suit.","om":"30x45 Board, suuraa studio, softcopy 40, mana miidhaginaa, veelloo 1 fi suufii 1","am":"30x45 ቦርድ፣ የስቱዲዮ ፎቶ፣ 40 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 1 ቬሎ እና 1 ሱፍ።"}'::jsonb,
    16000,
    'fixed',
    NULL,
    '[
      {"om":"30x45 Board","en":"30x45 Board","am":"30x45 ቦርድ"},
      {"om":"Suuraa Studio","en":"Studio photoshoot","am":"የስቱዲዮ ፎቶ"},
      {"om":"Softcopy edit 40","en":"40 Edited soft copies","am":"40 የተስተካከለ ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Veelloo 1 + Suufii 1","en":"1 Veil + 1 Suit","am":"1 ቬሎ + 1 ሱፍ"},
      {"om":"Uffata Aadaa","en":"Traditional dress","am":"የባህል ልብስ"}
    ]'::jsonb,
    'none',
    'active',
    8,
    NULL
  ),

  -- 9. Paakeejii 8ffaa (12,000 Birr)
  (
    'paakeejii-8ffaa',
    'PKG-08',
    '{"en":"Package 8 (Paakeejii 8ffaa)","om":"Paakeejii 8ffaa","am":"ፓኬጅ 8 (Paakeejii 8ffaa)"}'::jsonb,
    '{"en":"20x30 Board, studio photoshoot, 30 soft copies, bridal salon, 1 veil and 1 suit.","om":"20x30 Board, suuraa studio, softcopy 30, mana miidhaginaa, veelloo 1 fi suufii 1","am":"20x30 ቦርድ፣ የስቱዲዮ ፎቶ፣ 30 ሶፍት ኮፒ፣ የውበት ሳሎን፣ 1 ቬሎ እና 1 ሱፍ።"}'::jsonb,
    12000,
    'fixed',
    NULL,
    '[
      {"om":"20x30 Board","en":"20x30 Board","am":"20x30 ቦርድ"},
      {"om":"Suuraa Studio","en":"Studio photoshoot","am":"የስቱዲዮ ፎቶ"},
      {"om":"Softcopy 30","en":"30 Soft copies","am":"30 ሶፍት ኮፒ"},
      {"om":"Mana miidhagina shamarranii","en":"Bridal salon","am":"የሴት የውበት ሳሎን"},
      {"om":"Veelloo 1 + Suufii 1","en":"1 Veil + 1 Suit","am":"1 ቬሎ + 1 ሱፍ"},
      {"om":"Uffata Aadaa","en":"Traditional dress","am":"የባህል ልብስ"}
    ]'::jsonb,
    'none',
    'active',
    9,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_birr = EXCLUDED.price_birr,
  included_items = EXCLUDED.included_items,
  badge = EXCLUDED.badge,
  sort_order = EXCLUDED.sort_order;

-- ----------------------------------------------------------------------------
-- 4. Gallery Seed Data
-- ----------------------------------------------------------------------------
INSERT INTO public.gallery_items (id, category, type, url, caption, alt_text, is_featured, is_visible, sort_order)
VALUES
  (
    'gal-1',
    'wedding',
    'image',
    '/images/hawi_hero_wedding_1793302555646.jpg',
    '{"en":"Romantic Sunset Wedding Couple","om":"Jaalalleewwan Cidhaa Yeroo Lixa Aduu","am":"የፍቅር የሰርግ ጥንዶች በጀምበር መጥለቂያ"}'::jsonb,
    'Bride and Groom in Ethiopian wedding attire at sunset',
    true,
    true,
    1
  ),
  (
    'gal-2',
    'bridal',
    'image',
    '/images/hawi_bridal_gown_1793302558528.jpg',
    '{"en":"Royal Bridal Gown and Veil","om":"Veelloo fi Uffata Misirroo Mootummaa","am":"የንግስት የሰርግ ቬሎ እና ጌጣጌጥ"}'::jsonb,
    'Elegant bridal gown with detailed veil and sparkling tiara',
    true,
    true,
    2
  ),
  (
    'gal-3',
    'makeup',
    'image',
    '/images/hawi_bridal_makeup_1793302556782.jpg',
    '{"en":"High Definition Bridal Glam Makeup","om":"Meekappii Misirroo Qulqullina Olaanaa","am":"ዘመናዊ ጥራት ያለው የሙሽራ ሜካፕ"}'::jsonb,
    'Close up of bridal makeup and hairstyling',
    true,
    true,
    3
  ),
  (
    'gal-4',
    'traditional',
    'image',
    '/images/hawi_traditional_aadaa_1793302559000.jpg',
    '{"en":"Habesha & Oromo Aadaa Attire","om":"Uffata Aadaa Oromoo fi Habashaa","am":"የሀበሻ እና የኦሮሞ ባህላዊ የሰርግ ልብስ"}'::jsonb,
    'Traditional wedding ceremony clothing and cultural jewelry',
    true,
    true,
    4
  ),
  (
    'gal-5',
    'studio',
    'image',
    '/images/hawi_wedding_photography_1793302557354.jpg',
    '{"en":"Studio Couple Portrait Session","om":"Waraabbi Suuraa Istuudiyoo Misirroo","am":"የስቱዲዮ ጥንዶች ፎቶግራፍ"}'::jsonb,
    'Studio lighting portrait of wedding couple',
    true,
    true,
    5
  ),
  (
    'gal-6',
    'wedding',
    'image',
    '/images/hawi_reception_celebration_1793302558086.jpg',
    '{"en":"Grand Ballroom Reception Celebration","om":"Sirna Gamachuu Galma Cidhaa","am":"የሰርግ አዳራሽ ድምቀት እና ደስታ"}'::jsonb,
    'Wedding reception entrance and celebration in Addis Ababa',
    false,
    true,
    6
  )
ON CONFLICT (id) DO UPDATE SET
  caption = EXCLUDED.caption,
  url = EXCLUDED.url,
  category = EXCLUDED.category;

-- ----------------------------------------------------------------------------
-- 5. Default Capacity Rules
-- ----------------------------------------------------------------------------
INSERT INTO public.capacity_rules (id, default_per_day, default_per_period, per_weekday)
VALUES (
  'default',
  4,
  2,
  '{"0":2,"1":2,"2":2,"3":2,"4":3,"5":5,"6":6}'::jsonb -- Sunday(0), Mon-Wed(1-3)=2, Thu(4)=3, Fri(5)=5, Sat(6)=6
)
ON CONFLICT (id) DO UPDATE SET
  default_per_day = EXCLUDED.default_per_day,
  default_per_period = EXCLUDED.default_per_period,
  per_weekday = EXCLUDED.per_weekday;
