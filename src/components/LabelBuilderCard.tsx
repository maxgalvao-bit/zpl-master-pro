'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export function LabelBuilderCard() {
  const [hasAccess, setHasAccess] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    const email = localStorage.getItem('zplmaster_lb_email')
    setHasAccess(!!email)
  }, [])

  const href = hasAccess
    ? `/${locale}/ferramentas/construtor-de-etiquetas`
    : `/${locale}/label-builder/acesso`

  const ctaText = hasAccess
    ? 'Acessar Label Builder →'
    : 'Quero acesso gratuito →'

  return (
    <Link href={href} className="relative bg-slate-800 rounded-2xl
      p-5 border-2 border-green-500/50 flex flex-col gap-2
      hover:border-green-400 transition-colors">
      <div className="absolute top-0 right-0 bg-green-500
        text-slate-950 text-[9px] font-black px-3 py-1.5
        rounded-bl-lg rounded-tr-2xl">
        GRATUITO
      </div>
      <div className="text-2xl">🏷️</div>
      <span className="font-bold text-white">LABEL BUILDER</span>
      <span className="text-sm text-slate-400 italic">
        Crie etiquetas de transporte sem escrever ZPL.
        Múltiplos volumes, logo e exportação em lote.
      </span>
      <span className="text-xs text-green-400">
        Acesso gratuito enquanto durar a oferta
      </span>
      <span className="text-xs font-bold text-green-400
        border border-green-500/50 rounded px-2 py-1
        self-start mt-1">
        {ctaText}
      </span>
    </Link>
  )
}
