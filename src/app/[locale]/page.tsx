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

export default function Home() {
  return <HomeClient statsBar={<StatsBar />} />;
}
