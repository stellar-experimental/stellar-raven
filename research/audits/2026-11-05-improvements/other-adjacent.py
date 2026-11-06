import json,pathlib,re,subprocess,concurrent.futures,datetime,hashlib
D=pathlib.Path('tmp/truth-2026-11-05/other')
def gh(p):
 r=subprocess.run(['gh','api',p],capture_output=True,text=True);return json.loads(r.stdout) if r.stdout else {'error':r.stderr}
pr=gh('repos/stellar/stellar-protocol/pulls/2062');out={'pr':pr,'comments':gh('repos/stellar/stellar-protocol/issues/2062/comments'),'reviews':gh('repos/stellar/stellar-protocol/pulls/2062/reviews'),'checks':gh(f'repos/stellar/stellar-protocol/commits/{pr["head"]["sha"]}/check-runs')};(D/'cs011-pr2062.json').write_text(json.dumps(out,indent=2))
rows=[]
for l in (D/'protocol-README.md.body').read_text().splitlines():
 m=re.match(r'\| \[SEP-(\d+)\]\(([^)]+)\).*\|\s*([^|]+)\s*\|$',l)
 if m:rows.append((m[1],m[2],m[3].strip()))
def check(row):
 n,path,status=row;url='https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/'+path;r=subprocess.run(['curl','-fsSL','--retry','2',url],capture_output=True,text=True);m=re.search(r'^Status:\s*(.*)',r.stdout,re.M);actual=m[1].strip() if m else None
 return {'sep':n,'expected':status,'actual':actual,'matches':actual==status or bool(actual and actual.startswith(status+' (')),'url':url}
with concurrent.futures.ThreadPoolExecutor(max_workers=8)as ex:sweep=list(ex.map(check,rows))
(D/'cs011-sweep.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':sweep},indent=2))
# Repository ownership: inspect current public token repositories, without assuming ownership from issue-enabled alone.
r=subprocess.run(['gh','api','--paginate','orgs/paxosglobal/repos?per_page=100'],capture_output=True,text=True); pages=json.JSONDecoder();s=r.stdout;repos=[]
while s.strip():p,idx=pages.raw_decode(s.lstrip());repos+=p;s=s.lstrip()[idx:]
selected=[r for r in repos if ('stellar' in r['name'] or 'token-contract' in r['name']) and not r['fork']]
owner=[]
for r in selected:
 t=gh(f'repos/{r["full_name"]}/git/trees/{r["default_branch"]}?recursive=1');owner.append({'repo':r['full_name'],'has_issues':r['has_issues'],'archived':r['archived'],'homepage':r['homepage'],'description':r['description'],'candidateFiles':[f['path'] for f in t.get('tree',[]) if 'toml' in f['path'].lower() or 'metadata' in f['path'].lower()]})
(D/'paxos-owner-check.json').write_text(json.dumps({'publicRepoCount':len(repos),'selected':owner},indent=2))
# Read current upstream detail schemas only for exposed free tools.
names=['find_av_passages','find_content_by_entity','find_similar_projects_semantic','find_similar_scf_submissions','get_related_projects','get_tags_vocabulary','list_documents','search_directory']
for n in names:
 r=subprocess.run(['curl','-fsSL','--retry','2','https://api.lumenloop.com/v1/tools/'+n],capture_output=True,text=True);(D/('schema-'+n+'.json')).write_text(r.stdout)
print('SEP rows',len(sweep),'mismatches',[r for r in sweep if not r['matches']]);print('Paxos candidates',len(owner))
