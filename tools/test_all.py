"""One dependency-free command for all Phase-6 automated checks."""
import subprocess
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
for file in ['js/engine.js', 'js/sessions.js', 'js/double.js', 'js/double-ui.js', 'js/tower.js', 'js/tower-ui.js', 'js/speedrun.js', 'js/speedrun-ui.js', 'data/themes.js', 'js/theme.js', 'js/theme-ui.js', 'js/duel-links.js', 'js/duel.js', 'js/duel-ui.js', 'js/storage.js', 'js/app.js', 'sw.js']:
    subprocess.run(['node', '--check', file], cwd=ROOT, check=True)
for file in ['tests/engine.test.cjs', 'tests/app.test.cjs', 'tests/sw.test.cjs',
             'tests/double.test.cjs', 'tests/double-app.test.cjs', 'tests/tower.test.cjs', 'tests/tower-app.test.cjs', 'tests/speedrun.test.cjs', 'tests/speedrun-app.test.cjs', 'tests/duel.test.cjs', 'tests/duel-app.test.cjs', 'tests/theme.test.cjs', 'tests/theme-app.test.cjs', 'tests/storage.test.cjs', 'tests/app-storage.test.cjs']:
    subprocess.run(['node', file], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/themes-build.test.py'], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/audit.test.py'], cwd=ROOT, check=True)
print('All Phase-6 checks passed; no browser/device certification implied.')
