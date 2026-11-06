import pathlib,json,urllib.request,urllib.parse,concurrent.futures,datetime,hashlib,time
import argparse
args=argparse.ArgumentParser(); args.add_argument('--out',default='tmp/truth-2026-11-05/scout-replay'); opts=args.parse_args()
out=pathlib.Path(opts.out); out.mkdir(parents=True,exist_ok=True); base='https://stellarlight.xyz'; jobs={}
def add(k,u):jobs[k]=base+u if u.startswith('/') else u
add('spec','/api/openapi.json');add('status','/api/status')
for q in ['streaming recurring payments','slender','laina','k2 lend','orbitcdp','fluxity','allbridge','xycloans','rendergate','clevercon','oracle','band','dia','redstone','lightecho','freighter','varial','soroswap','phoenix','hana','blend','spiko','sentora','etherfuse','liqvid','enable','rumble fish','chainlink','metamask']:
 add('project-'+q.replace(' ','-'),'/api/projects/search?'+urllib.parse.urlencode({'q':q,'limit':100}))
for q in ['varial','freighter','Chainlink','MetaMask','Pollar','Pods','Principal']:
 add('resolve-'+q.lower(),'/api/projects/resolve?'+urllib.parse.urlencode({'q':q}))
for typ in ['Wallet','DEX']:add('type-'+typ,'/api/projects/search?type='+typ+'&limit=100')
add('dex-amm','/api/projects/search?type=DEX&venueRole=amm&limit=100')
for off in range(0,701,100):add('awards-'+str(off),f'/api/projects/search?scfAwarded=true&limit=100&offset={off}')
add('partners-all','/api/partners?all=true')
for slug in ['anchor-bitso','anchor-honey-coin','anchor-coins-ph','anchor-yellow-card','anchor-anclap','hana-wallet']:
 add('partner-'+slug,'/api/partners/'+slug);add('page-'+slug,'/partners/'+slug)
for dim in ['tvl','funding']:add('analyze-'+dim,'/api/analyze?dimension='+dim)
for off in [0,200,400]:add('builders-'+str(off),f'/api/builders?limit=200&offset={off}')
add('builders-latam','/api/builders?location=Latin%20America&limit=200')
add('rfps-open','/api/rfps?status=open');add('rfps-source','/api/rfps?q=source%20verification');add('ideas','/ideas')
for slug in ['layerzero-dvn','x402-facilitator-bazaar','contract-source-verification']:add('idea-'+slug,'/ideas/'+slug)
for q in ['status=active','q=istanbul','q=waterloo','q=innovation','limit=100']:add('hack-'+q.replace('=','-'),'/api/hackathons?'+q)
for y in ['2025','2026']:add('hackmeridian-'+y,'/api/hackathons/hackmeridian-'+y)
add('stablecoins','/api/stablecoins?limit=100');add('stablecoins-yield','/api/stablecoins?assetType=Yield%20Stablecoin')
for q in ['scaffold stellar','stellar lab','smart contract examples','stellar rpc','horizon','soroban-sdk','stellar-cli','js-stellar-sdk','freighter','anchor platform','stellar-core']:
 add('repo-'+q.replace(' ','-'),'/api/repos/search?'+urllib.parse.urlencode({'q':q,'limit':50 if q=='scaffold stellar' else 5}))
for q in ['stellar-scaffold/cli','theahaco/scaffold-stellar']:add('trust-'+q.replace('/','-'),'/api/repos/trust?'+urllib.parse.urlencode({'repo':q}))
sources={
'handbook':'https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md',
'handbook-q2':'https://raw.githubusercontent.com/stellar/scf-handbook/e37c0d541ddbee5f06f152b9cd1f03bbe0321f23/scf-awards/build-award/rfp-track.md',
'soroswap-amms':'https://docs.soroswap.finance/aggregator/supported-amms.md','soroswap-v3':'https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md',
'freighter-site':'https://freighter.app/','hana-money':'https://hana.money/','hana-www-money':'https://www.hana.money/','hana-wallet':'https://hanawallet.io/',
'llama-protocols':'https://api.llama.fi/protocols','llama-spiko':'https://api.llama.fi/protocol/spiko','llama-sentora':'https://api.llama.fi/protocol/sentora','llama-blend':'https://api.llama.fi/protocol/blend',
'risein':'https://www.risein.com/programs/stellar-pro-hackathon','waterloo':'https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar','rubric':'https://www.hackmeridian.com/build',
'scf-projects':'https://communityfund.stellar.org/projects?tab=all-rounds','scf-liqvid':'https://communityfund.stellar.org/project/liqvid-hrr','scf-enable':'https://communityfund.stellar.org/project/enable-duq',
'chainlink':'https://docs.chain.link/data-feeds/stellar','metamask':'https://support.metamask.io/configure/networks/stellar',
'audd-toml':'https://audd.digital/.well-known/stellar.toml','currency-toml':'https://currency.one/.well-known/stellar.toml','mgusd-toml':'https://mgusd.moneygram.com/.well-known/stellar.toml'}
for k,u in sources.items():add(k,u)
def fetch(kv):
 k,u=kv;p=out/('live-'+k+'.json')
 if p.exists():return k+' cached'
 for attempt in range(3):
  try:
   try:r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Raven read-only truth maintenance'}),timeout=45)
   except urllib.error.HTTPError as e:r=e
   b=r.read();status=r.status
   d={'url':u,'finalUrl':r.url,'status':status,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'contentType':r.headers.get('content-type'),'attempt':attempt+1}
   try:d['data']=json.loads(b)
   except:d['text']=b.decode(errors='replace')
   if status>=500 and attempt<2:continue
   p.write_text(json.dumps(d,indent=2));return k+' '+str(status)
  except Exception as e:
   if attempt==2:p.write_text(json.dumps({'url':u,'error':str(e)}));return k+' ERROR '+str(e)
# Additional read-only controls. Explain uses the free public DeepWiki client,
# confirmed in Stellar-Light/stellarlight src/lib/deepwiki.ts; partner match is excluded.
add('explain-horizon','/api/repos/explain?'+urllib.parse.urlencode({'repo':'stellar/stellar-horizon','q':'Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'}))
add('rfps-q3','/api/rfps?quarter=q3-2026');add('rfps-sep58','/api/rfps?q=SEP-58')
add('handbook-published-q2','https://raw.githubusercontent.com/stellar/scf-handbook/1e04b79973358e3dea58d821ed6419b50c93370c/scf-awards/build-award/rfp-track.md')
add('hack-upcoming','/api/hackathons?status=upcoming')
add('builders-short','/api/builders?limit=2');add('builders-strupey','/api/builders?q=Strupey')
add('stablecoins-none','/api/stablecoins?assetType=none&limit=100')
for name,url in {'scf-awards':'https://communityfund.stellar.org/awards','scf-round46':'https://communityfund.stellar.org/awards/recxrSMYwAl8vcglg','handbook-live':'https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md'}.items():add(name,url)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for s in ex.map(fetch,jobs.items()):print(s,flush=True)
(out/'requests.json').write_text(json.dumps(jobs,indent=2))

# An unfiltered project search is no_query, not an empty directory: enumerate categories.
def category(cat):
 rows=[];off=0
 while True:
  key='category-'+cat.replace('/','-').replace(' ','-')+'-'+str(off)
  url=base+'/api/projects/search?'+urllib.parse.urlencode({'category':cat,'limit':100,'offset':off})
  fetch((key,url)); d=json.loads((out/('live-'+key+'.json')).read_text()).get('data',{})
  if d.get('meta',{}).get('partial'):raise RuntimeError('Partial category read: '+key)
  page=d.get('projects',[]);rows+=page;total=d.get('meta',{}).get('counts',{}).get('total')
  if total is None:raise RuntimeError('No total: '+key)
  if off+len(page)>=total:break
  if not page:raise RuntimeError('Short page: '+key)
  off+=100
 return rows
cats=['Infrastructure','Tooling','User-Facing App','Asset','Protocol/Contract','Anchor','Partner Integration']
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
 rows=sum(list(ex.map(category,cats)),[])
u={r['slug']:r for r in rows};positive=[r for r in u.values() if (r.get('deployment') or {}).get('network') not in [None,'unknown']]
read=lambda key:json.loads((out/('live-'+key+'.json')).read_text())['data']
builders=sum([read('builders-'+str(n))['builders'] for n in [0,200,400]],[])
users={r['githubUsername'].lower() for r in builders}
summary={'projects':len(u),'positiveDeployments':len(positive),'positiveWithoutSource':sum(not r['deployment'].get('sourceUrl') for r in positive),'positiveWithoutNetworkList':sum(not r.get('supportedNetworks') for r in positive),'builders':len(builders),'uniqueBuilders':len(users),'latamMissing':[r['githubUsername'] for r in read('builders-latam')['builders'] if r['githubUsername'].lower() not in users]}
(out/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
