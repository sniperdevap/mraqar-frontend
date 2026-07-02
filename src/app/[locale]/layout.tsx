import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ConditionalLayout } from "@/components/common/conditional-layout";
import { BRAND_ICON_URL, SITE_URL } from "@/lib/seo";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-kufi",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مستر عقار عقارات الكويت",
    template: "%s | مستر عقار",
  },
  description:
    "منصة مستر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
  authors: [{ name: "مستر عقار" }],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "مستر عقار عقارات الكويت",
    description:
      "منصة مستر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
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
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${notoKufiArabic.variable} overflow-x-hidden`}
    >
      <body
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
              <Toaster richColors position="top-right" closeButton expand />
            </Providers>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
