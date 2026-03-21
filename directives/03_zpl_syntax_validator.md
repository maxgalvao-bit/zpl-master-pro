# Directive 03 — ZPL Syntax Validator
# Ferramenta 3 do ZPL Master Pro (V.L.A.E.G.)
# Status: REIMPLEMENTAR — lógica atual gera falso positivo (walkthrough.md, 2026-03-20)

---

## Objetivo

Reescrever o engine de validação ZPL (`src/services/ZplValidator.ts` ou equivalente)
para detectar corretamente erros reais de sintaxe, não apenas recomendar boas práticas.

O bug confirmado: `^FD` sem `^FS` correspondente retorna semáforo VERDE.
Comportamento correto: deve retornar AMARELO (aviso) ou VERMELHO (erro) com código `W002`.

---

## Arquivos a modificar

1. `src/services/ZplValidator.ts` — engine de validação (reescrever a lógica de regras)
2. `src/components/ZplSyntaxValidator.tsx` (ou wrapper equivalente) — apenas se o semáforo
   não estiver refletindo corretamente os níveis de severidade
3. `src/locales/*.json` — adicionar chaves para mensagens de erro novas (todos os 4 idiomas)

**NÃO modificar:** ZplEngine.ts, ExportEngine, rotas i18n, layout global.

---

## Arquitetura do Engine de Validação

### Tipos obrigatórios

```typescript
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
```

### Lógica do semáforo

```typescript
function getSemaphore(issues: ValidationIssue[]): 'green' | 'yellow' | 'red' {
  if (issues.some(i => i.severity === 'E')) return 'red';
  if (issues.some(i => i.severity === 'W')) return 'yellow';
  return 'green';
}
```

---

## Regras de Validação (implementar TODAS)

### Erros — Severity 'E' (semáforo VERMELHO)

| Código | Regra | Detecção |
|--------|-------|----------|
| E001 | `^XA` ausente | `!/\^XA/i.test(zpl)` |
| E002 | `^XZ` ausente | `!/\^XZ/i.test(zpl)` |
| E003 | `^XA` aparece após `^XZ` (ordem invertida) | posição de `^XA` > posição de `^XZ` |
| E004 | `^FD` sem `^FS` correspondente | contar ocorrências: `^FD` sem `^FS` na mesma sequência |
| E005 | `^BC`, `^BQ`, `^B3` (barcode) sem `^FD`/`^FS` | bloco de barcode incompleto |
| E006 | Múltiplos `^XA` sem `^XZ` intermediário | detecta etiquetas mal concatenadas |

### Avisos — Severity 'W' (semáforo AMARELO)

| Código | Regra | Detecção |
|--------|-------|----------|
| W001 | `^FO` com coordenadas negativas | `^FO-\d+` ou `^FO\d+,-\d+` |
| W002 | `^CF` (fonte) referencia fonte não definida no arquivo | fonte diferente de 0,A,B,C,D,E,F,G,H |
| W003 | `^GF` (imagem) com tamanho declarado inconsistente | bytes declarados ≠ bytes reais no payload |
| W004 | Comandos após `^XZ` (serão ignorados pela impressora) | qualquer texto não-vazio após último `^XZ` |
| W005 | `^PQ` (quantidade) com valor 0 | impressora não vai imprimir nada |

### Informações — Severity 'I' (semáforo VERDE, já funciona)

| Código | Regra |
|--------|-------|
| I001 | `^PW` ou `^LL` ausentes (dimensões não definidas) |
| I002 | Nenhum campo `^FD` encontrado (etiqueta sem conteúdo impresso) |
| I003 | Encoding não declarado (`^CI`) — impressora usará padrão |

---

## Implementação da Regra E004 (a mais crítica — corrige o falso positivo)

```typescript
function checkFdFsPairs(lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let openFd = false;
  let openFdLine = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim().toUpperCase();

    // ^FD abre um campo
    if (/\^FD/i.test(trimmed)) {
      if (openFd) {
        // ^FD sem fechar o anterior
        issues.push({
          code: 'E004',
          severity: 'E',
          line: openFdLine,
          message: 'validator.errors.E004',
          context: lines[openFdLine - 1].trim(),
        });
      }
      openFd = true;
      openFdLine = lineNum;
    }

    // ^FS fecha o campo — pode estar na mesma linha que ^FD
    if (/\^FS/i.test(trimmed)) {
      openFd = false;
    }
  });

  // ^FD sem ^FS no final do arquivo
  if (openFd) {
    issues.push({
      code: 'E004',
      severity: 'E',
      line: openFdLine,
      message: 'validator.errors.E004',
      context: lines[openFdLine - 1].trim(),
    });
  }

  return issues;
}
```

**Atenção:** `^FD` e `^FS` podem estar na mesma linha (`^FDTexto^FS`).
O parser deve checar por linha E por tokens dentro da linha.

---

## Função principal do engine

```typescript
export function validateZpl(zpl: string): ValidationResult {
  const lines = zpl.split('\n');
  const issues: ValidationIssue[] = [];

  // --- Erros estruturais ---
  if (!/\^XA/i.test(zpl)) {
    issues.push({ code: 'E001', severity: 'E', line: 1, message: 'validator.errors.E001' });
  }
  if (!/\^XZ/i.test(zpl)) {
    issues.push({ code: 'E002', severity: 'E', line: lines.length, message: 'validator.errors.E002' });
  }

  const xaPos = zpl.toUpperCase().indexOf('^XA');
  const xzPos = zpl.toUpperCase().lastIndexOf('^XZ');
  if (xaPos > -1 && xzPos > -1 && xaPos > xzPos) {
    issues.push({ code: 'E003', severity: 'E', line: 1, message: 'validator.errors.E003' });
  }

  // --- Par ^FD / ^FS (regra crítica) ---
  issues.push(...checkFdFsPairs(lines));

  // --- Avisos ---
  lines.forEach((line, idx) => {
    if (/\^FO-?\d+,-?\d+/i.test(line)) {
      const coords = line.match(/\^FO(-?\d+),(-?\d+)/i);
      if (coords && (parseInt(coords[1]) < 0 || parseInt(coords[2]) < 0)) {
        issues.push({ code: 'W001', severity: 'W', line: idx + 1,
          message: 'validator.warnings.W001', context: line.trim() });
      }
    }
    if (/\^PQ0\b/i.test(line)) {
      issues.push({ code: 'W005', severity: 'W', line: idx + 1,
        message: 'validator.warnings.W005', context: line.trim() });
    }
  });

  const textAfterXz = zpl.substring(xzPos + 3).trim();
  if (xzPos > -1 && textAfterXz.length > 0) {
    issues.push({ code: 'W004', severity: 'W', line: lines.length,
      message: 'validator.warnings.W004' });
  }

  // --- Informações ---
  if (!/\^PW/i.test(zpl) || !/\^LL/i.test(zpl)) {
    issues.push({ code: 'I001', severity: 'I', line: 1, message: 'validator.info.I001' });
  }
  if (!/\^FD/i.test(zpl)) {
    issues.push({ code: 'I002', severity: 'I', line: 1, message: 'validator.info.I002' });
  }

  const semaphore = getSemaphore(issues);

  return {
    isValid: semaphore !== 'red',
    issues,
    semaphore,
  };
}
```

---

## Chaves i18n a adicionar (todos os 4 arquivos JSON)

```json
"validator": {
  "errors": {
    "E001": "Tag ^XA (início de etiqueta) não encontrada",
    "E002": "Tag ^XZ (fim de etiqueta) não encontrada",
    "E003": "^XA aparece depois de ^XZ — ordem invertida",
    "E004": "^FD sem ^FS correspondente — campo não fechado (linha {line})",
    "E005": "Bloco de barcode incompleto — falta ^FD ou ^FS",
    "E006": "Múltiplos ^XA detectados sem ^XZ entre eles — use o Bulk Splitter"
  },
  "warnings": {
    "W001": "Coordenadas negativas em ^FO — campo pode ficar fora da etiqueta",
    "W002": "Fonte não reconhecida em ^CF",
    "W003": "Tamanho de imagem ^GF inconsistente",
    "W004": "Comandos após ^XZ serão ignorados pela impressora",
    "W005": "^PQ0 — quantidade zero, nada será impresso"
  },
  "info": {
    "I001": "Recomendado definir ^PW e ^LL (dimensões da etiqueta)",
    "I002": "Nenhum campo ^FD encontrado — etiqueta sem conteúdo",
    "I003": "Encoding não declarado — impressora usará padrão"
  }
}
```

---

## Suite de Testes (executar via browser agent após implementação)

### Teste 1 — deve retornar VERMELHO (E004)
```zpl
^XA
^FO50,50
^FD teste sem fechar FS
^XZ
```
**Esperado:** semáforo VERMELHO, issue E004 na linha 3.

### Teste 2 — deve retornar VERDE
```zpl
^XA
^PW812
^LL1218
^FO50,50^FDTexto correto^FS
^XZ
```
**Esperado:** semáforo VERDE, zero erros, zero warnings.

### Teste 3 — deve retornar VERMELHO (E001)
```zpl
^FO50,50^FDSem início^FS
^XZ
```
**Esperado:** semáforo VERMELHO, issue E001.

### Teste 4 — deve retornar AMARELO (W001)
```zpl
^XA
^PW812^LL1218
^FO-10,50^FDFora da margem^FS
^XZ
```
**Esperado:** semáforo AMARELO, issue W001 na linha 3.

### Teste 5 — deve retornar VERDE com I001
```zpl
^XA
^FO50,50^FDSem dimensões^FS
^XZ
```
**Esperado:** semáforo VERDE, issue I001 (sem ^PW/^LL).

### Teste 6 — ^FD e ^FS na mesma linha (deve retornar VERDE)
```zpl
^XA
^PW812^LL1218
^FO50,50^FDInline correto^FS
^FO50,100^FDSegundo campo^FS
^XZ
```
**Esperado:** semáforo VERDE, zero erros.

---

## Checklist de conclusão

- [ ] `validateZpl()` reescrita com todas as regras E, W, I
- [ ] Teste 1 retorna VERMELHO (falso positivo corrigido)
- [ ] Testes 2 a 6 passam todos
- [ ] Chaves i18n adicionadas nos 4 arquivos JSON
- [ ] Semáforo na UI reflete corretamente E→vermelho, W→amarelo, I→verde
- [ ] `task_plan.txt` atualizado
- [ ] `progress.txt` atualizado com o bug corrigido e o aprendizado

---

*Criado em: 2026-03-20 | Motivo: falso positivo confirmado no walkthrough.md*
*Próxima directive: 04_bulk_splitter.md*
