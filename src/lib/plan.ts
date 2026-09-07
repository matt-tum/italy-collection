import type { Poi, Category } from '../types'

/** Wie viel Zeit haben wir heute? */
export type Budget = 'kurz' | 'halb' | 'ganz'
/** Was macht das Wetter? */
export type Sky = 'sonne' | 'wechsel' | 'regen'
/** In welcher Verfassung ist das Kind? */
export type Mood = 'fit' | 'quengelig' | 'autoschlaf'

export interface Ask {
  budget: Budget
  sky: Sky
  mood: Mood
  categories: Category[]
  /** Monat 1–12, für Saison-Filter. */
  month: number
  /** Wochentag als Kürzel, für Ruhetage. */
  weekday: string
}

export const BUDGET_LABEL: Record<Budget, string> = {
  kurz: 'Ein paar Stunden',
  halb: 'Halber Tag',
  ganz: 'Ganzer Tag',
}

export const SKY_LABEL: Record<Sky, string> = {
  sonne: 'Sonne',
  wechsel: 'Wechselhaft',
  regen: 'Regen',
}

export const MOOD_LABEL: Record<Mood, string> = {
  fit: 'Ausgeschlafen',
  quengelig: 'Kurze Zündschnur',
  autoschlaf: 'Schläft im Auto',
}

/** Obergrenze für die einfache Fahrt, in Minuten. */
const MAX_DRIVE: Record<Budget, number> = { kurz: 20, halb: 60, ganz: 95 }
/** Obergrenze für Hin + Aufenthalt + Zurück, in Minuten. */
const MAX_TOTAL: Record<Budget, number> = { kurz: 165, halb: 330, ganz: 600 }

export interface Scored {
  poi: Poi
  score: number
  /** Warum dieser Vorschlag heute passt — wird in der Karte angezeigt. */
  reasons: string[]
  /** Grobe Gesamtdauer inkl. Fahrt, in Minuten. */
  totalMinutes: number
}

function seasonOpen(poi: Poi, month: number): boolean {
  return !poi.closedMonths?.includes(month)
}

function dayOpen(poi: Poi, weekday: string): boolean {
  return !poi.closedDays?.includes(weekday)
}

function weatherOk(poi: Poi, sky: Sky): boolean {
  if (sky === 'regen') return poi.weather !== 'outdoor'
  return true
}

export function rank(pois: Poi[], ask: Ask): Scored[] {
  const maxDrive = ask.mood === 'quengelig' ? Math.min(MAX_DRIVE[ask.budget], 35) : MAX_DRIVE[ask.budget]

  return pois
    .filter((p) => p.driveMinutes <= maxDrive)
    .filter((p) => seasonOpen(p, ask.month) && dayOpen(p, ask.weekday) && weatherOk(p, ask.sky))
    .filter((p) => ask.categories.length === 0 || p.categories.some((c) => ask.categories.includes(c)))
    .map((p): Scored | null => {
      const stay = (p.stayMinutes[0] + p.stayMinutes[1]) / 2
      const total = p.driveMinutes * 2 + stay
      if (total > MAX_TOTAL[ask.budget]) return null

      let score = 0
      const reasons: string[] = []

      // Kind-Verfassung ist das schärfste Kriterium — daran scheitert ein
      // Ausflug schneller als am Wetter.
      if (ask.mood === 'quengelig') {
        if (p.kid.rating === 3) { score += 40; reasons.push('Das Kind ist hier der Hauptgrund') }
        else if (p.kid.rating === 2) score += 12
        else score -= 30
        if (p.tags.some((t) => t === 'tiere' || t === 'spielplatz' || t === 'wasser')) {
          score += 20; reasons.push('Tiere/Spielen direkt vor Ort')
        }
        if (p.tags.includes('gelato')) score += 8
        if (p.driveMinutes <= 15) { score += 12; reasons.push('Kurze Fahrt') }
      }
      if (ask.mood === 'autoschlaf') {
        // Längere Fahrt ist jetzt ein Vorteil, nicht ein Preis.
        if (p.driveMinutes >= 35) { score += 22; reasons.push('Fahrtzeit deckt den Mittagsschlaf ab') }
        if (p.categories.includes('kultur')) { score += 18; reasons.push('Etwas für euch beide') }
        if (p.kid.rating === 1) score += 6
      }
      if (ask.mood === 'fit') {
        if (p.tags.includes('wanderung')) { score += 18; reasons.push('Genug Energie zum Laufen') }
        if (p.kid.rating >= 2) score += 10
        if (p.stayMinutes[1] >= 120) score += 6
      }

      if (ask.sky === 'regen' && p.weather === 'indoor') { score += 25; reasons.push('Komplett im Trockenen') }
      if (ask.sky === 'sonne' && p.weather === 'outdoor') { score += 15; reasons.push('Lohnt sich nur bei gutem Wetter') }
      if (ask.sky === 'wechsel' && p.weather === 'beides') { score += 10; reasons.push('Funktioniert bei jedem Wetter') }

      // Das Zeitbudget soll ausgefüllt, nicht gesprengt werden.
      const fit = 1 - Math.abs(total - MAX_TOTAL[ask.budget] * 0.7) / MAX_TOTAL[ask.budget]
      score += fit * 18

      if (p.booking === 'pflicht') { score -= 10; reasons.push('Vorher reservieren') }
      if (!p.verified) score -= 5

      // Stabile Reihenfolge bei Gleichstand, damit die Liste nicht springt.
      score += (p.id.charCodeAt(0) % 7) * 0.01

      return { poi: p, score, reasons: reasons.slice(0, 3), totalMinutes: Math.round(total) }
    })
    .filter((s): s is Scored => s !== null)
    .sort((a, b) => b.score - a.score)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} Min`
  if (m === 0) return `${h} Std`
  return `${h} Std ${m} Min`
}
