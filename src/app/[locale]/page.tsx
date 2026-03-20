"use client";

import { useState } from "react";
import { useRouter, usePathname } from "../../i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "../../i18n/routing";
import ZplEditor from "../../components/ZplEditor";
import ToolGrid from "../../components/ToolGrid";

export default function Home() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const ui = useTranslations("ui");

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col selection:bg-amber-500/30">

      {/* Header Minimalista */}
      <header className="bg-slate-950 border-b border-slate-800/50 py-3 px-6 xl:px-8 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <span className="font-black text-lg tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">ZPLMaster</span>
        </Link>

        {/* Seletor de Idiomas em Pill */}
        <div className="flex bg-slate-800 rounded-full border border-slate-700/50 overflow-hidden shadow-sm">
          {[
            { id: 'pt-br', label: 'PT' },
            { id: 'en', label: 'EN' },
            { id: 'es', label: 'ES' },
            { id: 'zh', label: 'ZH' }
          ].map(language => (
            <button
              key={language.id}
              onClick={() => switchLocale(language.id)}
              className={`px-4 py-1.5 text-[11px] font-black transition-all duration-200 ${
                locale === language.id
                  ? 'bg-slate-700 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-10">

        {/* PUBLICIDADE - TOP AD */}
        <div className="w-full h-[90px] rounded-[24px] border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center overflow-hidden">
          <p className="text-[12px] font-bold tracking-widest text-slate-500 uppercase">{ui("adTop")}</p>
        </div>

        {/* Editor & Visualização */}
        <div className="w-full">
          <ZplEditorLocalized />
        </div>

        {/* Grade de Ferramentas + Footer */}
        <ToolGrid />

      </main>
    </div>
  );
}

// Sub-component to use useTranslations inside the client tree
function ZplEditorLocalized() {
  const editor = useTranslations("editor");
  const ui = useTranslations("ui");

  // Build the t prop shape that ZplEditor currently requires
  const t = {
    editor: {
      placeholder: editor("placeholder"),
      renderButton: editor("renderButton"),
      previewTitle: editor("previewTitle"),
      dropZone: editor("dropZone"),
      errorMsg: editor("errorMsg"),
      labelsRendered: (count: number) => editor("labelsRendered", { count }),
      btnThermalPrint: editor("btnThermalPrint"),
      btnPdf4x6: editor("btnPdf4x6"),
      btnPdfA4: editor("btnPdfA4"),
      processing: editor("processing"),
      clear: editor("clear"),
      renderSingle: editor("renderSingle"),
      renderMulti: (count: number) => editor("renderMulti", { count }),
    },
    ui: {
      codeEditor: ui("codeEditor"),
      loadZplFile: ui("loadZplFile"),
      renderLabelsBtn: ui("renderLabelsBtn"),
      toolsSectionTitle: ui("toolsSectionTitle"),
      privacyGuarantee: ui("privacyGuarantee"),
      adTop: ui("adTop"),
      adSidebar: ui("adSidebar"),
      waitingZpl: ui("waitingZpl"),
      ecommerceUltimate: ui("ecommerceUltimate"),
      reportError: ui("reportError"),
      clearCode: ui("clearCode"),
    },
  };

  return <ZplEditor t={t} />;
}
