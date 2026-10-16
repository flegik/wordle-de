"""Byte reproducibility and exact deltas; no network or dictionary guesswork."""
import importlib.util,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('quality221',R/'tools/build_quality_v2_2_1.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
for path,text in b.outputs().items():assert path.read_text()==text,path
old=b.read(R/'data/words-de-2.2.js');new=b.read(R/'data/words-de-2.3.js');q=b.read(R/'data/word-quality.js');ledger=json.loads((R/'data/quality/v2-2-1/review.json').read_text())
assert q['wordVersion']==new['version']=='de-2.3' and q['version']=='quality-4'
assert set(q['classes'])==set(sum(new['solutions'].values(),[]))
for n in ['4','5','6','7']:
 assert set(new['accepted'][n])-set(old['accepted'][n])==({'NUTZUNG'} if n=='7' else set())
 assert set(old['accepted'][n])<=set(new['accepted'][n])
 assert len(new['accepted'][n])==len(set(new['accepted'][n]))
 for word in new['solutions'][n]:assert len(word)==int(n) and word in new['accepted'][n]
 assert ledger['before'][n]==len(old['solutions'][n]) and ledger['after'][n]==len(new['solutions'][n])
assert q['classes']['NUTZUNG']=='A' and q['classes']['TAPIR']=='B'
assert sum(len(a) for a in old['solutions'].values())==5400
assert sum(len(a) for a in new['solutions'].values())==5247
print('4 quality-2.2.1 build groups passed: reproducibility, exact guess delta, complete normalized class coverage, pool counts.')
