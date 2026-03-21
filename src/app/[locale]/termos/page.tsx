import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: `${t("title")} | ZPLMaster Pro`,
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-8">
          {t("title")}
        </h1>
        <div className="flex flex-col gap-5 text-slate-400 leading-relaxed text-sm md:text-base">
          <p>{t("intro")}</p>
          <p>{t("free")}</p>
          <p>{t("prohibited")}</p>
          <p>{t("copyright")}</p>
        </div>
      </main>
    </div>
  );
}
