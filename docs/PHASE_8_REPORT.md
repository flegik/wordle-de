# WORDLE DE 2.0 – Phase 8

**Entwicklungsarbeit umgesetzt; keine Veröffentlichung oder Releasefreigabe.** Sämtliche Änderungen gehören ausschließlich zu `feature/arcade-v2`. Echte Browser-/Geräteprüfungen bleiben Release-Gates. Die Live-Version auf `main` wurde nicht verändert.

## Bestandsaufnahme und GitHub-Sicherung

Start: Remote `38c820cebfa1f68c82dffb8538f246a67c5e43cd`, lokal `0cf206d`, inhaltsgleicher Phase-7-Bestand mit abweichender lokaler Commit-Historie. Sauberer Arbeitsstand, kein konkurrierender Entwicklungsprozess. Baseline erneut: **288 Testgruppen**. Upload erfolgte deshalb über GitHub-Git-Daten mit der tatsächlichen Remote-Historie als Eltern und `expected_sha`-Prüfung; kein Force-Push lokaler Ersatzhistorie.

Bereits gesicherte fachliche Meilensteine:

- `4d5af658cfa9937205093623f417bf3919315297`: erster KI-Qualitätspool und gezielte Beutel-Migration.
- `682766b2b3c8000e03527ea9d73138c0438a6189`: Nachprüfung und historische Qualitätsberichte.
- `1f7e4f6343785a9826cf90183df6e66d4e03b537`: Ergebnisraster, Historien, PNG-Sharing, atomare Offline-Vorbereitung.

Weitere Kompatibilitäts- und Dokumentationscommits folgen in derselben Branch-Historie. Produktiver Referenz-HEAD: `22331471b9179d408879cec10f5aa1e1291cf26e`. Keine Pages-Konfiguration, Workflows, Releases oder Merges geändert.

## Wortqualität und Freigabepolicy

Aktiv ausschließlich in der Entwicklung: **de-2.2 / quality-3**. Der frühe Entwicklungspool de-2.1 bleibt zusätzlich archiviert: Auch Spielstände aus einem Zwischencommit behalten damit exakt ihr Wörterbuch. Kein Schema 3; Qualitätspaketnummer und Speicherschema sind unterschiedliche Konzepte.

| Länge | Lösungen | Eingaben |
|---|---:|---:|
| 4 | 657 | 1.386 |
| 5 | 1.117 | 5.121 |
| 6 | 1.738 | 3.961 |
| 7 | 1.888 | 4.670 |
| Gesamt | **5.400** | **15.138** |

Klassen: **A 4.668, B 485, C 247**. Alle 5.568 Phase-7-Lösungen besitzen eine nachvollziehbare Aktion im Ledger. Alle ursprünglich 3.195 offenen Wörter und die frühere A-Liste wurden als vollständige Listen gelesen. 2.715 explizite Entscheidungen, 2.853 konservativ beibehaltene Gruppeneinträge. Gegenüber Phase 7 wurden 168 weitere Lösungen ausgeschlossen; Eingaben unverändert. C enthält viele eigenständig sinnvolle Begriffe, etwa LEGAT, HAIKU, MARIMBA, PROTON und ROCHADE.

**Prüfgrenze:** KI-Sprach-/Spielbarkeitsurteil, keine vorgetäuschte menschliche Einzelprüfung, externe Wörterbuchfreigabe oder empirische Bekanntheitsmessung. Konservative Gruppenübernahmen sind im Ledger separat markiert; sie sind nicht extern einzeln recherchiert. Häufigkeit/DIC-Signale dienen als vorhandene Evidenz, nicht als alleiniger Löschfilter. Bekannte Wörter, Fachbegriffe und seltenere, wiedererkennbare Begriffe bleiben erwünscht. Regionalität, Eigennamen, wenig vertraute Varianten und extrem spezialisierte Begriffe wurden explizit beurteilt; keine Bedeutungen erfunden. Spieler können einzelne Einschätzungen anders bewerten. Lokale Wortmeldungen bleiben sinnvoll.

`data/quality/phase8/editorial-groups.json` ist die reproduzierbare Eingabepolicy. `review.json` enthält jede Aktion, Herkunft, Methode, vorherige Klasse und Begründungsreferenz (`reasonId` → zentrale `reasons`). Geschützte Projektentscheidungen bleiben bindend: LEGAT C, MONARCH/ZWINGE B; HUNNI/MUMPS/COUP/CLOU/MBIT keine Lösungen; PESEL keine neue Lösung/Eingabe; HUHNS/MICH nur Eingaben. Quellen und Lizenzen unverändert in WORDLISTS.md.

## Auswahl, Speicherung und Kompatibilität

Registry behält de-1, de-2 und de-2.1 unverändert. Historische Runden/Challenge-Links validieren gegen ihre eigene Version. Die tägliche UTC-Auswahl bleibt de-1; themes-1 bleibt unverändert. Alte Statistikwerte, Tageswertungen und Streaks werden nicht neu berechnet oder doppelt gewertet.

Alte `quality-1`-/`quality-2`-Beutel werden erst validiert, dann verbleibende Ziele gefiltert und neu klassifiziert. Bereits entnommene Wörter werden nicht wieder eingefüllt. Leere Beutel beginnen erst beim nächsten Zug einen regulären neuen Zyklus. Recent-Historie und Zykluskennung bleiben erhalten. Migration ist idempotent getestet, einschließlich eines frühen de-2.1-Spiels mit inzwischen ausgeschlossenem ASTA. Schema 1/2, Schlüssel `wordle-de:v2`, Backup und Mehrtab-/Alt-PWA-Schutz bleiben bestehen. Beschädigte Daten werden nicht still überschrieben.

Die vorhandenen Modusgewichte und Inventarschulden-Regeln werden wiederverwendet. **570 Simulations-Prüfpunkte** für adaptive, naive und uniforme Auswahl, unterschiedliche Profile/Seeds/Längen: Vollzyklus-Eindeutigkeit und 150er Cooldown-Grenzen bestanden. Ein vollständiger Zyklus muss die tatsächlichen Klassenbestände verbrauchen; gewünschte Prozentgewichte können daher nicht dauerhaft exakt gehalten werden. C-freie Profile verwenden bei vollständiger A/B-Erschöpfung den ausdrücklich dokumentierten Restpool-Fallback, statt vorzeitig A/B zu wiederholen.

## Ergebnisoberfläche

`js/results.js` projiziert tatsächlich abgegebene Eingaben und nutzt ausschließlich Engine.evaluate / Sessions.roundView bzw. Speedrun.metrics. Keine künstlichen Erfolgszeilen, keine nachträglichen Tipps auf gelösten Doppel-Rastern. Tower zeigt nur tatsächlich betretene Etagen; lange Eingabeverläufe bleiben in einem begrenzten scrollbaren Raster zugänglich. Speedrun zeigt Kennzahlen und eine auswählbare echte Wortrunde. Thema/Challenge-ID werden beibehalten. Farben besitzen zugängliche Textbeschriftungen.

Gemeinsames Panel für alle neun Modi, vor den bisherigen Fortsetzungsbuttons. Kleine Displays zeigen lesbare Raster untereinander; breite Displays können zwei Karten nebeneinander zeigen. Text-/Emoji-Sharing bleibt separat. Neue klassische Abschlüsse speichern Wortkonfiguration/Eingaben in optionalen `roundResults`, keine redundanten Farben. Bestehende vollständige aktuelle Runden und gespeicherte Arcade-Sessions sind wiederaufrufbar. Statistik zeigt die letzten 20 vorhandenen Ergebnisse, ohne ältere zu löschen. Sehr alte reine Statistikereignisse ohne Wortverlauf erzeugen kein erfundenes Raster. Historische Ergebnisse werden nicht neu gewertet; Fortsetzen eines alten Ergebnisses überschreibt keine laufende klassische Runde.

## PNG und Teilen

`js/result-image.js`: vollständig lokales Canvas, 900 Pixel Breite, dynamische Höhe, systemeigene Sans-Schrift, Dunkeldesign und grün/gold/graue Kacheln. Standard **spoilerfrei**: weder eingegebene Buchstaben noch Ziele werden gezeichnet. Bewusste Checkbox **„Enthält die Lösung / Spoiler“** aktiviert echte Buchstaben und Auflösungen; deutlicher Bildhinweis. Beide Doppel-Raster enthalten ausschließlich eigene reale Zeilen. Tower zeigt tatsächlichen Fortschritt/Restbudget; Speedrun bleibt kompakt mit gewähltem Raster, Punkten/gelösten/übersprungenen Wörtern und tatsächlichem Highscore. Streak-Serie, Kategorie und Challenge-ID werden aus realen Daten ergänzt.

PNG-Blob wird zunächst vorbereitet. Danach eigener aktivierbarer Share-Button mit direktem `navigator.share({files})`-Aufruf und `navigator.canShare`-Prüfung, ohne vorgelagertes asynchrones Rendering im Share-Klick. Fehler und fehlende Capability führen zur verständlichen Speicher-/Vorschaualternative. Share-Abbruch löst keinen unerwarteten Download aus. Downloadanker und Long-Press-Anleitung ergänzen den Fallback. Vorschau-URLs werden ersetzt/freigegeben. Kein Backend/CDN/Fremdservice und keine neue App-Laufzeitabhängigkeit.

## PWA-Vorbereitung

Neuer isolierter Cache **v2-final-20261011-b**, **38** erforderliche Assets einschließlich aller historischen Wörter-/Qualitätsversionen und neuer Runtime-Module. Relative Unterverzeichnispfade geprüft. cache.addAll installiert das vollständige Paket als Batch. Fehlschlag löscht nur einen zuvor nicht vorhandenen neuen Cache; alter funktionsfähiger Cache und andere Scopes bleiben erhalten. Installierte neue Worker warten; skipWaiting erst auf ausdrücklich angefordertes Update. Aktive Spielansicht, Eingabesperre und laufender Speedrun verhindern einen unkontrollierten Reload/Update-Klick. Pause/Speichern vor manuellem Update. Diese Mechanik wurde mit Adaptern geprüft; reale PWA-Updates sind noch offen.

## Tatsächlich ausgeführte Prüfungen

- **305 automatisierte Testgruppen**, alle bestanden: sämtliche bisherigen Modi, Engine, Sonderzeichen/Mehrfachbuchstaben, Migration, Backup, Statistiken, Konfliktschutz, neue Ergebnisprojektionen/Archivvalidierung, alte Qualitätspakete und gescheiterte Cache-Installation. Vollständiges Protokoll: `docs/qa/automated-tests.log`.
- Qualitätsgenerator exakt reproduziert; sämtliche Ledger-Einträge erfasst; geschützte Wörter geprüft. Unveränderte de-1-Blobs/Quellhashes und historischer Audit weiterhin geprüft.
- Auswahl-Simulation: 570 Prüfpunkte, bestanden; vollständige Daten `data/quality/selection-simulation.json`.
- **88 echte PNG-Testdateien plus 88 wiederholte identische Exporte** mit dem Entwicklungsadapter `@napi-rs/canvas`, PNG-Signatur und Decoder geprüft. Gewinne/Niederlagen aller Modi, Abbruch, Sonderzeichen, langer 20-Zeilen-Tower, 100-Wörter-Speedrun sowie regulär verlorenes Speedrun-Wort, beide Varianten. Originalsession und Statistiken unverändert. Dies ist echte PNG-Erzeugung, **kein Browsernachweis**. Drei Beispieldateien liegen unter `docs/qa/`; sie sind reproduzierbare Testspiele, keine vorgetäuschten Spielerrekorde. Klassik-, Doppel- und Tower-Bilder wurden visuell angesehen; Abstand und Schrift korrigiert.
- Chromium-Installation versucht: Downloadarchive leer/ungültig, Installation gescheitert. Alle sechs Browser-Skripte gestartet; Browserlaunch scheitert bereits am fehlenden Executable. Keine Layout-, Touch-, Safari-, native Share- oder echte Offline-Prüfung als bestanden behauptet. Protokoll: `docs/qa/browser-attempts.log`.
- `tests/browser-results.cjs` vorbereitet für 320×568, 360×640, 390×844, 430×932, Desktop, Querformat, Touch, Raster, PNG, Datei-Share-Adapter und isolierten Offline-Start. Erst mit funktionierendem Browser ausführbar.
- Node-Lastmessungen bei 100/1.000/10.000 klassischen Ereignissen sowie 100/1.000/10.000 vollständigen Ergebnisarchiven ausgeführt. Zahlen in `data/quality/performance-measurements.json` und `data/quality/phase8/result-performance.json`; keine mobilen Performancebehauptungen.

## Einschränkungen und Release-Gates

1. Echte Chrome/Android/Samsung- und Safari/iPhone-Layouts bei allen Breiten, Safe Area, Landscape, Touch/Hardwaretastatur, Ergebnis-Scrollen und Timer-Lifecycle prüfen.
2. Datei-Sharing in installierter PWA, OS-Sharemenü, WhatsApp, iOS Download/Long-Press, Abbrechen und Fallback physisch prüfen.
3. Isoliertes reales Alt-PWA→2.0-Update: laufende Runden, Daily, Beutel, Offline-Neustart, gescheiterte Installation, parallele Tabs/ältere PWA und wartendes Update während Speedrun.
4. Große Historien: 10.000 archivierte Ergebnisse erzeugen rund **5,36 MB formatiertes JSON**; validieren/exportieren im lokalen Node-Test ungefähr 137/202 ms. Gerätequoten und CPU unterscheiden sich stark. Keine automatische Löschung; Quota-Fehler schützen den alten Datensatz und fordern Backup. Mobile Reaktionsfähigkeit bei solchen Größen ist nicht zertifiziert. Session-Replay großer Arcade-Historien bleibt zusätzlich geräteabhängig.
5. KI-Klassen sind subjektiv. Weitere lokale Wortmeldungen/Spielerfeedback einplanen, ohne erneut unbemerkt historische Wortpakete auszutauschen.
6. Bestehender Mehrtab-Lease ist kein atomarer serverseitiger CAS; sehr enge simultane localStorage-Schreibfenster bleiben eine lokale Browsergrenze. Speedrun ist kein manipulationssicheres Online-Ranking.

**Nächster Schritt ist gezielte isolierte Geräte-/Browser-QA und gemeinsame Freigabeprüfung, keine neue Spielphase und kein automatischer Merge.**

## Geänderte Dateien

Neue Runtime: `js/results.js`, `js/result-image.js`, `data/words-de-2.1.js` (historisch), `data/words-de-2.2.js`, `data/word-quality-de-2.js`, `data/word-quality-de-2.1.js`. Integration: `js/app.js`, `js/storage.js`, `js/selection.js`, `data/word-registry.js`, `data/word-quality.js`, `index.html`, `style.css`, `sw.js`.

Qualität/Messung: `data/quality/phase8/*`, `data/quality/selection-simulation.json`, `data/quality/performance-measurements.json`; Generatoren `tools/build_quality.py`, `tools/build_quality_v2.py`, `tools/benchmark_results.cjs`, `tools/verify_result_png.cjs`, `tools/test_all.py`.

Tests: `tests/phase8.test.cjs`, `tests/phase8-quality.test.py`, `tests/sw-failure.test.cjs`, `tests/browser-results.cjs`, angepasste historische Qualitäts-/Audit-/Cache-/Phase-7-Tests. Dokumentation: README, TESTING, WORDLISTS, WORD_REVIEW, Wortversions-/Qualitäts-/Auswahlpläne, historischer de-2-Bericht, Phase-8-Fortschritt/-Abschluss und QA-Protokolle/Testbilder. Unveränderte Core-Engine, Modusregeln und produktive Pages-Konfiguration.
