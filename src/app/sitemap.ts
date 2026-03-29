import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zplmaster.com'
  const locales = ['pt-br', 'en', 'es', 'zh']

  const routes = [
    '',
    '/ferramentas/conversor-zpl-para-pdf',
    '/ferramentas/corrigir-etiqueta-shopee',
    '/ferramentas/validador-de-sintaxe-zpl',
    '/ferramentas/divisor-de-etiquetas',
    '/ferramentas/construtor-de-etiquetas',
    '/premium',
    '/privacidade',
    '/termos',
  ]

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      })
    }
  }

  return entries
}
