'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

const STORAGE_KEY = 'zplmaster_lb_email'
const BREVO_URL =
  'https://3bb4fd44.sibforms.com/serve/MUIFABgxn6BqO6LRnDxlg48pzflg7V4UEMzCAUSkoyzhNFIvho2tczGGwv9c-a92RmRSgb9_PzyJ-m8F0ZHvfj31zhwOIvzJVG73dNf9GJalYnc-JzevddJ_kunOoGTijviV-gRrGlSjl0DbsFonobS0cLPDSOBQPUeei1ZL5pSvrXOwrLZGPQTJOkw_kHfnwWcyhdyqZ_caMR6gHw=='

async function sendToBrevo(email: string) {
  const formData = new FormData()
  formData.append('EMAIL', email)
  formData.append('email_address_check', '')
  formData.append('locale', 'pt')
  await fetch(BREVO_URL, { method: 'POST', body: formData, mode: 'no-cors' }).catch(() => {})
}

export function LabelBuilderAccess() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'error'>('idle')
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('labelAccess')
  const toolUrl = `/${locale}/ferramentas/construtor-de-etiquetas`

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

    try {
      const res = await fetch('/api/label-builder/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.ok) {
        localStorage.setItem(STORAGE_KEY, email)
        sendToBrevo(email) // fire and forget
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
