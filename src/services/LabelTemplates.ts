import { LabelTemplate } from '../types/label.types';
import { gerarZplCompleto } from './LabelGenerator';

// Lazy import to avoid circular dependency - LabelPreview imports TEMPLATES
export const TEMPLATES: LabelTemplate[] = [
  {
    id: 'transporte-mercadoria',
    nomeKey: 'templates.transporte.nome',
    descricaoKey: 'templates.transporte.descricao',
    component: null as unknown as LabelTemplate['component'],
    gerarZpl: gerarZplCompleto,
  },
  {
    id: 'envio-nfe',
    nomeKey: 'templates.envioNfe.nome',
    descricaoKey: 'templates.envioNfe.descricao',
    component: null as unknown as LabelTemplate['component'],
    gerarZpl: null, // usa gerarZplEnvioNFe — dados diferentes (DadosEnvioNFe)
  },
];
