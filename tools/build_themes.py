"""Compile explicit editorial decisions; never classify words by keyword rules."""
import json,re,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def build():
    source=json.loads((ROOT/'data/themes/editorial-themes-1.json').read_text())
    words=json.loads((ROOT/'data/words.js').read_text().split('globalThis.WORDS = ',1)[1].rstrip().removesuffix(';'))
    assert source['baseWordVersion']==words['version'] and source['minimum']==25
    ids=[c['id'] for c in source['categories']]
    assert len(set(ids))==len(ids)
    seen=set()
    for r in source['records']:
        key=(r['category'],r['word'])
        assert key not in seen and r['category'] in ids and r['decision'] in ['approved','review','excluded'] and r['reason']
        seen.add(key)
    cats=[]
    for cat in source['categories']:
        pools={str(n):[] for n in range(4,8)}
        for r in source['records']:
            if r['category']!=cat['id'] or r['decision']!='approved':continue
            w=r['word'];n=r['length']
            assert unicodedata.normalize('NFC',w)==w and re.fullmatch('[A-ZÄÖÜẞ]{4,7}',w) and len(w)==n
            assert w in words['solutions'][str(n)] and w not in ['HUNNI','PESEL','MBIT','HUHNS','MICH']
            assert w not in pools[str(n)]
            pools[str(n)].append(w)
        for pool in pools.values():pool.sort()
        cats.append({**cat,'lengths':[n for n in range(4,8) if len(pools[str(n)])>=source['minimum']],'solutions':pools})
    package={'version':source['version'],'baseWordVersion':source['baseWordVersion'],'minimum':source['minimum'],'categories':cats}
    registry={'current':source['version'],'versions':{source['version']:package}}
    return '/* Explicit editorial themes; de-1 dictionary sources/licenses: WORDLISTS.md. */\n(function(root){const data='+json.dumps(registry,ensure_ascii=False,separators=(',',':'))+';root.ThemePools=data;if(typeof module!=="undefined")module.exports=data;})(globalThis);\n'

if __name__=='__main__':
    (ROOT/'data/themes.js').write_text(build())
    print('Compiled themes-1 from explicit editorial decisions, no global dictionary changes.')
