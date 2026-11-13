import { useEffect, useRef } from 'react'

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

type Handler = (event: KeyboardEvent) => void

/**
 * Global single-key shortcuts. Plain keys are ignored while typing or while
 * a dialog is open; modifier combos (Ctrl/Cmd+K) always fire.
 */
export function useHotkeys(bindings: Record<string, Handler>) {
  const ref = useRef(bindings)
  useEffect(() => {
    ref.current = bindings
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey) return
      const mod = event.metaKey || event.ctrlKey
      const combo = mod ? `mod+${event.key.toLowerCase()}` : event.key
      const handler = ref.current[combo]
      if (!handler) return
      if (!mod && (isTypingTarget(event.target) || document.querySelector('[role="dialog"]'))) return
      event.preventDefault()
      handler(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
