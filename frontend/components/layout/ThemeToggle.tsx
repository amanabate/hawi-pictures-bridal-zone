'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
        isDark
          ? 'bg-[#18130B] border-[#362C1B] text-[#FCD535] hover:bg-[#241C10] hover:border-[#FCD535]/50'
          : 'bg-white border-[#E6DFD5] text-[#8A641A] hover:bg-[#F4EFE6] hover:border-[#C9A24D]'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon (Visible in Dark Mode) */}
        <Sun
          className={`w-4 h-4 transition-all duration-300 absolute ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-[#FCD535]'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />

        {/* Moon Icon (Visible in Light Mode) */}
        <Moon
          className={`w-4 h-4 transition-all duration-300 absolute ${
            !isDark
              ? 'opacity-100 rotate-0 scale-100 text-[#8A641A]'
              : 'opacity-0 rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>
    </button>
  );
}
