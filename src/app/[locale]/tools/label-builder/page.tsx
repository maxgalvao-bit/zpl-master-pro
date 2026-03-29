import { getTranslations } from "next-intl/server";
import ToolGrid from "../../../../components/ToolGrid";
import LabelBuilderWrapper from "./LabelBuilderWrapper";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://zplmaster.com';
const SLUG = '/tools/label-builder';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("labelBuilder.title"),
    description: t("labelBuilder.desc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}${SLUG}`,
      languages: {
        'pt-BR': `${BASE_URL}/pt-br${SLUG}`,
        'pt': `${BASE_URL}/pt-br${SLUG}`,
        'en': `${BASE_URL}/en${SLUG}`,
        'es': `${BASE_URL}/es${SLUG}`,
        'zh': `${BASE_URL}/zh${SLUG}`,
        'x-default': `${BASE_URL}/`,
      },
    },
  };
}

export default async function LabelBuilderPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-8">
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("labelBuilder.h1")}
          </h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
            {t("labelBuilder.desc")}
          </p>
        </div>

        <LabelBuilderWrapper />

        <ToolGrid />
      </div>
    </main>
  );
}
