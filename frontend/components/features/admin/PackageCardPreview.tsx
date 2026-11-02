'use client';

import React from 'react';
import { Crown, Sparkles, Check, Clock, Users, Calendar } from 'lucide-react';
import { ManagedPackage } from '@/lib/data-store';

interface PackageCardPreviewProps {
  pkg: Partial<ManagedPackage>;
}

export default function PackageCardPreview({ pkg }: PackageCardPreviewProps) {
  const isSpecial = pkg.badge === 'special';
  const isPopular = pkg.badge === 'popular';

  const priceNum = typeof pkg.price === 'number' ? pkg.price : 0;
  const priceDisplay = pkg.priceDisplay || `${priceNum.toLocaleString()} ETB`;
  const deposit = pkg.depositAmount || `${Math.round(priceNum * 0.3).toLocaleString()} ETB`;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] mb-2 flex items-center justify-between">
        <span>Live Public Card Preview</span>
        <span className="text-[10px] text-[var(--text-muted)] font-normal">
          {pkg.status === 'hidden' ? '(Will be hidden on website)' : '(Active on website)'}
        </span>
      </div>

      <div
        className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
          isSpecial
            ? 'bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)] shadow-2xl scale-[1.01]'
            : isPopular
            ? 'bg-[var(--card)] text-[var(--text)] border-2 border-[var(--gold)]/70 shadow-xl'
            : 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] shadow-md'
        }`}
      >
        {/* Badge */}
        {isSpecial && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            <Crown className="w-3.5 h-3.5 text-[#141008]" />
            <span>Special Flagship Package</span>
          </div>
        )}
        {isPopular && !isSpecial && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--gold)] text-[#141008] text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#141008]" />
            <span>Most Popular Choice</span>
          </div>
        )}

        <div>
          {/* Category & Coverage */}
          <div className="flex items-center justify-between text-xs font-semibold mb-3">
            <span className={isSpecial ? 'text-[var(--gold)]' : 'text-[var(--gold-text)]'}>
              {pkg.categoryLabel || 'Full Wedding'}
            </span>
            <span className="flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{pkg.daysCoverage || '1 Full Day'}</span>
            </span>
          </div>

          {/* Package Names (Trilingual) */}
          <div className="space-y-1 mb-2">
            <h3 className="font-serif text-2xl font-bold text-[var(--text)] tracking-tight leading-snug">
              {pkg.name || 'Package Title'}
            </h3>

            {(pkg.nameAfaanOromoo || pkg.nameAmharic) && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--gold-text)] font-medium">
                {pkg.nameAfaanOromoo && (
                  <span className="bg-[var(--gold-bg)] px-2 py-0.5 rounded text-[10px] border border-[var(--gold)]/20">
                    Oromoo: {pkg.nameAfaanOromoo}
                  </span>
                )}
                {pkg.nameAmharic && (
                  <span className="bg-[var(--gold-bg)] px-2 py-0.5 rounded text-[10px] border border-[var(--gold)]/20">
                    አማርኛ: {pkg.nameAmharic}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tagline */}
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5 min-h-[32px]">
            {pkg.tagline || 'Essential wedding photography coverage for intimate ceremonies and celebrations.'}
          </p>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Investment
            </div>
            <div className="font-serif text-3xl font-bold text-[var(--gold)] tabular-nums mt-0.5">
              {priceDisplay}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center justify-between">
              <span>Required Deposit:</span>
              <span className="font-bold text-[var(--text)] font-mono">{deposit}</span>
            </div>
          </div>

          {/* Features / Included Items */}
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>Included Services ({pkg.features?.length || 0}):</span>
            </div>

            <ul className="space-y-2 text-xs">
              {(pkg.features && pkg.features.length > 0 ? pkg.features : ['Full day photo coverage', 'Retouched photos']).map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[var(--text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button Preview */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="text-[11px] text-[var(--text-muted)]">
            Team: <strong className="text-[var(--text)]">{pkg.team || 'Photo & Video Crew'}</strong>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] shadow-sm pointer-events-none"
          >
            Book This Package
          </button>
        </div>
      </div>
    </div>
  );
}
