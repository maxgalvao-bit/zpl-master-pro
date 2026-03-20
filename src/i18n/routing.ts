import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['pt-br', 'en', 'es', 'zh'],
  defaultLocale: 'pt-br',
  pathnames: {
    '/': '/',
    '/tools/zpl-to-pdf': {
      'pt-br': '/ferramentas/conversor-zpl-para-pdf',
      en: '/tools/zpl-to-pdf-converter',
      es: '/herramientas/convertidor-zpl-a-pdf',
      zh: '/tools/zpl-to-pdf-converter'
    },
    '/tools/shopee-image-fix': {
      'pt-br': '/ferramentas/corrigir-etiqueta-shopee',
      en: '/tools/shopee-image-fix',
      es: '/herramientas/reparar-etiqueta-shopee',
      zh: '/tools/shopee-image-fix'
    },
    '/tools/validator': {
      'pt-br': '/ferramentas/validador-de-sintaxe-zpl',
      en: '/tools/zpl-syntax-validator',
      es: '/herramientas/validador-de-sintaxis-zpl',
      zh: '/tools/zpl-syntax-validator'
    }
  }
});

// Lightweight hooks and navigation APIs
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
