export function splitZpl(zpl: string): string[] {
  const normalized = zpl.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const results: string[] = [];

  // Separar por ~DGR primeiro (etiquetas Shopee)
  // ~DGR sempre inicia uma nova etiqueta Shopee
  const segments = normalized.split(/(?=~DGR:)/i);

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    if (/^~DGR:/i.test(trimmed)) {
      // Etiqueta Shopee: ~DGR + todos os ^XA^XZ que seguem
      // até o próximo ~DGR ou fim do arquivo
      results.push(trimmed);
    } else {
      // Etiquetas não-Shopee: dividir por ^XA...^XZ
      // Ignorar ^XA^MCY^XZ e ^XA^IDR (já incluídos no bloco Shopee)
      const cleaned = trimmed
        .replace(/\^XA\^MCY\^XZ\n?/gi, '')
        .replace(/\^XA\^IDR:[^\n]*\^FS\^XZ\n?/gi, '');

      const blocks: string[] = cleaned.match(/\^XA[\s\S]*?\^XZ/gi) ?? [];
      blocks.forEach(b => {
        const content = b.replace(/\^XA/gi, '').replace(/\^XZ/gi, '').trim();
        if (content.length > 10) results.push(b.trim());
      });
    }
  }

  return results;
}

export function countZplLabels(zpl: string): number {
  return splitZpl(zpl).length;
}
