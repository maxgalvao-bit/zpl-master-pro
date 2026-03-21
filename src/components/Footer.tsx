"use client";

import { useTranslations } from "next-intl";
import { Link } from "../i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");
  const ui = useTranslations("ui");

  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 py-6 px-6 xl:px-8 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">
          {t("copyright")}
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacidade"
            className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors tracking-widest uppercase"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/termos"
            className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors tracking-widest uppercase"
          >
            {t("terms")}
          </Link>
          <a
            href="https://github.com/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-slate-500 hover:text-amber-400 transition-colors tracking-widest uppercase"
          >
            {t("reportError")}
          </a>
        </nav>
      </div>
      <div className="max-w-[1600px] mx-auto mt-4 pt-4 border-t border-slate-800/30">
        <p className="text-[10px] text-slate-600 text-center tracking-widest uppercase">
          {ui("privacyGuarantee")}
        </p>
      </div>
    </footer>
  );
}
