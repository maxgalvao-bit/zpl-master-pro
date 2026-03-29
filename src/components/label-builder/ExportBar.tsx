"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "../../lib/analytics";

interface Props {
  gerarZpl: () => string;
  nomeArquivo: string;
  canExport: boolean;
  gerarPdf?: () => void;
}

export default function ExportBar({ gerarZpl, nomeArquivo, canExport, gerarPdf }: Props) {
  const t = useTranslations("labelBuilder.export");
  const [exporting, setExporting] = useState(false);

  const handleExportZpl = () => {
    if (!canExport) return;
    const zpl = gerarZpl();
    const blob = new Blob([zpl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('label_built', 'label_builder');
    trackEvent('label_exported_zpl', 'label_builder');
  };

  const handleExportPdf = () => {
    if (!canExport || !gerarPdf) return;
    setExporting(true);
    try {
      gerarPdf();
      trackEvent('label_built', 'label_builder');
      trackEvent('label_exported_pdf', 'label_builder');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
      {gerarPdf ? (
        <button
          onClick={handleExportPdf}
          disabled={!canExport || exporting}
          className="flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? (
            <span className="animate-pulse">{t("exporting")}</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("pdf")}
            </>
          )}
        </button>
      ) : null}
      <button
        onClick={handleExportZpl}
        disabled={!canExport}
        className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t("zpl")}
      </button>
      </div>
      <p className="text-[10px] text-slate-600 italic">{t("zplHint")}</p>
    </div>
  );
}
