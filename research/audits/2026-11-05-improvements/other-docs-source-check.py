"""Replay independent public reads + gh review/check reads from compact receipt.
Run from repo root: python3 research/audits/2026-11-05-improvements/other-docs-source-check.py
Raw bodies stay in ignored tmp; paid APIs and write methods are never used.
For SDK behavior run other-docs-sdk.mjs with SDK17.4.0 installed externally.
"""
import concurrent.futures,datetime,hashlib,json,pathlib,subprocess
receipt=json.loads(pathlib.Path(__file__).with_name('other-docs-receipt.json').read_text())
out=pathlib.Path('tmp/truth-2026-11-05/docs-independent-replay');out.mkdir(parents=True,exist_ok=True)
def get(url):
 name=hashlib.sha256(url.encode()).hexdigest()[:16];p=out/(name+'.body')
 r=subprocess.run(['curl','-sSL','--retry','2','--max-time','60','-o',str(p),'-w','%{http_code}',url],capture_output=True,text=True)
 return {'url':url,'status':r.stdout,'exit':r.returncode,'sha256':hashlib.sha256(p.read_bytes()).hexdigest() if p.exists()else None,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as ex:rows=list(ex.map(get,sorted(set(x['url']for x in receipt['sources']))))
(out/'http.json').write_text(json.dumps(rows,indent=2))
for item in receipt['upstream']:
 n=item['pr'].rsplit('/',1)[1];paths=[f'pulls/{n}',f'pulls/{n}/reviews',f'pulls/{n}/files?per_page=100',f'issues/{n}/comments?per_page=100']
 for i in item['issues']:paths.extend([f"issues/{i['url'].rsplit('/',1)[1]}",f"issues/{i['url'].rsplit('/',1)[1]}/comments?per_page=100"])
 pr=json.loads(subprocess.check_output(['gh','api',f'repos/stellar/stellar-docs/pulls/{n}']))
 paths.append(f"commits/{pr['head']['sha']}/check-runs")
 values={p:json.loads(subprocess.check_output(['gh','api','repos/stellar/stellar-docs/'+p]))for p in paths}
 (out/(item['id']+'.json')).write_text(json.dumps(values,indent=2))
print(f'Replayed {len(rows)} public URLs and {len(receipt["upstream"])} upstream sets; output {out}')
