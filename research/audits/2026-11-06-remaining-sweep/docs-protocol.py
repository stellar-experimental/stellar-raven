"""Free protocol lookahead source checks; no corpus edits or network transactions."""
import json,pathlib,urllib.request,hashlib,datetime,concurrent.futures,re
out=pathlib.Path('tmp/sweep-2026-11-06/docs')
urls=['https://horizon.stellar.org/','https://horizon-testnet.stellar.org/','https://horizon.stellar.org/ledgers?order=desc&limit=1','https://horizon-testnet.stellar.org/ledgers?order=desc&limit=1','https://developers.stellar.org/docs/networks/software-versions.md','https://developers.stellar.org/docs/validators/admin-guide/network-upgrades.md','https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide','https://stellar.org/blog/developers/introducing-bell-protocol-30-on-stellar','https://status.stellar.org/api/v2/scheduled-maintenances.json','https://raw.githubusercontent.com/stellar/stellar-xdr/v30.0/Stellar-ledger.x']
def get(job):
 i,u=job;req=urllib.request.Request(u,headers={'User-Agent':'Raven-truth-maintenance/1.0'})
 with urllib.request.urlopen(req,timeout=40)as r:status=r.status;raw=r.read()
 (out/f'protocol-{i}.body').write_bytes(raw)
 row={'url':u,'status':status,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(raw).hexdigest(),'body':str(out/f'protocol-{i}.body')}
 if i<4:
  j=json.loads(raw)
  if i<2:row['projection']={k:j.get(k)for k in ['current_protocol_version','core_supported_protocol_version','history_latest_ledger','network_passphrase']}
  else:row['projection']=[{k:v.get(k)for k in ['sequence','protocol_version','closed_at']}for v in j['_embedded']['records']]
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:rows=list(pool.map(get,enumerate(urls)))
for origin in ['https://mainnet.sorobanrpc.com','https://soroban-testnet.stellar.org']:
 for method in ['getNetwork','getLatestLedger']:
  req=urllib.request.Request(origin,data=json.dumps({'jsonrpc':'2.0','id':1,'method':method}).encode(),headers={'Content-Type':'application/json','User-Agent':'Raven-truth-maintenance/1.0'})
  with urllib.request.urlopen(req,timeout=30)as r:j=json.load(r)
  data=j.get('result',{});rows.append({'url':origin,'method':method,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'projection':{k:data.get(k)for k in ['protocolVersion','sequence','passphrase','id']if k in data}})
(out/'protocol-receipts.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps(rows,indent=2))
