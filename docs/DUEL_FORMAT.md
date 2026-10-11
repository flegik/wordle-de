# Wort-Duell · Vertragsversion 1

Nur `feature/arcade-v2`. Version 1.0 versteht diese Links nicht. Bis zur Freigabe
nur auf isoliertem Test-Origin testen; keine produktiven Links als nutzbar anbieten.

## Challenge-Fragment

`#duel=v1.<base64url>.<checksum>`

UTF-8-JSON ohne Whitespace, genau diese Schlüssel in dieser Reihenfolge:

```json
{"version":1,"type":"random","id":"00000000-0000-4000-8000-000000000001","length":5,"word":"LEGAT","wordVersion":"de-1","rules":"normal-1"}
```

Das Beispiel zeigt die dekodierte Entwickleransicht. Die UI/Einladung zeigt das
Wort nicht. Zulässige Typen: `random`, `wish`. UUID v4, lowercase, Web Crypto.
`normal-1`: keine Hard-Mode-Pflicht, 6 Versuche bei 4/5, 7 bei 6/7 Buchstaben.
Wort bereits NFC/uppercase mit eigenständigem ẞ; genau 4–7 deutsche Buchstaben.
Randomziel im Lösungspool, Wunschziel im allgemeinen Eingabepool. Ein Wunschwort
wird bei Erstellung normalisiert, fremde Payloads müssen bereits kanonisch sein.

Codec: Base64url ohne Padding; kanonischer Re-Encode wird geprüft. Checksumme:
FNV-1a, unsigned 32-bit, acht lowercase Hex-Zeichen, über UTF-16-Einheiten des
kanonischen JSON (Vertrag enthält ausschließlich BMP-Zeichen). UTF-8-Decode
verwirft fehlerhafte Bytefolgen. Maximal 1.530 Zeichen Fragment, 1.500 für
Payload/Checksumme, 1.400 Base64zeichen, 1.024 dekodierte JSON-Zeichen. Diese
konservativen Grenzen sind größer als jede erlaubte konkrete Challenge.

Keine optionalen Metadaten in v1. Unbekannte Felder, doppelte JSON-Schlüssel,
andere Reihenfolge/Whitespace, Arrays, null, falsche Typen/Versionen/Längen,
unbekannte Wortversionen, abgeschnittene/zu lange Links werden verworfen.
Fremde Hashdaten werden nie direkt als HTML benutzt. Fehleransicht ist ein
festgelegter Text, bestehende Speicherstände werden nicht zurückgesetzt.

Adresse wird aus `location.href` erstellt: Origin und vollständiger Einstiegspfad
(auch `/wordle-de/` oder `/wordle-de/index.html`) bleiben, Query und alter Hash
werden ersetzt. Kein fest codierter Produktionspfad. UI erlaubt Linkfreigabe
nur auf HTTP(S); lokale Datei ist kein öffentlich zugänglicher Challenge-Link.

## Was dieser Vertrag nicht garantiert

Base64 und Checksumme sind **keine Verschlüsselung, Signatur oder Anti-Cheat**.
Das genaue Wort ist im Client rekonstruierbar. Checksumme erkennt Beschädigung,
aber eine neue korrekte Checksumme kann zu geänderten Daten erzeugt werden.
Fragment ist normalerweise nicht Bestandteil der HTTP-Anfrage; der Link selbst
wird beim Teilen an den gewählten Messenger/Empfänger übergeben.
Keine Identitätsprüfung, globale Einmaligkeit oder serverseitige Rangliste.

## Lokale Zuordnung und Zustandswechsel

Session-ID = `duel:<challenge-id>`, Modus `duel`, ein `WordRound` mit ID `word`.
Zusatzfelder: `duelContract:1`, `challengeId`, `challengeType`, `duelRules`, `input`.
Ziel/Länge/Limit nur in Round, Wortversion in Session, Tipps nur in kanonischer
`attempts`-Historie. Farben/Statistik aus bestehenden Engine/Session-Projektionen.

Erstellte, noch ungespielte Challenges liegen optional in `duelChallenges`, nach
ID indiziert. Erstellung erzeugt weder Session noch Wertung. Bei Annahme eines
eigenen Zufalls-Duells wird der Pending-Eintrag entfernt und eine Session angelegt.
Damit gibt es keine zweite gespeicherte Zielwahrheit neben einer aktiven Session.
Eigenes Wunschwort bleibt eine erstellte Einladung; der lokale Ersteller kann
nicht als uninformierter Mitspieler starten. Auf fremdem Speicher ist es ein Rätsel.

Ein Link öffnet zuerst eine Einladung, einschließlich bei initialem Laden und
`hashchange`. Annehmen führt zu aktivem Spiel, Fortsetzen zu exakt derselben
Session, abgeschlossen zu Ergebnis. Wiederholte Annahme ist idempotent.
Gleiche ID mit abweichendem Inhalt wird zurückgewiesen. Mehrere IDs können
parallel bestehen. Ein archiviertes Event ohne vollständige Session blockiert
auch eine erneute Wertung. Es zeigt die Fehleransicht statt ein neues Spiel zu
starten; normales Backup enthält die vollständigen Sessions.

Pause/Home/Reload sind keine Verluste. Bestätigter Abbruch = `abandoned`, einmaliges
Event und keine neue gewertete Teilnahme derselben Challenge. Jeder gültige Tipp
und Draft werden synchron gespeichert, vor Animation/Ergebnisansicht. Ein
ankommender Link pausiert den Speedrun-Timer und beendet nur visuelle Warteschritte;
angenommene Ergebnisse anderer Modi bleiben gespeichert.

Schema 2, `wordle-de:v2`, bisherige Schema-1-Migration/Backups/Schutzmodus unverändert.
Neue Felder optional, aber vollständig geprüft, wenn vorhanden. Generische historische
Duell-Prototypen ohne Vertrag bleiben importierbar, zählen nicht als neue Duellstatistik.

## Ergebniscode und Vergleich

Nur für beendete Zufalls-Duelle: `WD-R1.<base64url-json>.<checksum>`.
Payloadschlüssel: `id`, `fingerprint`, `length`, `wordVersion`, `rules`, `status`,
`attempts`. Fingerprint = Checksumme der kanonischen Original-Challenge; kein
Lösungswort, keine Tipps oder Zeitwertung im Ergebniscode. Gleiche bounded Codec.

Vergleich prüft alle Felder, exakte Challenge-Zuordnung, Fingerprint, Regeln,
Version, Länge, erlaubten Abschlussstatus und dessen mögliche Versuchszahl.
Ergebnistexte dürfen genau einen Code enthalten. Gewonnen: mindestens ein Versuch;
verloren: exakt Limit; abgebrochen: weniger als Limit, ggf. null.
Weniger erfolgreiche Versuche gewinnt; gleiche erfolgreiche Anzahl = Unentschieden;
solved schlägt unsolved; beide unsolved = kein Gewinner. Wunschwort hat keinen
kompetitiven Vergleich mit seinem Ersteller.

Auch dieser Code ist **selbst gemeldet, nicht verifiziert**, manipulierbar und keine
Spieleridentität. Vergleich bleibt vorübergehend auf der Ergebnisansicht; kein
persistenter Vergleichssiegzähler. Eigene Duellstatistik zählt Rätsellösungen,
keine Siege gegen Freunde. Sharing enthält nur tatsächliche Emoji-Auswertungen
und den vollständigen Challenge-Identifier, niemals Ziel-/Ratewörter im Klartext.

## Zukünftige Wortversionen und Plattformen

Heute wird ausschließlich de-1 unterstützt, dessen Daten unverändert bleiben.
Später: `docs/WORD_VERSION_PLAN.md` umsetzen, historisches Paket nach
`challenge.wordVersion` auflösen, bei Session/Linkprüfung dasselbe Paket injizieren.
Format enthält das **konkrete Wort**, keinen veränderlichen Listenindex/Seed.
Nie heimlich de-2 wählen oder alte Challenges neu ziehen; unbekannte Version
zeigt den definierten Fehler. Alte Sessions/Events/Pakete bei Migration behalten.

Android/iPhone können Links im Browser statt in der installierten PWA öffnen.
Safari/PWA-Speicher und Betriebssystem-Linkübergabe sind nicht als identisch
garantiert. Derselbe Link ist in jedem eigenen Kontext dieselbe Wortaufgabe,
aber Einmaligkeit/Statistik gelten pro lokalem Speicher. Erstöffnung benötigt
eine erreichbare App oder bereits gecachten passenden Kontext; kein Versprechen
für erstmalige fremde HTTPS-Links ohne Internet. Angenommene Duelle können mit
dem vollständigen gecachten Paket offline fortgesetzt werden. Reale Plattform-
und PWA-Checks bleiben Voraussetzung für Release.
