import { AdminUserDetails } from '@/components/admin/user-details';

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AdminUserDetails id={id} />;
}
