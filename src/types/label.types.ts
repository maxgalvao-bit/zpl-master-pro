export type Indicador = 'fragil' | 'cima' | 'chuva' | 'inflamavel';

export interface DadosRemetente {
  empresa: string;
  cnpj: string;
  endereco: string;
  /** Data URL (image/*) para preview, PDF e persistência */
  logoBase64?: string;
  /** Fragmento ZPL ^GFA...^FS gerado no upload (browser) */
  logoZplFragment?: string;
}

export interface DadosDestinatario {
  nome: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface DadosVolume {
  id: number;
  peso: string;
  descricao: string;
  indicadores: Indicador[];
}

export interface DadosEtiqueta {
  remetente: DadosRemetente;
  destinatario: DadosDestinatario;
  notaFiscal: string;
  totalVolumes: number;
  pesoIgualParaTodos: boolean;
  pesoGlobal: string;
  volumes: DadosVolume[];
}

import type { ComponentType } from 'react';

export interface LabelTemplate {
  id: string;
  nomeKey: string;
  descricaoKey: string;
  component: ComponentType<{ dados: DadosEtiqueta }>;
  gerarZpl: (dados: DadosEtiqueta) => string;
}
