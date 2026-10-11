# WORDLE DE 2.1 · Online-Duelle · isolierte Testversion

**Nachtrag:** Der Produktivrelease wurde am 11.10.2026 ausdrücklich freigegeben.
Die aktuelle Live-Konfiguration steht in [RELEASE_2_1.md](RELEASE_2_1.md).
Der folgende Bericht dokumentiert die davor abgeschlossene Testbereitstellung.

Stand: 11. Oktober 2026. Ausschließlich `feature/duel-online-v2-1`.

Test-PWA und API: https://wordle-de-duel-test.wordle-de-flegik-test.workers.dev

`main`, GitHub Pages, Releases und die produktive PWA wurden nicht verändert.
Auf dem Test-Origin liegen frische, von der Produktion getrennte Browserdaten.
Der kostenlose Workers-Tarif wurde vom Kontoinhaber im Dashboard bestätigt.
Es wurden keine kostenpflichtigen Dienste, Tarifwechsel oder Upgrades eingerichtet.

## Benutzung

Im Hauptmenü **Online-Duell** öffnen, 4–7 Buchstaben wählen und ein Duell
erstellen. Den angezeigten sechsstelligen Code oder den Einladungslink weitergeben.
Der zweite Spieler kann den Code direkt in der App eingeben. Nach dem Beitritt
spielen genau zwei Teilnehmer dasselbe Wort. Die Lösung wird serverseitig aus
`de-2.2` gewählt, einschließlich des regulären Eintrags LEGAT.

Nach Abschluss beider Spieler erscheinen die tatsächlich eingegebenen Wörter
und serverseitig berechneten Farben beider Boards. Gelöst schlägt nicht gelöst;
weniger erfolgreiche Versuche gewinnt; gleiche erfolgreiche Versuchsanzahl ist
ein Unentschieden; beide nicht gelöst ergibt keinen Sieger. Online-Ergebnisse
benötigen keine WD-R1-Codes und verändern keine klassischen/Arcade-Statistiken.
Alte lokale Wort-Duelle und ihre Ergebniscode-Vergleiche bleiben eigenständig.

Ein iPhone-Link kann Safari öffnen. Eine automatische Weiterleitung in die
installierte PWA wird nicht versprochen. Zugänge liegen im Browser-/PWA-Speicher
des jeweiligen Origins; Safari, eine installierte PWA und andere Geräte können
unterschiedliche Speicher haben. Dort erneut beitreten erzeugt keine zusätzliche
dritte Teilnahme. Die Wiederaufnahme gelingt mit dem ursprünglichen Zugang.

## Architektur und Vertrag

`online/index.mjs` exportiert nur den Worker-Handler. `online/worker.mjs`
verwendet die unveränderte gemeinsame Engine und das eingefrorene Wörterbuch
`data/words-de-2.2.js`. `online/migrations/0001_rooms.sql` legt Räume und
Rate-Limits in D1 an. Keine zusätzlichen Laufzeit-CDNs oder Frameworks.

Das Online-Spiel nutzt eigene Serverprojektionen, weil eine lokale WordRound
ihren Zieltext bereits vor Spielende enthalten würde. Gemeinsam verwendet werden
NFC-/ẞ-Normalisierung, zweistufige Mehrfachbuchstaben-Auswertung, Wörterbuch,
Tastaturkomponente und Board-/Farbklassen. Der Client bestimmt keine Ergebnisse.
Serverprojektionen bleiben durch Wortversion und `contract: 1` versioniert.

| Anfrage | Zugang / Daten | Wirkung |
|---|---|---|
| `POST /api/rooms` | Bearer-Token, `{length}` | Raum anlegen; derselbe Token stellt denselben Raum wieder her |
| `POST /api/rooms/123456/join` | eigener Bearer-Token, `{}` | atomarer zweiter Platz oder Wiederaufnahme desselben Platzes |
| `GET /api/rooms/123456` | Teilnehmer-Bearer-Token | eigene Wörter/Farben, gegnerischer Status |
| `POST /api/rooms/123456/guesses` | Token, `{revision,word}` | Wörterbuchprüfung und serverseitige Wertung |

Einladung: `#online=123456`, ausschließlich Code; keine Lösung und kein Token.
Tokens entstehen **vor** Erstellung/Beitritt aus 32 Web-Crypto-Zufallsbytes auf
dem Client. Dadurch kann dieselbe Anfrage auch bei verlorener Antwort wiederholt
werden. Der Server speichert ausschließlich SHA-256-Hashes. Bearer-Tokens sind
aufgrund ihrer 256-Bit-Entropie kein passwortähnlicher Wörterbuch-Hash.

Ein Raum ist eine einzelne SQL-Zeile. Der Beitritt erfolgt durch ein bedingtes
UPDATE bei leerem oder identischem Guest-Hash. Das verhindert zwei gleichzeitige
Gäste. Jeder Spieler hat einen eigenen JSON-Zustand mit Revision. Ein bedingtes
UPDATE gegen den vorher gelesenen Zustand verhindert überschreibende parallele
Eingaben. Dieselbe Eingabe auf bereits bestätigter Revision wird quittiert;
abweichende Daten auf alter Revision werden mit 409 abgewiesen. Höchstens sechs
Versuche bei 4/5, sieben bei 6/7 Buchstaben. Wiederholte Wörter sind unzulässig.

Ohne Teilnehmer-Token sind Raumdaten nicht lesbar. Ein Code allein erlaubt nur
den Beitritt zum noch freien zweiten Platz. Gegnerische Wörter und das Feld
`solution` werden erst nach Abschluss beider Spieler freigegeben. Eigene gelöste
Wörter können selbstverständlich schon vorher als vollständig grüne Eingabe
sichtbar sein. Es gibt keinen öffentlichen Ergebnis-Endpunkt.

## Speicherung, Netzwerk und PWA

`js/online-duel.js` hält Zugänge, validierte Snapshots, Entwürfe und noch nicht
quittierte Anfragen unter **`wordle-de:online:1`**. Schema 2 und `wordle-de:v2`
bleiben unverändert. Ein Reload stellt die aktive Raumansicht über den Code im
Fragment wieder her. Die Duellliste enthält eigene offene und fertige Räume.
Es werden maximal 1000 eigene Räume gespeichert; keine automatische Löschung
lokaler Daten. Online-Zugänge sind bewusst nicht Teil der klassischen
Statistik-Backups. Ein Löschen der Browserdaten verliert diese anonymen Zugänge;
es gibt keine Kontowiederherstellung und keinen geräteübergreifenden Login.

Beschädigte Online-Daten, Speicherfehler und konkurrierende Tab-Schreibvorgänge
werden sichtbar gemeldet. Originaldaten werden nicht zurückgesetzt. Eine
anstehende Eingabe wird vor dem Request gespeichert; bei Verbindungsproblemen
bleibt sie für den Retry erhalten. Eindeutige Ablehnungen erlauben die Korrektur
des Entwurfs. Fehlende/fremde Tokens, belegte und abgelaufene Räume haben eigene
Fehlermeldungen. Abgelaufene/entzogene Zugänge stoppen automatisches Polling.

Nur die geöffnete, noch nicht gemeinsam abgeschlossene Raumansicht pollt:
15 Sekunden, bei Fehlern Verdopplung bis 120 Sekunden. Verdeckte Seiten, Offline,
Duellliste und Hauptmenü starten kein Polling. Requests haben 12 Sekunden Timeout.
Ein bereits laufender Request darf beim Verlassen fertig gespeichert werden.
GET/POST-Requests verwenden `cache: no-store` und keine Cookies; API-Antworten
setzen `Cache-Control: no-store`. Der SW ignoriert `/api/`, Authorization-Requests
und andere Origins. Die beiden neuen Runtime-Scripts sind im Precache.

Der Entwicklungs-SW hat den eigenen Cache `v2-1-test-20261011-b` und wurde nur
auf dem Test-Origin installiert. Für einen später ausdrücklich freigegebenen
Produktivrelease sind eine neue Release-Cachekennung und Geräte-Upgradechecks
erforderlich. Hier fand kein produktives PWA-Update statt.

## Schutz und tatsächliche Grenzen

JSON-Bodies sind auf 512 Bytes begrenzt, auch ohne Content-Length. Eingabefelder,
Methoden, Revisionen und Wörter werden strikt geprüft. Farben, Status und
Ergebnisdaten aus Requests werden nicht angenommen. CORS erlaubt ausschließlich
den genannten Test-Origin sowie localhost/127.0.0.1 auf 8081 und 8787.
Keine Freigabe der produktiven Pages-Adresse vor einer Releaseentscheidung.

Globale Obergrenze: 8000 authentifizierte API-Anfragen/UTC-Tag. Pro IP:
60/Minute, Erstellung zusätzlich 5/Stunde, einschließlich Wiederholungen.
Die atomaren D1-Zähler gelten über alle Worker-Instanzen. IPs werden nur als
täglich wechselnde SHA-256-Kennung für die kurzlebigen Limits gespeichert;
diese Kennung ist **keine garantierte Anonymisierung** einer IP-Adresse.
Rate-Zeilen werden nach Ablauf beim täglichen Cleanup entfernt.
Die kleinen Limits sind für einen kostenlosen Testservice gedacht und können
gemeinsame NAT-Netze betreffen. 429 verlangt eine Pause; `Retry-After: 60`.

Eine anonyme Einladung ist kein Identitätsnachweis: Wer den Code kennt oder
errät, kann den freien zweiten Platz beanspruchen. Hashes schützen Teilnehmer-
Tokens in D1, aber XSS/Browserzugriff kann lokal gespeicherte Tokens stehlen.
Automatisierte Solver können aus legitimen Farbantworten das Wort erschließen.
Wörterbuchprüfung verhindert erfundene Endergebnisse, aber bietet **keine absolute
Anti-Cheat-Garantie**. Kein CAPTCHA oder zusätzlicher bezahlter Missbrauchsdienst.
Die Free-Plattformkontingente und interne Limits begrenzen Verfügbarkeit;
ein verteilter Angreifer kann trotzdem das Tagesbudget verbrauchen.

Worker-Observability ist deaktiviert; Anwendungscode protokolliert keine
Tokens/Requests. Test-Assets bekommen eine CSP und `Referrer-Policy: no-referrer`.
Cloudflare-Zugangsdaten verbleiben ausschließlich in Wranglers lokalem
OAuth-Speicher; kein Secret, Token oder Passwort im Frontend oder Repository.

## Eingerichtete Ressourcen und erneute Bereitstellung

| Ressource | Tatsächlicher Stand |
|---|---|
| Worker | `wordle-de-duel-test`, Workers Free vom Nutzer bestätigt |
| D1 | `wordle-de-duel-test`, ID `287419a5-70e7-4532-9ac6-d07f9203586b`, EEUR |
| Binding | `DB` |
| Migration | `0001_rooms.sql`, lokal und remote erfolgreich angewendet |
| Static Assets | isolierte PWA, ausschließlich Offline-Runtime-Allowlist |
| Cron | täglich `17 3 * * *`, also 03:17 UTC (05:17 MESZ / 04:17 MEZ) |
| Ablauf | Zugriff endet exakt nach 30 Tagen; physische Löschung beim nächsten Cleanup |
| Domain | neuer kostenloser Account-Subdomain `wordle-de-flegik-test.workers.dev` |
| Secrets | keine Worker-Secrets nötig; eingeschränkte Wrangler-OAuth-Rechte |

Die erste Registrierung des generischen Domainnamens `online` durch Wrangler
scheiterte, weil er belegt war. Danach wurde der eindeutige Test-Subdomain oben
eingerichtet. Die vorhandene Browser-Anmeldung wurde nicht kopiert: Der Nutzer
bestätigte selbst einen offiziellen OAuth-Dialog für Wrangler mit `account:read`,
`user:read`, `workers_scripts:write`, `d1:write` und `offline_access`. Breitere
Wrangler-Standardrechte wurden nicht angefordert. Die Tarif-API gab deshalb 403;
der Nutzer bestätigte Workers Free anschließend im angemeldeten Dashboard.

Reproduzierbar, aus dem Entwicklungsbranch, mit Node und pnpm:

```sh
git switch feature/duel-online-v2-1
cd online
pnpm install --frozen-lockfile
# Nur bei fehlender CLI-Anmeldung, vom Nutzer selbst bestätigen:
pnpm exec wrangler login --scopes account:read user:read workers_scripts:write d1:write
pnpm exec wrangler d1 migrations apply wordle-de-duel-test --local
cd ..
node tools/build_online_test.cjs
cd online
pnpm exec wrangler dev --local --ip 127.0.0.1 --port 8787
```

Vor einer erneuten **Test**-Bereitstellung die Tests ausführen, Runtime-Paket neu
bauen, dann `pnpm exec wrangler d1 migrations apply wordle-de-duel-test --remote`
und `pnpm exec wrangler deploy` in `online/`. Es gibt keine automatische
Produktionspipeline und keinen Merge. Kein Kopieren von `.wrangler`, `.dev.vars`,
OAuth-Dateien oder lokalen D1-Dateien in das Asset-Paket.

Aktuelle offizielle Referenzen (am 11.10.2026 geprüft):
[Workers-Limits](https://developers.cloudflare.com/workers/platform/limits/):
100.000 Requests/Tag, 10 ms CPU/Request, 128 MB, fünf Cron-Trigger im Free-Konto.
[D1-Preise](https://developers.cloudflare.com/d1/platform/pricing/):
5 Mio. gelesene und 100.000 geschriebene Zeilen/Tag, insgesamt 5 GB Free-Speicher.
Kontingente gelten kontoübergreifend über eigene Anwendungen; Indizes und
Rate-Limits verursachen ebenfalls D1-Schreibzugriffe. Der globale App-Limiter
reduziert das Arbeitsbudget, ersetzt aber kein Cloudflare-Quota-Monitoring.
[D1-Worker-API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
und [Cron-Dokumentation](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
beschreiben Bindings, atomare Batches und UTC-Schedules. Keine kostenpflichtige
Erweiterung für dieses Projekt aktiviert.

## Tatsächlich geprüfte Qualität

Die GitHub-Ausgangsstände wurden frisch geklont und erneut geprüft:
main und Entwicklungsbranch `660689d301d21b296a72ca4c6285e4e6db7513ef`,
Arcade-Branch `37149f191b7440f4db4b0979cb54d1a3d89f9f5e`.
Keine abweichende lokale Vorgeschichte übernommen, kein Force-Push.

Baseline: `python tools/test_all.py` aus einem bytegetreuen Git-Archiv bestanden.
Windows-CRLF brach anfangs den eingefrorenen Fixture-Hash; nach Wiederherstellung
der Git-LF-Bytes und `PYTHONUTF8=1` liefen alle Baseline-Gruppen. Die Original-
Fixtures und Wörterbücher wurden nicht geändert.

Nach Implementierung: vollständige Suite inklusive **16 neuer API-/SQLite- und
7 Client-/Storage-/SW-Gruppen** erfolgreich. Die SQL-Tests führen echtes SQLite
mit Schema und Constraints aus; sie ersetzen keine D1-Laufzeitprüfung.

Zusätzlich erfolgreich:

- Wrangler-Bundle und reale lokale workerd-Laufzeit mit D1-Binding/Migration.
- Zwei frische Headless-Edge-Kontexte, Touch- und Hardwareeingabe,
  Linkbeitritt, Reload mit Entwurf, verlorene Antwort nach serverseitiger Annahme,
  idempotente Wiederholung, automatische Freigabe beider realer Boards.
- Layouts 320×568, 360×640, 390×844, 430×932, 1000×800 und 640×360;
  Ergebnisansicht visuell kontrolliert und mit vertikalem Scrollbereich korrigiert.
- Reale Service-Worker-Installation, vollständige Offline-Dateien, Offline-
  Klassikspiel sowie keine API-URLs im Cache.
- Externe bereitgestellte Free-Worker-/D1-Testversion mit zwei frischen
  Browserkontexten bei 360×640 und 430×932: Raumcodebeitritt, zwei reguläre
  nicht gelöste Spiele, Freigabe authentischer Wörter/Farben, kein Sieger,
  unberechtigter API-Zugriff abgewiesen, klassische Statistiken unberührt.
  Ein zweiter externer Durchlauf prüfte zusätzlich ein echtes erfolgreiches
  Unentschieden.
- Syntaxchecks und `git diff --check`.

**Offen:** echte Android-/iPhone-Geräte, installierte mobile PWAs, native
Einladungs-/Share-Wege, Safari/PWA-Speichergrenzen und spätere produktive
Upgradeprüfung. Emulierte Mobilbreiten sind keine Geräteprüfung. Die tägliche
remote Cron-Ausführung nach tatsächlich 30 Tagen wurde naturgemäß noch nicht
abgewartet; Ablauf/SQL-Cleanup sind automatisiert getestet und der Cron deployed.

Keine zwingenden Cloudflare-Einrichtungsschritte mehr offen. Der nächste
Schritt ist ein Test auf zwei echten Geräten auf diesem isolierten Origin.

## Nachvollziehbarer Abschluss

Implementierungscommit: `44d6044` · `feat(duel): implement verified online duels with isolated Cloudflare test PWA`.
Finale Cloudflare-Testversion: `2d905e76-5921-46f0-8783-bf92d90c2b8c`.
Der separate Dokumentationscommit hält dieses Ergebnis und die offenen Gerätechecks fest.
