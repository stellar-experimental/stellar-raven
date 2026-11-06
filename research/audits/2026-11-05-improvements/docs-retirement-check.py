# Read-only mechanical review of the twenty approved 2026-11-05 Docs retirements.
# Run from repository root; needs git, gh read access and public HTTPS. No live-trigger rerun.
import json,pathlib,subprocess,re,hashlib,concurrent.futures,urllib.request,time
root=pathlib.Path('.')
out=root/'tmp/truth-2026-11-05/docs/retirement'
out.mkdir(parents=True,exist_ok=True)
ids=set('sd-060 sd-063 sd-065 sd-066 sd-067 sd-068 sd-069 sd-071 sd-073 sd-078 sd-079 sd-080 sd-082 sd-083 sd-084 sd-085 sd-086 sd-087 sd-089 sd-094'.split())
ledger=json.loads((root/'improvements/resolved.json').read_text())['entries']
notification_numbers=dict(zip('sd-060 sd-063 sd-065 sd-066 sd-067 sd-068 sd-071 sd-073 sd-078 sd-080 sd-083 sd-084 sd-085 sd-086 sd-087 sd-069 sd-079 sd-094 sd-089'.split(),[362,363,364,365,379,376,366,367,375,369,370,371,372,378,373,377,368,361,374]))
batches=[{'id':e['id'],'file':e['sourceUrl'].split('/blob/')[1].split('/',1)[1],'liveRecheck':e['liveRecheck'],'reviewEvidence':e['reviewEvidence'],'upstreamRefs':e['upstreamRefs'],'resolvingPRs':e['resolvingRefs'],'notifications':[f'https://github.com/stellar-experimental/stellar-raven/issues/{notification_numbers[e["id"]]}'] if e['id'] in notification_numbers else []} for e in ledger if e['id'] in ids]
assert len(batches)==20
intake=json.loads((root/'improvements/intake.json').read_text())['findings']
def git(*args):return subprocess.check_output(['git',*args],stderr=subprocess.DEVNULL)
def gh(path):return json.loads(subprocess.check_output(['gh','api',path],stderr=subprocess.DEVNULL))
def fetch(url):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'truth-maintenance-independent-review'}),timeout=30) as r:return r.status,r.read()
  except Exception:
   if attempt==2:raise
   time.sleep(1)
def check(r):
 id=r['id'];e=next(e for e in ledger if e['id']==id)
 checks={'oneReceipt':sum(e['id']==id for e in ledger)==1,'fileAbsent':not pathlib.Path(r['file']).exists(),'intakeAbsent':id not in intake,'liveRecheckExact':r['liveRecheck']==e['liveRecheck'],'reviewEvidence':r['reviewEvidence'] in e['reviewEvidence'],'resolvingRefs':set(e['resolvingRefs'])==set(r['resolvingPRs']),'upstreamRefs':set(r['upstreamRefs']).issubset(e['upstreamRefs']),'service':e['service']=='stellar-docs','date':e['resolved']=='2026-11-06'}
 source=git('show',e['sourceCommit']+':'+r['file']);checks['sourceId']=bool(re.search(r'^id:\s*'+id+r'\s*$',source.decode(),re.M));checks['sourceAncestor']=subprocess.run(['git','merge-base','--is-ancestor',e['sourceCommit'],'origin/main']).returncode==0
 raw=e['sourceUrl'].replace('https://github.com/','https://raw.githubusercontent.com/').replace('/blob/','/')
 status,body=fetch(raw);checks['sourceHttp200']=status==200;checks['sourceBytes']=body==source
 checks['sourceUrl']=e['sourceUrl'].endswith('/blob/'+e['sourceCommit']+'/'+r['file'])
 comments=[]
 for ref in e['upstreamRefs']:
  m=re.match(r'https://github.com/([^/]+/[^/]+)/(?:issues|pull)/(\d+)',ref)
  rows=gh(f'repos/{m[1]}/issues/{m[2]}/comments?per_page=100')
  matches=[c for c in rows if id in c['body'] and e['sourceUrl'] in c['body'] and e['liveRecheck'] in c['body']]
  comments.append({'ref':ref,'matchingComments':[c['html_url'] for c in matches]})
 checks['commentsReadback']=all(c['matchingComments'] for c in comments)
 notifications=[]
 for ref in r['notifications']:
  m=re.match(r'https://github.com/([^/]+/[^/]+)/issues/(\d+)',ref);n=gh(f'repos/{m[1]}/issues/{m[2]}');notifications.append({'url':ref,'state':n['state']})
 checks['notificationsClosed']=all(n['state']=='closed' for n in notifications)
 return {'id':id,'checks':checks,'sourceUrl':e['sourceUrl'],'sourceSha256':hashlib.sha256(source).hexdigest(),'comments':comments,'notifications':notifications}
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for x in pool.map(check,batches):results.append(x)
(out/'receipts.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'count':len(results),'failures':[{r['id']:[k for k,v in r['checks'].items() if not v]} for r in results if not all(r['checks'].values())]}))
