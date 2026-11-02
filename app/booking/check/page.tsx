'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileCallBar from '@/components/MobileCallBar';
import { useLanguage } from '@/lib/language-context';
import { Search, Sparkles, CheckCircle2, Clock, XCircle, AlertCircle, Calendar, MapPin, Tag } from 'lucide-react';

interface BookingStatusData {
  booking_code: string;
  customer_name: string;
  status: string;
  payment_status: string;
  package_name: string;
  event_date: string;
  period: string;
  venue: string;
  status_reason: string | null;
  hold_expires_at: string;
}

export default function CheckBookingPage() {
  const { t, language } = useLanguage();
  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BookingStatusData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    if (!bookingCode.trim() || !phone.trim()) {
      setErrorMsg(
        language === 'om'
          ? 'Koodii qabannaa fi lakkoofsa bilbilaa lamaanuu galchaa.'
          : language === 'am'
          ? 'እባክዎ ሁለቱንም የማስያዣ ኮድ እና ስልክ ቁጥር ያስገቡ።'
          : 'Please enter both your booking code and phone number.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/bookings/check?code=${encodeURIComponent(bookingCode.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data?.error?.message ||
            (language === 'om'
              ? 'Qabannaan koodii kanaan walgitu hin argamne.'
              : language === 'am'
              ? 'በዚህ መረጃ የተመዘገበ ማስያዣ አልተገኘም።'
              : 'No booking was found matching this code and phone number.')
        );
      } else {
        setResult(data.data);
      }
    } catch {
      setErrorMsg(
        language === 'om'
          ? 'Haala qabannaa mirkaneessuun hin danda\'amne. Irra deebi\'aa yaalaa.'
          : language === 'am'
          ? 'የማስያዣውን ሁኔታ ማረጋገጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
          : 'Unable to check booking status at this time. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status.toUpperCase()}</span>
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>{status.toUpperCase()}</span>
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{status.toUpperCase()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
        <XCircle className="w-3.5 h-3.5" />
        <span>{status.toUpperCase()}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)]/30 text-[var(--gold)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hawi Pictures & Bridal Zone</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold)] via-amber-200 to-[var(--gold-dark)]">
            {language === 'om'
              ? 'Haala Qabannaa Keessan Mirkaneeffadhaa'
              : language === 'am'
              ? 'የማስያዣዎን ሁኔታ ያረጋግጡ'
              : 'Check Booking Status'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {language === 'om'
              ? 'Koodii qabannaa fi lakkoofsa bilbilaa keessan galchuun haala kafaltii fi guyyaa cidhaa keessanii hordofaa.'
              : language === 'am'
              ? 'የማስያዣ ኮድዎን እና ስልክ ቁጥርዎን በማስገባት የክፍያ እና የቀን ሁኔታዎን ይከታተሉ።'
              : 'Track your wedding reservation status, deposit verification, and locked event date.'}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text)]">
                  {language === 'om' ? 'Koodii Qabannaa (Booking Code)' : language === 'am' ? 'የማስያዣ ኮድ' : 'Booking Code'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HAWI-0001"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-sm font-mono text-[var(--text)] focus:ring-2 focus:ring-[var(--gold)] focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text)]">
                  {language === 'om' ? 'Lakkoofsa Bilbilaa' : language === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-sm font-mono text-[var(--text)] focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-black font-bold text-sm bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Checking...' : language === 'om' ? 'Mirkaneessi' : language === 'am' ? 'አረጋግጥ' : 'Check Status'}</span>
            </button>
          </form>

          {/* Results Display */}
          {result && (
            <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Booking Code</span>
                  <div className="font-mono text-lg font-bold text-[var(--gold)]">{result.booking_code}</div>
                </div>
                <div>{getStatusBadge(result.status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)]">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">Customer Name</div>
                  <div className="font-semibold text-sm text-[var(--text)]">{result.customer_name}</div>
                </div>

                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">Payment Status</div>
                  <div className="font-semibold text-sm capitalize text-[var(--gold)]">
                    {result.payment_status.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)]">Selected Package</div>
                    <div className="font-medium text-xs text-[var(--text)]">{result.package_name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)]">Event Date & Period</div>
                    <div className="font-medium text-xs text-[var(--text)]">
                      {result.event_date} ({result.period})
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)]">Venue / Location</div>
                    <div className="font-medium text-xs text-[var(--text)]">{result.venue}</div>
                  </div>
                </div>
              </div>

              {result.status_reason && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                  <span className="font-bold">Studio Note / Reason: </span>
                  {result.status_reason}
                </div>
              )}

              {result.status === 'pending' && (
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <span>
                    Deposit verification hold expires in 48 hours ({new Date(result.hold_expires_at).toLocaleDateString()}).
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/booking"
            className="text-xs text-[var(--gold)] hover:underline inline-flex items-center gap-1 font-semibold"
          >
            ← {language === 'om' ? 'Gara Foormii Qabannaatti Deebi\'i' : language === 'am' ? 'ወደ ማስያዣ ቅጽ ተመለስ' : 'Back to Reservation Form'}
          </Link>
        </div>
      </main>

      <Footer />
      <MobileCallBar />
    </div>
  );
}
