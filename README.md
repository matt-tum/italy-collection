# Italien-Kollektion

Ein Reiseführer als installierbare Web-App für zwei Standquartiere: sechs Tage
Toskana bei San Gimignano, danach fünf Tage Südtirol.

Der Zweck ist eng gefasst: die Frage „was machen wir heute?" soll im Urlaub in
unter einer Minute beantwortet sein, statt in vierzig Minuten Suchen auf dem
Handy. Die App ist deshalb kein Nachschlagewerk mit Volltextsuche, sondern ein
Entscheidungsfluss.

## Aufbau

| Ansicht | Zweck |
| --- | --- |
| **Heute** | Zeitbudget + Wetter + Verfassung des Kindes → gewichtete Vorschläge |
| **Karte** | Leaflet/OpenStreetMap, Standquartier und Radius eingezeichnet |
| **Alles** | Vollständige Liste, gruppiert nach Kategorie oder nach Fahrzeit |
| **Merkliste** | Gemerkt und Erledigt, im Gerätespeicher |

### Kategorien

`essen` · `kultur` · `kind` · `natur` — eine Adresse darf in mehreren stehen.

### Entfernungsringe

Werden aus `driveMinutes` abgeleitet, nie doppelt gespeichert:
≤ 15 Min · ≤ 60 Min · ≤ 90 Min, jeweils ab dem jeweiligen Standquartier.

## Technik

Vite + React + TypeScript, Leaflet für die Karte, `vite-plugin-pwa` für den
Offline-Betrieb. Kein Backend, kein Login, keine Tracker.

Offline heißt hier: App-Code und der komplette Datensatz liegen nach dem ersten
Aufruf auf dem Gerät. Kartenkacheln werden zusätzlich zwischengespeichert
(`CacheFirst`, 60 Tage) — jede Kachel, die einmal auf dem Bildschirm war,
bleibt ohne Netz verfügbar. Ein Gebiet, das nie angezeigt wurde, ist offline
leer. Vor der Abreise einmal über beide Regionen zoomen.

```bash
npm install
npm run dev        # lokaler Entwicklungsserver
npm run validate   # Datensatz prüfen
npm run build      # Produktionsbuild
```

## Datenpflege

Der Datensatz liegt als reines JSON in `src/data/pois.json`, das Schema in
`src/types.ts`. `npm run validate` prüft Pflichtfelder, Wertebereiche,
Koordinaten-Plausibilität und doppelte IDs — und läuft in CI vor jedem Deploy.

Zwei Felder tragen die Sorgfaltspflicht:

- **`sources`** — Beleg samt Prüfdatum für jede harte Angabe
  (Öffnungszeiten, Preis, Saison).
- **`verified`** — steht erst auf `true`, wenn diese Angaben belegt sind. Die
  App zeigt ungeprüfte Einträge sichtbar als solche an, und die Sortierung
  stuft sie leicht zurück.

Öffnungszeiten in Italien ändern sich saisonal und kurzfristig. Der Datensatz
ist eine Vorauswahl, kein Ersatz für einen Blick auf die Website am Vorabend.

## Stand

Das Gerüst steht und baut. `src/data/pois.json` enthält bisher nur fünf
Platzhalter aus dem Gerüstbau, alle auf `verified: false`. Die eigentliche
Recherche ersetzt sie.

Offen:

- Beide Hoteladressen — davon hängen alle Fahrzeiten und die Kartenmitte ab.
- Die Südtiroler Region. Meran, Bozen, das Eisacktal und das Pustertal haben
  praktisch keine gemeinsame Schnittmenge an Ausflugszielen.
- Der Reisezeitraum. Er entscheidet über Bergbahnen, Almen, Törggelen,
  Olivenernte und die halbe Liste der Öffnungszeiten.
