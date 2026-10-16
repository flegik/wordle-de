"""Reproduce local de-2.5 by adding SÜDPOL to frozen de-2.4."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
text=(root/'data/words-de-2.4.js').read_text()
words=json.loads(text[text.index(' = ')+3:].rstrip(';\n'))
words['version']='de-2.5'
for kind in ('solutions','accepted'):
    assert 'SÜDPOL' not in words[kind]['6']
    words[kind]['6'].append('SÜDPOL')
(root/'data/words-de-2.5.js').write_text('/* Additive local dictionary update; historical packages remain frozen. */\nglobalThis.WORDS_DE_25 = '+json.dumps(words,ensure_ascii=False)+';\n')
