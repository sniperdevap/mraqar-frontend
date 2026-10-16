"use client";

import { useAreas } from "@/hooks/use-metadata";
import { adHref, type AdUrlInput } from "@/lib/ad-url";

/** Canonical SEO path for an ad, using the cached areas list for its governorate. */
export function useAdHref(ad: AdUrlInput): string {
  const { data: areas } = useAreas();
  return adHref(ad, areas);
}

/** Builder for lists where calling a hook per item isn't possible. */
export function useAdHrefBuilder(): (ad: AdUrlInput) => string {
  const { data: areas } = useAreas();
  return (ad: AdUrlInput) => adHref(ad, areas);
}
