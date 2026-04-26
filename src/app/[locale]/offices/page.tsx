import dynamic from 'next/dynamic';

const OfficesPage = dynamic(() => import('@/components/offices/offices-page').then(mod => mod.OfficesPage));

export default function Offices() {
  return <OfficesPage />;
}
