import pathlib,json,subprocess,concurrent.futures
D=pathlib.Path('tmp/truth-2026-11-05/other')
tasks={
'inbound-all':'repos/stellar-experimental/stellar-raven/issues?state=all&per_page=100',
'cs011-history':'repos/stellar/stellar-protocol/commits?path=ecosystem/sep-0013.md&per_page=5',
'cs011-head':'repos/stellar/stellar-protocol/commits/master',
'8004-owner':'repos/trionlabs/stellar-8004', '8004-issues':'repos/trionlabs/stellar-8004/issues?state=all&per_page=100',
'8004-tree':'repos/trionlabs/stellar-8004/git/trees/main?recursive=1',
'paxos-repos':'orgs/paxosglobal/repos?per_page=100',
'oz-audits':'repos/OpenZeppelin/stellar-contracts/contents/audits',
'oz-release':'repos/OpenZeppelin/stellar-contracts/releases/latest',
'old-tw-pr18':'repos/Trustless-Work/trustlesswork-skill/pulls/18',
'dev-deploy':'repos/stellar/stellar-dev-skill/actions/runs?per_page=30',
'dev-pr174-files':'repos/stellar/stellar-dev-skill/pulls/174/files',
'scout-head':'repos/Stellar-Light/stellar-scout/commits/main',
'll-skills-head':'repos/lumenloop/lumenloop-skills/commits/main',
'oz-skills-head':'repos/OpenZeppelin/openzeppelin-skills/commits/main',
'agents-head':'repos/cloudflare/agents/commits/main'}
def run(kv):
 k,p=kv;r=subprocess.run(['gh','api',p],capture_output=True,text=True);b=json.loads(r.stdout) if r.stdout else {'error':r.stderr};(D/(k+'.json')).write_text(json.dumps(b,indent=2))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:list(ex.map(run,tasks.items()))
