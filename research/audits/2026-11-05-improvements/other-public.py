import json,pathlib,subprocess,concurrent.futures,hashlib,re,datetime
D=pathlib.Path('tmp/truth-2026-11-05/other'); tasks={}
def add(k,u): tasks[k]=u
def raw(k,repo,path,branch='main'):add(k,f'https://raw.githubusercontent.com/{repo}/{branch}/{path}')
for n in ['stellar-project-dossier','stellar-ecosystem-digest','stellar-integration-finder','stellar-builder-quickstart','lumenloop-mcp-connect','stellar-ecosystem-scout']:raw(n,'lumenloop/lumenloop-skills',f'skills/{n}/SKILL.md')
for n in ['develop-secure-contracts','setup-stellar-contracts','upgrade-stellar-contracts']:raw(n,'OpenZeppelin/openzeppelin-skills',f'skills/{n}/SKILL.md')
for n in ['SKILL.md','README.md','references/api-reference.md','references/examples.md']:raw('scout-'+n.replace('/','-'),'Stellar-Light/stellar-scout',n)
for n in ['trustless-work-dev/skills/api/v2/core-concepts.md','trustless-work-dev/constitution.md']:raw('tw-'+n.split('/')[-1],'Trustless-Work/trustlesswork-skill',n)
for n in ['dapp','smart-contracts','soroban']:add('live-skill-'+n,f'https://skills.stellar.org/skills/{n}/SKILL.md')
raw('source-dapp','stellar/stellar-dev-skill','skills/dapp/SKILL.md');raw('deployment','stellar/stellar-dev-skill','.github/workflows/deploy-pages.yml')
for n in ['freighter','slender','xbull','wisdomtree','lobstr','moneygram','lumenswap','latch','aha-labs']:raw('yaml-'+n,'lumenloop/stellar-ecosystem-db',f'projects/{n}.yaml')
raw('freighter-readme','stellar/freighter','README.md','master');add('freighter-redirect','https://freighter.app/')
for n in ['skills','status','builders?q=zzzzqqq','skills/soroban','skills/smart-contracts','skills/stellar-scout','audits?auditor=OpenZeppelin']:add('scout-live-'+n.replace('/','-').replace('?','-'),f'https://stellarlight.xyz/api/{n}')
for n in ['soroban','anchors']:add('skill-old-'+n,f'https://skills.stellar.org/{n}')
for n in ['stellar-tx-deploy-fee-above-ceiling','stellar-tx-deploy-milestones-over-cap','stellar-tx-deploy-pre-approved','query-too-complex','stellar-tx-failed']:
 for group in ['',('generic-http/' if n=='query-too-complex' else 'stellar/')]:add('tw-error-'+group.replace('/','-')+n,'https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/'+group+n)
add('tw-intro','https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/introduction')
add('oz-doc','https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable');raw('oz-macros','OpenZeppelin/stellar-contracts','packages/macros/src/lib.rs');raw('oz-upgradeable','OpenZeppelin/stellar-contracts','packages/contract-utils/src/upgradeable/mod.rs')
for n in ['references/stellar-contracts','quickstarts/transfer-usdc-stellar-arc','concepts/supported-chains-and-domains','concepts/finality-and-block-confirmations']:add('circle-'+n.split('/')[-1],f'https://developers.circle.com/cctp/{n}.md')
add('circle-fees','https://iris-api.circle.com/v2/burn/USDC/fees/27/0');add('circle-attestation','https://iris-api.circle.com/v2/messages/27?transactionHash=649b62ed6fc2d566d8ce3d5e89a2ecef27d932e228d2892bef60bce43fb0bd27')
raw('circle-handlers','circlefin/stellar-cctp','packages/cctp-interfaces/src/message_handler.rs','master')
add('paxos-toml','https://token-metadata.paxos.com/.well-known/stellar.toml');add('paxos-news','https://www.paxos.com/newsroom/occ-approves-paxos-application-to-convert-to-occ-trust-paxos-to-complete-conversion-imminently-to-become-a-federally-regulated-blockchain-infrastructure-provider')
for n in ['README.md','webapp/supabase/migrations/037_mpp_column.sql','webapp/apps/web/src/lib/components/register/StepAdvanced.svelte','webapp/apps/web/src/lib/mpp-client.ts']:raw('8004-'+n.split('/')[-1],'trionlabs/stellar-8004',n)
for n in ['core/cap-0046-06.md','ecosystem/README.md','ecosystem/sep-0013.md','core/cap-0087.md']:raw('protocol-'+n.split('/')[-1],'stellar/stellar-protocol',n,'master')
raw('xdr','stellar/stellar-xdr','Stellar-contract.x','curr');add('portal','https://stellarsecurityportal.com/api/v1/reports');add('wisdomtree-toml','https://stellar.wisdomtree.com/.well-known/stellar.toml')
raw('cs001-search','cloudflare/agents','packages/codemode/src/connectors/search.ts');raw('cs010-language','cloudflare/agents','packages/agents/src/models/ai-sdk/models/language.ts');raw('cs010-wire','cloudflare/agents','packages/agents/src/models/ai-sdk/wires/chat-completions.ts');raw('cs010-transport','cloudflare/agents','packages/agents/src/models/core/transport.ts')
for n in ['research/stellar-weekly-roundup-week-29-2026','media/state-stellar-q1-2026-beyond','news/introducing-quantum-preparedness-plan','news/reliability-scale-redstone-data-standard-stellar-rwa-moment']:add('ll-page-'+n.split('/')[-1],f'https://lumenloop.com/api/md/{n}')
add('primary-quantum','https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan');add('primary-redstone','https://blog.redstone.finance/2026/06/04/reliability-at-scale-redstone-and-the-data-standard-for-stellars-rwa-moment/')
add('horizon-boundary','https://horizon.stellar.org/ledgers/63386819');add('horizon','https://horizon.stellar.org/')
for n in list(range(693,700))+[677]:add('aqua-'+str(n),f'https://governance-api.aqua.network/api/proposal/{n}/')
for k,u in [('xbull','https://xbull.app/'),('apple','https://apps.apple.com/us/app/xbull-wallet/id6705122563'),('apple-lookup','https://itunes.apple.com/lookup?id=6705122563'),('android-wallet','https://play.google.com/store/apps/details?id=app.xbull.wallet'),('android-mobile','https://play.google.com/store/apps/details?id=app.xbull.mobile'),('slender-audit','https://www.certora.com/reports/slender')]:add(k,u)
def fetch(item):
 k,u=item;p=D/(k+'.body');r=subprocess.run(['curl','-sS','-L','--retry','2','--max-time','60','-o',str(p),'-w','%{http_code}\n%{url_effective}',u],capture_output=True,text=True);s=p.read_bytes() if p.exists() else b''
 return {'id':k,'url':u,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':r.stdout.split('\n')[0],'effectiveUrl':r.stdout.split('\n')[-1],'sha256':hashlib.sha256(s).hexdigest(),'bytes':len(s),'file':str(p),'error':r.stderr}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:out=list(ex.map(fetch,tasks.items()))
(D/'public.json').write_text(json.dumps(out,indent=2));print(f'{len(out)} public checks complete')
