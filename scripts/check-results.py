#!/usr/bin/env python3
"""Assert full application coverage in a native TestBox JSON result."""
import json,sys
from pathlib import Path
p=Path(sys.argv[1]);d=json.loads(p.read_text())
assert d['totalPass']==32 and d['totalFail']==0 and d['totalError']==0 and d['totalSkipped']==0, d
actual={b['path'] for b in d['bundleStats']}
expected={'tests.specs.'+p.stem for p in Path('tests/specs').glob('*Spec.bx')}
assert actual==expected and len(d['bundleStats'])==8,(actual,expected)
if 'parallel' in d:
 assert d['passed'] and d['parallel']['coverageMatched'] and not d['parallel']['cancelled'] and not d['parallel']['errors'],d['parallel']
if 'sharding' in d or 'SHARDING' in d: assert d.get('passed',d.get('PASSED')),d
print(f'{p}: 32 passes, 8 exact bundles, no failures/errors/skips')
