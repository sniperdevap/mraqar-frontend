import dynamic from 'next/dynamic';

const OfficeDetailPage = dynamic(() => import('@/components/offices/office-detail-page').then(mod => mod.OfficeDetailPage));

export default async function OfficeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OfficeDetailPage officeId={id} />;
}
