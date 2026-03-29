"use client";

import { useState, useEffect } from "react";
import type { DadosEnvioNFe } from "../../types/label.types";
import { gerarZplEnvioNFe } from "../../services/EnvioNFeGenerator";
import { ZplEngine } from "../../services/ZplEngine";

interface Props {
  dados: DadosEnvioNFe;
}

export default function LabelPreviewNFe({ dados }: Props) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const zpl = gerarZplEnvioNFe(dados);
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
    <img
      src={pngUrl}
      alt="Preview etiqueta NF-e"
      className="w-full max-w-[340px] rounded-xl border border-slate-700"
    />
  );
}
