#!/usr/bin/env python3
import time,urllib.request,json
for attempt in range(60):
 try:
  with urllib.request.urlopen('http://127.0.0.1:8642/tests/runner.parallel.bxm?action=capabilities',timeout=2) as r:
   d=json.load(r);assert d['workers'] and d['cancellation'];print('Ready: native worker capabilities');break
 except Exception:
  time.sleep(1)
else: raise SystemExit('Owned demo server was not ready within 60 seconds')
