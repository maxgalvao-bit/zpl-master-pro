"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "../i18n/routing";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("header");

  const isHomepage = pathname === "/";

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800/50 py-3 px-6 xl:px-8 flex justify-between items-center z-50 sticky top-0">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <span className="font-black text-lg tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">ZPLMaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <a
            href={isHomepage ? "#ferramentas" : `/${locale}#ferramentas`}
            className="text-[11px] font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase"
          >
            {t("navTools")}
          </a>
        </nav>
      </div>

      {/* Right side: Premium + Language switcher */}
      <div className="flex items-center gap-3">
        <Link
          href="/premium"
          className="hidden md:inline-flex text-[11px] font-black tracking-widest text-amber-400 border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 transition-colors uppercase px-3 py-1.5 rounded-full"
        >
          {t("navPremium")}
        </Link>

        {/* Language switcher */}
        <div className="flex bg-slate-800 rounded-full border border-slate-700/50 overflow-hidden shadow-sm">
        {[
          { id: "pt-br", label: "PT" },
          { id: "en", label: "EN" },
          { id: "es", label: "ES" },
          { id: "zh", label: "ZH" },
        ].map((language) => (
          <button
            key={language.id}
            onClick={() => switchLocale(language.id)}
            className={`px-4 py-1.5 text-[11px] font-black transition-all duration-200 ${
              locale === language.id
                ? "bg-slate-700 text-amber-400"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            {language.label}
          </button>
        ))}
        </div>
      </div>
    </header>
  );
}
