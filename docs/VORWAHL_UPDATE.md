# VORWAHL · Ergänzung am 17.10.2026

Vom Nutzer ausdrücklich zur sofortigen Veröffentlichung freigegeben.

- VORWAHL: sieben Buchstaben, reguläres Lösungswort Klasse A und erlaubte Eingabe.
- Lokale Wortversion de-2.4, Auswahlqualität quality-5. Pool 5247 → 5248, Siebenbuchstabenpool 1821 → 1822. Alle bisherigen Pakete bleiben unverändert.
- Reproduktion: `python tools/build_vorwahl.py`. Die kleine aktive Qualitäts-Ergänzung in selection.js erhält den generierten historischen quality-4-Datensatz unverändert.
- Vorhandene de-2.3-Beutel werden validiert und verlustfrei migriert. VORWAHL kommt einmal hinzu, Restbeutel, Cooldown und Zyklus bleiben erhalten. Laufende Runden und Daily-Ziele behalten ihre historischen Versionen. Additive Registry-Eingabesicht erlaubt das Wort auch in alten lokalen Runden.
- Survivor: unverändert drei Herzen und Upgrades nach sieben gelösten Wörtern.
- Keine Cloudflare-Änderung. Online-Anfragen bleiben explizit bei de-2.3 und ihrem vorhandenen alten Server-Fallback; die neue lokale Wortversion wird nicht an den Online-Dienst gesendet. VORWAHL bleibt online zunächst ungültig.
- Tests: `python tools/test_all.py`, inklusive VORWAHL-Ziel, historische Eingabe-Kompatibilität, tatsächlicher Survivor-Sieg, Beutel-Migration/Idempotenz, Backup-Roundtrip und unveränderte Daily-Ziele. Keine neuen echten Geräte- oder Browserprüfungen.
- Neuer Offline-Cache v2-2-1-vorwahl-20261017-a enthält das neue Wörterbuch.
