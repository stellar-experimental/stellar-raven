"""Fresh, free public GET evidence. Run from repository root with Python 3.
No transactions, paid endpoints or cache-busting. Saves bytes/headers in scratch.
"""
import pathlib,json,subprocess,concurrent.futures,hashlib,datetime,sys
out=pathlib.Path('tmp/sweep-2026-11-06/docs');out.mkdir(parents=True,exist_ok=True)
base='https://developers.stellar.org/docs/'
paths={
'sd-004':['data/apis/rpc/api-reference/structure/pagination'],
'sd-005':['build/agentic-payments','build/agentic-payments/x402'],
'sd-009':['learn/fundamentals/anchors','build/apps/wallet/sep6'],
'sd-014':['learn/fundamentals/stellar-data-structures/ledgers'],
'sd-032':['build/apps/wallet/intro'],
'sd-035':['build/apps/example-application-tutorial/overview'],
'sd-050':['tools/sdks/client-sdks'],
'sd-053':['data/apis/rpc/admin-guide/configuring'],
'sd-054':['learn/fundamentals/stellar-stack','validators'],
'sd-058':['build/guides/transactions/signing-soroban-invocations','build/agentic-payments/x402/quickstart-guide'],
'sd-059':['data/apis/horizon/api-reference/errors/result-codes/operation-specific/set-options'],
'sd-061':['build/guides/transactions/claimable-balances'],
'sd-062':['platforms/stellar-disbursement-platform/api-reference/registration'],
'sd-070':['build/guides/storage/migrate-contract-storage'],
'sd-074':['tools/scaffold-stellar','build/smart-contracts/getting-started/hello-world-frontend'],
'sd-081':['build/guides/archival/restore-contract-js','learn/fundamentals/contract-development/storage/state-archival','build/guides/archival/restore-data-js','build/guides/transactions/submit-transaction-wait-js'],
'sd-088':['learn/fundamentals/stellar-data-structures/ledgers'],
'sd-090':['build/guides/dapps/working-with-contract-specs'],
'sd-091':['build/guides/transactions/simulateTransaction-Deep-Dive'],
'sd-092':['build/guides/transactions/pooled-accounts-muxed-accounts-memos'],
'sd-093':['learn/fundamentals/contract-development/storage/persisting-data','build/guides/storage/storage-strategies'],
'sd-095':['platforms/stellar-disbursement-platform/admin-guide/embedded-wallets'],
'sd-097':['build/building-with-ai'],
'sd-098':['build/guides/auth/check-auth-tutorials','build/guides/dapps/working-with-contract-specs'],
'sk-038':['tokens/control-asset-access','build/guides/tokens/custom-sac-admin'],
}
urls={k:[base+p+'.md'for p in ps]for k,ps in paths.items()}
urls.update({
'sd-048':['https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0075.md','https://raw.githubusercontent.com/stellar/rs-soroban-env/master/soroban-env-host/src/crypto/poseidon/mod.rs'],
'sd-064':['https://developers.stellar.org/meetings/authors','https://developers.stellar.org/meetings/authors/kalepail','https://developers.stellar.org/meetings/authors/elliotfriend'],
'sd-077':['https://stellar.org/grants-and-funding','https://stellar.org/grants-and-funding/marketing-grants'],
'sd-096':[base+'build/apps/smart-wallets/recovery',base+'build/apps/smart-wallets/fee-sponsorship',base+'learn/encyclopedia/contract-development/contract-interactions/stellar-ecosystem-proposals'],
})
urls['sk-038']+=['https://developers.stellar.org/.well-known/agent-skills/assets/skill.md','https://skills.stellar.org/skills/assets/SKILL.md','https://raw.githubusercontent.com/stellar/stellar-docs/main/.mintlify/skills/assets/SKILL.md','https://skills.stellar.org/skills/cross-chain/layerzero.md']
urls['sd-009']+=['https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0006.md']
urls['sd-032']+=['https://pub.dev/api/packages/stellar_wallet_flutter_sdk','https://pub.dev/api/packages/stellar_flutter_sdk']
urls['sd-054']+=['https://horizon.stellar.org/ledgers?order=desc&limit=200']
urls['sd-062']+=['https://raw.githubusercontent.com/stellar/stellar-docs/main/openapi/stellar-disbursement-platform/main.yaml','https://raw.githubusercontent.com/stellar/stellar-docs/main/openapi/stellar-disbursement-platform/bundled.yaml']
urls['sd-098']+=['https://raw.githubusercontent.com/stellar/rs-soroban-sdk/v29.0.1/soroban-sdk/src/events.rs']
def get(job):
 id,i,url=job;stem=f'live-{id}-{i}';body=out/(stem+'.body');headers=out/(stem+'.headers')
 p=subprocess.run(['curl','-sS','-L','--max-time','45','--retry','1','-A','Raven-truth-maintenance/1.0','-D',str(headers),'-o',str(body),'-w','%{http_code} %{url_effective}',url],capture_output=True,text=True)
 raw=body.read_bytes()if body.exists()else b''
 return {'id':id,'index':i,'url':url,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':p.stdout,'exitCode':p.returncode,'error':p.stderr,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'body':str(body),'headers':str(headers)}
if len(sys.argv)>1: urls={k:v for k,v in urls.items() if k in sys.argv[1:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:rows=list(pool.map(get,[(id,i,u)for id,us in sorted(urls.items())for i,u in enumerate(us)]))
if len(sys.argv)>1: rows=[r for r in json.loads((out/'live-receipts.json').read_text()) if r['id'] not in urls]+rows
rows.sort(key=lambda r:(r['id'],r['index']))
(out/'live-receipts.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps({'requests':len(rows),'errors':[r for r in rows if not r['result'].startswith('200')]}))
