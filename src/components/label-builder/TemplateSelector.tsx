"use client";

import { useTranslations } from "next-intl";
import { TEMPLATES } from "../../services/LabelTemplates";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selectedId, onSelect }: Props) {
  const t = useTranslations("labelBuilder");

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {t("title")}
      </label>
      <div className="flex flex-wrap gap-3">
        {TEMPLATES.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          const isActive = tpl.id === "transporte-mercadoria";
          return (
            <button
              key={tpl.id}
              onClick={() => isActive && onSelect(tpl.id)}
              disabled={!isActive}
              className={`px-5 py-3 rounded-xl border font-bold text-sm uppercase tracking-wider transition-all ${
                isActive
                  ? isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-400"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-amber-400/50 hover:text-amber-400"
                  : "bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-60"
              }`}
            >
              {t(tpl.nomeKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
