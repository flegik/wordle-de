# PR #3 · Survivor-Raster · Prüfung und Freigabevorbereitung

Stand: 30.10.2026. **Technisch geprüft; anschließend vom Nutzer ausdrücklich zur direkten Veröffentlichung freigegeben.**

- PR: https://github.com/flegik/wordle-de/pull/3
- Branch: `feature/survivor-between-grid-v2-2-2`
- Geprüfter ursprünglicher PR-Commit: `7611bb187e747c8300f854e1cf04939458ebd6af`
- Geprüfte Produktionsbasis: `56cc8574837732990d3e34ffb1a7d224b168fef1`

## Ergebnis

Die neue Zwischenansicht zeigt ausschließlich tatsächlich bestätigte Tipps des
zuletzt abgeschlossenen Rätsels mit der bestehenden Zweipass-Farbauswertung.
Es gibt keine erfundenen Leerzeilen, nachträglichen Tipps oder neue Wertungen.
Das Raster erscheint auch während einer offenen Upgrade-Auswahl sowie für das
letzte abgeschlossene Rätsel beim Game Over. Ein unvollständiges aufgegebenes
Rätsel wird nicht als abgeschlossen dargestellt. Die vorhandene Run-Historie
und PNG-Funktion bleiben erhalten.

Das Raster ist bei langen Wortverläufen begrenzt scrollbar, mit Fokus und
Tastaturzugriff. Die letzte Zeile und die Folgeaktionen wurden tatsächlich im
Browser geprüft; Screenshots zeigen 320 Pixel und eine alte 3-Siege-Upgrade-Auswahl.

**Für bestehende Runs ist kein Neustart erforderlich.** Die Funktion liest die
bestehenden kanonischen Versuche. Survivor-Engine, Speicher-Schema 2, Speicherschlüssel,
Historien, Wortpakete und Auswahlalgorithmus werden nicht verändert. Alte
Survivor-Verträge 1/2/3 behalten ihre 3/5/7-Siege-Abstände. Neue Runs bleiben bei 7.

## Gefundene Probleme und Korrekturen

1. Die ursprüngliche PR-Suite scheiterte an einem historischen SHA-256-Test,
   der die Oberfläche bytegenau auf den damaligen Stand festlegte. Dieser
   historische UI-Stand bleibt nun als überprüfte Fixture erhalten. Die neue
   Oberfläche wird stattdessen auf echte Ausgabe und Zustandskompatibilität
   geprüft. Eingefrorene Wörter und Survivor-Regeln werden weiterhin direkt
   gegen ihre bisherigen Hashes geprüft. Kein Neuschreiben historischer Hashes.
2. Die letzte Niederlage beim Game Over erhielt keine eigene letzte Rasteransicht;
   die bisherige Run-Historie zeigte zunächst Wort 1. Jetzt wird das gerade
   beendete Raster direkt angezeigt, zusätzlich zur weiterhin verfügbaren Historie.
3. Die neue Scrollregion erhält Tastaturfokus, Beschriftung und eine vh-Rückfallebene.
4. Der bisherige Updatehandler konnte nach einem fehlgeschlagenen Speichern
   trotzdem Aktivierung bzw. Reload fortsetzen. `save()` liefert jetzt Erfolg
   oder Fehler zurück; Aktivierung/automatisches Neuladen werden bei Fehler,
   Schutzmodus oder konkurrierendem Tab angehalten. Die vorhandenen Daten werden
   dabei nicht überschrieben. Der normale Spielfluss bleibt unverändert.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `python tools/test_all.py` vollständig | bestanden, Exit 0 |
| Ursprünglicher PR-Rastertest | bestanden |
| 48 eingecheckte repräsentative Survivor-Spielstände | bestanden |
| Vorherige UI → neue Controlleransicht → erneutes Laden | Sessions und Statistik erhalten |
| Verträge 1/2/3, Herzen, Heilung, Schild, Extra, Hinweise | erhalten, einschließlich Ladungen/Position und Versuchslimit |
| Offene und gewählte Upgrades, aktiver Draft, Sieg/Verlust/Game Over | erhalten |
| Backup-Export/-Import, genau einmal gewertete Abschlüsse | bestanden |
| Acht Updatehandler-Gruppen | Speicherfehler/Konflikte/aktives Spiel verhindern Aktivierung und Reload |
| Echter Chromium: 36 Ergebnisfälle auf sechs Viewports | bestanden |
| Light Mode, reduzierte Bewegung, Touch und Hardwaretastatur | bestanden in Chromium-Emulation |
| Echter Service-Worker-Wechsel aus bisherigem Produktionsstand | drei aktive Runs erhalten |
| Offline-Neuladen nach dem Worker-Wechsel | dieselben drei Runs erhalten |
| Vorhandene klassische/Arcade-/Online-API-Regressionen | vollständige Suite bestanden |

Die 48 Fixtures sind synthetische, durch die unveränderte Engine erzeugte
repräsentative Spielstände; sie sind **keine ausgelesenen persönlichen Nutzerdaten**.
Sie umfassen historische Wortversionen de-2.2/de-2.4/de-2.5. Die persönlichen Daten
des Auftraggebers wurden nicht geöffnet oder verändert.

Die Browsermatrix umfasst 320×568, 360×640, 390×844, 430×932, 1280×900 und 844×390.
Je sechs Fälle: Sieg, Verlust, Schild, Upgrade-Angebot, acht Versuche mit sieben
Buchstaben, Game Over. Verglichen wurden alle realen Buchstaben und Farben;
kein horizontaler Überlauf, letzte Zeile scrollbar erreichbar, Touch-Aktionen
und doppelte Enter-Bestätigung geprüft. Kein JavaScript-Seitenfehler.

Browserumgebung: Playwright 1.62.1, isoliertes Chromium 153.0.8010.0 über das
separat installierte Testpaket `@sparticuz/chromium` 153.0.0. Der reguläre
Playwright-Browserdownload lieferte beschädigte ZIP-Daten. Deshalb wurde die
vorhandene Testumgebung mit diesem separaten Browser ergänzt; keine neuen
PWA-Laufzeitabhängigkeiten, keine Änderung von Projekt-Paketen.

Beim echten Update wurden drei Snapshots in einem isolierten lokalen Browserprofil
verwendet; Registrierung und Caches wurden zwischen den Fällen zurückgesetzt:
v1 mit aktivem Start-Hinweis, v2 mit Extra-Versuch, v3 mit offener Upgrade-Auswahl.
Ablauf: altes Offline-Paket → gespeicherter pausierter Run → neuer Worker wartet →
pausierte App erneut öffnen → Einstellungen/Update laden → denselben Run fortsetzen →
offline neu laden und erneut fortsetzen. Die Sessionobjekte, klassische Events und
Session-Statistiken blieben identisch. Die alte Einstellungsansicht wird bei einer
späteren Update-Erkennung nicht immer unmittelbar neu gerendert; erneutes Öffnen
bei pausiertem Spiel macht den wartenden Worker zuverlässig sichtbar.

## PWA und spätere Veröffentlichung

Vorbereiteter Cache: `v2-2-2-survivor-grid-20261030-a`.
Die bestehende vollständige Assetliste enthält UI und CSS bereits. Keine neue
Laufzeitdatei, kein automatisches `skipWaiting`, kein Löschen von localStorage,
keine Änderung der GitHub-Pages-Konfiguration, des Online-Workers oder von D1.
Der Worker räumt nur ältere Caches seines eigenen Unterverzeichnisses auf;
fehlgeschlagene Installationen lassen den vorherigen Cache erhalten.

Die ausdrückliche Veröffentlichungsfreigabe erfolgte im Anschluss an diese Prüfung.
Vor dem Merge werden PR und aktueller main erneut verglichen. Nutzer können den Run pausieren und
zusätzlich ein JSON-Backup sichern, dann regulär aktualisieren und fortsetzen.
Keine Neuinstallation oder Löschung von Browserdaten erforderlich.

## Offene Grenzen

- Physisches iPhone/Safari, Android und installierte mobile PWAs wurden nicht getestet.
- Ein Strom-/Prozessabbruch gleichzeitig mit einem Browser-Speicherfehler kann
  nicht durch diese UI-Änderung vollständig abgesichert werden. Das Update wird
  bei erkannten Speicherfehlern gestoppt und bietet weiterhin die vorhandene Sicherung.
- Der konkrete persönliche Run wurde nicht ausgelesen. Kompatibilität ist durch
  die unveränderten Spielregeln und die oben dokumentierten gespeicherten Fälle belegt.

**Technisch geprüft und nach anschließender ausdrücklicher Nutzerfreigabe zur Veröffentlichung vorgesehen.**

## Dateien

Produkt: `js/survivor-ui.js`, `style.css`, `js/app.js`, `sw.js`.
Tests: ursprünglicher Rastertest, neue Kompatibilitäts-/Update-/Browserprüfungen,
Fixtures und Generator, Test-Harness, Suite-Registrierung, historische Audit-/Cachechecks.
Dokumentation: README, TESTING, dieser Bericht und QA-Protokolle/Screenshots.

Belege: [Suite](qa/survivor-grid/full-suite.log), [Browser](qa/survivor-grid/browser.log),
[PR-Baseline](qa/survivor-grid/pr-baseline.log),
[320-Pixel-Raster](qa/survivor-grid/v2-eight-tries-seven-letters-320.png),
[390-Pixel-Upgrade](qa/survivor-grid/v1-pending-offer-390.png).
