import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import HomeClient from '../../components/HomeClient';
import { StatsBar } from '../../components/StatsBar';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ZPLMaster Pro',
  url: 'https://zplmaster.com',
  description: 'Ferramentas ZPL gratuitas para e-commerce: converter, corrigir, validar e dividir etiquetas Zebra para Shopee e Mercado Livre.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient statsBar={<StatsBar />} />
    </>
  );
}
