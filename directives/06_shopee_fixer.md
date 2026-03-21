# Directive 06 — Shopee Image Fix: Implementar Lógica de Detecção e Correção
# Ferramenta 2 do ZPL Master Pro (V.L.A.E.G.)
# Status: Chassi visual pronto — implementar apenas a lógica

---

## Contexto

O chassi visual da ferramenta já existe com:
- Semáforo Verde/Amarelo/Vermelho (componente visual pronto)
- Textarea para colar o ZPL
- Seletor de DPI (203 / 300)
- Área de resultado

O que está PENDENTE é toda a lógica de detecção e correção.
Não reescrever a UI — apenas implementar a lógica nos hooks/services.

---

## Arquivos a criar

```
src/services/ShopeeFixEngine.ts   ← lógica de detecção e correção
src/hooks/useShopeefix.ts         ← hook que conecta UI à lógica
```

## Arquivos a modificar

```
src/app/[locale]/tools/shopee-image-fix/   ← conectar hook ao componente existente
src/locales/*.json                          ← adicionar chaves i18n (4 arquivos)
```

**NÃO modificar:** ZplValidator.ts, ZplFixer.ts, LabelGenerator.ts, rotas i18n.

---

## Dimensões de referência por DPI

```typescript
export const SHOPEE_DIMS = {
  203: { pw: 812,  ll: 1218 },  // 100mm × 150mm a 203 DPI
  300: { pw: 1200, ll: 1800 },  // 100mm × 150mm a 300 DPI
} as const;

export type DPI = 203 | 300;
```

---

## 1. ShopeeFixEngine.ts

```typescript
import { SHOPEE_DIMS, DPI } from './ShopeeFixEngine';

export type SemaphoreStatus = 'green' | 'yellow' | 'red';

export interface ShopeeAnalysis {
  status: SemaphoreStatus;
  foundPw: number | null;      // valor ^PW encontrado no ZPL
  foundLl: number | null;      // valor ^LL encontrado no ZPL
  expectedPw: number;          // valor esperado para o DPI selecionado
  expectedLl: number;          // valor esperado para o DPI selecionado
  hasXa: boolean;
  hasXz: boolean;
  messageKey: string;          // chave i18n da mensagem para o usuário
  canFix: boolean;             // se é possível corrigir automaticamente
}

const TOLERANCE = 0.05; // ±5% de tolerância

function withinTolerance(found: number, expected: number): boolean {
  return Math.abs(found - expected) / expected <= TOLERANCE;
}

export function analyzeShopeeZpl(zpl: string, dpi: DPI): ShopeeAnalysis {
  const expected = SHOPEE_DIMS[dpi];

  const hasXa = /\^XA/i.test(zpl);
  const hasXz = /\^XZ/i.test(zpl);

  // Estrutura inválida — semáforo VERMELHO não corrigível
  if (!hasXa || !hasXz) {
    return {
      status: 'red',
      foundPw: null,
      foundLl: null,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: 'shopeeFix.result.invalidStructure',
      canFix: false,
    };
  }

  const pwMatch = zpl.match(/\^PW(\d+)/i);
  const llMatch = zpl.match(/\^LL(\d+)/i);
  const foundPw = pwMatch ? parseInt(pwMatch[1]) : null;
  const foundLl = llMatch ? parseInt(llMatch[1]) : null;

  // Dimensões ausentes — AMARELO corrigível
  if (foundPw === null || foundLl === null) {
    return {
      status: 'yellow',
      foundPw,
      foundLl,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: 'shopeeFix.result.missingDimensions',
      canFix: true,
    };
  }

  const pwOk = withinTolerance(foundPw, expected.pw);
  const llOk = withinTolerance(foundLl, expected.ll);

  // Dimensões corretas — VERDE
  if (pwOk && llOk) {
    return {
      status: 'green',
      foundPw,
      foundLl,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: 'shopeeFix.result.correct',
      canFix: false,
    };
  }

  // Dimensões erradas mas corrigíveis — AMARELO
  return {
    status: 'yellow',
    foundPw,
    foundLl,
    expectedPw: expected.pw,
    expectedLl: expected.ll,
    hasXa,
    hasXz,
    messageKey: 'shopeeFix.result.wrongDimensions',
    canFix: true,
  };
}

export function fixShopeeZpl(zpl: string, dpi: DPI): string {
  const { pw, ll } = SHOPEE_DIMS[dpi];

  // Remover ^PW e ^LL existentes
  let fixed = zpl
    .replace(/\^PW\d+/gi, '')
    .replace(/\^LL\d+/gi, '');

  // Inserir ^PW e ^LL logo após ^XA
  fixed = fixed.replace(/(\^XA)/i, `$1\n^PW${pw}\n^LL${ll}`);

  // Garantir ^FO0,0 após as dimensões se não existir
  if (!/\^FO0,0/i.test(fixed)) {
    fixed = fixed.replace(
      /(\^XA[^\n]*\n(?:\^PW[^\n]*\n)?(?:\^LL[^\n]*\n)?)/i,
      '$1^FO0,0\n'
    );
  }

  // Limpar linhas vazias duplicadas geradas pelas remoções
  fixed = fixed.replace(/\n{3,}/g, '\n\n');

  return fixed.trim();
}
```

---

## 2. Hook useShopeefix.ts

```typescript
'use client';
import { useState, useCallback } from 'react';
import { analyzeShopeeZpl, fixShopeeZpl, ShopeeAnalysis, DPI } from '@/services/ShopeeFixEngine';

export function useShopeeFix() {
  const [zplInput, setZplInput] = useState('');
  const [dpi, setDpi] = useState<DPI>(203);
  const [analysis, setAnalysis] = useState<ShopeeAnalysis | null>(null);
  const [fixedZpl, setFixedZpl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!zplInput.trim()) return;
    const result = analyzeShopeeZpl(zplInput, dpi);
    setAnalysis(result);
    setFixedZpl(null); // resetar correção anterior
  }, [zplInput, dpi]);

  const handleFix = useCallback(() => {
    if (!analysis?.canFix) return;
    const corrected = fixShopeeZpl(zplInput, dpi);
    setFixedZpl(corrected);
    // Re-analisar para confirmar que ficou verde
    const reanalysis = analyzeShopeeZpl(corrected, dpi);
    setAnalysis(reanalysis);
  }, [zplInput, dpi, analysis]);

  const handleCopy = useCallback(async () => {
    const text = fixedZpl || zplInput;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fixedZpl, zplInput]);

  const handleDownload = useCallback(() => {
    const text = fixedZpl || zplInput;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopee_fixed.zpl';
    a.click();
    URL.revokeObjectURL(url);
  }, [fixedZpl, zplInput]);

  return {
    zplInput, setZplInput,
    dpi, setDpi,
    analysis,
    fixedZpl,
    copied,
    handleAnalyze,
    handleFix,
    handleCopy,
    handleDownload,
  };
}
```

---

## 3. Conectar hook ao componente existente

No componente do chassi visual existente, importar e usar o hook:

```tsx
const {
  zplInput, setZplInput,
  dpi, setDpi,
  analysis,
  fixedZpl,
  copied,
  handleAnalyze,
  handleFix,
  handleCopy,
  handleDownload,
} = useShopeeFix();
```

### Semáforo — mapear status para cores

```tsx
const semaphoreColors = {
  green:  'bg-green-500',
  yellow: 'bg-yellow-500',
  red:    'bg-red-500',
};

// Exibir apenas quando analysis !== null
{analysis && (
  <div className={`semaphore ${semaphoreColors[analysis.status]}`}>
    <span>{t(analysis.messageKey)}</span>
    {analysis.status !== 'green' && (
      <div className="dimensions-info">
        <span>Encontrado: ^PW{analysis.foundPw ?? '?'} ^LL{analysis.foundLl ?? '?'}</span>
        <span>Esperado:   ^PW{analysis.expectedPw} ^LL{analysis.expectedLl}</span>
      </div>
    )}
  </div>
)}

{/* Botão Fix — só aparece quando canFix = true e não há fixedZpl ainda */}
{analysis?.canFix && !fixedZpl && (
  <button onClick={handleFix}>
    {t('shopeeFix.buttons.fix')}
  </button>
)}

{/* Após fix: copiar e baixar */}
{fixedZpl && (
  <div>
    <button onClick={handleCopy}>
      {copied ? t('shopeeFix.buttons.copied') : t('shopeeFix.buttons.copy')}
    </button>
    <button onClick={handleDownload}>
      {t('shopeeFix.buttons.download')}
    </button>
  </div>
)}
```

### Cross-sell para o Validator

Quando `analysis.status === 'red'` (estrutura inválida), exibir:
```tsx
<CrossSellCard
  tool="zpl-syntax-validator"
  message={t('shopeeFix.crossSell.validator')}
/>
```

---

## 4. Chaves i18n (adicionar nos 4 arquivos JSON)

```json
"shopeeFix": {
  "result": {
    "correct": "Etiqueta dentro das especificações Shopee. Nenhuma correção necessária.",
    "missingDimensions": "Dimensões não definidas. Clique em Corrigir para adicionar ^PW e ^LL corretos.",
    "wrongDimensions": "Dimensões incorretas para o DPI selecionado. Clique em Corrigir para ajustar.",
    "invalidStructure": "Código ZPL inválido — ^XA ou ^XZ ausente. Use o Validador de Sintaxe para diagnosticar."
  },
  "buttons": {
    "analyze": "Analisar",
    "fix": "Corrigir automaticamente",
    "copy": "Copiar ZPL corrigido",
    "copied": "Copiado!",
    "download": "Baixar .zpl corrigido"
  },
  "crossSell": {
    "validator": "Seu ZPL tem erros estruturais. Use o Validador de Sintaxe para diagnóstico completo."
  },
  "dpiSelector": {
    "label": "DPI da sua impressora",
    "hint203": "203 DPI — Zebra ZD220, ZD230 (mais comum)",
    "hint300": "300 DPI — Zebra ZD421, ZT230"
  }
}
```

---

## 5. Checklist de conclusão

- [ ] `ShopeeFixEngine.ts` criado com `analyzeShopeeZpl()` e `fixShopeeZpl()`
- [ ] `useShopeeFix.ts` criado e conectado ao componente existente
- [ ] Semáforo Verde: ZPL correto, nenhum botão de ação
- [ ] Semáforo Amarelo: exibe dimensões encontradas vs esperadas + botão Corrigir
- [ ] Semáforo Vermelho: mensagem de erro + cross-sell para Validator
- [ ] Após correção: semáforo atualiza para Verde + botões Copiar e Baixar
- [ ] Seletor DPI 203/300 com hint do modelo de impressora
- [ ] Chaves i18n nos 4 arquivos JSON
- [ ] Testar com ZPL sem ^PW/^LL → deve ficar Amarelo e corrigir para Verde
- [ ] Testar com ZPL com dimensões erradas → deve ficar Amarelo e corrigir
- [ ] Testar com ZPL correto → deve ficar Verde direto
- [ ] Testar com ZPL sem ^XA → deve ficar Vermelho com cross-sell
- [ ] `task_plan.txt` e `progress.txt` atualizados

---

## Prompt para o agente (Cursor)

```
Leia o AGENTS.md e depois directives/06_shopee_fixer.md.

O chassi visual da Ferramenta 2 já existe.
Implemente apenas a lógica de detecção e correção conforme a directive.

Plano esperado antes de codar:
1. Localizar o componente existente da ferramenta Shopee Fix
2. Criar ShopeeFixEngine.ts e useShopeeFix.ts
3. Conectar o hook ao componente sem alterar o visual existente
4. Adicionar chaves i18n nos 4 arquivos

Após implementar, testar os 4 cenários do checklist via browser.
```

---

*Criado em: 2026-03-21*
*Chassis visual existente — apenas lógica pendente*
*Próxima directive: 07_bulk_splitter.md*
