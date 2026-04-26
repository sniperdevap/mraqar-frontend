'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreateAdForm } from '@/components/ads/create-ad-form';
import { getAdById } from '@/lib/api/ad';
import { Ad } from '@/types/ad';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function EditAdPage() {
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      if (!params.id) return;
      try {
        const data = await getAdById(params.id as string);
        setAd(data);
      } catch (error) {
        console.error('Failed to fetch ad:', error);
        toast.error(t('ads.failedToLoadAdDetails'));
        router.push('/account');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-0 md:px-4">
        <CreateAdForm initialData={ad} mode="edit" />
      </div>
    </div>
  );
}
