import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { CONTACT_PHONES, PAYMENT_METHODS } from '@/data/packages';

export default function StudioLocationContact() {
  return (
    <section className="py-16 sm:py-24 bg-[var(--card-subtle)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Studio Inquiries & Tap to Call */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                Visit Our Addis Ababa Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
                Plan Your Wedding Consultation
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                Whether you would like to try on imported designer wedding gowns, browse physical crystal photo album samples, or lock your wedding date on our calendar — our team is ready to welcome you.
              </p>
            </div>

            {/* Tap To Call Action Cards */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Tap Below to Call Our Team Directly:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${CONTACT_PHONES[0].raw}`}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:border-[var(--gold)] hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                      {CONTACT_PHONES[0].label}
                    </span>
                    <div className="p-2 rounded-full bg-[var(--card-subtle)] text-[var(--gold)] group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
                      {CONTACT_PHONES[0].display}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Photography, videography & bookings
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[var(--gold)] flex items-center gap-1">
                    <span>Tap to Call Now</span>
                    <span>→</span>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_PHONES[1].raw}`}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:border-[var(--gold)] hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                      {CONTACT_PHONES[1].label}
                    </span>
                    <div className="p-2 rounded-full bg-[var(--card-subtle)] text-[var(--gold)] group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
                      {CONTACT_PHONES[1].display}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Gown rentals, fittings & makeup salon
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[var(--gold)] flex items-center gap-1">
                    <span>Tap to Call Now</span>
                    <span>→</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Location & Hours Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                <MapPin className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[var(--text)] mb-0.5">Studio Addresses:</div>
                  <div>Shager, Burayu Mariam Studio</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                <Clock className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[var(--text)] mb-0.5">Working Hours:</div>
                  <div>Mon – Sun: 8:00 AM – 7:30 PM (Wedding shoots scheduled 24/7)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Deposit & Payment Methods Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[var(--surface)] text-[var(--text)] p-8 shadow-2xl border-2 border-[var(--gold)]/40 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                    Official Payment Channels
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-[var(--text)] tracking-tight">
                  Secure Date Reservation
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  To confirm your wedding date on our master production calendar, transfer your package deposit and upload your receipt screenshot on the booking form.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {PAYMENT_METHODS.slice(0, 2).map((method, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[var(--text)] font-bold">{method.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">{method.accountName}</span>
                    </div>
                    <div className="font-mono text-base font-bold text-[var(--gold)] tracking-wider tabular-nums">
                      {method.accountNumber}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">Attach transfer confirmation in booking form</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/booking"
                  className="w-full py-3 px-5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-110 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Calendar className="w-4 h-4 text-[#141008]" />
                  <span>Go to Booking Form with Receipt Upload</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
