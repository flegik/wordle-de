# Kurze Release-Abnahme · isoliert, ohne echte Spielerdaten

**Noch offen, nicht als bestanden gewertet.** Keine Freigabe für main.

Private Testadresse: https://wordle-de-rc-test.keen-elm-5553.chatgpt.site
In deinem eigenen Browser mit dem ChatGPT-Konto anmelden, dem diese Testseite gehört.
Danach „2.0 testen“ wählen. Dieser Origin ist vollständig von
https://flegik.github.io getrennt. Die Testseite benötigt für den ersten Zugriff
eine Online-Anmeldung. Sie bleibt privat; ein anderes Konto erhält nicht automatisch Zugriff.
Safari und eine Homescreen-App können getrennte Speicher verwenden: beide prüfen.

## Samsung · sechs kurze Schritte

1. **Klassik:** Länge wählen, eine Runde gewinnen oder verlieren. Ergebnis und
   Anzahl der tatsächlich gespielten Versuche prüfen. Falls die Runde abgebrochen
   wird, muss sie ausdrücklich als Abbruch/Niederlage erscheinen.
2. **PNG:** Das Ergebnisraster muss die echten Eingaben zeigen. „Als Bild teilen“:
   Standardbild ohne Buchstaben; „Enthält die Lösung / Spoiler“ zeigt sie.
   PNG speichern und, falls unterstützt, als Datei teilen. Teilen abbrechen und
   nochmals öffnen. Dateiname/Standard-Sharetext dürfen kein Lösungswort enthalten.
3. **Arcade:** Doppel oder Tower starten und einen Tipp abgeben. Zusätzlich
   Speedrun kurz starten: Zeit, Skip −10 Sekunden, Punkte und neues Wort prüfen.
   Der Skip kostet keine doppelten zehn Sekunden bei schnellem Antippen.
4. **Fortsetzen:** Mitten im Wort pausieren, App schließen, wieder öffnen und
   fortsetzen. Ziel, Hinweise und Draft müssen gleich sein. Speedrun muss nach
   einem Hintergrundwechsel auf bewusste Fortsetzung warten.
5. **Daten:** Statistikfilter und JSON-Backup prüfen. Auf diesem Test-Origin das
   eigene Testbackup importieren, Überschreiben bestätigen; Ergebnis nur einmal
   gezählt, laufende Runde unverändert. Kein echtes Live-Backup überschreiben.
6. **Offline:** Einstellungen → Offline-Paket installiert abwarten. Zum Homescreen
   hinzufügen, einmal schließen/online öffnen, dann Flugmodus und erneut starten.
   Eine neue Runde sowie eine fortgesetzte Runde müssen funktionieren. Danach
   Flugmodus beenden. Scheitert der Offline-Start wegen der privaten Hosting-
   Anmeldung, gilt er als nicht bestanden und muss auf einem unabhängigen
   statischen Testhost oder localhost wiederholt werden.

**iPhone:** dieselbe Adresse in Safari, dieselben Schritte; zusätzlich Teilen →
Zum Home-Bildschirm. In Safari und der installierten App PNG-Dateiteilen,
Bild sichern/Long-Press, Safe Area und Offline-Neustart prüfen. Kein erfolgreicher
iPhone-/Samsung-Test wurde hier behauptet.

## Datenübernahme mit echtem 1.0-Code auf der HTTPS-Testseite

**Vor dem ersten 2.0-Start** auf einem frischen Test-Browserprofil:

1. Auf der Test-Startseite „Unveränderte 1.0 für Testdaten“ öffnen. Die Dateien
   sind byteidentisch zur Produktion `22331471b9179d408879cec10f5aa1e1291cf26e`.
2. Testspiele anlegen; alternativ das repräsentative Schema-1-Testbackup aus
   `tests/fixtures/schema-1-representative.json` importieren. Eine laufende Runde
   verändern, Statistik/Streak/Daily notieren, Backup exportieren.
3. Den 1.0-Tab schließen. Auf derselben Testadresse 2.0 öffnen. Statistik,
   Streak/Daily und fortgesetzte Runde mit dem Backup vergleichen. Erneut schließen
   und öffnen; keine doppelte Wertung. Neues Backup exportieren.

Das prüft die echte Anwendung und Datenmigration auf demselben Origin.
Die Pfade `/legacy-v1/` und `/wordle-de/` besitzen jedoch unterschiedliche
Worker-Scopes: **kein Nachweis eines vollständigen installierten PWA-Updates.**
Ein schon angelegter v2-Speicher hat Vorrang; deshalb diesen Ablauf zuerst oder
in einem separaten Profil durchführen. Niemals echte Browserdaten löschen.

## Vollständiges 1.0 → 2.0-Update am selben Pfad (Desktop / localhost)

Benötigt Git, Python 3 und einen echten Browser. Einen neuen Port benutzen,
der bislang keine Wordle-Testdaten enthält. Dies verändert keine GitHub-Branches.

```sh
git clone https://github.com/flegik/wordle-de.git wordle-upgrade-test
cd wordle-upgrade-test
git checkout --detach 22331471b9179d408879cec10f5aa1e1291cf26e
python -m http.server 8031 --bind 127.0.0.1
```

1. `http://localhost:8031/index.html` öffnen. 1.0-Offline-Paket installieren,
   Testdaten wie oben anlegen und exportieren. Runde mit Eingabe pausieren.
2. In einem zweiten Terminal **im selben Ordner**, während der Server weiterläuft:
   `git checkout --detach origin/feature/arcade-v2`. Den genauen Commit vorher
   mit dem Releasebericht vergleichen. Nicht im produktiven Arbeitsordner ausführen.
3. Alten Tab neu laden. Er darf zunächst die gecachte 1.0 zeigen. Falls die
   Updateprüfung nicht startet, in den Browser-DevTools einmal ausführen:

   ```js
   navigator.serviceWorker.getRegistration().then(r => r.update())
   ```

4. In den Spieleinstellungen das angebotene Update bewusst laden. Nun müssen
   Arcade-Modi/2.0 sichtbar sein. Statistik, aktive Lösung/Draft, Daily, Streak
   und Backups mit dem 1.0-Backup vergleichen. Nicht Browserdaten/Worker löschen.
5. Netzwerk in DevTools offline stellen, Tab schließen und denselben Origin
   neu öffnen: 2.0 startet, historische Wörter und aktive Runde bleiben spielbar.
6. Zusätzlich zwei Tabs prüfen: fremde Änderungen müssen den lokalen Stand
   schützen und Original-Backups anbieten. Bei widersprüchlichen Ständen nicht
   blind importieren. Beide Backups sichern; Wiederherstellung bewusst bestätigen.

`http://192.168.…` auf einem Telefon genügt **nicht** für den PWA-Test. Dieser
localhost-Ablauf ist ein echter Browser-/Worker-Test, ersetzt aber keinen
Homescreen-Update-Test auf Android/iPhone. Für Letzteren braucht man einen
eigenen HTTPS-Testhost, der zuerst 1.0 und anschließend 2.0 **am selben Pfad**
ausliefert. Die Produktionsadresse nicht als Testhost benutzen.

## Zusätzliche Abnahme, wenn ein Browser verfügbar ist

- Breiten 320×568, 360×640, 390, 430, Desktop und Querformat; Tastatur,
  lange Tower-Verläufe, Dialoge, Dark/Light, reduzierte Bewegung.
- Alle neun Modi; Klassik 4–7; Daily historisch unverändert; Streak-Rekord;
  Doppel unabhängige Raster; Tower Sieg mit Versuch 20; Speedrun Hintergrund
  und Zeitablauf während Animation; Thema/Hard; Duell-Link und Fortsetzung.
- Jede Session wird genau einmal und nur in ihrer Modusstatistik gezählt.
- Update während laufendem Speedrun nicht aktivieren; erst pausieren/speichern.
- Fehlgeschlagenes Update, Speicherquote und Offline-Neustart auf echtem Gerät.

Bitte Ergebnis als „Samsung bestanden / Fehler …“, gegebenenfalls „iPhone …“
und „1.0→2.0-Upgrade …“ zurückmelden. Erst nach dieser Abnahme und ausdrücklichem
„Release freigegeben“ darf main verändert werden.
