'use client';

import React from 'react';
import { Star, Heart, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function TestimonialsSection() {
  const { t, language } = useLanguage();

  const reviews = [
    {
      couple: 'Selamawit & Dawit Bekele',
      venue: 'Ethiopian Skylight Hotel, Addis Ababa',
      package: 'Gold Royal Package',
      content:
        language === 'am'
          ? 'የሀዊ ፒክቸርስ ቡድን ከጠበቅነው በላይ አስደስቶናል። የፎቶ ባለሙያዎቹ እጅግ የተረጋጉና የተደራጁ ነበሩ። የሙሽራ ሜካፑ እስከ ለሊቱ 8 ሰዓት ድረስ ምንም ሳይበላሽ ቆይቷል!'
          : language === 'om'
          ? 'Hawi Pictures waan nuti eegne hunda caalaa nu gammachiise! Gareen suuraa waraaban yeroo cidhii baay\'ee tasgabbaa\'oo turan. Make-up misirroos hanga sa\'aatii 8:00 tti osoo hin badin ture!'
          : 'Hawi Pictures exceeded all our expectations! The photography team was so calm and organized during the chaos of the wedding morning. And the bridal salon makeup lasted literally until 2:00 AM without a smudge. Our parents cried tears of joy when they received their handcrafted albums!',
      rating: 5
    },
    {
      couple: 'Bethlehem Haile & Yonas Girma',
      venue: 'Sheraton Addis & Kuriftu Bishoftu',
      package: 'Diamond Splendor (2-Day)',
      content:
        language === 'am'
          ? 'ለሰርጋችንም ሆነ ለመልሳችን ሀዊ ብራይዳል ዞንን መምረጣችን ምርጥ ውሳኔ ነበር። የኩሪፍቱ ሀይቅ የድሮን ቀረጻ ልክ እንደ አለም አቀፍ የሲኒማ ፊልም ያምራል!'
          : language === 'om'
          ? 'Cidha keenyaafi qophii Melseetiif Hawi Bridal Zone filachuun murtoo keenya isa gaarii ture. Suuraan haroo Quriiftuu irraa kaameraa droniin waraabame akka fiilmii addunyaatti ba\'e!'
          : 'Choosing Hawi Bridal Zone for both our wedding day and our traditional Melse was the best decision we made. The drone footage over Kuriftu lake looks like an international cinema film. We get compliments from family in the US and Europe every single day!',
      rating: 5
    },
    {
      couple: 'Meron Tadesse & Dr. Henok',
      venue: 'Haile Grand Hotel Addis Ababa',
      package: 'Imperial Habesha Luxury',
      content:
        language === 'am'
          ? 'ሙያዊ፣ ሰዓት አክባሪ እና ጥበባዊ ስራ። የሙሽራ ሳሎኑ፣ የአውሮፓ ጋውኖች እና 4 ፎቶግራፍ አንሺዎች በአንድ ኩባንያ መከናወናቸው ከብዙ ድካም አድኖናል!'
          : language === 'om'
          ? 'Ogummaa olaanaa, yeroo eeguu fi qulqullina ajaa\'ibsiisaa. Bakka tokkotti make-up, uffata misirroo fi waraabsa suuraa argachuun keenya hojii baay\'ee nuuf salphise!'
          : 'Professional, punctual, and remarkably artistic. Having the bridal suite, imported gown fitting, and 4 master photographers managed seamlessly by one trusted company saved us weeks of headaches. The same-day video edit blew our dinner guests away!',
      rating: 5
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[var(--bg)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <Heart className="w-4 h-4 text-[var(--gold)]" />
            <span>{t('testimonials.badge')}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
            {t('testimonials.title')}
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[var(--card)] p-8 border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-[var(--gold)]/50 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[var(--gold)]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-[var(--gold)]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[var(--border)]" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed italic">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              {/* Attribution */}
              <div className="pt-4 border-t border-[var(--border)] space-y-1">
                <div className="font-serif text-base font-bold text-[var(--text)]">
                  {rev.couple}
                </div>
                <div className="text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-1.5">
                  <span>{rev.venue}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-[var(--gold)]">{rev.package}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
