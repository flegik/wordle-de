"""One dependency-free command for all Phase-7 automated checks."""
import subprocess
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
for file in ['online/index.mjs','online/worker.mjs','js/online-config.js','js/online-duel.js','js/results.js','js/result-image.js','js/reports.js', 'js/sync.js', 'js/selection.js', 'data/word-registry.js', 'data/word-quality.js', 'data/words-de-2.js', 'js/engine.js', 'js/sessions.js', 'js/double.js', 'js/double-ui.js', 'js/tower.js', 'js/tower-ui.js', 'js/speedrun.js', 'js/speedrun-ui.js', 'data/themes.js', 'js/theme.js', 'js/theme-ui.js', 'js/duel-links.js', 'js/duel.js', 'js/duel-ui.js', 'js/storage.js', 'js/app.js', 'sw.js']:
    subprocess.run(['node', '--check', file], cwd=ROOT, check=True)
for file in ['tests/double-lengths.test.cjs','tests/online-service.test.cjs','tests/online-client.test.cjs','tests/release-upgrade.test.cjs','tests/sw-failure.test.cjs','tests/phase8.test.cjs','tests/phase7.test.cjs', 'tests/engine.test.cjs', 'tests/app.test.cjs', 'tests/sw.test.cjs',
             'tests/double.test.cjs', 'tests/double-app.test.cjs', 'tests/tower.test.cjs', 'tests/tower-app.test.cjs', 'tests/speedrun.test.cjs', 'tests/speedrun-app.test.cjs', 'tests/duel.test.cjs', 'tests/duel-app.test.cjs', 'tests/theme.test.cjs', 'tests/theme-app.test.cjs', 'tests/storage.test.cjs', 'tests/app-storage.test.cjs']:
    subprocess.run(['node', file], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/themes-build.test.py'], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/audit.test.py'], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/quality.test.py'], cwd=ROOT, check=True)
subprocess.run([sys.executable, 'tests/phase8-quality.test.py'], cwd=ROOT, check=True)
print('All Phase-8 checks passed; no browser/device certification implied.')
