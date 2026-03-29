import { jsPDF } from "jspdf";
import type { DadosEtiqueta, DadosVolume, DadosEnvioNFe, Indicador } from "../types/label.types";
import { SIMBOLOS } from "../components/label-builder/simbolos";

const MM_W = 100;
const MM_H = 150;
const MARGIN_L = 5;
const MARGIN_R = 10;
const CONTENT_W = MM_W - MARGIN_L - MARGIN_R;
const LOGO_H_MM = 15;
const LOGO_MAX_W_MM = 35;
/** Espaço logo → texto no cabeçalho remetente (cálculo de largura disponível) */
const LOGO_TEXT_GAP_MM = 8;
const ADDR_PT = 9;
/** CNPJ e endereço do remetente no PDF (cabeçalho) */
const REMETENTE_ADDR_PT = 8;
/** Espaço após o bloco de indicadores antes da zona inferior */
const PADDING_AFTER_INDICATORS_MM = 6;

/** Labels dos indicadores no PDF (PT), independente do i18n do preview */
const INDICADOR_LABEL_PDF: Record<Indicador, string> = {
  fragil: "FRÁGIL",
  cima: "ESTE LADO\nPARA CIMA",
  chuva: "PROTEGER\nDA CHUVA",
  inflamavel: "INFLAMÁVEL",
};

const IND_BOX_MM_DEFAULT = 20;
const IND_BOX_MM_COMPACT = 16;
const IND_SYMBOL_MM_DEFAULT = 12;
const IND_GAP_H_MM = 2;
const IND_LABEL_PT = 7;
/** Faixa vertical reservada para o texto abaixo da caixa (layout / cálculo de altura) */
const IND_LABEL_BAND_MM = 6;
/** Espaço entre linhas do grid de indicadores */
const IND_ROW_GAP_MM = 4;
const IND_COL_GAP_MM = 4;

function lineHeightMm(pt: number): number {
  return pt * 0.3528 * 1.25;
}

function rowHeightForIndicatorBox(boxMm: number): number {
  return boxMm + IND_LABEL_BAND_MM + IND_ROW_GAP_MM;
}

/**
 * Grid: no máx. 3 colunas com caixa 20mm + gap 4mm em ~85mm úteis;
 * se a altura não couber no espaço vertical, reduz caixa para 16mm (recalcula colunas).
 */
function computeIndicatorGridLayout(
  contentWidthMm: number,
  count: number,
  spaceAvailableMm: number
): {
  boxMm: number;
  symbolMm: number;
  maxPerRow: number;
  numRows: number;
  rowHeightMm: number;
  gridHeightMm: number;
} {
  const tryBox = (boxMm: number) => {
    const cellW = boxMm + IND_COL_GAP_MM;
    const maxPerRow = Math.max(
      1,
      Math.floor((contentWidthMm + IND_COL_GAP_MM) / cellW)
    );
    const numRows = Math.ceil(count / maxPerRow);
    const rowHeightMm = rowHeightForIndicatorBox(boxMm);
    const symbolMm = Math.min(
      IND_SYMBOL_MM_DEFAULT,
      Math.max(6, boxMm - 4)
    );
    const gridHeightMm = numRows * rowHeightMm - IND_ROW_GAP_MM;
    return { boxMm, symbolMm, maxPerRow, numRows, rowHeightMm, gridHeightMm };
  };

  let L = tryBox(IND_BOX_MM_DEFAULT);
  if (L.gridHeightMm > spaceAvailableMm) {
    L = tryBox(IND_BOX_MM_COMPACT);
  }
  return L;
}

function setBorderPt(pdf: jsPDF): void {
  pdf.setLineWidth(0.35);
  pdf.setDrawColor(0);
}

/** PNG IHDR */
function getPngSizeFromDataUrl(dataUrl: string): { w: number; h: number } | null {
  try {
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    const b64 = dataUrl.slice(comma + 1);
    const binary = atob(b64);
    if (binary.length < 24) return null;
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) {
      if (binary.charCodeAt(i) !== sig[i]) return null;
    }
    const w =
      (binary.charCodeAt(16) << 24) |
      (binary.charCodeAt(17) << 16) |
      (binary.charCodeAt(18) << 8) |
      binary.charCodeAt(19);
    const h =
      (binary.charCodeAt(20) << 24) |
      (binary.charCodeAt(21) << 16) |
      (binary.charCodeAt(22) << 8) |
      binary.charCodeAt(23);
    if (w > 0 && h > 0 && w < 65536 && h < 65536) return { w, h };
  } catch {
    /* ignore */
  }
  return null;
}

/** JPEG SOF0 / SOF2 */
function getJpegSizeFromDataUrl(dataUrl: string): { w: number; h: number } | null {
  try {
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    const bin = atob(dataUrl.slice(comma + 1));
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    let i = 0;
    while (i < u.length - 8) {
      if (u[i] !== 0xff) {
        i++;
        continue;
      }
      const m = u[i + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
        i += 2;
        continue;
      }
      if (m === 0xd9) break;
      if (m >= 0xc0 && m <= 0xc3) {
        const h = (u[i + 5] << 8) | u[i + 6];
        const w = (u[i + 7] << 8) | u[i + 8];
        if (w > 0 && h > 0) return { w, h };
        return null;
      }
      const len = (u[i + 2] << 8) | u[i + 3];
      if (len < 2) break;
      i += 2 + len;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getImageSizeFromDataUrl(dataUrl: string): { w: number; h: number } | null {
  const lower = dataUrl.slice(0, 40).toLowerCase();
  if (lower.includes("image/png")) return getPngSizeFromDataUrl(dataUrl);
  if (lower.includes("image/jpeg") || lower.includes("image/jpg"))
    return getJpegSizeFromDataUrl(dataUrl);
  return getPngSizeFromDataUrl(dataUrl) ?? getJpegSizeFromDataUrl(dataUrl);
}

/** Retorna Y após o último baseline */
function drawWrapped(
  pdf: jsPDF,
  text: string,
  x: number,
  yStart: number,
  maxW: number,
  fontSize: number,
  style: "normal" | "bold" = "normal"
): number {
  const t = text.trim() || "—";
  pdf.setFont("helvetica", style);
  pdf.setFontSize(fontSize);
  const lines = pdf.splitTextToSize(t, maxW);
  pdf.text(lines, x, yStart);
  return yStart + lines.length * lineHeightMm(fontSize);
}

function indicadorPngDataUrl(tipo: Indicador): string {
  const canvas = document.createElement("canvas");
  canvas.width = 88;
  canvas.height = 88;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 88, 88);
  ctx.save();
  ctx.translate(4, 4);
  ctx.scale(1.8, 1.8);
  const s = SIMBOLOS[tipo];
  const p = new Path2D(s.path);
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (tipo === "inflamavel" || tipo === "fragil") ctx.fill(p);
  else ctx.stroke(p);
  ctx.restore();
  return canvas.toDataURL("image/png");
}

/**
 * Único bloco remetente: logo (opcional) + texto (empresa, CNPJ, endereço).
 * Retorna Y após o bloco.
 */
function drawRemetenteHeader(
  pdf: jsPDF,
  rem: DadosEtiqueta["remetente"],
  yStart: number
): number {
  const hasLogo = Boolean(rem.logoBase64);
  let logoW = 0;
  let logoH = 0;

  if (hasLogo && rem.logoBase64) {
    const dims = getImageSizeFromDataUrl(rem.logoBase64);
    const ar = dims && dims.h > 0 ? dims.w / dims.h : 1;
    logoH = LOGO_H_MM;
    logoW = Math.min(LOGO_MAX_W_MM, logoH * ar);
    try {
      pdf.addImage(rem.logoBase64, "PNG", MARGIN_L, yStart, logoW, logoH, undefined, "FAST");
    } catch {
      logoW = 0;
      logoH = 0;
    }
  }

  const textX =
    logoW > 0 ? MARGIN_L + logoW + LOGO_TEXT_GAP_MM : MARGIN_L;
  const textMaxW = MM_W - MARGIN_R - textX;

  const nomeEmpresa = rem.empresa || "—";
  let textY = yStart + 4;

  pdf.setFont("helvetica", "bold");
  let empresaPt = 7;
  for (let fs = 11; fs >= 7; fs--) {
    pdf.setFontSize(fs);
    if (pdf.getTextWidth(nomeEmpresa) <= textMaxW) {
      empresaPt = fs;
      break;
    }
  }
  pdf.setFontSize(empresaPt);
  const empresaLines = pdf.splitTextToSize(nomeEmpresa, textMaxW);
  pdf.text(empresaLines, textX, textY);
  textY += empresaLines.length * lineHeightMm(empresaPt);

  textY = drawWrapped(
    pdf,
    `CNPJ: ${rem.cnpj || "—"}`,
    textX,
    textY,
    textMaxW,
    REMETENTE_ADDR_PT
  );
  textY = drawWrapped(
    pdf,
    rem.endereco || "—",
    textX,
    textY + 0.8,
    textMaxW,
    REMETENTE_ADDR_PT
  );

  const blockBottom = Math.max(logoW > 0 ? yStart + logoH : yStart, textY);
  return blockBottom + 2;
}

function drawOneLabel(pdf: jsPDF, dados: DadosEtiqueta, volume: DadosVolume): void {
  const rem = dados.remetente;
  const dest = dados.destinatario;
  const peso = dados.pesoIgualParaTodos ? dados.pesoGlobal : volume.peso;

  const formatDoc = (doc: string) => {
    const d = doc.replace(/\D/g, "");
    return d.length <= 11 ? `CPF: ${doc}` : `CNPJ: ${doc}`;
  };

  let y = 6;
  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawRemetenteHeader(pdf, rem, y);

  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawWrapped(pdf, "DESTINATARIO", MARGIN_L, y, CONTENT_W, 8, "bold");
  y += 0.5;
  y = drawWrapped(pdf, dest.nome || "—", MARGIN_L, y, CONTENT_W, 12, "bold");
  y += 0.5;
  y = drawWrapped(pdf, dest.cpfCnpj ? formatDoc(dest.cpfCnpj) : "—", MARGIN_L, y, CONTENT_W, ADDR_PT);
  y = drawWrapped(pdf, dest.endereco || "—", MARGIN_L, y + 0.5, CONTENT_W, ADDR_PT);
  y = drawWrapped(
    pdf,
    `${dest.cidade || "—"} - ${dest.uf || "—"} - CEP ${dest.cep || "—"}`,
    MARGIN_L,
    y + 0.5,
    CONTENT_W,
    ADDR_PT
  );
  y += 3;

  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  const col1 = MARGIN_L;
  const col2 = MARGIN_L + 28;
  const col3 = MARGIN_L + 56;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("NOTA FISCAL", col1, y);
  pdf.text("VOLUME", col2, y);
  pdf.text("PESO", col3, y);
  y += lineHeightMm(8) + 1;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(dados.notaFiscal || "—", col1, y);
  pdf.text(`${volume.id} / ${dados.totalVolumes}`, col2, y);
  pdf.text(`${peso || "—"} kg`, col3, y);
  y += lineHeightMm(14) + 3;

  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawWrapped(pdf, "PRODUTO", MARGIN_L, y, CONTENT_W, 8);
  y += 0.5;
  y = drawWrapped(pdf, volume.descricao || "—", MARGIN_L, y, CONTENT_W, 11, "bold");
  y += 2;

  const indicadores: Indicador[] = Array.isArray(volume.indicadores)
    ? volume.indicadores
    : [];

  if (indicadores.length > 0) {
    setBorderPt(pdf);
    pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
    y += 4;
    y = drawWrapped(pdf, "INDICADORES DE MANUSEIO", MARGIN_L, y, CONTENT_W, 8);
    y += 2;

    const yGridStart = y;
    const bottomReserveMm = PADDING_AFTER_INDICATORS_MM + 3;
    const spaceAvailableMm = Math.max(
      0,
      MM_H - yGridStart - bottomReserveMm
    );
    const layout = computeIndicatorGridLayout(
      CONTENT_W,
      indicadores.length,
      spaceAvailableMm
    );
    const { boxMm, symbolMm, maxPerRow, numRows, rowHeightMm } = layout;
    const symbolOffMm = (boxMm - symbolMm) / 2;

    const drawIndicatorAt = (
      ind: Indicador,
      boxLeft: number,
      boxTop: number
    ) => {
      setBorderPt(pdf);
      pdf.rect(boxLeft, boxTop, boxMm, boxMm);
      try {
        const png = indicadorPngDataUrl(ind);
        if (png) {
          pdf.addImage(
            png,
            "PNG",
            boxLeft + symbolOffMm,
            boxTop + symbolOffMm,
            symbolMm,
            symbolMm,
            undefined,
            "FAST"
          );
        }
      } catch {
        /* skip */
      }
      const cx = boxLeft + boxMm / 2;
      let ly =
        boxTop +
        boxMm +
        IND_GAP_H_MM +
        lineHeightMm(IND_LABEL_PT) * 0.9;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(IND_LABEL_PT);
      const parts = INDICADOR_LABEL_PDF[ind].split("\n");
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const labelLines = pdf.splitTextToSize(trimmed, boxMm);
        for (const line of labelLines) {
          pdf.text(line, cx, ly, { align: "center" });
          ly += lineHeightMm(IND_LABEL_PT) * 0.95;
        }
      }
    };

    let idx = 0;
    for (let row = 0; row < numRows; row++) {
      let bx = MARGIN_L;
      const rowTop = yGridStart + row * rowHeightMm;
      for (let col = 0; col < maxPerRow && idx < indicadores.length; col++) {
        drawIndicatorAt(indicadores[idx], bx, rowTop);
        bx += boxMm + IND_COL_GAP_MM;
        idx++;
      }
    }

    const blockBottomY =
      yGridStart + numRows * rowHeightMm - IND_ROW_GAP_MM;
    const yRule = Math.min(
      blockBottomY + PADDING_AFTER_INDICATORS_MM,
      MM_H - 1
    );
    setBorderPt(pdf);
    pdf.line(MARGIN_L, yRule, MM_W - MARGIN_R, yRule);
  }
}

export function generateEnvioNFePdf(dados: DadosEnvioNFe): void {
  const rem = dados.remetente;
  const dest = dados.destinatario;
  const nfe = dados.nfe;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [MM_W, MM_H],
  });

  let y = 6;
  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawRemetenteHeader(pdf, rem, y);

  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawWrapped(pdf, "DESTINATARIO", MARGIN_L, y, CONTENT_W, 8, "bold");
  y += 0.5;
  y = drawWrapped(pdf, dest.nome || "—", MARGIN_L, y, CONTENT_W, 12, "bold");
  y += 0.5;
  y = drawWrapped(pdf, dest.endereco || "—", MARGIN_L, y, CONTENT_W, ADDR_PT);
  y = drawWrapped(
    pdf,
    `${dest.cidade || "—"} - ${dest.uf || "—"}`,
    MARGIN_L,
    y + 0.5,
    CONTENT_W,
    ADDR_PT
  );
  y = drawWrapped(pdf, `CEP: ${dest.cep || "—"}`, MARGIN_L, y + 0.5, CONTENT_W, ADDR_PT);
  y += 3;

  setBorderPt(pdf);
  pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
  y += 5;

  y = drawWrapped(pdf, "DOCUMENTO", MARGIN_L, y, CONTENT_W, 8);
  y += 0.5;
  y = drawWrapped(pdf, dest.cpfCnpj || "—", MARGIN_L, y, CONTENT_W, 12, "bold");
  y += 3;

  if (nfe.numero || nfe.chaveAcesso) {
    setBorderPt(pdf);
    pdf.line(MARGIN_L, y, MM_W - MARGIN_R, y);
    y += 5;

    y = drawWrapped(pdf, "DADOS FISCAIS", MARGIN_L, y, CONTENT_W, 8, "bold");
    y += 1;

    if (nfe.numero) {
      y = drawWrapped(pdf, `NF-e N: ${nfe.numero}`, MARGIN_L, y, CONTENT_W, 11, "bold");
      y += 1;
    }
    if (nfe.chaveAcesso) {
      y = drawWrapped(pdf, "Chave de Acesso:", MARGIN_L, y, CONTENT_W, 8);
      y += 0.5;
      const digits = nfe.chaveAcesso.replace(/\D/g, '');
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      y = drawWrapped(pdf, formatted, MARGIN_L, y, CONTENT_W, 7);
      y += 2;
    }
  }

  pdf.save(`envio_nfe_${nfe.numero || 'sem_nf'}.pdf`);
}

export function generateLabelBuilderPdf(dados: DadosEtiqueta): void {
  if (!dados.volumes.length) return;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [MM_W, MM_H],
  });

  dados.volumes.forEach((vol, index) => {
    if (index > 0) pdf.addPage([MM_W, MM_H], "portrait");
    drawOneLabel(pdf, dados, vol);
  });

  pdf.save(`etiquetas_NF${dados.notaFiscal}_${dados.totalVolumes}vol.pdf`);
}
