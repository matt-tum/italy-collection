import { useCallback, useEffect, useState } from 'react'

const KEY = 'italien-merkliste-v1'

type Stored = { saved: string[]; done: string[] }

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { saved: [], done: [] }
    const parsed = JSON.parse(raw) as Partial<Stored>
    return { saved: parsed.saved ?? [], done: parsed.done ?? [] }
  } catch {
    // Privater Modus oder blockierter Speicher — die App muss trotzdem laufen.
    return { saved: [], done: [] }
  }
}

export function useFavorites() {
  const [state, setState] = useState<Stored>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignorieren: Merkliste ist Komfort, keine Voraussetzung */
    }
  }, [state])

  const toggleSaved = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
    }))
  }, [])

  const toggleDone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      done: s.done.includes(id) ? s.done.filter((x) => x !== id) : [...s.done, id],
    }))
  }, [])

  return { saved: state.saved, done: state.done, toggleSaved, toggleDone }
}
