"use client";

import type { DadosEtiqueta, Indicador } from "../../types/label.types";
import { SIMBOLOS } from "./simbolos";

interface Props {
  dados: DadosEtiqueta;
  volumeIndex: number;
}

function SimboloBox({ tipo }: { tipo: Indicador }) {
  const s = SIMBOLOS[tipo];
  return (
    <div
      className="flex flex-col items-center justify-center border border-black shrink-0"
      style={{ width: 44, height: 52 }}
    >
      <svg width="32" height="32" viewBox="0 0 44 44" className="shrink-0">
        <path
          d={s.path}
          fill={tipo === "inflamavel" || tipo === "fragil" ? "#111" : "none"}
          stroke="#111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[6px] font-bold text-center leading-tight text-black px-0.5">
        {s.label.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

export default function LabelPreview({ dados, volumeIndex }: Props) {
  const volume = dados.volumes[volumeIndex];
  if (!volume) return null;

  const peso = dados.pesoIgualParaTodos ? dados.pesoGlobal : volume.peso;
  const dest = dados.destinatario;
  const rem = dados.remetente;
  const logo = rem.logoBase64;

  const formatDoc = (doc: string) => {
    const d = doc.replace(/\D/g, "");
    return d.length <= 11 ? `CPF: ${doc}` : `CNPJ: ${doc}`;
  };

  const sep = <div className="h-px w-full bg-black shrink-0" />;

  return (
    <div
      className="w-full max-w-[340px] border border-slate-700 rounded-xl bg-white text-black flex flex-col gap-2 p-3 text-[11px] leading-snug overflow-hidden"
      style={{ aspectRatio: "100 / 150" }}
    >
      {/* Cabeçalho remetente */}
      <div className="flex flex-col gap-2 min-h-0">
        {sep}
        <div className="flex gap-2 items-start min-h-[48px]">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="object-contain shrink-0 border border-black/10 rounded"
              style={{ maxWidth: "30mm", maxHeight: "15mm", width: "auto", height: "auto" }}
            />
          ) : null}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight break-words">{rem.empresa || "—"}</p>
            <p className="text-[10px] break-words">CNPJ: {rem.cnpj || "—"}</p>
            <p className="text-[10px] break-words">{rem.endereco || "—"}</p>
          </div>
        </div>
      </div>

      {sep}

      {/* Destinatário */}
      <div className="flex flex-col gap-1.5 min-h-[72px]">
        <p className="font-bold text-[10px] uppercase tracking-wide">Destinatário</p>
        <p className="font-bold text-sm break-words">{dest.nome || "—"}</p>
        <p className="text-[10px] break-words">{dest.cpfCnpj ? formatDoc(dest.cpfCnpj) : "—"}</p>
        <p className="text-[10px] break-words">{dest.endereco || "—"}</p>
        <p className="text-[10px] break-words">
          {dest.cidade || "—"} - {dest.uf || "—"} - CEP {dest.cep || "—"}
        </p>
      </div>

      {sep}

      {/* NF / Volume / Peso */}
      <div className="grid grid-cols-3 gap-1 min-h-[36px]">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-semibold uppercase">NF</span>
          <span className="font-bold text-lg leading-none truncate">{dados.notaFiscal || "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-semibold uppercase">Vol.</span>
          <span className="font-bold text-lg leading-none">
            {volume.id} / {dados.totalVolumes}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-semibold uppercase">Peso</span>
          <span className="font-bold text-lg leading-none truncate">{peso || "—"} kg</span>
        </div>
      </div>

      {sep}

      {/* Produto */}
      <div className="flex flex-col gap-1 min-h-[32px]">
        <span className="text-[9px] font-semibold uppercase">Produto</span>
        <p className="font-semibold text-sm break-words">{volume.descricao || "—"}</p>
      </div>

      {/* Indicadores — só se houver */}
      {volume.indicadores.length > 0 ? (
        <>
          {sep}
          <div className="flex flex-col gap-2 min-h-0">
            <span className="text-[9px] font-semibold uppercase">Indicadores</span>
            <div className="flex flex-wrap gap-2">
              {volume.indicadores.map((ind) => (
                <SimboloBox key={ind} tipo={ind} />
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="flex-1 min-h-2" />
    </div>
  );
}
