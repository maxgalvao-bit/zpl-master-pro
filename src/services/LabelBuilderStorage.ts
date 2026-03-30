import { DadosEtiqueta, DadosEnvioNFe, TemplateId } from '../types/label.types';

const STORAGE_KEY = 'zplmaster_label_builder_draft_v2';

export interface StorageDraft {
  templateId: TemplateId;
  dados: DadosEtiqueta;
  dadosNFe: DadosEnvioNFe;
}

export function salvarRascunho(draft: StorageDraft) {
  const dadosSem: StorageDraft = {
    ...draft,
    dados: {
      ...draft.dados,
      remetente: { ...draft.dados.remetente, logoZplFragment: undefined },
    },
    dadosNFe: {
      ...draft.dadosNFe,
      remetente: { ...draft.dadosNFe.remetente, logoZplFragment: undefined },
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosSem));
}

export function carregarRascunho(): StorageDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.templateId) return null; // formato antigo — ignorar
    return parsed as StorageDraft;
  } catch {
    return null;
  }
}

export function limparRascunho() {
  localStorage.removeItem(STORAGE_KEY);
}
