import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import PackagesList from '@/components/packages/PackagesList';
import Footer from '@/components/Footer';
import MobileCallBar from '@/components/MobileCallBar';

export const metadata = {
  title: 'Wedding & Bridal Packages | Hawi Pictures & Bridal Zone Ethiopia',
  description: 'Explore all 8 wedding photography and bridal salon packages plus our signature Grand Royal Supreme package. Transparent prices in Ethiopian Birr.',
};

export default function PackagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="py-24 text-center text-[#8D6B1F] font-serif text-lg">
            Loading wedding packages...
          </div>
        }>
          <PackagesList />
        </Suspense>
      </main>
      <Footer />
      <MobileCallBar />
    </div>
  );
}
