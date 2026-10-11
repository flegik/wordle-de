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
