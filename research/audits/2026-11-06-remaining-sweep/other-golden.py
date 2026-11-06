import pathlib,json,urllib.request,hashlib,datetime,concurrent.futures,subprocess
D=pathlib.Path('tmp/sweep-2026-11-06/other')
urls={
 'horizon-testnet':'https://horizon-testnet.stellar.org/',
 'horizon-mainnet':'https://horizon.stellar.org/',
 'bell-intro':'https://stellar.org/blog/developers/introducing-bell-protocol-30-on-stellar',
 'bell-guide':'https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide',
 'cap87':'https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0087.md',
 'scanned-horizon':'https://raw.githubusercontent.com/stellar/stellar-horizon/597544b60c20f8536d532d32abca8462394874f3/internal/ingest/main.go'}
def run(kv):
 k,u=kv
 r=subprocess.run(['curl','-sS','-L','--retry','2','--max-time','45','-A','Raven read-only maintenance','-o',str(D/('golden-'+k+'.body')),'-w','%{http_code}',u],capture_output=True,text=True)
 b=(D/('golden-'+k+'.body')).read_bytes();status=r.stdout
 (D/('golden-'+k+'.body')).write_bytes(b)
 return {'key':k,'url':u,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':status,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:out=list(ex.map(run,urls.items()))
(D/'golden-source-receipts.json').write_text(json.dumps(out,indent=2))
print('Fetched',len(out),'free primary sources')
