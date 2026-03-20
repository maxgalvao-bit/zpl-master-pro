# Contexto Atual (ZPLMaster Pro - Arquitetura Internacional next-intl)

**Data/Hora:** LATEST
**Objetivo:** Instalar e configurar a fundação de Rotas Internacionalizadas (Localized Pathnames) e migrar o App Router para o layout dinâmico `[locale]`, resolvendo erros 404 e mantendo o design intacto.

## Decisões Arquiteturais e Execução (i18n Setup)
1. **Middleware e Roteamento (`middleware.ts` e `routing.ts`):**
   - Construída a infraestrutura de Localized Pathnames nativa do `next-intl` mapeando os diretórios para pt-br, en, es e zh com suas traduções na URL (Ex: `/tools/zpl-to-pdf-converter`).
   - Mapeada a raiz `/` para evitar que o hook de `Link` nativo bloqueasse a compilação por erro de TypeScript abstrato.

2. **Reestruturação App Router (`src/app/[locale]/`):**
   - Transladadas fisicamente as páginas base (`page.tsx` e `layout.tsx`) para dentro do segmento dinâmico `[locale]`.
   - Ajustada a ramificação de imports (elevada em um grau `../../`) garantindo as chamadas de componentes e os arquivos em `src/locales/*.json`.

3. **Arquétipo de Tradução (`request.ts`):**
   - Injetado `getRequestConfig` que obriga o back-end do Next.js a carregar, para cada request na rota correspondente, o arquivo físico `.json` de acordo com a predefinição do roteamento (`defaultLocale: 'pt-br'`).

4. **Integração Cliente (Preservação de Design):**
   - Conforme exigido para manter todo o visual (useState hook na HOME intacto), a `page.tsx` passou a consumir o gancho de `useParams()` do `next/navigation`, capturando ativamente o `localeFromUrl` dinâmico do `next-intl`.
   - Isso eliminou as quebras de 404 mantendo a total fidelidade estética do *G-Max Midnight Flare*.

## Status Atual
As rotas de línguas estão criadas, os botões respondem e o app Router suporta internacionalização sem erros de servidor. Toda infraestrutura do provedor de linguagem pronta. O 404 principal foi liquidado.
