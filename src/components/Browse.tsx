import { useState } from 'react'
import type { Poi, Category, Ring } from '../types'
import { CATEGORY_LABEL, RING_LABEL, ringOf } from '../types'
import { PoiCard } from './PoiCard'

type Axis = 'kategorie' | 'entfernung'

interface Props {
  pois: Poi[]
  saved: string[]
  done: string[]
  onOpen: (poi: Poi) => void
}

export function Browse({ pois, saved, done, onOpen }: Props) {
  const [axis, setAxis] = useState<Axis>('kategorie')

  const groups: { key: string; label: string; items: Poi[] }[] =
    axis === 'kategorie'
      ? (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({
          key: c,
          label: CATEGORY_LABEL[c],
          items: pois.filter((p) => p.categories.includes(c)),
        }))
      : (['t15', 't60', 't90'] as Ring[]).map((r) => ({
          key: r,
          label: RING_LABEL[r],
          items: pois.filter((p) => ringOf(p.driveMinutes) === r),
        }))

  return (
    <div className="pad">
      <div className="chips">
        <button className="chip" aria-pressed={axis === 'kategorie'} onClick={() => setAxis('kategorie')}>
          Nach Kategorie
        </button>
        <button className="chip" aria-pressed={axis === 'entfernung'} onClick={() => setAxis('entfernung')}>
          Nach Entfernung
        </button>
      </div>

      {groups.map((g) => (
        <div key={g.key}>
          <h2 className="section-title">
            {g.label} <span style={{ opacity: 0.6 }}>({g.items.length})</span>
          </h2>
          {g.items.length === 0 ? (
            <p className="lede" style={{ marginTop: 8 }}>
              Noch nichts erfasst.
            </p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {[...g.items]
                .sort((a, b) => a.driveMinutes - b.driveMinutes)
                .map((p) => (
                  <PoiCard
                    key={p.id}
                    poi={p}
                    saved={saved.includes(p.id)}
                    done={done.includes(p.id)}
                    onOpen={onOpen}
                  />
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
