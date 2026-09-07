import type { Poi } from '../types'
import raw from './pois.json'

/**
 * Der Datensatz liegt bewusst als reines JSON vor: er wird durch Recherche
 * gepflegt, wächst auf dreistellige Einträge und wird von
 * `scripts/validate-data.mjs` unabhängig vom Code geprüft.
 */
export const POIS = raw as unknown as Poi[]
