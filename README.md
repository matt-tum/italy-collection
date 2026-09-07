# Italien-Kollektion

Ein Reiseführer als installierbare Web-App für zwei Standquartiere:

| | Toskana | Südtirol |
| --- | --- | --- |
| Unterkunft | Casolare Le Terre Rosse, Loc. San Donato, San Gimignano | matill retreat, Hans-Pegger-Str. 6a, Latsch |
| Zeitraum | 13.–19. September 2026 | 19.–23. September 2026 |
| Volle Tage | Mo 14. bis Fr 18. | So 20. bis Di 22. |

Der Zweck ist eng gefasst: Die Frage „was machen wir heute?" soll in unter einer
Minute beantwortet sein, statt in vierzig Minuten Suchen auf dem Handy. Die App
ist deshalb kein Nachschlagewerk mit Volltextsuche, sondern ein
Entscheidungsfluss.

## Aufbau

| Ansicht | Zweck |
| --- | --- |
| **Heute** | Reisetag + Zeitbudget + Wetter + Verfassung des Kindes → gewichtete Vorschläge |
| **Karte** | Leaflet/OpenStreetMap, Standquartier und 15-km-Radius eingezeichnet |
| **Alles** | Vollständige Liste, gruppiert nach Kategorie oder nach Fahrzeit |
| **Merkliste** | Gemerkt und Erledigt, im Gerätespeicher |

### Kategorien und Ringe

`essen` · `kultur` · `kind` · `natur` — eine Adresse darf in mehreren stehen.
Die Entfernungsringe werden aus `driveMinutes` abgeleitet, nie doppelt
gespeichert: ≤ 15 Min · ≤ 60 Min · ≤ 90 Min ab dem jeweiligen Standquartier.

### Warum die Tagesauswahl

Das Reisefenster ist voll von Terminen, die genau daneben oder genau darauf
fallen. Ein Auszug aus dem, was die Recherche ergeben hat:

| Tag | Was das bedeutet |
| --- | --- |
| So 13.9. | Einziger Sonntag in der Toskana — der Archeodromo Poggibonsi öffnet nur sonntags 15–18 Uhr |
| Do 17.9. | Wochenmarkt San Gimignano, 8–13 Uhr auf allen drei Plätzen |
| Mo 21.9. | aquaprad und Churburg haben Ruhetag |
| Di 22.9. | Familientag im archeoParc Schnalstal |
| Mi 23.9. | Abreisetag — Schloss Juval hätte ohnehin Ruhetag |

Die Vorschläge filtern automatisch nach dem gewählten Reisetag, damit ihr nicht
vor einer verschlossenen Tür steht.

### Was die Recherche ausgeschlossen hat

Genauso wichtig wie die Treffer — damit ihr nicht danach sucht:

- **Törggelen** beginnt erst am ersten Samstag im Oktober. Ihr seid zwei Wochen
  zu früh. Buschen- und Hofschänke mit Marende gibt es trotzdem.
- **Transhumanz Schnalstal**, der UNESCO-Schafübertrieb, war am 12./13.
  September — da wart ihr noch in der Toskana.
- **Wochenmärkte im Vinschgau** liegen auf Donnerstag (Schlanders) und Freitag
  (Latsch). Beide fallen neben euren Aufenthalt von Samstag bis Mittwoch.
- **Partschinser Wasserfall** führt von April bis Juli das meiste Wasser. Ende
  September ist er ein Nebenziel, kein Hauptziel.
- **Parco Naturalistico Cavriglia** ist als Tierpark insolvent gegangen und hält
  keine Tiere mehr.
- **Schiefer Turm von Pisa**: Aufstieg erst ab acht Jahren.

## Technik

Vite + React + TypeScript, Leaflet für die Karte, `vite-plugin-pwa` für den
Offline-Betrieb. Kein Backend, kein Login, keine Tracker.

Offline heißt hier: App-Code und der komplette Datensatz liegen nach dem ersten
Aufruf auf dem Gerät. Kartenkacheln werden zusätzlich zwischengespeichert
(`CacheFirst`, 60 Tage) — jede Kachel, die einmal auf dem Bildschirm war, bleibt
ohne Netz verfügbar. Ein Gebiet, das nie angezeigt wurde, ist offline leer.
**Vor der Abreise einmal über beide Regionen zoomen**, dann funktioniert die
Karte auch im Val d'Orcia und in den Seitentälern ohne Empfang.

```bash
npm install
npm run dev        # lokaler Entwicklungsserver
npm run validate   # Datensatz prüfen
npm run build      # Produktionsbuild
```

## Datenpflege und Belegstand

Der Datensatz liegt als reines JSON in `src/data/pois.json`, das Schema in
`src/types.ts`. `npm run validate` prüft Pflichtfelder, Wertebereiche,
Koordinaten-Plausibilität und doppelte IDs — und läuft in CI vor jedem Deploy.

Zwei Felder tragen die Sorgfaltspflicht:

- **`sources`** — Beleg samt Prüfdatum für jede harte Angabe (Öffnungszeiten,
  Preis, Saison).
- **`verified`** — steht nur dann auf `true`, wenn Öffnungszeiten, Ruhetage oder
  Preise gegen eine benannte Quelle abgeglichen sind. Die App zeigt ungeprüfte
  Einträge sichtbar als solche an und stuft sie in der Sortierung leicht zurück.

**Grenze dieser Verifikation, offen gesagt:** Die Recherche lief über eine
Websuche. Ein direkter Abruf der Betreiberseiten war nicht möglich, weil die
Netzwerk-Policy dieser Arbeitsumgebung ausgehende Verbindungen blockiert. Die
`verified`-Einträge sind also gegen benannte Quellen abgeglichen, aber nicht am
selben Tag auf der Betreiberseite selbst nachgeschlagen. Öffnungszeiten in
Italien ändern sich saisonal und kurzfristig — der Datensatz ist eine
Vorauswahl, kein Ersatz für einen Blick auf die Website am Vorabend. Bei allem
mit `booking: pflicht` oder `empfohlen` gilt das doppelt.

### Koordinaten

`coordsExact: false` heißt: Die Koordinate ist auf den Ortskern geschätzt, nicht
auf die Hausadresse. Die App zeigt das an und schickt die Navigation dann als
Suche nach Name und Ort los, statt einen falschen Punkt anzusteuern.

## Stand

65 Ziele — 33 Toskana, 32 Vinschgau. 16 davon mit belegten Öffnungszeiten,
Preisen oder Saisonzeiten.

Offen:

- Zweiter Verifikationsdurchgang für die restlichen Einträge, sobald der
  direkte Seitenabruf möglich ist.
- Fahrzeiten sind Schätzungen. Für die Toskana ab San Donato eher großzügig
  gerechnet, weil die SP47 und die Straßen ins Chianti langsam sind.
