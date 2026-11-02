import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import GalleryShowcase from '@/components/home/GalleryShowcase';
import AboutSection from '@/components/home/AboutSection';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import Footer from '@/components/Footer';
import MobileCallBar from '@/components/MobileCallBar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Services Section */}
        <ServicesSection />

        {/* Gallery Section */}
        <GalleryShowcase />

        {/* About Section (Founder Card, Inside Studio, Why Choose Us, CTA, Contact Info) */}
        <AboutSection />

        {/* Featured Packages (Special Package & Packages 1-8 from Flyer) */}
        <FeaturedPackages />

        {/* Testimonials */}
        <TestimonialsSection />
      </main>
      <Footer />
      <MobileCallBar />
    </div>
  );
}
