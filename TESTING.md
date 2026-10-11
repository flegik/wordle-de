# Phase 3 · Wordle Tower, ausschließlich Entwicklungsbranch

Ausgeführt: `python tools/test_all.py` — **93 Testgruppen bestanden**, davon
31 neu für Tower. Die 62 vorhandenen Gruppen aus Phase 2 bestehen weiterhin.

| Suite | Gruppen | Prüfung |
|---|---:|---|
| `tests/engine.test.cjs` | 8 | Regeln / Daten / Konfiguration |
| `tests/app.test.cjs` | 8 | Klassische Modi, DOM-Adapter |
| `tests/sw.test.cjs` | 4 | Cache-Adapter, jetzt 17 Runtime-Assets |
| `tests/double.test.cjs` | 10 | Doppel-Regeln / Statistik / Backups |
| `tests/double-app.test.cjs` | 11 | Doppel-Controller, DOM-Adapter |
| `tests/tower.test.cjs` | 17 | Tower-Regeln / Budget / Statistik / Backups |
| `tests/tower-app.test.cjs` | 14 | Tower-Controller / UI-Zustand / Scroll-Geometrie, Adapter |
| `tests/storage.test.cjs` | 10 | Migration / Sessions / Tagesrätsel |
| `tests/app-storage.test.cjs` | 6 | Migration in der UI, DOM-Adapter |
| `tests/audit.test.py` | 5 | Reproduzierbarer Audit / unverändertes de-1 |
| **Gesamt** | **93** | **Bestanden** |

Zusätzlich: neun Runtime-JS-Syntaxprüfungen, Syntaxprüfung von
`tests/browser-tower.cjs`, `git diff --check`, unveränderte 1461 Tagesrätsel-Fixtures.
Der DOM-Adapter lädt die Scripts aus der tatsächlichen `index.html`.

Der Browserstart wurde erneut versucht: Playwright vorhanden, Chromium-Executable
fehlt. Auch `tests/browser-tower.cjs` wurde gestartet und scheitert an genau dieser
Voraussetzung. **Keine** tatsächlichen Render-/Layout-, Touch-, Geräte-, PWA-
Installations- oder Offline-Browsertests durchgeführt. In Phase 3 wurde kein
neuer Browserdownload versucht; der fehlgeschlagene Download stammt aus Phase 2.

Optional mit installiertem Playwright und Chromium:
`node tests/browser-tower.cjs`. Kein App-Laufzeitpaket nötig. Der Check startet
einen isolierten lokalen Server und ist für 320/360/390/430/1000 px, langen
Verlauf, aktuelle Eingabe, Tastatur, Touch-Taps, Hardwareeingabe, Reload eines
Übergangs, vollständigen Aufstieg und Offline-Bootstrap vorgesehen. Sein Ablauf
ist hier noch nicht im Browser validiert.

## Offene manuelle Tower-Prüfung

- [ ] Android Chrome, Samsung Internet, iPhone Safari und installierte iPhone-PWA.
- [ ] 320 × 568, 360 × 640, 390 und 430 px, Desktop und Querformat:
  Safe Areas, Etagenleiste, Restbudget, aktuelle Zeile und Tastatur sichtbar.
- [ ] 15–19 Tipps auf derselben Etage: Historie scrollen, „Aktuelle Zeile“ wählen;
  aktuelle Eingabe bleibt sichtbar, keine versehentlichen Tastendrücke beim Scrollen.
- [ ] Touch und Hardwaretastatur einschließlich Ä/Ö/Ü/ß/ẞ/Enter/Backspace;
  rasches Enter während Flip erzeugt nur einen Versuch.
- [ ] Etage lösen, während Flip schließen, Übergang wieder öffnen, weitergehen;
  Budget, Hinweise, Ziele und Übergang sind unverändert.
- [ ] Pause und Browserneustart; Abbruch ablehnen, danach bestätigen;
  erreichte/abgeschlossene Etage und einmalige Wertung stimmen.
- [ ] Vier vollständige Etagen, Verlust auf jeder Etage und letzter Versuch:
  vierte Lösung mit Tipp 20 gewinnt, frühere Lösung mit Tipp 20 verliert.
- [ ] Dark/Light, OS-/App-Animationseinstellungen, Gewinn-/Rekordeffekt und Sound.
- [ ] Getrennte Tower-/Doppel-/Klassiker-Statistiken, mobile Backups, Bestätigung
  vor Import, beschädigte Backups ohne Überschreiben vorhandener Daten.
- [ ] Android/iOS Share-Sheet, Clipboard und manueller Kopierdialog ohne Lösungen.
- [ ] Offline-Neustart auf isoliertem Origin, alle 17 Assets und Unterverzeichnis;
  Worker-Update auf bestehender PWA erst als späterer Release-Test.

---

## Historischer Prüfstand Phase 2

# Phase 2 · Doppeltes Wordle, ausschließlich Entwicklungsbranch

Tatsächlich ausgeführt: `python tools/test_all.py` — **62 Testgruppen bestanden**.

| Suite | Gruppen | Art |
|---|---:|---|
| `tests/engine.test.cjs` | 8 | Regeln, Daten, Konfiguration |
| `tests/app.test.cjs` | 8 | Bisherige Modi, DOM-Adapter |
| `tests/sw.test.cjs` | 4 | Offline-/Precache-Adapter |
| `tests/double.test.cjs` | 10 | Doppel-Regeln, Statistik, Backups |
| `tests/double-app.test.cjs` | 11 | Doppel-Bedienung, DOM-Adapter |
| `tests/storage.test.cjs` | 10 | Schema-1/2, Sessions, Tagesrätsel |
| `tests/app-storage.test.cjs` | 6 | Migration in der UI, DOM-Adapter |
| `tests/audit.test.py` | 5 | Unveränderte Wortbasis, Audit |
| **Gesamt** | **62** | **Bestanden** |

Zusätzlich: Syntaxprüfung von sieben Runtime-JS-Dateien, Syntaxprüfung des
optionalen Browserchecks und `git diff --check`. Der DOM-Adapter lädt jetzt die
Scripts in der tatsächlichen Reihenfolge aus `index.html`; dadurch werden fehlende
Einstiegsdatei-Abhängigkeiten mitgeprüft. Offline-Adapter deckt alle 15 Assets ab.

## Browserprüfung: versucht, nicht bestanden / nicht ausgeführt

Playwright ist in der Entwicklungsumgebung vorhanden, Chromium jedoch nicht.
Der Installationsversuch scheiterte an einem unbrauchbaren Downloadarchiv.
`tests/browser-double.cjs` wurde gestartet und scheiterte beim Browserstart:
„Executable doesn't exist“. Es wurde **kein Layout gerendert**, keine reale
Touchbedienung, Geräteinstallation oder Offline-Browserprüfung durchgeführt.
Dies ist kein Fehler in einem ausgeführten Spieltest und kein Browser-Pass.

Optionaler reproduzierbarer Browserlauf auf einer Umgebung mit Playwright und
Chromium: `node tests/browser-double.cjs`. Diese Entwicklungsabhängigkeit ist
nicht Teil der App. Das Script startet einen temporären lokalen Server und prüft
320, 360, 390, 430 und 1000 Pixel, Touch-Taps, Hardwareeingaben, Rasterwechsel,
Spielgewinn, horizontalen Überlauf und Offline-Neuladen im Unterverzeichnis.
Sein Ablauf konnte hier noch nicht in einem Browser validiert werden.

## Noch notwendige manuelle Doppel-Checks

- [ ] Android Chrome, Samsung Internet, iPhone Safari und installierte iPhone-PWA.
- [ ] Breiten 320/360/390/430 px, insbesondere 320 × 568 und 360 × 640:
  acht Zeilen, beide Karten und Tastatur; bei nötigem Scrollen bleibt alles erreichbar.
- [ ] Desktop ab 800 px: beide Raster sichtbar, gewählte Tastatur eindeutig.
- [ ] Alle acht Kartenhinweise lesbar; Antippen und horizontales Wischen wechseln.
- [ ] Flip beider Karten, aktives großes Raster und Gewinnübergang visuell passend;
  reduzierte Bewegung im OS und in den Einstellungen deaktiviert Animationen.
- [ ] Fingerbedienung und physische Ä/Ö/Ü/ß/ẞ, Enter, Backspace; rasches Tippen.
- [ ] Ein Wort lösen, pausieren, Browser vollständig beenden, fortsetzen;
  Ziele, Eingabe, Hinweise, Auswahl und gelöstes Raster bleiben erhalten.
- [ ] Abbruch zunächst ablehnen, danach bestätigen; genau eine Niederlage.
- [ ] Share-Sheet Android/iOS, Clipboard, verweigerte Berechtigung, manueller Dialog;
  kein Lösungswort im Text, keine zusätzlichen Rasterzeilen nach einem Sieg.
- [ ] JSON auf dem Handy herunterladen, im zweiten Browser importieren;
  Import abbrechen/bestätigen; klassische Daten bleiben erhalten.
- [ ] Auf isoliertem HTTPS-/Localhost-Origin installieren, Flugmodus, Neustart;
  sämtliche neuen Dateien verfügbar. Produktives Cache-Update erst beim Gesamt-Release.

---

## Historischer Prüfstand Phase 1

# Phase 1 · WORDLE DE 2.0, ausschließlich Entwicklungsbranch

Gesamtlauf: `python tools/test_all.py` (Python 3 + Node.js, keine Pakete).

| Suite | Testgruppen | Ausgeführt |
|---|---:|---|
| `tests/engine.test.cjs` | 8 | Bestanden |
| `tests/app.test.cjs` | 8 | Bestanden, DOM-Adapter |
| `tests/sw.test.cjs` | 4 | Bestanden, Cache-Adapter |
| `tests/storage.test.cjs` | 10 | Bestanden |
| `tests/app-storage.test.cjs` | 6 | Bestanden, DOM-Adapter |
| `tests/audit.test.py` | 5 | Bestanden |
| **Gesamt** | **41** | **Bestanden** |

Zusätzlich Syntaxprüfung der fünf Runtime-JS-Dateien, `git diff --check`,
vollständiger bytegleicher Abgleich der ursprünglichen 30 Dateien gegen GitHub,
1461 eingefrorene de-1-Tagesrätsel, reproduzierbarer Audit aller 5574 Lösungen.

Die Schema-1-Fixture ist **repräsentativ**, kein echter Nutzerdatenexport. Sie
enthält Siege/Niederlagen/Abbruch, alle bisherigen Modi, abgeschlossene
Tageswertung, Streak-Rekord, Wortbeutel, pausiertes HUNNI und eine Umlaut-/ẞ-Runde.
Sie wurde zunächst mit der unveränderten Engine validiert. Migration muss sämtliche
alten Felder erhalten, wiederholbar sein und keine weiteren Ereignisse erzeugen.

Neu getestet: mehrere Boards mit einer gemeinsamen Eingabe und getrennten Farben,
Budgets, Hard Mode, ID-Kollisionen, getrennte Rekorde, Schema-1/2-Backups,
beschädigte/unknown Speicher, Quota-/Zugriffsfehler, geschützter Originalexport,
Bestätigung vor Import, ungültige Schreibzugriffe aus anderem Tab, physische
deutsche Tasten im Adapter und vollständige HTML-Asset-Precache-Abdeckung.

**Nicht durchgeführt:** echte Android-/iOS-/Desktop-Browser-Tests, Layout- und
Touchprüfung, reale Installation, Offline-Neustart und Worker-Update eines
bestehenden Spielergeräts. Diese bleiben manuelle Release-Checks. Das neue
Offline-Paket wurde nur im Cache-Adapter überprüft; v1-Cache darf vor Release
auf einem schon produktiv besuchten Origin nicht mit diesen Assets verwendet werden.

Die gemeinsame Live-Veröffentlichung und de-2-Migration sind noch nicht freigegeben.
Konfliktübernahme von parallel weitergeschriebenen v1-Speichern und die
Tagesrätsel-Versionspolitik stehen als Release-Kriterien im Wortversionsplan.

---

# Qualitätskontrolle

## Tatsächlich ausgeführt

- `node --check js/app.js`, `node --check js/engine.js`, `node --check sw.js`: Syntax gültig.
- `node tests/engine.test.cjs`: **8 Testgruppen erfolgreich**. NFC, ß/ẞ, Mehrfachbuchstaben, Längen aller Daten, LEGAT, deterministisches Tagesrätsel, Hard Mode, Statistik, Backup-Konsistenz, Manifest-/Dateiprüfung.
- `node tests/app.test.cjs`: **8 Testgruppen erfolgreich**. Alle vier Längen spielbar und speicherbar; Eingabesperre während der Auswertung; Pause/Neuladen; Tageswertung einmalig; Streak-Abbruch; Wortbeutel/LEGAT-Auswahl; Zufallslängen; JSON-Export und Import mit Bestätigung sowie Ablehnung ungültiger Versionen.
- `node tests/sw.test.cjs`: **3 Testgruppen erfolgreich**. Existenz und Unterverzeichnis-Auflösung aller Cache-Dateien, scoped Cache-Bereinigung, Offline-Skript und Navigationsfallback.

Die App- und Service-Worker-Tests verwenden ausdrücklich **Node-Adapter**, keinen realen Browser. Sie prüfen Logik und Zustandsübergänge. Eine Browserinstallation, visuelle Screenshot-Prüfung oder reale Offline-Installation wurde hier nicht durchgeführt.

## Noch offen: echte Browser und Geräte

Auf iOS Safari, Android Chrome, Samsung Internet und Desktop jeweils:

- [ ] HTTPS-Link laden; alle vier Modi vollständig spielen.
- [ ] Bei 320 × 568, 375 × 667 und großem Smartphone prüfen: sieben Buchstaben/sieben Zeilen, Tastatur, safe areas und Scrollen. Querformat muss bedienbar bleiben.
- [ ] Grün/Gelb/Grau, Flip, Shake und Gewinnanimation visuell prüfen; kein Spoiler im Share-Raster.
- [ ] Physische deutsche Tastatur: Ä/Ö/Ü/ß/ẞ, Enter, Backspace; Touch-Tastatur im QWERTZ-Layout.
- [ ] Schnell mehrfach Enter drücken und während Flip auf Tastatur tippen; nur ein Eintrag wird gewertet.
- [ ] Unfertige Runde schließen, Browser beenden, neu starten; Spielstand und Eingabe bleiben erhalten.
- [ ] Installieren, Standalone-Ansicht und Icons prüfen. Nach aktiviertem Service Worker Flugmodus einschalten und App komplett neu starten.
- [ ] GitHub-Pages-Unterordner, Cache-Update und manuelle Update-Aktivierung prüfen.
- [ ] Tagesrätsel auf zwei Geräten gleicher Version vergleichen; Wechsel bei 00:00 UTC prüfen.
- [ ] Web Share API, Clipboard-Fallback und manuellen Kopierdialog prüfen.
- [ ] Backup exportieren, in einem zweiten Browser importieren; vorher abbrechen, danach bestätigen, beschädigte JSON-Datei ablehnen.
- [ ] Helles Design, reduzierte Animationen, Systemschnittstelle für reduzierte Bewegung und Sounds prüfen.
- [ ] Privatmodus/gesperrtes localStorage: sichtbarer Hinweis und Backup statt behaupteter Persistenz.

Geräte- und Browserkompatibilität ist ein Implementierungsziel und kein hier bewiesenes Testergebnis.
