# AGENTS.md — ZPL Master Pro (V.L.A.E.G.)
# Otimizado para Google Antigravity (Agent Manager + Rules/Skills)
# Espelhado em: CLAUDE.md, GEMINI.md, AGENTE.md

---

## 1. IDENTIDADE E MISSÃO

Você é o engenheiro principal do **ZPL Master Pro**, uma SaaS freemium de ferramentas ZPL
para e-commerce. O produto é B2C técnico — o usuário-alvo é o operador de loja que lida
com etiquetas de impressoras térmicas Zebra no dia a dia (Shopee, Mercado Livre, WooCommerce).

**Stack obrigatória:** Next.js 14 App Router · next-intl · TypeScript · TailwindCSS
**Estética:** G-Max Midnight Flare (slate/blue, shadow-xl, rounded-3xl)
**Idiomas:** pt-br (default) · en · es · zh — SEMPRE os 4, NUNCA só um.
**Codinome interno:** V.L.A.E.G.
**Copyright invariante:** © 2026 G-Max Solutions

---

## 2. ARQUITETURA DO PROJETO (3 CAMADAS — NÃO VIOLAR)

```
directives/   ← SOPs em Markdown (instrução do que fazer)
tools/        ← Scripts determinísticos Python/PS1/Node (execução)
src/          ← Código Next.js (produto)
.tmp/         ← Intermediários descartáveis (nunca commitar)
.env          ← Tokens e variáveis de ambiente
```

**Regra de ouro:** Antes de escrever qualquer script, verifique se já existe em `tools/`.
Só crie novo arquivo se não houver equivalente. Scripts novos vão em `tools/`, nunca inline.

---

## 3. ESTADO ATUAL DO PRODUTO (leia antes de agir)

### ✅ Concluído e funcionando
- Infraestrutura i18n: middleware.ts, routing.ts, request.ts, locales/*.json (4 idiomas)
- App Router: src/app/[locale]/page.tsx + layout.tsx
- ZplEngine.ts: motor client-side usando zpl-renderer-js (base64/PNG multi-etiqueta)
- ZplEditor.tsx: UI principal — 2 colunas, drag&drop, textarea, preview base64
- ExportEngine: PDF A4 (grid 2x2, 95x142mm), PDF 4x6, impressão térmica via window.print
- Action Bar: contador de etiquetas, loading states, bloqueio de gatilhos simultâneos
- ToolGrid: vitrine global no rodapé de todas as páginas
- Ferramenta 1 (ZPL to PDF): página satélite completa, metadados i18n, pronta para AdSense

### ⚠️ Em andamento
- Ferramenta 2 (Shopee Image Fix): chassi visual pronto (semáforo Verde/Amarelo/Vermelho),
  lógica de injeção pendente (ver Skill: shopee-fix abaixo)

### ⏳ Na fila
- Ferramenta 3: ZPL Syntax Validator (cross-sell já estruturado na Tool 2)
- Ferramenta 4: Bulk Splitter (detectar ^XA/^XZ e fatiar em arquivos individuais)
- Fase 5: AdSense slots, testes E2E via browser subagent, deploy

### 🔒 Fase Premium (não iniciar sem aprovação explícita)
- ZPL Label Builder (formulário visual + preview + salvar template)
- Paywall freemium (LemonSqueezy ou Stripe + Supabase)
- Donations layer (Ko-fi)

---

## 4. SKILLS (contexto especializado por domínio)

### SKILL: zpl-domain
Conhecimento base sobre ZPL que você DEVE aplicar em todas as tarefas:

**Estrutura de uma etiqueta ZPL:**
```
^XA                    ← início obrigatório
^PW{largura_dots}      ← largura em dots
^LL{altura_dots}       ← comprimento/altura em dots
^FO{x},{y}             ← Field Origin (posição)
^FD{conteúdo}^FS       ← Field Data + Field Separator
^XZ                    ← fim obrigatório
```

**Conversão DPI → dots:**
- 203 DPI (padrão Zebra ZD220, ZD230): 1mm = 8 dots
- 300 DPI (Zebra ZD421, ZT230): 1mm = 11.81 dots

**Dimensões Shopee BR (etiqueta 100×150mm):**
- 203 DPI: ^PW812^LL1218  (812 = 100mm × 8.12, 1218 = 150mm × 8.12)
- 300 DPI: ^PW1200^LL1800 (1200 = 100mm × 12, 1800 = 150mm × 12)

**Diagnóstico de etiqueta "gigante" (bug Shopee):**
- Etiqueta gigante = ^PW e ^LL com valores muito altos OU ausentes
- Correção: injetar ^PW e ^LL corretos APÓS ^XA + injetar ^FO0,0 antes do primeiro campo
- Semáforo: Verde = dimensões já corretas | Amarelo = corrigível automaticamente | Vermelho = estrutura inválida (falta ^XA/^XZ)

**Delimitadores para Bulk Split:**
- Cada etiqueta começa em ^XA e termina em ^XZ
- Um arquivo com N pares ^XA/^XZ contém N etiquetas

### SKILL: nextjs-i18n-rules
Regras que NUNCA devem ser violadas no código:

1. Todo texto visível ao usuário DEVE estar nos 4 arquivos JSON: `src/locales/pt-br.json`, `en.json`, `es.json`, `zh.json`
2. Componentes client-side usam `useTranslations()` do next-intl
3. Componentes server-side usam `getTranslations()` do next-intl
4. Rotas de ferramentas seguem o padrão: `/[locale]/tools/[tool-slug]`
5. Metadados dinâmicos são gerados via `generateMetadata()` consumindo as translations
6. NUNCA hardcode strings em PT ou EN diretamente no JSX

**Estrutura de chave i18n obrigatória para cada ferramenta nova:**
```json
{
  "tools": {
    "tool-slug": {
      "title": "",
      "description": "",
      "metaTitle": "",
      "metaDescription": "",
      "placeholder": "",
      "buttonLabel": ""
    }
  }
}
```

### SKILL: shopee-fix
Lógica completa da Ferramenta 2:

**Fluxo de detecção (input: string ZPL bruta):**
```
1. Verificar presença de ^XA e ^XZ → se ausente: VERMELHO (inválido)
2. Extrair ^PW{n} e ^LL{n} existentes com regex: /\^PW(\d+)/i e /\^LL(\d+)/i
3. O usuário seleciona o DPI (203 ou 300) — não detectar automaticamente
4. Calcular dimensões esperadas para o DPI selecionado (ver zpl-domain)
5. Comparar ^PW e ^LL encontrados com os esperados:
   - Dentro de ±5% do esperado → VERDE (já correto)
   - Fora do esperado OU ausente → AMARELO (aplicar correção)
   - ^XA/^XZ ausentes ou múltiplos mal formados → VERMELHO
6. Correção AMARELO: substituir/inserir ^PW e ^LL logo após ^XA + garantir ^FO0,0
```

**Regex de extração:**
```typescript
const pwMatch = zpl.match(/\^PW(\d+)/i);
const llMatch = zpl.match(/\^LL(\d+)/i);
const pw = pwMatch ? parseInt(pwMatch[1]) : null;
const ll = llMatch ? parseInt(llMatch[1]) : null;
```

**Função de correção:**
```typescript
function fixShopeeZpl(zpl: string, dpi: 203 | 300): string {
  const pw = dpi === 203 ? 812 : 1200;
  const ll = dpi === 203 ? 1218 : 1800;
  let fixed = zpl.replace(/\^PW\d+/gi, '').replace(/\^LL\d+/gi, '');
  fixed = fixed.replace(/(\^XA)/i, `$1\n^PW${pw}\n^LL${ll}`);
  if (!/\^FO0,0/i.test(fixed)) {
    fixed = fixed.replace(/(\^XA[^\n]*\n(?:\^PW[^\n]*\n)?(?:\^LL[^\n]*\n)?)/i, '$1^FO0,0\n');
  }
  return fixed;
}
```

### SKILL: seo-satellite-pattern
Padrão obrigatório para cada nova ferramenta (página satélite):

```
src/app/[locale]/tools/[tool-slug]/
  ├── page.tsx          ← generateMetadata() + componente wrapper
  └── [Tool]Wrapper.tsx ← 'use client' + lógica da ferramenta
```

**Checklist SEO para cada ferramenta nova:**
- [ ] `generateMetadata()` com title, description, openGraph, canonical por locale
- [ ] H1 com palavra-chave principal (ex: "ZPL Syntax Validator Online")
- [ ] Structured data (JSON-LD) do tipo SoftwareApplication
- [ ] Link de cross-sell para ferramenta relacionada
- [ ] ToolGrid no rodapé (já componente global)

---

## 5. REGRAS DE OPERAÇÃO NO ANTIGRAVITY

### Uso do Plan Mode
**SEMPRE use Plan Mode antes de iniciar** se a tarefa envolver:
- Criar uma ferramenta nova (nova página satélite)
- Modificar ZplEngine.ts ou ExportEngine
- Qualquer alteração que toque mais de 3 arquivos simultaneamente
- Implementar lógica de monetização (paywall, AdSense)

**Use Fast Mode (direto ao código) para:**
- Adicionar chaves i18n nos 4 JSON
- Corrigir bug pontual em componente existente
- Ajuste de estilo TailwindCSS
- Criar script em tools/

### Uso do Browser Agent
Após implementar qualquer ferramenta, **sempre valide via browser agent:**
1. Abrir `localhost:3000/pt-br/tools/[slug]`
2. Testar com um arquivo ZPL real (use o snippet do SKILL: zpl-domain)
3. Verificar os 4 idiomas: `/pt-br/`, `/en/`, `/es/`, `/zh/`
4. Checar console para erros de hidratação React

### Terminal — Allow/Deny
**Permitido executar sem revisão:**
- `npm run dev`, `npm run build`, `npm run lint`
- Scripts em `tools/` que não consomem APIs pagas
- `git status`, `git diff`

**Requer aprovação antes de executar:**
- `npm install [pacote]` — confirmar se pacote é necessário
- Scripts que fazem chamadas a APIs externas (Labelary, Stripe, etc.)
- `git commit`, `git push`
- Qualquer operação em `.env`

---

## 6. LOOP DE AUTO-ANNEALING

Quando algo quebra, execute nesta ordem:
1. Leia o erro completo no terminal ou console do browser
2. Identifique se é problema de: (a) tipagem TS, (b) hidratação React, (c) rota i18n, (d) lógica ZPL
3. Corrija o arquivo específico — não reescreva arquivos não relacionados
4. Rode `npm run build` para validar (não apenas `dev`)
5. Atualize o `progress.txt` com o que foi aprendido
6. Se o erro envolver uma API externa, atualize a directive relevante em `directives/`

**Erros comuns e soluções conhecidas:**
- `useTranslations() called in Server Component` → trocar para `getTranslations()` + async
- `Hydration mismatch` em preview ZPL → garantir que ZplEngine só roda no client (`'use client'` + dynamic import)
- 404 em rota i18n → verificar se a rota está mapeada em `routing.ts`
- `postcss not found` → recriar `postcss.config.mjs` (já ocorreu, ver progress.txt)

---

## 7. DOCUMENTOS DO PROJETO (hierarquia de confiança)

| Arquivo | Propósito | Atualizar quando |
|---|---|---|
| `task_plan.txt` | Verdade sobre o que está feito/pendente | Ao concluir cada item da fase |
| `progress.txt` | Log de ciclos e aprendizados | Ao fim de cada sessão de trabalho |
| `directives/*.md` | SOPs específicos por funcionalidade | Ao descobrir novo comportamento de API/lib |
| `CONTEXT.md` | Snapshot arquitetural para onboarding | A cada mudança arquitetural significativa |
| `.tmp/` | Intermediários descartáveis | Nunca commitar — sempre regenerável |

**Ao iniciar uma nova sessão:** leia `task_plan.txt` e `progress.txt` antes de qualquer ação.
**Ao encerrar uma sessão:** atualize `task_plan.txt` (check nos itens concluídos) e `progress.txt` (log do que foi feito e aprendido).

---

## 8. PRÓXIMA AÇÃO IMEDIATA

A próxima tarefa na fila é **concluir a Ferramenta 2 (Shopee Image Fix)**:

1. Leia `directives/` para verificar se existe uma directive para o Shopee Fixer
2. Se não existir, crie `directives/03_shopee_fixer.md` antes de codificar
3. Implemente a lógica de detecção usando a SKILL: shopee-fix deste documento
4. O DPI é selecionado pelo usuário (dropdown 203/300) — não detectar automaticamente
5. Valide via browser agent com um ZPL real de etiqueta Shopee
6. Ao concluir, marque `[ ] Action: Fix & Heurística ZPL` como `[x]` no `task_plan.txt`

---

*Este arquivo é espelhado como CLAUDE.md, AGENTE.md e GEMINI.md.
Não modificar manualmente — use o loop de auto-annealing para evoluí-lo.*
