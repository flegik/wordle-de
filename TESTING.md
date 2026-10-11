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
