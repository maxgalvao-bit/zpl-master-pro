import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Configuração para corresponder apenas navegação internacionalizada
  matcher: [
    // Rota raiz e as rotas dos locales (todas)
    '/',
    '/(pt-br|en|es|zh)/:path*'
  ]
};
