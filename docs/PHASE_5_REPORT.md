# WORDLE DE 2.0 · Phase 5: Themen-Wordle

Entwicklung nur auf `feature/arcade-v2`. Ausgangspunkt ist der vollständig
committed Phase-4-Stand `0d64afe1e204cdba310cea95707bc05c69754e68`.
Die tatsächlichen Engine-/Session-/Storage-/UI-Module, de-1-Daten, Wortaudit,
Wortversionsplan und bisherigen Abschlussberichte wurden untersucht.
Baseline: **145 Testgruppen bestanden**. Keine fehlende Phase-4-Voraussetzung.

Umsetzungscommit: [`1f9977f`](https://github.com/flegik/wordle-de/commit/1f9977fa963ec768b8df69656f07900a0722b81a).

## Funktionen

Einzelne Wortrunde als `GameSession` im Modus `theme`. Kategorie und verfügbare
Wortlänge vor Start wählen; 6 Versuche für 4/5, 7 für 6/7. Nur die Lösung ist
themengebunden: **alle gültigen allgemeinen Wörter** bleiben als Tipps erlaubt.
Bestehende Mehrfachbuchstaben-, NFC-/ẞ- und Hard-Mode-Regeln unverändert.
Hard wird beim Rundenstart übernommen und ändert sich nicht rückwirkend.

Menübereich Entdecken & Freunde, vier Kategorienkarten, gesperrte dünne Pools,
Start-/Fortsetzenbutton, Kategorie im Spielheader, gemeinsame deutsche Tastatur,
Pause, bestätigter Abbruch und bestätigter Wechsel einer laufenden Runde.
Neue Runde verwendet standardmäßig dieselbe Kategorie/Länge. Ergebnis mit
Lösung, Versuchen, bisherigen Themen-/Kategoriemittelwerten und Siegesserie.
Separate Themenstatistik mit Kategorien-/Längenfilter und echter Versuchsverteilung.
Sharing mit tatsächlich gespieltem Emoji-Raster, Kategorie und Länge ohne Lösung.
Keine Joker, Hinweise oder zusätzlichen Modi eingeführt.

## Wortqualität und tatsächliche Pools

| Kategorie | 4 | 5 | 6 | 7 | Beibehalten | Aktive Zuordnungen |
|---|---:|---:|---:|---:|---:|---:|
| Tiere | 19 gesperrt | 32 aktiv | 23 gesperrt | 19 gesperrt | 93 | 32 |
| Natur | 25 aktiv | 42 aktiv | 32 aktiv | 11 gesperrt | 110 | 99 |
| Essen & Trinken | 25 aktiv | 41 aktiv | 35 aktiv | 24 gesperrt | 125 | 101 |
| Haushalt | 21 gesperrt | 38 aktiv | 34 aktiv | 18 gesperrt | 111 | 72 |
| **Gesamt** | | | | | **439** | **304** |

Vier Kategorien, neun freigeschaltete Kombinationen. 304 aktive Zuordnungen
entsprechen **292 unterschiedlichen Wörtern**, da sinnvolle Mehrfachzuordnungen
zulässig sind. Kein Siebenerpool erreicht 25; auch ein knappes 24er-Ergebnis wird
nicht künstlich aufgefüllt. Technik/Berufe nicht als schwache Platzhalter angeboten.

672 explizite Kategorie-Wort-Kandidaten: 439 beibehalten, 229 für diesen Modus
abgewiesen, vier unsichere Zuordnungen zurückgestellt. Beibehaltene Wörter in
kleinen Kombinationen sind dokumentiert, aber nicht spielbar. Vollständige
Listen und alle Entscheidungen: `docs/THEME_WORDS.md` sowie die maschinenlesbare
`data/themes/editorial-themes-1.json`. Generator wendet nur diese Entscheidungen
an; er klassifiziert nicht pauschal alle globalen Wörter nach Schlüsselwörtern.

Prüfliste: **ETAGERE** (Bekanntheit unsicher), **FASSUNG** (erst als Lampenfassung
klar), **SCHIPPE** (bevorzugte Auswahl Schaufel; Bekanntheit prüfen), **SCHLOSS**
(Mehrdeutigkeit Gebäude/Verschluss). Nicht verwendet: ALPEN als Eigenname,
HERDE als Haushaltsplural sowie abstrakte/unspezifische DEKO/DEKOR/DUFT/LICHT,
ABLAUF und ohne Kontext unklare KAPSEL/FUTTER. Fehlende de-1-Lösungen wie AFFE,
KÄFER, KREBS oder LÖFFEL werden nicht heimlich in den globalen Pool eingefügt.
Eine Ablehnung aufgrund Länge oder Poolzugehörigkeit behauptet keinen Sprachfehler.

HUNNI, PESEL, MBIT, HUHNS und MICH sind keine Themenlösungen. LEGAT bleibt eine
normale globale Lösung/Eingabe und wird keiner künstlichen Kategorie zugeordnet.
`data/words.js`, Wortaudit und globale Beutel/Tagesrätsel bleiben unverändert.
Die spätere globale Entfernung ungeeigneter Lösungen/Eingaben ist nicht Teil
von Phase 5; allgemeine Rateeingaben bleiben weiterhin de-1.

Die Kategorieauswahl ist eine redaktionelle Einschätzung durch Codex anhand
vertrauter Begriffe, **keine behauptete linguistische oder menschliche Zertifizierung**.
Reale lokale DIC-/Affix-/Häufigkeitsnachweise stammen aus dem vorhandenen Audit;
sie beweisen nicht allein semantische Zugehörigkeit oder allgemeine Bekanntheit.
222 aktive Zuordnungen haben altes Auditlabel keep, 82 review. Beispiele DILL,
FETA, ERLE und AMSEL wurden trotz schwachem Untertitel-Signal als vertraute
Lebensmittel/Pflanzen/Tiere beibehalten; alle Befunde bleiben sichtbar.
Unabhängige menschliche Zweitprüfung der kurzen Listen bleibt vor Release sinnvoll.
Quellen und Lizenzen unverändert in WORDLISTS.md/licenses; keine kopierten
externen Definitionen und keine Laufzeit-Wörterbuchabfragen.

## Session, Versionen und Auswahl

`js/theme.js` verwendet `Sessions.createRound/createSession/appendAttempt`,
`roundView` und `finish`. Eine Round-ID, kanonische Eingaben, abgeleitete Farben
und Status. Kein zweiter Wordle-Algorithmus, keine duplizierte Hard-Mode-Variante.
Session ergänzt `themeContract: 1`, `themeVersion`, `categoryId`, `input`.
Round speichert Länge, ursprüngliches Ziel, Hard-Konfiguration und klassisches Limit.

`data/themes.js`: aktuelle Version **themes-1**, Basis **de-1**, Versionenregistry,
stabile Kategorie-IDs, Namen, Icon, Beschreibung, indexierte Lösungen und verfügbare
Längen. `tools/build_themes.py` kompiliert nur explizit freigegebene Kandidaten,
prüft Duplikate/Schreibweise/Basiszugehörigkeit und 25ergrenze. Redaktionelle
Prüfliste und Auditmetadaten werden nicht zur Laufzeit geladen.

Getrennte `themeBags` pro Themenversion/Kategorie/Länge halten ungezogene Wörter
und das letzte Wort. `themeLast` vermeidet unmittelbare Wiederholung über
Kategorien hinweg. Fisher-Yates und vollständiger Pooldurchlauf bis zum Refill.
Seltene Prioritätsausnahme: bleibt genau das zuletzt in einer anderen Kategorie
gezogene Wort übrig, wird ein anderes Poolwort gezogen und der letzte Rest für
den folgenden Zug behalten. So entsteht keine direkte Wiederholung, auch wenn
dafür ein Wort vor vollständiger Ausschöpfung erneut vorkommen kann.
Allgemeine `bags`/`last` werden weder geändert noch zurückgesetzt.

Bekannte historische Themenpakete werden über ihre gespeicherte Version validiert,
nicht über die aktuelle Auswahl. Für künftige neue Pakete themes-1 unverändert
beibehalten und weitere Registry-Einträge ergänzen. Test mit neuer aktueller
Themenversion bestätigt weiter gültige themes-1-Session. Späteres de-2 braucht
zusätzlich die geplante globale Wortversionsregistry; keine de-2-Migration implementiert.
Bei künftig entfernten Kategorien sind historische Statistik-Filter und neue
Runden aus alten Kategorien gezielt zu ergänzen, bevor eine neue Themenversion
veröffentlicht wird. Heute bleiben alle vier stabilen IDs verfügbar.

## Speicherung, Backups und Statistik

Schema **2** und Schlüssel `wordle-de:v2` unverändert. Neue optionale Beutelfelder
werden nur bei Themenauswahl benötigt; alte Daten benötigen sie nicht. Schema-1-
Migration bleibt idempotent und verlustfrei. Alle bisherigen Arcade-Sessions,
Tageswertungen, klassischen Mittelwerte und Streak-Rekorde bleiben erhalten.
Generische Theme-Prototypen ohne Modusvertrag bleiben importier-/exportierbar;
sie werden nicht als freigegebene neue Themenrunden interpretiert.

Storage prüft Sessions, Basis-/Themenversion, aktive Kategorie/Länge, Ziel,
Versuchslimit, Hard, Draft, Status und Beutel. Unbekannte Kategorien/Versionen,
Marker ohne vollständigen Vertrag, falsche Lösungen oder widersprüchliche
Snapshots werden abgewiesen. Vorhandener Schutzmodus bewahrt beschädigte lokale
Originaldaten, Backup-Import überschreibt erst nach vollständiger Validierung
und Nutzerbestätigung. Kein neues separates Speichersystem.

Jeder gültige Tipp, Draft und neue Zielauswahl wird gespeichert. Reload erhält
Kategorie, Wort, Historie, Farben, Hard und Auswahlreihenfolge. Pause ist keine
Niederlage. Bestätigter Abbruch zählt einmal als abandoned/Verlust.
Session-IDs und der gemeinsame `recordSession` verhindern doppelte Ergebnisse;
Session/Event müssen übereinstimmen. Ein Themesieg erzeugt keinen klassischen
Sieg und verändert Doppel-, Tower- oder Speedrun-Ergebnisse nicht.

Statistik wird aus Thema-Events abgeleitet: gespielt, Siege/Verluste/Abbrüche,
Quote, erfolgreicher Versuchsdurchschnitt, aktuelle/beste Serie, Verteilung,
Rateversuche und Siege nach Kategorie. Kategorien-/Längenfilter wirken auf
Daten und Serien; Verluste erhalten keinen erfundenen Durchschnittsversuch.

## UI und Mobile

Bestehende Dark-/Light-Designsprache, abgerundete Karten und Touchbuttons.
Wortlängen ohne ausreichend großen Pool sind tatsächlich disabled, mit Erklärung;
synthetischer Klick auf gesperrte Länge startet ebenfalls keine solche Runde.
Kategorie bleibt im kompakten Header sichtbar. Shared Keyboard aus DoubleUI,
inklusive Ä/Ö/Ü/ẞ, keine native Texteingabe erforderlich.

Spielbereich nutzt 100dvh/Safe Areas; Raster ist innerlich scrollbar und die
aktuelle Eingabe wird nachgeführt. Kategorie und Tastatur bleiben außerhalb.
Kompakte Abstände auf kurzen Displays, Flip-/Shake-/Ergebniseffekte und vorhandene
optionale lokale Sounds. System-/App-Reduktion der Animationen gilt unverändert.
Eingabesicherung und sofortiges Speichern erfolgen vor Flip; einmalige Wertung
hängt nicht vom Ende einer visuellen Animation ab.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `data/themes.js` (neu) | Offline-Themenregistry themes-1/de-1 |
| `data/themes/editorial-themes-1.json` (neu) | Vollständige Entscheidungen und tatsächliche Audit-Indizien |
| `tools/build_themes.py` (neu) | Reproduzierbarer redaktioneller Compiler |
| `js/theme.js` (neu) | Theme-Vertrag, Auswahl, Validierung, Statistik und Share |
| `js/theme-ui.js` (neu) | Auswahl, Raster, Ergebnisse und Filterstatistik |
| `js/app.js` | Routing, Fortsetzung, Wechselbestätigung, Inputs, Scroll und Menü |
| `js/storage.js` | Optionaler Theme-Vertrag, Beutel- und Snapshotprüfung |
| `index.html` | Drei neue lokale Scripts in Abhängigkeitsreihenfolge |
| `style.css` | Scoped Kategorien-/Theme-Layout und sichere Scrollfläche |
| `sw.js` | Drei Runtime-Assets ergänzt, Cache unverändert v1 |
| `tests/theme.test.cjs` (neu) | 23 Regel-/Daten-/Storage-Gruppen |
| `tests/theme-app.test.cjs` (neu) | 17 Controller-/UI-Zustandsgruppen |
| `tests/themes-build.test.py` (neu) | Drei Reproduktions-/Redaktionschecks |
| `tests/browser-theme.cjs` (neu) | Optionaler isolierter Layout-/Touch-/Offline-Check |
| `tests/sw.test.cjs`, `tools/test_all.py` | 22 Cache-URLs, neue Suites und Syntaxchecks |
| `README.md`, `TESTING.md`, Architektur-/Themen-/Phase-5-Berichte | Bedienung, vollständige Listen, Befunde und Grenzen |

Unverändert: Engine, generische Sessions, Doppel-/Tower-/Speedrun-Regeln und UIs,
globale Wortdaten/Generator/Audit, Manifest, Icons, Lizenzen, produktive Pages.
Keine externen App-Laufzeitabhängigkeiten hinzugefügt.

## Tatsächlich ausgeführte Tests und Grenzen

Baseline: **145 bestanden**. Gesamtlauf `python tools/test_all.py`:
**188 Testgruppen bestanden**, 43 neu. 14 Runtime-JS-Syntaxprüfungen,
Syntaxcheck des optionalen Browserchecks und `git diff --check` bestanden.
Alle 145 bestehenden Gruppen einschließlich deterministischer Tagesfixtures,
Schema-1-Migration und unverändertem Wortaudit bestehen weiter.

Neue Checks umfassen alle freigegebenen Pools/Versionen/Längen, ausgeschlossene
Begriffe, LEGAT, Unicode, allgemeine Tipps außerhalb der Kategorie, Hard Mode
mit mehrfachen Buchstaben, Limits, Sieg/Niederlage/Abbruch, Beutelzyklen/Refill/
Cross-Kategorie-Rest, Reload/Draft, Modustrennung, Kategorien-/Längenstatistik,
Backups, einmalige Wertung, manipulierte Daten und spoilerfreies Teilen.
Generatorausgabe wird bytegleich aus expliziten Entscheidungen reproduziert.
Tests beweisen keine allgemeine Alltagsbekanntheit; Listen bleiben redaktionell prüfbar.

`node tests/browser-theme.cjs` tatsächlich versucht: Chromium-Executable fehlt,
Stop vor Browserstart. Kein Browserdownload. Keine tatsächlichen Render-/Touch-/
Safari-/Android-/PWA-/Offline-Browsertests bestanden behauptet. Vorbereiteter
Browsercheck für 320×568, 360×640, 390×844, 430×932, Desktop und Querformat ist
syntaktisch geprüft, sein Ablauf hier noch nicht real im Browser bestätigt.
Offene manuelle Checkliste in TESTING.md, einschließlich echter Geräte und Shares.

## Risiken und nächste Phase

- Vor Freigabe Themenlisten gemeinsam zweitprüfen und UI auf echten mobilen
  Geräten testen. Die Mindestgrenze 25 ist eine Designentscheidung, kein
  linguistisches Gütesiegel oder Befragungsergebnis.
- Bestehendes localStorage bleibt Last-Write-Wins. Historien wachsen; keine
  automatische Löschung eingeführt. Quota-/Speicherfehler und Multi-Tab-Konflikte
  brauchen die bestehenden Warnungen, Backups und spätere Release-Tests.
- themes-1-Daten bei neuen Paketen bewahren; künftige de-2-/v1→v2-Konfliktmigration
  und Tagesversionpolitik bleiben geplante Release-Voraussetzungen.
- Drei neue Runtime-Assets stehen im Entwicklungs-Precache. Cache v1 nicht erhöht.
  Nur auf frischem isoliertem Test-Origin testen. Der gemeinsame Release braucht
  eigene Cache-Version und echtes verlustfreies PWA-Upgrade/Offlineprüfung.
- Phase 6 kann später ausdrücklich Wort-Duell umsetzen: sichere Challenge-Link-
  Validierung, keine Serverannahmen, eigene Statistik und gespeicherte Wortversion.
  Wort-Duell und globale Wortlistenbereinigung wurden hier nicht begonnen.

Phase 5 endet mit diesem Entwicklungsstand. Kein Merge, keine Release-/Pages-
Änderung und keine Veröffentlichung. main bleibt unverändert Version 1.0.
