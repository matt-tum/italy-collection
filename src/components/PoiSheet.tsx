import type { Poi } from '../types'
import { CATEGORY_LABEL } from '../types'
import { formatDuration } from '../lib/plan'

interface Props {
  poi: Poi
  saved: boolean
  done: boolean
  onToggleSaved: (id: string) => void
  onToggleDone: (id: string) => void
  onClose: () => void
}

const BOOKING_TEXT = {
  nein: 'Nicht nötig — einfach hinfahren',
  empfohlen: 'Reservierung empfohlen',
  pflicht: 'Nur mit Reservierung',
} as const

const WEATHER_TEXT = {
  indoor: 'Drinnen',
  outdoor: 'Draußen — nur bei gutem Wetter',
  beides: 'Drinnen und draußen',
} as const

const STROLLER_TEXT = {
  ja: 'Kinderwagen kein Problem',
  schwierig: 'Kinderwagen geht, ist aber mühsam',
  nein: 'Nur mit Trage',
} as const

export function PoiSheet({ poi, saved, done, onToggleSaved, onToggleDone, onClose }: Props) {
  // Bei geschätzten Koordinaten führt ein Zielpunkt in die Irre — dann lieber
  // nach Name und Ort suchen lassen.
  const maps = poi.coordsExact
    ? `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name}, ${poi.town}`)}`

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <p className="town">
          {poi.town} · {poi.driveMinutes} Min Fahrt
          {!poi.coordsExact && ' · Position ungefähr'}
        </p>
        <h2>{poi.name}</h2>
        <p className="why">{poi.why}</p>

        <dl className="facts">
          <div className="fact">
            <dt>Kategorie</dt>
            <dd>{poi.categories.map((c) => CATEGORY_LABEL[c]).join(' · ')}</dd>
          </div>
          <div className="fact">
            <dt>Mit dem Kind</dt>
            <dd>
              {poi.kid.notes}
              <br />
              {STROLLER_TEXT[poi.kid.stroller]}
              {poi.kid.changing === true && ' · Wickelmöglichkeit vorhanden'}
            </dd>
          </div>
          <div className="fact">
            <dt>Dauer</dt>
            <dd>
              {formatDuration(poi.stayMinutes[0])} bis {formatDuration(poi.stayMinutes[1])}
            </dd>
          </div>
          <div className="fact">
            <dt>Wetter</dt>
            <dd>{WEATHER_TEXT[poi.weather]}</dd>
          </div>
          {poi.hours && (
            <div className="fact">
              <dt>Geöffnet</dt>
              <dd>{poi.hours}</dd>
            </div>
          )}
          {poi.closedDays?.length && (
            <div className="fact">
              <dt>Ruhetag</dt>
              <dd>{poi.closedDays.join(', ')}</dd>
            </div>
          )}
          {poi.price && (
            <div className="fact">
              <dt>Kosten</dt>
              <dd>{poi.price}</dd>
            </div>
          )}
          <div className="fact">
            <dt>Reservieren</dt>
            <dd>{BOOKING_TEXT[poi.booking]}</dd>
          </div>
          {poi.parking && (
            <div className="fact">
              <dt>Parken</dt>
              <dd>{poi.parking}</dd>
            </div>
          )}
          {poi.bestTime && (
            <div className="fact">
              <dt>Beste Zeit</dt>
              <dd>{poi.bestTime}</dd>
            </div>
          )}
        </dl>

        <div className="sheet-actions">
          <a className="btn primary" href={maps} target="_blank" rel="noreferrer">
            Navigation
          </a>
          <button className="btn" onClick={() => onToggleSaved(poi.id)}>
            {saved ? '★ Gemerkt' : '☆ Merken'}
          </button>
          <button className="btn" onClick={() => onToggleDone(poi.id)}>
            {done ? '✓ Erledigt' : 'Erledigt'}
          </button>
        </div>

        <div className="sources">
          {poi.sources.length > 0 ? (
            <>
              Belege:{' '}
              {poi.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ' · '}
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>{' '}
                  ({s.checked})
                </span>
              ))}
            </>
          ) : (
            <>Noch keine Quellen hinterlegt — Angaben vor der Fahrt selbst prüfen.</>
          )}
        </div>
      </div>
    </div>
  )
}
