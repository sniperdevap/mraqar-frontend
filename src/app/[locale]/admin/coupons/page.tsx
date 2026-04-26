import { AdminCoupons } from '@/components/admin/admin-coupons';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coupon Management | Admin',
  description: 'Manage platform coupons and discounts',
};

export default function AdminCouponsPage() {
  return <AdminCoupons />;
}
