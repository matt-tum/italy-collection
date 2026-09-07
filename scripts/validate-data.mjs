#!/usr/bin/env node
// Qualitätsschranke für den Datensatz. Läuft ohne Build und ohne TypeScript,
// damit die Recherche-Einträge geprüft werden können, bevor sie eingecheckt
// werden. Fehler brechen ab, Warnungen sind Hinweise auf offene Recherche.
import { readFileSync } from 'node:fs'

const pois = JSON.parse(readFileSync(new URL('../src/data/pois.json', import.meta.url), 'utf8'))

const CATEGORIES = ['essen', 'kultur', 'kind', 'natur']
const WEATHER = ['indoor', 'outdoor', 'beides']
const BOOKING = ['nein', 'empfohlen', 'pflicht']
const STROLLER = ['ja', 'schwierig', 'nein']
const BASES = ['toscana', 'suedtirol']
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Grobe Plausibilitätsfenster: Italien nördlich von Rom.
const BOX = { latMin: 42.0, latMax: 47.2, lngMin: 9.5, lngMax: 12.7 }

const errors = []
const warnings = []
const seen = new Set()

function req(cond, id, msg) {
  if (!cond) errors.push(`${id}: ${msg}`)
}

for (const p of pois) {
  const id = p.id ?? '(ohne id)'
  req(typeof p.id === 'string' && p.id.length > 0, id, 'id fehlt')
  req(!seen.has(p.id), id, 'id doppelt vergeben')
  seen.add(p.id)

  req(typeof p.name === 'string' && p.name.length > 2, id, 'name fehlt')
  req(BASES.includes(p.base), id, `base muss eines von ${BASES.join('|')} sein`)
  req(typeof p.town === 'string' && p.town.length > 0, id, 'town fehlt')
  req(typeof p.coordsExact === 'boolean', id, 'coordsExact fehlt')

  req(
    typeof p.lat === 'number' && p.lat >= BOX.latMin && p.lat <= BOX.latMax,
    id,
    `lat ${p.lat} liegt außerhalb des plausiblen Bereichs`,
  )
  req(
    typeof p.lng === 'number' && p.lng >= BOX.lngMin && p.lng <= BOX.lngMax,
    id,
    `lng ${p.lng} liegt außerhalb des plausiblen Bereichs`,
  )

  req(Array.isArray(p.categories) && p.categories.length > 0, id, 'mindestens eine Kategorie nötig')
  for (const c of p.categories ?? []) req(CATEGORIES.includes(c), id, `unbekannte Kategorie "${c}"`)

  req(Number.isFinite(p.driveMinutes) && p.driveMinutes >= 0, id, 'driveMinutes fehlt')
  req(p.driveMinutes <= 95, id, `driveMinutes ${p.driveMinutes} sprengt den 1,5-Stunden-Radius`)

  req(typeof p.short === 'string' && p.short.length > 10, id, 'short zu kurz')
  req(typeof p.why === 'string' && p.why.length > 20, id, 'why zu kurz')

  req(p.kid && [1, 2, 3].includes(p.kid.rating), id, 'kid.rating muss 1, 2 oder 3 sein')
  req(p.kid && typeof p.kid.notes === 'string' && p.kid.notes.length > 5, id, 'kid.notes fehlt')
  req(p.kid && STROLLER.includes(p.kid.stroller), id, 'kid.stroller ungültig')

  req(
    Array.isArray(p.stayMinutes) && p.stayMinutes.length === 2 && p.stayMinutes[0] <= p.stayMinutes[1],
    id,
    'stayMinutes muss [min, max] sein',
  )

  req(WEATHER.includes(p.weather), id, 'weather ungültig')
  req(BOOKING.includes(p.booking), id, 'booking ungültig')

  for (const d of p.closedDays ?? []) req(WEEKDAYS.includes(d), id, `closedDays: "${d}" ist kein Wochentagskürzel`)
  for (const m of p.closedMonths ?? []) req(m >= 1 && m <= 12, id, `closedMonths: ${m} ist kein Monat`)

  req(Array.isArray(p.sources), id, 'sources fehlt (leeres Array ist erlaubt)')
  for (const s of p.sources ?? []) {
    req(typeof s.url === 'string' && s.url.startsWith('http'), id, 'Quelle ohne gültige URL')
    req(/^\d{4}-\d{2}-\d{2}$/.test(s.checked ?? ''), id, `Quelle "${s.label}" ohne Prüfdatum (YYYY-MM-DD)`)
  }

  if (p.verified && (p.sources ?? []).length === 0) {
    errors.push(`${id}: als verified markiert, aber ohne Quelle`)
  }
  if (!p.verified) warnings.push(`${id}: noch ungeprüft`)
  if (p.verified && !p.hours && p.weather !== 'outdoor') {
    warnings.push(`${id}: verified, aber keine Öffnungszeiten hinterlegt`)
  }
}

const byBase = Object.fromEntries(BASES.map((b) => [b, pois.filter((p) => p.base === b).length]))
const verified = pois.filter((p) => p.verified).length

console.log(`${pois.length} Einträge — Toskana ${byBase.toscana}, Südtirol ${byBase.suedtirol}`)
console.log(`geprüft: ${verified}/${pois.length}`)

for (const w of warnings) console.log(`  Hinweis  ${w}`)
for (const e of errors) console.error(`  FEHLER   ${e}`)

if (errors.length) {
  console.error(`\n${errors.length} Fehler — Datensatz nicht gültig.`)
  process.exit(1)
}
console.log('\nDatensatz gültig.')
