"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { splitZpl, countZplLabels } from "../services/BulkSplitterEngine";
import { ZplEngine } from "../services/ZplEngine";
import { Link } from "../i18n/routing";
import { trackEvent } from "../lib/analytics";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

export default function BulkSplitter() {
  const t = useTranslations("bulkSplitter");
  const [code, setCode] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time count using the same engine logic
  const labelCount = useMemo(() => countZplLabels(code), [code]);

  // ── File reading ─────────────────────────────────────────────────────────
  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target?.result as string ?? "");
      setHasRun(false);
      setLabels([]);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSplit = () => {
    const result = splitZpl(code);
    setLabels(result);
    setHasRun(true);
    trackEvent('labels_split', 'bulk_splitter', result.length.toString(), result.length);
  };

  const handleClear = () => {
    setCode("");
    setLabels([]);
    setHasRun(false);
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownloadZpl = async () => {
    if (labels.length === 0) return;
    const zip = new JSZip();
    labels.forEach((label, idx) => zip.file(`etiqueta-${idx + 1}.zpl`, label));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etiquetas-zpl.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (labels.length === 0) return;
    setGeneratingPdf(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < labels.length; i++) {
        const result = await ZplEngine.render(labels[i]);
        if (result.status === "success" && result.labels?.[0]) {
          const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [101.6, 152.4] });
          pdf.addImage(result.labels[0], "PNG", 0, 0, 101.6, 152.4);
          zip.file(`etiqueta-${i + 1}.pdf`, pdf.output("blob"));
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "etiquetas-pdf.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Input section */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {t("inputLabel")}
        </label>

        {/* Upload button — posição destacada, alinhado à esquerda */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zpl,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-slate-800 text-white border-2 border-slate-700 hover:bg-slate-700 shadow-sm px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t("btnUpload")}
          </button>
        </div>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          spellCheck={false}
          placeholder={t("placeholder")}
          className={`w-full h-52 bg-slate-900 border ${
            isDragging
              ? "border-amber-400 ring-2 ring-amber-400/50"
              : "border-slate-700/50"
          } focus:ring-2 focus:ring-amber-400 focus:border-transparent rounded-2xl p-5 text-sm font-mono text-slate-200 resize-none outline-none placeholder:text-slate-600 placeholder:italic transition-all`}
        />
        <p className="text-[10px] text-slate-600 -mt-1">{t("dropHint")}</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSplit}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {labelCount > 0 ? t("btnSplitCount", { count: labelCount }) : t("btnSplit")}
          </button>
          <button
            onClick={handleClear}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t("btnClear")}
          </button>
        </div>
      </div>

      {/* Results */}
      {hasRun && (
        <div className="flex flex-col gap-4">
          {/* Counter + download buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${labels.length > 0 ? "bg-emerald-400" : "bg-red-500"}`} />
              <p className="font-bold text-sm text-slate-200">
                {labels.length > 0 ? t("counter", { count: labels.length }) : t("empty")}
              </p>
            </div>

            {labels.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {/* ZIP (ZPL) */}
                <button
                  onClick={handleDownloadZpl}
                  className="flex items-center gap-1.5 bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-slate-600 transition-all border border-slate-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t("btnDownloadZpl")}
                </button>

                {/* ZIP (PDF) */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={generatingPdf}
                  className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-full shadow-[0_0_16px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {generatingPdf ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t("generatingPdf")}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t("btnDownloadPdf")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Label list */}
          {labels.length > 0 && (
            <div className="flex flex-col gap-4">
              {labels.map((label, idx) => (
                <div key={idx} className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      {t("labelNum", { num: idx + 1 })}
                    </span>
                    <button
                      onClick={() => handleCopy(label, idx)}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">{t("btnCopied")}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {t("btnCopy")}
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed max-h-48">
                    {label}
                  </pre>
                </div>
              ))}

              {/* Cross-sell */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t("crossSell")}{" "}
                  <Link href="/tools/validator" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                    {t("crossSellLink")}
                  </Link>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
