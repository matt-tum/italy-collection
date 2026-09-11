# -*- coding: utf-8 -*-
"""Baut die Artifact-Vorschau als eine einzelne HTML-Datei aus src/data/pois.json.

    python3 scripts/build-artifact.py            # schreibt dist-artifact/reiseplaner.html

Die Artifact-Fassung ist eine Vorschau zum Teilen, nicht das Produkt: Sie ist
Vanilla-JS in einer Datei, ohne Build und ohne Service Worker, und sie kann
keine Kartenkacheln laden, weil die Content-Security-Policy von Artifacts
externe Bilder blockiert — statt einer OpenStreetMap-Karte zeichnet sie eine
maßstabsgetreue Schemakarte aus denselben Koordinaten.

Bekannte Kosten: Die Bewertungslogik steht damit zweimal im Repo, hier und in
src/lib/plan.ts. Wer eine der beiden ändert, muss die andere nachziehen. Das
ist bewusst in Kauf genommen, solange das Artifact nur die Vorschau ist; sobald
GitHub Pages läuft, kann diese Datei entfallen.
"""
import json, io, os

pois = json.load(open('src/data/pois.json', encoding='utf-8'))

BASES = [
  dict(id='toscana', label='Toskana', lat=43.43887, lng=11.01636,
       stay='Casolare Le Terre Rosse · Loc. San Donato, San Gimignano',
       dates=['2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19']),
  dict(id='suedtirol', label='Südtirol', lat=46.617, lng=10.863,
       stay='matill retreat · Hans-Pegger-Str. 6a, Latsch',
       dates=['2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23']),
]

DAY_NOTES = {
  '2026-09-13': 'Anreisetag. Einziger Sonntag in der Toskana — der Archeodromo Poggibonsi öffnet nur sonntags 15–18 Uhr, und die Sagra del Fungo in Pievescola hat ihren letzten Abend.',
  '2026-09-14': 'Erster ganzer Tag. Der Mauerweg in Monteriggioni ist montags bis mittwochs geschlossen — der Ort selbst bleibt frei zugänglich.',
  '2026-09-17': 'Wochenmarkt in San Gimignano, 8–13 Uhr auf allen drei Plätzen. Früh hin: die Parkplätze sind am Markttag eher voll.',
  '2026-09-19': 'Umzugstag Toskana → Vinschgau, rund 500 km. Realistisch bleibt der Abend in Latsch.',
  '2026-09-21': 'Der schwierigste Tag: Ruhetag bei aquaprad, Churburg, AquaForum und dem Ötzi-Museum in Bozen. Offen sind Kloster Marienberg (Mo–Sa 10–17 Uhr) und alles unter freiem Himmel — Seilbahn, Waalweg, Reschensee, Watles.',
  '2026-09-20': 'Die Prokuluskirche in Naturns öffnet nur dienstags, donnerstags und sonntags — heute oder gar nicht. Kloster Marienberg hat dagegen sonntags zu.',
  '2026-09-22': 'Familientag im archeoParc Schnalstal mit Zusatzprogramm am Nachmittag. Der beste Südtirol-Tag im Fenster.',
  '2026-09-23': 'Abreisetag nach Mainz. Schloss Juval hätte ohnehin Ruhetag.',
}

payload = json.dumps(
    {'pois': pois, 'bases': BASES, 'dayNotes': DAY_NOTES},
    ensure_ascii=False, separators=(',', ':')
).replace('</', '<\\/')

HTML = r'''<title>Was machen wir heute?</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap">
<style>
:root {
  /* Kalkstein-Neutrale mit leichter Grünstichigkeit — Zypresse und Lärche,
     nicht die übliche Toskana-Terrakotta. */
  --ground: #f1f1ec;
  --surface: #ffffff;
  --sunk: #e7e7df;
  --line: #dcdcd2;
  --line-soft: #e9e9e1;
  --ink: #1d211b;
  --ink-2: #61675c;
  --ink-3: #8c9186;
  /* Der Akzent wechselt mit der Region: Zypresse für die Toskana,
     Gletscher für den Vinschgau. Er zeigt an, wo man gerade ist. */
  --accent: #3f5540;
  --accent-ink: #ffffff;
  --accent-wash: #e6ebe4;
  --signal: #8a5a00;
  --signal-wash: #f6ecd8;
  --shadow: 0 1px 1px rgba(29, 33, 27, .04), 0 6px 20px rgba(29, 33, 27, .07);
  --serif: 'Fraunces', 'Iowan Old Style', Georgia, serif;
  --sans: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color-scheme: light;
}

:root[data-region='suedtirol'] { --accent: #2c5a78; --accent-wash: #e2eaf0; }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --ground: #131512;
    --surface: #1b1e19;
    --sunk: #23271f;
    --line: #2e332c;
    --line-soft: #262a24;
    --ink: #edefe8;
    --ink-2: #98a192;
    --ink-3: #757d70;
    --accent: #93b183;
    --accent-ink: #131512;
    --accent-wash: #232b20;
    --signal: #d3a24a;
    --signal-wash: #2c2517;
    --shadow: 0 1px 1px rgba(0, 0, 0, .5), 0 6px 20px rgba(0, 0, 0, .38);
    color-scheme: dark;
  }
  :root:not([data-theme='light'])[data-region='suedtirol'] { --accent: #7fb4d6; --accent-wash: #1b2a33; }
}

:root[data-theme='dark'] {
  --ground: #131512;
  --surface: #1b1e19;
  --sunk: #23271f;
  --line: #2e332c;
  --line-soft: #262a24;
  --ink: #edefe8;
  --ink-2: #98a192;
  --ink-3: #757d70;
  --accent: #93b183;
  --accent-ink: #131512;
  --accent-wash: #232b20;
  --signal: #d3a24a;
  --signal-wash: #2c2517;
  --shadow: 0 1px 1px rgba(0, 0, 0, .5), 0 6px 20px rgba(0, 0, 0, .38);
  color-scheme: dark;
}
:root[data-theme='dark'][data-region='suedtirol'] { --accent: #7fb4d6; --accent-wash: #1b2a33; }

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

button { font: inherit; color: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }

.shell {
  max-width: 760px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ground);
}

/* ---------- Kopf ---------- */
.top {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 14px 18px 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 11px;
}

.brand h1 {
  margin: 0;
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.01em;
}

.brand .count {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.regions { display: flex; gap: 6px; padding: 4px; background: var(--sunk); border-radius: 11px; }

.regions button {
  flex: 1;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--ink-2);
}

.regions button[aria-pressed='true'] {
  background: var(--surface);
  border-color: var(--line);
  color: var(--accent);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .06);
}

.stay {
  margin: 9px 0 0;
  font-size: 12px;
  color: var(--ink-3);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.stay b { font-weight: 600; color: var(--ink-2); }

/* ---------- Inhalt ---------- */
main { flex: 1; padding: 16px 18px 26px; display: flex; flex-direction: column; gap: 14px; }

.eyebrow {
  margin: 0;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.note {
  margin: 0;
  font-size: 13.5px;
  color: var(--ink-2);
  max-width: 62ch;
}

/* Tagesschiene */
.rail {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -18px;
  padding: 0 18px 2px;
}
.rail::-webkit-scrollbar { display: none; }

.day {
  flex: 0 0 auto;
  display: grid;
  gap: 1px;
  padding: 7px 13px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  line-height: 1.25;
}

.day span:first-child { font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-3); }
.day span:last-child { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.day[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.day[aria-pressed='true'] span:first-child { color: var(--accent-ink); opacity: .78; }

.daynote {
  margin: 0;
  padding: 10px 13px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--ink-2);
  background: var(--signal-wash);
  border-left: 3px solid var(--signal);
  border-radius: 0 8px 8px 0;
  max-width: 66ch;
}

/* Einstellungen, zusammengeklappt */
.tuner {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 13px;
  font-size: 13.5px;
  color: var(--ink-2);
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.tuner span:first-child { flex: 1; }
.tuner .caret { font-size: 10px; color: var(--ink-3); }

.panel {
  display: grid;
  gap: 13px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 7px; }

.chip {
  padding: 6px 12px;
  font-size: 13.5px;
  font-weight: 500;
  background: var(--sunk);
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--ink-2);
}
.chip[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }

/* ---------- Ergebniskarten ---------- */
.cards { display: grid; gap: 10px; }

.card {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 14px;
  width: 100%;
  padding: 14px 15px 14px 0;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.card.is-done { opacity: .52; }

/* Die Fahrzeit ist der Wert, nach dem gescannt wird — eigene Spalte,
   der Balken darunter codiert den Entfernungsring. */
.drive {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 3px;
  padding: 2px 0 0 12px;
  border-left: 3px solid var(--accent);
  border-radius: 12px 0 0 12px;
  min-height: 100%;
}

.drive.ring-t60 { border-left-color: color-mix(in srgb, var(--accent) 42%, var(--line)); }
.drive.ring-t90 { border-left-color: var(--line); border-left-width: 2px; padding-left: 13px; }

.drive b { font-family: var(--serif); font-size: 21px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.drive small { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }

.body h3 {
  margin: 0 0 3px;
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
  text-wrap: balance;
}

.body p { margin: 0; font-size: 13.5px; color: var(--ink-2); }

.facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 12px;
  margin-top: 9px;
  font-size: 12px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.fit { display: inline-flex; align-items: center; gap: 5px; }
.fit i { display: flex; gap: 2px; font-style: normal; }
.fit u { width: 12px; height: 4px; border-radius: 2px; background: var(--line); text-decoration: none; }
.fit u.on { background: var(--accent); }

.tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }

.tag {
  padding: 2px 9px;
  font-size: 11.5px;
  font-weight: 500;
  border-radius: 999px;
  background: var(--sunk);
  color: var(--ink-2);
}

.tag.hot { background: var(--signal-wash); color: var(--signal); font-weight: 600; }
.tag.unchecked { background: transparent; border: 1px dashed var(--line); color: var(--ink-3); }

.empty {
  padding: 34px 16px;
  text-align: center;
  font-size: 13.5px;
  color: var(--ink-3);
  border: 1px dashed var(--line);
  border-radius: 12px;
}

/* ---------- Gruppierte Liste ---------- */
.group { display: grid; gap: 9px; }
.group + .group { margin-top: 20px; }

.group-head {
  display: flex;
  align-items: baseline;
  gap: 9px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--line);
}

.group-head h2 { margin: 0; font-family: var(--serif); font-size: 16px; font-weight: 600; }
.group-head span { font-size: 12px; color: var(--ink-3); font-variant-numeric: tabular-nums; }

/* ---------- Schemakarte ---------- */
.mapwrap { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
.mapwrap svg { display: block; width: 100%; height: auto; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 11px; font-size: 12px; color: var(--ink-2); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }

/* ---------- Detailblatt ---------- */
.sheet-bg {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(16, 19, 15, .5);
  padding: 0;
}

.sheet {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px 20px 24px;
  background: var(--surface);
  border-radius: 16px 16px 0 0;
}

.sheet .kicker { margin: 0; font-size: 12px; color: var(--ink-3); letter-spacing: .02em; }
.sheet h2 { margin: 5px 0 0; font-family: var(--serif); font-size: 23px; font-weight: 600; line-height: 1.18; text-wrap: balance; }
.sheet .lede { margin: 12px 0 0; font-size: 15px; line-height: 1.62; max-width: 64ch; }

dl.spec { margin: 18px 0 0; display: grid; gap: 0; }

dl.spec > div {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 12px;
  padding: 9px 0;
  border-top: 1px solid var(--line-soft);
  font-size: 13.5px;
}

dl.spec dt { color: var(--ink-3); font-weight: 500; }
dl.spec dd { margin: 0; }

.actions { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }

.btn {
  flex: 1 1 120px;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  color: var(--ink);
  background: var(--sunk);
  border: 1px solid transparent;
  border-radius: 10px;
}

.btn.go { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.btn[aria-pressed='true'] { border-color: var(--accent); color: var(--accent); }

.refs { margin: 16px 0 0; font-size: 12.5px; color: var(--ink-3); line-height: 1.6; }
.refs a { color: var(--accent); }

/* ---------- Fußnavigation ---------- */
.tabs {
  position: sticky;
  bottom: 0;
  z-index: 40;
  display: flex;
  background: var(--surface);
  border-top: 1px solid var(--line);
}

.tabs button {
  flex: 1;
  padding: 10px 4px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .03em;
  background: none;
  border: none;
  border-top: 2px solid transparent;
  color: var(--ink-3);
}

.tabs button[aria-pressed='true'] { color: var(--accent); border-top-color: var(--accent); }
.tabs em { display: block; font-style: normal; font-size: 17px; line-height: 1.35; }

@media (prefers-reduced-motion: no-preference) {
  .card, .chip, .day, .btn { transition: background-color .14s ease, border-color .14s ease, color .14s ease; }
}
</style>

<div class="shell">
  <header class="top">
    <div class="brand">
      <h1>Was machen wir heute?</h1>
      <span class="count" id="count"></span>
    </div>
    <div class="regions" id="regions" role="group" aria-label="Standquartier"></div>
    <p class="stay" id="stay"></p>
  </header>

  <main id="view"></main>

  <nav class="tabs" id="tabs" role="group" aria-label="Ansicht"></nav>
</div>

<div id="sheet"></div>

<script>
const DATA = __PAYLOAD__;

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const CAT = {
  essen: 'Essen & Trinken',
  kultur: 'Kunst, Kultur & Geschichte',
  kind: 'Mit dem Kind',
  natur: 'Natur & Aussicht',
};
const CAT_DOT = { essen: '#b4762b', kultur: '#6b5aa8', kind: '#38826b', natur: '#3f7ea8' };
const RING = { t15: 'Vor der Haustür · bis 15 Min', t60: 'Halber Tag · bis 1 Std', t90: 'Tagesausflug · bis 1,5 Std' };
const BUDGET = { kurz: 'Ein paar Stunden', halb: 'Halber Tag', ganz: 'Ganzer Tag' };
const SKY = { sonne: 'Sonne', wechsel: 'Wechselhaft', regen: 'Regen' };
const MOOD = { fit: 'Ausgeschlafen', quengelig: 'Kurze Zündschnur', autoschlaf: 'Schläft im Auto' };
const MAX_DRIVE = { kurz: 20, halb: 60, ganz: 95 };
const MAX_TOTAL = { kurz: 165, halb: 330, ganz: 600 };
const BOOKING = { nein: 'Nicht nötig — einfach hinfahren', empfohlen: 'Reservierung empfohlen', pflicht: 'Nur mit Reservierung' };
const WEATHER = { indoor: 'Drinnen', outdoor: 'Draußen — nur bei gutem Wetter', beides: 'Drinnen und draußen' };
const STROLLER = { ja: 'Buggy kein Problem', schwierig: 'Buggy geht, ist aber mühsam', nein: 'Nur Trage oder selbst laufen' };

const store = {
  read() {
    try { return JSON.parse(localStorage.getItem('italien-merkliste') || '') || { saved: [], done: [] }; }
    catch (e) { return { saved: [], done: [] }; }
  },
  write(v) { try { localStorage.setItem('italien-merkliste', JSON.stringify(v)); } catch (e) {} },
};

let marks = store.read();
if (!Array.isArray(marks.saved)) marks.saved = [];
if (!Array.isArray(marks.done)) marks.done = [];

const state = {
  region: 'toscana',
  tab: 'heute',
  day: null,
  budget: 'halb',
  sky: 'sonne',
  mood: 'fit',
  cats: [],
  tuning: false,
  axis: 'kategorie',
  open: null,
};

const base = () => DATA.bases.find((b) => b.id === state.region);
const inRegion = () => DATA.pois.filter((p) => p.base === state.region);
const ringOf = (m) => (m <= 15 ? 't15' : m <= 60 ? 't60' : 't90');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function dur(min) {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  if (!h) return m + ' Min';
  return m ? h + ' Std ' + m + ' Min' : h + ' Std';
}

function dayLabel(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return { wd: WD[d.getUTCDay()], num: d.getUTCDate() + '.9.' };
}

/* Bewertung: dieselbe Logik wie in der Repo-App. */
function rank() {
  const day = state.day;
  const d = new Date(day + 'T12:00:00Z');
  const weekday = WD[d.getUTCDay()], month = d.getUTCMonth() + 1;
  const maxDrive = state.mood === 'quengelig' ? Math.min(MAX_DRIVE[state.budget], 35) : MAX_DRIVE[state.budget];
  const out = [];

  for (const p of inRegion()) {
    if (p.driveMinutes > maxDrive) continue;
    if (p.closedMonths && p.closedMonths.includes(month)) continue;
    if (p.closedDays && p.closedDays.includes(weekday)) continue;
    if (p.dates && !p.dates.includes(day)) continue;
    if (state.sky === 'regen' && p.weather === 'outdoor') continue;
    if (state.cats.length && !p.categories.some((c) => state.cats.includes(c))) continue;

    const stay = (p.stayMinutes[0] + p.stayMinutes[1]) / 2;
    const total = p.driveMinutes * 2 + stay;
    if (total > MAX_TOTAL[state.budget]) continue;

    let score = 0;
    const why = [];

    // Kleinkind-Eignung wiegt an jedem Tag, nicht nur an einem schlechten.
    score += (p.kid.rating - 1) * 9;

    if (state.mood === 'quengelig') {
      if (p.kid.rating === 3) { score += 40; why.push('Das Kind ist hier der Hauptgrund'); }
      else if (p.kid.rating === 2) score += 12;
      else score -= 30;
      if (p.tags.some((t) => t === 'tiere' || t === 'spielplatz' || t === 'wasser')) { score += 20; why.push('Tiere oder Wasser direkt vor Ort'); }
      if (p.tags.includes('gelato')) score += 8;
      if (p.driveMinutes <= 15) { score += 12; why.push('Kurze Fahrt'); }
    }
    if (state.mood === 'autoschlaf') {
      if (p.driveMinutes >= 35) { score += 22; why.push('Fahrtzeit deckt den Mittagsschlaf ab'); }
      if (p.categories.includes('kultur')) { score += 18; why.push('Etwas für euch beide'); }
      if (p.kid.rating === 1) score += 6;
    }
    if (state.mood === 'fit') {
      if (p.tags.includes('wanderung')) { score += 14; why.push('Genug Energie zum Laufen'); }
      if (p.kid.rating === 3) { score += 14; why.push('Trägt einen ganzen Vormittag'); }
      if (p.stayMinutes[1] >= 120) score += 6;
    }

    if (state.sky === 'regen' && p.weather === 'indoor') { score += 25; why.push('Komplett im Trockenen'); }
    if (state.sky === 'sonne' && p.weather === 'outdoor') { score += 15; why.push('Lohnt sich nur bei gutem Wetter'); }
    if (state.sky === 'wechsel' && p.weather === 'beides') { score += 10; why.push('Funktioniert bei jedem Wetter'); }

    score += (1 - Math.abs(total - MAX_TOTAL[state.budget] * 0.7) / MAX_TOTAL[state.budget]) * 18;

    const rare = !!p.dates || (p.closedDays && p.closedDays.length >= 4);
    if (rare) { score += 20; why.unshift('Nur heute — sonst geschlossen'); }
    if (p.booking === 'pflicht') { score -= 10; why.push('Vorher reservieren'); }
    if (!p.verified) score -= 5;
    score += (p.id.charCodeAt(0) % 7) * 0.01;

    out.push({ p, score, why: why.slice(0, 3), total: Math.round(total / 5) * 5, rare });
  }

  out.sort((a, b) => b.score - a.score);
  out.sort((a, b) => Number(marks.done.includes(a.p.id)) - Number(marks.done.includes(b.p.id)));
  return out;
}

function cardHtml(p, extra) {
  extra = extra || {};
  const done = marks.done.includes(p.id);
  const saved = marks.saved.includes(p.id);
  const fit = [1, 2, 3].map((n) => '<u class="' + (n <= p.kid.rating ? 'on' : '') + '"></u>').join('');
  const tags = [];
  if (extra.rare) tags.push('<span class="tag hot">Nur an diesem Tag</span>');
  (extra.why || []).forEach((w) => { if (w !== 'Nur heute — sonst geschlossen') tags.push('<span class="tag">' + esc(w) + '</span>'); });
  if (!p.verified) tags.push('<span class="tag unchecked">ungeprüft</span>');

  return '<button class="card' + (done ? ' is-done' : '') + '" data-poi="' + p.id + '">' +
    '<span class="drive ring-' + ringOf(p.driveMinutes) + '"><b>' + p.driveMinutes + '</b><small>Min</small></span>' +
    '<span class="body">' +
      '<h3>' + esc(p.name) + (saved ? ' ★' : '') + '</h3>' +
      '<p>' + esc(p.short) + '</p>' +
      '<span class="facts">' +
        '<span>Vor Ort ' + dur(p.stayMinutes[0]) + '–' + dur(p.stayMinutes[1]) + '</span>' +
        (extra.total ? '<span>Gesamt ' + dur(extra.total) + '</span>' : '') +
        '<span class="fit" title="Kleinkind-Eignung ' + p.kid.rating + ' von 3">Kind <i>' + fit + '</i></span>' +
      '</span>' +
      (tags.length ? '<span class="tags">' + tags.join('') + '</span>' : '') +
    '</span>' +
  '</button>';
}

function viewHeute() {
  const b = base();
  const days = b.dates.map((iso) => {
    const l = dayLabel(iso);
    return '<button class="day" data-day="' + iso + '" aria-pressed="' + (state.day === iso) + '">' +
      '<span>' + l.wd + '</span><span>' + l.num + '</span></button>';
  }).join('');

  const note = DATA.dayNotes[state.day];
  const summary = [BUDGET[state.budget], SKY[state.sky], MOOD[state.mood],
    state.cats.length ? state.cats.length + ' Kategorien' : 'alle Kategorien'].join(' · ');

  const group = (title, obj, key) => '<div><p class="eyebrow">' + title + '</p><div class="chips">' +
    Object.keys(obj).map((k) => '<button class="chip" data-set="' + key + '" data-val="' + k + '" aria-pressed="' +
      (state[key] === k) + '">' + esc(obj[k]) + '</button>').join('') + '</div></div>';

  const panel = state.tuning ? '<div class="panel">' +
    group('Wie viel Zeit?', BUDGET, 'budget') +
    group('Wetter', SKY, 'sky') +
    group('Das Kind ist heute…', MOOD, 'mood') +
    '<div><p class="eyebrow">Worauf habt ihr Lust?</p><div class="chips">' +
      Object.keys(CAT).map((c) => '<button class="chip" data-cat="' + c + '" aria-pressed="' +
        state.cats.includes(c) + '">' + esc(CAT[c]) + '</button>').join('') +
    '</div></div></div>' : '';

  const res = rank();
  const list = res.length
    ? '<div class="cards">' + res.slice(0, 8).map((r) => cardHtml(r.p, r)).join('') + '</div>'
    : '<p class="empty">Für diesen Tag passt mit diesen Einstellungen nichts. Mehr Zeit einplanen oder eine Kategorie abwählen.</p>';

  return '<div class="rail" role="group" aria-label="Reisetag">' + days + '</div>' +
    (note ? '<p class="daynote">' + esc(note) + '</p>' : '') +
    '<button class="tuner" id="tuner" aria-expanded="' + state.tuning + '"><span>' + esc(summary) +
      '</span><span class="caret">' + (state.tuning ? '▲' : '▼') + '</span></button>' +
    panel + list;
}

/* Schemakarte: echte Koordinaten, äquidistant projiziert. Kartenkacheln
   sind in Artifacts blockiert, die Lagebeziehung trägt aber auch so. */
function viewKarte() {
  const b = base();
  const pts = inRegion();
  const kmPerLat = 111.32, kmPerLng = 111.32 * Math.cos((b.lat * Math.PI) / 180);
  const P = pts.map((p) => ({ p, x: (p.lng - b.lng) * kmPerLng, y: -(p.lat - b.lat) * kmPerLat }));
  const span = Math.max(12, ...P.map((q) => Math.max(Math.abs(q.x), Math.abs(q.y)))) * 1.14;
  const W = 640, H = 430, cx = W / 2, cy = H / 2;
  const s = Math.min(cx, cy) / span;
  const sx = (v) => cx + v * s, sy = (v) => cy + v * s;

  const rings = [10, 25, 50].filter((r) => r * s < Math.min(cx, cy) - 16)
    .map((r) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * s).toFixed(1) +
      '" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>' +
      '<text x="' + cx + '" y="' + (cy - r * s - 5) + '" fill="var(--ink-3)" font-size="11" text-anchor="middle" font-family="Archivo, sans-serif">' + r + ' km</text>')
    .join('');

  const dots = P.map((q) =>
    '<circle class="pt" data-poi="' + q.p.id + '" cx="' + sx(q.x).toFixed(1) + '" cy="' + sy(q.y).toFixed(1) +
    '" r="6" fill="' + CAT_DOT[q.p.categories[0]] + '" stroke="var(--surface)" stroke-width="2" style="cursor:pointer"><title>' +
    esc(q.p.name) + ' · ' + q.p.driveMinutes + ' Min</title></circle>').join('');

  // Ortsnamen: der jeweils größte Ort zuerst, Überschneidungen werden verworfen.
  const byTown = {};
  P.forEach((q) => { (byTown[q.p.town] = byTown[q.p.town] || []).push(q); });
  const placed = [];
  const labels = Object.keys(byTown)
    .sort((a, c) => byTown[c].length - byTown[a].length)
    .map((t) => {
      const g = byTown[t];
      const x = sx(g.reduce((a, q) => a + q.x, 0) / g.length);
      const y = sy(g.reduce((a, q) => a + q.y, 0) / g.length) - 11;
      const w = t.length * 6.1, box = { x1: x - w / 2, x2: x + w / 2, y1: y - 11, y2: y + 3 };
      if (placed.some((o) => box.x1 < o.x2 && box.x2 > o.x1 && box.y1 < o.y2 && box.y2 > o.y1)) return '';
      placed.push(box);
      return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="var(--ink-2)" font-size="11.5" ' +
        'font-weight="600" text-anchor="middle" font-family="Archivo, sans-serif">' + esc(t) + '</text>';
    }).join('');

  const home = '<g><circle cx="' + cx + '" cy="' + cy + '" r="8" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/>' +
    '<text x="' + cx + '" y="' + (cy + 24) + '" fill="var(--ink)" font-size="11.5" font-weight="700" text-anchor="middle" font-family="Archivo, sans-serif">Unterkunft</text></g>';

  const nearest = [...pts].sort((a, c) => a.driveMinutes - c.driveMinutes).slice(0, 6);

  return '<p class="eyebrow">Lage der Ziele</p>' +
    '<p class="note">Maßstabsgetreue Schemakarte aus den echten Koordinaten. Kartenkacheln lädt ein Artifact nicht — die Fassung im Repo zeigt stattdessen eine OpenStreetMap-Karte. Die Ringe sind Luftlinie: im Vinschgau können 25 km je nach Tal 25 oder 60 Fahrminuten bedeuten.</p>' +
    '<div class="mapwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Schematische Lagekarte der Ziele">' +
      rings + dots + labels + home + '</svg>' +
      '<div class="legend">' + Object.keys(CAT).map((c) =>
        '<span><i style="background:' + CAT_DOT[c] + '"></i>' + esc(CAT[c]) + '</span>').join('') + '</div>' +
    '</div>' +
    '<p class="eyebrow">Am nächsten dran</p>' +
    '<div class="cards">' + nearest.map((p) => cardHtml(p)).join('') + '</div>';
}

function viewAlles() {
  const pts = inRegion();
  const groups = state.axis === 'kategorie'
    ? Object.keys(CAT).map((c) => ({ label: CAT[c], items: pts.filter((p) => p.categories.includes(c)) }))
    : ['t15', 't60', 't90'].map((r) => ({ label: RING[r], items: pts.filter((p) => ringOf(p.driveMinutes) === r) }));

  return '<div class="chips" style="margin-top:0">' +
      '<button class="chip" data-axis="kategorie" aria-pressed="' + (state.axis === 'kategorie') + '">Nach Kategorie</button>' +
      '<button class="chip" data-axis="entfernung" aria-pressed="' + (state.axis === 'entfernung') + '">Nach Fahrzeit</button>' +
    '</div>' +
    groups.map((g) => '<section class="group"><div class="group-head"><h2>' + esc(g.label) +
      '</h2><span>' + g.items.length + '</span></div>' +
      (g.items.length
        ? g.items.slice().sort((a, b) => a.driveMinutes - b.driveMinutes).map((p) => cardHtml(p)).join('')
        : '<p class="empty">Nichts erfasst.</p>') + '</section>').join('');
}

function viewMerkliste() {
  const pts = inRegion().filter((p) => marks.saved.includes(p.id));
  return '<p class="eyebrow">Gemerkt für ' + esc(base().label) + '</p>' +
    (pts.length
      ? '<div class="cards">' + pts.map((p) => cardHtml(p)).join('') + '</div>'
      : '<p class="empty">Noch nichts gemerkt. Ein Ziel öffnen und „Merken“ tippen — es bleibt auf diesem Gerät gespeichert.</p>');
}

function sheetHtml(p) {
  const saved = marks.saved.includes(p.id), done = marks.done.includes(p.id);
  const url = p.coordsExact
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.name + ', ' + p.town);

  const row = (k, v) => v ? '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>' : '';
  const refs = p.sources.length
    ? 'Belege: ' + p.sources.map((s) => '<a href="' + esc(s.url) + '" target="_blank" rel="noreferrer">' +
        esc(s.label) + '</a> (' + esc(s.checked) + ')').join(' · ')
    : 'Keine Quelle hinterlegt — Angaben vor der Fahrt selbst prüfen.';

  return '<div class="sheet-bg" id="bg"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(p.name) + '">' +
    '<p class="kicker">' + esc(p.town) + ' · ' + p.driveMinutes + ' Min Fahrt' +
      (p.coordsExact ? '' : ' · Position ungefähr') + '</p>' +
    '<h2>' + esc(p.name) + '</h2>' +
    '<p class="lede">' + esc(p.why) + '</p>' +
    '<dl class="spec">' +
      row('Kategorie', p.categories.map((c) => esc(CAT[c])).join(' · ')) +
      row('Mit dem Kind', esc(p.kid.notes) + '<br>' + esc(STROLLER[p.kid.stroller]) +
        (p.kid.changing === true ? ' · Wickelmöglichkeit vorhanden' : '')) +
      row('Dauer vor Ort', dur(p.stayMinutes[0]) + ' bis ' + dur(p.stayMinutes[1])) +
      row('Wetter', esc(WEATHER[p.weather])) +
      row('Geöffnet', p.hours ? esc(p.hours) : '') +
      row('Ruhetag', p.closedDays && p.closedDays.length < 4 ? esc(p.closedDays.join(', ')) : '') +
      row('Termine', p.dates ? p.dates.map((d) => { const l = dayLabel(d); return l.wd + ' ' + l.num; }).join(', ') : '') +
      row('Kosten', p.price ? esc(p.price) : '') +
      row('Reservieren', esc(BOOKING[p.booking])) +
      row('Parken', p.parking ? esc(p.parking) : '') +
      row('Beste Zeit', p.bestTime ? esc(p.bestTime) : '') +
    '</dl>' +
    '<div class="actions">' +
      '<a class="btn go" href="' + url + '" target="_blank" rel="noreferrer">Navigation</a>' +
      '<button class="btn" data-mark="saved" aria-pressed="' + saved + '">' + (saved ? '★ Gemerkt' : '☆ Merken') + '</button>' +
      '<button class="btn" data-mark="done" aria-pressed="' + done + '">' + (done ? '✓ Erledigt' : 'Erledigt') + '</button>' +
      '<button class="btn" data-close="1">Schließen</button>' +
    '</div>' +
    '<p class="refs">' + refs + '</p>' +
  '</div></div>';
}

const TABS = [
  { id: 'heute', label: 'Heute', icon: '◈' },
  { id: 'karte', label: 'Karte', icon: '◎' },
  { id: 'alles', label: 'Alles', icon: '☰' },
  { id: 'merkliste', label: 'Merkliste', icon: '★' },
];

function render() {
  const b = base();
  if (!b.dates.includes(state.day)) state.day = b.dates[0];
  document.documentElement.setAttribute('data-region', state.region);

  document.getElementById('regions').innerHTML = DATA.bases.map((x) =>
    '<button data-goregion="' + x.id + '" aria-pressed="' + (state.region === x.id) + '">' + esc(x.label) + '</button>').join('');

  const first = dayLabel(b.dates[0]), last = dayLabel(b.dates[b.dates.length - 1]);
  document.getElementById('stay').innerHTML = '<b>' + first.num + '–' + last.num + '</b> ' + esc(b.stay);
  document.getElementById('count').textContent = inRegion().length + ' Ziele';

  const view = document.getElementById('view');
  view.innerHTML = state.tab === 'heute' ? viewHeute()
    : state.tab === 'karte' ? viewKarte()
    : state.tab === 'alles' ? viewAlles()
    : viewMerkliste();

  document.getElementById('tabs').innerHTML = TABS.map((t) =>
    '<button data-tab="' + t.id + '" aria-pressed="' + (state.tab === t.id) + '">' +
    '<em aria-hidden="true">' + t.icon + '</em>' + t.label + '</button>').join('');

  document.getElementById('sheet').innerHTML = state.open
    ? sheetHtml(DATA.pois.find((p) => p.id === state.open)) : '';
}

document.addEventListener('click', (ev) => {
  const hit = (sel) => ev.target.closest(sel);
  let t;

  if ((t = hit('[data-goregion]'))) { state.region = t.dataset.goregion; state.day = null; }
  else if ((t = hit('[data-tab]'))) state.tab = t.dataset.tab;
  else if ((t = hit('[data-day]'))) state.day = t.dataset.day;
  else if (hit('#tuner')) state.tuning = !state.tuning;
  else if ((t = hit('[data-set]'))) state[t.dataset.set] = t.dataset.val;
  else if ((t = hit('[data-cat]'))) {
    const c = t.dataset.cat;
    state.cats = state.cats.includes(c) ? state.cats.filter((x) => x !== c) : state.cats.concat(c);
  }
  else if ((t = hit('[data-axis]'))) state.axis = t.dataset.axis;
  else if ((t = hit('[data-mark]'))) {
    const k = t.dataset.mark, id = state.open;
    marks[k] = marks[k].includes(id) ? marks[k].filter((x) => x !== id) : marks[k].concat(id);
    store.write(marks);
  }
  else if (hit('[data-close]') || (ev.target.id === 'bg')) state.open = null;
  else if ((t = hit('[data-poi]'))) state.open = t.dataset.poi;
  else return;

  render();
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && state.open) { state.open = null; render(); }
});

render();
</script>
'''

out = HTML.replace('__PAYLOAD__', payload)
os.makedirs('dist-artifact', exist_ok=True)
path = 'dist-artifact/reiseplaner.html'
open(path, 'w', encoding='utf-8').write(out)
print(path, len(out), 'Zeichen')
