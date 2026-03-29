import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Ignora arquivos internos do Next.js e estáticos
    '/((?!_next|_vercel|api|.*\\..*).*)',
    // Rota raiz e rotas dos locales
    '/',
    '/(pt-br|en|es|zh)/:path*'
  ]
};