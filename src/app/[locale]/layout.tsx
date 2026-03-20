import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ZPLMaster Pro",
  description: "Advanced Client-Side ZPL Renderer",
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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
      <body className="antialiased font-sans bg-background text-foreground transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
