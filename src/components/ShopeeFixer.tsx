"use client";

import { useTranslations } from "next-intl";
import ZplEditorWrapper from "./ZplEditorWrapper";
import { Link } from "../i18n/routing";
import { useShopeeFix } from "../hooks/useShopeeFix";
import type { SemaphoreStatus } from "../services/ShopeeFixEngine";

export default function ShopeeFixer() {
  const t = useTranslations("shopeeFix");
  const {
    zplInput,
    setZplInput,
    dpi,
    setDpi,
    analysis,
    fixedZpl,
    copied,
    handleAnalyze,
    handleFix,
    handleCopy,
    handleDownload,
  } = useShopeeFix();

  const semaphoreStyles: Record<
    SemaphoreStatus,
    { bg: string; icon: string; dot: string }
  > = {
    green: {
      bg: "bg-emerald-900/30 border-emerald-500/40",
      icon: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    yellow: {
      bg: "bg-amber-900/30 border-amber-500/40",
      icon: "text-amber-400",
      dot: "bg-amber-400",
    },
    red: {
      bg: "bg-red-900/30 border-red-500/40",
      icon: "text-red-400",
      dot: "bg-red-500",
    },
  };

  const statusPanel = () => {
    if (!analysis) return null;
    const cfg = semaphoreStyles[analysis.status];

    return (
      <div className={`flex flex-col gap-3 rounded-xl border px-5 py-4 mb-6 ${cfg.bg}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${cfg.dot}`}></span>
            <div>
              <p className={`font-bold text-sm uppercase tracking-wider ${cfg.icon}`}>
                {analysis.status === "green"
                  ? t("statusTitles.green")
                  : analysis.status === "yellow"
                  ? t("statusTitles.yellow")
                  : t("statusTitles.red")}
              </p>
              <p className="text-slate-300 text-xs mt-0.5">{t(analysis.messageKey)}</p>
            </div>
          </div>
          {analysis.canFix && !fixedZpl && (
            <button
              onClick={handleFix}
              className="shrink-0 bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all"
            >
              {t("buttons.fix")}
            </button>
          )}
        </div>
        {analysis.status !== "green" && (
          <div className="text-xs text-slate-300 space-y-1">
            <p>
              {t("dimensions.found", {
                pw: analysis.foundPw ?? "?",
                ll: analysis.foundLl ?? "?",
              })}
            </p>
            <p>
              {t("dimensions.expected", {
                pw: analysis.expectedPw,
                ll: analysis.expectedLl,
              })}
            </p>
          </div>
        )}
        {/* Cross-sell: Validador de Sintaxe */}
        {analysis.status === "red" && (
          <Link
            href="/tools/validator"
            className="self-start flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-600 hover:border-amber-400 rounded-full px-4 py-2 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t("crossSell.validator")}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Painel de Diagnóstico */}
      {statusPanel()}

      {/* DPI Selector */}
      <div className="mb-2 rounded-xl border border-slate-700/70 bg-slate-800/40 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
          {t("dpiSelector.label")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value) as 203 | 300)}
            className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <option value={203}>203 DPI</option>
            <option value={300}>300 DPI</option>
          </select>
          <span className="text-xs text-slate-400">
            {dpi === 203 ? t("dpiSelector.hint203") : t("dpiSelector.hint300")}
          </span>
        </div>
      </div>

      {/* Barra de ação: Diagnosticar + Copiar */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <button
          onClick={handleAnalyze}
          disabled={!zplInput.trim()}
          className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-600 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-amber-400 hover:text-amber-400 hover:bg-slate-800/80 transition-all shadow-md hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("buttons.analyze")}
        </button>

        <button
          onClick={handleCopy}
          disabled={!fixedZpl}
          className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow-md ${
            copied
              ? "bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
              : fixedZpl
              ? "bg-slate-700 text-white border border-slate-600 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-40"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? t("buttons.copied") : t("buttons.copy")}
        </button>

        <button
          onClick={handleDownload}
          disabled={!fixedZpl}
          className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-600 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          {t("buttons.download")}
        </button>
      </div>

      {/* Editor ZPL controlado */}
      <ZplEditorWrapper value={zplInput} onChange={setZplInput} />
    </div>
  );
}
