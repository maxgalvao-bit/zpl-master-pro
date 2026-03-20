"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Severity = 'error' | 'warning' | 'info';

interface ValidationItem {
  code: string;        // E001, W001, I001 …
  severity: Severity;
  messageKey: string;  // chave i18n correspondente ao código
  params?: Record<string, string | number>;
}

interface ValidationResult {
  status: 'idle' | 'valid' | 'warning' | 'invalid';
  errors: ValidationItem[];
  warnings: ValidationItem[];
  infos: ValidationItem[];
}

// ─── Engine de validação (pura, sem estado, testável) ─────────────────────────

function validateZpl(code: string): ValidationResult {
  const empty: ValidationResult = { status: 'idle', errors: [], warnings: [], infos: [] };
  if (!code || code.trim() === '') return empty;

  const upper = code.toUpperCase();
  const errors: ValidationItem[]   = [];
  const warnings: ValidationItem[] = [];
  const infos: ValidationItem[]    = [];

  const hasDG  = upper.includes('~DG');
  const hasXA  = upper.includes('^XA');
  const hasXZ  = upper.includes('^XZ');

  // ── Camada 1: Estrutura (bloqueante) ──────────────────────────────────────

  // Exceção: código ~DG isolado é válido (download de gráfico)
  if (!hasDG) {
    if (!hasXA) errors.push({ code: 'E001', severity: 'error', messageKey: 'E001' });
    if (!hasXZ) errors.push({ code: 'E002', severity: 'error', messageKey: 'E002' });

    // Verifica ordem ^XA → ^XZ
    if (hasXA && hasXZ) {
      const idxXA = upper.indexOf('^XA');
      const idxXZ = upper.indexOf('^XZ');
      if (idxXA > idxXZ) {
        errors.push({ code: 'E003', severity: 'error', messageKey: 'E003' });
      }
    }
  }

  // ^XGR sem ~DGR
  if (upper.includes('^XGR') && !hasDG) {
    errors.push({ code: 'E004', severity: 'error', messageKey: 'E004' });
  }

  // ── Camada 2: Semântica (avisos) ──────────────────────────────────────────

  // ^GFA sem ^PW e sem ^LL
  if (upper.includes('^GFA') && !upper.includes('^PW') && !upper.includes('^LL')) {
    warnings.push({ code: 'W001', severity: 'warning', messageKey: 'W001' });
  }

  // ^GFB presente
  if (upper.includes('^GFB')) {
    warnings.push({ code: 'W002', severity: 'warning', messageKey: 'W002' });
  }

  // ^FO com valores não-zero antes de ^GF
  const foMatch = upper.match(/\^FO(\d+),(\d+)(?=[\s\S]*?\^GF)/);
  if (foMatch) {
    const x = parseInt(foMatch[1], 10);
    const y = parseInt(foMatch[2], 10);
    if (x !== 0 || y !== 0) {
      warnings.push({ code: 'W003', severity: 'warning', messageKey: 'W003' });
    }
  }

  // Múltiplos blocos ^XA...^XZ
  const xaCount = (upper.match(/\^XA/g) || []).length;
  const xzCount = (upper.match(/\^XZ/g) || []).length;
  if (xaCount > 1) {
    warnings.push({ code: 'W004', severity: 'warning', messageKey: 'W004', params: { count: xaCount } });
  }

  // ^XA sem ^XZ correspondente
  if (hasXA && xaCount > xzCount) {
    warnings.push({ code: 'W005', severity: 'warning', messageKey: 'W005' });
  }

  // ── Camada 3: Boas Práticas (informativo) ─────────────────────────────────

  if (!upper.includes('^PW') && !upper.includes('^LL')) {
    infos.push({ code: 'I001', severity: 'info', messageKey: 'I001' });
  }

  if (!upper.includes('^MN')) {
    infos.push({ code: 'I002', severity: 'info', messageKey: 'I002' });
  }

  const pqMatch = upper.match(/\^PQ(\d+)/);
  if (pqMatch && parseInt(pqMatch[1], 10) !== 1) {
    infos.push({ code: 'I003', severity: 'info', messageKey: 'I003' });
  }

  // ── Status global ─────────────────────────────────────────────────────────
  let status: ValidationResult['status'];
  if (errors.length > 0)        status = 'invalid';
  else if (warnings.length > 0) status = 'warning';
  else                           status = 'valid';

  return { status, errors, warnings, infos };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ZplValidator() {
  const t = useTranslations('validator');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ValidationResult>({ status: 'idle', errors: [], warnings: [], infos: [] });

  const validate = () => setResult(validateZpl(code));
  const clear    = () => { setCode(''); setResult({ status: 'idle', errors: [], warnings: [], infos: [] }); };

  // ── Painel de status global ───────────────────────────────────────────────
  const statusConfig = {
    valid:   { bg: 'bg-emerald-900/30 border-emerald-500/40', dot: 'bg-emerald-400', text: 'text-emerald-400', label: t('statusValid'),   msg: t('statusValidMsg') },
    warning: { bg: 'bg-amber-900/30 border-amber-500/40',     dot: 'bg-amber-400',   text: 'text-amber-400',   label: t('statusWarning'),  msg: '' },
    invalid: { bg: 'bg-red-900/30 border-red-500/40',         dot: 'bg-red-500',     text: 'text-red-400',     label: t('statusInvalid'),  msg: '' },
  };

  // ── Renderizador de item de validação ─────────────────────────────────────
  const renderItem = (item: ValidationItem) => {
    const icons: Record<Severity, string> = {
      error:   'text-red-400',
      warning: 'text-amber-400',
      info:    'text-sky-400',
    };
    const badges: Record<Severity, string> = {
      error:   'bg-red-400/10 text-red-400 border-red-400/30',
      warning: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
      info:    'bg-sky-400/10 text-sky-400 border-sky-400/30',
    };

    const rawMsg = t(item.messageKey as Parameters<typeof t>[0], item.params as Record<string, string>);

    return (
      <div key={item.code} className="flex items-start gap-3 py-2.5 border-b border-slate-700/40 last:border-0">
        <span className={`font-black text-[10px] border rounded px-1.5 py-0.5 shrink-0 mt-0.5 tracking-wider ${badges[item.severity]}`}>
          {item.code}
        </span>
        <p className={`text-xs leading-relaxed ${icons[item.severity]}`}>
          {rawMsg}
        </p>
      </div>
    );
  };

  // ── Renderizador de camada ────────────────────────────────────────────────
  const renderLayer = (items: ValidationItem[], titleKey: string, severity: Severity) => {
    if (items.length === 0) return null;
    const headerColors: Record<Severity, string> = {
      error:   'text-red-400',
      warning: 'text-amber-400',
      info:    'text-sky-400',
    };
    return (
      <div className="mt-4">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${headerColors[severity]}`}>
          {t(titleKey as Parameters<typeof t>[0])}
        </p>
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 px-4 divide-y divide-slate-700/40">
          {items.map(renderItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Painel de status global */}
      {result.status !== 'idle' && (() => {
        const cfg = statusConfig[result.status as keyof typeof statusConfig];
        return (
          <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${cfg.bg}`}>
            <span className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${cfg.dot}`} />
            <div>
              <p className={`font-bold text-sm uppercase tracking-wider ${cfg.text}`}>{cfg.label}</p>
              {cfg.msg && <p className="text-slate-300 text-xs mt-0.5">{cfg.msg}</p>}
            </div>
          </div>
        );
      })()}

      {/* Barra de ação */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <button
          onClick={validate}
          disabled={!code.trim()}
          className="flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('btnValidate')}
        </button>

        <button
          onClick={clear}
          disabled={!code.trim()}
          className="flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-slate-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {t('btnClear')}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
        placeholder="^XA&#10;^FO10,10^GFA,100,100,10,FFFF^FS&#10;^XZ"
        className="w-full h-64 bg-slate-900 border border-slate-700/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent rounded-2xl p-5 text-sm font-mono text-slate-200 resize-none outline-none placeholder:text-slate-600 placeholder:italic"
      />

      {/* Resultados por camada */}
      {result.status !== 'idle' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5">
          {renderLayer(result.errors,   'layerStructure',    'error')}
          {renderLayer(result.warnings, 'layerSemantic',     'warning')}
          {renderLayer(result.infos,    'layerBestPractice', 'info')}

          {result.status === 'valid' && result.infos.length === 0 && (
            <div className="flex items-center gap-3 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-bold">{t('statusValidMsg')}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
