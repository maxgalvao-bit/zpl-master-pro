export type Severity = 'E' | 'W' | 'I';
// E = Error   → semáforo VERMELHO (código inválido, impressora vai falhar)
// W = Warning → semáforo AMARELO (código imprime mas com comportamento inesperado)
// I = Info    → semáforo VERDE   (boas práticas, não afeta impressão)

export interface ValidationIssue {
  code: string;       // ex: 'E001', 'W002', 'I001'
  severity: Severity;
  line: number;       // linha onde o problema foi encontrado (1-based)
  message: string;    // chave i18n — ex: 'validator.errors.E001'
  context?: string;   // trecho do ZPL que causou o problema
}

export interface ValidationResult {
  isValid: boolean;           // true somente se zero erros E
  issues: ValidationIssue[];
  semaphore: 'green' | 'yellow' | 'red';
}

function getSemaphore(issues: ValidationIssue[]): 'green' | 'yellow' | 'red' {
  if (issues.some(i => i.severity === 'E')) return 'red';
  if (issues.some(i => i.severity === 'W')) return 'yellow';
  return 'green';
}

function checkFdFsPairs(lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let openFd = false;
  let openFdLine = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim().toUpperCase();

    // Regex para encontrar todos os matches de ^FD e ^FS na linha
    // Importante: tratamos por tokens para lidar com ^FD e ^FS na mesma linha
    const tokens = line.split(/(\^FD|\^FS)/i);
    
    tokens.forEach((token) => {
      const upperToken = token.toUpperCase();
      if (upperToken === '^FD') {
        if (openFd) {
          // ^FD sem fechar o anterior
          issues.push({
            code: 'E004',
            severity: 'E',
            line: openFdLine,
            message: 'errors.E004',
            context: lines[openFdLine - 1].trim(),
          });
        }
        openFd = true;
        openFdLine = lineNum;
      } else if (upperToken === '^FS') {
        openFd = false;
      }
    });
  });

  // ^FD sem ^FS no final do arquivo
  if (openFd) {
    issues.push({
      code: 'E004',
      severity: 'E',
      line: openFdLine,
      message: 'errors.E004',
      context: lines[openFdLine - 1].trim(),
    });
  }

  return issues;
}

export function validateZpl(zpl: string): ValidationResult {
  if (!zpl || zpl.trim() === '') {
    return { isValid: true, issues: [], semaphore: 'green' };
  }

  const lines = zpl.split('\n');
  const issues: ValidationIssue[] = [];

  // --- Múltiplas etiquetas — retorno antecipado com apenas E006 ---
  if ((zpl.match(/\^XA/gi) || []).length > 1) {
    return {
      isValid: false,
      issues: [{ code: 'E006', severity: 'E', line: 1, message: 'errors.E006' }],
      semaphore: 'red',
    };
  }

  // --- Erros estruturais ---
  if (!/\^XA/i.test(zpl)) {
    issues.push({ code: 'E001', severity: 'E', line: 1, message: 'errors.E001' });
  }
  if (!/\^XZ/i.test(zpl)) {
    issues.push({ code: 'E002', severity: 'E', line: lines.length, message: 'errors.E002' });
  }

  const xaPos = zpl.toUpperCase().indexOf('^XA');
  const xzPos = zpl.toUpperCase().lastIndexOf('^XZ');
  if (xaPos > -1 && xzPos > -1 && xaPos > xzPos) {
    issues.push({ code: 'E003', severity: 'E', line: 1, message: 'errors.E003' });
  }

  // --- Par ^FD / ^FS (regra crítica) ---
  issues.push(...checkFdFsPairs(lines));

  // --- Avisos ---
  lines.forEach((line, idx) => {
    // W001: Coordenadas negativas
    if (/\^FO-?\d+,-?\d+/i.test(line)) {
      const coords = line.match(/\^FO(-?\d+),(-?\d+)/i);
      if (coords && (parseInt(coords[1]) < 0 || parseInt(coords[2]) < 0)) {
        issues.push({ 
          code: 'W001', 
          severity: 'W', 
          line: idx + 1,
          message: 'warnings.W001', 
          context: line.trim() 
        });
      }
    }
    // W005: Quantidade zero
    if (/\^PQ0\b/i.test(line)) {
      issues.push({ 
        code: 'W005', 
        severity: 'W', 
        line: idx + 1,
        message: 'warnings.W005', 
        context: line.trim() 
      });
    }
  });

  // W004: Comandos após ^XZ
  const textAfterXz = zpl.substring(xzPos + 3).trim();
  if (xzPos > -1 && textAfterXz.length > 0) {
    issues.push({ 
      code: 'W004', 
      severity: 'W', 
      line: lines.length,
      message: 'warnings.W004' 
    });
  }

  // --- Informações ---
  if (!/\^PW/i.test(zpl) || !/\^LL/i.test(zpl)) {
    issues.push({ code: 'I001', severity: 'I', line: 1, message: 'info.I001' });
  }
  if (!/\^FD/i.test(zpl)) {
    issues.push({ code: 'I002', severity: 'I', line: 1, message: 'info.I002' });
  }

  const semaphore = getSemaphore(issues);

  return {
    isValid: semaphore !== 'red',
    issues,
    semaphore,
  };
}
