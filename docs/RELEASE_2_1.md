# WORDLE DE 2.1 · Produktivrelease

Freigegeben vom Kontoinhaber am 11. Oktober 2026: „Wir können es live nehmen.“

Die bestehende Live-Adresse bleibt https://flegik.github.io/wordle-de/.
GitHub Pages veröffentlicht `main` aus `/` über die bestehende Legacy-Pipeline.
PWA-ID, Scope und Speicher-Keys bleiben erhalten. Online-Duelle haben weiterhin
einen eigenen Speicher; die eingefrorenen Wörterbücher bleiben unverändert.

## Produktionsressourcen

- Worker: `wordle-de-duel`, https://wordle-de-duel.wordle-de-flegik-test.workers.dev
- D1: `wordle-de-duel`, ID `ac9e3358-87e5-46de-89bd-2f13e4231a57`, WEUR.
- Migration `0001_rooms.sql` remote angewendet; Cron täglich 03:17 UTC.
- Konfiguration: `online/wrangler.production.toml`; Worker-Version
  `0b5fcc79-3bb3-4e06-ba36-61a9ebee7735`.
- CORS: `https://flegik.github.io` und der eigene Produktions-Worker-Origin.
- API bleibt HTTPS, Bearer-Zugang und `no-store`. Free-Tarif und die begrenzten
  App-Limits bleiben bestehen; es wurde kein kostenpflichtiger Tarif aktiviert.
- Cache: `v2-1-release-20261011-b`. Die produktive Oberfläche zeigt keinen TEST-Zusatz.

Die zuvor erstellte Test-Datenbank und der Test-Worker bleiben getrennt.
`wordle-de-flegik-test.workers.dev` ist der bestehende Account-Subdomain;
der Produktiv-Worker und seine Daten sind trotz dieses Domainnamens eigenständig.
Browserdaten anderer Origins werden nicht übertragen.

## Reproduzierbare Bereitstellung

```sh
node tools/build_online_test.cjs --production
cd online
pnpm exec wrangler d1 migrations apply wordle-de-duel --remote --config wrangler.production.toml
pnpm exec wrangler deploy --config wrangler.production.toml
```

Erst den Worker bereitstellen, dann die geprüfte Änderung regulär auf `main`
übernehmen und pushen. Kein Force-Push. Die Pages-Pipeline veröffentlicht automatisch.
Die Root-Konfiguration verwendet die Produktions-API; das Worker-Paket nutzt seine
eigene API am selben Origin. Der Build ohne `--production` erzeugt weiterhin eine
isolierte Testoberfläche und wird mit `online/wrangler.toml` bereitgestellt.

## Validierung und Grenzen

Die vollständige automatisierte Suite mit der Release-Cachekennung hat bestanden.
Vor dem Pages-Update bestand ein echtes Produktions-Duell im bereitgestellten
Worker mit zwei frischen mobilen Edge-Browserkontexten: Beitritt, Abschluss,
authentische Boards, Vergleich, 401 ohne Token und unveränderte klassische Daten.
Die vorhandene GitHub-Pages-Konfiguration wurde authentifiziert geprüft.

GitHub Pages hat den Releasecommit `ebd57811531b35625ab076bfd23ff9a348267957`
erfolgreich gebaut. Ein komplettes Online-Duell über die bisherige Pages-Adresse
und die Produktions-API hat mit zwei frischen Browserkontexten bestanden.
Die öffentliche PWA installiert alle 40 Offline-Assets, hält API-URLs aus dem
Cache und lädt/spielt den klassischen Modus ohne Netzwerk.

Der ursprüngliche bytegenaue 2.0-Stand und die Release-Dateien wurden auf einem
isolierten lokalen Origin mit echten Service Workern geprüft: gespeicherter
Klassik-Entwurf, Update über den vorhandenen Einstellungsbutton, bytegleicher
Spielstand, Entfernung des alten Caches und Offline-Neuladen bestanden.
Der unmittelbar beim Pages-Deployment gestartete Upgradecheck wurde wegen eines
Fehlers im asynchronen Testablauf nicht als bestanden gewertet; der korrigierte
kontrollierte lokale Lifecycle-Test deckt diesen Ablauf ab.

Echte Android-/iPhone-Hardware und installierte mobile PWAs wurden
nicht zertifiziert. Alle Sicherheits- und Speichergrenzen des
[Online-Duell-Berichts](ONLINE_DUEL_V2_1.md) gelten weiter.

Rollback: Die Pages-Releaseänderung durch einen regulären Revert auf `main`
zurücknehmen; dabei für das zurückgestellte Offline-Paket eine neue Cachekennung
verwenden. Worker/D1 nicht löschen: Das bewahrt Zugänge bereits angelegter Duelle.
