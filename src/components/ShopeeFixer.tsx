"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ZplEditorWrapper from "./ZplEditorWrapper";
import { Link } from "../i18n/routing";

// Função pura de diagnóstico — sem estado, testável, sem ambiguidade
const getDiagnosticStatus = (code: string): 'idle' | 'success' | 'warning' | 'error' => {
  if (!code || code.trim() === '') return 'idle';

  const upperCode = code.toUpperCase();

  // 1. GATEKEEPER: O código TEM que ser um ZPL/Gráfico válido
  const hasXA = upperCode.includes('^XA');
  const hasXZ = upperCode.includes('^XZ');
  const hasDG = upperCode.includes('~DG');

  // Se NÃO (tem abertura e fechamento) e NÃO (é um gráfico direto) -> ERRO!
  if (!((hasXA && hasXZ) || hasDG)) {
    return 'error';
  }

  // 2. ORPHAN REFERENCE CHECK: ^XGR referencia um gráfico (~DGR) que não existe no código
  //    Isso ocorre quando o usuário copia somente a parte do ^XA, cortando o ~DGR inicial
  if (upperCode.includes('^XGR') && !hasDG) {
    return 'error';
  }

  // 3. SHOPEE CHECK: Se passou pelo porteiro, procura a imagem inline gigante (^GFA)
  if (upperCode.includes('^GFA')) {
    // Se já tem a nossa trava de segurança (4x6 e margem 0), está corrigido
    if (upperCode.includes('^PW') || upperCode.includes('^FO0,0')) {
      return 'success';
    }
    // Se tem imagem gigante mas não tem trava, precisa corrigir
    return 'warning';
  }

  // 4. FALLBACK: É um ZPL válido, mas não tem imagem problemática
  return 'success';
};

// Status inclui 'invalid' para distinguir erro de formato no painel visual
// (getDiagnosticStatus retorna 'error' = ZPL inválido, mapeado para o painel 'invalid')
type Status = 'idle' | 'success' | 'warning' | 'error';

export default function ShopeeFixer() {
  const t = useTranslations("shopeeFixer");
  const [zpl, setZpl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [isFixed, setIsFixed] = useState(false);
  const [copied, setCopied] = useState(false);

  const diagnose = () => {
    const result = getDiagnosticStatus(zpl);
    setStatus(result);
    // isFixed = true só quando já passou pela correção completa
    const upperCode = zpl.toUpperCase();
    const alreadyFixed = result === 'success' &&
      upperCode.includes('^GFA') &&
      (upperCode.includes('^PW') || upperCode.includes('^FO0,0'));
    setIsFixed(alreadyFixed);
  };

  const fix = () => {
    let fixed = zpl
      // 1. Normalizar quebras de linha
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      // 2. Converter GFB incompatível em GFA
      .replace(/\^GFB/gi, "^GFA");

    // 3. Injetar ou substituir ^PW e ^LL logo após ^XA
    //    Remove instâncias existentes de ^PW e ^LL onde quer que estejam
    fixed = fixed.replace(/\^PW\d+/gi, "").replace(/\^LL\d+/gi, "");
    //    Injeta as dimensões Shopee 4x6 @ 203dpi imediatamente após ^XA
    fixed = fixed.replace(/(\^XA)/i, "$1^PW812^LL1218");

    // 4. Resetar a origem ^FO para 0,0 no bloco de imagem
    //    Encontra ^FO seguido de dois números antes do bloco ^GF
    fixed = fixed.replace(/\^FO\d+,\d+(?=[\s\S]*?\^GF)/gi, "^FO0,0");

    setZpl(fixed.trim());
    setStatus("success");
    setIsFixed(true);
  };

  const copyFixed = async () => {
    await navigator.clipboard.writeText(zpl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const statusPanel = () => {
    if (status === "idle") return null;

    const configs: Record<Exclude<Status, "idle">, {
      bg: string; icon: string; dot: string;
      title: string; msg: string; showFix: boolean;
    }> = {
      success: {
        bg: "bg-emerald-900/30 border-emerald-500/40",
        icon: "text-emerald-400",
        dot: "bg-emerald-400",
        title: t("statusOkTitle"),
        msg: t("statusOkMsg"),
        showFix: false,
      },
      warning: {
        bg: "bg-amber-900/30 border-amber-500/40",
        icon: "text-amber-400",
        dot: "bg-amber-400",
        title: t("statusWarnTitle"),
        msg: t("statusWarnMsg"),
        showFix: true,
      },
      error: {
        bg: "bg-red-900/30 border-red-500/40",
        icon: "text-red-400",
        dot: "bg-red-500",
        title: t("invalidFormatTitle"),
        msg: t("invalidFormatMsg"),
        showFix: false,
      },
    };

    const cfg = configs[status];

    return (
      <div className={`flex flex-col gap-3 rounded-xl border px-5 py-4 mb-6 ${cfg.bg}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${cfg.dot}`}></span>
            <div>
              <p className={`font-bold text-sm uppercase tracking-wider ${cfg.icon}`}>{cfg.title}</p>
              <p className="text-slate-300 text-xs mt-0.5">{cfg.msg}</p>
            </div>
          </div>
          {cfg.showFix && (
            <button
              onClick={fix}
              className="shrink-0 bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all"
            >
              {t("btnFix")}
            </button>
          )}
        </div>
        {/* Cross-sell: Validador de Sintaxe */}
        {status === "error" && (
          <Link
            href="/tools/validator"
            className="self-start flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-600 hover:border-amber-400 rounded-full px-4 py-2 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t("btnValidator")}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Painel de Diagnóstico */}
      {statusPanel()}

      {/* Barra de ação: Diagnosticar + Copiar */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <button
          onClick={diagnose}
          disabled={!zpl.trim()}
          className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-600 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full hover:border-amber-400 hover:text-amber-400 hover:bg-slate-800/80 transition-all shadow-md hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("btnDiagnose")}
        </button>

        <button
          onClick={copyFixed}
          disabled={!isFixed}
          className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow-md ${
            copied
              ? "bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
              : isFixed
              ? "bg-slate-700 text-white border border-slate-600 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-40"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? t("btnCopied") : t("btnCopy")}
        </button>
      </div>

      {/* Editor ZPL controlado */}
      <ZplEditorWrapper value={zpl} onChange={setZpl} />
    </div>
  );
}
