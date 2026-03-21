"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { validateZpl, type ValidationIssue, type ValidationResult, type Severity } from "../services/ZplValidator";
import { autoFix } from "../services/ZplFixer";
import { trackEvent } from "../lib/analytics";

const FIXABLE_CODES = ['E004', 'W001', 'W004', 'W005', 'I001'];

// ─── Subcomponente (fora do componente pai para evitar re-criação de referência) ──

type TFunction = ReturnType<typeof useTranslations<'validator'>>;

function ValidationIssueItem({ item, t }: { item: ValidationIssue; t: TFunction }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses: Record<Severity, string> = {
    E: 'text-red-400',
    W: 'text-amber-400',
    I: 'text-sky-400',
  };
  const badgeClasses: Record<Severity, string> = {
    E: 'bg-red-400/10 text-red-400 border-red-400/30',
    W: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    I: 'bg-sky-400/10 text-sky-400 border-sky-400/30',
  };

  const helpKeyBase = `help.codes.${item.code}`;
  const hasSpecificHelp = t.has(`${helpKeyBase}.explanation` as any);

  return (
    <div key={`${item.code}-${item.line}`} className="flex items-start gap-3 py-2.5 border-b border-slate-700/40 last:border-0">
      <span className={`font-black text-[10px] border rounded px-1.5 py-0.5 shrink-0 mt-0.5 tracking-wider ${badgeClasses[item.severity]}`}>
        {item.code}
      </span>
      <div className="flex flex-col">
        <p className={`text-xs leading-relaxed ${colorClasses[item.severity]}`}>
          {t(item.message as any, { line: item.line })}
        </p>
        {item.context && (
          <code className="text-[10px] text-slate-500 mt-1 font-mono bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50 w-fit">
            {item.context}
          </code>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-[11px] font-bold uppercase tracking-wider text-sky-300 hover:text-sky-200 w-fit"
          type="button"
        >
          {t('help.toggle')}
        </button>
        <div
          className={`mt-2 overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-300">
            <p className="mb-2 leading-relaxed">
              {hasSpecificHelp
                ? t(`${helpKeyBase}.explanation` as any)
                : t('help.generic.explanation')}
            </p>
            {hasSpecificHelp && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {t('help.incorrect')}
                </p>
                <pre className="mb-2 whitespace-pre-wrap break-words rounded border border-red-500/20 bg-red-950/20 p-2 font-mono text-[11px] text-red-200">
                  {t(`${helpKeyBase}.incorrect` as any)}
                </pre>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {t('help.correct')}
                </p>
                <pre className="whitespace-pre-wrap break-words rounded border border-emerald-500/20 bg-emerald-950/20 p-2 font-mono text-[11px] text-emerald-200">
                  {t(`${helpKeyBase}.correct` as any)}
                </pre>
                {item.code === 'E006' && (
                  <a
                    href="/tools/bulk-splitter"
                    className="inline-flex mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200"
                  >
                    {t('help.codes.E006.bulkSplitterCta')}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ZplValidator() {
  const t = useTranslations('validator');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = () => { setResult(validateZpl(code)); trackEvent('zpl_validated', 'validator'); };
  const handleClear = () => {
    setCode('');
    setResult(null);
  };

  const estruturaValida = result ? !result.issues.some(i => ['E001', 'E002', 'E003'].includes(i.code)) : true;
  const temCorrigiveis = result?.issues.some(i => FIXABLE_CODES.includes(i.code)) ?? false;
  const hasUnfixableErrors = result?.issues.some(
    issue => issue.severity === 'E' && !FIXABLE_CODES.includes(issue.code)
  ) ?? false;
  const showFixButton = estruturaValida && temCorrigiveis;

  const handleFix = () => {
    if (!result) return;
    const corrected = autoFix(code, result.issues);
    const newResult = validateZpl(corrected);
    setCode(corrected);
    setResult(newResult);
    trackEvent('auto_fixed', 'validator');
  };

  const handleCopy = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    if (!code.trim()) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'label.zpl';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Painel de status global ───────────────────────────────────────────────
  const statusConfig = {
    green: {
      bg: 'bg-emerald-900/30 border-emerald-500/40',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      label: t('statusValid'),
      msg: t('statusValidMsg')
    },
    yellow: {
      bg: 'bg-amber-900/30 border-amber-500/40',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      label: t('statusWarning'),
      msg: ''
    },
    red: {
      bg: 'bg-red-900/30 border-red-500/40',
      dot: 'bg-red-500',
      text: 'text-red-400',
      label: t('statusInvalid'),
      msg: ''
    },
  };

  // ── Renderizador de camada ────────────────────────────────────────────────
  const renderLayer = (issues: ValidationIssue[], titleKey: string, severity: Severity) => {
    const filteredIssues = issues.filter(i => i.severity === severity);
    if (filteredIssues.length === 0) return null;

    const headerColors: Record<Severity, string> = {
      E: 'text-red-400',
      W: 'text-amber-400',
      I: 'text-sky-400',
    };

    return (
      <div className="mt-4">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${headerColors[severity]}`}>
          {t(titleKey as any)}
        </p>
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 px-4 divide-y divide-slate-700/40">
          {filteredIssues.map((item, idx) => (
            <ValidationIssueItem key={`${item.code}-${item.line}-${idx}`} item={item} t={t} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Coluna esquerda — input */}
      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {t('layout.inputLabel')}
        </label>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          placeholder="^XA&#10;^FO10,10^GFA,100,100,10,FFFF^FS&#10;^XZ"
          className="w-full h-80 lg:h-full min-h-[320px] bg-slate-900 border border-slate-700/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent rounded-2xl p-5 text-sm font-mono text-slate-200 resize-none outline-none placeholder:text-slate-600 placeholder:italic"
        />
        <div className="flex gap-3">
          <button
            onClick={handleValidate}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('btnValidate')}
          </button>
          <button
            onClick={handleClear}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('btnClear')}
          </button>
        </div>
      </div>

      {/* Coluna direita — resultados */}
      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {t('layout.resultLabel')}
        </label>

        {/* Semáforo */}
        {result && (
          <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${statusConfig[result.semaphore].bg}`}>
            <span className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${statusConfig[result.semaphore].dot}`} />
            <div>
              <p className={`font-bold text-sm uppercase tracking-wider ${statusConfig[result.semaphore].text}`}>
                {statusConfig[result.semaphore].label}
              </p>
              {statusConfig[result.semaphore].msg && (
                <p className="text-slate-300 text-xs mt-0.5">{statusConfig[result.semaphore].msg}</p>
              )}
            </div>
          </div>
        )}

        {/* Lista de issues */}
        {result && result.issues.length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5">
            {renderLayer(result.issues, 'layerStructure', 'E')}
            {renderLayer(result.issues, 'layerSemantic', 'W')}
            {renderLayer(result.issues, 'layerBestPractice', 'I')}
          </div>
        )}

        {/* Feedback de SUCESSO absoluto (apenas se for VERDE e sem NENHUMA issue) */}
        {result && result.semaphore === 'green' && result.issues.length === 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-bold">{t('statusValidMsg')}</p>
            </div>
          </div>
        )}

        {/* Botão Fix — aparece quando há erros corrigíveis */}
        {showFixButton && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleFix}
              title={t('fix.tooltip')}
              className="flex items-center gap-2 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('fix.buttonWithCodes')}
            </button>
            {hasUnfixableErrors && (
              <p className="text-[11px] text-slate-500 px-1">
                {t('fix.manualNote')}
              </p>
            )}
          </div>
        )}

        {/* Copiar e Download — quando há resultado */}
        {result && code.trim() && (
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all"
              title={t('fix.copy')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('fix.copy')}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all"
              title={t('fix.download')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('fix.download')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
