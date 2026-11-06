"""Read-only active Docs finding / linked PR / inbound handoff inventory.
Run: python3 research/audits/2026-11-06-remaining-sweep/docs-github.py
Public GitHub receipts go to tmp/sweep-2026-11-06/docs; no GitHub mutation.
"""
import pathlib,json,re,subprocess,concurrent.futures,datetime,yaml
out=pathlib.Path('tmp/sweep-2026-11-06/docs');out.mkdir(parents=True,exist_ok=True)
def gh(endpoint):
 p=subprocess.run(['gh','api',endpoint],capture_output=True,text=True)
 if p.returncode: return {'_error':p.stderr.strip(),'endpoint':endpoint}
 return json.loads(p.stdout)
def save(name,data): (out/name).write_text(json.dumps(data,indent=2)+'\n')
files=sorted(pathlib.Path('improvements/stellar-docs').glob('*.md'))+list(pathlib.Path('improvements/skills').glob('sk-038*.md'))
rows=[];refs=set()
for p in files:
 text=p.read_text(); fm={k:re.search(r'^'+k+r': (.+)$',text,re.M)[1] for k in ['id','status']}; urls=sorted(set(re.findall(r'https://github.com/([^/\s]+/[^/\s]+)/(?:issues|pull)/(\d+)',text)))
 refs.update(urls);rows.append({'id':fm['id'],'file':str(p),'status':fm['status'],'refs':['https://github.com/'+r+'/issues/'+n for r,n in urls],'text':text})
save('inventory.json',rows)
# Enumerate all currently open upstream PRs, not only references already in files.
for repo,kind in [('stellar/stellar-docs','pulls'),('stellar-experimental/stellar-raven','issues')]:
 allrows=[]
 for page in range(1,10):
  batch=gh(f'repos/{repo}/{kind}?state=open&per_page=100&page={page}')
  if not isinstance(batch,list):raise RuntimeError(batch)
  allrows+=batch
  if len(batch)<100:break
 save(repo.split('/')[-1]+'-open-'+kind+'.json',allrows)
 if kind=='pulls': refs.update((repo,str(x['number'])) for x in allrows)
 else: refs.update((repo,str(x['number'])) for x in allrows if 'pull_request' not in x and ('upstream' in x['title'].lower() or re.search(r'\bsd-\d+|sk-038',x.get('body') or '')))
# Original ledgers contain pending PR references not repeated in finding frontmatter.
prior=pathlib.Path('.agents/rounds/2026-11-05-truth-maintenance/docs.md').read_text()
for row in rows:
 line=next((x for x in prior.splitlines() if x.startswith('| '+row['id']+':')),'')
 for repo,num in re.findall(r'https://github.com/([^/\s]+/[^/\s]+)/(?:issues|pull)/(\d+)',line):refs.add((repo,num))
 row['priorRow']=line
save('inventory.json',rows)
def read_ref(ref):
 repo,num=ref; issue=gh(f'repos/{repo}/issues/{num}'); comments=gh(f'repos/{repo}/issues/{num}/comments?per_page=100');timeline=gh(f'repos/{repo}/issues/{num}/timeline?per_page=100')
 x={'repo':repo,'number':int(num),'issue':issue,'comments':comments,'timeline':timeline,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 if 'pull_request' in issue:
  x['pr']=gh(f'repos/{repo}/pulls/{num}');x['reviews']=gh(f'repos/{repo}/pulls/{num}/reviews?per_page=100');x['reviewComments']=gh(f'repos/{repo}/pulls/{num}/comments?per_page=100')
  sha=x['pr'].get('head',{}).get('sha')
  if sha:x['checks']=gh(f'repos/{repo}/commits/{sha}/check-runs?per_page=100');x['statuses']=gh(f'repos/{repo}/commits/{sha}/status')
 save(repo.replace('/','_')+'-'+num+'.json',x); return x
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(read_ref,sorted(refs)))
linked=set()
for x in results:
 for t in x['timeline'] if isinstance(x['timeline'],list) else []:
  u=t.get('source',{}).get('issue',{}).get('html_url','');m=re.match(r'https://github.com/([^/]+/[^/]+)/pull/(\d+)',u)
  if m:linked.add((m[1],m[2]))
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:results+=list(pool.map(read_ref,sorted(linked-refs)))
summary=[]
for x in results:
 i=x['issue'];p=x.get('pr'); comments=x['comments'] if isinstance(x['comments'],list)else[]
 summary.append({'url':i.get('html_url'),'title':i.get('title'),'author':i.get('user',{}).get('login'),'state':'merged' if p and p.get('merged') else i.get('state'),'state_reason':i.get('state_reason'),'updatedAt':i.get('updated_at'),'head':p.get('head',{}).get('sha') if p else None,'mergeable_state':p.get('mergeable_state') if p else None,'draft':p.get('draft') if p else None,'reviews':[{'author':r['user']['login'],'state':r['state'],'submitted_at':r['submitted_at'],'body':r['body']}for r in x.get('reviews',[]) if isinstance(r,dict) and 'user'in r],'checks':[{'name':r['name'],'conclusion':r['conclusion'],'status':r['status']}for r in x.get('checks',{}).get('check_runs',[])],'latestComments':[{'author':c['user']['login'],'at':c['updated_at'],'url':c['html_url'],'body':c['body']}for c in comments[-3:]],'linkedRefs':[t.get('source',{}).get('issue',{}).get('html_url')for t in x['timeline'] if isinstance(t,dict) and t.get('source',{}).get('issue',{}).get('html_url')] if isinstance(x['timeline'],list) else []})
save('github-summary.json',summary)
print(json.dumps({'findings':len(rows),'refs':len(results),'errors':[x for x in results if '_error'in x['issue']]}))
