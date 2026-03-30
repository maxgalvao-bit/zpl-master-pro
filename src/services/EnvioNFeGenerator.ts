import { DadosEnvioNFe } from '../types/label.types';

function sanitizeFd(s: string): string {
  return s.replace(/\^/g, ' ').replace(/~/g, ' ');
}

function formatarChaveNFe(chave: string): string {
  const digits = chave.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Nota: ^GFA e ^BCN requerem impressora Zebra
// ou simulador compatível (ex: labelary.com/viewer)
export function gerarZplEnvioNFe(dados: DadosEnvioNFe): string {
  const rem = dados.remetente;
  const dest = dados.destinatario;
  const nfe = dados.nfe;
  const hasLogoGraphic = Boolean(rem.logoZplFragment);
  const hasLogoInForm = Boolean(rem.logoBase64 || hasLogoGraphic);
  const tx = hasLogoInForm ? 270 : 20;
  const logoDownload = hasLogoGraphic ? `${rem.logoZplFragment!.downloadCmd}\n` : '';
  const logoRender = hasLogoGraphic ? `${rem.logoZplFragment!.renderCmd}\n` : '';

  const blocoNFe = (nfe.numero || nfe.chaveAcesso) ? `
^FO20,640^GB772,0,2^FS

^FO20,655^CF0,26^FDDADOS FISCAIS^FS
${nfe.numero ? `^FO20,685^CF0,30^FDNF-e N: ${sanitizeFd(nfe.numero)}^FS` : ''}
${nfe.chaveAcesso ? `
^FO20,720^CF0,24^FDChave de Acesso:^FS
^FO20,745^CF0,20^FD${sanitizeFd(formatarChaveNFe(nfe.chaveAcesso))}^FS
^FO20,800^BY1,3,0^BCN,100,N,N^FD${nfe.chaveAcesso.replace(/\D/g, '').substring(0, 44)}^FS
` : ''}
` : '';

  return `${logoDownload}^XA
^CI28
^PW812
^LL1260
^CF0,30

^FO20,20^GB772,0,3^FS

${logoRender}^FO${tx},30^CF0,30^FD${sanitizeFd(rem.empresa)}^FS
^FO${tx},62^CF0,26^FDCNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO${tx},88^CF0,24^FD${sanitizeFd(rem.endereco)}^FS

^FO20,120^GB772,0,2^FS

^FO20,135^CF0,26^FDDESTINATARIO^FS
^FO20,165^CF0,38^FD${sanitizeFd(dest.nome)}^FS
^FO20,205^CF0,26^FD${sanitizeFd(dest.endereco)}^FS
^FO20,232^CF0,26^FD${sanitizeFd(dest.cidade)} - ${sanitizeFd(dest.uf)}^FS
^FO20,258^CF0,26^FDCEP: ${sanitizeFd(dest.cep)}^FS

^FO20,290^GB772,0,2^FS

^FO20,305^CF0,26^FDDOCUMENTO^FS
^FO20,335^CF0,34^FD${sanitizeFd(dest.cpfCnpj)}^FS
${blocoNFe}
^FO20,940^GB772,0,3^FS

^FO20,952^CF0,24^FD${sanitizeFd(rem.empresa)} — CNPJ: ${sanitizeFd(rem.cnpj)}^FS
^FO20,974^CF0,24^FD${sanitizeFd(rem.endereco)}^FS

^XZ`;
}
