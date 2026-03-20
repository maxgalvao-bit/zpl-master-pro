"use client";

import { useTranslations } from "next-intl";
import { FileText, Zap, CheckCircle2, LayoutGrid, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Link } from "../i18n/routing";

export default function ToolGrid() {
  const explore = useTranslations("explore");
  const ui = useTranslations("ui");
  const t = useTranslations();

  return (
    <>
      {/* Linha Divisória sutil */}
      <div className="flex items-center gap-4 mt-6">
        <div className="h-px bg-slate-700 w-12"></div>
        <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-widest text-slate-400 uppercase">
          {ui("toolsSectionTitle")}
        </h2>
        <div className="h-px bg-slate-700 flex-1"></div>
      </div>

      {/* Grade de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">

        {/* Conversor ZPL para PDF */}
        <Link href="/tools/zpl-to-pdf" className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-slate-700/50 group">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white uppercase tracking-wide leading-tight mt-1">
              {explore("toolZplPdf")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-400 mt-1 italic">
              {explore("toolZplPdfDesc")}
            </p>
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold text-[9px] rounded uppercase italic tracking-wider">
                {explore("active")}
              </span>
            </div>
          </div>
        </Link>

        {/* Shopee Asset Fixer */}
        <Link href="/tools/shopee-image-fix" className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-slate-700/50 group">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
            <Zap size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white uppercase tracking-wide leading-tight mt-1">
              {explore("toolShopeeFix")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-400 mt-1 italic">
              {explore("toolShopeeFixDesc")}
            </p>
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold text-[9px] rounded uppercase italic tracking-wider">
                {explore("active")}
              </span>
            </div>
          </div>
        </Link>

        {/* Validador de Sintaxe ZPL */}
        <Link href="/tools/validator" className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-slate-700/50 group">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white uppercase tracking-wide leading-tight mt-1">
              {explore("toolValidator")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-400 mt-1 italic">
              {explore("toolValidatorDesc")}
            </p>
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold text-[9px] rounded uppercase italic tracking-wider">
                {explore("active")}
              </span>
            </div>
          </div>
        </Link>

        {/* ZPL Bulk Splitter */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-slate-700/50 group opacity-80 hover:opacity-100">
          <div className="p-2.5 bg-slate-900 text-slate-400 rounded-xl group-hover:bg-slate-700 transition-colors">
            <LayoutGrid size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white uppercase tracking-wide leading-tight mt-1">
              {explore("toolSplitter")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-400 mt-1 italic">
              {explore("toolSplitterDesc")}
            </p>
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 bg-slate-900 text-slate-500 font-bold text-[9px] rounded uppercase italic tracking-wider">
                {explore("comingSoon")}
              </span>
            </div>
          </div>
        </div>

        {/* Card: Apoie o Projeto */}
        <div className="bg-amber-400 rounded-2xl p-5 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-amber-300 group">
          <div className="p-2.5 bg-slate-950 text-amber-400 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
            <Heart size={20} fill="currentColor" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-slate-950 uppercase tracking-wide leading-tight mt-1">
              {explore("supportProject")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-900/80 mt-1 italic">
              {explore("supportDesc")}
            </p>
          </div>
        </div>

        {/* Card: ZPLMaster Premium */}
        <div className="bg-slate-950 rounded-2xl p-5 border-2 border-slate-800 flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-black/40 cursor-pointer hover:border-amber-400/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[9px] font-black px-3 py-1 pb-1.5 rounded-bl-xl uppercase tracking-widest leading-none">
            PRO
          </div>
          <div className="p-2.5 bg-slate-800 text-amber-400 rounded-xl group-hover:rotate-12 transition-transform shadow-sm relative z-10">
            <Sparkles size={20} />
          </div>
          <div className="flex-1 relative z-10 mt-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white group-hover:text-amber-400 uppercase tracking-wide leading-tight mt-1 transition-colors">
              {explore("premiumTitle")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-400 mt-1 italic pr-4">
              {explore("premiumDesc")}
            </p>
          </div>
        </div>

      </div>

      {/* Banner Privacidade Garantida */}
      <div className="mt-6 mb-4 w-full max-w-5xl mx-auto bg-slate-800 border border-slate-700/50 rounded-xl py-4 px-6 flex flex-col md:flex-row text-center md:text-left items-center justify-center gap-4 shadow-lg shadow-black/20">
        <ShieldCheck size={24} className="text-amber-400 shrink-0" />
        <p className="text-xs md:text-sm lg:text-base text-slate-300 italic font-medium leading-relaxed">
          {ui("privacyGuarantee")}
        </p>
      </div>

      {/* Rodapé */}
      <footer className="pb-8 pt-4 flex flex-col items-center gap-2">
        <div className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
          ZPLMASTER V1.5 - {ui("ecommerceUltimate")}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span>{t("copyright")}</span>
          <span className="text-slate-300">|</span>
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold underline">{ui("reportError")}</span>
          </button>
        </div>
      </footer>
    </>
  );
}
