# Phase 8 – Wortqualität (Zwischenstand)

Nur `feature/arcade-v2`; keine Veröffentlichung. Baseline: 288 bestandene Testgruppen.

Die KI hat den vollständigen offenen Bestand von 3.195 Wörtern und die bisherige A-Liste als Wortlisten gelesen. Das ist keine externe Wörterbuch-Einzelfreigabe und keine empirische Bekanntheitsmessung. Explizite Entscheidungen und konservativ beibehaltene Gruppen sind im vollständigen Ledger getrennt: `data/quality/phase8/review.json`. Begründungen werden über `reasonId` auf dessen zentrale `reasons`-Liste aufgelöst. 2.715 explizite Entscheidungen, 2.853 konservativ beibehaltene Einträge; alle 5.568 bisherigen Lösungen sind erfasst.

Neuer, ausschließlich entwicklungsseitig aktiver Pool **de-2.1**: 5.405 Lösungen; A 4.668, B 485, C 252. 163 Lösungen ausgeschlossen, Eingabepool unverändert (15.138). Geschützte Projektentscheidungen bleiben erhalten. C ist nicht auf LEGAT beschränkt. Sprachkenntnis ist subjektiv; bei B/C bleibt zusätzliche Spielerprüfung sinnvoll. Eigennamen, regionale Formen und schwierige Anglizismen sind Beispiele der expliziten Ausschlussgruppen. Der komplette Generator ist offline reproduzierbar.

`de-1`, `de-2`, Tagesrätsel und Themenversion bleiben erhalten. Aktive historische Runden und Duelle behalten ihre Wortversion. Alte gewichtete Beutel werden validiert, ausgeschlossene verbleibende Ziele gefiltert und verbleibende Wörter neu klassifiziert. Bereits entnommene Wörter werden dabei nicht wieder eingefüllt. Schema 2 bleibt unverändert.

Simulation: 570 Prüfpunkte; alle Vollzyklus-Eindeutigkeits- und Cooldown-Grenzprüfungen bestanden. Die Klassenwünsche sind durch die Inventarverteilung begrenzt; eine vollständige Runde hat zwangsläufig deren Klassenzahlen. Kein Versprechen dauerhaft identischer Prozentanteile.

Die vollständige bisherige Test-Suite besteht nach diesen Änderungen. Zusätzlich drei Qualitäts-Testgruppen. Chromium-Installation wurde versucht, scheiterte aber an ungültigen/leeren Downloadarchiven. Browser- und Gerätetests bleiben vorläufig offen.
