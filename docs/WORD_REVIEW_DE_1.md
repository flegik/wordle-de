# Wortqualitätsprüfung · WORDLE DE 2.0 / Phase 1

Vollständiger reproduzierbarer **Regelaudit aller 5.574 Lösungen**, keine vollständige manuelle Einzelprüfung. `de-1`, die 15.139 Eingaben und der Generator bleiben unverändert. Alle Ausschlüsse sind Vorschläge.

## Umfang und Klassifikation

| Länge | Lösungen | Eingaben | Eindeutig ungeeignet | Manuell prüfen | Vorläufig beibehalten |
|---|---:|---:|---:|---:|---:|
| 4 | 689 | 1386 | 1 | 222 | 466 |
| 5 | 1159 | 5122 | 2 | 452 | 705 |
| 6 | 1781 | 3961 | 0 | 857 | 924 |
| 7 | 1945 | 4670 | 0 | 1190 | 755 |
| **Gesamt** | **5574** | **15139** | **3** | **2721** | **2850** |

**2724 auffällige Kandidaten**. Die große Prüfmenge ist bewusst vorsichtig: Fehlende Wörterbuchstämme oder geringe Korpusfrequenz beweisen kein falsches deutsches Wort.

## Reproduzieren und überprüfbare Daten

```sh
python tools/audit_words.py
python tests/audit.test.py
```

- `data/review/word-audit-de-1.json`: ein Datensatz je Lösung; Quellenzeilen, DIC-Flags, einzelne AFF-Nachweise, Regel und Priorität.
- `data/review/exclusion-candidates-de-2.json`: alle auffälligen Wörter, `approved: false`, nur Lösungspool, LEGAT geschützt.
- `data/review/editorial-rules.json`: kleine überprüfbare redaktionelle Regeln und belegte externe Stichproben.
- SHA-256-Prüfsummen aller Eingabedateien im Audit. Keine Uhrzeit, kein Zufall, kein Netzbedarf beim Reproduzieren.

## Regeln und Aussagegrenzen

1. Explizite redaktionelle Ablehnung hat Vorrang: HUNNI gemäß Auftrag, MBIT als Abkürzung.
2. LEGAT und begründete positive Beispiele bleiben geschützt. Adjektive, Infinitive und Fachwörter werden nicht pauschal aussortiert.
3. Die redaktionellen Gruppen markieren Namen/Marken, Kurzformen, Funktionswörter, auffällige Beugungen und regionale Varianten zur Prüfung.
4. Alle übrigen Wörter werden gegen die lokal vorhandene igerman98-DIC geprüft. Flags d/o/h kennzeichnen verbotene, nur zusammengesetzte bzw. affixpflichtige Stämme.
5. Gebrauchshäufigkeit wird zusätzlich für jedes Lösungswort im offenen deutschen OpenSubtitles-2018-Korpus geprüft. Rang über 30.000 oder kein Top-50.000-Treffer erzeugt Priorität 2; Rang bis 10.000 ist ein stärkeres Gebrauchssignal. Diese Schwellen sind Designentscheidungen, keine allgemeine Bekanntheitsmessung. Namen/Filmwortschatz, Flexionsformen und das Alter des Korpus beeinflussen das Ergebnis.
6. Bei fehlendem eigenständigem Eintrag werden direkt vorhandene einzelne AFF-Regeln als Nachweis möglicher Ableitung vermerkt. Der Matcher bildet keine vollständige Hunspell-Morphologie ab: keine Komposita, Kreuzprodukte, Fortsetzungsflags oder grammatische POS-Analyse.
7. Ein eigener DIC-Eintrag genügt allein nicht mehr: ohne ausreichendes Korpus-Signal ist manuelle Prüfung nötig. *Vorläufig beibehalten* ist weiterhin keine manuelle Freigabe. Keine vollständige Wortartenannotation oder repräsentative Befragung liegt vor; Endungen allein beweisen keinen Genitiv oder keine Konjugation. LEGAT bleibt ausdrücklich geschützt.

## Verifizierte Beispiele und Abgleich mit dem Auftrag

| Wort | Befund | Empfehlung |
|---|---|---|
| HUNNI | Lösung und Eingabe; Duden führt den Gebrauch als salopp. | Später aus Lösungen nehmen, weiterhin Eingabe. Kein erfundenes Wort. |
| HUHNS | Bereits nur Eingabe, keine Lösung. | Eingabeliste nicht wegen Genitivform beschneiden. |
| MICH | Bereits nur Eingabe, keine Lösung. | Keine Änderung notwendig. |
| LEGAT | Reguläre Lösung und Eingabe, DIC-Eintrag. | Unbedingt behalten. |
| SALBE | Lösung, eigenständiger DIC-Eintrag. | Behalten; die Grafik liefert keinen Ausschlussgrund. |
| KREBS | Nur Eingabe, keine Lösung. | Keine Lösungsbereinigung erforderlich. |
| DRUSE | Weder Lösung noch Eingabe im aktuellen Bestand. | Grafikbeispiel nicht als Datenbestand übernehmen. |
| PESEL | Echtes Wort, aber vom Nutzer ausdrücklich als zu unbekannt abgelehnt. | Für de-2 Ausschluss aus Lösungen **und Eingaben** vormerken. |
| PESEN | Duden-Eintrag vorhanden. | Gebrauch und Rätselwert prüfen, nicht als falsches Wort markieren. |
| LIIEREN | Duden bestätigt Schreibweise und Verbgrundform. | Beibehalten; das doppelte I ist korrekt. |

Externe Einzelprüfungen am 11.10.2026, keine Wörterbuchdaten daraus eingebaut:

- https://www.duden.de/rechtschreibung/Hunni
- https://www.duden.de/rechtschreibung/Pesel
- https://www.duden.de/rechtschreibung/pesen
- https://www.duden.de/rechtschreibung/liieren

## Gebrauch und Spielwert

Auf Wunsch des Nutzers reicht lexikalische Korrektheit nicht aus. Die Wortauswahl soll im Alltag erkennbar und sinnvoll erratbar sein. Maßstab: selten benutzt darf sein, beim Auflösen sollte man das Wort wiedererkennen, statt seine Bedeutung googeln zu müssen. Der vollständige Audit enthält daher für jedes Wort `usage`: tatsächliche Quellform(en), Trefferzahl, besten Rang und Frequenzband. Das Untertitelkorpus ist ein zusätzliches Indiz, keine alleinige Freigabe. Niedrige Frequenz bei Fachbegriffen (z. B. LEGAT), seltene Singularformen häufiger Plurale und unterrepräsentierte Sachthemen brauchen redaktionelle Ausnahmen.

Quelle: https://github.com/hermitdave/FrequencyWords, Commit `525f9b560de45753a5ea01069454e72e9aa541c6`, `content/2018/de/de_50k.txt`, CC BY-SA 4.0 für Inhalte. Lokale unveränderte Quelle unter `data/review/sources/`; Attribution und Lizenzhinweis: `licenses/frequencywords-notice.txt`. Keine neue Laufzeitabhängigkeit.

Die gesonderte `accepted-exclusion-candidates-de-2.json` enthält bislang nur den ausdrücklich abgelehnten PESEL-Eintrag. Der breitere Eingabepool bleibt grundsätzlich erhalten; weitere extrem obskure Eingaben brauchen eine eigene begründete Prüfung. Alle Vorschläge sind noch unfreigegeben und verändern de-1 nicht.

## Priorisierte redaktionelle Prüfliste

Priorität 1: konkrete Qualitätsregeln; Priorität 2: Plural-/Variantenpolitik; Priorität 3: nur maschineller Wörterbuchhinweis. Alle redaktionellen P1/P2-Kandidaten stehen hier; die vollständigen zusätzlichen Frequenz- und P3-Listen stehen maschinenlesbar daneben.

| Wort | Priorität | Klasse | Grund |
|---|---:|---|---|
| ALLE | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| ALPEN | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| ALSTER | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| ASPIRIN | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| ASTA | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| AUẞER | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| AZUBI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| BRUMMI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| CARITAS | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| CRINGE | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| DADDY | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| DERBE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| DUDEN | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| EMMY | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| ETWAS | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| FIDSCHI | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| FLUPPE | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| GRAMMY | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| GRÖẞER | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| GRÖẞTE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| GRÜẞ | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| GRÜẞE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| HAPPY | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| HEIẞT | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| HINTER | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| HIWI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| HULK | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| HUNNI | 1 | Eindeutig ungeeignet | Vom Auftrag ausdrücklich als künftig ungeeignete Lösung benannt; salopper Ausdruck, kein Rechtschreibfehler. |
| JEEP | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| JOKE | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| KNOBI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| KRIPO | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MAMI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MAUSI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MBIT | 1 | Eindeutig ungeeignet | Einheitenabkürzung (DIC-Eintrag MBit), entgegen der Lösungsregel möglichst keine Abkürzungen. |
| MONETEN | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MUCKE | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MUTTI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| MÖCHTE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| NEIN | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| NICE | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| OLYMP | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| OLYMPIA | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| PAPI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| PERSO | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| PESEL | 1 | Eindeutig ungeeignet | Vom Nutzer ausdrücklich wegen mangelnder Alltagstauglichkeit abgelehnt; als Wort belegt, künftig weder Lösung noch Eingabe. |
| PFALZ | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| PROFI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| PROMI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| RIESTER | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| RITALIN | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| SCHIRI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| SCHOKO | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| SEGWAY | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| SÜẞE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| SÜẞEN | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| TABASCO | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| TARZAN | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| UNTER | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| VALIUM | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| VIEL | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| WEIẞE | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| WEIẞEN | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| WENIG | 1 | Manuell prüfen | Funktionswort-/Pronomen-/Partikel-Kandidat; mögliche andere Lesarten vor Ausschluss prüfen. |
| WIFI | 1 | Manuell prüfen | Eigenname-, Marken-, Ortsnamen- oder Akronym-Kandidat; mögliche eingebürgerte Allgemeinwort-Lesart einzeln prüfen. |
| ZIVI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| ZWANNI | 1 | Manuell prüfen | Redaktioneller Kandidat für Umgangssprache, Kurzform oder englischen Ausdruck; Akzeptabilität und Spielwert einzeln prüfen. |
| ÖFTER | 1 | Manuell prüfen | Beugungs-, Vergleichs- oder Imperativ-Kandidat; substantivische oder infinitivische Lesarten prüfen, keine automatische Entfernung. |
| BÄREN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| BÜROS | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| COYOTE | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| CROC | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| FÜẞE | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| GRÖẞEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| GÄRTEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| HAIA | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| HÄNDE | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| HÜTTEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| KÜCHEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| LEGGINS | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| LÖWEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| PESEN | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| SCENE | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| SKOOTER | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| STRAẞEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| TATTRIG | 2 | Manuell prüfen | Regionale Form, Fremdwort oder Schreibvarianten-Kandidat; kein Fehlerurteil. PESEL und PESEN sind im Duden belegt. |
| TÜREN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| ÄHREN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| ÄRZTE | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |
| ÖFEN | 2 | Manuell prüfen | Gebräuchlicher Substantivplural bzw. mehrdeutige Form; für de-2 eine konsistente Singular-/Plural-Politik festlegen. |

## Automatische Signale im Gesamtbestand

| Regel | Anzahl |
|---|---:|
| affix-only-evidence | 134 |
| dictionary-stem | 2845 |
| editorial-keep | 5 |
| editorial-reject | 3 |
| function-word | 8 |
| inflected-form | 12 |
| name-brand | 21 |
| no-standalone-dic-entry | 220 |
| noun-plural | 14 |
| regional-or-spelling | 8 |
| slang-shortening | 24 |
| usage-review | 2280 |

Beispiele P3 (bewusst auch legitime Wörter): ABREISE, ACHTUNG, AHNUNG, AIRPORT, AKTE, ANKLAGE, ANTIKE, ARMBAND, ATEMZUG, ATMUNG, AUGE, AVATAR, BACKE, BACON, BAGEL, BAHNHOF, BALLAST, BARGELD, BAUTEIL, BEAMEN, BEAT, BIKE, BILDUNG, BIMBAM, BINDUNG, BISTRO, BLAZER, BLEIBE, BLEICHE, BOARD, BODY, BRANDY, BRAVO, BREAK, BRIDGE, BROWNIE, BUBE, BUCHE, BUDDY, BURGER.

## Empfehlung zur späteren Freigabe

Zuerst HUNNI und Abkürzungen entscheiden, dann konkrete P1-Namen/Marken und Funktionsformen prüfen. Gebräuchliche plurale Substantive konsistent behandeln; Singular-only ist eine Designentscheidung, keine Rechtschreibregel. P3 niemals gesammelt löschen: darunter sind geläufige Substantive, Komposita und moderne Lehnwörter. Gebrauchsdaten als Sortierhilfe für die Einzelprüfung verwenden, nicht als automatische Liste falscher Wörter. Für de-2 eine eigene freigegebene Policy mit Wort, Entscheidung, Begründung und Reviewer anlegen; diese Kandidatenliste wird jetzt vom Generator ausdrücklich nicht verwendet.

## Auswirkungen auf gespeicherte Spiele

Phase 1 ändert keine Ziele, Beutel oder Tagesrätsel. Bei de-2 dürfen aktive de-1-Runden mit HUNNI oder anderen ausgeschlossenen Zielen zu Ende gespielt werden. Frühere Statistikeinträge werden nicht nachträglich gelöscht. Nur zukünftige freie Ziehungen verwenden freigegebene de-2-Lösungen. Beutel werden dann gefiltert und verlustarm ergänzt. Das bisherige de-1-Paket muss unverändert als Kompatibilitätswörterbuch erhalten bleiben. Tagesrätsel werden erst nach einem festgelegten zukünftigen UTC-Stichtag umgestellt; ältere Rätsel bleiben de-1. Details und das Problem paralleler alter PWAs: `docs/WORD_VERSION_PLAN.md`.

## Lizenzen

Quellen und bestehende Lizenzdateien bleiben wie in `WORDLISTS.md`. Die Audit-Evidenz enthält Auszüge/Flags aus igerman98 und trägt für diese abgeleiteten Wörterbuchdaten GPL-2.0 OR GPL-3.0. Audit-Programm und eigene redaktionelle Regeln folgen der MIT-Programmlizenz. Frequenzquelle und daraus abgeleitete Rang-/Zählevidenz: CC BY-SA 4.0; zusätzliche Attribution im Lizenzhinweis. Duden dient ausschließlich verlinkter Einzelprüfung; kein Wörterbuch-Scraping, keine zusätzliche Laufzeitdatenquelle.
