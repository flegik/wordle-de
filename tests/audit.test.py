"""Reproducibility and coverage checks, not a claim of human lexical QA."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit_words', ROOT / 'tools/audit_words.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

generated = module.outputs()
for path, expected in generated.items():
    actual = ROOT / 'docs/WORD_REVIEW_DE_1.md' if path.name == 'WORD_REVIEW.md' else path
    assert actual.read_text(encoding='utf-8') == expected, 'Stale audit output: ' + str(path)
print('✓ All four audit outputs reproduce byte-for-byte')
words = module.read_words()
audit = json.loads(generated[ROOT / 'data/review/word-audit-de-1.json'])
candidates = json.loads(generated[ROOT / 'data/review/exclusion-candidates-de-2.json'])
indexed = {r['word']: r for r in audit['records']}
assert len(indexed) == len(audit['records']) == 5574
assert set(indexed) == {w for pool in words['solutions'].values() for w in pool}
assert sum(audit['counts'].values()) == 5574
dictionary_lines = (ROOT / 'data/sources/igerman98.dic').read_text().splitlines()
for r in indexed.values():
    assert r['length'] == len(r['word'])
    assert r['classification'] in ('reject', 'review', 'keep') and r['reasons']
    assert r['sources']['diceware'] or r['sources']['explicitAddition']
    for d in r['sources']['dictionary']:
        line = dictionary_lines[d['line'] - 1]
        assert line.partition('/')[0] == d['entry']
print('✓ Every solution has exactly one classification and real source evidence')
assert candidates['approved'] is False and candidates['scope'] == 'solutions-only'
assert {r['word'] for r in candidates['candidates']} == {w for w, r in indexed.items() if r['classification'] != 'keep'}
assert all(r['approved'] is False for r in candidates['candidates'])
assert indexed['HUNNI']['classification'] == 'reject'
assert indexed['LEGAT']['classification'] == 'keep'
assert 'LEGAT' not in {r['word'] for r in candidates['candidates']}
assert 'HUHNS' not in indexed and 'MICH' not in indexed
assert 'HUHNS' in words['accepted']['5'] and 'MICH' in words['accepted']['4']
assert indexed['LIIEREN']['classification'] == 'keep'
assert indexed['PESEL']['classification'] == 'reject'
assert indexed['PESEN']['classification'] == 'review'
print('✓ Candidates are unapproved; LEGAT protected; examples correctly classified')
for path, digest in audit['inputsSha256'].items():
    assert module.sha(ROOT / path) == digest
# Git blob baseline independently freezes the actual runtime asset.
import hashlib
b = (ROOT / 'data/words.js').read_bytes()
assert hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest() == 'fac0d8bff14b260d7deee041bd6d17838ac89cd1'
assert (ROOT / 'sw.js').read_text().count("const CACHE=PREFIX+'v2-2-release-20261015-a';") == 1
print('✓ Runtime de-1 word bytes and distinct 2.1 release cache version are preserved')
frequency_lines = (ROOT / 'data/review/sources/de_50k.txt').read_text().splitlines()
assert len(frequency_lines) == 50000
for record in audit['records']:
    usage = record['usage']
    assert usage['band'] in ('not-in-top-50000', 'low-subtitle-frequency', 'medium-subtitle-frequency', 'higher-subtitle-frequency')
    assert usage['count'] == sum(t['count'] for t in usage['tokens'])
    for token in usage['tokens']:
        assert frequency_lines[token['rank'] - 1] == token['token'] + ' ' + str(token['count'])
        assert module.normalize(token['token']) == record['word']
accepted = json.loads(generated[ROOT / 'data/review/accepted-exclusion-candidates-de-2.json'])
assert accepted['approved'] is False and accepted['scope'] == 'accepted-only'
assert accepted['candidates'][0]['word'] == 'PESEL' and accepted['candidates'][0]['approved'] is False
assert 'PESEL' in words['accepted']['5']  # still untouched in this phase
assert audit['usageSource']['license'] == 'CC-BY-SA-4.0'
print('✓ All solutions have actual usage evidence; PESEL is separately flagged for guesses')
print('5 audit checks passed.')
