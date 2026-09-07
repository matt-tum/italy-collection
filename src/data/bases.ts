import type { Base } from '../types'

/**
 * Die zwei Standquartiere. Alle Fahrzeiten in pois.ts sind von genau diesen
 * Punkten aus gerechnet — sobald die Hoteladressen feststehen, hier die
 * Koordinaten korrigieren und die Fahrzeiten nachziehen.
 */
export const BASES: Base[] = [
  {
    id: 'toscana',
    label: 'Toskana',
    // TODO: Hotelkoordinaten eintragen. Bis dahin: Ortsmitte San Gimignano.
    lat: 43.4677,
    lng: 11.0431,
    from: '',
    to: '',
    blurb:
      'Sechs Tage bei San Gimignano. Alles zwischen Volterra, Siena und dem Chianti liegt in einer Stunde.',
  },
  {
    id: 'suedtirol',
    label: 'Südtirol',
    // TODO: Region und Hotel stehen noch aus. Platzhalter: Bozen.
    lat: 46.4983,
    lng: 11.3548,
    from: '',
    to: '',
    blurb: 'Fünf Tage in Südtirol. Region steht noch nicht fest.',
  },
]

export function baseById(id: string): Base {
  const found = BASES.find((b) => b.id === id)
  if (!found) throw new Error(`Unbekanntes Standquartier: ${id}`)
  return found
}
