import type { Base } from '../types'

/**
 * Die zwei Standquartiere. Alle Fahrzeiten in pois.json sind von genau diesen
 * Punkten aus geschätzt.
 */
export const BASES: Base[] = [
  {
    id: 'toscana',
    label: 'Toskana',
    accommodation: 'Casolare Le Terre Rosse, Località San Donato, San Gimignano (SI)',
    lat: 43.43887,
    lng: 11.01636,
    from: '2026-09-13',
    to: '2026-09-19',
    blurb:
      'Sechs Nächte vier Kilometer südwestlich von San Gimignano. Volterra, Certaldo und ' +
      'Colle liegen unter 40 Minuten, Siena und das Chianti unter einer Stunde.',
  },
  {
    id: 'suedtirol',
    label: 'Südtirol',
    accommodation: 'matill – timeless boutique retreat, Hans-Pegger-Straße 6a, Latsch (BZ)',
    lat: 46.617,
    lng: 10.863,
    from: '2026-09-19',
    to: '2026-09-23',
    blurb:
      'Vier Nächte mitten in Latsch im Vinschgau. Die Seilbahn liegt einen Kilometer entfernt, ' +
      'der Bahnhof drei Minuten, Meran und das Schnalstal unter 45 Minuten.',
  },
]

export function baseById(id: string): Base {
  const found = BASES.find((b) => b.id === id)
  if (!found) throw new Error(`Unbekanntes Standquartier: ${id}`)
  return found
}

/** Alle Tage eines Aufenthalts als ISO-Datum, Anreise- und Abreisetag inklusive. */
export function daysOf(base: Base): string[] {
  const out: string[] = []
  const end = new Date(`${base.to}T12:00:00Z`)
  for (let d = new Date(`${base.from}T12:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
