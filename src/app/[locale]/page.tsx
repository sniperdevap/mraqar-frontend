import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/home/home-page";

const HERO_LOGO = "/images/aqar-new-logo-hero.webp";

export const metadata: Metadata = {
  title: "مستر عقار عقارات الكويت",
  description:
    "منصة مستر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={HERO_LOGO}
        fetchPriority="high"
      />
      <HomePage />
    </>
  );
}
