"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { DadosEtiqueta, DadosVolume, DadosEnvioNFe, Indicador, TemplateId } from "../../../../types/label.types";
import { carregarRascunho, salvarRascunho } from "../../../../services/LabelBuilderStorage";
import { gerarZplCompleto } from "../../../../services/LabelGenerator";
import { generateLabelBuilderPdf, generateEnvioNFePdf } from "../../../../services/LabelBuilderPdf";
import { gerarZplEnvioNFe } from "../../../../services/EnvioNFeGenerator";
import TemplateSelector from "../../../../components/label-builder/TemplateSelector";
import FormDadosFixos from "../../../../components/label-builder/FormDadosFixos";
import FormVolumes from "../../../../components/label-builder/FormVolumes";
import FormEnvioNFe from "../../../../components/label-builder/FormEnvioNFe";
import LabelPreview from "../../../../components/label-builder/LabelPreview";
import LabelPreviewNFe from "../../../../components/label-builder/LabelPreviewNFe";
import ExportBar from "../../../../components/label-builder/ExportBar";

function createDefaultDados(): DadosEtiqueta {
  return {
    remetente: { empresa: "", cnpj: "", endereco: "", logoBase64: undefined, logoZplFragment: undefined },
    destinatario: { nome: "", cpfCnpj: "", endereco: "", cidade: "", uf: "", cep: "" },
    notaFiscal: "",
    totalVolumes: 1,
    pesoIgualParaTodos: false,
    pesoGlobal: "",
    volumes: [{ id: 1, peso: "", descricao: "", indicadores: [] as Indicador[] }],
  };
}

function createDefaultDadosNFe(): DadosEnvioNFe {
  return {
    remetente: { empresa: "", cnpj: "", endereco: "", logoBase64: undefined, logoZplFragment: undefined },
    destinatario: { nome: "", cpfCnpj: "", endereco: "", cidade: "", uf: "", cep: "" },
    nfe: { numero: "", chaveAcesso: "" },
  };
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

export default function LabelBuilderWrapper() {
  const t = useTranslations("labelBuilder");
  const router = useRouter();
  const locale = useLocale();
  const [dados, setDados] = useState<DadosEtiqueta>(createDefaultDados);
  const [dadosNFe, setDadosNFe] = useState<DadosEnvioNFe>(createDefaultDadosNFe);
  const [templateId, setTemplateId] = useState<TemplateId>("transporte-mercadoria");
  const [previewVolumeIndex, setPreviewVolumeIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('zplmaster_lb_email');
    if (!saved) {
      router.replace(`/${locale}/label-builder/acesso`);
    }
  }, []);

  useEffect(() => {
    const rascunho = carregarRascunho();
    if (rascunho) {
      setTemplateId(rascunho.templateId);
      const volumes = syncVolumes(rascunho.dados.totalVolumes, rascunho.dados.volumes || []);
      setDados({ ...rascunho.dados, volumes });
      setDadosNFe(rascunho.dadosNFe);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => salvarRascunho({ templateId, dados, dadosNFe }), 500);
    return () => clearTimeout(timer);
  }, [templateId, dados, dadosNFe]);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id as TemplateId);
  };

  // Transporte template
  const hasVolumes = dados.volumes.length > 0;
  const canPreview = previewVolumeIndex < dados.volumes.length;

  // NF-e template
  const canExportNFe = !!(dadosNFe.remetente.empresa && dadosNFe.destinatario.nome);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Coluna esquerda — formulário */}
      <div className="flex flex-col gap-8">
        <TemplateSelector selectedId={templateId} onSelect={handleTemplateChange} />

        {templateId === "transporte-mercadoria" ? (
          <>
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6">
              <FormDadosFixos dados={dados} onChange={setDados} />
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6">
              <FormVolumes dados={dados} onChange={setDados} />
            </div>
            <ExportBar
              gerarZpl={() => gerarZplCompleto(dados)}
              gerarPdf={() => generateLabelBuilderPdf(dados)}
              nomeArquivo={`etiquetas_NF${dados.notaFiscal}_${dados.totalVolumes}vol.zpl`}
              canExport={hasVolumes}
            />
          </>
        ) : (
          <>
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6">
              <FormEnvioNFe dados={dadosNFe} onChange={setDadosNFe} />
            </div>
            <ExportBar
              gerarZpl={() => gerarZplEnvioNFe(dadosNFe)}
              gerarPdf={() => generateEnvioNFePdf(dadosNFe)}
              nomeArquivo={`envio_nfe_${dadosNFe.nfe.numero || 'sem_nf'}.zpl`}
              canExport={canExportNFe}
            />
          </>
        )}
      </div>

      {/* Coluna direita — preview */}
      <div className="flex flex-col gap-6 sticky top-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {t("layout.resultLabel")}
          </label>

          {templateId === "transporte-mercadoria" ? (
            <>
              {hasVolumes && (
                <div className="flex gap-2 mb-3">
                  <label className="text-xs text-slate-400">{t("form.volume")}:</label>
                  <select
                    value={previewVolumeIndex}
                    onChange={(e) => setPreviewVolumeIndex(parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
                  >
                    {dados.volumes.map((v, i) => (
                      <option key={v.id} value={i}>
                        {v.id} / {dados.totalVolumes}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {canPreview ? (
                <LabelPreview dados={dados} volumeIndex={previewVolumeIndex} />
              ) : (
                <div className="w-full max-w-[340px] aspect-[100/150] rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
                  {t("previewEmpty")}
                </div>
              )}
            </>
          ) : (
            <LabelPreviewNFe dados={dadosNFe} />
          )}
        </div>
      </div>
    </div>
  );
}
