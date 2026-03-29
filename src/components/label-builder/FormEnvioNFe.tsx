"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCpfCnpjMask } from "../../hooks/useCpfCnpjMask";
import { encodeLogoForZpl } from "../../services/encodeLogoForZpl";
import type { DadosEnvioNFe } from "../../types/label.types";

interface Props {
  dados: DadosEnvioNFe;
  onChange: (dados: DadosEnvioNFe) => void;
}

const inputClass = "w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2";

const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
];

function maskChaveNFe(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 44);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export default function FormEnvioNFe({ dados, onChange }: Props) {
  const t = useTranslations("labelBuilder.form");
  const { handleChange } = useCpfCnpjMask();
  const [showFiscal, setShowFiscal] = useState(false);

  const { remetente, destinatario, nfe } = dados;

  const setRemetente = (r: Partial<DadosEnvioNFe["remetente"]>) =>
    onChange({ ...dados, remetente: { ...remetente, ...r } });

  const setDestinatario = (d: Partial<DadosEnvioNFe["destinatario"]>) =>
    onChange({ ...dados, destinatario: { ...destinatario, ...d } });

  const setNFe = (n: Partial<DadosEnvioNFe["nfe"]>) =>
    onChange({ ...dados, nfe: { ...nfe, ...n } });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const zpl = await encodeLogoForZpl(dataUrl);
      setRemetente({ logoBase64: dataUrl, logoZplFragment: zpl ?? undefined });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearLogo = () =>
    setRemetente({ logoBase64: undefined, logoZplFragment: undefined });

  return (
    <div className="flex flex-col gap-6">
      {/* Remetente */}
      <div>
        <h3 className={labelClass}>{t("remetente")}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>{t("logo")}</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-xs file:font-bold file:text-amber-400"
              />
              {remetente.logoBase64 ? (
                <button
                  type="button"
                  onClick={clearLogo}
                  className="text-xs font-bold uppercase text-red-400 hover:text-red-300"
                >
                  {t("removeLogo")}
                </button>
              ) : null}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 italic">{t("logoHint")}</p>
            {remetente.logoBase64 ? (
              <img
                src={remetente.logoBase64}
                alt=""
                className="mt-2 max-h-16 object-contain rounded border border-slate-700"
              />
            ) : null}
          </div>
          <input
            type="text"
            value={remetente.empresa}
            onChange={(e) => setRemetente({ empresa: e.target.value })}
            placeholder={t("empresa")}
            className={inputClass}
          />
          <input
            type="text"
            value={remetente.cnpj}
            onChange={(e) => setRemetente({ cnpj: e.target.value })}
            placeholder={t("cnpj")}
            className={inputClass}
          />
          <input
            type="text"
            value={remetente.endereco}
            onChange={(e) => setRemetente({ endereco: e.target.value })}
            placeholder={t("endereco")}
            className={inputClass}
          />
        </div>
      </div>

      {/* Destinatário */}
      <div>
        <h3 className={labelClass}>{t("destinatario")}</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={destinatario.nome}
            onChange={(e) => setDestinatario({ nome: e.target.value })}
            placeholder={t("nome")}
            className={inputClass}
          />
          <input
            type="text"
            value={destinatario.cpfCnpj}
            onChange={(e) => handleChange(e, (v) => setDestinatario({ cpfCnpj: v }))}
            placeholder={t("cpfCnpj")}
            maxLength={18}
            className={inputClass}
          />
          <input
            type="text"
            value={destinatario.endereco}
            onChange={(e) => setDestinatario({ endereco: e.target.value })}
            placeholder={t("endereco")}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={destinatario.cidade}
              onChange={(e) => setDestinatario({ cidade: e.target.value })}
              placeholder={t("cidade")}
              className={inputClass}
            />
            <select
              value={destinatario.uf}
              onChange={(e) => setDestinatario({ uf: e.target.value })}
              className={inputClass}
            >
              <option value="">{t("uf")}</option>
              {UF_OPTIONS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={destinatario.cep}
            onChange={(e) => setDestinatario({ cep: e.target.value })}
            placeholder={t("cep")}
            className={inputClass}
          />
        </div>
      </div>

      {/* Dados Fiscais — collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setShowFiscal(!showFiscal)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-colors"
        >
          <span className={`transition-transform ${showFiscal ? 'rotate-90' : ''}`}>▶</span>
          {t("dadosFiscais")}
          <span className="text-slate-600 normal-case font-normal tracking-normal">
            — {t("chaveAcessoTooltip")}
          </span>
        </button>

        {showFiscal && (
          <div className="flex flex-col gap-3 mt-3">
            <input
              type="text"
              value={nfe.numero}
              onChange={(e) => setNFe({ numero: e.target.value })}
              placeholder={t("numeroNFe")}
              className={inputClass}
            />
            <div>
              <input
                type="text"
                value={nfe.chaveAcesso}
                onChange={(e) => setNFe({ chaveAcesso: maskChaveNFe(e.target.value) })}
                placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                maxLength={54}
                className={inputClass}
              />
              <p className="text-[10px] text-slate-600 mt-1 italic">{t("chaveAcesso")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
