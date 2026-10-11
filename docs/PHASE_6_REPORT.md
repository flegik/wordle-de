# Phase 6 · Wort-Duell

Entwicklung ausschließlich auf `feature/arcade-v2`. Phase 5 war vollständig
committed: Remote-Head `f2bfbf37df1ce7f7d74d558dbfe10d31a74e3fb8`.
Alle **80** Ausgangsblobs wurden gegen lokales committed HEAD bytegleich über
Git-Blob-SHA geprüft. Baseline erneut: **188 Testgruppen bestanden**.
main: `22331471b9179d408879cec10f5aa1e1291cf26e`, unverändert.
Keine Pages-/Release-/Merge-/Veröffentlichungsaktion.

Code-Commit: 92c177fe964fae9c385d4cf9df3de0c1cf466c2c

## Implementiert

- Zufalls-Duell: Wahl 4–7, Ziehung über vorhandene globale Wortbeutel, exactes
  Ziel im versionierten Link. Ersteller sieht das Wort vorab nicht.
- Wunschwort: normale Texteingabe mit Live-Zählung/Validierung, allgemeiner
  Eingabepool, NFC/Ä/Ö/Ü/ẞ; LEGAT regulär akzeptiert. Ersteller kennt das Wort
  und erhält eine reine Sharing-Ansicht ohne eigene gewertete Teilnahme.
- Einladungen bei initialem Hash und Hashwechsel; ausdrücklich annehmen,
  fortsetzen oder abgeschlossenes Ergebnis öffnen. Mehrere Duelle parallel,
  ID-Kollisionen mit geändertem Inhalt werden abgewiesen.
- Vollständiges Spiel mit 6/7 Versuchen, gemeinsamen bestehenden Wordle-Regeln,
  Touch-/Hardware-Eingaben, Flip-/Shake-/Ergebnisgestaltung und reduzierter Bewegung.
- Automatische Speicherung, Pause, bestätigter Abbruch, exakt einmalige Wertung.
- Challenge-Links und echte Emoji-Ergebnisse teilen, Web Share/Clipboard/manuelle
  Kopie. Lokaler Ergebniscodevergleich, Unentschieden und beide-nicht-gelöst-Fälle;
  keine Zeitwertung. Ergebnisse ausdrücklich lokal/nicht verifiziert.
- Eigene Statistik mit Typfilter: gespielt, gelöst/nicht gelöst, Abbrüche,
  Lösungsquote, Gewinnschnitt, Bestwert, Serien, Histogramm, Rateversuche.

## Architektur und Speicherung

Drei lokale Module: Links/Codec, Duellregeln, UI. `Sessions.createRound`,
`createSession`, `appendAttempt`, `roundView`, `finish`, `result` werden wiederverwendet.
Engine und generischer Session-Kern bleiben bytegleich. Kein neuer Evaluator,
kein Backend/CDN/Framework. Ein kleiner gemeinsamer `ThemeUI.wordGame`-Renderer
wurde aus dem vorhandenen Raster extrahiert; Themen und Duell verwenden dasselbe
scrollbare Board und dieselbe `DoubleUI.keyboard`. Themenregeln unverändert.

Modusvertrag 1 mit deterministischer Session-ID aus Challenge-ID, einer Runde,
fixen normalen Regeln ohne globale Hard-Veränderung und kanonischer Tippfolge.
Ziel/Länge nur in Round, Farben daraus abgeleitet. Eigene ungespielte Einladungen
in optionalem `duelChallenges`; beim Selbststart random in Session umgewandelt.
Fremde Einladung erzeugt vor Annahme weder gespeicherte Session noch Event.
Alle Spielstände und IDs bleiben bei Reload/Backup erhalten.

Schema 2, Schlüssel `wordle-de:v2`, Schema-1-Migration bleiben bestehen. Neuer
vertragsspezifischer Validator schützt Sessions/Events und Pending-Einträge.
Generische alte Duel-Prototypen ohne neue Felder bleiben gültig. Beschädigte
Originaldaten bleiben im bisherigen read-only/Export-Schutz. Import überschreibt
weiterhin erst nach vollständiger Prüfung und Bestätigung. Kein stiller Reset.

Wertung nur über `recordSession`; Session/Event müssen exakt übereinstimmen.
Ein gelöstes Duell ist kein Klassiker-Sieg und kein automatisch gewonnener
Freundevergleich. Vergleichsergebnis ist absichtlich nur im Arbeitsspeicher der
Ansicht: kein neuer Rekordzähler, kein Backupverlust relevanter eigener Ergebnisse.
Keine Rangliste/Identität/gerätesynchronisierten Zähler.

## Linkformat und zukünftige Versionen

Vollständiger Vertrag: [DUEL_FORMAT.md](DUEL_FORMAT.md).
Bounded kanonisches UTF-8/Base64url-JSON, Checksumme, exakte erlaubte Felder,
UUID v4, bekannte Wort-/Regel-/Formatversion, tatsächliche Poolzugehörigkeit.
Keine ungeprüften Hashwerte im HTML. Ziel vorab in keiner Einladungsansicht.
Linkadresse aus aktuellem Origin/Einstiegspfad, inklusive Unterverzeichnis.

Checksumme erkennt Beschädigung, keine Authentizität. Technisches Auslesen der
Lösung und Manipulation lokaler Ergebnisse bleiben möglich. Validierte veränderte
Payloads können mit neuer Checksumme erstellt werden; das wird sogar getestet.
Gleiche lokal schon bekannte ID mit anderem Inhalt wird dennoch zurückgewiesen.

de-1 unverändert; kein de-2 aktiviert. Ziel explizit statt Listenindex gespeichert,
Originalwortversion in Link/Session/Event. Für spätere de-2-Freigabe historische
Registry aus WORD_VERSION_PLAN implementieren und passendes Paket injizieren.
Heute unbekannte Versionen verweigern, niemals andere Ziele einsetzen/löschen.

## UI und mobile Entscheidungen

Wort-Duell unter ENTDECKEN & FREUNDE. Zwei separate Einstiegskarten, kompakte
Längenwahl, Live-Wunschwortfeld, Liste aller angenommenen/erstellten Challenges.
Einladung/Ready zeigen Länge, Limit, Kurz-ID; Ergebnis volle ID und Zielwort.
Kein Replay derselben beendeten Challenge. Eigenes Wunschwort hat keinen Selbst-
spielen-Button. Das Spiel nutzt das bestehende bounded Raster, Safe Areas und
innere Scrollfläche; Tastatur bleibt außerhalb. Normaler Textinput nur beim
Wunschwort und optionalen Ergebnisimport, nicht während Wordle-Eingaben.

Lokaler Vergleich zeigt eigene/fremde Lösung, Vergleichssieg/-verlust,
Unentschieden oder keinen Gewinner. Ohne Import ausdrücklich kein Vergleichsergebnis.
Dark/Light und reduzierte Bewegung unverändert. Ankommende Links pausieren einen
Speedrun, schließen Dialoge und stoppen visuelle Timer, ohne Spielregeln rückgängig
zu machen. Bereits akzeptierte Tipps sind zu diesem Zeitpunkt gespeichert.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `js/duel-links.js` neu | Versionierter Codec, Grenzen, Wörter-/UUID-/Regelprüfung |
| `js/duel.js` neu | Session-Vertrag, Pending, ID-Auflösung, Regeln, Statistik/Share/Vergleich |
| `js/duel-ui.js` neu | Erstellen, Einladung, Ergebnis, eigener Statistikfilter |
| `js/app.js` | Routing, Hashannahme, Pause/Fortsetzung, Inputs/Animationen, Sharing |
| `js/storage.js` | Optionaler Duellvertrag und konsistente Event-/Pending-Prüfung |
| `js/theme-ui.js` | Bestehendes Single-Board als `wordGame` wiederverwendbar |
| `index.html`, `style.css` | Drei defer-Module und zugängliche Texteingabefelder |
| `sw.js` | Drei Assets im Entwicklungs-Precache, Cache weiterhin v1 |
| `tests/duel.test.cjs` neu | 33 Codec-/Regel-/Storage-Gruppen |
| `tests/duel-app.test.cjs` neu | 32 Controller-/Sharing-Gruppen |
| `tests/browser-duel.cjs` neu | Optionales isoliertes Zwei-Kontexte-/Layout-/Offline-Skript |
| `tests/helpers/app-harness.cjs` | URL/Hashwechsel und Browser-Base64 im VM-Adapter |
| `tests/sw.test.cjs`, `tools/test_all.py` | 25 Cache-URLs, Duell-Suites/Syntaxchecks |
| `README.md`, `TESTING.md`, Architektur-/Format-/Phase-6-Dokumente | Bedienung, Ergebnisse und Grenzen |

Globale Wörter, Quellen/Audit/Themenpools/Generator, Engine, generische Sessions,
alle anderen Regelmodule, Manifest/Icons und produktive Bereitstellung unverändert.

## Tatsächlich ausgeführte Prüfungen

`python tools/test_all.py`: **253 Testgruppen bestanden**, davon **65 neu**
(33 Duell-Codec/Regeln/Storage + 32 Controller). Alle bisherigen 188 bestehen.
17 Runtime-JS-Syntaxprüfungen sowie `node --check tests/browser-duel.cjs` und
`git diff --check` bestanden. SW-Adapter prüft 25 Precache-URLs und verschachtelten
Scope; keine echte Installation damit behauptet. Tagesfixtures (1.461), LEGAT,
Migration/Backups, de-1-Audit und alle bisherigen Modusregeln bleiben erfolgreich.

Neue Tests prüfen insbesondere Canonical-JSON/UTF-8/ẞ, Links/IDs/Versionen,
XSS-/Größen-/Beschädigungsfälle, Unicode-Wunschwörter und getrennte Pools,
Mehrfachbuchstaben, Limits/letzter Versuch, doppelte Tipps/Enter/Erstellung,
Wunschwort-Erstellerrolle, mehrere Challenges, Wiederöffnung/Reload, ID-Kollisionen,
archivierte Events, globale Hard-Unabhängigkeit, Speedrun-Pause bei Linkannahme,
angenommene Ergebnisse während Animation, eigene Statistik, Rohdatenschutz,
Backups/alte Prototypen, echte Emoji-Reihen, Web Share/Abbruch, Clipboardfehler
und manuelle Kopie sowie nicht verifizierte Vergleichsgrenzfälle.

`node tests/browser-duel.cjs` tatsächlich versucht: Chromium-Executable fehlt,
Stop vor Browserstart. Browser-Skript ist syntaktisch geprüft, sein tatsächlicher
Ablauf nicht bestätigt. **Keine** erfolgreichen Render-/Touch-/Safari-/Android-/
Samsung-/WhatsApp-/PWA-/Offline-Gerätetests behauptet. TESTING.md enthält die
noch offene Matrix ab 320px, Querformat und zwei unabhängigen Spielerkontexten.

## Einschränkungen und nächste Phase

- Keine Serverauthentifizierung/Anti-Cheat oder echte Echtzeit-Spielergebnisse.
  Link/Code technisch dekodier-/manipulierbar. Vergleich nur lokal und temporär.
- iOS/Android-Linkrouting in PWA und Speicherteilung sind geräteabhängig; keine
  automatische Appöffnung versprochen. Erstmalige fremde Links benötigen eine
  verfügbare Website oder bereits gecachten passenden Kontext.
- Speicherung bleibt Last-Write-Wins zwischen Tabs. Historien/Pending wachsen;
  keine riskante automatische Löschung. Quota-/Geräte-/Multi-Tab-Releaseprüfung
  und das bekannte v1/v2-Konflikt-Migrationskonzept bleiben Release-Kriterien.
- Cacheversion absichtlich nicht erhöht. Nur isoliert testen; 1.0 versteht Duelle
  nicht. Gemeinsamer Release benötigt eigene neue Cacheversion und Upgradeprüfung.
- Phase 7 kann nach Auftrag die Wortqualität/Alltagsbekanntheit bearbeiten, mit
  freigegebener Policy, de-1-Archiv/Registry und gezielter de-2-Migration. MUMPS,
  COUP/CLOU, PESEL und andere Diskussionen wurden hier nicht vorgezogen.

Phase 6 endet hier. Kein weiterer Modus, kein Wortlistenaustausch und kein Release.
