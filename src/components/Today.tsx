import { useMemo, useState } from 'react'
import type { Poi, Category } from '../types'
import { CATEGORY_LABEL } from '../types'
import { rank, BUDGET_LABEL, SKY_LABEL, MOOD_LABEL } from '../lib/plan'
import type { Budget, Sky, Mood } from '../lib/plan'
import { PoiCard } from './PoiCard'

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

interface Props {
  pois: Poi[]
  saved: string[]
  done: string[]
  onOpen: (poi: Poi) => void
}

export function Today({ pois, saved, done, onOpen }: Props) {
  const [budget, setBudget] = useState<Budget>('halb')
  const [sky, setSky] = useState<Sky>('sonne')
  const [mood, setMood] = useState<Mood>('fit')
  const [categories, setCategories] = useState<Category[]>([])

  const now = useMemo(() => new Date(), [])

  const results = useMemo(
    () =>
      rank(pois, {
        budget,
        sky,
        mood,
        categories,
        month: now.getMonth() + 1,
        weekday: WEEKDAYS[now.getDay()],
      }),
    [pois, budget, sky, mood, categories, now],
  )

  const toggleCategory = (c: Category) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  // Erledigte Ziele fallen ans Ende, statt zu verschwinden — manches macht man
  // gern zweimal.
  const ordered = [...results].sort(
    (a, b) => Number(done.includes(a.poi.id)) - Number(done.includes(b.poi.id)),
  )

  return (
    <div className="pad">
      <div>
        <h2 className="section-title">Wie viel Zeit?</h2>
        <div className="chips">
          {(Object.keys(BUDGET_LABEL) as Budget[]).map((b) => (
            <button key={b} className="chip" aria-pressed={budget === b} onClick={() => setBudget(b)}>
              {BUDGET_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title">Wetter</h2>
        <div className="chips">
          {(Object.keys(SKY_LABEL) as Sky[]).map((s) => (
            <button key={s} className="chip" aria-pressed={sky === s} onClick={() => setSky(s)}>
              {SKY_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title">Das Kind ist heute…</h2>
        <div className="chips">
          {(Object.keys(MOOD_LABEL) as Mood[]).map((m) => (
            <button key={m} className="chip" aria-pressed={mood === m} onClick={() => setMood(m)}>
              {MOOD_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title">Worauf habt ihr Lust? (optional)</h2>
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

      <div>
        <h2 className="section-title">Vorschläge</h2>
        {ordered.length === 0 ? (
          <p className="empty">
            Mit dieser Kombination passt nichts. Mehr Zeit einplanen oder eine Kategorie abwählen.
          </p>
        ) : (
          <div style={{ marginTop: 10 }}>
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
    </div>
  )
}
