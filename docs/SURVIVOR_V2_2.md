# Wordle Survivor 2.2 · Verträge 1 und 2

Branch: `feature/survivor-v2-2`, Basis `e96c811a473c769d799eb93c3050680a9946bdda`.
Am 15.10.2026 ausdrücklich zur Veröffentlichung freigegeben, mit Upgrades alle fünf Siege.
Keine Änderungen an Marke, Wörterbuchdaten, Cloudflare-Worker oder D1.

## Spielregeln

Drei Herzen, kein Timer. Normales Limit: 6 Versuche bei 4/5, 7 bei 6/7.
Jeder Sieg zählt ein Wort. Eine Niederlage kostet ein Herz, sofern kein Schild
bereitsteht. Bei null Herzen endet der Run (`completed`, nicht ein klassischer
Wordle-Verlust). Ein bestätigtes freiwilliges Ende ist `abandoned` mit den
wirklich erspielten Punkten. Pause, Hauptmenü, Hintergrund und Reload sind
keine Niederlagen. Hard Mode ist pro Survivor-Runde aus, global unverändert.

Punkte pro Sieg = `(Länge − 3) × 100 + max(0, normales Limit − Versuche) × 20`.
Damit sind Grundpunkte 100/200/300/400. Ein Extra-Versuch erzeugt keinen
zusätzlichen Effizienzbonus. Verluste und offene Rätsel geben keine Punkte.

| Gelöste Wörter vor dem nächsten Rätsel | 4 / 5 / 6 / 7 Buchstaben |
|---|---|
| 0–5 | 65 % / 35 % / 0 / 0 |
| 6–14 | 15 % / 55 % / 30 % / 0 |
| 15–29 | 5 % / 35 % / 50 % / 10 % |
| ab 30 | 0 / 20 % / 55 % / 25 % |

Die Länge wird vor jedem neuen Rätsel gezogen und dann zusammen mit dem Ziel
fest gespeichert. `WordSelection.draw` erhält Modus `survivor` mit A/B-Gewichten
90/10 und ohne C. Ein eigener `state.survivorSelection` verwendet denselben
Beutelalgorithmus, aber verändert die Auswahlhistorien bestehender Modi nicht.
Auch am Poolende werden nur A/B-Beutel neu gefüllt. Bestehende freie Modi
behalten ihre bisherigen Gewichte, vollständigen Pools und deren Reihenfolge.
Historische Sessions lösen ihr gespeichertes Wortpaket auf; die Auswahl weiterer
Wörter bleibt innerhalb dieses Pakets, möglichst mit weiterhin klassifizierten
A/B-Wörtern. de-1/de-2/de-2.1/de-2.2 bleiben unverändert vorhanden.

## Upgrade-Vertrag

Neue Runs (Vertrag 2): Nach jedem fünften **Sieg**, unabhängig von dazwischenliegenden Niederlagen,
wird genau ein Ereignis mit drei unterschiedlichen nutzbaren Optionen gespeichert.
Es gibt Heilung (+1 bis 3), einen nicht stapelbaren Schild, Extra-Versuch
(+3 Rätsel-Ladungen) und Start-Hinweis (+2 Rätsel-Ladungen).
Zusätzliche Ladungen werden addiert, niemals mehrere Extra-Versuche oder
Hinweise pro Rätsel vergeben. Ladungen werden beim Start eines Rätsels
verbraucht; die Konfiguration des laufenden Rätsels behält dessen Effekt.

Heilung bei vollen Herzen und ein weiterer bereits vorhandener Schild sind
nicht nutzbar. Sind weniger als drei Arten sinnvoll, bietet die UI explizit nur
diese Arten an: etwa zwei bei vollen Herzen mit bereitstehendem Schild. Kein
Dummy-Effekt, Ersatzpunkt oder erneuter Zufall nach Reload. Gewählte Optionen
werden samt zugehöriger Rundennummer geprüft; doppelte/stale Klicks wirken nicht.

Ein Hinweis speichert nur `hintIndex` in seiner Runde. Der Buchstabe wird aus
deren festem Ziel abgeleitet und als ausdrücklicher Positionshinweis angezeigt.
Er ist kein Versuch und füllt den Draft nicht heimlich. Die Tastatur berücksichtigt
diesen bekannten grünen Buchstaben. Normale Eingaben bleiben frei möglich.

## Session, Replay und Datensicherheit

`js/survivor.js` baut auf `Sessions.createRound/createSession/appendAttempt/finish`
und der bestehenden Engine auf. `js/survivor-ui.js` rendert mit der gemeinsamen
QWERTZ-Tastatur. `app.js` übernimmt Eingaben, Lease-Speicherung und Übergänge.
Es gibt keinen zweiten Wordle-Auswerter und keinen neuen Speicherschlüssel.

Schema bleibt 2 (`wordle-de:v2`). Survivor speichert zusätzlich:

- `survivorVersion:2` für neue Runs (1 wird unverändert akzeptiert), `input`;
- kanonische `attempts` und Rundenkonfigurationen im bestehenden Format;
- `roundEnds`: geordnete `{roundId, reason, attemptIndex}`;
- `upgrades`: `{afterRound, offered, picked}`, wobei `picked:null` die offene
  Auswahl exakt wiederherstellt.

Herzen, Schild, Restladungen, Punkte und Fortschritt werden durch einen
geordneten Replay abgeleitet. Der aktuelle Bildschirm ergibt sich aus offenen
Runden, Grenzen und Entscheidungen. Kein separat veränderbarer Lebenszähler.
Nur der bisherige terminale Session-/Event-Vertrag enthält zusätzlich einen
Score-Snapshot, der gegen die vollständige Historie geprüft wird.

Die Validierung prüft richtige Reihenfolge, genau einen aktiven Run, Zuordnung
jedes Tipps zu seiner Runde, normale/erhöhte Limits, vollständige Siege/Verluste,
Hinweispositionen, nutzbare Angebote, genau eine Entscheidung pro Meilenstein,
Herzen und terminale Punkte. Ergebnisse werden über vorhandene Session-IDs exakt
einmal erfasst. Ungültige Daten und Schreibkonflikte behalten den Schutzmodus.

Klassiker-, Daily-, Streak-, Doppel-, Tower-, Speedrun-, Themen- und Duellstände
bleiben getrennt. Backups enthalten alle Survivor-Informationen einschließlich
Beuteln und offener Auswahl. Neue Survivor-Backups brauchen einen Client mit
Survivor-Unterstützung; ältere Clients kennen den Modus nicht.

Der generische Import-Sicherheitsrahmen erlaubt für Survivor bis 100.000 Runden/
Versuche, während die bisherigen 1.000er-Grenzen anderer Modi unverändert bleiben.
Es gibt kein normales spielerisches Run-Limit. Sehr lange Historien erhöhen
Validierungszeit, Backupgröße und localStorage-Bedarf; keine automatische Löschung.
Bei Quota-Fehlern greift der bestehende Schutz-/Exporthinweis. Lokale Daten sind
nicht manipulationssicher und es gibt keine serverseitige Rangliste.

## Oberfläche, Ergebnis und PWA

Eigenständige Intro-, Spiel-, Rätselabschluss-, Upgrade- und Game-Over-Ansichten.
Der HUD zeigt Herzen, Punkte, gelöste Wörter, Rätselnummer, nächsten Meilenstein
und aktive Effekte. Die Tastatur bleibt außerhalb eines begrenzten Scrollrasters;
nur die aktuelle Zeile wird im inneren Bereich nachgeführt. CSS berücksichtigt
sichere Bildschirmränder, sieben Spalten, kleine Höhen und reduzierte Bewegung.
Ein bestätigter Tipp wird vor Animation gespeichert und gegen Mehrfacheingaben
gesperrt. Ergebnisübersichten und Auswahlen brauchen keine erzwungene Wartezeit.

Survivor nutzt vorhandenes Textsharing und PNG-System. Die Run-Zusammenfassung
zeigt Punkte, gelöste Wörter, verlorene Rätsel, Versuche und Upgradezahl. Historien
bleiben über eine Wortauswahl zugänglich. PNG rendert eine ausgewählte echte
Wort-Historie statt ein unbeschränkt langes Gesamtbild. Ohne aktivierte
Spoiler-Option enthält das Bild keine Buchstaben oder Lösungen.

Zwei neue Runtime-Dateien sind vor storage/app geladen und im SW enthalten.
Der freigegebene Release verwendet den neuen Cache `v2-2-release-20261015-a`.
Bestehende Installationen erhalten das Update über die vorhandene Update-Aktivierung.

## Testkopie und tatsächliche Prüfgrenzen

`tools/build_survivor_preview.py` erstellt eine getrennte statische Kopie außerhalb
des Repositories. Dort: eigener Test-Cache, sichtbare Testkennung, eigener Origin,
Online-API leer und Online-Menükarte entfernt. Keine produktiven Duell-Anfragen
oder Spielerstände; Nutzer können manuell ein Backup importieren, falls gewünscht.
Hosting über eine neue owner-private Sites-Testseite, nicht GitHub Pages main.
Erster Zugriff erfordert ggf. ChatGPT-Anmeldung. Quelle und Lizenzhinweise bleiben
enthalten. Ein Test-Run zählt ausschließlich im Speicher dieses Test-Origins.

Baselinesuite und vollständige erweiterte Suite wurden ausgeführt. Neue Tests:
23 Core-/Replay-/Storage-/Auswahlgruppen, 14 Controllergruppen und 3 Render-/Asset-
Vertragsgruppen. Die PNG-Prüfung erzeugte 108 echte Bilder und dekodierte sie;
wiederholte Exporte waren bytegleich. PNG-Adapter ist kein Browser oder Share-Sheet.
Ein realer Browserstart scheiterte am fehlenden Chromium. Es werden keine neuen
Survivor-Browser-, Pixel-Layout-, Installations- oder Gerätetests behauptet.

Noch vor produktiver Freigabe manuell prüfen: 320×568, 360×640, 390 und 430 Pixel,
iPhone Safari/PWA, Android/PWA, Touch-/Hardwareeingabe, PNG-Share-Sheet, Offline-
Installation und späterer Upgradepfad. Besonders Upgrade-Auswahl, laufenden
Start-Hinweis und ein Rätsel mit Extra-Versuch auf dem Smartphone fortsetzen.


## Isolierte Testbereitstellung

Private Test-URL: https://wordle-survivor-v2-2-test.keen-elm-5553.chatgpt.site

Sites-Projekt `appgprj_6ad120f8fee8819190cc602e46148b1f`, Quellcommit
`9b89a757bc27650c434ad982c3891aa1cdc1c997`. Deployment
`appgdep_6ad1229dd8888191a8cfefa2bc0ada84` meldete `succeeded`.
Kein Browserbesuch oder echter Geräte-Smoke-Test wird damit behauptet.
Die private Seite kann beim ersten Öffnen eine ChatGPT-Anmeldung verlangen.
Prüfprotokolle: `docs/qa/survivor-automated.log`, `survivor-png.log` und
`survivor-browser-unavailable.log`.

## Freigegebener Release und Balanceänderung

Nutzerfreigabe: „Upgrade nur alle 5 Gelöste … veröffentlichen direkt“.
Neue Runs tragen `survivorVersion:2`; Regeln, HUD, Angebote und Eventvalidierung
verwenden durchgängig fünf Siege. Verluste zählen nicht zum Meilenstein.
Unverändert: drei Herzen, Extra-Versuch für drei Rätsel, Hinweis für zwei.
Alte Test-Runs/Backups mit Vertrag 1 behalten ihren Drei-Siege-Rhythmus inklusive
offener Auswahl und bereits verbrauchter Ladungen. Keine rückwirkende Neuwertung,
kein veränderter Schema-/Speicherschlüssel. Das Menü zeigt bei Fortsetzung den
zur Session passenden Rhythmus. Neue Historien speichern ihre Vertragsversion.

Tests ergänzen 5/10/15-Grenzen, Reload/Backup dazwischen sowie alte offene
Auswahlen, aktive Hinweise und abgeschlossene Events mit Vertrag 1. Vollständiger
Release-Testlauf: `docs/qa/survivor-release-tests.log`. Browser-/Gerätetests bleiben
wie oben begrenzt; die Veröffentlichung wurde trotz dieser dokumentierten
Prüfgrenzen ausdrücklich freigegeben. Der private Testlink oben dokumentiert den
ersten Drei-Siege-Teststand; der veröffentlichte Fünf-Siege-Stand liegt auf Pages.
