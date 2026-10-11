# Deutsche Wortdaten · Version de-1

| Buchstaben | Lösungswörter | Zulässige Eingaben |
|---|---:|---:|
| 4 | 689 | 1.386 |
| 5 | 1.159 | 5.122 |
| 6 | 1.781 | 3.961 |
| 7 | 1.945 | 4.670 |
| **Gesamt** | **5.574** | **15.139** |

`LEGAT` steht als gewöhnlicher auswählbarer Eintrag in beiden 5-Buchstaben-Pools. Es ist nicht auf eine Sonderfunktion beschränkt.

## Herkunft

1. **Lösungspool:** Björn Albers, German Diceware Wordlist. https://github.com/bjoernalbers/diceware-wordlist-german · Commit `9e48d27be3b9b5c7c2c967f2bb7e6d0b73cdc12c`. MIT-Lizenz, Copyright 2023 Björn Albers. Die Quelle beschreibt eine Auswahl von Substantiven, Verben und Adjektiven in Grundform; sie enthält keine Umlaute. Übernommen werden reale Einträge mit 4–7 Buchstaben, ergänzt um eine kleine ausdrücklich aufgeführte Sonderzeichen-/LEGAT-Auswahl. Einzelne technische Einträge und die Marke MAGGI wurden ausgeschlossen. Liste der Ergänzungen und Ausschlüsse: `tools/build_words.py`.
2. **Zusätzliche erlaubte Eingaben:** `caco3/wordle-de`, Dateien `other-words.json` und `target-words.json`. https://github.com/caco3/wordle-de · Commit `f653154bf20851552b317a09a7ff452b384d521c`. Repository-Lizenz MIT, Copyright 2022 Finn Coffey und George Ruinelli. Die JSON-Originale und Lizenz liegen bei. Diese Quelle erweitert überwiegend die 5-Buchstaben-Eingaben und enthält auch seltene Wörter und Namen. Sie wird hier nicht als neuer Lösungspool übernommen.
3. **Zusätzliche erlaubte Eingaben aller Längen:** `igerman98`, über `wooorm/dictionaries`, `dictionaries/de`, Version 20161207, Paket 3.0.0. https://github.com/wooorm/dictionaries/tree/main/dictionaries/de · Commit `8cfea406b505e4d7df52d5a19bce525df98c54ab`. Copyright 1999–2016 Björn Jacke. Lizenz **GPL-2.0 oder GPL-3.0**. Nur passende direkt vorhandene Wörterbuch-Grundformen werden normalisiert übernommen. Die Flags für verbotene, nur in Zusammensetzungen zulässige und zwingend zu flektierende Stämme werden ausgeschlossen. Keine heuristische Erzeugung von Wortformen. Original-DIC, AFF, Urheberhinweis und beide vollständigen GPL-Texte liegen bei; das Erzeugungsskript ist offen enthalten. Diese Wörterbuchdaten und ihre abgeleiteten Eingabelisten behalten ihre GPL-Lizenz.

Alle Listen werden mit NFC normalisiert, `ß`/`ẞ` als ein Buchstabe vereinheitlicht, auf A–Z/Ä/Ö/Ü/ẞ beschränkt, dedupliziert und nach Länge indexiert. Der getrennte Lösungsbestand selbst basiert auf MIT-Daten und den kleinen Ergänzungen. Das Browserprogramm ist separat unter MIT lizenziert; die beigelegten GPL-Wörterbuchdaten dürfen nicht als MIT-only weiterverteilt werden.

## Qualität und Grenzen

Keine künstlich erzeugten Wörter zum Erhöhen der Zahlen. Die Grundwortquelle ist extern kuratiert, zusätzlich wurde eine Stichprobe geprüft. **Keine vollständige manuelle Einzelprüfung aller 5.574 Lösungen.** Anglizismen wie WRAP, seltenere Fachbegriffe und vereinzelte Grenzfälle sind möglich. Erlaubte Eingaben sind bewusst breiter und enthalten auch Eigennamen; nicht jede Beugung jedes deutschen Wortes ist enthalten. Ein korrektes Wort kann daher abgelehnt werden. Quellen und Lizenzangaben wurden aus den tatsächlich heruntergeladenen Repository-Dateien übernommen; eine darüber hinausgehende historische Herkunftsprüfung der einzelnen Worte ist nicht erfolgt.

Die originalen Quelldateien brauchen nicht im Offline-Cache zu liegen: Zur Laufzeit reicht das generierte `words.js`. Sie bleiben im Projekt zur Lizenzdokumentation und reproduzierbaren Verarbeitung erhalten.

## Phase 7: de-2 ohne Austausch historischer Daten

Neue freie Spiele verwenden auf dem Entwicklungsbranch `data/words-de-2.js`:
5.568 Lösungen / 15.138 Eingaben. Ausschließlich sechs ausdrücklich freigegebene
Lösungen und PESEL als Eingabe entfallen. LEGAT bleibt Lösung/Eingabe.
`data/words-de-1.js` ist bytegleich mit dem eingefrorenen `data/words.js`.
Daily, historische Spiele und historische Challenges verwenden weiter de-1.
Beide Pakete unterliegen denselben oben dokumentierten Quellen-/Lizenzbedingungen.
Die vorhandenen Quellen und Lizenzdateien sind weiter offline im Repository.

Qualitätsdaten: `data/word-quality.js`, Policy und manuelle Prüfliste unter
`data/quality/`. A/B/C sind vorläufige redaktionelle Spielbalance-Schätzungen;
3.195 B-Wörter benötigen noch manuelle Bekanntheits-/Rätselprüfung.
Details und reale Zahlen: WORD_REVIEW.md und docs/WORD_QUALITY.md.
Reproduktion: `python tools/build_quality.py`; alte Quellen/Generator bleiben
unverändert. Die ursprünglichen Audit-Belege werden vollständig erhalten.
