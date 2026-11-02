import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/booking/BookingForm';
import Footer from '@/components/Footer';
import MobileCallBar from '@/components/MobileCallBar';

export const metadata = {
  title: 'Book Your Wedding Date | Hawi Pictures & Bridal Zone Ethiopia',
  description: 'Online wedding date booking, package reservation, and receipt verification for Hawi Pictures & Bridal Zone Addis Ababa.',
};

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="py-24 text-center text-[#8D6B1F] font-serif text-lg">
            Loading reservation form...
          </div>
        }>
          <BookingForm />
        </Suspense>
      </main>
      <Footer />
      <MobileCallBar />
    </div>
  );
}
