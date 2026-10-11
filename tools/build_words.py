"""Rebuild offline dictionaries with Python 3; no network or packages required."""
import json
import re
import unicodedata
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data' / 'sources'
def normalize(word):
    return unicodedata.normalize('NFC', word).replace('ß', 'ẞ').upper()
def valid(word):
    return bool(re.fullmatch('[A-ZÄÖÜẞ]{4,7}', word))
solutions = {normalize(w.strip()) for w in (SOURCE/'diceware.txt').read_text().splitlines()}
solutions = {w for w in solutions if valid(w)}
additions = 'Legat Ähre Ähren Ärzte Ärztin Ärger ärgern Ölkrug Öfen öfter Übung üben Süden süß süße süßen grüß grüße grüßen Größe Größen Straße Straßen Fuß Füße Fußweg außen außer heißen heißt weiß weiße weißen größer größte Küche Küchen Käse Käfig Löwe Löwen Bär Bären Büro Büros Tür Türen fünf zwölf müde mögen möchte zählen fühlen führen hören Hütte Hütten Gärten Garten Hände Wärme Wolke Regen Segel'.split()
solutions |= {normalize(w) for w in additions if valid(normalize(w))}
solutions -= set('ADAPTER ADVERB ADJUNKT ABDOMEN ABDUKT ACETAT ACETON ACRYL AGNAT AKRONYM ALBEDO ALGE ALKAN ALKEN ALKIN ANODE AORIST APHEL ARSEN AXIOM MAGGI'.split())
accepted = set(solutions)
for name in ('other-words.json', 'target-words.json'):
    data = json.loads((SOURCE/name).read_text())
    accepted |= {normalize(w) for w in (data['data'] if isinstance(data, dict) else data) if valid(normalize(w))}
# Hunspell base forms only. Do not admit forbidden, compound-only, or affix-only stems.
for line in (SOURCE/'igerman98.dic').read_text().splitlines():
    entry, _, flags = line.partition('/')
    word = normalize(entry.strip())
    if valid(word) and not set(flags).intersection('doh'):
        accepted.add(word)
output = {'version': 'de-1', 'solutions': {str(n): sorted(w for w in solutions if len(w) == n) for n in range(4,8)}, 'accepted': {str(n): sorted(w for w in accepted if len(w) == n) for n in range(4,8)}}
(ROOT/'data'/'words.js').write_text('/* Accepted dictionary data includes GPL-2.0 OR GPL-3.0 igerman98 material. See licenses and WORDLISTS.md. */\nglobalThis.WORDS = '+json.dumps(output, ensure_ascii=False)+';\n')
print('Solutions:', {n: len(v) for n,v in output['solutions'].items()})
print('Accepted:', {n: len(v) for n,v in output['accepted'].items()})
