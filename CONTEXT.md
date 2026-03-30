# ZPLMaster Pro — Estado Atual

## Stack
Next.js 14, next-intl (pt-br/en/es/zh), TypeScript,
TailwindCSS, Supabase (SP), Brevo, Vercel, AdSense

## Branch develop — pendente de merge para main
Último merge para main: feat llms.txt e SoftwareApplication

## Ferramentas no ar (main)
1. ZPL to PDF Converter
2. Shopee Image Fix
3. ZPL Syntax Validator
4. Bulk Splitter
5. Label Builder — acesso via cadastro email

## Label Builder — templates implementados (develop)
1. transporte-mercadoria — completo
2. envio-nfe — completo
   - PDF: jsPDF + bwip-js (alta qualidade)
   - Logo: encodeLogoForZpl retorna {downloadCmd, renderCmd}
   - ZPL: ~DGR antes ^XA, ^XGR dentro do body
   - Barcode: ^BCN via bwip-js no PDF

## Arquivos chave Label Builder
- src/services/LabelGenerator.ts
- src/services/EnvioNFeGenerator.ts
- src/services/encodeLogoForZpl.ts
- src/services/LabelBuilderPdf.ts
- src/types/label.types.ts
- src/components/label-builder/LabelPreviewNFe.tsx

## Pendente (develop)
1. Botão Impressão Térmica no Label Builder
   (igual ao do Conversor ZPL→PDF — ExportEngine.printThermal)
2. Etiquetas de Produto Premium:
   - 1 coluna: 63×40mm, Code128, SKU+EAN+Nome+Variação
   - 2 colunas: 91×25mm, mesmo conteúdo
   - Lote múltiplo: grade de SKUs (Premium)
3. Stripe para monetização Premium
4. Canal de suporte (Crisp)

## Infraestrutura
- Supabase: tabelas counters, label_builder_users
- Brevo: Lista #6 Label Builder (xkeysib API key)
- AdSense: ca-pub-5267254636032578
- GA4: G-Z83V6HGE70
- reCAPTCHA v3: 6LconZksAAAAAMQUvLTX3F7BbV8EOOW3pd-dINCW

## Regras de operação
- Todo desenvolvimento na branch develop
- Merge para main apenas quando testado
- Nunca push direto para main
- Prefixo commits: feat/fix/chore/docs
