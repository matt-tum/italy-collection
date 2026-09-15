/** The two places we sleep. Everything else is measured from one of them. */
export type BaseId = 'toscana' | 'suedtirol'

/** The four big buckets. A spot can sit in more than one. */
export type Category = 'essen' | 'kultur' | 'kind' | 'natur' | 'mode'

/**
 * Distance rings, as requested: on the doorstep, a morning out, a day trip.
 * Derived from driveMinutes — never stored twice.
 */
export type Ring = 't15' | 't60' | 't90'

/** Free-form facets used for filtering and for the "today" scoring. */
export type Tag =
  | 'tiere'
  | 'spielplatz'
  | 'wasser'
  | 'gelato'
  | 'markt'
  | 'aussicht'
  | 'wanderung'
  | 'bergbahn'
  | 'weingut'
  | 'handwerk'
  | 'museum'
  | 'kirche'
  | 'ruine'
  | 'therme'
  | 'seilbahn-kinderwagen'
  | 'schlechtwetter'
  | 'abendessen'
  | 'mittagessen'
  | 'fruehstueck'
  | 'zum-mitnehmen'
  | 'vegetarisch'
  | 'vegan'

export type Weather = 'indoor' | 'outdoor' | 'beides'

export type Booking = 'nein' | 'empfohlen' | 'pflicht'

/** How well a 2–3 year old copes. Deliberately blunt. */
export interface KidFit {
  /** 3 = das Kind ist der Hauptgrund hinzufahren; 2 = geht gut mit; 1 = nur mit Timing/Trick. */
  rating: 1 | 2 | 3
  /** Der ehrliche Satz dazu — was konkret gut geht und was nicht. */
  notes: string
  stroller: 'ja' | 'schwierig' | 'nein'
  /** Wickelmöglichkeit bekannt vorhanden? undefined = ungeprüft. */
  changing?: boolean
}

export interface SourceRef {
  label: string
  url: string
  /** ISO date the claim was last checked against this source. */
  checked: string
}

export interface Poi {
  id: string
  name: string
  base: BaseId
  lat: number
  lng: number
  town: string
  /**
   * false = Koordinate ist auf den Ortskern geschätzt, nicht auf die Adresse.
   * Die Navigation sucht dann nach Name und Ort statt einen Punkt anzusteuern.
   */
  coordsExact: boolean
  categories: Category[]
  tags: Tag[]
  /** Realistic door-to-door driving time from the base, in minutes. */
  driveMinutes: number
  /** One line. What it is and why it beats the alternative. */
  short: string
  /** The honest paragraph: what you actually do there, and the catch. */
  why: string
  kid: KidFit
  /** Sinnvolle Aufenthaltsdauer vor Ort, in Minuten. */
  stayMinutes: [number, number]
  weather: Weather
  booking: Booking
  /** Öffnungszeiten / Saison im Klartext. Leer = ganzjährig frei zugänglich. */
  hours?: string
  /** Wochentage, an denen zu ist, z.B. ['Mo']. */
  closedDays?: string[]
  /** Monate, in denen es geschlossen ist (1–12). */
  closedMonths?: number[]
  /**
   * Nur für Veranstaltungen: die exakten Tage, an denen es stattfindet.
   * Ist das Feld gesetzt, zählt der Eintrag an keinem anderen Datum — ein Fest
   * mit Monatsangabe allein würde sonst auch nach seinem Ende vorgeschlagen.
   */
  dates?: string[]
  price?: string
  parking?: string
  /** Beste Tageszeit — z.B. wegen Licht, Andrang oder Mittagspause. */
  bestTime?: string
  links?: SourceRef[]
  /** Belege. Ein Eintrag ohne Quelle gilt als ungeprüft. */
  sources: SourceRef[]
  /** true, sobald jede harte Angabe (Zeiten, Preis, Saison) belegt ist. */
  verified: boolean
}

export interface Base {
  id: BaseId
  label: string
  /** Hotelname, sobald bekannt. */
  accommodation?: string
  lat: number
  lng: number
  from: string
  to: string
  blurb: string
}

export function ringOf(driveMinutes: number): Ring {
  if (driveMinutes <= 15) return 't15'
  if (driveMinutes <= 60) return 't60'
  return 't90'
}

export const RING_LABEL: Record<Ring, string> = {
  t15: 'Vor der Haustür (≤ 15 Min)',
  t60: 'Halber Tag (≤ 1 Std)',
  t90: 'Tagesausflug (≤ 1,5 Std)',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  essen: 'Essen & Trinken',
  kultur: 'Kunst, Kultur & Geschichte',
  kind: 'Mit dem Kind',
  natur: 'Natur & Aussicht',
  mode: 'Mode & Handwerk',
}

export const CATEGORY_ICON: Record<Category, string> = {
  essen: '🍝',
  kultur: '🏛',
  kind: '🧸',
  natur: '⛰',
  mode: '🧵',
}
