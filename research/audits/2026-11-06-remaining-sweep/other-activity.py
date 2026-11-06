"""Read current owner activity and all Raven handoff pages; no GitHub writes."""
import json, pathlib, subprocess, concurrent.futures, datetime
D=pathlib.Path('tmp/sweep-2026-11-06/other')
def gh(path, pages=False):
    args=['gh','api']+(['--paginate','--slurp'] if pages else [])+[path]
    r=subprocess.run(args,text=True,capture_output=True)
    if r.returncode:return {'error':r.stderr.strip()}
    return json.loads(r.stdout)
repos=sorted({u.rsplit('/',1)[0] for r in json.loads((D/'inventory.json').read_text()) for u in r['refs'] if not u.startswith('stellar-experimental/')})
def run(repo):
    meta=gh('repos/'+repo)
    out={'repo':repo,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'defaultBranch':meta.get('default_branch'),'archived':meta.get('archived'),'pushedAt':meta.get('pushed_at')}
    out['commits']=gh('repos/'+repo+'/commits?since=2026-11-05T00:00:00Z&per_page=100',True)
    out['openPRs']=gh('repos/'+repo+'/pulls?state=open&per_page=100',True)
    out['updatedIssues']=gh('repos/'+repo+'/issues?state=all&since=2026-11-05T00:00:00Z&per_page=100',True)
    (D/('activity-'+repo.replace('/','_')+'.json')).write_text(json.dumps(out,indent=2))
    return {'repo':repo,'pushedAt':out['pushedAt'],'commits':[{'sha':x['sha'],'message':x['commit']['message']} for page in out['commits'] for x in page] if isinstance(out['commits'],list) else out['commits'],'openPRs':[{'number':x['number'],'title':x['title'],'author':x['user']['login'],'updated':x['updated_at'],'draft':x['draft'],'url':x['html_url']} for page in out['openPRs'] for x in page] if isinstance(out['openPRs'],list) else out['openPRs'],'updatedIssues':[{'number':x['number'],'title':x['title'],'state':x['state'],'updated':x['updated_at'],'url':x['html_url']} for page in out['updatedIssues'] for x in page] if isinstance(out['updatedIssues'],list) else out['updatedIssues']}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex: rows=list(ex.map(run,repos))
(D/'activity-summary.json').write_text(json.dumps(rows,indent=2))
pages=gh('repos/stellar-experimental/stellar-raven/issues?state=all&per_page=100',True)
active={r['id'] for r in json.loads((D/'inventory.json').read_text())}
handoffs=[r for page in pages for r in page if not r.get('pull_request') and ('upstream' in r['title'].lower() or any(i in (r.get('body') or '') for i in active))]
(D/'handoffs-all.json').write_text(json.dumps(handoffs,indent=2))
print(f'{len(rows)} owner repositories; {len(handoffs)} matching Raven notifications/issues (all pages).')
