import { useCallback, useState } from 'react'

/**
 * State that survives a reload. Storage can throw (private windows, blocked
 * site data), so every access is guarded and the default is used instead.
 */
export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* nothing to do — the value still lives in memory for this session */
      }
    },
    [key],
  )

  return [value, set] as const
}
