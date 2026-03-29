import { getTranslations } from 'next-intl/server';
import ZplValidator from '../../../../components/ZplValidator';
import ToolGrid from '../../../../components/ToolGrid';
import SeoSection from '../../../../components/SeoSection';
import { AdSlot } from '../../../../components/AdSlot';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://zplmaster.com';
const SLUG = '/tools/validator';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('validator.title'),
    description: t('validator.desc'),
    alternates: {
      canonical: `${BASE_URL}/${locale}${SLUG}`,
      languages: {
        'pt-BR': `${BASE_URL}/pt-br${SLUG}`,
        'en': `${BASE_URL}/en${SLUG}`,
        'es': `${BASE_URL}/es${SLUG}`,
        'zh': `${BASE_URL}/zh${SLUG}`,
        'x-default': `${BASE_URL}/pt-br${SLUG}`,
      },
    },
  };
}

export default async function ValidatorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  const faqs = [
    { q: t('validator.faq1q'), a: t('validator.faq1a') },
    { q: t('validator.faq2q'), a: t('validator.faq2a') },
    { q: t('validator.faq3q'), a: t('validator.faq3a') },
    { q: t('validator.faq4q'), a: t('validator.faq4a') },
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
            {t('validator.h1')}
          </h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
            {t('validator.desc')}
          </p>
        </div>

        {/* Validator Component */}
        <ZplValidator />

        {/* AdSense display */}
        <AdSlot slot="3138099223" format="auto" />

        {/* Seção SEO: descrição, como usar, FAQ */}
        <SeoSection
          howToTitle={t('howToTitle')}
          faqTitle={t('faqTitle')}
          intro={t('validator.intro')}
          steps={[t('validator.step1'), t('validator.step2'), t('validator.step3')]}
          faqs={faqs}
        />

        {/* Grade de Ferramentas + Footer */}
        <ToolGrid />
      </div>
    </main>
  );
}
