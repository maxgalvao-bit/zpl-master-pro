import { trackServerEvent } from './trackEvent'

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  count: number = 1
) {
  if (typeof window === 'undefined') return
  if ((window as any).gtag) {
    ;(window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    })
  }
  trackServerEvent(action, count)
}
