import { DadosEnvioNFe } from '../types/label.types';

function sanitizeFd(s: string): string {
  return s.replace(/\^/g, ' ').replace(/~/g, ' ');
}

function formatarChaveNFe(chave: string): string {
  const digits = chave.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function gerarZplEnvioNFe(dados: DadosEnvioNFe): string {
  const rem = dados.remetente;
  const dest = dados.destinatario;
  const nfe = dados.nfe;
  const hasLogoGraphic = Boolean(rem.logoZplFragment?.trim());
  const hasLogoInForm = Boolean(rem.logoBase64 || hasLogoGraphic);
  const tx = hasLogoInForm ? 270 : 20;
  const logoBlock = hasLogoGraphic ? `${rem.logoZplFragment}\n` : '';

  const blocoNFe = (nfe.numero || nfe.chaveAcesso) ? `
^FO20,640^GB772,0,2^FS

^FO20,655^CF0,20^FDDADOS FISCAIS^FS
${nfe.numero ? `^FO20,685^CF0,24^FDNF-e N: ${sanitizeFd(nfe.numero)}^FS` : ''}
${nfe.chaveAcesso ? `
^FO20,720^CF0,18^FDChave de Acesso:^FS
^FO20,745^CF0,16^FD${sanitizeFd(formatarChaveNFe(nfe.chaveAcesso))}^FS
^FO20,775^BCN,50,N,N,N^FD${nfe.chaveAcesso.replace(/\D/g, '').substring(0, 44)}^FS
` : ''}
` : '';

  return `^XA
^CI28
^PW812
^LL1218
^CF0,30

^FO20,20^GB772,0,3^FS

${logoBlock}^FO${tx},30^CF0,24^FD${sanitizeFd(rem.empresa)}^FS
^FO${tx},62^CF0,20^FDCNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO${tx},88^CF0,18^FD${sanitizeFd(rem.endereco)}^FS

^FO20,120^GB772,0,2^FS

^FO20,135^CF0,20^FDDESTINATARIO^FS
^FO20,165^CF0,32^FD${sanitizeFd(dest.nome)}^FS
^FO20,205^CF0,20^FD${sanitizeFd(dest.endereco)}^FS
^FO20,232^CF0,20^FD${sanitizeFd(dest.cidade)} - ${sanitizeFd(dest.uf)}^FS
^FO20,258^CF0,20^FDCEP: ${sanitizeFd(dest.cep)}^FS

^FO20,290^GB772,0,2^FS

^FO20,305^CF0,20^FDDOCUMENTO^FS
^FO20,335^CF0,28^FD${sanitizeFd(dest.cpfCnpj)}^FS
${blocoNFe}
^FO20,890^GB772,0,3^FS

^FO20,902^CF0,18^FD${sanitizeFd(rem.empresa)} — CNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO20,924^CF0,18^FD${sanitizeFd(rem.endereco)}^FS

^XZ`;
}
