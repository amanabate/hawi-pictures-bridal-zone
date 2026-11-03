'use client';

import React from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import AdminDashboard from '@/components/features/admin/AdminDashboard';
import AdminLogin from '@/components/features/admin/AdminLogin';

export default function AdminPageContent() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen">
      <AdminDashboard />
    </div>
  );
}
