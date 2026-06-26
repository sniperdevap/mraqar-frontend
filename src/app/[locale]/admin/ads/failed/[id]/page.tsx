'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreateAdForm } from '@/components/ads/create-ad-form';
import { getFailedAdById, deleteFailedAd, FailedAd } from '@/lib/api/admin';
import { Ad } from '@/types/ad';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminConvertFailedAdPage() {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const [failedAd, setFailedAd] = useState<FailedAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFailedAd = async () => {
      if (!params.id) return;
      try {
        const data = await getFailedAdById(params.id as string);
        setFailedAd(data);
      } catch (error) {
        console.error('Failed to fetch failed ad:', error);
        toast.error(t('ads.failedToLoadAdDetails'));
        router.push('/admin/ads?tab=failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFailedAd();
  }, [params.id, router, t]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!failedAd) {
    return null;
  }

  // Cast FailedAd to Ad for the form.
  // We know some fields might be missing but CreateAdForm handles default values.
  const adContext = failedAd as unknown as Ad;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-0 md:px-4 py-8">
        <CreateAdForm
          initialData={adContext}
          mode="create"
          requireCreditsForCreate={false}
          onSuccess={async () => {
            // After successfully creating the real ad, delete the failed record
            try {
              await deleteFailedAd(failedAd._id);
              queryClient.invalidateQueries({ queryKey: ['failed-ads'] });
            } catch (err) {
              console.error('Failed to delete failed ad record after conversion:', err);
            }
            router.push(`/admin/ads`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
