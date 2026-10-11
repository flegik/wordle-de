# WORDLE DE 2.0 · Phase 3: Wordle Tower

Ausgangspunkt ist der vollständig committed Phase-2-Stand
`c1ad4136baef852b674bc4c19ca8c0ed3eab232d`. Alle 57 lokalen Dateien wurden vor
Änderungen bytegleich mit dem tatsächlichen GitHub-Tree abgeglichen, sämtliche
62 bisherigen Testgruppen bestanden. Entwicklung nur auf `feature/arcade-v2`.
Keine Änderungen an main, produktivem Pages, Releases oder Wortdaten.

Umsetzungscommit: [`1683cbc`](https://github.com/flegik/wordle-de/commit/1683cbc6a2b7e023ad46c93d813d4f215f758ccd).

## Implementierte Funktionen

Vier aufeinanderfolgende Lösungswörter mit 4, 5, 6 und 7 Buchstaben. Gemeinsames
Budget exakt **20**. Ein gültiger Tipp kostet einmalig einen Versuch und betrifft
nur die aktive Etage. Ungültige Wörter, falsche Länge und wiederholte Tipps auf
derselben Etage kosten nichts. Kein separates Etagenlimit, keine Zusatzleben,
Zeitbegrenzung oder Budgetauffüllung. Ein Wort kann auch im neunten oder späteren
Etagenversuch gelöst werden. Die vierte Lösung im zwanzigsten Versuch gewinnt.
Wird eine frühere Etage im zwanzigsten Versuch gelöst, ist der Run verloren:
Es wird keine nächste Etage betreten. Gelöste Etagen erhalten keine weiteren Tipps.

Eigene Tower-Startansicht mit vertikalem Etagenpfad, Regelerklärung, persönlichem
Rekord und Start-/Fortsetzenbutton. Arcade-Menüeintrag, deutsche gemeinsame
Tastatur, Pause, bestätigter Abbruch, Etagenübergang und Ergebnisse. Der Übergang
zeigt Etagenversuche, Lösung, Restbudget und nächste Länge. Sein Weiterbutton
ist unmittelbar bedienbar, sobald der kurze Wordle-Flip abgeschlossen ist.
Andere geplante Modi wurden nicht begonnen und haben keine Platzhalterbuttons.

## Architektur und gemeinsames Budget

`js/tower.js` ergänzt den Modusvertrag auf Basis von `Sessions.createRound`,
`createSession`, `appendAttempt`, `roundView` und `finish`. `Engine.evaluate` und
die NFC-/ẞ-Normalisierung werden unverändert wiederverwendet. Tower hat vier
`WordRound`-Konfigurationen; deren `attemptLimit` ist jeweils **20**, keine
klassischen 6/7. Das ist nur die technische Obergrenze: nach Verbrauch der
20 gemeinsamen Versuche kann keine Etage zusätzliche Versuche erhalten.

Jeder kanonische Versuch besitzt genau eine Round-ID der aktuellen Etage.
Validierung spielt die chronologische Historie nach: erst ein exakter Treffer
schaltet die folgende Wortlänge frei, keine übersprungenen oder wieder geöffneten
Etagen. Endstatus, Budget, Ziele, Eingabe und Übergang werden zusätzlich geprüft.
Keine Veränderungen an der generischen Session-Grundlage oder Doppel-Regeln nötig.

`WordleTower.progress` leitet abgeschlossene Etagen, aktive Runde, verbrauchte und
verbleibende Versuche aus der Historie ab. Diese Zähler werden **nicht** separat
persistiert. Start-ID, vier Ziele, Wortversion, Zeitpunkte und Abschlussstatus
nutzen die bestehende Session-Struktur. Ein einziges zusätzliches UI-Feld
`pendingTransition` hält die ID der gerade gelösten Etage, deren Übergang noch
nicht bestätigt wurde; `null` bedeutet Spielansicht. Dieser Bestätigungszustand
ist aus den Eingaben allein nicht ableitbar. `input` speichert den Draft.

Hard Mode ist nur im Tower ausgeschaltet und wird in der Startansicht erklärt.
Die globale Einstellung und die klassischen sowie Doppel-Regeln bleiben erhalten.
Alle vier Ziele werden einmalig beim Start aus den bestehenden längenbezogenen
Wortbeuteln gezogen; damit greift der gemeinsame Anti-Wiederholungsschutz.
Beim Fortsetzen werden sie nicht neu gewählt. `de-1` bleibt bytegleich, einschließlich
LEGAT als möglicher Fünferlösung. PESEL/Audit-Bereinigung bleibt für de-2 vorgemerkt.
Tagesrätsel werden weder aus den Beuteln gezogen noch in dieser Phase verändert.

## Speicherung und Statistik

Schema **2**, derselbe Schlüssel `wordle-de:v2`, dieselbe Backup-Import-/Export-
und idempotente Schema-1-Migration. `js/storage.js` prüft den Tower-Vertrag für
Sessions und Ereignisse. Unbekannte/ungültige Daten werden vor Import/Writes
abgewiesen; die vorhandene Schutzfunktion lässt die Originaldaten unberührt.
Ein neues Speichersystem wurde nicht eingeführt.

Die UI speichert gültige Eingaben und Abschluss **vor** den Animationen. Ein
Browserneustart setzt Draft, Ziele, Budget, aktive Etage und ausstehende Übergänge
fort. Eine laufende Tower-Session wird über den Fortsetzenbutton wieder geöffnet;
sie wird nicht von einem erneuten Start überschrieben. Pause/Seitenwechsel erzeugt
keine Niederlage. Abbruch verlangt Bestätigung und wird über `recordSession`
exakt einmal als `abandoned` erfasst. Lade-/Backup-Vorgänge erzeugen keine Wertung.

Tower-Siege sind eine Session, nicht vier klassische Siege. `events` und
Doppel-Events bleiben unverändert. `WordleTower.summary` filtert nur Tower-Events
und liefert Runs, Siege, Niederlagen inklusive Abbruch, separate Abbruchzahl,
Quote, Siegesserien, höchste erreichte Etage und mittlere abgeschlossene Etagen.
Durchschnitte für verbrauchte/restliche Versuche sowie der Restbudget-Rekord
berücksichtigen ausschließlich vollständige Siege; größere Restbudgets sind besser.

Tower-Ereignisse ergänzen `reachedFloor` als historischen, aus dem abgeschlossenen
Sessionzustand erzeugten Statistik-Snapshot. Das ist kein zweiter veränderbarer
Sessionzähler. Ein Übergang nach Etage 1 bedeutet „1 abgeschlossen, 1 erreicht“;
erst der Weiterbutton betritt Etage 2. Beim Budgetende wird die zuletzt tatsächlich
bespielte Etage aus den Round-IDs ermittelt. Beispiel: die dritte Lösung im
zwanzigsten Versuch bedeutet „3 abgeschlossen, 3 erreicht“, nicht Etage 4.
Der Storage-Abgleich prüft den Snapshot gegen die vollständige Session.

Der Modusfilter im Statistikmenü wurde zu einer gemeinsam verwendeten Funktion
zusammengefasst, damit Tower aus Klassiker- und Doppel-Ansichten erreichbar bleibt.
Die Kennzahlen anderer Modi werden weiterhin von deren bestehenden Funktionen
berechnet. Niederlagen nach erreichter Etage enthalten bestätigte Abbrüche;
die Beschriftung verwechselt dies nicht mit einer ungelösten Etage.

## Mobiles Layout und Feedback

`js/tower-ui.js` rendert Markup; Eingabecontroller bleibt in `app.js`.
Die deutsche Tastatur kommt aus dem bestehenden `DoubleUI.keyboard`, inklusive
Ä/Ö/Ü/ẞ. Tastaturfarben beziehen sich nur auf die aktuelle Etage und werden beim
Wechsel aus deren leerer Historie neu abgeleitet.

Die Spielansicht nutzt die verfügbare `100dvh`-Höhe einschließlich Safe-Area-Padding.
Kopfzeile, vierteilige Fortschrittsleiste, Restbudget und Tastatur bleiben außerhalb
des scrollbaren Rasters. Im Raster werden mindestens fünf Zeilen als ruhige
Grundfläche gezeigt; darüber wächst es nur mit tatsächlichen Tipps und der
aktuellen Eingabe, statt permanent 20 Zeilen zu rendern. Die Historie bleibt
zugänglich, die aktuelle Zeile wird nach Eingabe/Reload in den **inneren**
Scrollbereich geholt. Ein „Aktuelle Zeile“-Button führt aus alten Hinweisen zurück.
Die DOM-Geometrie dieses Helpers ist im Adapter getestet, nicht visuell zertifiziert.

Kurze Displays erhalten kompaktere Abstände; Desktop bietet mehr Rasterbreite.
Richtungs- und Statuswörter ergänzen Farben, Raster sind für Assistenztechnik
beschriftet, der Historienbereich ist fokussierbar. Es gibt keine native
Texteingabe, die zusätzlich eine mobile Systemtastatur öffnen müsste.

Flip, kurzer Etagensieg, markierte nächste freigeschaltete Etage sowie Tower- und
Rekordeffekt verwenden lokale CSS-Animationen und vorhandene optionale Sounds.
Die Eingabe bleibt während Auswertung/Übergang gesperrt. Animationen verändern
keine Regeln oder Budgets. Reduzierte Bewegung gilt aus App und Betriebssystem.

Share benutzt die vorhandene Web-Share-/Clipboard-/manuelle Textfunktion.
Nur tatsächlich gelöste Etagen erhalten ein Erfolgszeichen. Etagenversuche,
Gesamtbudget und Restversuche sind enthalten, **keine Lösungswörter**. Bei
Niederlage werden nicht erreichte Etagen nicht als erfolgreich dargestellt.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `js/tower.js` (neu) | Tower-Vertrag, Progression, Übergang, Statistik, Share |
| `js/tower-ui.js` (neu) | Start, Raster, Übergang, Ergebnis, Statistik |
| `js/app.js` | Tower-Routing, gemeinsamer Session-Speicherhelper, Input-Lock, Scrollhilfe, Modusfilter |
| `js/storage.js` | Tower-State-/Event-Validation, modespezifischer Ergebnis-Snapshot |
| `index.html` | Zwei neue lokale Scripts in Abhängigkeitsreihenfolge, Modusbeschreibung |
| `style.css` | Scoped Tower-Layout, Historienbereich, Fortschritt, Effekte |
| `sw.js` | Tower-Dateien im Precache, Cache-Version bleibt v1 |
| `tests/tower.test.cjs` (neu) | 17 Regel-/Budget-/Statistik-/Backup-Gruppen |
| `tests/tower-app.test.cjs` (neu) | 14 Controller-/Persistenz-/Sharing-/Scroll-Gruppen |
| `tests/browser-tower.cjs` (neu) | Optionaler Browserlauf für mobile Breiten/Offline |
| `tests/sw.test.cjs` | Alle 17 Assets abgedeckt |
| `tools/test_all.py` | Tower-Syntaxprüfungen und Tests |
| `README.md`, `TESTING.md`, dieser Bericht | Aktueller Stand, Ausführung, offene Checks |

Unverändert: Spielkern, generische Sessions, Doppel-Regeln/-UI, Wortdaten,
Generator/Audit, Manifest, Icons, Lizenzen und Pages-Konfiguration.
Keine externen Laufzeitabhängigkeiten hinzugefügt.

## Tatsächlich ausgeführte Tests

Baseline: **62 Gruppen bestanden**. Gesamtlauf nach Implementierung:
`python tools/test_all.py` → **93 Gruppen bestanden**, davon 17 Tower-Regelgruppen
und 14 Tower-Controllergruppen. Alle bestehenden klassischen und Doppel-Tests
bestehen weiter. Neun Runtime-Syntaxprüfungen, Syntaxprüfung des optionalen
Browserchecks, `git diff --check`, unveränderte 1461 UTC-Tagesrätsel-Fixtures und
bytegleiche Reproduktion des Wortaudits gehören ebenfalls zu den Prüfungen.

Die Tower-Tests decken alle wesentlichen Budget-/Etagen-Grenzfälle, lange
Verläufe, Sieg mit Tipp 20, frühere Lösung mit Tipp 20, Versuch ohne Treffer bei
Budgetende, gespeicherte Übergänge, Reload/Draft, Abbruchbestätigung, einmalige
Statistik, erreichte/gelöste Etagen, gewinnabhängige Rekorde, Hard-Mode-Ausnahme,
Unicode/Mehrfachbuchstaben, Backup-Kompatibilität und spoilerfreies Teilen ab.

**Echte Browser-/Gerätetests sind offen.** Chromium-Start wurde versucht;
Playwright meldet weiterhin „Executable doesn't exist“. Der neue Browsercheck
scheitert beim Start aus demselben Grund. Es wurde kein Layout bei den genannten
Breiten gerendert und kein Touch-/Offline-/Installations-Pass behauptet.
Der frühere Downloadfehler gehört zu Phase 2; kein erneuter Download in Phase 3.
Eine vollständige manuelle Checkliste steht in `TESTING.md`.

## Bekannte Grenzen und nächste Phase

1. Vor UI-Freigabe auf 320/360/390/430 px und echten Android-/iPhone-Geräten
   prüfen: langer Rasterverlauf, Safe Areas, native Share-/Backup-Dialoge,
   Flip/Etagenübergang und reduzierte Bewegung. Der optionale Browsercheck ist
   vorbereitet, konnte hier aber selbst noch nicht im Browser validiert werden.
2. Das bestehende localStorage-Verfahren ist Last-Write-Wins, keine atomare
   Mehrtab-Transaktion. Vollständige Session-Historien wachsen; Quota-/Zugriffsfehler
   aktivieren die bestehende Warnung und Backup-Möglichkeit.
3. Release-Kriterien aus Phase 1 bleiben offen: v1/v2-Konfliktübernahme,
   freigegebene de-2-Wortqualität und Tagesrätsel-Versionspolitik.
4. Beide neuen Runtime-Dateien sind im Branch-Precache. Die produktive
   Cache-Version wurde absichtlich nicht erhöht. Vor dem gemeinsamen Release
   eindeutige neue Cache-Version und echtes Offline-Upgrade testen; den
   Entwicklungsstand niemals auf dem produktiven Origin servieren.
5. Zuerst Tower zusammen prüfen. Danach kann eine ausdrücklich beauftragte
   Speedrun-Phase auf den vorhandenen Sessions aufbauen; vor Implementierung
   Zeitmessung bei Hintergrund/Reload und Punktewertung festlegen. Speedrun,
   Themen und Duell wurden hier nicht begonnen.
