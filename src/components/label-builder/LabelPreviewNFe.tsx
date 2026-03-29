"use client";

import type { DadosEnvioNFe } from "../../types/label.types";

interface Props {
  dados: DadosEnvioNFe;
}

function formatarChaveNFe(chave: string): string {
  const digits = chave.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export default function LabelPreviewNFe({ dados }: Props) {
  const { remetente: rem, destinatario: dest, nfe } = dados;
  const logo = rem.logoBase64;

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
        <p className="text-[10px] break-words">{dest.cpfCnpj || "—"}</p>
        <p className="text-[10px] break-words">{dest.endereco || "—"}</p>
        <p className="text-[10px] break-words">
          {dest.cidade || "—"} - {dest.uf || "—"} — CEP {dest.cep || "—"}
        </p>
      </div>

      {sep}

      {/* Dados Fiscais */}
      {(nfe.numero || nfe.chaveAcesso) ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[10px] uppercase tracking-wide">Dados Fiscais</p>
            {nfe.numero ? (
              <p className="text-[10px] break-words">NF-e: <span className="font-bold">{nfe.numero}</span></p>
            ) : null}
            {nfe.chaveAcesso ? (
              <p className="text-[9px] break-all text-slate-600">{formatarChaveNFe(nfe.chaveAcesso)}</p>
            ) : null}
          </div>
          {sep}
        </>
      ) : null}

      <div className="flex-1 min-h-2" />

      {/* Rodapé */}
      <div className="text-[9px] text-slate-500 border-t border-black/10 pt-1">
        <p className="truncate">{rem.empresa || "—"} — CNPJ: {rem.cnpj || "—"}</p>
        <p className="truncate">{rem.endereco || "—"}</p>
      </div>
    </div>
  );
}
