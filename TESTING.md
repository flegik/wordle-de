# Phase 6 · tatsächliche Prüfungen und offene Gerätechecks

Baseline 188 erneut erfolgreich. `python tools/test_all.py`: **253 Gruppen
bestanden** (188 bisherige + 33 Duell-Codec/Regeln/Storage + 32 Controller/Sharing).
17 Runtime-Syntaxchecks, Browser-Script-Syntax und `git diff --check` bestanden.
25 Precache-URLs im SW-Adapter. de-1-Wörter/Audit und Tagesfixtures unverändert.

`node tests/browser-duel.cjs` versucht: **Chromium-Executable fehlt**, vor Start
abgebrochen. Kein Download, keine ausgeführten Layout-/Touch-/PWA-Gerätetests.
VM-/SW-Adapter und gefakte Share-APIs sind keine Browser-/Gerätezertifizierung.
Browser-Skript vorbereitet für 320×568, 360×640, 390×844, 430×932, Desktop und
Querformat, jeweils zwei unabhängige Kontexte, Touch/Hardware, Reload, Vergleich,
sowie Offline unter `/wordle-de/`; Ablauf noch real zu prüfen.

## Manuell vor Release · ausschließlich isolierter Test-Origin

- Android Chrome, Samsung Internet, iPhone Safari, Desktop; Dark/Light,
  reduzierte Bewegung, 320/360/390/430px, Querformat, Safe Areas und Texteingabe.
- Zwei Geräte: Zufalls-Duell teilen, unbekanntes exakt gleiches Wort spielen,
  Ergebnisse zurückschicken, weniger Versuche/gleich/unsolved vergleichen.
- Wunschwort (LEGAT, MICH, KÄSE, STRAẞE), Ersteller nicht mitgewertet,
  Umlaute/Hardware/Touch, Auto-Korrektur, native Keyboard nur beim Erstellen.
- Einladung aus WhatsApp, nativer Share, Clipboard erlaubt/verweigert,
  manuelle Kopie; initialer Link und Linkwechsel, ungültiger/alter Versionslink.
- Browser/PWA schließen, Reload mit Draft, laufende/abgeschlossene Challenge
  erneut öffnen, mehrere parallel, Abbruch bestätigen/abbrechen. Keine neue Wertung.
- Ankommender Link während Speedrun/Flip, nichts überschreiben; Hintergrund/
  Vordergrund, Browser-Tabs/gleichzeitige gespeicherte Änderungen.
- Installierte Android-/iPhone-PWA und Safari-Kontext getrennt prüfen;
  automatische Appöffnung/Speicherteilung nicht voraussetzen.
- Offline-Paket laden, Verbindung trennen, gespeicherte Duelle fortsetzen,
  vorhandenen Link im gecachten Kontext öffnen. Erstöffnung ohne Paket braucht Netz.
- Schema-1/2/Arcade/Duell-Backup exportieren und nach Bestätigung importieren,
  Ergebnisse/IDs/Drafts erhalten; beschädigten Import abweisen. Quota-Fehler prüfen.
- Live v1→v2-Upgrade erst nach Releasefreigabe mit neuer Cacheversion und
  dem in WORD_VERSION_PLAN beschriebenen noch offenen Konfliktkonzept prüfen.

Es fand kein produktives Update statt. Vergleichscodes sind keine Signaturen;
kontrolliert manipulierte gültige Payloads sind technisch konstruierbar.

---

# Phase 5 · Themen-Wordle, ausschließlich Entwicklungsbranch

Tatsächlich ausgeführt: `python tools/test_all.py` — **188 Testgruppen bestanden**.
Baseline vor Änderungen: 145 Gruppen aus Phase 4 bestanden. Neu: 23 Themen-
Regel-/Daten-/Storage-Gruppen, 17 Controller-Gruppen und 3 Build-/Redaktionschecks.
14 Runtime-Syntaxprüfungen; `node --check tests/browser-theme.cjs` und
`git diff --check` bestanden. SW-Adapter prüft **22 Precache-URLs** vollständig,
auch unter Unterverzeichnis. Alle bisherigen 145 Gruppen, 1461 Tagesrätsel-
Fixtures und der reproduzierbare de-1-Audit bestehen weiterhin.

Datenchecks sind objektiv: Kategorie-IDs, Quellen-/Auditabgleich, gültige
Basislösungen, NFC/ẞ/Längen, Duplikate, Mindestpoolgröße und genau neun aktive
Kombinationen. Redaktionelle Themenzugehörigkeit/Bekanntheit ist ausdrücklich
keine automatisch beweisbare Eigenschaft; vollständige Listen und Zweifelsfälle
stehen in `docs/THEME_WORDS.md`. Keine angebliche linguistische Zertifizierung.

Regel-/Controllerchecks: Allgemeinwörter außerhalb des Themas als Tipps,
klassische Limits, bestehender Hard Mode mit Mehrfachbuchstaben, Sieg/Verlust,
Doppel-Enter, Kategorie-/Längenwechsel nur nach Bestätigung, Pause/Reload/Draft,
Hard-Konfiguration am Start, einmalige Abbruch-/Ergebniswertung, neue Runde in
selber Auswahl, getrennte Statistiken mit Kategorien-/Längenfilter, Backups,
Beuteldurchlauf/Refill und nahezu erschöpfter Cross-Kategorie-Pool, manipulierte
Versionen/Kategorien/Beutel, historische Version über Registry und sharing ohne Ziele.

**Browserstatus:** `node tests/browser-theme.cjs` tatsächlich gestartet, scheitert
vor Browserstart am fehlenden Chromium-Executable. Kein Download versucht.
Keine erfolgreichen tatsächlichen Render-/Touch-/Android-/Safari-/PWA-/Offline-
Browsertests. Der optionale Check ist syntaktisch gültig, sein Browserablauf
bleibt unbestätigt. Mit Playwright und Chromium als Entwicklungswerkzeugen:
`node tests/browser-theme.cjs` (isolierter Localhost-Origin mit Unterverzeichnis).
Vorgesehene Größen: 320×568, 360×640, 390×844, 430×932, 1000×800 und 640×360.

## Offene manuelle Checks Phase 5

- Alle vier Kategorie- und neun Längen-Auswahlen, gesperrte Controls, Lesbarkeit,
  lange Namen, Dark/Light und reduzierte Bewegung auf kleinen Geräten/Querformat.
- Android Chrome/Samsung Internet und iPhone Safari, Browser und installierte PWA:
  Safe Areas, vollständige Tastatur, aktuelle Zeile, Scrollen ohne Fehleingaben,
  Hardware-/Touch-Enter/Backspace sowie Ä/Ö/Ü/ẞ.
- Hard Mode mit gelben/grünen und mehrfach vorkommenden Buchstaben; Änderung
  der globalen Einstellung darf laufende Runden nicht verändern.
- Reload/Pause/Kategoriewechsel/Abbruchbestätigung, Backup-Import/-Export aus
  Schema 1 und 2, fremde Kategorien und korrupte Daten, Quota-/Zugriffsfehler.
- Echter Web Share/Clipboard-/manueller Fallback ohne Lösungswörter.
- Erstinstallation, Offline-Kategorien und vollständige Offline-Runden auf
  **frischem Test-Origin**. Späteres Upgrade braucht eigene Release-Cache-Version.
- Redaktionelle gemeinsame Zweitprüfung der expliziten Listen vor Veröffentlichung;
  keine unbekannten Begriffe zur Erfüllung eines Zahlenziels nachschieben.

---

## Historischer Prüfstand Phase 4

# Phase 4 · Speedrun, ausschließlich Entwicklungsbranch

Ausgeführt: `python tools/test_all.py` — **145 Testgruppen bestanden**.
Baseline vor Änderungen: 93 Gruppen aus Phase 3 bestanden. Hinzu kommen
27 Speedrun-Regel-/Timer-/Storage-Gruppen und 25 Controller-Gruppen.
Elf Runtime-Dateien werden mit `node --check` geprüft. Der SW-Adapter
prüft jetzt sämtliche **19 Precache-URLs**, auch unter einem Unterverzeichnis.
`node --check tests/browser-speedrun.cjs` und `git diff --check` bestanden.

Die Fake Clock wartet keine drei Minuten. Sie prüft Bestätigung bei
179999,99 ms gegenüber 180000 ms, Ablauf während Flip, Zeitablauf ohne
vorherigen Timer-Tick, periodische Checkpoints, neue monotone Epoche beim
Reload, visibilitychange/pagehide, explizite Fortsetzung, Draft, Doppel-Enter,
Doppel-Skip, Pause während Flip, Abort-Bestätigung und einmalige Wertung.
Regeltests prüfen alle Punktewerte/Längen, separate Versuchslimits,
verlorene/übersprungene/offene Wörter, chronologische Grenzen, Mehrfachbuchstaben,
Unicode, reproduzierbare Punkte, Highscore-Gleichstände, getrennte Statistik,
Backup-Roundtrip und beschädigte/manipulierte Zeit-/Ergebnisdaten.
Alle 93 bestehenden Gruppen einschließlich 1461 Tagesrätsel-Fixtures und
reproduzierbarem Wortaudit bestehen weiterhin. DOM-/SW-Adapter sind keine
Browser-, Render- oder Gerätetests.

**Browserstatus:** `node tests/browser-tower.cjs` und
`node tests/browser-speedrun.cjs` tatsächlich gestartet, beide scheitern
bereits an fehlendem Chromium-Executable. Kein Browserdownload in Phase 4.
Keine erfolgreichen Render-, Touch-, Safari-, PWA- oder Offline-Browsertests
behauptet. Der optionale Speedrun-Check ist syntaktisch geprüft, sein Ablauf
im Browser bleibt unvalidiert. Bei vorhandenen Entwicklungswerkzeugen:
`node tests/browser-speedrun.cjs` (Playwright + Chromium; keine App-Abhängigkeit).
Er nutzt einen isolierten Localhost-Origin mit Unterverzeichnis und sieht
320×568, 360×640, 390×844, 430×932, 1000×800 und 640×360 vor.

## Offene manuelle Freigabechecks für Speedrun

- Auf echten Android-Chrome-/Samsung-Internet- und iPhone-Safari-Geräten,
  jeweils Browser und installierte PWA: Timer, Safe Areas, Tastatur, Skip und
  aktuelle letzte Rasterzeile bei allen genannten Größen und Querformat.
- Erfolg und Versuchslimit-Niederlage: schneller automatischer Wortwechsel,
  korrektes Feedback, neue Tastaturfarben, keine überlappenden Controls.
- 10/30-Sekunden-Warnung, letzter gültiger Tipp vor Deadline, Ablauf während
  Animation, sehr schnelles mehrfaches Enter/Skip, reduzierte Bewegung/Sound.
- Telefonanruf, Sperrbildschirm, WhatsApp, Homescreen, Tabwechsel, pagehide/BFCache:
  Pause, keine Hintergrundzeit, Rückkehr nur über bewusste Fortsetzung.
- Reload während Draft/Flip, Browserabsturz und Neustart: Restzeit aus letztem
  Checkpoint, keine neuen Ziele, keine doppelte Wertung; Save-Fehler/Quota prüfen.
- Share-Abbruch, Web Share, Clipboard und manuelle Kopie ohne Lösungen;
  JSON-Export/-Import einschließlich abgeschlossenem Speedrun, Schema 1,
  alten Schema-2-Sessions, Bestätigung vor Überschreiben.
- Auf **frischem Test-Origin** erste Installation, Offline-Neustart,
  Unterverzeichnis-Hosting und späteres Upgrade mit neuer Release-Cache-Version.
  Produktions-Origin nicht zum Testen des Entwicklungsbranches verwenden.

---

## Historischer Prüfstand Phase 3

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

## Phase 7

`python tools/test_all.py`: zusätzlich Qualitätsgenerator-Reproduktion und
Phase-7-Integrationen für Klassen, vollständige globale Zyklen, Cooldown,
Restbeutel-Migration, gemischte Wortversionen, alte HUNNI/PESEL-Runden/Duelle,
Backup-Migration/Idempotenz, eigene Wortmeldungen und Speicher-Konflikte.
Tests mit fremden gespeicherten UI-Fixtures bestätigen die neue explizite
Übernahme; sie umgehen den Konfliktschutz nicht mehr durch stilles Storage-Update.
Der frühere ungültige Versionstest verwendet nun de-999, weil de-2 unterstützt wird.

`node tools/simulate_selection.cjs`: 570 reale Checkpoints, drei Verfahren,
drei Seeds im Moduswechsel sowie reine Modusprofile, alle vier Längen,
komplette Zyklen plus Übergang. JSON-Ausgaben unter data/quality/.

Browserversuch `node tests/browser-duel.cjs` erneut ausgeführt: Start gescheitert,
Playwright Chromium headless shell fehlt. Keine Layout-/Touch-/Safari-/installierte
PWA-Prüfung als bestanden behauptet. Die Adapter prüfen Controller und Daten,
keine Bildschirm-Geometrie. SW-Adapter prüft 32 vorhandene Assets unter Unterpfad,
Navigation-Fallback und Scope-Isolation, keine reale PWA-Installation.

Offen für Phase 8, ausschließlich auf isoliertem Test-Origin:
320×568, 360×640, 390/430 Pixel, Desktop/Querformat; lange Tower-Historie;
Dark/Light und reduzierte Bewegung; alle Ergebnis-/Melde-/Konfliktdialoge;
physische und Touch-Eingaben inkl. ÄÖÜẞ; iOS Share/Clipboard/JSON-Downloads;
Speedrun Hintergrund/Foreground/pagehide; alte PWA parallel zu neuer;
Storage-Quoten, gleichzeitige Tabs, bestätigte Übernahme und Sicherung beider
Stände; echte Installation/Offline/atomare Cache-Aktualisierung mit neuer
Release-Cache-Version. Noch keine Release-Freigabe.

## Release Candidate: echte 1.0-Speicher und offene Browser-Gates

Gesamtsuite erneut: **308 Gruppen bestanden**. Drei zusätzliche Gruppen führen
den bytegefrorenen echten 1.0-Controller aus, erzeugen Spielstände, laden sie mit
2.0, prüfen Backup/Reload/Idempotenz und schützen spätere alte Tab-Schreibzugriffe.
`node tests/release-upgrade.test.cjs` ist weiterhin ein State-/DOM-Adaptertest,
kein installierter PWA-Update-Test. Protokoll: `docs/qa/release-automated-tests.log`.

Private HTTPS-Testfassung und kurzer Samsung/iPhone- sowie echter Same-Path-
Upgrade-Ablauf: [MANUAL_RELEASE_QA.md](docs/MANUAL_RELEASE_QA.md).
Cloud-Chrome erreicht nur die Anmeldung; keine reale Spiel-/Geräteabnahme erfolgt.
Offene Gates, Dateihashes, Messungen und Rollback: [Release Candidate](docs/RELEASE_CANDIDATE_2_0.md).

## Phase 8: Ergebnisse, PNG und Release-Gates

`python tools/test_all.py`: vollständige Engine-, Controller-, Daten-, Migrations- und Service-Worker-Adaptertests. Neue Prüfungen: echte Ergebniszeilen aller Modi, keine erfundenen Doppel-/Tower-Zeilen, auswählbare Speedrun-Runden, historische Wortpakete/Beutel, wiederaufrufbare klassische Ergebnisse, PNG-Spoilergrenze, native Capability-Erkennung und fehlgeschlagene atomare Cache-Installation.

`node tools/verify_result_png.cjs`: native Canvas-Testadaption, echte PNG-Signatur und Decoder, alle Modi, Gewinne/Niederlagen/Abbrüche, Sonderzeichen, lange Tower-Historie, identischer wiederholter Export und unveränderte Session-/Statistikdaten. Kein Browsernachweis.

`node tests/browser-results.cjs`: vorbereitete isolierte localhost-Prüfung bei 320×568, 360×640, 390×844, 430×932, Desktop und Querformat, Touch, Raster, PNG-Decodierung und Offline-Start. Native Sharing wird dabei nur gemockt. Alle sechs Browser-Skripte wurden gestartet, scheiterten hier schon vor Browserstart an fehlendem Chromium; Installation scheiterte an ungültigem Downloadarchiv.

Offen vor Veröffentlichung: dieselben Breiten real rendern; Hardwaretastatur und Scrollbedienung; Safari/iPhone Datei-Sharing, Download/Long-Press und Safe Area; Chrome/Android/Samsung Internet Datei-Sharing; installierte PWA; Altversion-Update bei aktiven Runden/Speedrun; Hintergrund/Foreground, Offline-Neustart, fehlgeschlagenes Update, parallele Tabs/alte PWA und Geräte-Speichergrenzen. Keine dieser Geräteprüfungen wird als bestanden behauptet. Produktive Origin nicht verwenden.
