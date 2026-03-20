import { getTranslations } from 'next-intl/server';
import ZplValidator from '../../../../components/ZplValidator';
import ToolGrid from '../../../../components/ToolGrid';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('validator.title'),
    description: t('validator.desc'),
  };
}

export default async function ValidatorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-8">
        {/* Hero SEO */}
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('validator.h1')}
          </h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
            {t('validator.desc')}
          </p>
        </div>

        {/* Validator Component */}
        <ZplValidator />

        {/* Grade de Ferramentas + Footer */}
        <ToolGrid />
      </div>
    </main>
  );
}
