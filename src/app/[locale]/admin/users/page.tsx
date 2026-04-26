import { AdminUsers } from '@/components/admin/admin-users';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Users',
  description: 'Manage all registered users',
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
