# Phase 1 · Architektur und Analyse

Entwicklung ausschließlich auf `feature/arcade-v2`. Geprüfter Ausgangspunkt:
`main`-Commit `22331471b9179d408879cec10f5aa1e1291cf26e`. Alle 30 lokalen Dateien
wurden vor Änderungen über Git-Blob-SHA-1 mit dem tatsächlichen Repository verglichen.
Keine Änderung an Pages, main, Releases oder produktiven Wortdaten.

## Was bestehen bleibt

| Teil | Befund und Entscheidung |
|---|---|
| `js/engine.js` | Reine Funktionen für NFC/ẞ, zweistufige Auswertung, Hard Mode, Tageshash, Wordle-Statistik und Schema-1-Validierung. Bytegleich wiederverwendet. |
| `js/app.js` | Die vier bestehenden Modi und Eingabesperre funktionieren. UI, freie Ziehungen, Ergebnisse und Tastaturen bleiben bestehen; nur Speicherzugriffe werden an die neue Schicht angebunden. |
| `data/words.js` | de-1: 5.574 Lösungen / 15.139 Eingaben. Unverändert und mit eingefrorenem Blob-Hash geprüft. |
| `tools/build_words.py` | Reproduzierbarer Generator mit lokalen Quellen. Unverändert; liest keine Audit-Kandidaten. |
| `style.css` | Responsive Raster, safe areas, Dark/Light, reduzierte Animationen. Unverändert; in dieser Phase kein UI-Rework. |
| `sw.js` | Relative Scope-URLs, Cache-Isolation und Navigation-Fallback wiederverwendet. Nur zwei zusätzliche Assets auf dem Entwicklungsbranch aufgenommen; Cache-Version bleibt v1. |
| `tests/` | Baseline: 8 Engine-/Daten-, 8 App- und 3 SW-Testgruppen bestanden. App/SW verwenden Adapter, keine realen Browser. |
| `WORDLISTS.md` | Dokumentierte MIT-/GPL-Quellen bleiben gültig; Audit-Evidenz behält Wörterbuch-Lizenz. |

## Schlanke neue Aufteilung

`engine.js` → `sessions.js` → `storage.js` → `app.js`, als lokale klassische
Scripts mit `defer` in dieser Reihenfolge; keine Imports/Fetch/CDNs/Frameworks.

`WordRound` ist eine einzelne Wortaufgabe. Bestehende Runden in `games` behalten
ihre Originalstruktur (`target`, `length`, `guesses`, `input`, `hard`, `status`,
`id`, `date`, `started`). Kein unnötiges Umschreiben des funktionierenden UI.

Neue Sessions speichern pro Runde nur die Konfiguration: ID, Wortlänge, Ziel,
Hard Mode, individuelles Versuchslimit. Die Session speichert **eine** Folge von
Versuchen `{word, roundIds}`. `Sessions.roundView()` projiziert die zugehörigen
Eingaben, Farben und den Abschlussstatus einer Runde. Gemeinsame Eingaben für
zwei Boards sind dadurch nur einmal vorhanden; die Farben kommen immer aus
`Engine.evaluate()`. Gelöste Wörter und Etagen werden aus den Runden abgeleitet,
nicht zusätzlich als widersprüchliche Zähler gespeichert.

Eine `GameSession` enthält `id`, `mode`, `wordVersion`, `rounds`, `attempts`,
`status`, `started`, optional `attemptBudget`, nach Abschluss `ended` und optional
`score`. Es gibt noch keinen Timer, keinen Challenge-Link-Parser und keine
Punkteformel. Weitere **begründete** Felder werden erst mit dem jeweiligen Modus
hinzugefügt und validiert. Historische Rekorde sind aus Session-Ergebnissen
ableitbar und werden nicht als zweite, separat veränderbare Wahrheit gespeichert.

Die generischen Funktionen sind rein: Erzeugen, Versuch anhängen, Runde
projizieren, Abschluss und Ergebnis liefern jeweils Daten. IDs und Zeitwerte
werden vom Aufrufer geliefert. Validation prüft Wörter, doppelte IDs, Budgets,
Hard Mode, gelöste Boards, Abschlusszeiten und Ergebnis-Konsistenz. Die
Modusregeln (zwei verschiedene 5er-Ziele, Tower-Reihenfolge usw.) gehören in die
späteren Controller und sind ausdrücklich **noch nicht implementiert**.

## Schema 2 und getrennte Statistik

Schema 2 erhält alle bisherigen Felder vollständig und ergänzt nur:

```js
{
  schema: 2,
  wordVersion: 'de-1',
  // settings, events, games, bags, last, streak, daily unverändert
  sessions: {},        // ID -> neue GameSession
  sessionEvents: []    // ausschließlich neue Modi
}
```

`Engine.summary(events)` und die bestehende Statistik-UI zählen weiterhin nur die
bisherigen Wortrunden. `Sessions.summary(sessionEvents, mode)` wertet Arcade-Modi
getrennt aus. Eine Session-ID wird höchstens einmal gewertet; Konflikte mit
Wortrunden-IDs und widersprüchliche Wiederholungen werden abgewiesen.

Migration 1 → 2 validiert zunächst mit der bisherigen Engine, klont alle Daten,
ändert die Schema-Nummer und fügt leere Session-Sammlungen hinzu. Kein Zeitstempel,
kein Zufall, keine neuen Statistikereignisse. Eine erneute Migration von Schema 2
validiert nur und verändert nichts: deterministisch und idempotent. Unbekannte
Schema-/Wortversionen und unerwartete reservierte Felder werden abgewiesen.

Der neue Schlüssel ist `wordle-de:v2`. `wordle-de:v1` bleibt beim Lesen/Migrieren
und beim späteren Speichern unverändert als ursprüngliche Kopie erhalten. Bei
vorhandenem v2-Schlüssel wird dieser validiert; bei Fehlern **kein** stiller
Rückgriff auf v1 und kein Überschreiben. Die App spielt dann nur temporär,
warnt und bietet den Download des unbearbeiteten fehlgeschlagenen JSON-Speichers.
Import/Reset schreiben erst nach der vorhandenen ausdrücklichen Bestätigung.
Auch Quota-/Zugriffsfehler führen zu temporärem Speicher, nicht zu Datenlöschung.

Backups exportieren Schema 2 einschließlich aller Sessions. Import akzeptiert
Schema 1 und 2 mit de-1, migriert/validiert vor dem Bestätigungsdialog und zählt
keine Ereignisse neu. Aktuell wird de-2 bewusst noch abgewiesen.

## Rückwärtskompatibilität und Grenzen

Ein altes Programm versteht Schema 2 nicht. Deshalb wird v1 weder aktualisiert
noch gelöscht. Parallel weiterbetriebene alte PWAs können jedoch ihren eigenen
v1-Schlüssel verändern. Diese späteren Änderungen werden in Phase 1 noch nicht
automatisch mit einem bereits bestehenden v2-Schlüssel zusammengeführt. Vor dem
Release ist die in `WORD_VERSION_PLAN.md` beschriebene Konflikt-/Übernahmelösung
zwingend; ein einfacher Rückwechsel auf alte Software ist kein verlustfreier
Rollback neuer Arcade-Daten. Separater Test-Origin empfohlen, wenn eigene
Spielerstatistiken nicht durch Entwicklungsversuche ergänzt werden sollen.

## Cache und spätere Modi

Neue Runtime-Dateien: `js/sessions.js`, `js/storage.js`; beide im Branch-Precache
und in `index.html`. Audit, DIC/AFF, Testfixtures und Dokumentation sind keine
Runtime-Dateien. Die Cache-Version v1 bleibt auftragsgemäß unverändert, weshalb
diese Zwischenversion **nicht** auf einen bereits besuchten Produktiv-Origin
ausgerollt werden darf. Vor gemeinsamem Release: neue eindeutige Cache-Version,
vollständiges Offline-Paket, reale Installations-/Update-Tests. Pages bleibt main.

| Späterer Modus | Verwendung der Grundlage | Noch zu implementieren |
|---|---|---|
| Doppeltes Wordle | Zwei Runden, eine Eingabe mit zwei roundIds, gemeinsames Budget 8 | Unterschiedliche 5er-Ziele, Board-UI, Hard-Mode-Entscheidung bei widersprüchlichen Hinweisen |
| Tower | Vier Runden mit aufsteigenden Längen, Budget 20 | Freischalten der nächsten Etage, Transition, Verlustregeln |
| Speedrun | Mehrere Runden, gestartete/beendete Session, separate Punkte/Rekorde | 180-Sekunden-Timer, Hintergrund-/Reload-Regeln, Punkteformel |
| Themen | Eine/mehrere Runden mit normalen Lösungen | Kuratierte Kategorien, Pool-Validation, Menü |
| Duell | Ziel aus accepted statt zwingend solutions | Versionierte begrenzte Challenge-Payloads, Links, Hash-/Fehlerprüfung; keine echte Geheimhaltung ohne Server |

Phase 1 endet an dieser Grundlage. Keine neuen spielbaren Arcade-Modi und kein
vorzeitiger Start von Phase 2.


## Phase 4: Speedrun-Vertrag 1 innerhalb von Schema 2

`js/speedrun.js` verwendet die unveränderten `Sessions`-Funktionen für Runden,
Versuche, Projektionen und Abschluss. `speedrunVersion: 1` markiert den jetzt
spielbaren Modusvertrag, **keine neue Speicher-Schemaversion**. Ein Round-Limit
bleibt 6/7; nur die letzte offene Runde erhält eine kanonische Eingabe.

Zusätzliche persistierte Felder:

- `activeMs`: bisherige aktive monotone Vordergrundzeit in Millisekunden.
- `roundEnds`: geordnete Grenzen `{roundId, reason, attemptIndex, atMs}`;
  `reason` ist `won`, `lost` oder `skipped`. Skip ist keine gewöhnliche Niederlage.
- `attempts[].atMs`: Bestätigungszeit im aktiven Zeitbudget, unabhängig vom Flip.
- `resumeRequired: true`: jeder dauerhafte Checkpoint ist ein sicherer
  Fortsetzenzustand. Ein laufender Browser hält seinen Timeranker ausschließlich
  im RAM; das Feld behauptet nicht, dass während des Checkpoint-Writes die UI pausiert.
- `input`: aktueller Draft, wie in den anderen Arcade-Modi.

Restbudget = max(0, 180000 − activeMs − 10000 × Anzahl Skips). Punkte und
Wortfortschritt werden aus bestätigten Rundenenden abgeleitet. Die Endsession
und ihr Event enthalten einen geprüften Score-Snapshot für vorhandene
Ergebnisverträge. Round-/Event-Replay und der Storage-Abgleich verhindern
widersprüchliche Punkte, doppelte Grenzen und nachträgliche Tipps.

`WordleSpeedrun.createClock(now)` erlaubt eine injizierbare monotone Quelle,
Standard `performance.now()`. Countdown wird bewusst nicht verwendet.
Checkpoint/Stop/Resume bilden den Timerzustand ab; Anker und Epochen werden
niemals persistiert. UI-Updates alle 100 ms sind von der Zeitberechnung getrennt;
dauerhafte Checkpoints alle 500 ms, zusätzlich Eingabe/Aktion/Pause/Lifecycle.
Ein Vordergrundwechsel startet den Timer nie automatisch. Nach Crash zählt
der letzte erfolgreiche Checkpoint; Event-Loop-Blockierung kann das nominelle
500-ms-Fenster vergrößern. Keine lokale Anti-Cheat-Garantie.

`js/speedrun-ui.js` rendert Start/Spiel/Pause/Ergebnis/Statistik. Controller und
Lifecycle bleiben in `app.js`. Ein Abschluss wird vor visueller Animation
persistiert; 200-ms-Eingabeschutz (30 ms bei reduzierter Bewegung) verhindert
Doppelbestätigung. Die aktive Uhr läuft während dieser kurzen Auswertung weiter.

Historische generische Speedrun-Prototypen aus Phase-1-Fixtures ohne neue
Vertragsfelder bleiben unverändert importier-/exportierbar und durch `Sessions`
validiert. Sie hatten keine spielbare Timer-/Punktelogik und werden deshalb nicht
als neue Speedrun-Highscores interpretiert oder als neuer Run fortgesetzt.
Sobald irgendein reserviertes Speedrun-Vertragsfeld vorhanden ist, verlangt
Storage den vollständigen neuen Vertrag; Entfernen des Markers allein umgeht
keine Prüfung. Classic, Daily, Streak, Double und Tower benötigen diese Felder nicht.

Eigene Statistik-Events enthalten flache Snapshots: `speedrunVersion`, `score`,
`lost`, `skipped`, `winningAttempts`, `solved4`…`solved7`, `activeMs`. Sie werden
gegen die vollständige Session geprüft. Keine klassischen Gewinne werden erzeugt.
Abbrüche behalten tatsächlich erspielte Punkte und können einen Highscore setzen;
Ø Punkte berücksichtigt ausdrücklich nur regulär beendete Runs. Gleichstand:
Punkte, gelöste Wörter, weniger Versuche, dann vorheriger (älterer) Rekord.

Die zwei neuen Runtime-Dateien sind im Entwicklungs-Precache. Cache v1 bleibt
unverändert; für den gemeinsamen Release ist eine neue eindeutige Cache-Version
und ein echter Upgrade-/Offline-Test erforderlich.


## Phase 5: Themes-1 und Single-Word-Theme-Vertrag

`data/themes.js` hält `current` und eine Registry unveränderlicher Themenpakete.
Jedes Paket hat seine eigene Version, Basiswortversion, Mindestgröße und Kategorien
mit stabilen IDs, Anzeigenamen, Icons, Beschreibung, indexierten Pools und
aktivierten Längen. `tools/build_themes.py` kompiliert explizite redaktionelle
Entscheidungen aus `data/themes/editorial-themes-1.json`; kein Klassifikator.
Nur Kombinationen mit mindestens 25 beibehaltenen Basislösungen sind verfügbar.
Globale Wörterbuchdaten und Tageshash bleiben unverändert.

`js/theme.js` ergänzt einen schlanken Modusvertrag `themeContract: 1` mit
`themeVersion` und `categoryId`, einer einzigen `WordRound` und dem Draft `input`.
`Sessions`-Verträge, `Engine.evaluate` und `Engine.hardError` bleiben unverändert.
Hard wird beim Start in die Round kopiert. Themenpool betrifft nur die Lösung;
Eingaben kommen immer aus dem allgemeinen Wörterbuch der gespeicherten Wortversion.

Schema bleibt 2, Schlüssel bleibt `wordle-de:v2`. Optional `themeBags`:
`{ '<themeVersion>:<categoryId>:<length>': {remaining: [...], last: 'WORD'} }`.
Optional `themeLast` vermeidet unmittelbare Wiederholung über Kategorien hinweg.
Die allgemeine `bags`-/`last`-Struktur wird weder umbenannt noch geändert.
Pooldurchlauf per Fisher-Yates-Beutel, erst nach Ausschöpfung neu mischen.
Seltene Ausnahme: besteht der Rest aus genau dem zuletzt in einer anderen Kategorie
gezogenen Wort, wird ein anderes Poolwort gezogen und der Rest für den nächsten
Zug behalten. Damit hat unmittelbare Wiederholungsvermeidung Vorrang vor dem
ansonsten vollständigen Durchlauf. Auswahl und jeder Tipp werden sofort gespeichert.

Storage prüft Theme-Vertrag, Versionszugehörigkeit, aktive Länge, Ziel, Abschluss,
Draft, Beutel und Ergebnis-Snapshots. Alte Schema-2-Daten benötigen diese Felder
nicht. Generische historische Theme-Prototypen ohne Vertragsfelder bleiben erhalten,
werden aber nicht als freigegebene Themenrunden umgedeutet. Unvollständiger neuer
Vertrag wird abgewiesen. Ergebnisse ergänzen flach Kategorie, Themenversion und
Länge; einmalige IDs/Abgleich mit Session verhindern doppelte Wertung.
Eigene E.summary-Projektion zählt nur Theme-Events, mit Kategorie-/Längenfiltern.

Neue Poolversionen müssen **hinzugefügt**, nicht in themes-1 hineineditiert werden.
Historische Sessions und Beutel lösen ihr gespeichertes Paket auf. Ein späteres
de-2 benötigt zusätzlich die bereits geplante globale Wortversionsregistry, um
alte Wortpakete bereitzustellen; diese Migration bleibt offen. Ein Test simuliert
eine neue aktuelle Themenversion und validiert themes-1 weiterhin unverändert.
Neue Kategorienversionen brauchen außerdem Statistikfilter für die Vereinigungsmenge
historisch bekannter IDs, falls Kategorien jemals aus der aktuellen Auswahl entfallen.

`js/theme-ui.js` rendert Auswahl, Spiel, Ergebnis und Statistik, die Tastatur stammt
weiter aus `DoubleUI.keyboard`. Controller in `app.js` schützt Eingaben, bestätigt
Abbruch/Ersetzung und speichert über den gemeinsamen `storeSession`. Das Raster
nutzt einen begrenzten Scrollbereich mit aktueller Zeile, Tastatur/Kategorie bleiben
außerhalb. Drei neue Runtime-Assets sind im Precache; Cache-Version bleibt v1.
