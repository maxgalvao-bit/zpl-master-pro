'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'

const STORAGE_KEY = 'zplmaster_lb_email'

export function LabelBuilderAccess() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'error'>('idle')
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('labelAccess')
  const toolUrl = `/${locale}/ferramentas/construtor-de-etiquetas`

  // Carregar reCAPTCHA v3
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  // Verificar localStorage ao carregar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      fetch('/api/label-builder/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: saved }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok) router.replace(toolUrl)
        })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('loading')

    let recaptchaToken = ''

    try {
      const grecaptcha = (window as any).grecaptcha
      if (grecaptcha?.ready && grecaptcha?.execute) {
        recaptchaToken = await Promise.race([
          new Promise<string>((resolve) => {
            grecaptcha.ready(() => {
              grecaptcha
                .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'register' })
                .then(resolve)
                .catch(() => resolve(''))
            })
          }),
          // Timeout de 3 segundos — se demorar, continua sem token
          new Promise<string>((resolve) => setTimeout(() => resolve(''), 3000)),
        ])
      }
    } catch {
      recaptchaToken = ''
    }

    // Sempre chega aqui independente do reCAPTCHA
    try {
      const res = await fetch('/api/label-builder/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      })
      const data = await res.json()

      if (data.ok) {
        localStorage.setItem(STORAGE_KEY, email)
        trackEvent('lb_registered', 'label_builder')
        router.push(toolUrl)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <span className="inline-block bg-green-900 text-green-400
            text-xs font-bold px-3 py-1 rounded-full mb-4">
            {t('badge')}
          </span>
          <h1 className="text-2xl font-bold text-white mb-3">
            {t('title')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t('desc')}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700
          rounded-xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900
                  border border-slate-600 text-white placeholder-slate-500
                  focus:outline-none focus:border-yellow-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400
                text-slate-900 font-bold rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? t('loading') : t('button')}
            </button>

            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">
                {t('error')}
              </p>
            )}
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            {t('privacy')}{' '}
            <a href={`/${locale}/privacidade`}
              className="text-slate-400 underline">
              política de privacidade
            </a>.
          </p>
        </div>

        <p className="text-center mt-4">
          <a href={`/${locale}`}
            className="text-sm text-slate-500 hover:text-slate-300">
            {t('back')}
          </a>
        </p>

      </div>
    </main>
  )
}
