export function setStatus(message: string, state: 'info' | 'error' = 'info'): void {
  if (typeof document === 'undefined') return
  const el = document.getElementById('status')
  if (!el) return
  el.textContent = message
  el.setAttribute('data-state', state)
}
