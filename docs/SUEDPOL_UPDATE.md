# SÜDPOL · Ergänzung am 17.10.2026

Der Nutzer hat dieselbe Ergänzung und sofortige Veröffentlichung wie bei VORWAHL beauftragt.

- SÜDPOL: sechs Buchstaben (Ü ist ein Buchstabe), reguläres Lösungswort Klasse A sowie gültiges Ratewort. Allgemein bekannter geografischer Begriff, ausdrücklich vom Nutzer gewünscht.
- Aktiver lokaler Wortvertrag de-2.5 / quality-6; Lösungsumfang 5248 → 5249, Sechsbuchstabenpool 1686 → 1687. Reproduktion: `python tools/build_suedpol.py`.
- Historische Pakete einschließlich de-2.4 und die generierte quality-4 bleiben unverändert. quality-5 wird weiterhin für gespeicherte de-2.4-Beutel aufgelöst. Die neue Qualitätsansicht fügt nur SÜDPOL als A hinzu.
- Vorhandene Haupt- und Survivor-Auswahlbeutel übernehmen das Wort einmal, ohne verbrauchte Wörter, Cooldown oder Zyklen zurückzusetzen. Migration ist idempotent. Laufende Runden, Historien und Backups behalten ihre eigenen gespeicherten Lösungswörter.
- Additive Eingabe-Kompatibilität erlaubt SÜDPOL auch in historischen lokalen Runden. Daily-Ziele bleiben eingefroren.
- Keine Online-/Cloudflare-Änderung und kein Deployment dort. Online-Client und Worker-Quellen sind gegenüber dem vorherigen Release bytegleich. SÜDPOL bleibt bei Online-Duellen vorerst ungültig.
- Survivor bleibt unverändert: drei Herzen, Upgrade nach sieben gelösten Wörtern.
- Neuer Offline-Cache v2-2-1-suedpol-20261017-a umfasst das neue Paket.

Prüfung: `python tools/test_all.py`, einschließlich gezielter SÜDPOL-Tests für NFC, Wortlänge, A-Auswahl, tatsächliche Eingaben in Klassisch/Zufall/Streak/Doppel/Tower/Speedrun/Survivor, historische Pakete, Auswahlmigration, Idempotenz, Backup-Roundtrip und unveränderte Daily-/Survivor-/Online-Verträge. Keine neuen echten Geräte- oder Browserprüfungen.
