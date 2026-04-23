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
    },
    '/tools/label-builder': {
      'pt-br': '/ferramentas/construtor-de-etiquetas',
      en: '/tools/label-builder',
      es: '/herramientas/constructor-de-etiquetas',
      zh: '/tools/label-builder'
    },
    '/tools/bulk-splitter': {
      'pt-br': '/ferramentas/divisor-de-etiquetas',
      en: '/tools/bulk-splitter',
      es: '/herramientas/divisor-de-etiquetas',
      zh: '/tools/bulk-splitter'
    },
    '/privacidade': {
      'pt-br': '/privacidade',
      en: '/privacy',
      es: '/privacidad',
      zh: '/privacy'
    },
    '/termos': {
      'pt-br': '/termos',
      en: '/terms',
      es: '/terminos',
      zh: '/terms'
    },
    '/sobre': {
      'pt-br': '/sobre',
      en: '/about',
      es: '/sobre',
      zh: '/about'
    },
    '/premium': {
      'pt-br': '/premium',
      en: '/premium',
      es: '/premium',
      zh: '/premium'
    },
    '/label-builder/acesso': {
      'pt-br': '/label-builder/acesso',
      en: '/label-builder/access',
      es: '/label-builder/acceso',
      zh: '/label-builder/access'
    }
  }
});

// Lightweight hooks and navigation APIs
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
