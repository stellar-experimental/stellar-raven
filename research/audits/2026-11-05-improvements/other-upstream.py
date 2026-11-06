import pathlib,re,json,subprocess,concurrent.futures,time
D=pathlib.Path('tmp/truth-2026-11-05/other'); files=sorted(p for c in ['lumenloop','skills','canonical-source','workers-ai-provider'] for p in pathlib.Path('improvements',c).glob('*.md'))
refs={}; inventory=[]
for p in files:
 s=p.read_text(); fid=re.search(r'^id: (.+)',s,re.M)[1]; urls=sorted(set(re.findall(r'https://github.com/([\w.-]+/[\w.-]+)/(?:issues|pull)/(\d+)',s)))
 inventory.append({'id':fid,'file':str(p),'refs':['/'.join(u) for u in urls]})
 for repo,n in urls: refs[(repo,n)]=1
refs[('stellar-experimental/stellar-raven','358')]=1
(D/'inventory.json').write_text(json.dumps(inventory,indent=2))
def gh(path):
 for attempt in range(3):
  r=subprocess.run(['gh','api',path],capture_output=True,text=True)
  if r.returncode==0:return json.loads(r.stdout)
 return {'error':r.stderr.strip()}
def fetch(ref):
 repo,n=ref; base=f'repos/{repo}/issues/{n}'; issue=gh(base); comments=gh(base+'/comments?per_page=100'); timeline=gh(base+'/timeline?per_page=100')
 out={'repo':repo,'number':n,'issue':issue,'comments':comments,'timeline':timeline}
 if 'pull_request' in issue:
  p=gh(f'repos/{repo}/pulls/{n}'); out['pr']=p; out['reviews']=gh(f'repos/{repo}/pulls/{n}/reviews?per_page=100'); out['reviewComments']=gh(f'repos/{repo}/pulls/{n}/comments?per_page=100')
  if 'head' in p:out['checks']=gh(f'repos/{repo}/commits/{p["head"]["sha"]}/check-runs?per_page=100'); out['statuses']=gh(f'repos/{repo}/commits/{p["head"]["sha"]}/status')
 (D/(repo.replace('/','_')+'_'+n+'.json')).write_text(json.dumps(out,indent=2))
 return out
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:results=list(ex.map(fetch,refs))
# Inspect any linked PRs referenced through timeline or body/comments, excluding known refs.
linked=set()
for r in results:
 for x in (r['timeline'] if isinstance(r['timeline'],list) else []):
  i=x.get('source',{}).get('issue',{}); u=i.get('html_url',''); m=re.match(r'https://github.com/([^/]+/[^/]+)/pull/(\d+)',u)
  if m:linked.add(m.groups())
 for m in re.finditer(r'https://github.com/([\w.-]+/[\w.-]+)/pull/(\d+)',json.dumps([r['issue'].get('body',''),r['comments']])):linked.add(m.groups())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:results+=list(ex.map(fetch,linked-set(refs)))
inbound=gh('repos/stellar-experimental/stellar-raven/issues?state=all&labels=upstream-ready&per_page=100'); (D/'inbound.json').write_text(json.dumps(inbound,indent=2))
lines=[]
for r in results:
 i=r['issue']; lines.append({'ref':i.get('html_url',r['repo']+'/'+r['number']),'state':i.get('state'),'reason':i.get('state_reason'),'title':i.get('title'),'author':i.get('user',{}).get('login'),'updated':i.get('updated_at'),'comments':[{'author':c.get('user',{}).get('login'),'at':c.get('updated_at'),'url':c.get('html_url'),'body':c.get('body')} for c in r['comments']] if isinstance(r['comments'],list) else r['comments'],'pr':{k:r.get('pr',{}).get(k) for k in ['merged','merged_at','mergeable_state','draft']},'checks':[(x['name'],x['conclusion']) for x in r.get('checks',{}).get('check_runs',[])],'reviews':[(x['user']['login'],x['state'],x['body']) for x in r.get('reviews',[])]})
(D/'upstream-summary.json').write_text(json.dumps(lines,indent=2)); print(f'{len(files)} findings, {len(results)} upstream refs read')
