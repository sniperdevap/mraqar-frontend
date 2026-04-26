import { AdminSubscriptions } from '@/components/admin/admin-subscriptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Management | Admin',
  description: 'Manage user subscriptions and plans',
};

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptions />;
}
