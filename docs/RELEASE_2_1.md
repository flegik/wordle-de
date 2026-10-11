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
  `50fc295e-5e3f-48b3-a238-ce846a1fcf4c`.
- CORS: `https://flegik.github.io` und der eigene Produktions-Worker-Origin.
- API bleibt HTTPS, Bearer-Zugang und `no-store`. Free-Tarif und die begrenzten
  App-Limits bleiben bestehen; es wurde kein kostenpflichtiger Tarif aktiviert.
- Cache: `v2-1-release-20261011`. Die produktive Oberfläche zeigt keinen TEST-Zusatz.

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

Die Abnahme des tatsächlichen Pages-Updates und PWA-Upgrades wird nach dem Push
protokolliert. Echte Android-/iPhone-Hardware und installierte mobile PWAs wurden
nicht zertifiziert. Alle Sicherheits- und Speichergrenzen des
[Online-Duell-Berichts](ONLINE_DUEL_V2_1.md) gelten weiter.

Rollback: Die Pages-Releaseänderung durch einen regulären Revert auf `main`
zurücknehmen; dabei für das zurückgestellte Offline-Paket eine neue Cachekennung
verwenden. Worker/D1 nicht löschen: Das bewahrt Zugänge bereits angelegter Duelle.
