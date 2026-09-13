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

## Deployment

Zwei Wege, beide aus demselben Stand gebaut.

### GitLab Pages

`.gitlab-ci.yml` enthält einen `pages`-Job, der auf dem Standardbranch läuft.
Zwei Dinge daran sind kein Zufall:

- **Die statischen Quelldateien liegen in `static/`, nicht in `public/`.** GitLab
  Pages verlangt das Bauergebnis in einem Verzeichnis namens `public`; hieße
  auch Vites Asset-Verzeichnis so, würden sich beide überschreiben.
- **Der Basispfad wird aus `CI_PAGES_URL` abgeleitet, nicht geraten.** Mit
  aktivierter eindeutiger Domain serviert GitLab unter `/`, ohne sie unter
  `/reiseplaner-app/`. Ein falscher Basispfad lädt weder das Skript noch den
  Service Worker, und die Seite bleibt weiß.

Einzurichten:

1. Den Branch nach GitLab pushen und dort als Standardbranch setzen
   (Settings → Repository → Branch defaults).
2. Deploy → Pages aufrufen. Die Pipeline läuft beim ersten Push von selbst.
3. Ob „Use unique domain" an oder aus ist, spielt keine Rolle — der Build
   richtet sich danach.

### GitHub Pages

`.github/workflows/deploy.yml` deployt bei Push auf `main`. Dafür muss unter
Settings → Pages als Source „GitHub Actions" gewählt sein.

### Spiegelung GitHub → GitLab

`.github/workflows/mirror-gitlab.yml` pusht bei jedem Push auf `main` nach
GitLab. Ohne hinterlegtes Secret überspringt der Job sich selbst, statt
fehlzuschlagen.

Der umgekehrte Weg — GitLab holt sich den Stand von GitHub — wäre bequemer,
ist aber **Pull-Mirroring und damit ein Premium-Feature**. Auf dem freien Tarif
bleibt: von GitHub aus pushen, oder lokal zwei Remotes pflegen.

## Artifact-Vorschau

Zum Anschauen und Teilen gibt es dieselbe Sammlung als einzelne HTML-Datei:

```bash
npm run artifact   # schreibt dist-artifact/reiseplaner.html
```

Das ist eine Vorschau, nicht das Produkt. Sie hat keinen Service Worker, also
kein Offline, und sie kann keine Kartenkacheln laden — die Content-Security-
Policy von Artifacts blockiert externe Bilder. Statt der OpenStreetMap-Karte
zeichnet sie eine maßstabsgetreue Schemakarte aus denselben Koordinaten.

Bekannte Kosten: Die Bewertungslogik steht damit zweimal im Repo, in
`src/lib/plan.ts` und in `scripts/build-artifact.py`. Wer eine ändert, muss die
andere nachziehen. Sobald GitHub Pages läuft, kann der Generator entfallen.

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

### Veranstaltungen

Feste tragen ihre exakten Termine im Feld `dates`. Ein Fest nur über den Monat
zu steuern reicht nicht — die Sagra del Fungo wäre sonst noch am 17. September
vorgeschlagen worden, obwohl sie am 13. endet. Einträge, die nur an ein oder
zwei Tagen möglich sind, werden an diesem Tag hochgestuft und mit „Nur heute"
gekennzeichnet.

### Koordinaten

`coordsExact: false` heißt: Die Koordinate ist auf den Ortskern geschätzt, nicht
auf die Hausadresse. Die App zeigt das an und schickt die Navigation dann als
Suche nach Name und Ort los, statt einen falschen Punkt anzusteuern.

## Stand

82 Ziele — 43 Toskana, 39 Vinschgau. 57 davon geprüft: entweder mit belegten
Öffnungszeiten, Ruhetagen und Preisen, oder — bei Plätzen, Waalwegen und
Aussichtspunkten — mit dem Beleg, dass sie frei und ohne Öffnungszeiten
zugänglich sind.

Die 25 offenen Einträge sind überwiegend Orte ohne zeitkritische Angaben
(Eisdiele, Gassen, Almhütte), kleine Familienbetriebe ohne feste
Öffnungszeiten oder Großstädte, deren Zeiten je nach Museum auseinandergehen.

Der dritte Durchgang hat die drei dünnsten Bereiche verbreitert:

- **Drinnen, auch ohne Kinderbezug:** Galleria Continua in San Gimignano
  (international bedeutende Gegenwartskunst im alten Stadtkino, Eintritt frei),
  Santa Maria della Scala in Siena, Museo del Cristallo in Colle, Casa
  Boccaccio in Certaldo, Kloster Müstair in der Schweiz mit dem größten
  erhaltenen Freskenzyklus des Frühmittelalters, Vintschger Museum Schluderns.
- **Essen & Trinken:** Osteria delle Catene in San Gimignano, die Weingüter
  Il Palagione und Panizzi, der Bierkeller Latsch, Bäckerei Psenner, Gasthof
  Waldheim im Martelltal, die Weinberge von Kastelbell-Tschars.
- **Natur:** SentierElsa bei Colle mit türkisfarbenen Badegumpen, Riserva
  Berignone bei Volterra mit Flussfurten zum Baden, ein Stück Via Francigena
  ab San Gimignano, der Plima-Schluchtenweg im Martelltal, das Ganglegg über
  Schluderns.

Offen:

- Fahrzeiten sind Schätzungen. Für die Toskana ab San Donato eher großzügig
  gerechnet, weil die SP47 und die Straßen ins Chianti langsam sind.
- Ein Durchgang mit direktem Seitenabruf statt Websuche, falls die
  Netzwerk-Policy der Arbeitsumgebung später geöffnet wird.

### Was der zweite Durchgang korrigiert hat

| Eintrag | Korrektur |
| --- | --- |
| Bagno Vignoni | **Baden ist verboten.** Eine Gemeindeverordnung von 2010 sperrt den Parco dei Mulini, ein Netz versperrt das Becken, Bußgeld 25–500 €. Der Eintrag versprach vorher das Gegenteil. |
| Monteriggioni | Mauerweg **montags bis mittwochs geschlossen**, derzeit nur der südliche Abschnitt. |
| AquaForum Latsch | **Montag Ruhetag**, unter der Woche erst ab 14.30 Uhr. |
| Ötzi-Museum Bozen | **Montag Ruhetag.** |
| Prokuluskirche | Nur **dienstags, donnerstags und sonntags** geöffnet. |
| Kloster Marienberg | Mo–Sa geöffnet, **sonntags geschlossen** — und damit eines der wenigen Ziele, die am Montag, 21.9. offen sind. |
| Funicolare Certaldo | Nach der Wartung im Frühjahr 2026 wieder in Betrieb. |
