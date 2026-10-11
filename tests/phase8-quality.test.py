import importlib.util,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('builder',R/'tools/build_quality_v2.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
for p,text in b.outputs().items():assert p.read_text()==text,p
old=b.read(R/'data/words-de-2.js');new=b.read(R/'data/words-de-2.1.js');q=b.read(R/'data/word-quality.js');review=json.loads((R/'data/quality/phase8/review.json').read_text())
assert len(review['records'])==5568 and len({r['word'] for r in review['records']})==5568
assert new['accepted']==old['accepted']
assert all(r['reasonId']<len(review['reasons']) for r in review['records'])
assert sum(len(a) for a in new['solutions'].values())==5405
assert q['classes']['LEGAT']=='C' and q['classes']['MONARCH']=='B' and q['classes']['ZWINGE']=='B'
for w in ['HUNNI','MUMPS','COUP','CLOU','MBIT','PESEL','HUHNS','MICH','DUDEN','TARZAN']:assert w not in q['classes']
assert 'PESEL' not in new['accepted']['5'] and 'LEGAT' in new['accepted']['5']
assert q['reviewStatus']=='ai-editorial' and len(review['reasons'])>4
print('3 Phase-8 quality groups passed: reproducibility, complete ledger, protected compatibility.')
