# WORDLE DE 2.0 · Release Candidate · 2026-10-11

**Empfehlung: Veröffentlichung vorerst blockieren, bis die unten genannten
manuellen Release-Gates bestanden sind.** Die automatisierte Prüfung besteht;
es wurde kein ungelöster Runtime-Fehler nachgewiesen. Echte Geräte-, native
Sharing- und installierte PWA-Upgrade-Prüfungen sind jedoch noch offen.
main, GitHub Pages und Releases wurden nicht verändert.

## Definierter Kandidat

- **Release-Candidate-Commit:** `cc9d9950ed1f101988469312eb850a450916a202` auf `feature/arcade-v2`.
- **Unveränderter Runtime-Code:** `310f8b6f0f87da0740afc25cbf38f079a38b0441`.
  Der RC ergänzt ausschließlich Tests, Messdaten und Abnahme-Dokumentation.
  Spätere reine Berichtskommittierungen ändern diesen geprüften Runtime-Stand nicht.
- **Produktiver Rücksetzpunkt:** `22331471b9179d408879cec10f5aa1e1291cf26e`.
- Startprüfung: beide Remote-HEADs entsprachen diesen Ausgangsständen; lokaler
  Entwicklungsbranch sauber, keine konkurrierenden Entwicklungsprozesse.
  Lokale Commit-Historie ist eine Ersatzhistorie mit identischen Dateiblobs.
  GitHub-Commits wurden an den tatsächlichen Remote-Eltern mit Ref-Lease und
  ohne Force-Push angehängt.
- Aktive Wortversion **de-2.2**, 5.400 Lösungen; historische de-1/de-2/de-2.1
  erhalten. Kein neuer Wörterbuchstand, keine erneute redaktionelle Prüfung.
  Daily bleibt de-1. Speicherschema 2, `wordle-de:v2`; ursprünglicher v1-Schlüssel
  bleibt unverändert erhalten.

## Isolierte HTTPS-Testfassung

**https://wordle-de-rc-test.keen-elm-5553.chatgpt.site**

Private, unabhängig bereitgestellte Testseite über Sites. Bereitstellung vom
Hosting-Dienst als **succeeded** bestätigt; keine Änderung an produktiven Pages.
Die Anmeldung mit dem besitzenden ChatGPT-Konto ist erforderlich. Nicht
automatisch für andere Konten/Freunde zugänglich. Test-Hosting-Quellcommit:
`e67437311e7dc13c8d914f78b04d5498545f1bba`. Das ist kein Commit im Wordle-Repository.

Das Testpaket enthält byteidentische Runtime-Dateien des oben genannten
2.0-Kandidaten unter `/wordle-de/` und die echte produktive 1.0 unter `/legacy-v1/`.
Beide teilen nur diesen isolierten lokalen Speicher. Unterschiedliche
Worker-Scopes verhindern gegenseitiges Cache-Löschen. Dies ermöglicht einen
Datenübernahme-Test, **ersetzt aber nicht das Worker-Update am selben Pfad**.
Die Hosting-Anmeldung kann den Offline-Neustart beeinflussen; auch dieser Punkt
ist bis zum Gerätetest ausdrücklich offen.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Ergebnis und Grenze |
|---|---|
| Unveränderte Baseline, `python tools/test_all.py` | **305 Gruppen bestanden** |
| Gesamtsuite nach Erweiterung | **308 Gruppen bestanden**, vollständiges Protokoll `docs/qa/release-automated-tests.log` |
| Echter bytegefrorener 1.0-Controller → aktueller Controller | **3 neue Gruppen bestanden** im DOM-/State-Adapter, kein Browsernachweis |
| Regeln und alle neun Modi | Vorhandene Engine-, Modus- und Controller-Suiten bestanden; Unicode, Mehrfachbuchstaben, Hard, separate Statistiken, Budgets, Timer und Links |
| Altstände/Backups | Schema 1/2, historische Wortversionen, aktive Runden, Duelle, idempotente Migration, geschützte Konflikte und einmalige Ergebniswertung bestanden |
| Daily | 1.461 historische UTC-Fixtures weiterhin unverändert; de-1-Archiv hashgleich zur Produktion |
| Offline-Paket | 38 Cache-Einträge / 37 unterschiedliche Dateien vorhanden, alle HTML-Runtime-Referenzen erfasst; relative Scope-/Startpfade und Icons geprüft |
| Fehlgeschlagenes SW-Update | Adapter prüft Erhalt des alten Caches, atomare Installation und Scope-Isolation; keine reale installierte PWA |
| PNG | Unveränderte Phase-8-Evidenz: 88 echte PNGs und 88 identische Wiederholungen, Signatur/Decoder und Spoilergrenze bestanden; native Canvas-Adaption, kein OS-Share-Nachweis |
| PNG-/Share-Logik in Gesamtsuite | Reale Ergebnisprojektionen, keine erfundenen Doppel-/Tower-Zeilen, Datei-Capability-/Spoilerprüfungen bestanden im Adapter |
| Performance, `node tools/benchmark_results.cjs` | Erneut gemessen: 100 / 1.000 / 10.000 archivierte Ergebnisse; siehe unten |
| Git / Geheimnisse / Runtime-Paket | `git diff --check` bestanden; Scan auf typische private Schlüssel/Token ohne Treffer; keine Pages-/Workflow-/Produktionsänderungen |

Geändert: `tests/release-upgrade.test.cjs`, `tests/fixtures/app-v1.js`,
`tests/helpers/app-harness.cjs`, `tools/test_all.py`,
`data/quality/phase8/result-performance.json`, `docs/MANUAL_RELEASE_QA.md`,
`docs/qa/release-package.json`, `docs/qa/release-automated-tests.log` sowie
dieser Bericht und Dokumentationsverweise in README/TESTING.

## Migration: zusätzliche konkrete Evidenz

Der eingefrorene originale `js/app.js` aus der Produktion besitzt Git-Blob
`6e6b5b700c48ed3275c021c51e82c3b4f497d239`; der neue Test prüft diese Bytes.
Dieser echte Controller erzeugt klassische, Zufalls-, Daily- und Streak-Siege,
Wortbeutel und eine laufende Runde mit `ÄÖẞ`-Draft. Der aktuelle Controller lädt
und speichert dieselben Daten. Alle alten Kollektionen und v1-Originalbytes
bleiben gleich. Reload/Backup verändern keine Wertung, Migration ist idempotent.
Ein späterer Schreibzugriff des noch laufenden echten alten Controllers wird
als Konflikt erkannt; beide Originalstände bleiben erhalten.

**Nicht ausgeführt:** tatsächliche Installation von 1.0, Update auf 2.0 am
gleichen Browser-Origin/-Pfad, Homescreen-Neustart und Offline-Update. Die
reproduzierbare Anleitung steht in `MANUAL_RELEASE_QA.md`; sie braucht einen
frischen localhost-Port oder isolierten HTTPS-Testhost. Keine Produktionsdaten
für diese Prüfung verwenden. Ein Adapter ist kein Ersatz für dieses Gate.

## Browser, Geräte und PNG-Sharing

Kein lokaler Chrome/Chromium/Edge/Firefox-Browser gefunden; Playwright ist
vorhanden, sein Browser-Executable fehlt. Der bereits mehrfach gescheiterte
Download wurde nicht erneut gestartet. Eine Cloud-Chrome-Oberfläche wurde
tatsächlich gefunden und die Testadresse geöffnet. Sie zeigt **„Anmeldung
erforderlich“** und erreicht keine Spieloberfläche. Deshalb gilt dieser Versuch
weder als Start-, Layout-, Touch- noch als PNG-Test. Keine Samsung-, Android-,
Samsung-Internet-, Safari-, iPhone- oder installierte-PWA-Prüfung durchgeführt.

Offen: 320×568, 360×640, 390/430, Desktop/Querformat; echte Kachel- und Tastatur-
Geometrie; native Web Share API/`canShare(files)`, PNG-Download/Long-Press,
Share-Abbruch und wiederholtes Teilen; Safe Area; Speedrun-Lifecycle auf Geräten.
Default-PNG enthält laut Canvas-/Modelltests keine Buchstaben/Lösungen;
Dateiname `wordle-de-<mode>.png` und Standardtitel `WORDLE DE` enthalten keine Ziele.
Die OS-Freigabe und Speicherung müssen dennoch manuell abgenommen werden.

## PWA und Speicher

Cache **v2-final-20261011-b**, 38 Einträge, insgesamt **1.536.169 Bytes**
unterschiedlicher Runtime-Dateien. Nach vollständiger erfolgreicher Installation
wartet das Update auf bewusste Aktivierung. Aktive Spielansicht, Eingabesperre
und laufender Speedrun schützen vor Update-Klick bzw. unkontrolliertem Reload.
Historische Wörterbücher und neue Ergebnis-/PNG-Module liegen offline im Paket.
Manifest und Icons haben passende relative Pfade; 192-/512-Pixel-Dateien geprüft.
Ausführliche Dateihashes: `docs/qa/release-package.json`.

Node-Messung auf dieser Umgebung, keine Mobilgerät-Zertifizierung:

| Ergebnisse | Backup-Bytes | Validierung | Export |
|---:|---:|---:|---:|
| 100 | 53.095 | 3,776 ms | 2,414 ms |
| 1.000 | 531.895 | 23,338 ms | 14,643 ms |
| 10.000 | 5.355.895 | 129,737 ms | 137,613 ms |

Quotenfehler werden im bestehenden Test simuliert: vorhandener Speicher wird
nicht überschrieben; Export bleibt vorgesehen. Reale Gerätequoten und große
Arcade-Historien können früher Grenzen erreichen. Keine automatische Löschung.
localStorage bietet keine atomare Mehrtab-Transaktion; Lease/Konfliktwarnungen
mindern gewöhnliche Konflikte, garantieren keine vollständige Race-Freiheit.

## Freigabe-Gates und Integration

1. Sechs kurze Samsung-Schritte auf der privaten Testadresse bestehen, insbesondere
   Ergebnisraster, PNG und Fortsetzung. iPhone, sofern verfügbar, ebenso.
2. Echten 1.0→2.0-Worker-Upgrade-Test am selben isolierten Pfad einschließlich
   Datenvergleich und Offline-Neustart bestehen.
3. Gefundene kritische Fehler gezielt beheben, relevante Prüfungen wiederholen.
4. Erst danach ausdrückliches **„Release freigegeben“** durch den Nutzer.

Ein **Entwurfs-PR** kann diesen Kandidaten reviewbar vorbereiten; er ist kein
Merge und löst keine Freigabe aus. Vor Integration erneut beide Remote-HEADs
prüfen. Bei zwischenzeitlichen Änderungen stoppen und Kandidaten neu abgleichen.
Normale nachvollziehbare Integration ohne Force-Push, Pages-Deployment und
öffentlichen HTTPS-Smoke-Test erst nach der ausdrücklichen Freigabe. Der konkrete
freizugebende Branch-HEAD einschließlich Bericht wird im Abschluss mitgeteilt.
Die Entwicklungshinweise in der Testfassung sind als solche sichtbar; alle neun
Modi sind implementiert, keine zukünftigen Modi als spielbare Platzhalter.

## Rollback ohne Statistiklöschung

Produktiver Code-Rücksetzpunkt: `22331471b9179d408879cec10f5aa1e1291cf26e`.
Nach einem späteren Release im Notfall den Release-Merge normal revertieren
(bei Merge-Commit `git revert -m 1 <release-merge-sha>`), keine Git-Historie
überschreiben. Einen eindeutig neuen Rollback-Cache verwenden, dann Pages-
Deployment/Assets prüfen. Dies ist ein vorbereitetes Verfahren, nicht ausgeführt.

Ein Code-Rollback migriert neue v2-Daten **nicht** zurück zu Schema 1. 1.0 zeigt
gegebenenfalls nur die erhaltene ältere v1-Kopie. Neue Arcade-/Ergebnisdaten
bleiben unter v2 erhalten; beide Backups sichern. Weder localStorage-Keys noch
Statistiken löschen. Bei Speicherproblemen möglichst gezieltes korrigierendes
Update bevorzugen; Rückkehr zu 2.0 muss etwaige alte Tab-Konflikte berücksichtigen.
