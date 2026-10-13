#!/usr/bin/env python3
"""Exercise the actual CLI merge's missing/duplicate/mixed-run rejection."""
import json,subprocess,tempfile,pathlib,shutil
root=pathlib.Path(__file__).resolve().parent.parent
reports=list((root/'results/shards').glob('*.json'))
assert len(reports)>=2
for case in ['missing','duplicate','mixed-run']:
 with tempfile.TemporaryDirectory(prefix='worker-lab-merge-') as tmp:
  tmp=pathlib.Path(tmp)
  chosen=reports[:-1] if case=='missing' else reports
  for i,p in enumerate(chosen): shutil.copy(p,tmp/f'{i}.json')
  if case=='duplicate': shutil.copy(reports[0],tmp/'duplicate.json')
  if case=='mixed-run':
   p=tmp/'0.json';d=json.loads(p.read_text());d['shard']['plan']['runId']='different-run';p.write_text(json.dumps(d))
  done=subprocess.run([str(root/'scripts/box'),'testbox','merge',f'directory={tmp}'],cwd=root,text=True,capture_output=True)
  assert done.returncode!=0 and 'Cannot combine CI results' in done.stdout+done.stderr,(case,done.stdout,done.stderr)
  print(case+': correctly rejected by real CLI')
