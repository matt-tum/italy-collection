import { useMemo, useState } from 'react'
import type { BaseId, Poi } from './types'
import { BASES, baseById } from './data/bases'
import { POIS } from './data/pois'
import { useFavorites } from './lib/useFavorites'
import { Today } from './components/Today'
import { MapView } from './components/MapView'
import { Browse } from './components/Browse'
import { PoiCard } from './components/PoiCard'
import { PoiSheet } from './components/PoiSheet'

type Tab = 'heute' | 'karte' | 'liste' | 'merkliste'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'heute', label: 'Heute', icon: '🧭' },
  { id: 'karte', label: 'Karte', icon: '🗺' },
  { id: 'liste', label: 'Alles', icon: '☰' },
  { id: 'merkliste', label: 'Merkliste', icon: '★' },
]

export function App() {
  const [baseId, setBaseId] = useState<BaseId>('toscana')
  const [tab, setTab] = useState<Tab>('heute')
  const [open, setOpen] = useState<Poi | null>(null)
  const { saved, done, toggleSaved, toggleDone } = useFavorites()

  const base = baseById(baseId)
  const pois = useMemo(() => POIS.filter((p) => p.base === baseId), [baseId])
  const savedPois = useMemo(() => pois.filter((p) => saved.includes(p.id)), [pois, saved])

  return (
    <div className="app">
      <header className="top">
        <h1>Italien-Kollektion</h1>
        <div className="base-switch">
          {BASES.map((b) => (
            <button key={b.id} aria-pressed={baseId === b.id} onClick={() => setBaseId(b.id)}>
              {b.label}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        {tab === 'heute' && <Today base={base} pois={pois} saved={saved} done={done} onOpen={setOpen} />}
        {tab === 'karte' && <MapView base={base} pois={pois} onOpen={setOpen} />}
        {tab === 'liste' && <Browse pois={pois} saved={saved} done={done} onOpen={setOpen} />}
        {tab === 'merkliste' && (
          <div className="pad">
            <h2 className="section-title">Gemerkt</h2>
            {savedPois.length === 0 ? (
              <p className="empty">Noch nichts gemerkt. Auf einer Karte „Merken“ tippen.</p>
            ) : (
              <div style={{ marginTop: 10 }}>
                {savedPois.map((p) => (
                  <PoiCard
                    key={p.id}
                    poi={p}
                    saved
                    done={done.includes(p.id)}
                    onOpen={setOpen}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {open && (
        <PoiSheet
          poi={open}
          saved={saved.includes(open.id)}
          done={done.includes(open.id)}
          onToggleSaved={toggleSaved}
          onToggleDone={toggleDone}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}
