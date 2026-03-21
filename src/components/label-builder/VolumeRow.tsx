"use client";

import { useTranslations } from "next-intl";
import type { DadosEtiqueta, DadosVolume, Indicador } from "../../types/label.types";

interface Props {
  volume: DadosVolume;
  dados: DadosEtiqueta;
  onUpdate: (volume: DadosVolume) => void;
}

const inputClass = "bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none";
const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-500";

const INDICADORES: Indicador[] = ["fragil", "cima", "chuva", "inflamavel"];

export default function VolumeRow({ volume, dados, onUpdate }: Props) {
  const t = useTranslations("labelBuilder");
  const pesoIgual = dados.pesoIgualParaTodos;
  const pesoDisplay = pesoIgual ? dados.pesoGlobal : volume.peso;

  const toggleIndicador = (ind: Indicador) => {
    const next = volume.indicadores.includes(ind)
      ? volume.indicadores.filter((i) => i !== ind)
      : [...volume.indicadores, ind];
    onUpdate({ ...volume, indicadores: next });
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-5">
      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
        {t("form.volume")} {volume.id} / {dados.totalVolumes}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block ${labelClass} mb-2`}>{t("form.peso")}</label>
          <input
            type="text"
            value={pesoDisplay}
            onChange={(e) => onUpdate({ ...volume, peso: e.target.value })}
            disabled={pesoIgual}
            placeholder="0,0"
            className={`${inputClass} w-full ${pesoIgual ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>
        <div>
          <label className={`block ${labelClass} mb-2`}>{t("form.descricao")}</label>
          <input
            type="text"
            value={volume.descricao}
            onChange={(e) => onUpdate({ ...volume, descricao: e.target.value })}
            placeholder={t("form.descricao")}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>

      <div>
        <label className={`block ${labelClass} mb-2`}>{t("form.indicadores")}</label>
        <div className="flex flex-wrap gap-4">
          {INDICADORES.map((ind) => (
            <label
              key={ind}
              className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors"
            >
              <input
                type="checkbox"
                checked={volume.indicadores.includes(ind)}
                onChange={() => toggleIndicador(ind)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-sm">{t(`indicadores.${ind}`)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
