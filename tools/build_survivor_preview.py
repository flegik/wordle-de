"""Build an isolated static Survivor preview, without production duel API access."""
import ast
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def build(destination):
    destination = Path(destination).resolve()
    if destination == ROOT or ROOT in destination.parents:
        raise ValueError('Preview must be outside the source repository.')
    destination.mkdir(parents=True, exist_ok=True)
    source = (ROOT / 'sw.js').read_text()
    paths = ast.literal_eval('[' + re.search(r'ASSETS=\[(.*?)\]\.map', source)[1] + ']')
    for name in paths:
        if name == './':
            continue
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, target)
    for name in ['LICENSE', 'WORDLISTS.md']:
        shutil.copyfile(ROOT / name, destination / name)
    if (ROOT / 'licenses').exists():
        shutil.copytree(ROOT / 'licenses', destination / 'licenses', dirs_exist_ok=True)
    (destination / 'js/online-config.js').write_text("globalThis.WORDLE_ONLINE_API='';\nglobalThis.WORDLE_TEST_VERSION=true;\nglobalThis.WORDLE_TEST_LABEL='SURVIVOR 2.2 TEST';\n")
    app = (destination / 'js/app.js').read_text()
    app = re.sub(r'<button class="mode-card" data-action="start" data-mode="online">.*?</button>', '', app)
    (destination / 'js/app.js').write_text(app)
    (destination / 'sw.js').write_text(source.replace('v2-2-1-release-20261016-a', 'v2-2-survivor-test-a'))
    print(f'Network-isolated Survivor preview: {destination}; {len(paths)} offline assets.')
if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python tools/build_survivor_preview.py /absolute/site/dist')
    build(sys.argv[1])
