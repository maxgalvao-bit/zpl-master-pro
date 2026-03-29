"use client";

import { useState, useEffect } from "react";
import type { DadosEnvioNFe } from "../../types/label.types";
import { gerarZplEnvioNFe } from "../../services/EnvioNFeGenerator";
import { ZplEngine } from "../../services/ZplEngine";

interface Props {
  dados: DadosEnvioNFe;
}

// Logo position/size as % of label canvas (812×1218 dots, ^FO20,22, max 240×120 dots)
const LOGO_LEFT_PCT  = (20  / 812)  * 100; // 2.46%
const LOGO_TOP_PCT   = (22  / 1218) * 100; // 1.81%
const LOGO_MAX_W_PCT = (240 / 812)  * 100; // 29.6%
const LOGO_MAX_H_PCT = (120 / 1218) * 100; // 9.85%

export default function LabelPreviewNFe({ dados }: Props) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Strip ^GFA from ZPL — zpl-renderer-js doesn't support it.
    // Pass dados without logoZplFragment so the ^GFA block is omitted,
    // but logoBase64 presence still sets tx=270 (correct text offset).
    const dadosParaRender: DadosEnvioNFe = {
      ...dados,
      remetente: { ...dados.remetente, logoZplFragment: undefined },
    };

    const zpl = gerarZplEnvioNFe(dadosParaRender);
    ZplEngine.render(zpl).then((result) => {
      if (cancelled) return;
      setPngUrl(
        result.status === "success" && result.labels?.[0]
          ? result.labels[0]
          : null
      );
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [dados]);

  if (loading) {
    return (
      <div className="w-full max-w-[340px] aspect-[100/150] rounded-xl border border-slate-700 flex items-center justify-center text-slate-500 text-sm animate-pulse">
        Renderizando...
      </div>
    );
  }

  if (!pngUrl) {
    return (
      <div className="w-full max-w-[340px] aspect-[100/150] rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
        Preencha os dados para visualizar
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[340px]">
      <img
        src={pngUrl}
        alt="Preview etiqueta NF-e"
        className="w-full rounded-xl border border-slate-700 block"
      />
      {dados.remetente.logoBase64 ? (
        <img
          src={dados.remetente.logoBase64}
          alt=""
          className="absolute object-contain pointer-events-none"
          style={{
            left:      `${LOGO_LEFT_PCT}%`,
            top:       `${LOGO_TOP_PCT}%`,
            maxWidth:  `${LOGO_MAX_W_PCT}%`,
            maxHeight: `${LOGO_MAX_H_PCT}%`,
            width: "auto",
            height: "auto",
          }}
        />
      ) : null}
    </div>
  );
}
