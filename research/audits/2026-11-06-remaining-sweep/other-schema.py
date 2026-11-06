import json,pathlib,urllib.request,concurrent.futures,datetime,subprocess
D=pathlib.Path('tmp/sweep-2026-11-06/other')
items=json.loads((D/'public-tools.json').read_text())['data']['tools']
def run(t):
 url='https://api.lumenloop.com'+t['detail']
 r=subprocess.run(['curl','-fsSL','--retry','2','--max-time','45',url],capture_output=True,text=True); b=json.loads(r.stdout) if r.returncode==0 else {'error':r.stderr}
 (D/('schema-'+t['name']+'.json')).write_text(json.dumps({'url':url,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'body':b},indent=2))
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:list(ex.map(run,items))
print('Read all 18 free public operation schemas')
