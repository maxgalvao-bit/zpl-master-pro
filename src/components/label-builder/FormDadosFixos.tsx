"use client";

import { useTranslations } from "next-intl";
import { useCpfCnpjMask } from "../../hooks/useCpfCnpjMask";
import { encodeLogoForZpl } from "../../services/encodeLogoForZpl";
import type { DadosEtiqueta } from "../../types/label.types";

interface Props {
  dados: DadosEtiqueta;
  onChange: (dados: DadosEtiqueta) => void;
}

const inputClass = "w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2";

export default function FormDadosFixos({ dados, onChange }: Props) {
  const t = useTranslations("labelBuilder.form");
  const { handleChange } = useCpfCnpjMask();
  const { remetente, destinatario, notaFiscal } = dados;

  const setRemetente = (r: Partial<DadosEtiqueta["remetente"]>) =>
    onChange({ ...dados, remetente: { ...remetente, ...r } });

  const setDestinatario = (d: Partial<DadosEtiqueta["destinatario"]>) =>
    onChange({ ...dados, destinatario: { ...destinatario, ...d } });

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
      setRemetente({
        logoBase64: dataUrl,
        logoZplFragment: zpl ?? undefined,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearLogo = () => {
    setRemetente({ logoBase64: undefined, logoZplFragment: undefined });
  };

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
            <input
              type="text"
              value={destinatario.uf}
              onChange={(e) => setDestinatario({ uf: e.target.value })}
              placeholder={t("uf")}
              className={inputClass}
              maxLength={2}
            />
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

      {/* Nota fiscal */}
      <div>
        <label className={labelClass}>{t("notaFiscal")}</label>
        <input
          type="text"
          value={notaFiscal}
          onChange={(e) => onChange({ ...dados, notaFiscal: e.target.value })}
          placeholder={t("notaFiscal")}
          className={inputClass}
        />
      </div>
    </div>
  );
}
