# de-2 Qualität und Reproduktion

`python tools/build_quality.py` erzeugt offline `words-de-1.js`,
`words-de-2.js`, `word-quality.js`, `quality/manual-review-de-2.txt`.
Der Generator prüft den eingefrorenen Git-Blob-Hash von `data/words.js`:
`fac0d8bff14b260d7deee041bd6d17838ac89cd1`. Das Archiv ist bytegleich.

Grundlage sind die vorhandenen lizenzierten Wörterbücher, der vollständige
Phase-1-Audit und dessen lokale FrequencyWords-Belege. Keine Downloads, keine
neuen erfundenen Lexikoneinträge. Lizenzhinweise aus WORDLISTS.md gelten für
beide Datenpakete weiter. Frequenzinformationen beeinflussen die Klassifikation,
nicht pauschal die Zulässigkeit. FrequencyWords-Evidenz bleibt CC-BY-SA-4.0.

`policy-de-2.json` ist die einzige Freigabequelle für sechs Lösungs-Ausschlüsse
und einen Eingabe-Ausschluss. Genau diese Differenzen werden getestet.
Der alte Audit-Generator bleibt eingefroren, weil sein eigener Hash zur Evidenz
gehört. Seine historische Berichtsausgabe wird im Test gegen
`docs/WORD_REVIEW_DE_1.md` geprüft. Nicht direkt über den neuen WORD_REVIEW.md
schreiben; für Phase 7 den neuen Qualitätsgenerator verwenden.

A/B/C sind Spielbalance-Schätzungen. A kombiniert tatsächliche Korpus-/DIC-Signale
oder explizite Entscheidungen. B enthält 3.195 offene manuelle Prüfungen plus
ZWINGE und MONARCH. C enthält nur LEGAT. Das ist bewusst konservativ und **keine
vollständige manuelle Freigabe**. Neue Ausschlüsse, sichere A/B/C-Entscheidungen
und weitere seltene, bekannte C-Wörter benötigen konkrete redaktionelle Prüfung.
Die Liste ist für eine weitere kontrollierte Bearbeitung vorbereitet.
