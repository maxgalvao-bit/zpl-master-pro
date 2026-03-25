export async function trackServerEvent(
  event: string,
  count: number = 1
) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, count }),
    })
  } catch {}
}
