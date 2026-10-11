# Geplante Umstellung de-1 → de-2 · noch nicht aktiviert

Schema-Version und Wortversion sind zwei getrennte Dinge. Phase 1 verwendet
Schema 2 mit exakt de-1. Keine neue Wortliste und kein anderer Tageshash.

## Vorbedingungen und unveränderliches de-1

1. Redaktionelle Kandidaten prüfen. Eine **separate freigegebene** Policy anlegen
   (Wort, Entscheidung, Grund, Reviewer); Generator darf niemals pauschal alle
   `review`-Kandidaten entfernen. LEGAT zwingend in Lösungen und Eingaben testen.
2. Aktuelles `data/words.js` bytegleich als `data/words-de-1.js` archivieren,
   zusätzlich de-2 erzeugen. Originalquellen/Lizenzen erhalten. Ein Registry-Layer
   löst Wortversionen auf; Module erhalten explizit das richtige Paket.
3. Jede laufende Runde/Session erhält ihren Wortversionskontext. Bestehende
   `games` stammen deterministisch aus de-1; diese Information beim künftigen
   Upgrade ergänzen. Bereits abgeschlossene Ereignisse unverändert erhalten.
4. `storage.js` darf dann bekannte alte Pakete validieren; de-2 niemals allein
   gegen den alten Zielpool prüfen. Ein weiterer Migrationsschritt braucht eigene
   Fixtures und atomisches Schreiben. Bestehende de-1-Backups weiter importieren.

## Freie Wortbeutel

Vorhandene de-1-Beutel spiegeln noch nicht gezogene Wörter. Die Reihenfolge aller
weiter zulässigen Einträge behalten, ausgeschlossene Ziele herausfiltern. Neue
de-2-Wörter hinzufügen; Reihenfolge im einmaligen Migrationsschritt durch einen
stabilen, aus gespeicherten Daten ableitbaren Seed festlegen und speichern.
Gleiche Daten erzeugen gleiche Beutel, erneute Migration verändert nichts.

Bereits gezogene und weiterhin erlaubte de-1-Wörter nicht vorzeitig wieder in den
Restbeutel legen. Ein nur aus neuen Wörtern bestehender sehr kleiner Rest ist
zulässig. Ist der Rest leer, vollständigen de-2-Beutel für den nächsten Durchlauf
bereitstellen. `last` darf ein mittlerweile ausgeschlossenes de-1-Wort weiter
dokumentieren; die Ziehung verhindert Wiederholung, wenn es im neuen Pool vorkommt.
Pool-Version und Ausschöpfungsstand werden ausdrücklich gespeichert, nicht an der
Länge des Arrays erraten. Tests: gemischter/leer/ausgeschlossener Beutel, neues Wort,
LEGAT, unmittelbar vorheriges Ziel, idempotente Reihenfolge.

## Aktive Runden und historische Ergebnisse

Aktives HUNNI oder ein anderes künftig ausgeschlossenes Ziel bleibt spielbar,
mit de-1-Eingaben, identischem Versuchslimit und bisherigen Hinweisen. Kein
automatischer Abbruch oder Austausch. Nach Abschluss werden neue freie Runden
aus de-2 gewählt. Historische Verluste/Siege, Tageswertungen und Streak-Rekorde
werden nicht nach Wortqualität korrigiert. Statistikdaten benötigen kein Zielwort
und werden nicht neu gezählt. Wordle- und Arcade-Ereignisse bleiben getrennt.

## Tagesrätsel: kein rückwirkender Austausch

Sicherste Empfehlung für das gemeinsame Rätsel: **Tagesrätsel zunächst weiterhin
auf de-1 lassen**, auch wenn freie Modi schon de-2 verwenden. Dadurch teilen alte
und neue Spieler denselben Tag, bis eine ausdrückliche Tagesrätsel-Umstellung
beschlossen wird.

Falls Tagesrätsel später de-2 verwenden sollen: zukünftigen UTC-Stichtag D
festlegen und einen zentralen Scheduler einführen. Tage vor D immer mit de-1 und
dem vorhandenen Hash auflösen, Tage ab D mit de-2. Bestehende abgeschlossene oder
angefangene Rätsel behalten ihren ursprünglichen Versionskontext. Tageswertung
bleibt auf Datum beschränkt: kein zweiter Statistikeintrag durch Versionswechsel.
Version muss im geteilten Ergebnis stehen. Die 1.461 eingefrorenen de-1-Fixtures
sichern historische Ziele, zusätzliche Tests decken D-1/D/D+1 ab.

Eine schon offline installierte alte PWA kann einen neuen Stichtag nicht kennen.
Ohne Server/Updatezwang ist gleiches de-2-Tageswort auf alter und neuer Software
nach D technisch nicht garantierbar. Das muss ausdrücklich entschieden werden,
statt einen nahtlosen gemeinsamen Umstieg zu versprechen. Das Beibehalten des
de-1-Tagespools vermeidet diesen Konflikt zunächst vollständig.

## Alte PWA, neue PWA und Speicher-Konflikte

Phase 1 erhält `wordle-de:v1`, schreibt nur `wordle-de:v2` und migriert alte
Speicher/Backups verlustfrei. Bei späteren v1-Schreibzugriffen einer alten PWA
und schon existierendem v2-Speicher ist vor Release noch eine getestete Strategie
notwendig. Vorgesehen:

1. Bei erster Übernahme Fingerabdruck der ursprünglichen v1-Kopie speichern.
   Vor jedem erneuten Laden prüfen, ob die alte Kopie inzwischen verändert wurde.
2. Neue alte Statistikereignisse anhand stabiler IDs importieren, nicht erneut
   zählen. Gleiche ID mit anderem Inhalt oder konkurrierende Tageswertungen
   blockieren die automatische Übernahme und bieten beide unveränderten Backups
   zur Konfliktauflösung. Neue Arcade-Daten niemals in v1 zurückschreiben.
3. Aktive Runden/Beutel/Einstellungen bei beidseitiger Änderung nicht anhand
   fehlender Zeitstempel blind überschreiben. Einmaliger Auswahl-Dialog mit
   Vorschau; alte und neue Kopie vor der Übernahme sichern. Siegesserien erfordern
   eine festgelegte Ereignisreihenfolge; Schema 1 liefert nur das Datum, weshalb
   Gleichzeitigkeit keine eindeutig rekonstruierbare Reihenfolge hat.
4. Migration durch vollständige Validierung vorbereiten, dann mit einem einzigen
   `setItem` schreiben. Fehlschlag erhält die alte Kopie und meldet Speicherproblem.
   Testmatrix: alter Offline-Spieler vor Erstupdate, spätere alte Tab-Schreibzugriffe,
   Konflikte, doppelte Tageswertung, Quote-/Importfehler, Reset mit Bestätigung.

Diese Zusammenführung ist ein **offenes Release-Kriterium**, keine in Phase 1
fertig behauptete Funktion. Mit unverändertem de-1 und unangetasteter Produktion
besteht derzeit kein Datenrisiko für live spielende Nutzer.

## Gemeinsamer Release erst nach Freigabe

- Neue Wortregistry und beide Datenpakete in den SW-Precache aufnehmen; alte
  de-1-Runden müssen auch offline fertig spielbar sein. Neue Cache-Version erst
  für den kompletten Release vergeben.
- Wartenden Worker über Update-Dialog aktivieren, bei aktiven zeitkritischen
  Sessions nicht mitten im Spiel neu laden. Ein neuer Worker mit geänderten
  Assets muss das komplette Offline-Paket atomar installieren können.
- Auf echtem Android und iPhone: alte PWA installieren, repräsentative Spielstände
  anlegen, neues Paket veröffentlichen, Update laden, Daten und Offline testen.
- main und Pages erst nach sämtlichen Modi, Migrationstests, Wortfreigabe und
  ausdrücklicher gemeinsamer Veröffentlichung verändern.

## In Phase 7 implementiert

Registry de-1/de-2, bytegleiches Archiv, optionales `selection`-Feld unter Schema 2.
Neue freie Runden verwenden de-2; Daily sowie historische Runden/Themen/Challenges
resolvieren die gespeicherte Basisversion. Alte klassische Runden ohne Worttag
werden weiterhin als de-1 gelesen. Ereignisse werden weder neu interpretiert
noch erneut gewertet. Neue klassische Ereignisse erhalten ihren Wortversionstag.

Restbeutel werden deterministisch in A/B/C aufgeteilt, ausschließlich freigegebene
Ausschlüsse entfernt. Alte Bag-/Last-Felder bleiben als Kompatibilitätsdaten
vorhanden. Nur das tatsächlich gespeicherte letzte alte Wort ist rekonstruierbar;
es wird kein erfundenes historisches 150-Wörter-Gedächtnis angelegt.

`legacySource` speichert die exakte originale v1-Rohkopie/null im v2-Stand.
Änderungen des v1-Keys blockieren weitere v2-Schreibvorgänge und bieten Export
beider Stände. Das Original wird nicht gelöscht. Ein validierter, eindeutig
additiver Merge ist als reine vorbereitende Funktion getestet; die UI führt
**keine automatische Zusammenführung** aus. Unklare Reihenfolge (Schema 1 hat
nur Tagesdatum), verschiedene Entwürfe/Beutel/Einstellungen/IDs werden abgelehnt.
Ein erstmaliger v2/v1-Konflikt wird ebenfalls geschützt.

v2-Tabs: Vor jedem Speichern wird der geladene exakte v2-String als Lease geprüft.
Fremde Storage-Events pausieren den Speedrun. Validierte fremde Stände können
nur nach ausdrücklicher Bestätigung übernommen werden; ein nochmals veränderter
Stand wird nicht mit einem alten Dialog überschrieben. Ungültige Daten oder
Löschung schützen den lokalen Stand. Export des eigenen Standes und der fremden
Originalkopie bleiben erreichbar. Bewusstes Backup-Importieren ist eine bestätigte
vollständige Übernahme, kein versprochenes Zusammenführen zweier Spielverläufe.

Grenze: localStorage besitzt kein atomares Compare-and-Swap. Zwei exakt simultane
Read/Write-Operationen können ohne zusätzliche Browser-Sperre konkurrieren.
Die Lease-/Storage-Event-Erkennung reduziert gewöhnliche Konflikte, ist keine
vollständig atomare Multi-Tab-Transaktion. Vor Release auf isoliertem Test-Origin
alte und neue PWA parallel, Wiederherstellung, Löschung, Quotenfehler und diese
Race-Grenze prüfen. Die exakte v1-Kopie vergrößert Backups; keine Historie wird
zur Platzgewinnung automatisch gelöscht. Schema 3 wird nicht eingeführt.

Die Cache-Version bleibt bis zum gemeinsamen Release v1. Phase 8 muss einen
neuen gemeinsamen Cache vergeben und tatsächliche Update-/Offline-Tests ausführen.

Die Quellkopie ist ein opaker Vergleichswert. Nach ausdrücklich bestätigter
Wiederherstellung darf auch ein beschädigter Originalstring als geschützte
Quelle erhalten bleiben, ohne den validierten neuen Stand am Speichern zu
hindern. Ein ungefragt beschädigter alter Speicher wird weiterhin nicht übernommen.
