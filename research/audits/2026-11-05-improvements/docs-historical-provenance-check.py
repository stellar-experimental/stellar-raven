# Read-only immutable hash reconciliation; run from repository root.
import json,pathlib,subprocess,re,hashlib
p='research/audits/2026-11-03-qa-followup/case-dispositions.json'
now=json.load(open(p));old=json.loads(subprocess.check_output(['git','show','fec1c79f3ae4e4210e7d988c3aff40cda9928482:'+p]))
def walk(x,at=()):
 if isinstance(x,dict):
  if 'path' in x and ('sha256' in x or 'snapshotSha256' in x):yield at,x
  for k,v in x.items():yield from walk(v,at+(k,))
 elif isinstance(x,list):
  for i,v in enumerate(x):yield from walk(v,at+(i,))
base=dict(walk(old));rows=[]
for loc,x in walk(now):
 url=x['path'];m=re.match(r'https://github.com/[^/]+/[^/]+/blob/([0-9a-f]{40})/(.+)',url)
 if not m:continue
 sha,file=m.groups();blob=subprocess.check_output(['git','show',sha+':'+file]);actual=hashlib.sha256(blob).hexdigest();before=base[loc]
 checks={'snapshotMatches':actual==x.get('snapshotSha256',x.get('sha256')),'originalHashPreserved':x.get('capturedSha256',x.get('sha256'))==before['sha256'],'ancestor':subprocess.run(['git','merge-base','--is-ancestor',sha,'origin/main']).returncode==0}
 revisions=[]
 if 'capturedSha256' in x:
  checks['limitationExplicit']='not byte-exact proof' in x['snapshotNote'] and 'sha256' not in x
  for rev in subprocess.check_output(['git','log','origin/main','--format=%H','--',file],text=True).splitlines():
   result=subprocess.run(['git','show',rev+':'+file],capture_output=True)
   if result.returncode==0:revisions.append(hashlib.sha256(result.stdout).hexdigest())
  checks['noSurvivingMatch']=x['capturedSha256'] not in revisions
 rows.append({'id':x.get('id'),'location':list(loc),'url':url,'checks':checks,'unavailableOriginal':'capturedSha256' in x})
pathlib.Path('tmp/truth-2026-11-05/docs/retirement').mkdir(parents=True,exist_ok=True)
pathlib.Path('tmp/truth-2026-11-05/docs/retirement/provenance.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps({'objects':len(rows),'uniqueIds':len(set(r['id'] for r in rows)),'unavailableIds':sorted(set(r['id'] for r in rows if r['unavailableOriginal'])),'failures':[(r['id'],k) for r in rows for k,v in r['checks'].items() if not v]}))
