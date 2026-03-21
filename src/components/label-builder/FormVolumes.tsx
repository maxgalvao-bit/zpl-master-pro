"use client";

import { useTranslations } from "next-intl";
import type { DadosEtiqueta, DadosVolume, Indicador } from "../../types/label.types";
import VolumeRow from "./VolumeRow";

interface Props {
  dados: DadosEtiqueta;
  onChange: (dados: DadosEtiqueta) => void;
}

function syncVolumes(total: number, current: DadosVolume[]): DadosVolume[] {
  if (total <= 0) return [];
  if (total > current.length) {
    const novos = Array.from({ length: total - current.length }, (_, i) => ({
      id: current.length + i + 1,
      peso: "",
      descricao: "",
      indicadores: [] as Indicador[],
    }));
    return [...current, ...novos];
  }
  return current.slice(0, total);
}

const inputClass = "bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2";

export default function FormVolumes({ dados, onChange }: Props) {
  const t = useTranslations("labelBuilder.form");

  const handleTotalChange = (n: number) => {
    const total = Math.max(1, Math.min(99, n));
    const volumes = syncVolumes(total, dados.volumes);
    onChange({ ...dados, totalVolumes: total, volumes });
  };

  const updateVolume = (idx: number, volume: DadosVolume) => {
    const volumes = [...dados.volumes];
    volumes[idx] = volume;
    onChange({ ...dados, volumes });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <label className={labelClass}>{t("totalVolumes")}</label>
          <input
            type="number"
            min={1}
            max={99}
            value={dados.totalVolumes}
            onChange={(e) => handleTotalChange(parseInt(e.target.value) || 1)}
            className={`${inputClass} w-24`}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dados.pesoIgualParaTodos}
            onChange={(e) => onChange({ ...dados, pesoIgualParaTodos: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
          />
          <span className="text-sm text-slate-400">{t("pesoIgual")}</span>
        </label>
        {dados.pesoIgualParaTodos && (
          <div>
            <label className={labelClass}>{t("pesoGlobal")}</label>
            <input
              type="text"
              value={dados.pesoGlobal}
              onChange={(e) => onChange({ ...dados, pesoGlobal: e.target.value })}
              placeholder="0,0"
              className={`${inputClass} w-32`}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {dados.volumes.map((vol, idx) => (
          <VolumeRow
            key={vol.id}
            volume={vol}
            dados={dados}
            onUpdate={(v) => updateVolume(idx, v)}
          />
        ))}
      </div>
    </div>
  );
}
