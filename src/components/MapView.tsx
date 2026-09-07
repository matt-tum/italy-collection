import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import type { Base, Poi } from '../types'
import { CATEGORY_ICON } from '../types'

function pin(emoji: string) {
  return divIcon({
    className: '',
    html: `<div class="map-pin"><span>${emoji}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

const HOME = pin('🏠')

/** Zentriert neu, wenn zwischen Toskana und Südtirol gewechselt wird. */
function Recenter({ base }: { base: Base }) {
  const map = useMap()
  useEffect(() => {
    map.setView([base.lat, base.lng], 10)
  }, [base, map])
  return null
}

interface Props {
  base: Base
  pois: Poi[]
  onOpen: (poi: Poi) => void
}

export function MapView({ base, pois, onOpen }: Props) {
  return (
    <div className="map-shell">
      <div className="map-wrap">
        <MapContainer center={[base.lat, base.lng]} zoom={10} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <Recenter base={base} />
          {/* Grober Radius-Anhalt: ~15 km entspricht hier etwa 15 Fahrminuten. */}
          <Circle
            center={[base.lat, base.lng]}
            radius={15000}
            pathOptions={{ color: '#7a2e2e', weight: 1, fillOpacity: 0.04 }}
          />
          <Marker position={[base.lat, base.lng]} icon={HOME} />
          {pois.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={pin(CATEGORY_ICON[p.categories[0]])}
              eventHandlers={{ click: () => onOpen(p) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
