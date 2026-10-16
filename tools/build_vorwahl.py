"""Reproduce the additive local de-2.4 package from frozen de-2.3."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
text=(root/'data/words-de-2.3.js').read_text()
words=json.loads(text[text.index(' = ')+3:].rstrip(';\n'))
words['version']='de-2.4'
for kind in ('solutions','accepted'):
    assert 'VORWAHL' not in words[kind]['7']
    words[kind]['7'].append('VORWAHL')
(root/'data/words-de-2.4.js').write_text('/* Additive local dictionary update; historical packages remain frozen. */\nglobalThis.WORDS_DE_24 = '+json.dumps(words,ensure_ascii=False)+';\n')
