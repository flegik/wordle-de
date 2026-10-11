"""Reproducible de-2 subset and complete provisional class index; no downloads."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'data'
def read_words(path):
    text=path.read_text();return json.loads(text[text.index('{'):text.rindex(';')])
def outputs():
    base=(D/'words.js').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(base)).encode()+b'\0'+base).hexdigest()=='fac0d8bff14b260d7deee041bd6d17838ac89cd1'
    old=read_words(D/'words.js');policy=json.loads((D/'quality/policy-de-2.json').read_text());audit=json.loads((D/'review/word-audit-de-1.json').read_text())
    solution={w for a in old['solutions'].values() for w in a};accepted={w for a in old['accepted'].values() for w in a}
    assert set(policy['excludeSolutions'])<=solution and set(policy['excludeAccepted'])<=accepted
    assert not set(policy['protected'])&set(policy['excludeSolutions'])
    new={'version':'de-2','solutions':{n:[w for w in a if w not in policy['excludeSolutions']] for n,a in old['solutions'].items()},'accepted':{n:[w for w in a if w not in policy['excludeAccepted']] for n,a in old['accepted'].items()}}
    groups=json.loads((D/'review/editorial-rules.json').read_text())['reviewGroups'];flagged={w for g in groups for w in g['words'].split()}
    classes={};pending=[]
    for r in audit['records']:
        w=r['word']
        if w in policy['excludeSolutions']:continue
        signal=r['usage']['bestRank'] is not None and r['usage']['bestRank']<=policy['accessibleSignal']['maxSubtitleRank'] and any(d['standalone'] for d in r['sources']['dictionary']) and w not in flagged
        classes[w]=policy['classes'].get(w,'A' if signal else 'B')
        if not signal and w not in policy['classes']:pending.append(w)
    assert set(classes)=={w for a in new['solutions'].values() for w in a}
    assert all(w in new['solutions'][str(len(w))] for w in policy['protected'])
    q={'version':policy['version'],'wordVersion':'de-2','classes':classes,'provisional':True,'pendingReview':pending,'policy':'data/quality/policy-de-2.json','auditSha256':hashlib.sha256((D/'review/word-audit-de-1.json').read_bytes()).hexdigest()}
    return {D/'quality/manual-review-de-2.txt':'# Provisional B words requiring manual familiarity/gameplay review. Not approved exclusions.\n'+'\n'.join(pending)+'\n',D/'words-de-1.js':base.decode(),D/'words-de-2.js':'/* Derived dictionaries retain their original licenses. See WORDLISTS.md. */\nglobalThis.WORDS_DE_2 = '+json.dumps(new,ensure_ascii=False)+';\n',D/'word-quality.js':'/* Gameplay classes are provisional estimates; source/limits in docs/WORD_QUALITY.md. */\nglobalThis.WordQuality = '+json.dumps(q,ensure_ascii=False)+';\n'}
if __name__=='__main__':
    for path,text in outputs().items():path.write_text(text)
    print('de-2 and unchanged de-1 archive reproduced.')
