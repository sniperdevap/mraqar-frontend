import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ConditionalLayout } from "@/components/common/conditional-layout";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-kufi",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "مسٹر عقار عقارات الكويت",
    template: "%s | مسٹر عقار",
  },
  description:
    "منصة مسٹر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
  authors: [{ name: "مسٹر عقار" }],
  openGraph: {
    title: "مسٹر عقار عقارات الكويت",
    description:
      "منصة مسٹر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
    locale: "ar_KW",
  },
  icons: {
    icon: "/images/aqar-logo.png",
    shortcut: "/images/aqar-logo.png",
    apple: "/images/aqar-logo.png",
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
              name: "مسٹر عقار عقارات الكويت",
              alternateName: "Mr aqar Real Estate Kuwait",
              url: "https://aqar.com",
              logo: "https://aqar.com/images/aqar-logo.png",
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
