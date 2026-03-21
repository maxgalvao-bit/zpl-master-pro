import { DadosEtiqueta } from '../types/label.types';

const STORAGE_KEY = 'zplmaster_label_builder_draft';

export function salvarRascunho(dados: DadosEtiqueta) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

export function carregarRascunho(): DadosEtiqueta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limparRascunho() {
  localStorage.removeItem(STORAGE_KEY);
}
