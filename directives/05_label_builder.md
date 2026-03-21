# Directive 05 — Label Builder: Etiqueta de Transporte de Mercadoria
# Ferramenta Premium do ZPL Master Pro (V.L.A.E.G.)
# Aprovado via mockup interativo em 2026-03-20

---

## Visão geral

O Label Builder é uma plataforma de geração de etiquetas ZPL via formulário visual,
com preview em tempo real e suporte a múltiplos volumes em uma única sessão.

Arquitetura de templates: cada tipo de etiqueta é um `LabelTemplate` independente.
Esta directive implementa o primeiro template: **Transporte de Mercadoria**.
Futuros templates (Envio de Pedido, Devolução, etc.) seguirão a mesma arquitetura.

---

## Arquivos a criar

```
src/
  app/[locale]/tools/label-builder/
    page.tsx                          ← generateMetadata() + wrapper
    LabelBuilderWrapper.tsx           ← 'use client' — orquestrador principal
  components/label-builder/
    TemplateSelector.tsx              ← seleção de template (fase futura, já estruturar)
    FormDadosFixos.tsx                ← remetente + destinatário + NF
    FormVolumes.tsx                   ← lista de volumes com campos individuais
    VolumeRow.tsx                     ← linha de um volume (peso, descrição, indicadores)
    LabelPreview.tsx                  ← preview SVG de uma etiqueta
    ExportBar.tsx                     ← botões PDF e ZPL
  services/
    LabelGenerator.ts                 ← monta o ZPL de cada etiqueta
    LabelTemplates.ts                 ← definição de templates (arquitetura futura)
  types/
    label.types.ts                    ← tipos TypeScript compartilhados
```

**NÃO modificar:** ZplValidator.ts, ZplFixer.ts, ZplEngine.ts, ExportEngine, rotas existentes.

---

## 1. Tipos TypeScript (src/types/label.types.ts)

```typescript
export type Indicador = 'fragil' | 'cima' | 'chuva' | 'inflamavel';

export interface DadosRemetente {
  empresa: string;
  cnpj: string;
  endereco: string;
}

export interface DadosDestinatario {
  nome: string;
  cpfCnpj: string;       // armazenado só dígitos, formatado na exibição
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface DadosVolume {
  id: number;            // 1-based, gerado automaticamente
  peso: string;          // ex: "4,5"
  descricao: string;
  indicadores: Indicador[];
}

export interface DadosEtiqueta {
  remetente: DadosRemetente;
  destinatario: DadosDestinatario;
  notaFiscal: string;
  totalVolumes: number;
  pesoIgualParaTodos: boolean;
  pesoGlobal: string;    // usado quando pesoIgualParaTodos = true
  volumes: DadosVolume[];
}

export interface LabelTemplate {
  id: string;
  nomeKey: string;       // chave i18n
  descricaoKey: string;
  component: React.ComponentType<{ dados: DadosEtiqueta }>;
  gerarZpl: (dados: DadosEtiqueta) => string;
}
```

---

## 2. Máscara CPF/CNPJ

Implementar como hook `useCpfCnpjMask` em `src/hooks/useCpfCnpjMask.ts`:

```typescript
export function useCpfCnpjMask() {
  function mask(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0001-00
      return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) {
    setter(mask(e.target.value));
  }

  return { mask, handleChange };
}
```

Usar no campo CPF/CNPJ do destinatário:
```tsx
<input
  value={destinatario.cpfCnpj}
  onChange={(e) => handleChange(e, (v) => setDestinatario({...destinatario, cpfCnpj: v}))}
  placeholder="CPF ou CNPJ"
  maxLength={18}
/>
```

---

## 3. Fluxo de volumes (FormVolumes.tsx)

### Step 1 — Definir quantidade e modo de peso

```tsx
<div>
  <label>Quantidade de volumes</label>
  <input
    type="number" min="1" max="99"
    value={totalVolumes}
    onChange={(e) => handleTotalChange(parseInt(e.target.value))}
  />
</div>

<div>
  <label>
    <input
      type="checkbox"
      checked={pesoIgualParaTodos}
      onChange={(e) => setPesoIgualParaTodos(e.target.checked)}
    />
    Mesmo peso para todos os volumes
  </label>
</div>

{pesoIgualParaTodos && (
  <div>
    <label>Peso (kg) — aplicado a todos</label>
    <input value={pesoGlobal} onChange={(e) => setPesoGlobal(e.target.value)} />
  </div>
)}
```

### Step 2 — Lista de volumes (gerada dinamicamente)

Quando `totalVolumes` muda, sincronizar o array `volumes[]`:
- Se aumentou: adicionar volumes novos com valores vazios
- Se diminuiu: remover os últimos
- NUNCA resetar volumes que já foram preenchidos

```typescript
function syncVolumes(total: number, current: DadosVolume[]): DadosVolume[] {
  if (total > current.length) {
    const novos = Array.from({ length: total - current.length }, (_, i) => ({
      id: current.length + i + 1,
      peso: '',
      descricao: '',
      indicadores: [] as Indicador[],
    }));
    return [...current, ...novos];
  }
  return current.slice(0, total);
}
```

### VolumeRow.tsx — campos por volume

```
┌─ Volume 3 / 18 ──────────────────────────────────┐
│ Peso (kg): [____]   Descrição: [________________] │
│ Indicadores: [x] Frágil  [ ] Para cima            │
│              [ ] Proteger chuva  [ ] Inflamável    │
└───────────────────────────────────────────────────┘
```

Quando `pesoIgualParaTodos = true`, o campo peso fica desabilitado e exibe o `pesoGlobal`.
Quando `pesoIgualParaTodos = false`, cada volume tem seu próprio campo de peso editável.

---

## 4. Símbolos de manuseio — SVG paths (usar em LabelPreview e VolumeRow)

```typescript
export const SIMBOLOS: Record<Indicador, { label: string; path: string }> = {
  fragil: {
    label: 'FRAGILE',
    path: 'M18 8 Q16 14 19 17 L15 32 Q15 35 22 35 Q29 35 29 32 L25 17 Q28 14 26 8 Z'
  },
  cima: {
    label: 'ESTE LADO\nPARA CIMA',
    path: 'M16 34 L16 14 M28 34 L28 14 M10 20 L16 12 L22 20 M22 20 L28 12 L34 20'
    // Nota: este símbolo usa múltiplas linhas — renderizar como <path> com stroke, fill none
  },
  chuva: {
    label: 'PROTEGER\nDA CHUVA',
    path: 'M10 22 Q10 12 22 12 Q34 12 34 22 Z M22 22 L22 34 Q22 38 18 38'
  },
  inflamavel: {
    label: 'INFLAMÁVEL',
    path: 'M22 8 C22 8 28 14 26 20 C30 16 30 12 30 12 C30 12 36 18 34 26 C33 31 28 36 22 36 C16 36 10 31 10 25 C10 19 14 16 14 16 C14 16 14 22 18 22 C16 18 20 12 22 8 Z'
  }
};
```

Renderização do símbolo na etiqueta:
```tsx
function SimboloBox({ tipo }: { tipo: Indicador }) {
  const s = SIMBOLOS[tipo];
  return (
    <div style={{ border: '1.5px solid #222', width: 44, height: 44, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="30" height="30" viewBox="0 0 44 44">
        <path d={s.path} fill={tipo === 'inflamavel' || tipo === 'fragil' ? '#111' : 'none'}
              stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 6, fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
        {s.label}
      </span>
    </div>
  );
}
```

---

## 5. Gerador ZPL (src/services/LabelGenerator.ts)

Gera uma etiqueta ZPL para um volume específico. 203 DPI padrão (^PW812^LL1218).

```typescript
import { DadosEtiqueta, DadosVolume, Indicador } from '@/types/label.types';

const DPI = 8; // dots por mm a 203 DPI

function dots(mm: number): number {
  return Math.round(mm * DPI);
}

// Mapa de símbolos ZPL — usando ^GF (imagem) ou ^FD com fonte especial
// Simplificação: usar texto ASCII representativo com fonte grande
// para impressão real em Zebra. Preview usa SVG.
const SIMBOLO_ZPL: Record<Indicador, string> = {
  fragil:     '^FO20,820^CF0,28^FDFRAGILE^FS',
  cima:       '^FO20,820^CF0,28^FD[CIMA]^FS',
  chuva:      '^FO20,820^CF0,28^FD[CHUVA]^FS',
  inflamavel: '^FO20,820^CF0,28^FD[INFLAMAVEL]^FS',
};

export function gerarZplVolume(dados: DadosEtiqueta, volume: DadosVolume): string {
  const peso = dados.pesoIgualParaTodos ? dados.pesoGlobal : volume.peso;
  const dest = dados.destinatario;
  const rem = dados.remetente;

  const linhasIndicadores = volume.indicadores.map((ind, i) => {
    const x = 20 + (i * 120);
    return `^FO${x},820^CF0,22^FD${ind.toUpperCase()}^FS`;
  }).join('\n');

  return `^XA
^PW812
^LL1218
^CF0,30

^FO20,20^GB772,0,3^FS

^FO20,30^CF0,24^FD${rem.empresa}^FS
^FO20,62^CF0,20^FDCNPJ: ${rem.cnpj}^FS
^FO20,88^CF0,18^FD${rem.endereco}^FS

^FO20,115^GB772,0,2^FS

^FO20,125^CF0,20^FDDESTINATARIO^FS
^FO20,152^CF0,28^FD${dest.nome}^FS
^FO20,186^CF0,20^FD${formatarDocumento(dest.cpfCnpj)}^FS
^FO20,210^CF0,20^FD${dest.endereco}^FS
^FO20,234^CF0,20^FD${dest.cidade} - ${dest.uf} - CEP ${dest.cep}^FS

^FO20,260^GB772,0,2^FS

^FO20,270^CF0,20^FDNOTA FISCAL^FS
^FO20,296^CF0,42^FD${dados.notaFiscal}^FS

^FO270,270^CF0,20^FDVOLUME^FS
^FO270,296^CF0,42^FD${volume.id} / ${dados.totalVolumes}^FS

^FO520,270^CF0,20^FDPESO^FS
^FO520,296^CF0,42^FD${peso} kg^FS

^FO20,360^GB772,0,2^FS

^FO20,370^CF0,20^FDPRODUTO^FS
^FO20,396^CF0,28^FD${volume.descricao}^FS

^FO20,440^GB772,0,2^FS

^FO20,450^CF0,20^FDINDICADORES DE MANUSEIO^FS
${linhasIndicadores}

^FO20,910^GB772,0,3^FS

^FO20,920^CF0,18^FDREMETENTE: ${rem.empresa} - ${rem.endereco}^FS

^XZ`;
}

function formatarDocumento(doc: string): string {
  const digits = doc.replace(/\D/g, '');
  if (digits.length <= 11) return `CPF: ${doc}`;
  return `CNPJ: ${doc}`;
}

export function gerarZplCompleto(dados: DadosEtiqueta): string {
  return dados.volumes.map(v => gerarZplVolume(dados, v)).join('\n\n');
}
```

---

## 6. Export (ExportBar.tsx)

Dois botões:

### Exportar PDF
Usar o `ExportEngine` já existente. Adaptar para receber array de SVGs de preview
e gerar PDF com uma etiqueta por página (100×150mm).

```typescript
async function exportarPdf(dados: DadosEtiqueta) {
  // Renderizar cada LabelPreview como canvas via html2canvas ou
  // usar jsPDF diretamente com os dados — sem depender do DOM
  // Uma página por volume, tamanho 100x150mm
}
```

### Exportar ZPL
```typescript
function exportarZpl(dados: DadosEtiqueta) {
  const zpl = gerarZplCompleto(dados);
  const blob = new Blob([zpl], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `etiquetas_NF${dados.notaFiscal}_${dados.totalVolumes}vol.zpl`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 7. Salvamento local (localStorage)

Salvar o estado completo do formulário para recuperação após fechar o browser.

```typescript
const STORAGE_KEY = 'zplmaster_label_builder_draft';

export function salvarRascunho(dados: DadosEtiqueta) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

export function carregarRascunho(): DadosEtiqueta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limparRascunho() {
  localStorage.removeItem(STORAGE_KEY);
}
```

No `LabelBuilderWrapper.tsx`, ao montar o componente:
```typescript
useEffect(() => {
  const rascunho = carregarRascunho();
  if (rascunho) setDados(rascunho);
}, []);

// Salvar automaticamente a cada mudança (debounce 500ms)
useEffect(() => {
  const timer = setTimeout(() => salvarRascunho(dados), 500);
  return () => clearTimeout(timer);
}, [dados]);
```

---

## 8. Arquitetura de templates (estruturar agora, implementar depois)

Criar `src/services/LabelTemplates.ts` com a estrutura base — sem implementar outros templates ainda:

```typescript
import { LabelTemplate } from '@/types/label.types';

// Importar o componente de transporte quando estiver pronto
// import TransportePreview from '@/components/label-builder/TransportePreview';

export const TEMPLATES: LabelTemplate[] = [
  {
    id: 'transporte-mercadoria',
    nomeKey: 'labelBuilder.templates.transporte.nome',
    descricaoKey: 'labelBuilder.templates.transporte.descricao',
    component: null as any, // preencher após criar o componente
    gerarZpl: null as any,  // preencher com gerarZplCompleto do LabelGenerator
  },
  // Futuros templates virão aqui:
  // { id: 'envio-pedido', ... },
  // { id: 'devolucao', ... },
];
```

O `TemplateSelector.tsx` deve ser criado mas pode exibir apenas o template de transporte
por enquanto, com os outros como "Em breve" (desabilitados visualmente).

---

## 9. Chaves i18n a adicionar (4 arquivos JSON)

```json
"labelBuilder": {
  "title": "Construtor de etiquetas ZPL",
  "description": "Crie etiquetas profissionais sem conhecer ZPL",
  "metaTitle": "ZPL Label Builder — Construtor de Etiquetas Online | ZPL Master Pro",
  "metaDescription": "Crie etiquetas ZPL de transporte, envio e logística sem escrever código. Gere PDF e ZPL prontos para impressão.",
  "templates": {
    "transporte": {
      "nome": "Etiqueta de transporte",
      "descricao": "Para remessas com nota fiscal, múltiplos volumes e indicadores de manuseio"
    }
  },
  "form": {
    "remetente": "Remetente",
    "destinatario": "Destinatário",
    "cpfCnpj": "CPF / CNPJ",
    "notaFiscal": "Nota fiscal",
    "totalVolumes": "Quantidade de volumes",
    "pesoIgual": "Mesmo peso para todos",
    "pesoGlobal": "Peso (kg) — todos os volumes",
    "volume": "Volume",
    "peso": "Peso (kg)",
    "descricao": "Descrição do produto",
    "indicadores": "Indicadores de manuseio"
  },
  "indicadores": {
    "fragil": "Frágil",
    "cima": "Este lado para cima",
    "chuva": "Proteger da chuva",
    "inflamavel": "Inflamável"
  },
  "export": {
    "pdf": "Exportar PDF",
    "zpl": "Exportar ZPL",
    "saving": "Rascunho salvo automaticamente"
  }
}
```

---

## 10. Checklist de conclusão

- [ ] `label.types.ts` criado com todos os tipos
- [ ] `useCpfCnpjMask.ts` criado e funcionando (CPF e CNPJ)
- [ ] `FormDadosFixos.tsx` — remetente + destinatário com máscara
- [ ] `FormVolumes.tsx` — quantidade + toggle peso igual/diferente
- [ ] `VolumeRow.tsx` — peso, descrição, 4 checkboxes de indicadores
- [ ] `syncVolumes()` — adiciona/remove sem resetar preenchidos
- [ ] `LabelGenerator.ts` — `gerarZplVolume()` e `gerarZplCompleto()`
- [ ] `LabelPreview.tsx` — preview visual fiel ao mockup aprovado
- [ ] `ExportBar.tsx` — botões PDF e ZPL funcionando
- [ ] Salvamento automático em localStorage com debounce 500ms
- [ ] `LabelTemplates.ts` — estrutura criada com slot para futuros templates
- [ ] `TemplateSelector.tsx` — exibe transporte ativo + outros "Em breve"
- [ ] Página `/[locale]/tools/label-builder` com metadados i18n
- [ ] Chaves i18n nos 4 arquivos JSON
- [ ] Testar com 18 volumes — pesos diferentes por volume
- [ ] Testar exportação PDF (18 páginas) e ZPL (18 blocos ^XA...^XZ)
- [ ] `task_plan.txt` e `progress.txt` atualizados

---

## Prompt para o agente (Cursor + Claude)

```
Leia o AGENTS.md e depois directives/05_label_builder.md.

Use Plan Mode. Liste os arquivos que vai criar antes de começar.

Implemente na seguinte ordem:
1. label.types.ts e useCpfCnpjMask.ts (sem UI ainda)
2. LabelGenerator.ts — gerarZplVolume() e gerarZplCompleto()
3. FormDadosFixos + FormVolumes + VolumeRow (UI do formulário)
4. LabelPreview (preview visual)
5. ExportBar (PDF e ZPL)
6. Salvamento localStorage
7. Página /tools/label-builder com rota i18n

Teste com 18 volumes após concluir.
```

---

*Criado em: 2026-03-20*
*Aprovado via mockup interativo — layout confirmado pelo usuário*
*Próxima directive: 06_shopee_fixer_ui.md (Ferramenta 2, pendente)*
