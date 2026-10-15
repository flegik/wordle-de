# Doppel-Wordle 2.1.2 · Variable Wortlängen

Entwicklungsbranch: `feature/double-lengths-v2-1-2`.
Ausgangsstand: `37689b0d64ad81eebf9bf8b06ff97ff6bcf77f28`.
Keine Veröffentlichung, kein Merge und keine Änderung an Pages/Online-Worker.

## Verhalten und Architektur

Vor einer neuen Session erscheint die Auswahl 4, 5, 6, 7 oder Zufall.
Zufall teilt das Intervall [0,1) in vier gleich große Abschnitte; erst danach
zieht der bestehende `WordSelection`-Algorithmus beide Lösungen des jeweiligen
Längenpools. Gemeinsame Beutel und Anti-Wiederholung bleiben bestehen.

| Buchstaben | Gemeinsame Versuche |
|---|---|
| 4 | 7 |
| 5 | 8 |
| 6 | 9 |
| 7 | 10 |

Beide `WordRound`s haben dieselbe Länge, verschiedene Lösungen, dasselbe
individuelle Limit wie das gemeinsame Budget und `hard:false`. Die globale
Hard-Einstellung wird nicht verändert. Die bestehende Engine wertet jeden Tipp
unabhängig aus; gelöste Boards erhalten keine weiteren Eingaben.

Wortlänge und Budget werden aus den gespeicherten Runden/`attemptBudget`
verwendet. `DoubleWordle.limit` validiert die zugehörige Regeltabelle.
`doubleLengthChoice` ist eine optionale gespeicherte Präferenz auf Zustand und
neuen Sessions: 4/5/6/7 oder `random`. Die Sessionpräferenz bestimmt „Neue
Doppel-Runde“, auch nach Reload oder beim Öffnen historischer Ergebnisse.
Zufall wird dabei neu gezogen. „Wortlänge ändern“ öffnet die Auswahl; Abbrechen
verändert keinen Spielstand. Eine laufende Session wird stets fortgesetzt und
niemals durch eine neue Auswahl überschrieben.

## Kompatibilität und Statistiken

Schema 2 und `wordle-de:v2` bleiben bestehen. Keine Neuwertung oder Umschreibung
historischer Ergebnisse. Neue Ergebnisse werden über `DoubleWordle.result`
projiziert und enthalten die tatsächliche `length`. Bei alten 5/8-Sessions
bleibt dieser zusätzliche Schlüssel aus: Der Snapshot ist identisch zur alten
`Sessions.result`-Ausgabe. Alte Ereignisse ohne Länge gelten beim Filtern als 5.
Der vorhandene Storage-Abgleich validiert neue Snapshots gegen ihre Session.

Doppel-Statistik und Ergebnishistorie lassen sich nach Länge filtern;
Zufallsrunden zählen bei ihrer ausgelosten Länge. Verteilung bis zu zehn
Versuchen, eigene Serien und Mittelwerte ausschließlich erfolgreicher Sessions.
Der persönliche Vergleich im Ergebnis bezieht sich auf dieselbe Wortlänge.
Klassische und Online-Statistiken bleiben unberührt. Backups enthalten die
optionalen Auswahlfelder und neue Ereignislängen; alte Backups bleiben lesbar.
Ältere App-Versionen verstehen neue 4/6/7-Sessions nicht: Neue Backups deshalb
nicht in einen älteren Client importieren. Historische Pakete werden nicht geändert.

## UI, Sharing und Offline

Raster, Eingabegrenzen, Hinweise, Resultate und Emoji-Sharing verwenden die
Sessionkonfiguration. Die vorhandenen PNG-Funktionen rendern bereits anhand der
Board-Länge; nur ihre Ergebniszusammenfassung benötigte das dynamische Budget.
Kein zweiter Renderer, keine neue PNG-Laufzeitabhängigkeit.

Die Tastatur bleibt außerhalb eines begrenzten, vertikal scrollbaren
Rasterbereichs. Die aktuelle Zeile wird nur innerhalb dieses Bereichs sichtbar
gehalten; kein `scrollIntoView`, das die gesamte Seite verschiebt. 7 Spalten
nutzen `minmax(0,1fr)`. Die beiden kompakten Übersichten zeigen alle realen
Hinweise in einem scrollbaren Bereich. Wechsel per Antippen/Swipe bleibt erhalten.
Auf Desktop stehen beide Raster nebeneinander.

Keine neuen Runtime-Dateien; die existierende Asset-Liste umfasst alle Änderungen.
Die produktive SW-Cache-Version bleibt unverändert. Vor dem später ausdrücklich
freigegebenen Release muss ein neuer gemeinsamer Cache-Name gewählt werden,
auch nach Zusammenführung mit dem parallel entwickelten Revanche-Update.

## Prüfungen

Reproduzierbare Aufrufe:

- `python tools/test_all.py`
- `node tests/online-client.test.cjs`
- `node tests/online-service.test.cjs`
- `node tools/verify_result_png.cjs /tmp/wordle-double-png-qa`
- `node tests/browser-double-lengths.cjs`

Die ersten drei Befehle benötigen keine neue App-Laufzeitabhängigkeit.
PNG-Prüfung verwendet den vorhandenen optionalen Entwicklungsadapter
`@napi-rs/canvas`. Browserprüfung benötigt Playwright und Chromium.
Optional kann `WORDLE_BROWSER_LAUNCH` auf eine lokale JSON-Datei mit
Playwright-Launchoptionen zeigen. Die Datei wird nicht eingecheckt und darf
keine Zugangsdaten enthalten. Browser-Tests laufen nur unter localhost mit
Unterverzeichnis `/wordle-de/`, nicht gegen persönliche Produktionsdaten.

Die 20 zusätzlichen State-Testgruppen prüfen alle fünf Auswahlvarianten,
Budgetgrenzen/Sieg am letzten Versuch, Verlust, Eingabesperre, Pause/Reload,
Swipe, zufällige Neuauswahl, alte Snapshots, Unicode, Statistikfilter und
Backup-Roundtrip. Die PNG-Prüfung ergänzt erfolgreiche und verlorene
Doppel-Runden aller Längen, jeweils mit und ohne Spoiler.

Die ausgeführten Ergebnisse und Grenzen stehen in TESTING.md im Abschnitt
„Doppel-Längen 2.1.2“. Offene manuelle Prüfungen: echtes iPhone/Safari,
Android/PWA, natives Share-Sheet und der spätere PWA-Upgradepfad mit dem
Release-Cache. Emulator-/Headless-Tests sind keine Gerätetests.

## Späterer Merge

Vor Zusammenführung den dann aktuellen `main`-Stand erneut laden. Insbesondere
`app.js`, `style.css`, SW und Testdokumentation können mit dem parallel laufenden
Online-Revanche-Branch kollidieren. Konflikte gezielt zusammenführen und alle
Tests erneut ausführen; keine anderen Branches zurücksetzen oder überschreiben.
