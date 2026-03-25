import { getTranslations } from 'next-intl/server';
import BulkSplitter from '../../../../components/BulkSplitter';
import ToolGrid from '../../../../components/ToolGrid';
import SeoSection from '../../../../components/SeoSection';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('bulkSplitter.title'),
    description: t('bulkSplitter.desc'),
  };
}

export default async function BulkSplitterPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  const faqs = [
    { q: t('bulkSplitter.faq1q'), a: t('bulkSplitter.faq1a') },
    { q: t('bulkSplitter.faq2q'), a: t('bulkSplitter.faq2a') },
    { q: t('bulkSplitter.faq3q'), a: t('bulkSplitter.faq3a') },
    { q: t('bulkSplitter.faq4q'), a: t('bulkSplitter.faq4a') },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-8">
        {/* Hero SEO */}
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('bulkSplitter.h1')}
          </h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
            {t('bulkSplitter.desc')}
          </p>
        </div>

        {/* Bulk Splitter Component */}
        <BulkSplitter />

        {/* Seção SEO: descrição, como usar, FAQ */}
        <SeoSection
          howToTitle={t('howToTitle')}
          faqTitle={t('faqTitle')}
          intro={t('bulkSplitter.intro')}
          steps={[t('bulkSplitter.step1'), t('bulkSplitter.step2'), t('bulkSplitter.step3')]}
          faqs={faqs}
        />

        {/* Grade de Ferramentas + Footer */}
        <ToolGrid />
      </div>
    </main>
  );
}
