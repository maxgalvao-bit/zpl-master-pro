import type { Metadata } from "next";
import "../globals.css";

const BASE_URL = 'https://zplmaster.com';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "ZPLMaster Pro",
    description: "Advanced Client-Side ZPL Renderer",
    verification: {
      other: {
        'msvalidate.01': '3DD959BB6601B0F531F05E679087B226',
      },
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'pt-BR': `${BASE_URL}/pt-br`,
        'pt': `${BASE_URL}/pt-br`,
        'en': `${BASE_URL}/en`,
        'es': `${BASE_URL}/es`,
        'zh': `${BASE_URL}/zh`,
        'x-default': `${BASE_URL}/`,
      },
    },
  };
}

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Script from 'next/script';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GoogleAnalytics } from '../../components/GoogleAnalytics';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5267254636032578"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased font-sans bg-background text-foreground transition-colors duration-300 flex flex-col min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalytics />
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
