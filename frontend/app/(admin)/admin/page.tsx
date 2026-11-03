'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import components dynamically to avoid SSR issues with localStorage
const AdminPageContent = dynamic(() => import('./AdminPageContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminPageContent />;
}
