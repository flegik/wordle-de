# WORDLE DE 2.0 veröffentlicht · 11.10.2026

Der Nutzer hat am 11.10.2026 um 19:38 Uhr (Europe/Berlin) ausdrücklich erklärt:
„Läuft alles! Wir können also so veröffentlichen.“ Diese Freigabe ersetzt das
vorherige Warten auf Abnahme; die einzelnen getesteten Geräte/Abläufe wurden
nicht separat benannt und werden hier nicht als agentenseitig geprüft behauptet.

## Produktion

- Adresse: https://flegik.github.io/wordle-de/
- Produktionscommit: **660689d301d21b296a72ca4c6285e4e6db7513ef**.
- Freigegebener Kandidat: 023100e8dd73b2f1022b2432886c3d530b73d8c0.
- Normaler Merge über PR #1, beide Eltern verifiziert, kein Force-Push.
- Vorheriger main-/Rollback-Commit: 22331471b9179d408879cec10f5aa1e1291cf26e.
- Beide Branch-HEADs unmittelbar vor Integration unverändert geprüft.
- GitHub Pages Workflow **38160541176**: completed / success, exakt für diesen
  Produktionscommit. Keine manuellen Pages-/Workflow-Einstellungsänderungen.

## Tatsächliche produktive Nachprüfung

- HTTPS-Startseite und index.html liefern HTTP 200 und die freigegebenen Bytes.
- Alle **37 unterschiedlichen Runtime-Dateien / 38 Precache-Einträge** via HTTPS
  erreichbar, SHA-256 vollständig identisch zum geprüften Paket. Protokoll:
  `qa/production-assets.json`. Zusätzliche normale Requests ohne Queryparameter
  für Startseite, index.html, sw.js und js/app.js ebenfalls exakt gleich.
- Echte Cloud-Chrome-Oberfläche öffnet die öffentliche Spielseite. Alle neun
  Menüeinträge sichtbar; klassisches 5-Buchstaben-Spiel gestartet.
- Hardwareeingabe **LEGAT** wird als genau ein gültiger Tipp angenommen;
  Kacheln und Tastaturhinweise erscheinen, Anzeige wechselt zu Versuch 2/6.
- Neuladen → Fortsetzen zeigt identischen Tipp und Versuch 2/6. Kein doppelter
  Versuch, keine zusätzliche Statistikwertung durch Neuladen.
- Einstellungen zeigen **Offline-Paket installiert**, de-2.2 und 5.400 Lösungen /
  15.138 Eingaben. Dies bestätigt Installation im Browser, keinen separat
  durchgeführten produktiven Flugmodus-/Homescreen-Neustart.
- Keine Anwendungsausnahme im beobachteten Fehlerprotokoll; vorhandene Meldungen
  stammen von der Cloud-Browser-Erweiterung, nicht der Wordle-Seite.
- Screenshot der echten veröffentlichten Oberfläche: `qa/production-smoke.jpg`.
  Der Full-Page-Screenshot scheiterte am Capture-Timeout; Viewport-Aufnahme gelang.

Vorherige Regression: **308 Testgruppen bestanden**. Keine zusätzliche mobile
oder native OS-Share-Abnahme durch den Agenten behauptet. Keine Wortlisten,
Spielerstatistiken oder lokalen Daten gelöscht; geprüftes Runtime-Paket unverändert.

## Aktualisieren und Rücksetzen

Bestehende PWA online öffnen und ein angebotenes Update in den Einstellungen
bewusst laden; laufende Runde vorher pausieren. Keine Neuinstallation erforderlich.
Den bisherigen Homescreen-Eintrag und lokale Browserdaten erhalten.

Rollback-Verfahren und Speichergrenzen stehen im historischen
`RELEASE_CANDIDATE_2_0.md`. Code-Rollback ist keine Schema-2→1-Datenmigration.
Keine lokalen Statistikschlüssel löschen. Neues Cache-Kennzeichen und normales
Revert verwenden, anschließend Deployment erneut prüfen.

Dieser Nachweis wird ausschließlich als Dokumentation auf dem Entwicklungsbranch
gesichert; der oben genannte produktive Commit und seine Runtime bleiben unverändert.
