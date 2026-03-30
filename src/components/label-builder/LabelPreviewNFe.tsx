"use client";

import { useState, useEffect } from "react";
import type { DadosEnvioNFe } from "../../types/label.types";
import { gerarZplEnvioNFe } from "../../services/EnvioNFeGenerator";
import { ZplEngine } from "../../services/ZplEngine";

interface Props {
  dados: DadosEnvioNFe;
}

// Canvas ZPL: ^PW812 ^LL1260
// Logo: ^FO22,25, max 240×120 dots
const LOGO_LEFT_PCT  = (22  / 812)  * 100; // 2.71%
const LOGO_TOP_PCT   = (30  / 1218) * 100; // 2.46%
const LOGO_MAX_W_PCT = (240 / 812)  * 100; // 29.6%
const LOGO_MAX_H_PCT = (120 / 1260) * 100; // 9.52%


export default function LabelPreviewNFe({ dados }: Props) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Strip logoZplFragment — zpl-renderer-js doesn't support ~DGR/^XGR.
    // logoBase64 presence still sets tx=270 (correct text offset);
    // the logo is overlaid as an HTML <img> below.
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

  const containerStyle: React.CSSProperties = {
    aspectRatio: '812 / 1260',
    width: '100%',
  };

  if (loading) {
    return (
      <div className="w-full min-w-[300px] max-w-[340px]" style={containerStyle}>
        <div className="w-full h-full rounded-xl border border-slate-700 flex items-center justify-center text-slate-500 text-sm animate-pulse">
          Renderizando...
        </div>
      </div>
    );
  }

  if (!pngUrl) {
    return (
      <div className="w-full min-w-[300px] max-w-[340px]" style={containerStyle}>
        <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
          Preencha os dados para visualizar
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-[300px] max-w-[340px]" style={containerStyle}>
      <img
        src={pngUrl}
        alt="Preview etiqueta NF-e"
        className="w-full h-full object-contain rounded-xl border border-slate-700 block"
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
