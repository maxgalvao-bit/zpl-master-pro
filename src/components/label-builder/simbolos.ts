import type { Indicador } from '../../types/label.types';

export const SIMBOLOS: Record<Indicador, { label: string; path: string }> = {
  fragil: {
    label: 'FRÁGIL',
    path: 'M18 8 Q16 14 19 17 L15 32 Q15 35 22 35 Q29 35 29 32 L25 17 Q28 14 26 8 Z',
  },
  cima: {
    label: 'ESTE LADO\nPARA CIMA',
    path: 'M16 34 L16 14 M28 34 L28 14 M10 20 L16 12 L22 20 M22 20 L28 12 L34 20',
  },
  chuva: {
    label: 'PROTEGER\nDA CHUVA',
    path: 'M10 22 Q10 12 22 12 Q34 12 34 22 Z M22 22 L22 34 Q22 38 18 38',
  },
  inflamavel: {
    label: 'INFLAMÁVEL',
    path: 'M22 8 C22 8 28 14 26 20 C30 16 30 12 30 12 C30 12 36 18 34 26 C33 31 28 36 22 36 C16 36 10 31 10 25 C10 19 14 16 14 16 C14 16 14 22 18 22 C16 18 20 12 22 8 Z',
  },
};
