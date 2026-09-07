import type { Poi } from '../types'
import { CATEGORY_ICON } from '../types'
import { formatDuration } from '../lib/plan'

interface Props {
  poi: Poi
  reasons?: string[]
  totalMinutes?: number
  done?: boolean
  saved?: boolean
  onOpen: (poi: Poi) => void
}

export function PoiCard({ poi, reasons, totalMinutes, done, saved, onOpen }: Props) {
  return (
    <button className={`card${done ? ' done' : ''}`} onClick={() => onOpen(poi)}>
      <div className="card-head">
        <span className="card-emoji">{CATEGORY_ICON[poi.categories[0]]}</span>
        <h3>{poi.name}</h3>
        {saved && <span aria-label="gemerkt">★</span>}
      </div>
      <p>{poi.short}</p>
      <div className="meta">
        <span>
          <b>{poi.driveMinutes} Min</b> Fahrt
        </span>
        <span>
          Vor Ort <b>{formatDuration(poi.stayMinutes[0])}–{formatDuration(poi.stayMinutes[1])}</b>
        </span>
        {totalMinutes !== undefined && <span>Gesamt ca. {formatDuration(totalMinutes)}</span>}
        <span>Kind {'●'.repeat(poi.kid.rating)}{'○'.repeat(3 - poi.kid.rating)}</span>
      </div>
      {(reasons?.length || !poi.verified) && (
        <div className="reasons">
          {reasons?.map((r) => (
            <span className="reason" key={r}>
              {r}
            </span>
          ))}
          {!poi.verified && <span className="badge-unverified">ungeprüft</span>}
        </div>
      )}
    </button>
  )
}
