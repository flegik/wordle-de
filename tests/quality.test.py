"""Offline reproducibility; no claim of human word familiarity certification."""
import importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('quality',ROOT/'tools/build_quality.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for p,text in m.outputs().items():assert p.read_text()==text,p
print('✓ de-2, frozen de-1 and quality index reproduce byte-for-byte')
old=m.read_words(ROOT/'data/words.js');new=m.read_words(ROOT/'data/words-de-2.js');q=m.read_words(ROOT/'data/word-quality.js')
assert sum(map(len,new['solutions'].values()))==5568
assert sum(map(len,new['accepted'].values()))==15138
assert {w for n in old['solutions'] for w in old['solutions'][n] if w not in new['solutions'][n]}=={'HUNNI','MUMPS','COUP','CLOU','MBIT','PESEL'}
assert {w for n in old['accepted'] for w in old['accepted'][n] if w not in new['accepted'][n]}=={'PESEL'}
print('✓ Only six authorized solutions and one authorized guess removed')
for n,words in new['solutions'].items():
 assert len(words)==len(set(words));assert all(len(w)==int(n) and w in new['accepted'][n] and q['classes'][w] in 'ABC' for w in words)
assert q['classes']['LEGAT']=='C' and q['classes']['MONARCH']==q['classes']['ZWINGE']=='B'
assert 'HUHNS' in new['accepted']['5'] and 'HUHNS' not in new['solutions']['5']
assert 'MICH' in new['accepted']['4'] and 'MICH' not in new['solutions']['4']
print('✓ Complete valid class coverage; protected words and accepted-only forms survive')
assert q['provisional'] is True and len(q['pendingReview'])==3195
assert (ROOT/'data/words-de-1.js').read_bytes()==(ROOT/'data/words.js').read_bytes()
print('✓ Uncertain classifications stay explicitly provisional; de-1 archive unchanged')
print('4 quality checks passed.')
