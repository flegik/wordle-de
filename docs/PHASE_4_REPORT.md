# WORDLE DE 2.0 · Phase 4: Wordle Speedrun

Entwicklung ausschließlich auf `feature/arcade-v2`. Ausgangspunkt: vollständig
committed Phase 3, `23e38912cd8f190a9a5b9c6bbf3327f392666f7d`.
Vor Änderungen wurden alle **63** GitHub-Dateien bytegleich mit dem lokalen
Checkout verglichen und **93** bestehende Testgruppen erfolgreich ausgeführt.
Architektur-, Phase-2- und Phase-3-Berichte sowie die tatsächlichen Module wurden
geprüft. Keine fehlende Phase-3-Voraussetzung gefunden.

Umsetzungscommit: [`fd9ad13`](https://github.com/flegik/wordle-de/commit/fd9ad137bbc7e29c155fce0cc4f823ee5c4eef06).

## Implementierte Funktionen

Speedrun bietet **180 Sekunden** aktives Grundbudget. Jede neue Runde zieht ihre
Länge gleichwahrscheinlich aus 4/5/6/7, anschließend ihre Lösung aus dem
bestehenden längenbezogenen Anti-Wiederholungsbeutel. Separate Wortlimits bleiben
6 Versuche bei 4/5, 7 bei 6/7. Jeder gültige Tipp betrifft nur das aktuelle Wort;
ungültige, unvollständige und wiederholte Tipps verbrauchen keinen Versuch.

Gelöste Wörter bringen 100/150/200/250 Punkte, ohne Boni. Nach Lösung oder
Versuchslimit-Niederlage folgt automatisch das nächste Wort. Die Niederlage
beendet nicht den Run. Kurzes Feedback zeigt Punkte beziehungsweise das verlorene
Wort. Skip wird gesondert erfasst, bringt keine Punkte und kostet **10 Sekunden**.
Bei weniger Restzeit endet der Run mit null; keine negative Uhr.

Arcade-Menükarte, eigene Startansicht mit Punktetabelle/Rekorden, HUD mit Zeit,
Budgetleiste/Punkten/gelösten Wörtern, deutsche gemeinsame Tastatur, Skip,
Pause/Fortsetzung, bestätigter Abbruch, Ergebnis, separate Statistik und Top 10.
Hard Mode gilt hier nicht; die globale Einstellung bleibt erhalten. Weitere
Spielmodi wurden nicht implementiert. de-1 und Tagesrätsel bleiben unverändert,
LEGAT bleibt normale Lösung und zulässige Eingabe. Wortbereinigung bleibt auf
die später freizugebende de-2-Phase verschoben.

## Timer und Grenzfälle

`WordleSpeedrun.createClock` verwendet eine injizierbare monotone Quelle;
im Browser `performance.now()`. Aktive Zeit wird aus Differenzen berechnet,
nicht blind per Sekunde heruntergezählt. Die Anzeige wird alle 100 ms aktualisiert,
unabhängig davon, wie oft ein Browser tatsächlich einen Callback ausführt.

Persistiert werden bisherige aktive Millisekunden. Überspringen ist aus den
Rundenenden ableitbar: Restzeit = max(0, 180000 − activeMs − 10000 × Skips).
Kein zweiter unabhängig veränderbarer Restzeit-/Penalty-Zähler. Anker leben nur
im RAM. Jeder dauerhafte Snapshot trägt `resumeRequired: true`; der aktuelle
Browser kann mit seinem RAM-Anker weiterlaufen, ein neuer Browser muss bewusst
fortsetzen. Start-/Fortsetzenbutton startet unmittelbar, ohne Countdown.
Startansicht, Pause und Hintergrund kosten keine Spielzeit.

Checkpoint alle 500 ms sowie zusätzlich bei Eingaben, Skip, Pause/Navigation,
visibilitychange und pagehide. Nach Hintergrundwechsel keine Eingaben und keine
Zeit bis zur expliziten Fortsetzung. Nach Reload wird eine neue monotone Epoche
mit der gespeicherten aktiven Zeit verbunden, niemals mit alten performance-Werten.
Draft, Wortziele, Rundenenden und Tipps bleiben erhalten. Ein gewöhnlicher
Menüwechsel oder Browserwechsel ist kein Abbruch.

Die Bestätigung wird mit aktiver Zeit **vor** Regelauswertung/Animation erfasst.
Ein gültiger Treffer bei 179999,99 ms zählt; bei 180000 ms wird kein Tipp mehr
angenommen. Auch ohne vorausgehenden Anzeige-Tick prüft jede Aktion ihre Deadline.
Der akzeptierte Versuch samt Punkten und nächster Runde wird sofort gespeichert.
Endet die Zeit während des Flips, bleibt dieser Treffer gültig; der offene Draft
oder das nächste ungelöste Wort bringt keine Punkte. Timeout und Abbruch werden
über das vorhandene `recordSession` einmalig erfasst, bevor Ergebnisanimationen
laufen. Erneutes Laden oder Export/Import vergibt keine zusätzlichen Punkte.

## Session-Vertrag, Speicherung und Statistik

`js/speedrun.js` baut auf den unveränderten `Sessions.createRound/createSession`,
`appendAttempt`, `roundView` und `finish` auf. Kein neuer Wordle-Auswertungsalgorithmus,
keine duplizierte Tastatur. `Engine.evaluate`, Normalisierung, Wörterbuch und
längenbezogene Wortbeutel werden wiederverwendet.

`speedrunVersion: 1` kennzeichnet den neuen Modusvertrag **innerhalb Schema 2**.
Zusätzlich gibt es `activeMs`, `resumeRequired`, `input`, bestätigte Zeitpunkte
`attempts[].atMs` und geordnete `roundEnds` mit Round-ID, Grund, Versuchsgrenze
und aktiver Zeit. Der Timerzustand laufend/pausiert bleibt im Clock-Controller;
das dauerhafte Spiel ist stets sicher fortsetzbar. Runde und Punkte werden
abgeleitet. Nur das letzte offene Wort kann neue Tipps erhalten.

Replay-Validierung prüft Reihenfolge, Versuchslimits, Abschlussgrenzen,
solved/lost/skipped, nichtnegative konsistente Zeit, Bestätigung vor Deadline,
keine Eingaben nach Lösung/Skip/Run-Ende und reproduzierbare Punkte.
Ereignis-Snapshots werden zusätzlich gegen die vollständige Session abgeglichen.
Fehlender Versionsmarker bei noch vorhandenen Vertragsfeldern umgeht die
Validierung nicht. Beschädigte Backups werden abgewiesen; beschädigte lokale
Daten bleiben über den vorhandenen Schutzmechanismus unverändert.

Schlüssel bleibt `wordle-de:v2`, Schema bleibt 2. Schema-1-Migration und alte
Schema-2-Daten bleiben gültig. Historische generische Speedrun-Prototyp-Fixtures
ohne neuen Vertrag bleiben verlustfrei erhalten/importier-/exportierbar. Da
sie keine echte Zeit-/Punktelogik hatten, werden sie nicht als neue spielbare
Speedrun-Runs fortgesetzt oder in die neuen Highscores umgedeutet.

Eigene Events erfassen Score, gestartete/gelöste/verlorene/übersprungene Wörter,
Versuche und Gewinnversuche sowie aktive Zeit und gelöste Wörter je Länge.
Ein am Ende offenes Wort bleibt ausdrücklich **offen**, nicht verloren oder
übersprungen. Statistik: Runs, regulär beendet, Abbrüche, Highscore, meiste Wörter,
Ø Punkte regulär beendeter Runs, Ø gelöste Wörter pro Run, insgesamt gelöst,
Skips, Ø Versuche erfolgreicher Wörter und lokal abgeleitete Top 10.

Highscores berücksichtigen auch tatsächlich erspielte Punkte aus bestätigten
Abbrüchen. Gleichstand: mehr gelöste Wörter, weniger Gesamtversuche; bei
vollständigem Gleichstand bleibt der bisherige ältere Rekord. Ø Punkte verwendet
nur regulär beendete Runs. Classic-/Daily-/Streak-Events, Doppel- und Tower-
Statistiken werden nicht verändert. Ein Speedrun ist genau eine Session.

## Oberfläche und mobile Entscheidungen

`js/speedrun-ui.js` trennt Markup von Regeln und Controller. Timer bleibt groß
und mit tabellarischen Ziffern gut lesbar; <30 s orange, <10 s rot. Zusatzpulsieren
wurde zugunsten einer ruhigen Oberfläche weggelassen. Punkt-/Wortfeedback hat
eine eigene feste Zeile, die den Timer nicht mit einem Toast überlagert.

Die Spielansicht nutzt 100dvh mit Safe-Area-Padding. HUD, Skip und gemeinsame
Tastatur stehen außerhalb des inneren scrollbaren Rasters. Bei kurzen Displays
bleiben ältere Tipps erreichbar; ein Scrollhelper hält die aktuelle Eingabe im
Raster sichtbar, ohne die Tastatur zu verschieben. Weniger als 20 Rasterzeilen:
hier nur die 6/7 zulässigen Zeilen je Wort. Mehrfachbuchstaben-/Positionshinweise
sind zusätzlich textlich beschriftet. Keine native mobile Texteingabe notwendig.

Flip dauert 120 ms mit 12-ms-Buchstabenstaffelung. Doppelbestätigung wird für nominell
200 ms blockiert, bei reduzierter Bewegung 30 ms. Die Uhr läuft in diesem kurzen
Vordergrundmoment weiter; keine langen Siege oder Weiter-Dialoge. Pause bleibt
auch während des Flips möglich. Tastaturfarben werden beim neuen Wort neu
aus dessen leerer Historie abgeleitet. Systemeinstellung und App-Einstellung
für reduzierte Bewegung gelten weiterhin; vorhandene lokale Sounds optional.

Sharing nutzt die bestehende Web-Share-/Clipboard-/manuelle Kopierfunktion.
Nur echte Punkte, gelöste Wörter, Skips, Highscore und Abschlussart werden geteilt;
keine Lösungen. Ergebnisansicht zeigt alle wesentlichen Kennzahlen und markiert
verlorene/übersprungene/offene Wörter nicht als Siege.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `js/speedrun.js` (neu) | Modusvertrag, Replay, Punkte, Timer/Fake-Clock-Schnittstelle, Statistik/Share |
| `js/speedrun-ui.js` (neu) | Start, HUD/Raster, Pause, Ergebnis, Statistik/Top 10 |
| `js/app.js` | Routing, Controller, Timer-Checkpoints, Lifecycle, Eingabeschutz, Scrollhilfe |
| `js/storage.js` | Neuer opt-in Modusvertrag, validierte Ergebnis-Snapshots; alte Daten bleiben gültig |
| `index.html` | Beide lokalen Module in Abhängigkeitsreihenfolge |
| `style.css` | Scoped Speedrun-Layout, Safe Areas, kurze Flips, Feedback/Timerfarben |
| `sw.js` | Zwei Runtime-Assets ergänzt; Cache-Version unverändert v1 |
| `tests/speedrun.test.cjs` (neu) | 27 Regel-/Timer-/Storage-Gruppen |
| `tests/speedrun-app.test.cjs` (neu) | 25 Controller-/Lifecycle-/Reload-Gruppen |
| `tests/browser-speedrun.cjs` (neu) | Optionaler isolierter Browser-/Geometrie-/Offline-Check |
| `tests/helpers/app-harness.cjs` | Injektionsfähige monotone Zeit, Lifecycle-/Intervall-Adapter |
| `tests/sw.test.cjs` | Alle 19 Runtime-URLs im Cache-Adapter |
| `tools/test_all.py` | Elf Runtime-Syntaxprüfungen und beide Speedrun-Suites |
| `README.md`, `TESTING.md`, `docs/ARCHITECTURE_V2.md`, dieser Bericht | Bedienung, Vertrag, echte Ergebnisse und Grenzen |

Unverändert: `engine.js`, `sessions.js`, Doppel- und Tower-Regeln/-UI,
Wortdaten und Generator/Audit, Icons, Manifest, Lizenzen und Pages-Konfiguration.
Keine neuen externen App-Laufzeitabhängigkeiten.

## Tatsächlich ausgeführte Prüfungen

Baseline **93 bestanden**. Vollständiger Gesamtlauf nach Speedrun:
`python tools/test_all.py` → **145 Testgruppen bestanden** (52 neue).
Elf Runtime-Syntaxprüfungen, Syntaxprüfung des optionalen Browserchecks,
`git diff --check`, unveränderte 1461 UTC-Tagesrätsel-Fixtures und reproduzierbarer
Wortaudit. Klassische, Doppel- und Tower-Tests bestehen weiterhin.

Fake Clock und DOM-Adapter prüfen Start ohne Zeitverbrauch, Gleichverteilung,
alle Wortlimits/Punkte, automatische Folgerunden, Timeout/Skip/Abbruch,
Mehrfachbuchstaben/Unicode, Hintergrund/Rückkehr, pagehide, Reload mit neuer
Epoche, Pause während Flip, Deadline während Animation, schnell doppelte Aktionen,
Score-Reproduktion, Gleichstände, separate Statistiken, Import/Export,
beschädigte Chronologie/Zeit/Punkte und Schutz vor Versionsmarker-Umgehung.
Eine Geometrie-Adaptergruppe prüft das Nachführen der Eingabe im inneren Raster;
sie ist ausdrücklich kein visueller Layouttest.

`node tests/browser-tower.cjs` und `node tests/browser-speedrun.cjs` wurden
versucht: Playwright vorhanden, **Chromium-Executable fehlt**, beide stoppen
vor Browserstart. Kein neuer Browserdownload versucht. Deshalb keine erfolgreichen
Render-, Touch-, Safari-, Geräte-, PWA-Installations- oder Offline-Browsertests.
Der optionale Speedrun-Browserlauf ist vorbereitet und syntaktisch gültig,
sein Ablauf wurde hier nicht im Browser bestätigt. Vollständige offene
Geräte-/Lifecycle-/Share-/PWA-Checkliste: `TESTING.md`.

## Bekannte Grenzen und Empfehlung

1. Vor visueller Freigabe echte 320×568-/360×640-/390-/430-px-Geräte,
   Desktop/Querformat, iPhone-Safari/Safe Areas, Touch und installierte PWA prüfen.
   Hintergrund/Anruf/Sperren/BFCache sowie echte Share-/Backup-Dialoge sind offen.
2. Abrupter Prozessabbruch kann seit letztem erfolgreichem Checkpoint Zeit
   verlieren. Nominell maximal etwa 500 ms plus Callback-/Event-Loop-Verzögerung;
   bei blockiertem Hauptthread oder Speicherversagen keine harte Garantie.
   Kein serverloser Anti-Cheat-Schutz gegen manuelle Datenmanipulation.
3. Bestehendes localStorage bleibt Last-Write-Wins ohne atomare Mehrtab-Transaktion.
   Vollständige Historien wachsen; regelmäßige JSON-Sicherung sinnvoll.
   Keine automatische Löschung. Die generischen Schutzgrenzen von 1000 Runden/
   Versuchen pro Session bleiben erhalten; bei normalem menschlichem Spiel
   innerhalb von drei Minuten liegt das weit außerhalb des erwarteten Umfangs.
4. Zwei neue Assets sind im Entwicklungs-Precache. Cache v1 wurde nicht erhöht.
   Nur auf frischem isoliertem Test-Origin verwenden. Gemeinsamer Release braucht
   neue eindeutige Cache-Version und echtes verlustfreies v1→v2-/Offline-Upgrade.
5. Wortqualitäts-/de-2-Freigabe, rückwirkungsfreie Tagesrätselpolitik und
   mögliche v1/v2-Konfliktübernahme bleiben spätere Release-Voraussetzungen.
6. Zuerst Speedrun auf Geräten gemeinsam prüfen. Phase 5 kann anschließend
   ausdrücklich beauftragt werden; Themen-Pools sollten am vorhandenen Audit
   ansetzen. Themen-Wordle und Wort-Duell wurden hier nicht begonnen.

Phase 4 endet mit diesem Stand. Keine Veröffentlichung und keine Änderungen an main.
