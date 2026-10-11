# Phase 7 · Wortqualität, Auswahl und Spielgefühl

Nur `feature/arcade-v2`. Ausgangspunkt: vollständig committed Phase 6,
Remote `839dfd67ad6adbeb0747a7240df81db20571a502`, 88 geprüfte Ausgangsblobs.
Baseline tatsächlich erneut ausgeführt: **253 bestandene Testgruppen**.
main bleibt `22331471b9179d408879cec10f5aa1e1291cf26e`.
Keine Pages-/Release-/Merge-/Veröffentlichungsaktion.

Implementierungscommit:
[940c785](https://github.com/flegik/wordle-de/commit/940c7852c5b54a20ebca0342b2c3476ce45856ca).
Zusätzlicher Schutz für bestätigte Wiederherstellung beschädigter Originalkopien:
[338cb9f](https://github.com/flegik/wordle-de/commit/338cb9f5540b4150510b490b8740646699473695).

Dokumentation wird getrennt auf demselben Entwicklungsbranch committed.

## Implementiert

- Internes de-2: **5.568 Lösungen / 15.138 Eingaben**. Nur freigegebene sechs
  Lösungen entfernt; nur PESEL zusätzlich als Eingabe entfernt. LEGAT bleibt
  regulär auswählbar, Klasse C. ZWINGE/MONARCH bleiben B; HUHNS/MICH Eingaben.
- Bytegleiches de-1-Archiv und Registry. Daily-Ziele unverändert; aktive alte
  HUNNI/PESEL-Runden, klassische Backups und alte Duell-Links bleiben gültig.
  Themen behalten unveränderte eigene Version/Beutel und de-1-Basis.
- Reproduzierbare vollständige A/B/C-Zuordnung, explizite Ausschlusspolicy und
  maschinenlesbare manuelle Prüfliste. Quellen/Lizenzen erhalten, keine neuen
  erfundenen Einträge, keine automatischen Tausendfach-Ausschlüsse.
- Gemeinsame adaptive gewichtete Beutel je Länge über alle freien Modi und
  zufällige Duelle. Ein kompletter Pool vor Wiederholung, 150-Ziele-Cooldown,
  deterministische Restbeutel-Migration, dokumentierter Erschöpfungsfallback.
- Schema 2 / `wordle-de:v2` beibehalten. Statistiken/absolvierte Tage/Streaks
  bleiben erhalten; Versionen werden nach Kontext validiert. Verlustfreier
  Export/Import, keine erneute Ergebniswertung.
- Exakte alte Quellkopie, v2-Schreib-Lease, geschützte Konflikte/Originalexports.
  Fremde validierte Tab-Stände nur nach Bestätigung; erneute Änderung während
  des Dialogs wird abgelehnt. Pure sichere additive Übernahmelogik getestet,
  keine automatische unklare Zusammenführung in der UI.
- Lokale Wortmeldungen auf Ergebnisbildschirmen, Grund/Notiz/ID/Version/Modus,
  eigener JSON-Export und normaler Backup-Erhalt. Keine automatischen Löschungen.
- Bestehende Menüstruktur/Modusstile erhalten. Kürzere gemeinsame Flip-/Gewinn-
  Übergänge, kompakte schmale Menükarten, scrollbare safe-area-fähige Dialoge,
  lesbare 16px-Meldeformulare, gleichartige Backup-Buttons. Speedrun bleibt schnell.
- Offline-Assetliste erweitert auf 32 Dateien, produktive Cache-Version bleibt v1.

## Geänderte Dateien

Daten/Generatoren: `data/words-de-1.js`, `data/words-de-2.js`,
`data/word-quality.js`, `data/word-registry.js`, `data/quality/policy-de-2.json`,
`data/quality/manual-review-de-2.txt`, `data/quality/selection-simulation.json`,
`data/quality/performance-measurements.json`, `tools/build_quality.py`,
`tools/simulate_selection.cjs`, `tools/benchmark_phase7.cjs`.

Runtime: `js/selection.js`, `js/sync.js`, `js/reports.js`, `js/storage.js`,
`js/sessions.js`, `js/double.js`, `js/tower.js`, `js/speedrun.js`, `js/theme.js`,
`js/duel.js`, `js/duel-links.js`, `js/app.js`, `index.html`, `style.css`, `sw.js`.
Die Wordle-Engine und produktiven de-1-Quelldaten wurden nicht verändert.

Tests: `tests/phase7.test.cjs`, `tests/quality.test.py`, `tests/app.test.cjs`,
`tests/app-storage.test.cjs`, `tests/audit.test.py`, `tests/double-app.test.cjs`,
`tests/tower-app.test.cjs`, `tests/speedrun-app.test.cjs`, `tests/duel.test.cjs`,
`tests/sw.test.cjs`, `tools/test_all.py`. Alte UI-Fixtures übernehmen fremde
Spielstände jetzt ausdrücklich. de-999 ersetzt den früher ungültigen de-2-Fall.

Dokumentation: `README.md`, `TESTING.md`, `WORDLISTS.md`, `WORD_REVIEW.md`,
`docs/WORD_REVIEW_DE_1.md`, `docs/WORD_QUALITY.md`, `docs/WORD_SELECTION.md`,
`docs/SELECTION_SIMULATION.md`, `docs/WORD_VERSION_PLAN.md`,
`docs/ARCHITECTURE_V2.md`, dieser Bericht.

## Tatsächlich ausgeführte Prüfungen

- `python tools/test_all.py`: **288 Testgruppen bestanden**, inklusive aller
  bisherigen Regeln, Modi, Migrationen, Backup-, Timer-, Unicode-, Hard-Mode-,
  Sharing- und SW-Adapterprüfungen. Zusätzlich 31 Phase-7-Integrationsgruppen
  und 4 Qualitätsgruppen. Syntaxprüfungen neuer Runtime-Dateien eingeschlossen.
- `python tools/build_quality.py`: offline erzeugt; erzeugte Dateien im Test
  bytegleich reproduziert. de-1-Archiv gegen unveränderte Originalbytes geprüft.
- `node tools/simulate_selection.cjs`: **570 Checkpoints** mit realen festen Seeds,
  alle vier Längen, drei Verfahren, wechselnde und reine Modusprofile.
  Vollständige Pooldurchläufe ohne Duplikate, keine sofortigen Wiederholungen,
  150-Ziele-Abstand bei Folgezyklus eingehalten.
- `node tools/benchmark_phase7.cjs`: reale lokale Node-Messungen für 100/1.000/
  10.000 klassische Ereignisse; Details und Grenzen im Simulationsbericht.
- `git diff --check`: erfolgreich.
- `node tests/browser-duel.cjs`: **versucht, nicht durchführbar**. Chromium
  headless shell fehlt unter dem erwarteten Playwright-Pfad. Keine realen
  Browser-/Layout-/Touch-/iPhone-/installierte-PWA-Tests als bestanden gewertet.

## Reale Auswahl und Qualitätsgrenzen

2.370 A / 3.197 B / 1 C. **3.195 B-Wörter sind vorläufig und benötigen manuelle
Prüfung**, keine behauptete vollständige Bekanntheitsfreigabe. A beruht auf
kombinierten Quellen-Signalen oder expliziten Entscheidungen; auch diese sind
keine wissenschaftliche Bekanntheitsmessung. C enthält nur ausdrücklich LEGAT.

Fünfer-Pool, Seed 42, wechselnde Modi: nach 100 adaptiven Ziehungen 73/26/1,
nach 500: 295/204/1, nach 1.000: 558/441/1, voller Zyklus: 607/548/1.
Adaptive Planung reduziert frühen A-Verbrauch; naiv sind die letzten 100 des
Zyklus ausschließlich B, adaptiv 20 A/80 B. Somit bessere Balance, keine
behauptete dauerhaft exakte Zielquote. Rein C-freie Modi müssen zuletzt verbleibendes
C konsumieren, statt bekannte Wörter vorzeitig zu wiederholen. Alle Messdaten
und andere Profile stehen in der JSON-Ausgabe.

## Offene Risiken und Phase 8

1. Prüfliste redaktionell bearbeiten; insbesondere Bekanntheit und Rätselwert
   absichern, weitere passende C-Wörter ausdrücklich freigeben. Nicht tausende
   Wörter aus Frequenz-/Suffixsignalen automatisch löschen.
2. Mobile QA auf 320/360/390/430 Pixeln, kurzen Displays und Querformat; alle
   bestehenden Modi, Dialoge, Meldungen, längere Tower-Historien, reduzierte
   Bewegung sowie Hardware-/Touch-Eingaben tatsächlich prüfen.
3. iPhone Safari/Android, Web Share/Clipboard/Downloads, Lifecycle, installierte
   PWA und echte Offline-Updates auf isoliertem Test-Origin prüfen.
4. Exakte Quellkopien und Session-Historien vergrößern lokale Backups. Keine
   automatische Löschung; Quotenfehler sind geschützt. Langzeitlast auf Geräten
   und maximale Session-Historien bleiben offen.
5. localStorage ist kein atomares Compare-and-Swap. Lease und Storage-Events
   erkennen gewöhnliche Konflikte; exakt simultane Schreib-Races sind nicht
   vollständig atomar abgesichert. Keine Manipulations-/Anti-Cheat-Garantie.
6. Konflikte benötigen bewusste Backup-Sicherung/Übernahme; die UI verspricht
   keine automatische Vereinigung widersprüchlicher alter und neuer Runs.
7. Vor gemeinsamem Release neuen Cache vergeben und atomare Installation,
   alte/neue PWA parallel sowie Datenübernahme auf Geräten testen. Aktuell
   weiterhin keine Freigabe oder Veröffentlichung.

Die Arbeit endet nach Phase 7. Phase 8 wurde nicht begonnen.
