# WORDLE DE 2.0 · Phase 2: Doppeltes Wordle

Entwicklung ausschließlich auf `feature/arcade-v2`, basierend auf Phase-1-Commit
`47f21405a2038a2cb2ed962a68d05df2daec3ed7`. Kein Merge, Release oder Pages-Umbau.
Umsetzungscommit: [`89e9b0b`](https://github.com/flegik/wordle-de/commit/89e9b0bdfb22cffc4bb0cc70010499eeff47a4aa).

Die Wortbasis bleibt unverändert `de-1`; der bekannte PESEL-Kandidat wird erst
im freizugebenden de-2-Pool bereinigt. LEGAT bleibt regulär auswählbar.

## Spielbare Funktionen

Zwei verschiedene fünfstellige Ziele aus dem bestehenden Lösungsbeutel, acht
**gemeinsame** Versuche. Eine gültige Eingabe trifft alle noch offenen Boards.
Gelöste Boards frieren ein. Zwei gelöste Wörter gewinnen sofort; acht erfolglose
Gesamtversuche verlieren. Wörterbuchfehler und doppelte Tipps verbrauchen nichts.
Die vorhandene NFC-/ẞ-Normalisierung und zweistufige Mehrfachbuchstabenwertung
werden unverändert benutzt. Hard Mode ist ausschließlich hier deaktiviert;
der Startdialog erklärt dies, die globale Einstellung bleibt bestehen.

Startmenü mit Klassiker und Arcade, Pause/Fortsetzen, bestätigter Abbruch,
Ergebnis mit beiden Zielen und Lösungsstatus, bisherigem Schnitt, Serien und
neuem Mindestversuch-Rekord. Neue Session, Teilen und Startseite sind erreichbar.
Andere geplante Modi wurden nicht implementiert und haben keine Platzhalterbuttons.

## Architektur und Daten

`js/double.js` ergänzt die Phase-1-Session-Funktionen um den Modusvertrag.
`GameSession.rounds` enthält zwei `WordRound`-Konfigurationen; ein einziger
kanonischer `attempts`-Eintrag speichert Wort und betroffene Round-IDs.
`Sessions.roundView` leitet Hinweise, Eingaben und Lösungsstatus ab. Es werden
keine redundanten Farbfelder oder Zähler gespeichert. Budget 8 und individuelle
Obergrenze 8 sind unterschiedliche Grenzen der vorhandenen Architektur.

`activeRoundId` und `input` sind persistierte UI-Felder. ID, `started`, `ended`,
Status, Wortversion und Ziele nutzen das vorhandene Schema. Die optionalen
UI-Felder erlauben auch Phase-1-Sessions mit korrekter Doppel-Konfiguration ohne
UI-Auswahl/Draft. Der Controller wählt dann standardmäßig A. Eine früher nur
hypothetische Ein-Runden-„double“-Testfixture ist jetzt eine gültige Zwei-Runden-
Fixture; fehlerhafte reale Backups würden geschützt abgelehnt, nicht zurückgesetzt.

`js/storage.js` prüft zusätzlich den Doppel-Vertrag: genau zwei verschiedene
Fünfbuchstabenlösungen, Hard aus, exakt acht Versuche Budget, nur noch offene
Boards pro Eingabe, gültige UI-Felder und konsistente abgeschlossene Ergebnisse.
Schema bleibt **2**, Schlüssel bleibt `wordle-de:v2`. Die bestehende idempotente
Schema-1-Migration und deren erhaltene Originalkopie `wordle-de:v1` bleiben.
Import validiert vor der Überschreibbestätigung, Export enthält beide Boards.
Ungültiger Speicher bleibt im geschützten Modus ohne automatisches Überschreiben.

Eine laufende Doppel-Session wird bevorzugt fortgesetzt. Eine neue Session nutzt
zwei aufeinanderfolgende Ziehungen aus dem bestehenden Fünferbeutel. Damit werden
auch klassisch gezogene Ziele berücksichtigt; der vorhandene Wiederholungs-Schutz
am Beutelübergang garantiert unterschiedliche Ziele. Ziele werden beim Reload
nicht neu gezogen. Bei Rückkehr aus einem anderen Tab wird ein abgeschlossener
Stand zum Ergebnisbildschirm, statt weitere Versuche anzunehmen.

Ergebnisse landen über `recordSession` genau einmal in `sessionEvents`.
Klassische `events`, Tageswertungen und Streak-Rekorde werden dabei nicht geändert.
`DoubleWordle.summary` berechnet Sessions/Siege/Niederlagen/Quote, Durchschnitt
nur aus Siegen, Minimum, aktuelle/beste Serie, Verteilung 1–8, verwendete gemeinsame
Versuche und gelöste Einzelwörter einschließlich Teil-Erfolgen bei Niederlagen.
Eine Session ist ein Ergebnis, nicht zwei klassische Siege. Abbruch zählt als
Niederlage. Ein eigener Statistikfilter verhindert das Vermischen der Mittelwerte.

## Oberfläche

`js/double-ui.js` rendert ausschließlich HTML. Die gemeinsame Tastaturfunktion
wird auch vom klassischen Bildschirm verwendet; Bewertung und Eingaberegeln
der klassischen Modi bleiben unverändert. Die Tastatur reflektiert nur die
gewählte Runde; nach einem Einzel-Sieg wird das offene Wort ausgewählt.
Ein gelöstes Board lässt sich weiterhin ansehen; beim nächsten Tippen wird
automatisch das offene Board angezeigt, damit der Draft gut sichtbar bleibt.

Unter 800 px: zwei Fortschrittskarten mit **allen bisherigen** Buchstaben-/Farb-
Hinweisen als kompakte Übersicht und ein ausgewähltes großes Acht-Zeilen-Raster.
Tap auf eine Karte oder horizontales Wischen wechselt die Ansicht; vertikales
Scrollen bleibt möglich. Kleine Hinweise sind eine Übersicht, die große Ansicht
bleibt durch den Rasterwechsel erreichbar. Ab 800 px erscheinen beide Vollraster.
Kurze Displays erhalten kleinere Raster, damit die Tastatur bedienbar bleibt.
Gelöst-Markierungen, Wortbezeichnungen, Auswahlstatus und Farbbeschreibungen
für Assistenztechnik ergänzen die Farbe.

Die Eingabe ist während Flip/Übergang gesperrt. Der Spielstand wird **vor** der
Animation gespeichert, damit ein Schließen keine Wertung verliert. Das bisherige
aktive Raster bleibt für den Flip sichtbar; danach wird die persistierte
Auswahl übernommen. Beide Hinweisübersichten animieren ihre tatsächliche neue
Zeile. Reduzierte Bewegung gilt aus App- und Systemeinstellungen.

Teilen nutzt dieselbe Web-Share-/Clipboard-/manuelle Textfunktion wie die
klassischen Modi; ein fehlgeschlagenes Share versucht nun ebenfalls Clipboard.
Der Doppel-Text enthält beide Emoji-Auswertungen und die gemeinsame Versuchszahl.
Nach einem gelösten Raster zeigt „—“ keine erfundene weitere Wertung.
Kein Zielwort steht im geteilten Text. Im serverlosen Client sind die Ziele
technisch im lokalen Speicher sichtbar; Challenge-/Anti-Cheat-Funktionen sind
nicht Bestandteil dieser Phase.

## Geänderte Dateien

| Datei | Zweck |
|---|---|
| `js/double.js` (neu) | Regeln, Validierung, Kennzahlen, Share-Text |
| `js/double-ui.js` (neu) | Raster, Übersichten, Tastatur, Ergebnis, Statistik |
| `js/app.js` | Moduscontroller, Menüs, Input-Lock, Speicherung, Swipe, Share |
| `js/storage.js` | Zusätzliche Doppel-State-/Event-Validierung |
| `index.html` | Neue lokale Scripts in Abhängigkeitsreihenfolge |
| `style.css` | Scoped mobile/desktop Doppel-Layouts, Übersichten, Animationen |
| `sw.js` | Zwei neue Dateien in Precache, produktive Cache-Version unverändert |
| `tests/double.test.cjs` (neu) | Zehn Regel-/Statistik-/Backup-Testgruppen |
| `tests/double-app.test.cjs` (neu) | Elf Controller-/Persistenz-/Share-Testgruppen |
| `tests/browser-double.cjs` (neu) | Optionaler Browsercheck, hier nicht durchführbar |
| `tests/helpers/app-harness.cjs` | Scripts aus tatsächlichem HTML laden |
| `tests/app-storage.test.cjs` | Repräsentative zukünftige Doppel-Fixture angepasst |
| `tests/sw.test.cjs` | Vollständiger Precache mit jetzt 15 Assets |
| `tools/test_all.py` | Neue Syntax- und Testsuiten einbinden |
| `README.md`, `TESTING.md`, dieser Bericht | Entwicklungsstand, Anleitung, Befunde |

Unverändert: `js/engine.js`, `js/sessions.js`, Wortlisten/Generator/Audit, Manifest,
Icons, Lizenzen und Pages-Konfiguration. Keine neuen externen Laufzeitpakete.

## Tatsächlich ausgeführte Prüfungen

Vor Änderungen: sämtliche **41 Phase-1-Testgruppen bestanden**.
Nach Änderungen: `python tools/test_all.py`: **62 Testgruppen bestanden**,
inklusive aller ursprünglichen Tests, sieben Runtime-Syntaxprüfungen, 1461
unveränderter Tagesrätsel-Fixtures und bytegleicher Audit-Reproduktion.
Zusätzlich Syntaxprüfung des optionalen Browserchecks und `git diff --check`.

Die neuen Tests decken unterschiedliche Ziele und acht Versuche, unabhängige
Doppelbuchstabenfarben, unveränderte gelöste Boards, Sieg/Verlust am achten Versuch,
ungültige Tipps, Eingabesperre, Pause/Reload mit Draft/Auswahl, Abbruchbestätigung
und einmalige Wertung, getrennte Statistik, Hard-Mode-Ausnahme, Unicode,
Web Share/Clipboard ohne Spoiler, Backup-Roundtrip und bestehenden Spielstand ab.
DOM-/Cache-Adapter prüfen Zustandslogik und Script-Einbindung, kein Layout.

**Browserprüfung ist offen:** Playwright-Start scheitert an fehlendem Chromium;
dessen Download liefert hier kein gültiges Archiv. Keine erfolgreichen Browser-,
Touch-, Screenshot-, Installations- oder Offline-Gerätetests behauptet.
Die Checkliste mit 320/360/390/430 px und Android/iPhone steht in `TESTING.md`.

## Risiken und nächste Schritte

1. Vor Layoutfreigabe die offenen echten Geräte-/Browserchecks ausführen,
   besonders Acht-Zeilen-Ansicht auf kleinen Displays und native Share-Sheets.
2. Speicher verwendet die bestehende Last-Write-Wins-Strategie von localStorage;
   wirklich gleichzeitige Schreibvorgänge mehrerer Tabs sind keine Transaktion.
   Langjährige komplette Session-Historie vergrößert außerdem den lokalen Speicher;
   bei Quota-Fehlern bleibt die vorhandene Backup-Warnung aktiv.
3. Phase-1-Release-Kriterien bleiben offen: Konflikte bei parallel weitergespielter
   1.0-PWA, de-2-Freigabe und versionierte Tagesrätselpolitik. Diese Phase erweitert
   nicht die Migration auf noch nicht freigegebene Wortdaten.
4. Precache ist auf dem Entwicklungsbranch vollständig vorbereitet. Die Version
   bleibt absichtlich `v1`; **vor der späteren gemeinsamen Veröffentlichung**
   neue Cache-Version vergeben und Offline-Upgrade auf isoliertem Origin prüfen.
   Zwischenversion niemals auf dem produktiven Origin servieren.
5. Doppel jetzt gemeinsam prüfen. Anschließend kann Phase 3 Wordle Tower auf
   dieselbe Session-/Round-Grundlage aufbauen; Tower wurde hier nicht begonnen.
