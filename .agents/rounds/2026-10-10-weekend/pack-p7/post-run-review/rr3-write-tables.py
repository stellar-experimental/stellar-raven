import json
x=json.load(open('tmp/rr3-audit.json'))
notes={
'S1a|q-defi-etherfuse-stablebonds':'Behavior pass; maturity support exists only in omission metadata.',
'S1b|q-edge-fresh-latest-blend-tvl':'Support pass; upgrade cites shown TVL figures, not omission metadata.',
'S1b|q-sor-deploy-invoke-from-js-sdk':'Support pass; builder-signing inconsistency keeps the wrong grade.',
'S1b|q-ti-rpc-gettransactions-pagination-xdr':'Support pass; downgrade has a possible pack contribution.',
'S1c|q-hist-quantum-preparedness-plan':'Support pass; Draft-versus-shipped contradiction remains.',
'S1c|q-soroban-oz-upgradeable-macro':'Support pass; retired API remains a golden contradiction.',
'S2a|q-defi-arbitrage-pathpayment-bots':'No panel regression; one A vote objects to Zenex status.',
'S2a|q-eco-pyusd-stellar-freshness':'No panel regression; one B vote notes an entity-disclosure omission.',
'S2a|q-mpp-discovery-and-modes':'No panel regression; both panels split over the x402 adapter distinction.',
'S2a|q-raph-remove-scam-token':'No panel regression; one A vote objects to an unconditional burn statement.',
'S2a|q-soroban-contract-build-verification':'No panel regression; one A vote requests the metadata command.',
'S2b|q-agent-identity-erc8004-stellar':'No panel regression; payment-proof caveat remains missing.',
'S2b|q-soroban-token-transfer-pattern':'No panel regression; one A vote requests the contract-own-balance example.',
'S2c|q-hist-quantum-preparedness-plan':'Blocking pack regression; lost supporting sentence.',
'S2c|q-raph-withdraw-exchange-self-custody':'No panel regression.',
'S2d|q-gap-leaderboard-project-not-builder':'Lower panel score; judge variance under the plan.',
'S2e|q-pc-quantum-preparedness-dormant':'Upgrade cause unresolved; vote 2 infers false source identity.',
'S3a|q-defi-bridge-evm-to-stellar-axelar':'Pass; no panel upgrade. Missing RFQ comparison remains.',
'S3b|q-ti-freighter-localhost-not-detected':'Pass; no panel upgrade. HTTPS recommendation remains disputed against the golden.',
'S3c|q-sor-force-fast-archival-localnet':'Pass; no panel upgrade. Core testing controls remain missing.',
'S3d|q-scf-verified-members':'Pass; no panel upgrade. Verification and voting rights remain confused.',
'S3d|q-soroban-sdk-cve':'Pass; no panel upgrade. Third advisory remains missing.',
'S3d|q-tool-sdk-repos-discovery':'Pass; no panel upgrade. Identity verification and activity dates remain incomplete.'}
short={'correct':'C','partial':'P','wrong':'W'}
with open('tmp/rr3-review.md','a') as f:
 for stage in '123':
  f.write(f'### Stage {stage}\n\n| Row | A score (votes) | B score (votes) | Cost A / B | Reading |\n|---|---|---|---:|---|\n')
  for r in x['paired']:
   if r['invocation'][1]!=stage:continue
   a,b=r['A'],r['B'];n=notes.get(r['invocation']+'|'+r['id'],'No panel regression; both panels unanimously vote correct.')
   f.write(f"| `{r['id']}` | {a['score']} ({'/'.join(short[v] for v in a['votes'])}) | {b['score']} ({'/'.join(short[v] for v in b['votes'])}) | ${a['cost']:.7f} / ${b['cost']:.7f} | {n} |\n")
  f.write('\n')
