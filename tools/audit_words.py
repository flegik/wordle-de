"""Deterministic, read-only de-1 audit. Standard library only; no web requests.

Never changes words.js or consumes candidates in build_words.py. The AFF matcher
uses individual, directly flagged rules only: no cross products, compounds,
continuation classes or POS/frequency claims. Missing DIC stems are review signals,
not spelling verdicts. See WORD_REVIEW.md for false positives and limitations.
"""
import ast
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'data/review'
SOURCE = ROOT / 'data/sources'
LABELS = {'reject': 'Eindeutig ungeeignet', 'review': 'Manuell prüfen',
          'keep': 'Geeignet / beibehalten (vorläufig)'}


def normalize(word):
    return unicodedata.normalize('NFC', word).replace('ß', 'ẞ').upper()


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def read_words():
    text = (ROOT / 'data/words.js').read_text(encoding='utf-8')
    return json.loads(text[text.index('{'):text.rindex(';')])


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def usage_evidence(targets, policy):
    evidence = {}
    for rank, line in enumerate((REVIEW / 'sources/de_50k.txt').read_text(encoding='utf-8').splitlines(), 1):
        token, count = line.rsplit(' ', 1)
        word = normalize(token)
        if word in targets:
            entry = evidence.setdefault(word, {'bestRank': rank, 'count': 0, 'tokens': []})
            entry['count'] += int(count)
            entry['tokens'].append({'token': token, 'rank': rank, 'count': int(count)})
    for word in targets:
        entry = evidence.setdefault(word, {'bestRank': None, 'count': 0, 'tokens': []})
        rank = entry['bestRank']
        entry['band'] = ('not-in-top-50000' if rank is None else
                         'low-subtitle-frequency' if rank > policy['reviewAboveRank'] else
                         'medium-subtitle-frequency' if rank > policy['frequentMaxRank'] else
                         'higher-subtitle-frequency')
    return evidence


def dictionary_evidence(targets):
    stems, direct, derived = [], defaultdict(list), defaultdict(list)
    for line_no, line in enumerate((SOURCE / 'igerman98.dic').read_text(encoding='utf-8').splitlines(), 1):
        base, _, flags = line.partition('/')
        if not re.fullmatch('[A-Za-zÄÖÜäöüßẞ]+', base):
            continue
        stems.append((base, flags, line_no))
        if normalize(base) in targets:
            direct[normalize(base)].append({'entry': base, 'flags': flags, 'line': line_no,
                                          'standalone': not bool(set(flags) & set('doh'))})
    affixes = defaultdict(list)
    for line_no, line in enumerate((SOURCE / 'igerman98.aff').read_text(encoding='utf-8').splitlines(), 1):
        fields = line.split()
        if len(fields) < 5 or fields[0] not in ('PFX', 'SFX'):
            continue
        kind, flag, strip, add, condition = fields[:5]
        add = add.split('/')[0]
        # Exclude compound/case helper rules containing hyphens and other tokens.
        if not re.fullmatch('[A-Za-zÄÖÜäöüßẞ0]+', strip + add):
            continue
        pattern = condition + '$' if kind == 'SFX' else '^' + condition
        affixes[flag].append((kind, '' if strip == '0' else strip,
                             '' if add == '0' else add, re.compile(pattern), line_no))
    for base, flags, dic_line in stems:
        if 'd' in flags or 'o' in flags:
            continue
        for flag in flags:
            for kind, strip, add, condition, aff_line in affixes[flag]:
                if not condition.search(base):
                    continue
                if kind == 'SFX':
                    if strip and not base.endswith(strip):
                        continue
                    form = (base[:-len(strip)] if strip else base) + add
                else:
                    if strip and not base.startswith(strip):
                        continue
                    form = add + (base[len(strip):] if strip else base)
                word = normalize(form)
                if word in targets and word != normalize(base):
                    evidence = {'base': base, 'flag': flag, 'kind': kind,
                                'dictionaryLine': dic_line, 'affixLine': aff_line}
                    if evidence not in derived[word]:
                        derived[word].append(evidence)
    return direct, derived


def build():
    words = read_words()
    assert words['version'] == 'de-1', 'Audit currently targets frozen de-1 only'
    solution_list = [w for n in range(4, 8) for w in words['solutions'][str(n)]]
    targets = set(solution_list)
    assert len(targets) == len(solution_list) == 5574
    direct, derived = dictionary_evidence(targets)
    diceware = defaultdict(list)
    for i, word in enumerate((SOURCE / 'diceware.txt').read_text(encoding='utf-8').splitlines(), 1):
        diceware[normalize(word.strip())].append({'entry': word.strip(), 'line': i})
    # Read the existing explicit additions without executing the generator.
    tree = ast.parse((ROOT / 'tools/build_words.py').read_text(encoding='utf-8'))
    addition_node = next(n.value for n in tree.body if isinstance(n, ast.Assign) and
                         any(isinstance(t, ast.Name) and t.id == 'additions' for t in n.targets))
    additions = set(map(normalize, ast.literal_eval(addition_node.func.value).split()))
    policy = read_json(REVIEW / 'editorial-rules.json')
    assert policy['wordVersion'] == words['version']
    usage = usage_evidence(targets, policy['usagePolicy'])
    overrides = {}
    for group in policy['reviewGroups']:
        for word in group['words'].split():
            overrides[word] = group
    for word in list(policy['reject']) + list(policy['keep']) + list(overrides):
        assert word in targets, 'Editorial rule references absent solution: ' + word
    references = {r['word']: r for r in policy['verifiedReferences']}
    records = []
    for word in solution_list:
        standalone = any(d['standalone'] for d in direct[word])
        reasons, classification, priority = [], 'keep', 4
        if word in policy['reject']:
            classification, priority = 'reject', 1
            reasons.append({'code': 'editorial-reject', 'text': policy['reject'][word]})
        elif word in policy['keep']:
            reasons.append({'code': 'editorial-keep', 'text': policy['keep'][word]})
        elif word in overrides:
            group = overrides[word]
            classification, priority = 'review', group['priority']
            reasons.append({'code': group['code'], 'text': group['reason']})
        elif usage[word]['band'] in ('not-in-top-50000', 'low-subtitle-frequency'):
            classification, priority = 'review', 2
            reasons.append({'code': 'usage-review', 'text': 'Im deutschen Untertitelkorpus nur niedriger Rang '
                            'oder kein Treffer unter den 50.000 Formen. Alltagstauglichkeit und Rätselwert prüfen; '
                            'Korpus-Bias beachten, kein automatischer Ausschluss.'})
        elif not standalone:
            classification, priority = 'review', 3
            code = 'affix-only-evidence' if derived[word] else 'no-standalone-dic-entry'
            reasons.append({'code': code, 'text': 'Kein eigenständig zulässiger exakter DIC-Stammeintrag. '
                            + ('Einzelne vorhandene AFF-Regeln erklären mögliche Ableitungen; Lexemstatus prüfen.' if derived[word]
                               else 'Auch korrekte Komposita, neue Wörter oder Lehnwörter können fehlen; kein Fehlernachweis.')})
        else:
            reasons.append({'code': 'dictionary-stem', 'text': 'Eigenständig zugelassener DIC-Eintrag; '
                            'keine spezielle Auffälligkeit durch diese Regeln. Keine vollständige manuelle Qualitätsfreigabe.'})
        entry = {'word': word, 'length': len(word), 'classification': classification,
                 'priority': priority, 'reasons': reasons,
                 'sources': {'diceware': diceware[word], 'explicitAddition': word in additions,
                             'dictionary': direct[word], 'singleAffixMatches': derived[word]}}
        entry['usage'] = usage[word]
        if word in references:
            entry['verifiedReference'] = references[word]
        records.append(entry)
    inputs = ['data/words.js', 'data/sources/diceware.txt', 'data/sources/igerman98.dic',
              'data/sources/igerman98.aff', 'tools/build_words.py', 'tools/audit_words.py',
              'data/review/editorial-rules.json', 'data/review/sources/de_50k.txt']
    counts = Counter(r['classification'] for r in records)
    metadata = {'schema': 1, 'wordVersion': 'de-1', 'auditVersion': 'phase-1-v1',
                'total': len(records), 'counts': dict(sorted(counts.items())),
                'inputsSha256': {p: sha(ROOT / p) for p in inputs}}
    metadata['usageSource'] = {'repository': 'hermitdave/FrequencyWords',
                              'commit': '525f9b560de45753a5ea01069454e72e9aa541c6',
                              'path': 'content/2018/de/de_50k.txt', 'license': 'CC-BY-SA-4.0',
                              'corpus': 'OpenSubtitles 2018', 'policy': policy['usagePolicy']}
    audit = {**metadata, 'records': records}
    candidates = {**metadata, 'targetWordVersion': 'de-2', 'approved': False,
                  'scope': 'solutions-only', 'protectedWords': ['LEGAT'],
                  'note': 'Review candidates, not a deletion policy. approved=false for every entry; build_words.py does not read this file.',
                  'reviewSource': 'word-audit-de-1.json',
                  'candidates': [{'word': r['word'], 'length': r['length'], 'classification': r['classification'],
                                  'priority': r['priority'], 'reasonCodes': [reason['code'] for reason in r['reasons']],
                                  'usageRank': r['usage']['bestRank'], 'approved': False}
                                 for r in sorted(records, key=lambda r: (r['priority'], r['word']))
                                 if r['classification'] != 'keep']}
    return words, audit, candidates


def report(words, audit, candidates):
    records = audit['records']
    lines = ['# Wortqualitätsprüfung · WORDLE DE 2.0 / Phase 1', '',
             'Vollständiger reproduzierbarer **Regelaudit aller 5.574 Lösungen**, keine vollständige manuelle Einzelprüfung. '
             '`de-1`, die 15.139 Eingaben und der Generator bleiben unverändert. Alle Ausschlüsse sind Vorschläge.', '',
             '## Umfang und Klassifikation', '',
             '| Länge | Lösungen | Eingaben | Eindeutig ungeeignet | Manuell prüfen | Vorläufig beibehalten |',
             '|---|---:|---:|---:|---:|---:|']
    for n in range(4, 8):
        c = Counter(r['classification'] for r in records if r['length'] == n)
        lines.append(f'| {n} | {len(words["solutions"][str(n)])} | {len(words["accepted"][str(n)])} | '
                     f'{c["reject"]} | {c["review"]} | {c["keep"]} |')
    c = audit['counts']
    lines += [f'| **Gesamt** | **5574** | **15139** | **{c["reject"]}** | **{c["review"]}** | **{c["keep"]}** |', '',
              f'**{c["reject"] + c["review"]} auffällige Kandidaten**. Die große Prüfmenge ist bewusst vorsichtig: '
              'Fehlende Wörterbuchstämme oder geringe Korpusfrequenz beweisen kein falsches deutsches Wort.', '',
              '## Reproduzieren und überprüfbare Daten', '',
              '```sh', 'python tools/audit_words.py', 'python tests/audit.test.py', '```', '',
              '- `data/review/word-audit-de-1.json`: ein Datensatz je Lösung; Quellenzeilen, DIC-Flags, einzelne AFF-Nachweise, Regel und Priorität.',
              '- `data/review/exclusion-candidates-de-2.json`: alle auffälligen Wörter, `approved: false`, nur Lösungspool, LEGAT geschützt.',
              '- `data/review/editorial-rules.json`: kleine überprüfbare redaktionelle Regeln und belegte externe Stichproben.',
              '- SHA-256-Prüfsummen aller Eingabedateien im Audit. Keine Uhrzeit, kein Zufall, kein Netzbedarf beim Reproduzieren.', '',
              '## Regeln und Aussagegrenzen', '',
              '1. Explizite redaktionelle Ablehnung hat Vorrang: HUNNI gemäß Auftrag, MBIT als Abkürzung.',
              '2. LEGAT und begründete positive Beispiele bleiben geschützt. Adjektive, Infinitive und Fachwörter werden nicht pauschal aussortiert.',
              '3. Die redaktionellen Gruppen markieren Namen/Marken, Kurzformen, Funktionswörter, auffällige Beugungen und regionale Varianten zur Prüfung.',
              '4. Alle übrigen Wörter werden gegen die lokal vorhandene igerman98-DIC geprüft. Flags d/o/h kennzeichnen verbotene, nur zusammengesetzte bzw. affixpflichtige Stämme.',
              '5. Gebrauchshäufigkeit wird zusätzlich für jedes Lösungswort im offenen deutschen OpenSubtitles-2018-Korpus geprüft. '
              'Rang über 30.000 oder kein Top-50.000-Treffer erzeugt Priorität 2; Rang bis 10.000 ist ein stärkeres Gebrauchssignal. '
              'Diese Schwellen sind Designentscheidungen, keine allgemeine Bekanntheitsmessung. Namen/Filmwortschatz, Flexionsformen und das Alter des Korpus beeinflussen das Ergebnis.',
              '6. Bei fehlendem eigenständigem Eintrag werden direkt vorhandene einzelne AFF-Regeln als Nachweis möglicher Ableitung vermerkt. '
              'Der Matcher bildet keine vollständige Hunspell-Morphologie ab: keine Komposita, Kreuzprodukte, Fortsetzungsflags oder grammatische POS-Analyse.',
              '7. Ein eigener DIC-Eintrag genügt allein nicht mehr: ohne ausreichendes Korpus-Signal ist manuelle Prüfung nötig. '
              '*Vorläufig beibehalten* ist weiterhin keine manuelle Freigabe. Keine vollständige Wortartenannotation oder repräsentative Befragung liegt vor; '
              'Endungen allein beweisen keinen Genitiv oder keine Konjugation. LEGAT bleibt ausdrücklich geschützt.', '',
              '## Verifizierte Beispiele und Abgleich mit dem Auftrag', '',
              '| Wort | Befund | Empfehlung |', '|---|---|---|',
              '| HUNNI | Lösung und Eingabe; Duden führt den Gebrauch als salopp. | Später aus Lösungen nehmen, weiterhin Eingabe. Kein erfundenes Wort. |',
              '| HUHNS | Bereits nur Eingabe, keine Lösung. | Eingabeliste nicht wegen Genitivform beschneiden. |',
              '| MICH | Bereits nur Eingabe, keine Lösung. | Keine Änderung notwendig. |',
              '| LEGAT | Reguläre Lösung und Eingabe, DIC-Eintrag. | Unbedingt behalten. |',
              '| SALBE | Lösung, eigenständiger DIC-Eintrag. | Behalten; die Grafik liefert keinen Ausschlussgrund. |',
              '| KREBS | Nur Eingabe, keine Lösung. | Keine Lösungsbereinigung erforderlich. |',
              '| DRUSE | Weder Lösung noch Eingabe im aktuellen Bestand. | Grafikbeispiel nicht als Datenbestand übernehmen. |',
              '| PESEL | Echtes Wort, aber vom Nutzer ausdrücklich als zu unbekannt abgelehnt. | Für de-2 Ausschluss aus Lösungen **und Eingaben** vormerken. |',
              '| PESEN | Duden-Eintrag vorhanden. | Gebrauch und Rätselwert prüfen, nicht als falsches Wort markieren. |',
              '| LIIEREN | Duden bestätigt Schreibweise und Verbgrundform. | Beibehalten; das doppelte I ist korrekt. |', '',
              'Externe Einzelprüfungen am 11.10.2026, keine Wörterbuchdaten daraus eingebaut:', '',
              '- https://www.duden.de/rechtschreibung/Hunni', '- https://www.duden.de/rechtschreibung/Pesel',
              '- https://www.duden.de/rechtschreibung/pesen', '- https://www.duden.de/rechtschreibung/liieren', '',
              '## Gebrauch und Spielwert', '',
              'Auf Wunsch des Nutzers reicht lexikalische Korrektheit nicht aus. Die Wortauswahl soll im Alltag erkennbar und sinnvoll erratbar sein. '
              'Maßstab: selten benutzt darf sein, beim Auflösen sollte man das Wort wiedererkennen, statt seine Bedeutung googeln zu müssen. Der vollständige Audit enthält daher für jedes Wort `usage`: tatsächliche Quellform(en), Trefferzahl, besten Rang und Frequenzband. '
              'Das Untertitelkorpus ist ein zusätzliches Indiz, keine alleinige Freigabe. Niedrige Frequenz bei Fachbegriffen (z. B. LEGAT), '
              'seltene Singularformen häufiger Plurale und unterrepräsentierte Sachthemen brauchen redaktionelle Ausnahmen.', '',
              'Quelle: https://github.com/hermitdave/FrequencyWords, Commit `525f9b560de45753a5ea01069454e72e9aa541c6`, '
              '`content/2018/de/de_50k.txt`, CC BY-SA 4.0 für Inhalte. Lokale unveränderte Quelle unter `data/review/sources/`; '
              'Attribution und Lizenzhinweis: `licenses/frequencywords-notice.txt`. Keine neue Laufzeitabhängigkeit.', '',
              'Die gesonderte `accepted-exclusion-candidates-de-2.json` enthält bislang nur den ausdrücklich abgelehnten PESEL-Eintrag. '
              'Der breitere Eingabepool bleibt grundsätzlich erhalten; weitere extrem obskure Eingaben brauchen eine eigene begründete Prüfung. '
              'Alle Vorschläge sind noch unfreigegeben und verändern de-1 nicht.', '',
              '## Priorisierte redaktionelle Prüfliste', '',
              'Priorität 1: konkrete Qualitätsregeln; Priorität 2: Plural-/Variantenpolitik; Priorität 3: nur maschineller Wörterbuchhinweis. '
              'Alle redaktionellen P1/P2-Kandidaten stehen hier; die vollständigen zusätzlichen Frequenz- und P3-Listen stehen maschinenlesbar daneben.', '',
              '| Wort | Priorität | Klasse | Grund |', '|---|---:|---|---|']
    for candidate in candidates['candidates']:
        r = next(record for record in records if record['word'] == candidate['word'])
        if r['priority'] <= 2 and r['reasons'][0]['code'] != 'usage-review':
            lines.append(f'| {r["word"]} | {r["priority"]} | {LABELS[r["classification"]]} | {r["reasons"][0]["text"]} |')
    codes = Counter(reason['code'] for r in records for reason in r['reasons'])
    lines += ['', '## Automatische Signale im Gesamtbestand', '', '| Regel | Anzahl |', '|---|---:|']
    lines += [f'| {code} | {n} |' for code, n in sorted(codes.items())]
    lines += ['', 'Beispiele P3 (bewusst auch legitime Wörter): ' +
              ', '.join([r['word'] for r in candidates['candidates'] if r['priority'] == 3][:40]) + '.', '',
              '## Empfehlung zur späteren Freigabe', '',
              'Zuerst HUNNI und Abkürzungen entscheiden, dann konkrete P1-Namen/Marken und Funktionsformen prüfen. '
              'Gebräuchliche plurale Substantive konsistent behandeln; Singular-only ist eine Designentscheidung, keine Rechtschreibregel. '
              'P3 niemals gesammelt löschen: darunter sind geläufige Substantive, Komposita und moderne Lehnwörter. '
              'Gebrauchsdaten als Sortierhilfe für die Einzelprüfung verwenden, nicht als automatische Liste falscher Wörter. '
              'Für de-2 eine eigene freigegebene Policy mit Wort, Entscheidung, Begründung und Reviewer anlegen; '
              'diese Kandidatenliste wird jetzt vom Generator ausdrücklich nicht verwendet.', '',
              '## Auswirkungen auf gespeicherte Spiele', '',
              'Phase 1 ändert keine Ziele, Beutel oder Tagesrätsel. Bei de-2 dürfen aktive de-1-Runden mit HUNNI oder anderen '
              'ausgeschlossenen Zielen zu Ende gespielt werden. Frühere Statistikeinträge werden nicht nachträglich gelöscht. '
              'Nur zukünftige freie Ziehungen verwenden freigegebene de-2-Lösungen. Beutel werden dann gefiltert und verlustarm ergänzt. '
              'Das bisherige de-1-Paket muss unverändert als Kompatibilitätswörterbuch erhalten bleiben. '
              'Tagesrätsel werden erst nach einem festgelegten zukünftigen UTC-Stichtag umgestellt; ältere Rätsel bleiben de-1. '
              'Details und das Problem paralleler alter PWAs: `docs/WORD_VERSION_PLAN.md`.', '',
              '## Lizenzen', '',
              'Quellen und bestehende Lizenzdateien bleiben wie in `WORDLISTS.md`. Die Audit-Evidenz enthält Auszüge/Flags '
              'aus igerman98 und trägt für diese abgeleiteten Wörterbuchdaten GPL-2.0 OR GPL-3.0. '
              'Audit-Programm und eigene redaktionelle Regeln folgen der MIT-Programmlizenz. '
              'Frequenzquelle und daraus abgeleitete Rang-/Zählevidenz: CC BY-SA 4.0; zusätzliche Attribution im Lizenzhinweis. '
              'Duden dient ausschließlich verlinkter Einzelprüfung; kein Wörterbuch-Scraping, keine zusätzliche Laufzeitdatenquelle.', '']
    return '\n'.join(lines)


def outputs():
    words, audit, candidates = build()
    policy = read_json(REVIEW / 'editorial-rules.json')
    accepted_candidates = {'schema': 1, 'wordVersion': 'de-1', 'targetWordVersion': 'de-2',
                           'scope': 'accepted-only', 'approved': False, 'protectedWords': ['LEGAT'],
                           'candidates': [{'word': w, 'length': len(w), 'approved': False, 'reason': reason}
                                          for w, reason in sorted(policy['acceptedExclusions'].items())]}
    for entry in accepted_candidates['candidates']:
        assert entry['word'] in words['accepted'][str(entry['length'])]
    return {REVIEW / 'word-audit-de-1.json': json.dumps(audit, ensure_ascii=False, separators=(',', ':')) + '\n',
            REVIEW / 'exclusion-candidates-de-2.json': json.dumps(candidates, ensure_ascii=False, indent=2) + '\n',
            REVIEW / 'accepted-exclusion-candidates-de-2.json': json.dumps(accepted_candidates, ensure_ascii=False, indent=2) + '\n',
            ROOT / 'WORD_REVIEW.md': report(words, audit, candidates)}


if __name__ == '__main__':
    for path, content in outputs().items():
        path.write_text(content, encoding='utf-8')
    print('Audit generated. Runtime word lists were not changed.')
