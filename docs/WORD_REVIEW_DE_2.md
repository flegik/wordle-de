# Wortprüfung · Phase 7 / de-2

Der vollständige unveränderte de-1-Audit über 5.574 Lösungen liegt in
[docs/WORD_REVIEW_DE_1.md](docs/WORD_REVIEW_DE_1.md). Seine Quellenbelege,
Eingabedaten und drei maschinenlesbaren Audit-Dateien bleiben unverändert.
Die Phase-7-Entscheidungen stehen getrennt in `data/quality/policy-de-2.json`.
Alte unfreigegebene Kandidaten werden nicht automatisch zu Ausschlüssen.

| Länge | de-1 Lösungen | de-2 Lösungen | de-2 Eingaben | A | B | C |
|---|---:|---:|---:|---:|---:|---:|
| 4 | 689 | 686 | 1.386 | 416 | 270 | 0 |
| 5 | 1.159 | 1.156 | 5.121 | 607 | 548 | 1 |
| 6 | 1.781 | 1.781 | 3.961 | 741 | 1.040 | 0 |
| 7 | 1.945 | 1.945 | 4.670 | 606 | 1.339 | 0 |
| Gesamt | 5.574 | 5.568 | 15.138 | 2.370 | 3.197 | 1 |

## Freigegebene Entscheidungen

HUNNI, MUMPS, COUP, CLOU, MBIT und PESEL entfallen als **neue freie Lösungen**.
Nur PESEL entfällt zusätzlich als neue de-2-Eingabe. Das sind ausdrückliche
Projektentscheidungen, kein Nachweis, dass die übrigen Wörter falsch seien.
LEGAT bleibt reguläre Lösung/Eingabe, Klasse C. ZWINGE/MONARCH bleiben B.
HUHNS/MICH bleiben nur Eingaben. Tagesrätsel und historische Runden behalten de-1.

## Unsicherheit und nächste redaktionelle Arbeit

2.370 A-Wörter haben entweder eine ausdrückliche A-Entscheidung oder ein
kombiniertes Signal: Untertitel-Rang höchstens 20.000, eigenständiger DIC-Eintrag,
kein Eintrag in den alten redaktionellen Prüfgruppen. Ein Untertitelkorpus ist
keine repräsentative Bekanntheitsmessung. Selbst dieses Signal kann Namen,
Mehrdeutigkeiten und ungeeignete Formen nicht vollständig ausschließen.

3.195 Wörter sind **vorläufig B, manuell prüfen**, nicht als fair zertifiziert.
Zwei weitere B-Wörter sind ausdrücklich vorgegeben. Nur LEGAT ist ausdrücklich
C; geringe Frequenz allein macht ein Wort weder C noch ungeeignet.
`data/quality/manual-review-de-2.txt` enthält alle offenen Wörter, reproduzierbar
und alphabetisch. `data/word-quality.js` deckt jede Lösung mit Klasse und
Prüfstatus ab; der alte Audit liefert dazu die Einzelbelege und Gründe.

Priorität: alte eindeutig problematisch markierte, aber noch nicht ausdrücklich
freigegebene Ausschlüsse zuerst ansehen; danach Prüfgruppen für gebeugte Formen,
Eigennamen/Abkürzungen und fehlenden eigenständigen Wörterbucheintrag. Beispielsweise
PESEN und LIIEREN müssen hinsichtlich tatsächlicher Bekanntheit geprüft werden;
es wird hier keine Bedeutung oder falsche Schreibweise behauptet.
Die vollständige priorisierte Kandidatenliste bleibt in
`data/review/exclusion-candidates-de-2.json`; deren `approved:false` bleibt gültig.

Vor Veröffentlichung sollte diese Prüfliste redaktionell abgearbeitet werden.
Der aktuelle Stand erfüllt die expliziten Entscheidungen, garantiert aber noch
nicht, dass jeder Spieler jedes verbleibende Wort beim Lesen erkennt. Tausende
ungeprüfte Wörter zu löschen würde die vorhandene Evidenz überinterpretieren.

## Spielstände

Kein rückwirkender Austausch von Zielen/Statistiken. Ausgeschlossene de-1-Ziele
bleiben mit ursprünglichem Wörterbuch spielbar; der nächste neue freie Run nutzt
de-2. Ein altes HUNNI/PESEL-Duell bleibt gültig. Gemeinsame Tagesrätsel bleiben
auch für alte PWAs unverändert. Einzelheiten: `docs/WORD_VERSION_PLAN.md`.
