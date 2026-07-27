import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Providers } from "@/components/providers";
import { DeferredToaster } from "@/components/common/deferred-toaster";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ConditionalLayout } from "@/components/common/conditional-layout";
import { BRAND_ICON_URL, SITE_URL } from "@/lib/seo";
import { routing } from "@/i18n/routing";

// swap + preload: font download starts immediately and always shows once
// ready. adjustFontFallback size-matches the fallback so the swap causes
// near-zero CLS. (optional + preload:false meant the font lost its block
// window on first load and locked in the fallback forever — "never loads".)
const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-kufi",
  weight: "variable",
  display: "swap",
  adjustFontFallback: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مستر عقار | عقارات الكويت للبيع والإيجار 2026",
    template: "%s | مستر عقار",
  },
  description:
    "ابحث عن آلاف العقارات في الكويت للبيع والإيجار والبدل. شقق، بيوت، فلل، أراضٍ ومحلات. أضف إعلانك مجانًا عبر مستر عقار.",
  authors: [{ name: "مستر عقار" }],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "مستر عقار | عقارات الكويت للبيع والإيجار 2026",
    description:
      "ابحث عن آلاف العقارات في الكويت للبيع والإيجار والبدل. شقق، بيوت، فلل، أراضٍ ومحلات. أضف إعلانك مجانًا عبر مستر عقار.",
    locale: "ar_KW",
    url: "/",
    siteName: "مستر عقار",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  // Enables static rendering for this locale (avoids Cache-Control: no-store).
  setRequestLocale(locale);

  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  let apiOrigin: string | null = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) apiOrigin = new URL(apiUrl).origin;
  } catch {
    apiOrigin = null;
  }

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${notoKufiArabic.variable} overflow-x-hidden`}
    >
      {apiOrigin ? (
        <>
          <link rel="preconnect" href={apiOrigin} />
          <link rel="dns-prefetch" href={apiOrigin} />
        </>
      ) : null}
      <body
        suppressHydrationWarning
        className={`${notoKufiArabic.className} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "مستر عقار عقارات الكويت",
              alternateName: "Mr aqar Real Estate Kuwait",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: BRAND_ICON_URL,
                contentUrl: BRAND_ICON_URL,
                width: 512,
                height: 512,
              },
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <Providers>
              <ConditionalLayout>{children}</ConditionalLayout>
              <DeferredToaster />
            </Providers>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
