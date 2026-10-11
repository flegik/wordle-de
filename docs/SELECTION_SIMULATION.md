# Reale Auswahl-Simulation · Phase 7

Ausgeführt: `node tools/simulate_selection.cjs`. Ergebnis:
`data/quality/selection-simulation.json`, 570 Checkpoints. LCG-Seeds 17, 42, 2026
für wechselnde Modi; Seed 42 zusätzlich für jeden einzelnen Modus. Jeweils vier
Längen und drei Verfahren: naive Klassengewichte, adaptive Auswahl, gleichmäßige
Bestandsauswahl. 100/500/1.000 Ziehungen (soweit Zyklus lang genug), ganzer Zyklus
und 100 Ziehungen des Folgezyklus. Millisekunden sind gemessen und maschinenabhängig;
Ziele/Verteilungen sind durch Seed, Daten und Algorithmus reproduzierbar.

Alle vollständigen Zyklen: keine doppelten Ziele, kein direkt wiederholtes Ziel,
keine Verletzung des 150-Ziele-Cooldowns nach Zykluswechsel. Jeder Zielpool ist
endlich und wird vollständig verbraucht. Vergleich für fünf Buchstaben, Seed 42,
wechselnde Modi (A/B/C kumulativ):

| Ziehungen | Naiv | Adaptiv | Gleichmäßig |
|---:|---|---|---|
| 100 | 73/26/1 | 73/26/1 | 47/53/0 |
| 500 | 370/129/1 | 295/204/1 | 257/242/1 |
| 1.000 | 607/392/1 | 558/441/1 | 526/473/1 |
| 1.156 | 607/548/1 | 607/548/1 | 607/548/1 |

Naiv bestehen die letzten 100 Ziehungen des ersten Zyklus ausschließlich aus B.
Adaptiv sind es 20 A/80 B: der harte B-Ausklang wird verringert, nicht vollständig
beseitigt. In den letzten 100 bis Ziehung 1.000: adaptiv 53 A/47 B statt naiv
0 A/100 B. Die ersten 100 des Folgezyklus: adaptiv 78 A/21 B/1 C, durchschnittlicher
Abstand wiederholter Wörter 667,87 Ziehungen. Die vollständige JSON-Ausgabe zeigt
auch minimale Abstände, weitere Seeds, alle Längen und reine Modusprofile.

C ist ausschließlich LEGAT: hohe Zielprozente würden hier rasche Wiederholung
erfordern. C-freie Modi ziehen es nur nach A/B-Erschöpfung. Gewichtungen beeinflussen
den frühen Verlauf, der volle Zyklus folgt immer dem tatsächlichen Klassenbestand.

Größter einzelner gemessener Auswahlzustand: 20.122 UTF-8-Bytes. Größte gemessene
Zeit bis zum protokollierten Checkpoint: 616,01 ms für eine komplette Folge von
Ziehungen, keine Zeit je Tipp und kein Mobilgerät-Benchmark. Bis zu vier Beutel
plus Cooldowns bleiben gespeichert; kein unbegrenztes Ziehungsprotokoll.

Zusätzlich `node tools/benchmark_phase7.cjs`: synthetische klassische Historien
mit 100/1.000/10.000 Ereignissen. Bei 10.000: Storage-Validierung 10,071 ms,
Statistik 0,607 ms, Backup 1.749.201 Bytes. Messdaten in
`data/quality/performance-measurements.json`. Lange Session-Replays und echte
localStorage-Limits auf Mobilgeräten bleiben Release-Prüfungen. Keine automatische
Löschung von Historien; Quotenfehler schützen bestehende Daten.
