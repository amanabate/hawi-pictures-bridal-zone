import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard | Hawi Pictures & Bridal Zone Ethiopia',
  description: 'Studio administration dashboard to review, confirm, and manage wedding bookings and receipts.',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white">
      <AdminDashboard />
    </div>
  );
}
