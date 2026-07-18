"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreateAdForm } from "@/components/ads/create-ad-form";
import { getAdById } from "@/lib/api/ad";
import type { Ad } from "@/types/ad";

export function EditAdPageClient({
  adId,
  initialAd,
}: {
  adId: string;
  initialAd: Ad | null;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(initialAd);
  const [isLoading, setIsLoading] = useState(!initialAd);

  useEffect(() => {
    if (initialAd) return;

    let isActive = true;
    const fetchAd = async () => {
      try {
        const data = await getAdById(adId);
        if (isActive) setAd(data);
      } catch (error) {
        console.error("Failed to fetch ad:", error);
        toast.error(t("ads.failedToLoadAdDetails"));
        router.push("/account");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchAd();
    return () => {
      isActive = false;
    };
  }, [adId, initialAd, router, t]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-0 md:px-4">
        <CreateAdForm initialData={ad} mode="edit" />
      </div>
    </div>
  );
}
