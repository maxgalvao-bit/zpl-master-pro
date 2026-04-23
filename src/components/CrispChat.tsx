'use client'
import { useEffect } from 'react'

export function CrispChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    w.$crisp = []
    w.CRISP_WEBSITE_ID = 'c711697a-66b1-4ee6-844f-bee8161568fb'

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      delete w.$crisp
      delete w.CRISP_WEBSITE_ID
    }
  }, [])

  return null
}
