import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Dashboard - Overview of platform statistics',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
