# themes-1 · Redaktionelle Wortauswahl

Basis: eingefrorenes **de-1**, Themenversion **themes-1**. Keine Änderung an den
5.574 allgemeinen Lösungen oder 15.139 zulässigen Eingaben.

Die Auswahl wurde als kleine explizite Kandidatenliste redaktionell durch Codex
zusammengestellt und nach erkennbarem Themenbezug bewertet. Es wurde **kein**
automatischer semantischer Klassifikator auf alle 5.574 Wörter angewendet und
keine Häufigkeitsschwelle als alleinige Freigabe benutzt. Die Begriffe unten
sind bewusst geläufige Tiernamen, Naturbegriffe, Lebensmittel und Haushaltsdinge.
Eine unabhängige menschliche/linguistische Zweitprüfung oder repräsentative
Bekanntheitsbefragung hat **nicht** stattgefunden. Die thematische Entscheidung
ist eine transparente redaktionelle Einschätzung, kein behaupteter externer
Wörterbuchnachweis der Kategoriezugehörigkeit. Vor dem gemeinsamen Release
sollen diese überschaubaren Listen gemeinsam durchgesehen werden.

## Tatsächlicher Umfang und Freischaltung

672 Kategorie-Wort-Kandidaten bewertet: **439 redaktionell beibehalten**, **229
für diese Themenauswahl ausgeschlossen**, **4 zur Prüfung zurückgestellt**.
Ein Wort in zwei Kategorien ist zweimal als Zuordnung gezählt. Von den 439
beibehaltenen Zuordnungen liegen **304** in freigeschalteten Kombinationen;
das sind **292 unterschiedliche aktive Lösungswörter**. Die anderen 135 sind
für die jeweilige kleine Kombination vorgemerkt und momentan nicht auswählbar.

**✓ = verfügbar (mindestens 25); – = gesperrt.** Die Zahlen zählen nur
redaktionell beibehaltene, tatsächlich in de-1 vorhandene Lösungen.

| Kategorie | 4 | 5 | 6 | 7 | Gesamt beibehalten | Aktiv |
|---|---:|---:|---:|---:|---:|---:|
| Tiere | 19 – | 32 ✓ | 23 – | 19 – | 93 | 32 |
| Natur | 25 ✓ | 42 ✓ | 32 ✓ | 11 – | 110 | 99 |
| Essen & Trinken | 25 ✓ | 41 ✓ | 35 ✓ | 24 – | 125 | 101 |
| Haushalt | 21 – | 38 ✓ | 34 ✓ | 18 – | 111 | 72 |

Vier Kategorien und neun freigeschaltete Kombinationen. Tiere zunächst nur
mit fünf Buchstaben; Natur und Essen mit vier bis sechs; Haushalt mit fünf
oder sechs. **Keine Siebenerkombination** erreicht die Mindestgröße.
Technik und Berufe wurden nicht als eigene Kategorien freigeschaltet oder
künstlich aufgefüllt; ihre eigene Kuratierung bleibt offen. Haushalt enthält
auch eindeutig alltägliche Geräte wie Radio, Router und Laptop, statt hierfür
jetzt einen kleinen gesonderten Technikpool zu erzeugen.

## Prüfnachweise, Quellen und Lizenz

- `data/themes/editorial-themes-1.json`: vollständige überprüfbare Kandidatenliste
  mit Wort, Kategorie, Entscheidung, Grund und realen Audit-Indizien.
- `data/review/word-audit-de-1.json`: vorhandene DIC-Zeilen, Stamm-/Affix-Indizien,
  tatsächliche OpenSubtitles-Ränge und Auditklassifikation. Diese Indizien prüfen
  Schreibweise/Gebrauch, **nicht automatisch Semantik oder Alltagsbekanntheit**.
- `data/sources/igerman98.dic`, `diceware.txt` und die vorhandenen Quellen:
  Herkunft/Lizenzen unverändert in `WORDLISTS.md` und `licenses/` dokumentiert.
- Gebrauchsdaten: OpenSubtitles 2018 über FrequencyWords, unveränderte lokal
  vorhandene Quelle und CC-BY-SA-4.0-Hinweis aus Phase 1. Keine Wörterbuchtexte
  kopiert und keine neuen Onlinequellen oder externen Laufzeitabfragen eingeführt.

Unter den 304 aktiven Zuordnungen stehen 222 im alten Audit auf `keep`, 82 auf
`review`. Das ist keine widersprüchliche versteckte automatische Freigabe:
dieser Regelaudit war ausdrücklich keine manuelle Themenprüfung. Beispielsweise
stehen DILL, EFEU, ERLE, FETA und AMSEL wegen schwachem/fehlendem Untertitel-Signal
auf Prüfung. Sie sind hier redaktionell als vertraute Pflanzen, Lebensmittel
oder Tiere beibehalten. MAIS hat im vereinfachten Audit nur Affix-Evidenz;
der eingefrorene Lösungspool und die eindeutige Lebensmittelzuordnung bleiben
vorhanden. Niedriger Untertitelgebrauch macht Tier-/Pflanzennamen nicht automatisch
ungeeignet. Jeder dieser Befunde bleibt in der Kandidatendatei sichtbar.

## Zurückgestellt / ausgeschlossen

- **ETAGERE** (Haushalt): Bekanntheit für durchschnittliche Spieler unsicher.
- **FASSUNG** (Haushalt): Nur die Lampenfassung ist gemeint; ohne Zusatz kein ausreichend klarer Haushaltsbezug.
- **SCHIPPE** (Haushalt): Für den Start Schaufel bevorzugt; Bekanntheit redaktionell prüfen.
- **SCHLOSS** (Haushalt): Mehrdeutigkeit zwischen Gebäude und Verschluss; zunächst prüfen.

Bewusst nicht verwendet: ALPEN (geografischer Eigenname), HERDE im Haushalts-
pool (hier nur Plural von Herd), abstrakte/unspezifische DEKO, DEKOR, DUFT,
LICHT und ABLAUF sowie der ohne Kontext unklare Haushaltsbezug von KAPSEL/FUTTER.
Weitere Kandidaten werden wegen Länge oder fehlender de-1-Lösung abgewiesen,
nicht als erfundene oder falsche deutsche Wörter bezeichnet. Beispielsweise
AFFE, KÄFER, KREBS, MÖWE, MÖHRE und LÖFFEL sind nicht im bestehenden Lösungspool.
Sie werden hier deshalb nicht heimlich in den globalen Pool aufgenommen.

HUNNI, PESEL, MBIT, HUHNS und MICH sind in keiner Themenliste. LEGAT bleibt
allgemeine Lösung/Eingabe und erhält keine künstliche Themenzuordnung.
Regionale/unsichere Varianten werden nicht zur Erfüllung der 25ergrenze ergänzt.
Allgemeine Rateeingaben bleiben unverändert de-1; die spätere globale Bereinigung
von PESEL und anderen Einträgen ist ausdrücklich nicht Teil dieser Phase.

## Beibehaltene Listen vollständig

Jede Liste unten ist eine ausdrückliche redaktionelle Entscheidung. Gesperrte
Listen sind nicht spielbar, aber kontrollierbar und für spätere Prüfung erhalten.

### Tiere

**4 Buchstaben · 19 · gesperrt:** ELCH, ENTE, EULE, FINK, FLOH, HAHN, HASE, HUHN, HUND, IGEL, LAMM, LAUS, LÖWE, MAUS, PUMA, RABE, RIND, WOLF, WURM

**5 Buchstaben · 32 · verfügbar:** AMSEL, BIBER, BIENE, BISON, DACHS, FALKE, FASAN, FISCH, FUCHS, GECKO, HENNE, KATZE, KOBRA, LACHS, LUCHS, MEISE, MOLCH, MOTTE, OCHSE, OTTER, PFERD, PUDEL, RAUPE, ROBBE, SCHAF, SPATZ, STUTE, TAUBE, TIGER, WANZE, WESPE, ZEBRA

**6 Buchstaben · 23 · gesperrt:** AUSTER, BARSCH, DELFIN, ELSTER, FLIEGE, FOHLEN, FROSCH, GEPARD, HENGST, HERING, HUMMEL, HUMMER, JAGUAR, KOJOTE, KRABBE, LERCHE, MARDER, QUALLE, REIHER, SPECHT, SPINNE, STORCH, WIDDER

**7 Buchstaben · 19 · gesperrt:** BUSSARD, DROSSEL, FORELLE, GAZELLE, GIRAFFE, GORILLA, HAMSTER, KARPFEN, KUCKUCK, LEOPARD, MAKRELE, MUSCHEL, NASHORN, PANTHER, PAPAGEI, PELIKAN, PINGUIN, SEEHUND, SEEIGEL

### Natur

**4 Buchstaben · 25 · verfügbar:** BACH, BAUM, BERG, EFEU, ERDE, ERLE, FARN, FELD, FELS, GRAS, KLEE, LAUB, LAVA, LEHM, MEER, MOHN, MOOS, PILZ, ROSE, SAND, UFER, ULME, WALD, WIND, ÄHRE

**5 Buchstaben · 42 · verfügbar:** AHORN, BEERE, BIRKE, BLATT, BLUME, BODEN, BORKE, BUCHE, BUSCH, EICHE, FLUSS, FROST, HAFER, HAGEL, HEIDE, INSEL, LILIE, LINDE, MINZE, MULDE, NEBEL, NELKE, PALME, QUARZ, RASEN, REGEN, RINDE, SENKE, SONNE, STAUB, STEIN, STURM, SUMPF, TANNE, TEICH, TULPE, WEIDE, WELLE, WIESE, WOLKE, ZEDER, ZWEIG

**6 Buchstaben · 32 · verfügbar:** BAMBUS, DISTEL, FELSEN, FICHTE, GARTEN, GERSTE, GIPFEL, GRANIT, HERBST, HIMMEL, KAKTUS, KIEFER, KIESEL, KNOSPE, KRATER, KROKUS, LAWINE, POLLEN, QUELLE, ROGGEN, SALBEI, SCHILF, SCHNEE, SOMMER, STRAND, TUNDRA, VULKAN, WASSER, WEIZEN, WETTER, WINTER, WURZEL

**7 Buchstaben · 11 · gesperrt:** ANEMONE, EROSION, KIRSCHE, KORALLE, MELISSE, PFLANZE, PFLAUME, PLATEAU, TROPFEN, ZITRONE, ZWIEBEL

### Essen & Trinken

**4 Buchstaben · 25 · verfügbar:** BIER, BROT, DILL, FETA, KEKS, KIWI, KOHL, KÄSE, LIMO, MAIS, MEHL, METT, MOHN, NUSS, OBST, PILZ, REIS, SAFT, SALZ, SEKT, SENF, SOJA, TOFU, WEIN, ZIMT

**5 Buchstaben · 41 · verfügbar:** APFEL, BEERE, BIRNE, BOHNE, CHILI, CREME, CURRY, DONUT, ERBSE, ESSIG, FILET, FISCH, GELEE, GOUDA, GURKE, HAFER, HIRSE, HONIG, KAKAO, LACHS, LINSE, MANGO, MILCH, MINZE, NELKE, NUDEL, OLIVE, PASTA, PIZZA, QUARK, SAHNE, SALAT, SAUCE, SESAM, SIRUP, SPECK, STEAK, SUPPE, TOAST, TORTE, WURST

**6 Buchstaben · 35 · verfügbar:** BANANE, BRATEN, BREZEL, BULGUR, BUTTER, DATTEL, DORSCH, HERING, HUMMER, INGWER, KAFFEE, KAVIAR, KRABBE, KUCHEN, MANDEL, MARONE, MUFFIN, ORANGE, POMMES, PUNSCH, ROSINE, RUCOLA, SALAMI, SALBEI, SEMMEL, SORBET, SPINAT, TOMATE, TRAUBE, WAFFEL, WASSER, WEIZEN, WHISKY, ZANDER, ZUCKER

**7 Buchstaben · 24 · gesperrt:** BEILAGE, EINTOPF, FLEISCH, FORELLE, JOGHURT, KAROTTE, KARPFEN, KIRSCHE, LAKRITZ, LASAGNE, MAKRELE, OMELETT, PAPRIKA, PFLAUME, PRALINE, PUDDING, RAVIOLI, RETTICH, ROULADE, SCHNAPS, VANILLE, WALNUSS, ZITRONE, ZWIEBEL

### Haushalt

**4 Buchstaben · 21 · gesperrt:** AKKU, BETT, BILD, DOSE, ETUI, GARN, GLAS, HAHN, HERD, KAMM, KORB, KRUG, MOPP, OFEN, ROHR, ROST, SIEB, SOFA, TOPF, TUCH, VASE

**5 Buchstaben · 38 · verfügbar:** BESEN, BLECH, BODEN, BRETT, DECKE, DIELE, DRAHT, EIMER, FADEN, FEILE, GABEL, HAKEN, KABEL, KAMIN, KANNE, KELLE, KERZE, KISTE, KÜCHE, LAMPE, MATTE, MIXER, NADEL, NAGEL, PAPPE, RADIO, REGAL, REIBE, ROLLO, SEIFE, STUHL, TASSE, TISCH, TRUHE, WAAGE, WANNE, ZANGE, ZWIRN

**6 Buchstaben · 34 · verfügbar:** BECHER, BOHRER, BRAUSE, DECKEL, DUSCHE, GITTER, HAMMER, HOCKER, KAMMER, KARTON, KESSEL, KISSEN, KLAPPE, KLINKE, KOFFER, KORKEN, LAPTOP, LEITER, MESSER, PAPIER, PFANNE, PINSEL, RAHMEN, RASPEL, RIEGEL, ROUTER, SCHALE, SCHERE, SESSEL, SPATEN, TAPETE, TELLER, VENTIL, WECKER

**7 Buchstaben · 18 · gesperrt:** ABFLUSS, DRUCKER, FENSTER, FLASCHE, GARDINE, KOMMODE, LEUCHTE, POLSTER, SCHRANK, SCHWAMM, SPIEGEL, STECKER, TABLETT, TEPPICH, TOASTER, UHRWERK, VORHANG, WANDUHR

## Reproduktion und zukünftige Pflege

`python tools/build_themes.py` erzeugt ausschließlich `data/themes.js` aus den
expliziten Entscheidungen. `python tests/themes-build.test.py` prüft Bytegleichheit,
Entscheidungs-/Kategorie-IDs und Abgleich mit dem tatsächlichen Audit. Tests
prüfen zusätzlich jeden Pool gegen de-1, Unicode, Länge, Duplikate und Sperren.
Keine automatisierte Prüfung behauptet die Popularität oder Bedeutung eines Wortes.

Nach Freigabe einer veränderten Auswahl eine **neue** Themenversion anlegen;
`themes-1` samt unverändertem Inhalt, Kategorien und aktivierten Längen behalten.
Die Laufzeitregistry kann historische Pakete parallel auflösen. Alte Runden,
Events und Beutel werden gegen ihre gespeicherte Themen-/Basiswortversion geprüft,
nicht gegen eine neue aktuelle Auswahl. Der spätere de-2-Umstieg benötigt außerdem
die in `docs/WORD_VERSION_PLAN.md` geplante globale Wortregistry. Diese Migration
wurde hier nicht implementiert. Gültige alte Sessions bleiben bis dahin auf de-1.
