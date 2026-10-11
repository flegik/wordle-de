# WORDLE DE 2.0 · Abschluss Phase 1

Phase 1 ist als Entwicklungsstand abgeschlossen. Branch `feature/arcade-v2`;
main und GitHub Pages wurden nicht verändert. Keine Releases, kein Merge und
keine Umsetzung weiterer Spielmodi. Das unveränderte de-1-Paket bleibt aktiv.

## Technisches Ergebnis

- Wordle-Kern (`engine.js`) unverändert wiederverwendet. Vor der Entwicklung
  wurden alle 30 Repository-Dateien bytegleich mit dem GitHub-Baum verglichen;
  die 19 ursprünglichen Testgruppen bestanden.
- `sessions.js` ergänzt eine generische GameSession mit einzelnen Wortrunden.
  Gemeinsame Versuche sind nur einmal gespeichert; Eingaben, Farben und
  Rundenstatus werden daraus abgeleitet. Budgets, Hard Mode und Abschlussdaten
  werden validiert. Keine vorgezogene Modus-UI, Timer oder Punkteformel.
- `storage.js` migriert Schema 1 deterministisch/idempotent auf Schema 2,
  erhält alle alten Sammlungen und trennt Arcade-Ergebnisse von Wordle-Statistik.
  Originalschlüssel v1 bleibt erhalten. Beschädigte/unknown Daten werden nicht
  unbemerkt überschrieben; Originalexport und temporäres Spielen sind möglich.
- JSON-Import akzeptiert beide Schemas mit de-1 nach Validierung/Bestätigung;
  Export enthält laufende Runden und Sessions. ID-basierte Ergebniswertung
  vermeidet doppelte Statistik. Alte Tageswerte und Streak-Daten bleiben erhalten.
- Zwei lokale Runtime-Dateien in HTML/SW aufgenommen. Cache-Version bleibt v1;
  die eigentliche Cache-Umstellung ist dem gemeinsamen Release vorbehalten.

## Geänderte / neue Dateien

| Bereich | Dateien |
|---|---|
| Runtime angepasst | `index.html`, `js/app.js`, `sw.js` |
| Runtime neu | `js/sessions.js`, `js/storage.js` |
| Bestehende Tests erweitert | `tests/app.test.cjs`, `tests/sw.test.cjs` |
| Neue Tests | `tests/storage.test.cjs`, `tests/app-storage.test.cjs`, `tests/audit.test.py`, `tests/helpers/app-harness.cjs` |
| Repräsentative Fixtures | `tests/fixtures/schema-1-representative.json`, `tests/fixtures/de-1-daily.json` |
| Werkzeuge | `tools/audit_words.py`, `tools/test_all.py`, `.gitignore` |
| Wortprüfung | `WORD_REVIEW.md`, `data/review/editorial-rules.json`, `data/review/word-audit-de-1.json`, `data/review/exclusion-candidates-de-2.json`, `data/review/accepted-exclusion-candidates-de-2.json`, `data/review/sources/de_50k.txt`, `licenses/frequencywords-notice.txt` |
| Dokumentation | `README.md`, `TESTING.md`, `docs/ARCHITECTURE_V2.md`, `docs/WORD_VERSION_PLAN.md`, dieser Bericht |

Bytegleich erhalten: Engine, produktive Wörter und Quellen, Wortgenerator,
CSS, Manifest, Icons, Lizenzen und `WORDLISTS.md`.

## Tatsächlich ausgeführte Prüfung

`python tools/test_all.py`: **41 Testgruppen bestanden**, plus Syntaxchecks.
Aufteilung: Engine 8, bestehende App 8, Service Worker 4, Storage/Session 10,
App-Migration 6, Wortaudit 5. `git diff --check` ebenfalls bestanden.

Die Tagesrätselprüfung vergleicht 1461 eingefrorene UTC-Ergebnisse mit de-1.
Der Audit reproduziert vier Ausgabedateien bytegleich und prüft vollständige
Abdeckung, reale lokale Quellennachweise, unfreigegebene Kandidaten, LEGAT,
HUHNS/MICH sowie den unveränderten produktiven Wortdatei-Hash.

Repräsentative Testfixtures stammen aus dem tatsächlichen Schema und den
vorhandenen Wörtern; kein privater Nutzerdatenexport lag vor. App und SW wurden
mit Adaptern ausgeführt, **nicht** in einem echten Browser oder auf Geräten.

## Wortqualität

Vollständiger Regelaudit, keine vollständige manuelle Einzelprüfung:

| Einstufung | Anzahl |
|---|---:|
| Eindeutige Ausschlussvorschläge | 3 |
| Manuell prüfen | 2721 |
| Vorläufig beibehalten | 2850 |
| Gesamt | 5574 |

HUNNI soll gemäß Auftrag künftig aus Lösungen entfernt werden; MBIT ist eine
Einheitenabkürzung. PESEL soll nach der Nutzerpräzisierung künftig auch aus
Eingaben verschwinden. Alle drei bleiben in Phase 1 unverändert in de-1.
LEGAT ist geschützt. HUHNS und MICH sind schon ausschließlich Eingaben.
Ungewöhnlich heißt nicht falsch: PESEL/PESEN und LIIEREN wurden durch Duden
verifiziert. Der Nutzer lehnt PESEL trotzdem als zu unbekannt für dieses Spiel ab. SALBE bleibt als Substantiv; KREBS ist nur Eingabe, DRUSE ist im
aktuellen Bestand nicht enthalten. Die Referenzgrafik wurde nicht als Wörterbuch
verwendet.

Die meisten P3-Hinweise stammen aus fehlenden exakten DIC-Grundworteinträgen und
sind **keine** Löschliste. Auch normale Komposita und Lehnwörter sind darunter.
Gebrauch wird zusätzlich für jedes Wort anhand tatsächlicher Rang-/Zähldaten
 aus FrequencyWords / OpenSubtitles 2018 (CC BY-SA 4.0) geprüft. Niedriger Rang
 oder kein Top-50.000-Treffer führt zur manuellen Prüfung, nicht zu automatischer
 Löschung; Untertitel sind kein repräsentativer Bekanntheitstest.
 Hunspell liefert keine vollständige Wortart-/Häufigkeitsannotation. Alle
Kandidaten bleiben `approved: false`; der Generator ignoriert sie vollständig.

## Offene Risiken und nächste Schritte

1. Vor Release echte Browser-/Gerätetests: Mobil-Layout, Installation, offline,
   Update einer alten PWA und Übernahme eigener exportierter Spielerstatistiken.
2. Parallel alte v1- und neue v2-Software können unterschiedliche lokale Daten
   fortschreiben. Verlustfreie Konfliktübernahme ist vor Release zu implementieren;
   Phase 1 bietet noch keinen automatischen Merge solcher nachträglichen Änderungen.
3. de-2 erst nach redaktioneller Wortfreigabe. Historische/aktive de-1-Runden und
   Backups müssen mit archiviertem de-1 weiter validiert werden. Tagesrätsel
   zunächst auf de-1 zu belassen vermeidet Versionskonflikte mit alten Offline-PWAs.
4. Cache-Version beim gemeinsamen Release erhöhen, beide benötigten Wortpakete
   und alle Runtime-Dateien offline testen; Entwicklungsstand nicht vorzeitig deployen.
5. Als nächste **gesondert beauftragte** Phase eignet sich Doppeltes Wordle:
   getrennte Boards, zwei unterschiedliche 5er-Ziele, acht gemeinsame Versuche.
   Vorher Regeln für Hard Mode auf mehreren Boards festlegen. Keine weiteren
   Phasen wurden begonnen.

Ausführliche Strategien: `ARCHITECTURE_V2.md`, `WORD_VERSION_PLAN.md`,
vollständige Wortprüfung `../WORD_REVIEW.md`.
