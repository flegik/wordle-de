# WORDLE DE 2.1 · Online-Duelle

Live-PWA: https://flegik.github.io/wordle-de/

Produktions-API: https://wordle-de-duel.wordle-de-flegik-test.workers.dev

Zwei Spieler treten per sechsstelligen Raumcode oder Link bei, spielen dasselbe
serverseitig ausgewählte Wort und erhalten nach beiderseitigem Abschluss die
realen Ratewörter, Farben und den Vergleich. Lokale Modi und bisherige Statistiken
bleiben getrennt. Die Veröffentlichung von 2.1 wurde am 11.10.2026 freigegeben.

Architektur, Sicherheit, Bereitstellung, Free-Limits und echte/offene Prüfungen:
[Online-Duell 2.1](docs/ONLINE_DUEL_V2_1.md) und
[Produktivrelease](docs/RELEASE_2_1.md). Die folgenden Phasenberichte sind historisch.

---

# Phase 6 · Wort-Duell im Entwicklungsbranch

Nur `feature/arcade-v2`, keine Veröffentlichung. Unter **ENTDECKEN & FREUNDE →
Wort-Duell** eine Zufalls-Challenge mit 4–7 Buchstaben erstellen, Link teilen und
selbst spielen; oder ein gültiges Wunschwort festlegen und Freunde raten lassen.
Wunschwort-Erstellung zählt nicht als Spiel des Erstellers. Globale Hard-Einstellung
bleibt erhalten, Duelle verwenden normale Regeln.

Links öffnen zunächst eine Einladung. Derselbe Link setzt die gespeicherte
Challenge fort oder zeigt das abgeschlossene Ergebnis. Mehrere Herausforderungen
bleiben im Duell-Menü verfügbar. Pause bewahrt Draft/Hinweise, bestätigter Abbruch
beendet dieselbe lokale Challenge endgültig. Schema-2-Backups umfassen alles.

Zufalls-Ergebnisse als Emoji/Text zurückschicken und optional den Ergebniscode
im Ergebnisbildschirm vergleichen. Weniger erfolgreiche Versuche gewinnt, keine
Zeitwertung. Checksumme/Encoding sind keine Verschlüsselung, Fremdergebnisse nicht
verifiziert. Eigene Duellstatistik zählt gelöste Rätsel, keine Vergleichssiege.

**Noch keine öffentlich nutzbaren 2.0-Links:** Live 1.0 versteht Duelle nicht.
Für Tests auf isoliertem Origin lokal `python -m http.server 8080` im Projekt
starten, Desktop `http://localhost:8080/` öffnen. Eigener HTTPS-Testhost für
Freundes-/Gerätetests; produktive Pages dafür nicht verändern. Dateiöffnung kann
spielen, lokale Datei-Links lassen sich nicht öffentlich mit Freunden verwenden.
PWA/Service Worker brauchen HTTPS oder localhost. Safari und installierte PWA
können getrennte Speicher/Linkwege haben; automatisch in der PWA öffnen wird
nicht garantiert. Ohne vorhandenes Offline-Paket braucht Erstöffnung Internet.

Prüfungen: `python tools/test_all.py` → **253 Gruppen bestanden**. Browsercheck
`node tests/browser-duel.cjs` versucht, Chromium fehlt; reale Gerätechecks offen.
Details: [Phase 6](docs/PHASE_6_REPORT.md), [Linkformat](docs/DUEL_FORMAT.md),
[Tests](TESTING.md), [Wortversionsplan](docs/WORD_VERSION_PLAN.md).

---

# Entwicklungsstand WORDLE DE 2.0 · Phase 5

Ausschließlich `feature/arcade-v2`. Doppeltes Wordle und Wordle Tower sind hier
spielbar. Themen-Wordle bietet vier kuratierte Kategorien und neun freigegebene
Kategorie-Längen-Kombinationen. Speedrun ergänzt 180 Sekunden aktive Vordergrundzeit, zufällige
Wortlängen, Punkte und eigene Highscores. Tower bietet vier Etagen (4→5→6→7), ein gemeinsames Budget von 20
Versuchen, gespeicherte Übergänge und eigene Rekorde. `main` bleibt Version 1.0.
Keine Veröffentlichung, keine produktive Pages-Änderung und kein Merge.

- Phase 5 / Themenmodus und Wortqualität: [docs/PHASE_5_REPORT.md](docs/PHASE_5_REPORT.md)
- Themenlisten vollständig und prüfbar: [docs/THEME_WORDS.md](docs/THEME_WORDS.md)
- Phase 4 / Speedrun, Timer und Grenzen: [docs/PHASE_4_REPORT.md](docs/PHASE_4_REPORT.md)
- Phase 3 / Tower-System, Befunde, Risiken: [docs/PHASE_3_REPORT.md](docs/PHASE_3_REPORT.md)
- Phase 2 / Funktionen, Architektur, Risiken: [docs/PHASE_2_REPORT.md](docs/PHASE_2_REPORT.md)
- Tatsächliche Tests und offene Gerätechecks: [TESTING.md](TESTING.md)
- Grundlage: [docs/ARCHITECTURE_V2.md](docs/ARCHITECTURE_V2.md)
- Wortqualität: [WORD_REVIEW.md](WORD_REVIEW.md)
- Geplanter de-2-Umstieg: [docs/WORD_VERSION_PLAN.md](docs/WORD_VERSION_PLAN.md)
- Historischer Phase-1-Bericht: [docs/PHASE_1_REPORT.md](docs/PHASE_1_REPORT.md)
- Checks ohne Zusatzpakete: `python tools/test_all.py` (Python 3 + Node.js)

## Entwicklungsstand lokal prüfen

Branch auschecken, dann `python -m http.server 8020 --bind 127.0.0.1` im
Projektordner und `http://localhost:8020` öffnen. Im Menü **Arcade → Wordle Tower**
wählen, dann „Tower starten“. Zum Fortsetzen wieder
Wordle Tower öffnen und „Tower fortsetzen“ wählen; auch ein offener Etagenübergang
wird wiederhergestellt. Doppeltes Wordle bleibt über seinen Menüeintrag erreichbar.
Speedrun: **Arcade → Speedrun → Speedrun starten**. Jeder gelöste Vierer/Fünfer/
Sechser/Siebener bringt 100/150/200/250 Punkte. Skip kostet 10 Sekunden.
Bei Hintergrundwechsel oder Pause steht die Uhr; „Speedrun fortsetzen“ nimmt
das gespeicherte Budget wieder auf. Kein Countdown und keine Lade-Wartezeit.
Zum Abbrechen erst pausieren, dann ausdrücklich bestätigen. Highscores und
Statistiken sind vollständig von den anderen Modi getrennt.

Themen-Wordle: **Entdecken & Freunde → Themen-Wordle**. Kategorie und verfügbare
Wortlänge wählen, dann „Themenrunde starten“. Tiere: 5; Natur und Essen: 4–6;
Haushalt: 5–6. Gesperrte Längen haben weniger als 25 kuratierte Lösungen.
Nur die Lösung gehört zum Thema; alle allgemeinen Wörter bleiben als Tipps erlaubt.
Eine laufende Runde lässt sich fortsetzen; ein Wechsel benötigt eine Bestätigung,
bevor die alte Runde als Abbruch erfasst wird. „Nächstes Themenwort“ behält
Kategorie/Länge. Hard Mode wird beim Start übernommen, Themenstatistiken sind getrennt.

Nur auf einem separaten Entwicklungs-Origin testen; den bestehenden Live-Origin
und dessen Worker/Statistik nicht für Zwischenversionen verwenden. Falls der
Localhost-Port schon eine ältere Testversion cached, einen frischen Port verwenden.

Die folgenden Installations-/Pages-Anleitungen dokumentieren Version 1.0.
Sie sind **keine Freigabe**, diesen Entwicklungsbranch zu veröffentlichen.
Für diesen Entwicklungsstand wurde keine neue eingebettete Einzeldatei erstellt.

---

# WORDLE DE · Dein Wortmoment

Aktuelle Release-Prüfung für 2.0: [Release Candidate](docs/RELEASE_CANDIDATE_2_0.md)
und [kurze isolierte Geräte-/Upgrade-Abnahme](docs/MANUAL_RELEASE_QA.md).
Die Live-Version bleibt bis zur ausdrücklichen Freigabe unverändert.

Fertiges, clientseitiges deutsches Wortspiel, Version 1.0. Keine Anmeldung, keine Laufzeitpakete, keine externen Schriftarten oder Dienste.

## Online spielen

Nach Aktivierung von GitHub Pages: https://flegik.github.io/wordle-de/

## Schnell spielen

1. ZIP vollständig entpacken.
2. `index.html` öffnen. Auf Desktop-Browsern kann die Spieloberfläche lokale CSS- und JavaScript-Dateien unter `file://` laden. Android-Dateimanager können die Datei als `content://` öffnen und dann den Zugriff auf die benachbarten Dateien verhindern: in diesem Fall die Einzeldatei oder den HTTPS-Link verwenden.
3. Falls der Dateibrowser deines Handys HTML nur als Vorschau darstellt: die gehostete HTTPS-Version benutzen. Lokale Dateifreigabe und dauerhaftes `localStorage` unterscheiden sich zwischen Browsern; der Desktop-Dateimodus ist die zuverlässigere direkte Testoption.

Die separat gelieferte `WORDLE-DE.html` ist eine eingebettete Einzeldatei zum einfachen lokalen Spielen. Sie ist kein installierbares PWA-Paket. Für die PWA die vollständigen Projektdateien verwenden.

## Localhost / PWA testen

Im entpackten Projektordner, wenn Python 3 installiert ist:

```sh
python -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Für Service Worker ist HTTPS oder **localhost auf dem gleichen Gerät** nötig. `http://192.168.x.x:8000` am Handy genügt nicht. Für mobile Tests empfiehlt sich GitHub Pages mit HTTPS.

Alle tatsächlich benötigten Laufzeitdateien sind im Service-Worker-Precache. Nach erfolgreicher Aktivierung in den Einstellungen die Offline-Bereitschaft prüfen und das Spiel einmal schließen und erneut öffnen. Anschließend im Flugmodus testen. Lokale Daten können durch das Löschen von Browser-/Website-Daten verloren gehen: regelmäßig ein JSON-Backup exportieren.

## Kostenlos mit GitHub Pages veröffentlichen

1. Auf GitHub ein neues öffentliches Repository anlegen, z. B. `wordle-de`.
2. **Den Inhalt** des Projektordners hochladen, sodass `index.html`, `sw.js` und `manifest.webmanifest` direkt im Repository-Stamm liegen. Die Unterordner `js`, `data`, `icons` und `licenses` erhalten.
3. Repository → **Settings → Pages → Build and deployment**.
4. Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)` → **Save**.
5. Warten, bis GitHub den erfolgreichen Pages-Build und den Link meldet. Normalerweise: `https://DEINNAME.github.io/wordle-de/`.
6. Den Link weitergeben. Andere Nutzer benötigen keine Dateien und kein GitHub-Konto zum Spielen.

Eine `.nojekyll`-Datei liegt bei. Alle App-Pfade sind relativ; Manifest, Scope und Service Worker unterstützen Repository-Unterverzeichnisse. Das vollständige Projekt liegt in `flegik/wordle-de`.

## Android installieren

HTTPS-Link in Chrome oder Samsung Internet öffnen. Browsermenü → **App installieren** / **Zum Startbildschirm hinzufügen** (Bezeichnung kann variieren). Nach abgeschlossener Offline-Einrichtung lässt sich die App über das Icon starten.

## iPhone installieren

HTTPS-Link in **Safari** öffnen → Teilen → **Zum Home-Bildschirm** → Hinzufügen. Kein App-Store erforderlich. Die installierte Web-App öffnet mit eigenem Icon und ohne normale Browserleiste. Aktuelle Safari-Version empfohlen; native Dialoge erfordern iOS 15.4 oder neuer. Auf echten iPhones wurde diese Lieferung hier nicht getestet.

## Regeln und bewusste Entscheidungen

- Klassisch: 4–7 Buchstaben; Zufall und Streak wählen zuerst die Länge mit jeweils 25 % Wahrscheinlichkeit.
- 4–5 Buchstaben: 6 Versuche. 6–7 Buchstaben: 7 Versuche.
- Grün vor Gelb: Mehrfachbuchstaben werden anhand verbleibender Vorkommen bewertet.
- Ä, Ö, Ü, ẞ zählen einzeln. Eingaben werden mit NFC normalisiert; `ß` wird vor dem Großschreiben in `ẞ` überführt. AE ist kein Ersatz für Ä.
- Tagesrätsel: UTC-Datum und unveränderte Wortlisten-Version `de-1` bestimmen Länge und Wort. Wechsel um 00:00 UTC (Deutschland: 01:00 Winter / 02:00 Sommer). Gerätezeit muss stimmen. Eine abgeschlossene Tagesrunde wird genau einmal gewertet.
- Kostenlose Spielmodi teilen einen gespeicherten, gemischten Wortbeutel pro Länge. Eine Wiederholung erfolgt erst nach Durchlauf des Pools; auch an der Grenze zweier Pools wird das letzte Wort ausgeschlossen. Tagesrätsel verwenden unabhängig davon die gemeinsame deterministische Auswahl.
- Startseite/Schließen pausiert, **Abbrechen** zählt nach Bestätigung als Niederlage mit zusätzlichem Abbruchmerkmal. Jede freie Spielart hat eine gleichzeitig fortsetzbare Runde. Ein Wechsel der klassischen Länge erfordert bei offener Runde eine Abbruchbestätigung.
- Bereits pausierte Tagesrunden älterer UTC-Tage bleiben im Backup erhalten, werden nach dem Tageswechsel aber nicht mehr zum Spielen angeboten und nicht automatisch als Niederlage gewertet.
- Der Gesamtdurchschnitt und die Längenschnitte berücksichtigen ausschließlich Siege. Rateversuche zählen in der Statistik abgeschlossene Runden; Versuche laufender Runden werden beim Abschluss übernommen. Statistiken sind nach Modus und Länge filterbar. Serien in gefilterten Statistiken beziehen sich auf die gefilterte Reihenfolge; die Streak-Kampagne hat zusätzlich eigene dauerhaft gespeicherte Werte.
- Hard Mode ist pro Runde festgelegt. Er erzwingt grüne Positionen, verbietet bekannte gelbe Positionen und berücksichtigt Mindestmengen sowie explizit erkannte Obergrenzen mehrfach vorkommender Hinweisbuchstaben. Vollständig graue Buchstaben werden nicht grundsätzlich verboten.
- Klänge werden lokal als leise Sinustöne erzeugt. Standard: aus. Reduzierte Animationen berücksichtigen auch das Betriebssystem.
- Teilen enthält nur Modus, Länge, Ergebnis und Emoji-Raster, niemals das Lösungswort. Web Share → Clipboard → markierbarer Text als Fallback.
- Backup: Schema 1, Wortversion `de-1`. Enthält Einstellungen, Runden, Ergebnisprotokoll, Wortbeutel und Serien. Import prüft die Daten und überschreibt erst nach ausdrücklicher Bestätigung. Kein Merge. Fremde Wort-/Schemaversionen werden abgelehnt.
- Browserdaten sind lokal, nicht konten- oder geräteübergreifend synchronisiert. Backups und lokale Quelldateien enthalten Lösungswörter: kein manipulationssicherer Wettbewerb.

## Dateien

```text
index.html              Einstieg
style.css               Responsive Design
js/engine.js            Reine Regeln, Statistik, Backup-Validierung
js/app.js               Ansichten, Eingabe, Speichern, Teilen
sw.js                   Offline-Cache und Update-Aktivierung
manifest.webmanifest    Installationsdaten
icons/                  PNG-App- und Apple-Icons
data/words.js           Offline-Wortdaten nach Länge
data/sources/           Originalquellen zur Reproduzierbarkeit
tools/build_words.py    Reproduziert words.js ohne Netzwerk
tests/                  Ausführbare Node-Tests ohne Testpakete
licenses/               Vollständige Fremdlizenzen
WORDLISTS.md            Herkunft, Datenumfang, Einschränkungen
TESTING.md              Tests und offene Gerätetests
```

## Entwickeln und testen

```sh
node tests/engine.test.cjs
node tests/app.test.cjs
node tests/sw.test.cjs
python tools/build_words.py
```

Node/Python sind ausschließlich Entwicklungswerkzeuge, keine Laufzeitabhängigkeiten. Beim Ändern der Offline-Dateien die Cache-Version in `sw.js` erhöhen. Updates warten, bis der Spieler sie in den Einstellungen aktiviert. `de-1`-Lösungspools und deren Reihenfolge **nicht** nachträglich verändern, weil sich sonst gemeinsame Tagesrätsel verschieben. Neue Wortlisten brauchen eine neue Version und bewusst implementierte Datenmigration.

## Entwicklungsstand Phase 7

Nur `feature/arcade-v2`, weiterhin keine Veröffentlichung. Neue freie Spiele
nutzen intern de-2, Tagesrätsel/historische Spielstände behalten de-1. Beide
Wörterbücher liegen offline vor. Gemeinsame gewichtete Beutel verhindern
Wiederholungen über alle freien Modi. A/B/C-Klassen sind vorläufig; die manuelle
Prüfliste ist vor Veröffentlichung redaktionell zu bearbeiten.

Ergebnisbildschirme bieten „Wortqualität melden“: lokal speichern, Grund und
optionale Notiz, JSON-Export in Einstellungen. Meldungen sind auch im normalen
Backup enthalten; keine automatische Übermittlung oder Wortentfernung.

Bei geänderten alten PWA-/anderen Tab-Daten werden Schreibzugriffe geschützt.
Beide Stände sichern, erst dann bewusst übernehmen/importieren. Backup-Import
überschreibt nach Bestätigung; er vereinigt nicht automatisch konkurrierende Runs.

Prüfen: `python tools/test_all.py`.
Reproduzieren: `python tools/build_quality.py`.
Simulation: `node tools/simulate_selection.cjs`.
Messung: `node tools/benchmark_phase7.cjs`.
Berichte: docs/PHASE_7_REPORT.md, WORD_REVIEW.md, docs/WORD_SELECTION.md,
docs/SELECTION_SIMULATION.md, docs/WORD_VERSION_PLAN.md.

## Phase 8 – Entwicklungsstand, keine Veröffentlichung

Ergebnisraster und lokales PNG-Sharing sind für alle neun Modi integriert. „Als Bild teilen“ öffnet eine spoilerfreie Vorschau; Buchstaben/Lösungen erfordern die ausdrückliche Spoiler-Auswahl. Nach Fertigstellung des Bildes öffnet „Bild teilen“ bei unterstütztem Datei-Sharing das native Menü. Sonst „PNG speichern“ oder die Vorschau lange drücken. Text-/Emoji-Sharing bleibt separat verfügbar.

Gespeicherte Ergebnisse sind über die Statistik erreichbar (die letzten 20 vorhandenen Historien, ohne ältere Daten zu löschen). Alte reine Statistikeinträge ohne Wortverlauf können kein Raster liefern. Neue klassische Abschlüsse speichern Eingaben, keine redundanten Farbraster; Arcade-Historien verwenden vorhandene Sessions. Backup enthält beides.

Aktive Wort-/Qualitätsversion im Entwicklungsbranch: `de-2.3 / quality-4`; Schema und Schlüssel bleiben 2 / `wordle-de:v2`. Alle vorherigen Wörterbücher bleiben verfügbar. Tagesrätsel und themes-1 bleiben unverändert. KI-Prüfung und ihre Grenzen: [WORD_REVIEW.md](WORD_REVIEW.md).

Prüfen: `python tools/test_all.py`. Optionale echte Browserprüfung: `node tests/browser-results.cjs` mit installiertem Playwright/Chromium. Native Canvas-QA: `node tools/verify_result_png.cjs` mit einer nur für Entwicklung erforderlichen `@napi-rs/canvas`-Installation; die Anwendung selbst hat keine externe Laufzeitabhängigkeit.

Der vorbereitete PWA-Cache `v2-final-20261011-b` gehört ausschließlich zum Entwicklungsbranch. Isolierten HTTPS-/localhost-Origin verwenden; nicht auf der produktiven Pages-URL testen. Keine automatische Releasefreigabe. Bericht und offene Gerätetests: [docs/PHASE_8_REPORT.md](docs/PHASE_8_REPORT.md).

### Doppel-Wordle 2.1.2 (Entwicklungsbranch)

`feature/double-lengths-v2-1-2` ergänzt die Auswahl 4/5/6/7/Zufall mit
7/8/9/10 gemeinsamen Versuchen. Alte 5/8-Runden und Backups bleiben kompatibel.
„Neue Doppel-Runde“ behält die Wahl, „Wortlänge ändern“ öffnet die Auswahl.
Details und spätere Merge-/Release-Hinweise: [DOUBLE_LENGTHS_2_1_2.md](docs/DOUBLE_LENGTHS_2_1_2.md).

### Wordle Survivor 2.2

Solo-Run mit drei Herzen, vier Upgrades alle **sieben gelösten Wörter**,
behutsam steigenden Wortlängen und eigenen Rekorden. Pausieren, Backups und
PNG-/Textsharing verwenden die vorhandenen Systeme. Alte Test-Runs bleiben
kompatibel. Balance-Update am 16.10.2026 ausdrücklich zur Veröffentlichung freigegeben;
Release-Cache `v2-2-release-20261016-a`.
[Regeln, Speicherung und Testgrenzen](docs/SURVIVOR_V2_2.md).

### Wortqualität 2.2.1 (Entwicklungsbranch)

`feature/word-quality-v2-2-1` bereitet de-2.3 / quality-4 vor: NUTZUNG als
A-Lösung und Ratewort, 154 Spezialbegriffe nur noch als Ratewörter und 514
neu eingestufte Lösungen. Historische Ziele, Statistiken und Survivor-Regeln
bleiben erhalten. [Vollständiger Qualitätsbericht](docs/WORD_QUALITY_2_2_1.md).
Keine Veröffentlichung; Online-API-Unterstützung und PWA-Cache sind für eine
spätere gemeinsame Freigabe vorbereitet. Auf dem alten Online-Service ist
NUTZUNG bis zum gesondert freigegebenen Worker-Update noch nicht gültig.
