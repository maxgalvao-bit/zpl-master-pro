import { getTranslations } from 'next-intl/server';
import ZplEditorWrapper from '../../../../components/ZplEditorWrapper';
import ToolGrid from '../../../../components/ToolGrid';
import SeoSection from '../../../../components/SeoSection';
import { AdSlot } from '../../../../components/AdSlot';
import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('zplToPdf.title'),
    description: t('zplToPdf.desc'),
  };
}

export default async function ZplToPdfPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'seo' });

  const faqs = [
    { q: t('zplToPdf.faq1q'), a: t('zplToPdf.faq1a') },
    { q: t('zplToPdf.faq2q'), a: t('zplToPdf.faq2a') },
    { q: t('zplToPdf.faq3q'), a: t('zplToPdf.faq3a') },
    { q: t('zplToPdf.faq4q'), a: t('zplToPdf.faq4a') },
    { q: t('zplToPdf.faq5q'), a: t('zplToPdf.faq5a') },
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
            {t('zplToPdf.h1')}
          </h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
            {t('zplToPdf.desc')}
          </p>
        </div>

        {/* Editor Central */}
        <ZplEditorWrapper />

        {/* AdSense display */}
        <AdSlot slot="3138099223" format="auto" />

        {/* Seção SEO: descrição, como usar, FAQ */}
        <SeoSection
          howToTitle={t('howToTitle')}
          faqTitle={t('faqTitle')}
          intro={t('zplToPdf.intro')}
          steps={[t('zplToPdf.step1'), t('zplToPdf.step2'), t('zplToPdf.step3')]}
          faqs={faqs}
        />

        {/* Grade de Ferramentas + Footer */}
        <ToolGrid />
      </div>
    </main>
  );
}
