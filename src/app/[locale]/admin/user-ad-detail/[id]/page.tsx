import { AdminAdDetail } from '@/components/admin/admin-ad-detail';

export default async function AdminAdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminAdDetail adId={id} />;
}
