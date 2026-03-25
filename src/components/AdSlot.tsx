'use client'
import { useEffect } from 'react'

interface AdSlotProps {
  slot: string
  format?: 'auto' | 'fluid'
  layout?: 'in-article' | ''
  className?: string
}

export function AdSlot({ slot, format = 'auto', layout, className }: AdSlotProps) {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true'
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  useEffect(() => {
    if (!enabled) return
    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch (e) {}
  }, [enabled])

  if (!enabled) return null

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={{ display: layout === 'in-article' ? 'block' : 'block', textAlign: layout === 'in-article' ? 'center' : undefined }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout || undefined}
      data-full-width-responsive={format === 'auto' ? 'true' : undefined}
    />
  )
}
