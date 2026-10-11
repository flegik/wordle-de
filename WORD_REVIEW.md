# Wortqualität – Phase 8 / de-2.1

Der gesamte Phase-7-Bestand von 5.568 Lösungen ist im reproduzierbaren KI-Ledger erfasst. Alle 3.195 ursprünglich offenen Wörter sowie die A-Liste wurden als vollständige Wortlisten gelesen. Keine externe oder menschliche Einzelfreigabe, keine empirische Bekanntheitsmessung.

| Länge | Lösungen | Eingaben | A | B | C |
|---|---:|---:|---:|---:|---:|
| 4 | 657 | 1386 | 576 | 52 | 29 |
| 5 | 1117 | 5121 | 975 | 82 | 60 |
| 6 | 1738 | 3961 | 1479 | 196 | 63 |
| 7 | 1888 | 4670 | 1638 | 155 | 95 |
| Gesamt | 5.400 | 15.138 | 4.668 | 485 | 247 |

168 Lösungen wurden aus neuen freien Spielen ausgeschlossen. Sie bleiben gültige Eingaben, sofern sie nicht schon durch die frühere ausdrückliche PESEL-Entscheidung ausgeschlossen waren. Häufigkeit alleine entscheidet weder Ausschluss noch C. LEGAT bleibt C; MONARCH/ZWINGE bleiben B. HUNNI, MUMPS, COUP, CLOU, MBIT bleiben keine Lösungen; PESEL ist auch keine neue Eingabe. HUHNS/MICH bleiben Eingaben.

## Entscheidungen und Grenzen

`data/quality/phase8/editorial-groups.json` ist die Eingabepolicy. `tools/build_quality_v2.py` produziert Wörterbuch, Klassenindex und den vollständigen Ledger. Jeder Datensatz besitzt eine Aktion und einen `reasonId`, aufgelöst in dessen `reasons`-Liste. `explicit-ai-editorial`, `owner-protected` und `retained-source-and-ai-group-review` unterscheiden die Methoden. Auch konservativ beibehaltene Wörter sind somit sichtbar; sie sind nicht mit extern recherchierten Einzelfreigaben gleichzusetzen. Die historische regelbasierte Quellenprüfung bleibt in `data/review/word-audit-de-1.json`.

Beispiele: DUDEN/TARZAN als problematische Eigennamen; LIIEREN/PESEN wegen geringer voraussichtlicher Wiedererkennbarkeit; ASTA wegen Abkürzungscharakter; APSIS/FUDER/RIEFE als voraussichtlich zu spezialisierte Rätsel. Damit wird keine fehlerhafte Schreibweise oder erfundene Wortbedeutung behauptet. C enthält etwa LEGAT, HAIKU, MARIMBA, PROTON und ROCHADE; es ist keine Restklasse ausschließlich ungeklärter Wörter. Einige Einordnungen werden Spieler anders beurteilen. Lokale Wortmeldungen und spätere redaktionelle Korrekturen bleiben sinnvoll.

2.720 explizite Entscheidungen, 2.848 konservativ beibehaltene Einträge. `reviewStatus: ai-editorial` ist der maßgebliche Prüfstatus. `provisional:false` bedeutet Abschluss dieser KI-Prüfphase, keine Bekanntheitsgarantie.

## Kompatibilität

de-1 und de-2 bleiben unverändert verfügbar. Aktive historische Lösungen, Duelle, Tagesrätsel, Statistiken und Backups behalten ihre Versionskennung. Neu klassifizierte Auswahlbeutel werden gezielt migriert, ohne bereits verbrauchte Wörter wieder einzufüllen. Keine Schema-3-Migration. Themenversion themes-1 bleibt unverändert.

Historische Berichte: [de-1](docs/WORD_REVIEW_DE_1.md), [Phase-7/de-2](docs/WORD_REVIEW_DE_2.md).
