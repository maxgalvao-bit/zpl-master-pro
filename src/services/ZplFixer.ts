import { ValidationIssue } from './ZplValidator';

export function autoFix(zpl: string, issues: ValidationIssue[]): string {
  const multipleLabels = (zpl.match(/\^XA/gi) || []).length > 1;
  if (multipleLabels) return zpl;

  let fixed = zpl;
  const codes = issues.map(i => i.code);

  // E004 — inserir ^FS após ^FD sem fechamento
  if (codes.includes('E004')) {
    fixed = fixMissingFs(fixed);
  }

  // W001 — coordenadas negativas → 0
  if (codes.includes('W001')) {
    fixed = fixed.replace(/\^FO(-\d+),(-?\d+)/gi, (_, x, y) =>
      `^FO${Math.max(0, parseInt(x))},${Math.max(0, parseInt(y))}`
    );
    fixed = fixed.replace(/\^FO(\d+),(-\d+)/gi, (_, x, y) =>
      `^FO${x},${Math.max(0, parseInt(y))}`
    );
  }

  // W004 — remover texto após último ^XZ
  if (codes.includes('W004')) {
    const xzIdx = fixed.toUpperCase().lastIndexOf('^XZ');
    if (xzIdx > -1) fixed = fixed.substring(0, xzIdx + 3);
  }

  // W005 — ^PQ0 → ^PQ1
  if (codes.includes('W005')) {
    fixed = fixed.replace(/\^PQ0\b/gi, '^PQ1');
  }

  // I001 — inserir ^PW812^LL1218 se ausentes
  if (codes.includes('I001')) {
    if (!/\^PW/i.test(fixed) || !/\^LL/i.test(fixed)) {
      fixed = fixed.replace(/(\^XA)/i, '$1\n^PW812\n^LL1218');
    }
  }

  return fixed;
}

function fixMissingFs(zpl: string): string {
  const lines = zpl.split('\n');
  let openFd = false;

  const fixed = lines.map(line => {
    let result = line;

    // Se tem ^FD e ^FS na mesma linha — OK, não mexer
    if (/\^FD/i.test(line) && /\^FS/i.test(line)) {
      return result;
    }

    // Se tem ^FD sem ^FS — adicionar ^FS no final da linha
    if (/\^FD/i.test(line) && !/\^FS/i.test(line)) {
      result = line.trimEnd() + '^FS';
      openFd = false;
      return result;
    }

    return result;
  });

  return fixed.join('\n');
}
