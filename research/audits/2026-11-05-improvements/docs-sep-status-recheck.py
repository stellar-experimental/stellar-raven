"""Read-only comparison of every SEP table row with its current public preamble."""
import concurrent.futures
import hashlib
import json
import re
import urllib.request
from datetime import datetime, timezone

BASE = 'https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/'
def read(name):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(BASE + name, timeout=45) as response:
                body = response.read()
            return body.decode(), hashlib.sha256(body).hexdigest()
        except Exception:
            if attempt == 2:
                raise

readme, readme_hash = read('README.md')
rows = []
for line in readme.splitlines():
    match = re.search(r'\]\((sep-\d+\.md)\)', line)
    if match:
        rows.append((match[1], line.split('|')[-2].strip()))

def compare(row):
    name, expected = row
    body, digest = read(name)
    match = re.search(r'^Status:\s*([^\n]+)', body, re.M)
    actual = match[1].split(' (')[0].strip() if match else None
    return {'url': BASE + name, 'table': expected, 'preamble': actual,
            'match': expected == actual, 'sha256': digest}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(compare, rows))
print(json.dumps({'observedAt': datetime.now(timezone.utc).isoformat(),
                  'readme': BASE + 'README.md', 'readmeSha256': readme_hash,
                  'rows': len(results),
                  'mismatches': [r for r in results if not r['match']],
                  'results': results}, indent=2))
if any(not row['match'] for row in results):
    raise SystemExit(1)
