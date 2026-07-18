import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { getPrivateServerAdById } from "@/lib/api/server";
import type { Ad } from "@/types/ad";
import { EditAdPageClient } from "./edit-ad-page-client";

async function getInitialAd(
  id: string,
  token: string | undefined,
  locale: string,
): Promise<Ad | null> {
  if (!token) return null;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getPrivateServerAdById(id, token, locale).catch(() => null),
      new Promise<null>(resolve => {
        timeoutId = setTimeout(() => resolve(null), 180);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export default async function EditAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, cookieStore, locale] = await Promise.all([
    params,
    cookies(),
    getLocale(),
  ]);
  const initialAd = await getInitialAd(
    id,
    cookieStore.get("auth-token")?.value,
    locale,
  );

  return <EditAdPageClient adId={id} initialAd={initialAd} />;
}
