# Directive 04 — ZPL Syntax Validator: Layout 2 Colunas + Botão Fix
# Melhoria pós-validação do engine (2026-03-20)
# Pré-requisito: directive 03 concluída e todos os 6 testes passando

---

## Objetivos

1. Reorganizar o layout do Validator em duas colunas (textarea | resultados)
2. Adicionar botão "Corrigir automaticamente" para erros corrigíveis
3. Não alterar o engine de validação (ZplValidator.ts) — apenas UI e lógica de fix

---

## Arquivos a modificar

1. `src/components/ZplSyntaxValidator.tsx` (ou wrapper equivalente) — layout + botão Fix
2. `src/services/ZplFixer.ts` — CRIAR NOVO — lógica de correção automática
3. `src/locales/*.json` — adicionar chaves para o botão Fix (4 idiomas)

**NÃO modificar:** ZplValidator.ts, ZplEngine.ts, ExportEngine, rotas i18n.

---

## 1. Layout duas colunas

### Estrutura visual esperada

```
┌─────────────────────┬─────────────────────┐
│                     │  🔴 CÓDIGO INVÁLIDO  │
│   [textarea ZPL]    │─────────────────────│
│                     │  ERROS DE ESTRUTURA │
│                     │  E004 ^FD sem ^FS.. │
│                     │─────────────────────│
│                     │  [Corrigir Auto ↗]  │
│  [VALIDAR] [LIMPAR] │  [Copiar] [Download]│
└─────────────────────┴─────────────────────┘
```

### Implementação TailwindCSS

```tsx
// Container principal — duas colunas em desktop, empilhado em mobile
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

  {/* Coluna esquerda — input */}
  <div className="flex flex-col gap-4">
    <textarea
      className="w-full h-80 lg:h-full min-h-[320px] ..."
      placeholder={t('validator.placeholder')}
      value={zplInput}
      onChange={(e) => setZplInput(e.target.value)}
    />
    <div className="flex gap-3">
      <button onClick={handleValidate}>...</button>
      <button onClick={handleClear}>...</button>
    </div>
  </div>

  {/* Coluna direita — resultados */}
  <div className="flex flex-col gap-4">
    {/* Semáforo */}
    <SemaphoreBar result={validationResult} />

    {/* Lista de issues */}
    {validationResult && <IssueList issues={validationResult.issues} />}

    {/* Botão Fix — só aparece se houver erros corrigíveis */}
    {hasFixableIssues && (
      <FixButton onFix={handleFix} />
    )}
  </div>

</div>
```

**Regra mobile:** em telas menores que `lg` (1024px), as colunas empilham
verticalmente na ordem: textarea → botões → resultados → fix.

---

## 2. Lógica de erros corrigíveis vs não corrigíveis

### Erros que TÊM correção automática

| Código | Correção aplicada |
|--------|-------------------|
| E004 | Inserir `^FS` após cada `^FD` sem fechamento |
| W001 | Substituir coordenadas negativas por 0 (`^FO-10,50` → `^FO0,50`) |
| W004 | Remover texto após `^XZ` |
| W005 | Substituir `^PQ0` por `^PQ1` |
| I001 | Inserir `^PW812\n^LL1218` após `^XA` (203 DPI padrão) |

### Erros que NÃO têm correção automática (não exibir botão Fix)

| Código | Motivo |
|--------|--------|
| E001 | Não sabe onde inserir `^XA` sem conhecer a intenção do usuário |
| E002 | Não sabe onde inserir `^XZ` |
| E003 | Ordem invertida — requer reescrita manual |
| E005 | Barcode incompleto — parâmetros dependem do tipo de código |
| E006 | Múltiplas etiquetas — redirecionar para Bulk Splitter |

### Lógica de exibição do botão

```typescript
const FIXABLE_CODES = ['E004', 'W001', 'W004', 'W005', 'I001'];

const hasFixableIssues = validationResult?.issues.some(
  issue => FIXABLE_CODES.includes(issue.code)
);

const hasUnfixableErrors = validationResult?.issues.some(
  issue => issue.severity === 'E' && !FIXABLE_CODES.includes(issue.code)
);

// Botão Fix aparece se: tem issues corrigíveis E não tem erros não corrigíveis
const showFixButton = hasFixableIssues && !hasUnfixableErrors;
```

---

## 3. Serviço ZplFixer.ts (criar em src/services/)

```typescript
import { ValidationIssue } from './ZplValidator';

export function autoFix(zpl: string, issues: ValidationIssue[]): string {
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
```

---

## 4. Fluxo completo do botão Fix na UI

```typescript
const [fixedZpl, setFixedZpl] = useState<string | null>(null);

function handleFix() {
  if (!validationResult) return;
  const corrected = autoFix(zplInput, validationResult.issues);
  setFixedZpl(corrected);
  // Re-validar automaticamente para confirmar que os erros foram resolvidos
  const revalidated = validateZpl(corrected);
  setValidationResult(revalidated);
  // Substituir o conteúdo da textarea pelo ZPL corrigido
  setZplInput(corrected);
}
```

**Comportamento esperado após Fix:**
1. Textarea atualiza com o ZPL corrigido
2. Validação roda automaticamente
3. Semáforo atualiza (deve virar Verde ou Amarelo)
4. Botão Fix desaparece (não há mais issues corrigíveis)
5. Aparecem botões "Copiar" e "Download .zpl" do resultado corrigido

---

## 5. Chaves i18n a adicionar (4 arquivos)

```json
"validator": {
  "fix": {
    "button": "Corrigir automaticamente",
    "buttonShort": "Corrigir",
    "success": "Código corrigido com sucesso",
    "copy": "Copiar código corrigido",
    "download": "Baixar .zpl corrigido",
    "tooltip": "Corrige automaticamente: campos ^FD sem ^FS, coordenadas negativas e dimensões ausentes"
  },
  "layout": {
    "inputLabel": "Cole seu código ZPL",
    "resultLabel": "Resultado da validação"
  }
}
```

---

## 6. Cross-sell para Shopee Fix e Bulk Splitter

Quando o erro for **E006** (múltiplos ^XA sem ^XZ — etiquetas mal concatenadas),
exibir um card de cross-sell em vez do botão Fix:

```tsx
{issues.some(i => i.code === 'E006') && (
  <CrossSellCard
    tool="bulk-splitter"
    message={t('validator.crossSell.bulkSplitter')}
  />
)}
```

Quando o erro for **I001** (sem ^PW/^LL) e o contexto for Shopee, sugerir a
ferramenta Shopee Fix:

```tsx
{issues.some(i => i.code === 'I001') && (
  <CrossSellCard
    tool="shopee-fix"
    message={t('validator.crossSell.shopeeHint')}
  />
)}
```

---

## Checklist de conclusão

- [ ] Layout em 2 colunas funcionando (desktop lg+)
- [ ] Mobile empilhado funcionando (< lg)
- [ ] ZplFixer.ts criado em src/services/
- [ ] Botão Fix aparece somente para erros corrigíveis
- [ ] Após Fix: textarea atualiza + revalidação automática + semáforo atualiza
- [ ] Botões Copiar e Download aparecem após correção
- [ ] Cross-sell E006 → Bulk Splitter
- [ ] Chaves i18n adicionadas nos 4 arquivos JSON
- [ ] Teste: E004 → Fix → Verde confirmado
- [ ] task_plan.txt e progress.txt atualizados

---

*Criado em: 2026-03-20*
*Próxima directive: 05_shopee_fixer.md*
