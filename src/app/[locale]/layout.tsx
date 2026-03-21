import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ZPLMaster Pro",
  description: "Advanced Client-Side ZPL Renderer",
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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
