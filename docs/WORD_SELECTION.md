# Gemeinsame gewichtete Auswahl

`js/selection.js` verwaltet einen geteilten Beutel je Länge, getrennt nach A/B/C.
Classic, Random, Streak, Double, Tower, Speedrun und zufällige Duelle verwenden
exakt denselben Zustand. Reservierte Ziele verbrauchen einen Platz; Abbruch
stellt sie nicht wieder her. Themen behalten eigene versionierte Beutel,
Wunsch-Duelle wählen ihr explizites Wort, Daily bleibt deterministisch de-1.

| Modus | A | B | C |
|---|---:|---:|---:|
| Classic/Random/Streak | 70 | 25 | 5 |
| Double/Zufalls-Duell | 75 | 25 | 0 |
| Tower | 70 | 30 | 0 |
| Speedrun | 85 | 15 | 0 |

Innerhalb eines Zyklus wird jedes Wort genau einmal reserviert. Ein erschöpfter
Beutel wird erst danach neu gemischt. Die letzten 150 Ziele bleiben über die
Zyklusgrenze gesperrt. Falls kein ungespielter Kandidat übrig ist, wird die älteste
Sperre schrittweise gelockert; ein vorhandenes alternatives Wort schützt vor
unmittelbarer Wiederholung. Pools der aktiven Version haben mindestens 686 Wörter.

Adaptive Auswahl: Die verbrauchten Wörter einer Klasse dürfen dem proportionalen
Bestand um höchstens 32 Plätze vorauslaufen (halbes Planungsfenster 64). Unter
den damit verfügbaren Klassen gelten Modusgewichte. Dadurch erschöpft A später
als bei naivem konstanten Gewichten. Dies ist kein gespeicherter zusätzlicher
Zähler: Verbrauch wird aus Anfangsgröße und Restbeutel abgeleitet.
Leere Klassen werden herausgenommen; Gewichte werden effektiv renormiert.
C wird in C-freien Modi nur als expliziter Erschöpfungsfallback gezogen, wenn
kein ungespieltes A/B mehr existiert. Wiederholungsfreiheit hat Vorrang.
Bei reinem Speedrun erscheint LEGAT daher einmal am Ende des Fünfer-Zyklus.

Die tatsächlichen Klassenbestände sind 2.370/3.197/1. Exakte 70/25/5 über einen
kompletten Zyklus sind damit unmöglich. Auch 85% A über lange Speedrun-Strecken
sind unvereinbar mit globaler Wiederholungsfreiheit. Die Simulation dokumentiert
Abweichungen, statt konstante Prozente zu behaupten.

Alte Restbeutel: alle noch zulässigen Wörter und ihre Reihenfolge innerhalb
jeder Klasse bleiben erhalten; entfernte Wörter entfallen nur für neue Ziehungen.
Das letzte bekannte alte Ziel bleibt im Cooldown. Nicht gespeicherte alte
Ziehungen lassen sich nicht rückwirkend rekonstruieren. `selection` ist ein
optionales versioniertes Schema-2-Feld; die de-1-Bags werden nicht gelöscht.
