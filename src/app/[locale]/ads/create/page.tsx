import dynamic from 'next/dynamic';

const CreateAdForm = dynamic(() => import('@/components/ads/create-ad-form').then(mod => mod.CreateAdForm));

export default function CreateAdPage() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-0 md:px-4">
        <CreateAdForm />
      </div>
    </div>
  );
}
