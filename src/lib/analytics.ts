export function trackEvent(
  action: string,
  category: string,
  label?: string
) {
  if (typeof window === 'undefined') return
  if (!(window as any).gtag) return
  ;(window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
  })
}
