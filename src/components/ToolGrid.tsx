"use client";

import { useTranslations } from "next-intl";
import { FileText, Zap, CheckCircle2, LayoutGrid, Heart, Sparkles } from "lucide-react";
import { Link } from "../i18n/routing";
import { LabelBuilderCard } from "./LabelBuilderCard";

export default function ToolGrid() {
  const explore = useTranslations("explore");
  const ui = useTranslations("ui");

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

        {/* Label Builder — Acesso Gratuito */}
        <LabelBuilderCard />

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
        <Link href="/tools/bulk-splitter" className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:bg-slate-700/50 group">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
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
              <span className="inline-block px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold text-[9px] rounded uppercase italic tracking-wider">
                {explore("active")}
              </span>
            </div>
          </div>
        </Link>

        {/* Card: Mais em breve */}
        <div className="bg-slate-800/40 rounded-2xl p-5 border border-dashed border-slate-700/50 flex items-start gap-4 opacity-60 cursor-default">
          <div className="p-2.5 bg-slate-900/60 text-slate-500 rounded-xl">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-slate-500 uppercase tracking-wide leading-tight mt-1">
              {explore("moreComingTitle")}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-slate-600 mt-1 italic">
              {explore("moreComingDesc")}
            </p>
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 bg-slate-700/50 text-slate-500 font-bold text-[9px] rounded uppercase italic tracking-wider">
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
        <Link href="/premium" className="bg-slate-950 rounded-2xl p-5 border-2 border-slate-800 flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-black/40 cursor-pointer hover:border-amber-400/50 group relative overflow-hidden">
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
        </Link>

      </div>

    </>
  );
}
