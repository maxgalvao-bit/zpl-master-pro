import { DadosEtiqueta, DadosVolume, Indicador } from '../types/label.types';

const INDICADOR_ZPL: Record<Indicador, string> = {
  fragil: 'FRAGILE',
  cima: 'CIMA',
  chuva: 'CHUVA',
  inflamavel: 'INFLAMAVEL',
};

/** Evita que caracteres ^ e ~ quebrem comandos ZPL dentro de ^FD */
function sanitizeFd(s: string): string {
  return s.replace(/\^/g, ' ').replace(/~/g, ' ');
}

function formatarDocumento(doc: string): string {
  const digits = doc.replace(/\D/g, '');
  if (digits.length <= 11) return `CPF: ${doc}`;
  return `CNPJ: ${doc}`;
}

export function gerarZplVolume(dados: DadosEtiqueta, volume: DadosVolume): string {
  const peso = dados.pesoIgualParaTodos ? dados.pesoGlobal : volume.peso;
  const dest = dados.destinatario;
  const rem = dados.remetente;
  const hasLogoGraphic = Boolean(rem.logoZplFragment?.trim());
  const hasLogoInForm = Boolean(rem.logoBase64 || hasLogoGraphic);
  const tx = hasLogoInForm ? 270 : 20;

  const linhasIndicadores =
    volume.indicadores.length > 0
      ? volume.indicadores
          .map((ind, i) => {
            const x = 20 + i * 120;
            return `^FO${x},820^CF0,22^FD${INDICADOR_ZPL[ind]}^FS`;
          })
          .join('\n')
      : '';

  const blocoIndicadores =
    volume.indicadores.length > 0
      ? `
^FO20,440^GB772,0,2^FS

^FO20,450^CF0,20^FDINDICADORES DE MANUSEIO^FS
${linhasIndicadores}
`
      : '';

  const logoBlock = hasLogoGraphic ? `${rem.logoZplFragment}\n` : '';

  return `^XA
^CI28
^PW812
^LL1218
^CF0,30

^FO20,20^GB772,0,3^FS

${logoBlock}^FO${tx},30^CF0,24^FD${sanitizeFd(rem.empresa)}^FS
^FO${tx},62^CF0,20^FDCNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO${tx},88^CF0,18^FD${sanitizeFd(rem.endereco)}^FS

^FO20,115^GB772,0,2^FS

^FO20,125^CF0,20^FDDESTINATARIO^FS
^FO20,152^CF0,28^FD${sanitizeFd(dest.nome)}^FS
^FO20,186^CF0,20^FD${sanitizeFd(formatarDocumento(dest.cpfCnpj))}^FS
^FO20,210^CF0,20^FD${sanitizeFd(dest.endereco)}^FS
^FO20,234^CF0,20^FD${sanitizeFd(dest.cidade)} - ${sanitizeFd(dest.uf)} - CEP ${sanitizeFd(dest.cep)}^FS

^FO20,260^GB772,0,2^FS

^FO20,270^CF0,20^FDNOTA FISCAL^FS
^FO20,296^CF0,42^FD${sanitizeFd(dados.notaFiscal)}^FS

^FO270,270^CF0,20^FDVOLUME^FS
^FO270,296^CF0,42^FD${volume.id} / ${dados.totalVolumes}^FS

^FO520,270^CF0,20^FDPESO^FS
^FO520,296^CF0,42^FD${sanitizeFd(peso)} kg^FS

^FO20,360^GB772,0,2^FS

^FO20,370^CF0,20^FDPRODUTO^FS
^FO20,396^CF0,28^FD${sanitizeFd(volume.descricao)}^FS
${blocoIndicadores}
^FO20,890^GB772,0,3^FS

^FO20,902^CF0,18^FD${sanitizeFd(rem.empresa)} — CNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO20,924^CF0,18^FD${sanitizeFd(rem.endereco)}^FS

^XZ`;
}

export function gerarZplCompleto(dados: DadosEtiqueta): string {
  return dados.volumes.map(v => gerarZplVolume(dados, v)).join('\n\n');
}
