import { useMemo, useState } from 'react'
import type { Poi, Category, Base } from '../types'
import { CATEGORY_LABEL } from '../types'
import { daysOf } from '../data/bases'
import { rank, BUDGET_LABEL, SKY_LABEL, MOOD_LABEL } from '../lib/plan'
import type { Budget, Sky, Mood } from '../lib/plan'
import { PoiCard } from './PoiCard'

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function label(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}.9.`
}

interface Props {
  base: Base
  pois: Poi[]
  saved: string[]
  done: string[]
  onOpen: (poi: Poi) => void
}

export function Today({ base, pois, saved, done, onOpen }: Props) {
  const [budget, setBudget] = useState<Budget>('halb')
  const [sky, setSky] = useState<Sky>('sonne')
  const [mood, setMood] = useState<Mood>('fit')
  const [categories, setCategories] = useState<Category[]>([])
  // Die Vorschläge sollen ohne Scrollen sichtbar sein — die Einstellungen
  // liegen deshalb zusammengeklappt darüber.
  const [tuning, setTuning] = useState(false)

  const days = useMemo(() => daysOf(base), [base])
  const today = new Date().toISOString().slice(0, 10)
  const [day, setDay] = useState<string>(() => (days.includes(today) ? today : days[0]))
  const active = days.includes(day) ? day : days[0]

  const results = useMemo(() => {
    const d = new Date(`${active}T12:00:00Z`)
    return rank(pois, {
      budget,
      sky,
      mood,
      categories,
      month: d.getUTCMonth() + 1,
      weekday: WEEKDAYS[d.getUTCDay()],
    })
  }, [pois, budget, sky, mood, categories, active])

  const toggleCategory = (c: Category) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  // Erledigte Ziele fallen ans Ende, statt zu verschwinden.
  const ordered = [...results].sort(
    (a, b) => Number(done.includes(a.poi.id)) - Number(done.includes(b.poi.id)),
  )

  const summary = [
    BUDGET_LABEL[budget],
    SKY_LABEL[sky],
    MOOD_LABEL[mood],
    categories.length ? `${categories.length} Kategorien` : 'alle Kategorien',
  ].join(' · ')

  return (
    <div className="pad tight">
      <div className="rail" role="group" aria-label="Reisetag">
        {days.map((d) => (
          <button key={d} className="chip" aria-pressed={active === d} onClick={() => setDay(d)}>
            {label(d)}
          </button>
        ))}
      </div>

      <button className="tuner" aria-expanded={tuning} onClick={() => setTuning((v) => !v)}>
        <span>{summary}</span>
        <span aria-hidden>{tuning ? '▲' : '▼'}</span>
      </button>

      {tuning && (
        <div className="tuner-panel">
          <h2 className="section-title">Wie viel Zeit?</h2>
          <div className="chips">
            {(Object.keys(BUDGET_LABEL) as Budget[]).map((b) => (
              <button key={b} className="chip" aria-pressed={budget === b} onClick={() => setBudget(b)}>
                {BUDGET_LABEL[b]}
              </button>
            ))}
          </div>

          <h2 className="section-title">Wetter</h2>
          <div className="chips">
            {(Object.keys(SKY_LABEL) as Sky[]).map((s) => (
              <button key={s} className="chip" aria-pressed={sky === s} onClick={() => setSky(s)}>
                {SKY_LABEL[s]}
              </button>
            ))}
          </div>

          <h2 className="section-title">Das Kind ist heute…</h2>
          <div className="chips">
            {(Object.keys(MOOD_LABEL) as Mood[]).map((m) => (
              <button key={m} className="chip" aria-pressed={mood === m} onClick={() => setMood(m)}>
                {MOOD_LABEL[m]}
              </button>
            ))}
          </div>

          <h2 className="section-title">Worauf habt ihr Lust?</h2>
          <div className="chips">
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
              <button
                key={c}
                className="chip"
                aria-pressed={categories.includes(c)}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
      )}

      {ordered.length === 0 ? (
        <p className="empty">
          Für {label(active)} passt mit diesen Einstellungen nichts. Mehr Zeit einplanen oder eine
          Kategorie abwählen.
        </p>
      ) : (
        <div className="results">
          {ordered.slice(0, 8).map((r) => (
            <PoiCard
              key={r.poi.id}
              poi={r.poi}
              reasons={r.reasons}
              totalMinutes={r.totalMinutes}
              saved={saved.includes(r.poi.id)}
              done={done.includes(r.poi.id)}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  )
}
