"""Reproducibility and editorial traceability, not a linguistic popularity poll."""
import json,hashlib,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build_themes import build
assert build()==(ROOT/'data/themes.js').read_text()
print('✓ Theme runtime is exactly reproducible from editorial decisions')
source=json.loads((ROOT/'data/themes/editorial-themes-1.json').read_text())
audit=json.loads((ROOT/'data/review/word-audit-de-1.json').read_text())
by_word={r['word']:r for r in audit['records']}
for r in source['records']:
    assert r['decision'] in ['approved','review','excluded'] and r['reason']
    if r['decision']=='approved':
        assert r['word'] in by_word and r['audit']['bestRank']==by_word[r['word']]['usage']['bestRank']
        assert r['audit']['classification']==by_word[r['word']]['classification']
print('✓ All approved decisions retain actual audit evidence and explicit editorial reason')
assert len({(r['category'],r['word']) for r in source['records']})==len(source['records'])
assert {r['category'] for r in source['records']}=={c['id'] for c in source['categories']}
print('✓ Editorial candidates have unique category-word assignments and known IDs')
print('3 theme build/editorial checks passed.')
