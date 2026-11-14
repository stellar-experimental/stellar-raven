# Independent review: golden coverage audit, commit `c7dbdc87`

Reviewer: Claude Sonnet 5.5, lane `review`, worktree `/home/tyler/code/raven-wt/gca`, branch
`audit/golden-coverage` at `9b761117`. Reviewed against `origin/main...HEAD`. I did not write the
change. Re-derived from the diff, the files, the gates, and live sources (2026-11-14); no ledger or lane
report was trusted.

**Verdict: fit to merge once M1 to M4 are fixed.** Every gate passes, the lifecycle is intact, and all
208 rewritten cases carry exactly the reviewed text. I found no wrong or stale claim in the 30-case
read. M1 to M4 are stale-doc and lost-fact defects; none is a truth error in a case. L1 to L8 are
optional.

## Findings, ranked

### M1. `ecosystem-skills/README.md:163` still says CI enforces `skill floor 1` (stale instruction)

Step 6 of the "add a skill" procedure says "CI enforces `skill floor 1` per exposed skill, and a
skills-routing case does not count". The floor is deleted (`lintCoverage` no longer reads the
manifest). The step now tells a maintainer to write a QA case that nothing requires. The grep the
brief asked for did not cover this file.

Fix: rewrite step 6 to the current rule (routing and skills cases own skill reach; a QA case is needed
only when the skill answers a taxonomy leaf, named in `truth.leaf`).

### M2. Name what the deleted floors left unguarded; the docs do not say so

The deleted floors were safe only for the properties the replacement rules or tests own. These are
unguarded now (counts from the manifest and the compiled battery):

| Deleted floor | What now goes unguarded | Evidence |
|---|---|---|
| Operation floor 2 | An exposed operation can lose all end-to-end QA coverage. 23 of 60 operations have no headline case (for example `scout.getStatus`, `scout.vetIdea`, `stellarDocs.get_doc_page`, `lumenloop.get_regions`); the six tool-lane cases reach a few. | `DESIGN.md` says routing gates own it, but routing grades search ranking, not an `execute` answer. |
| Skill floor 1 (digest 2) | 11 of 20 skills have no headline case (`skills.stellar-dev.data`, `skills.stellar-light.stellar-scout`, `skills.trustless-work.trustless-work-dev`, and seven `skills.lumenloop.*` skills including `stellar-ecosystem-digest`). | M1. |
| Catalog-note traps (7) | `person-entity-empty`, `av-offset`, `semantic-fallback`, `matchPartners-503` have no case anywhere (on main each had 1 to 2). `winner-order` and `zero-upcoming` keep one headline case each. No file under `test/` matches `semantic-fallback` or `zero-upcoming` wording. | Compare each trap on `origin/main:eval/qa/cases.json` with the tool lane. |
| Cross-service 12, NEG/soft-empty 20, VOCAB 6 | Nothing measures multi-source questions or honest soft-empty behaviour as a count. | `behavior.*` leaves cover the Stellar-facing part only. |
| Scheduled share 35% | The share is now 39% (82 of 210 scheduled, 43 live), above the old cap. Load is held by `--stale`, sentinels, and `reverifyBy`, as `DESIGN.md` argues. | Counted from `cases.json`. |
| `MIGRATION_KEYFACT_EXCEPTIONS` | Safe to delete. `compile-qa` caps key facts at five and compiles, so no case exceeds five (five cases have exactly five). | `npm run eval:qa:compile` exit 0. |
| `CATEGORY_FLOORS` | Replaced by leaf rules; safe. | `lintCoverage`. |

This is the owner's call (decision 3 and the design table), but `eval/qa/README.md` and the ledger
should state it in one line: the battery measures Stellar truth, not operation or skill reach.

Fix: add that line to `eval/qa/README.md`; add `.agents/TODO.md` entries (or findings) for the four
trap gaps if any is still wanted as a tool-lane case or unit test.

### M3. The `golden-truth` skill contradicts the new judge-facing rule

`.agents/skills/golden-truth/SKILL.md:95` still sends an unverifiable fact to `golden.notes`
("Move it to `golden.notes` or remove it"), and line 42 describes `golden.notes` as the place for
provenance cautions. The audit's rule is the opposite: provenance lives in the judge-blind
`truth.notes`, and `golden.notes` holds grading cautions only. The skill gained one line (the leaf at
line 140) and says nothing about `truth.notes`, `truth.lane`, the compaction target (answer about 60
words, two to four single-predicate key facts), or that `Do NOT` is the only avoid form.

Fix: update lines 42, 95, and 140 to the current behavior; add the three rules above in one short
paragraph.

### M4. Three merge survivors lost a fact the tombstone says to absorb

| Survivor | Missing fact (from the tombstone) |
|---|---|
| `q-passkey-smart-account-architecture` | "WebAuthn also permits algorithms other than P-256" and "a separate G account submits and pays fees; the C account only authorizes". The `q-infra-secp256r1-passkeys` tombstone says the orchestrator "must add them when applying"; the survivor's source was the unedited audit rewrite, so they were never added. |
| `q-zk-proof-systems-stellar` | Groth16 verifies on BLS12-381 or BN254 only when circuit and verifier use the same curve (`q-sor-cross-warmancer-zk-stack`). The answer names both curves but not the match rule. |
| `q-asset-issue-asset-howto` | "the issuer cannot hold its own asset" (`q-aas-burn-clawback-redemption-mechanics`). The burn half is present. |

I ran a keyword check on all six tombstones that name an absorbed fact; these were the three lowest
(overlap 0.19, 0.30, 0.57). The other three overlap at 0.60 or more.

Fix: add each fact as an answer clause (not a new key fact), with a `truth.verified` event.

### L1. Unsupported or lagging as-of stamps (the round's known error pattern)

- `q-pc-practical-fee-setting`: the answer says "100 stroops per operation as of 2026-11-14" but both
  rot entries for the case are `unverifiable` with no observation. Live Horizon `fee_stats` and
  `ledgers` show a base fee of 100 today, so the claim is true; the stamp still has no evidence in the
  record.
- `q-protocol-ledger-close-time`: "observed closes have averaged 5.0 seconds since Protocol 28
  (2026-09-16)" rests on five sampled deltas (rot: "all five sampled deltas 5 s"). I re-sampled five
  closes (5, 5, 5, 5, 5 s). The sentence claims more than five samples show; say "five sampled closes
  were 5 seconds apart on 2026-11-14".
- Up to 22 cases carry an answer date later than `truth.asOf` (a few are future event dates) (for example `q-protocol-base-reserve-min-balance`:
  `asOf` 2026-07-11, answer "as of 2026-11-14"; `q-scf-sdf-bug-bounty` 2026-07-10). The script holds
  `asOf` when a sentinel or an `unverifiable` rot entry exists, so most are deliberate, but a reader
  sees two dates. Where the rot check did observe the claim and no sentinel binds it, move `asOf`.

### L2. Tombstone reasons: five are vacuous, 84 are pointers

- Five old proposals were retired with the reason "Proposal (not active)."
  (`q-scout-hackathon-placed-share-kale-vs-zk`, `-submission-link-comet-hoops`, `-submission-xbid-outcome`,
  `-winner-libraries-vs-field`, `q-sor-reflector-testnet-contract-addresses`). That says what, not why.
- 84 reasons are under 90 characters or point elsewhere ("See mergeFixes", "see toolLane", "See the
  defi.bridges leaf finding"). All pass `tombstoneProblems` and name evidence paths, so a stranger can
  trace them, but the tombstone is permanent and the target files are round notes.

Fix: rewrite those reasons as one self-contained sentence each (the coverage `note` or verifier `why`
holds the text).

### L3. Judge-facing tool names and finding IDs remain in nine headline cases

`golden.notes` (and one avoid and one answer) still say "Scout", "Lumenloop", or a finding ID
(`ll-016`, `sls-039`, `sd-005`, `sd-009`): `q-defi-blend-alternatives` (avoid and notes),
`q-eco-lobstr-wallet`, `q-edge-strupey-ambiguous-stellar-history`, `q-hist-scp-rewrite-2015`,
`q-edge-fresh-latest-blend-tvl`, `q-defi-x402-on-stellar-what`, `q-sep6-sep24-sep31-choice`,
`q-eco-stellar-rwa-stablecoin-volume`, `q-ti-rpc-gettransactions-pagination-xdr`. The answer of
`q-defi-liquid-staking-whitespace` says "a 2026-11-02 sweep of official docs, Scout, Lumenloop,
DeFiLlama and the web found none", which is audit provenance. These exist on main, but the round's
stated aim is that provenance leaves judge-facing text. The finding IDs drive the cap mechanism, so
moving them needs the cap lint checked first.

Fix: move the sweep sentence to `truth.notes`; keep cap IDs only where `lintCapFindings` requires them.

### L4. Compaction target is soft and mostly unmet on answer length

116 of 210 answers exceed 60 words (median 62, max 108; main: median 108). `lint-corpus --stale
--enforce-floors` now warns "multiple predicates" 60 times in 48 cases (main: 4 warnings) and 20
`avoid` warnings (main: 45). Judge-facing text still fell 79 percent (1.09 M characters on main,
231 k now). Worst answers sit in `q-ti-compute-token-lp-market-data` (101 words) and the five cases that
still carry five key facts (`q-aas-claimable-predicates-expiry-reserves`, `q-cctp-v2-usdc-stellar`,
`q-comp-sep8-regulated-assets-approval-server`, `q-ti-secret-key-vs-mnemonic-derivation`,
`q-ti-self-host-retention-backfill`).

Fix (optional): a polish pass on the 48 flagged cases; the lint is a warning, so it does not block.

### L5. Leaf assignment

`q-pc-multisig-setup-lifecycle` is primary on `security.key-custody` and secondary on
`protocol.signatures-multisig`; the multisig leaf is held by `q-protocol-accounts-signers-thresholds`.
A multisig question is the only "cover" for the custody leaf. Nine leaves sit at target plus one
(`tooling.relayers`, `tooling.wallet-connection`, `protocol.tx-lifecycle-finality`,
`wallets.lost-keys`, `soroban.sdk-dialect-types`, `soroban.contract-accounts`,
`ai.mpp-agentic-protocols`, `funding.hackathons`, `tooling.scaffold-bindings`); that is allowed by rule.

Fix: swap primary and secondary only if the owner wants custody to count as uncovered.

### L6. Leaf presence is enforced only by the coverage lane

`validateCase` rejects an empty `truth.leaf` but does not require one on a headline case; only
`lintCoverage` (`--coverage` or `--enforce-floors`) does. CI runs `--enforce-floors`, and the unit test
covers it, so nothing slips through. `DESIGN.md` says "error, always"; that is true only with the flag.
Bare `npm run eval:qa:lint` will pass a case with no leaf.

Fix: correct the `DESIGN.md` sentence or make `validateCase` require a leaf for non-tool cases.

### L7. One-off exports and a fixture-coupling note

`validateCase` is exported only for `.agents/rounds/.../apply/apply.mjs`, a one-off script that stays in
the tree; `isToolLaneCase` is exported but used only inside `lint-corpus.mjs`. The edit to
`test/playground-final-orchestrator.test.mjs` moves a fixture file so `meta.casesPath` resolves to the
frozen snapshot; that test no longer reads the live battery, which is the right direction.

Fix: drop the export when the script is archived, or leave it.

### L8. Avoid items that are parse traps, not false claims

`q-ti-compute-token-lp-market-data` has "Do NOT answer about the asset named COMPUTE; 'compute' is a
verb here." That guards the question, not a false claim; it contradicts the compaction rule ("avoid
items only for claims shown false").

## 1. Instrument code

- `lint-corpus.mjs`: `lintCoverage` does what `eval/qa/README.md` says (leaf exists, secondary differs,
  target plus one is an error always, an empty weight-2 or weight-3 leaf is warn or error with
  `--enforce-floors`, a slot with a reason and an empty leaf, a stale slot is an error). The unit test
  covers each branch. No dead code found beyond L7. No check was weakened to pass: the only relaxations
  are the retired-destination rule in `lintLedger` and `validateLedger` (tested both ways) and the
  removed floors in M2.
- `compile-qa.mjs`: tool cases compile to `tool-cases.json` and never to `cases.json` or `sample.json`.
  I ran `npm run eval:qa:compile`: exit 0 and no file changed. Overlap of the six tool cases with the
  headline file: 0; with the sample: 0. The sample draws 30 of 210 headline cases. `tool-cases.json` is
  in the CI byte-compare list (`ci.yml:134`), carries its own `corpusContentSha256` and `counts`, and
  `loadCases` reads it as a `--cases` file without change.
- `judge.mjs`: only the `PROMPT_SHA256_FIXTURES` pins changed (15 ids). Fifteen ids and hashes are
  replaced because the pinned cases changed text; the self-test and `npm test` pass.
- Tests. Deleted `test/qa-golden-max-tx.test.mjs`: it pinned an XDR-attribution sentence the rewritten
  `q-protocol-max-tx-set-size` answer no longer makes, so it guards nothing (the case still states
  1,000 and 2,000 as dated validator-voted settings). Deleted the roster test in `qa-corpus-lint` and the
  Mazières sentinel test: the case and sentinel are retired, and the 12 removed sentinels all belong to
  retired cases (checked one by one). Rewritten tests (strkey, verdict-consistency, lifecycle) lose
  nothing; the lifecycle test gains a real retirement against the registry and counts that derive from
  the lane files.

## 2. Lifecycle integrity

Script: `/tmp/claude-1000/-home-tyler-code-raven-wt-gca/3988d65f-d2cf-44b0-8b81-2d284ee26bc1/scratchpad/lifecycle-proof.mjs`
(full text below). Output:

```
{
 "oldActive": 501,
 "oldProposed": 6,
 "oldRetiredFiles": 0,
 "now": {
  "battery": 216,
  "headline": 210,
  "tool": 6,
  "proposed": 36,
  "retired": 291
 },
 "oldActiveOutcome": {
  "headline": 210,
  "tool": 6,
  "retired": 285,
  "retiredWithActiveReplacement": 89,
  "retiredNoReplacement": 196
 },
 "newIdsNotInOldReserved": 36,
 "registryCounts": {
  "proposed": 36,
  "active": 216,
  "quarantined": 0,
  "retired": 291
 },
 "registryReserved": 543,
 "missingFields": 0,
 "scoreWordReasons": 2,
 "problems": 0
}
PROBLEMS: []
MISSING FIELDS: []
SCORE-WORD REASONS: [
  'q-gap-scout-changelog-envelope: Pure Raven envelope mechanics; test/adapters.test.ts exercises scout.getStatus and the live execute runner calls it, so a tool lane adds no visibility a judge-graded case gives. Retire is right.',
  "q-protocol-validator-upgrade-vote: Merged into q-pc-protocol-upgrade-timing. Survivor q-pc-protocol-upgrade-timing rewrite absorbs arming a scheduled UTC upgrade, in-band SCP activation, and 'not a token vote'. The exact http-command syntax is reasonable to drop from judge-facing text."
]
NEW IDS: q-asset-usdt0-layerzero-oft q-nft-vault-contract-standards q-sep24-interactive-deposit-flow q-sep31-flow-sep38-quotes q-audit-reports-where-published q-comp-aml-analytics-vendors q-crp-public-sector-cbdc-pilots-stellar q-pay-merchant-request-detect-reconcile q-defi-blend-audit-record q-eco-hermes-renamed-zenex q-eco-institutions-payment-networks-banks q-sdf-2026-strategy-priorities q-token-xlm-supply-total-circulating q-net-protocol-meeting-notes-find-cap q-net-tier1-roster-current q-network-halt-history q-pc-core-software-audits q-pc-quorum-freeze-cap77 q-stellar-vs-xrp-ledger q-validator-why-run-no-rewards q-consumer-apps-spend-save-send q-raph-official-help-sdf-cannot-recover q-signing-safety-website-request q-scf-ai-agent-projects-agents-hackathon q-scf-service-provider-directories q-sor-custom-errors-find-failure-cause q-soroban-fee-refundable-rent q-soroban-pre-mainnet-security-steps q-agent-cli-authority-limits q-ai-mcp-servers-connect q-data-network-metrics-sources q-infra-sdf-hosted-endpoints q-infra-software-versions-current-protocol q-infra-version-lag-errors q-network-status-where-to-check q-renamed-tools-rpc-cli-go-sdk
new ids that are retired: []
```

Digest check (`digest-proof.mjs`, same directory): for all 285 tombstones of ids that were active on
main, `lastCaseContentSha256` equals `contentSha256` of the case in `origin/main:eval/qa/cases.json`
(285 match, 0 mismatch). All 507 old reserved ids are still reserved; the 36 new ids are not in the old
set; none is a retired id.

Result: 501 active on main became 210 headline, 6 tool lane, and 285 retired (89 with an active
replacement, 196 without). The 6 proposals on main are all retired (five with the reason "Proposal (not active).", one absorbed
into `q-infra-testnet-vs-futurenet`); 36 new proposals exist.
No id is in two lanes; no id reused; every tombstone has date, author, reviewer (never equal to author),
reason, and digest. Reason quality: L2. Two reasons match a score word (`judge`); both are false positives ("judge-graded case" and
"judge-facing text").

<details><summary>lifecycle-proof.mjs</summary>

```js
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
const walk=(d)=>readdirSync(d).flatMap(n=>{const p=path.join(d,n);return statSync(p).isDirectory()?walk(p):p.endsWith(".json")?[p]:[]});
const J=(p)=>JSON.parse(readFileSync(p,"utf8"));
const git=(c)=>execSync(`git ${c}`,{maxBuffer:1<<29}).toString();
const oldCases=JSON.parse(git("show origin/main:eval/qa/cases.json")).cases;
const oldReg=JSON.parse(git("show origin/main:eval/qa/lifecycle-registry.json"));
const oldProposed=git("ls-tree -r --name-only origin/main eval/qa/corpus/proposed").trim().split("\n").filter(x=>x.endsWith(".json")).map(f=>JSON.parse(git(`show origin/main:${f}`)).id);
const oldRetired=git("ls-tree -r --name-only origin/main eval/qa/corpus/retired").trim().split("\n").filter(x=>x.endsWith(".json"));
const battery=walk("eval/qa/corpus/battery").map(f=>({f,v:J(f)}));
const proposed=walk("eval/qa/corpus/proposed").map(f=>({f,v:J(f)}));
const retired=walk("eval/qa/corpus/retired").map(f=>({f,v:J(f)}));
const problems=[];
const activeIds=new Map(battery.map(x=>[x.v.id,x]));
const retiredMap=new Map(retired.map(x=>[x.v.id,x]));
const propMap=new Map(proposed.map(x=>[x.v.id,x]));
// no id in two places
for(const id of new Set([...activeIds.keys(),...retiredMap.keys(),...propMap.keys()])){
  const n=[activeIds.has(id),retiredMap.has(id),propMap.has(id)].filter(Boolean).length;
  if(n!==1)problems.push(`${id} appears in ${n} lanes`);
}
if(battery.length!==activeIds.size)problems.push("duplicate battery ids");
// filename == id
for(const x of [...battery,...proposed,...retired]) if(path.basename(x.f,".json")!==x.v.id)problems.push(`filename mismatch ${x.f}`);
let head=0,tool=0,ret=0,merge=0,retNoRepl=0;
const fieldsMissing=[];
const SCORE=/\b(score|scored|fail(ed|s)? rate|pass rate|verdict|judge|\d+\/\d+ (agents|runs)|accuracy)\b/i;
const scoreHits=[];
for(const c of oldCases){
  const id=c.id;
  if(activeIds.has(id)){ (activeIds.get(id).v.truth.lane==="tool")?tool++:head++; if(activeIds.get(id).v.truth.lifecycle.state!=="active"&&activeIds.get(id).v.truth.lifecycle.state!=="quarantined")problems.push(`${id} state ${activeIds.get(id).v.truth.lifecycle.state}`); continue;}
  const t=retiredMap.get(id);
  if(!t){problems.push(`${id}: active on main, now nowhere (propmap=${propMap.has(id)})`);continue;}
  ret++;
  const r=t.v.retired||{};
  for(const k of ["date","author","reviewer","reason","lastCaseContentSha256"]) if(!r[k]) fieldsMissing.push(`${id}.${k}`);
  if(r.author===r.reviewer) problems.push(`${id}: author==reviewer`);
  if(SCORE.test(r.reason||"")) scoreHits.push(`${id}: ${r.reason}`);
  const repl=r.replacementIds||[];
  if(/^Merged/i.test(r.reason||"")||repl.length){merge++;
    if(!repl.length)problems.push(`${id}: reason says merged but no replacementIds`);
    for(const rid of repl){ if(!activeIds.has(rid))problems.push(`${id}: replacement ${rid} not an active battery case`); }
  } else retNoRepl++;
}
// old ids that were proposed on main
for(const id of oldProposed){ const where=activeIds.has(id)?"active":retiredMap.has(id)?"retired":propMap.has(id)?"proposed":"MISSING"; if(where==="MISSING")problems.push(`old proposal ${id} missing`); }
// Old retired tombstones on main preserved?
// reserved ids: every old reserved id still present in new registry
const newReg=J("eval/qa/lifecycle-registry.json");
const newReserved=new Set(newReg.reservedIds);
for(const id of oldReg.reservedIds) if(!newReserved.has(id))problems.push(`reservedId dropped: ${id}`);
// new ids: not previously used (not in old reserved)
const oldRes=new Set(oldReg.reservedIds);
const newIds=[...activeIds.keys(),...propMap.keys()].filter(id=>!oldRes.has(id));
console.log(JSON.stringify({oldActive:oldCases.length,oldProposed:oldProposed.length,oldRetiredFiles:oldRetired.length,now:{battery:battery.length,headline:battery.filter(x=>x.v.truth.lane!=="tool").length,tool:battery.filter(x=>x.v.truth.lane==="tool").length,proposed:proposed.length,retired:retired.length},oldActiveOutcome:{headline:head,tool,retired:ret,retiredWithActiveReplacement:merge,retiredNoReplacement:retNoRepl},newIdsNotInOldReserved:newIds.length,registryCounts:newReg.counts,registryReserved:newReg.reservedIds.length,missingFields:fieldsMissing.length,scoreWordReasons:scoreHits.length,problems:problems.length},null,1));
console.log("PROBLEMS:",problems.slice(0,40));
console.log("MISSING FIELDS:",fieldsMissing.slice(0,10));
console.log("SCORE-WORD REASONS:",scoreHits.slice(0,10));
console.log("NEW IDS:",newIds.slice(0,60).join(" "));
// new ids reuse old retired ids?
const reused=newIds.filter(id=>retiredMap.has(id)); console.log("new ids that are retired:",reused);
```

</details>

## 3. Applied text against reviewed text

Rule: take every battery case whose `question` or `golden` differs from `origin/main` (208 cases), group
by directory, sort each group by `sha256("review-2026-11-14:" + id)`, and take the first three of each of
the ten directories (30 cases). Reviewed source by precedence: `coverage/overrides.json`, then
`verify/*.json` `finalRewrite`, then `audit/*.json` `rewrite`. Scripts: `sample.mjs` and `all.mjs` in the
scratchpad above.

Result for the 30: `answer`, `keyFacts`, `notes`, and `question` are byte-equal to the reviewed text in
all 30 (0 mismatches). `avoid` differs only by the documented normalization to `Do NOT ...` (gerund to
base verb, or `Do NOT claim that ...`); I read all 30 and the meaning is unchanged. I then ran the same
byte comparison over all 208: 0 differences in `answer`, `keyFacts`, `notes`, `question`; 34 `avoid`
lists differ by the same normalization (my crude comparison flagged them; I read a dozen). Sources: 68
overrides, 32 verifier rewrites, 108 audit rewrites.

Nothing else judge-facing changed: across all 210 cases, no top-level field other than `truth`,
`golden`, and `question` differs from main. `truth` fields that changed: `verified` 208, `notes` 205,
`leaf` 210, `corroboration` 181, `secondaryLeaf` 74, `asOf` 89, `lane` 6. The 30:

| Directory | Cases |
|---|---|
| assets-anchors-seps | `q-sep6-sep24-sep31-choice`, `q-asset-issue-asset-howto`, `q-sep-45-contract-auth` |
| compliance-rwa-payments | `q-mpp-discovery-and-modes`, `q-crp-regional-offramp-mobilemoney`, `q-comp-clawback-cap0035` |
| defi-ecosystem | `q-eco-defi-tvl-current`, `q-defi-x402-on-stellar-what`, `q-eco-dex-saturation` |
| edge-behavior | `q-edge-xlm-price-investment-advice`, `q-raph-stolen-wallet-recovery`, `q-edge-send-me-free-xlm` |
| history-org-tokenomics | `q-hist-quantum-preparedness-plan`, `q-hot-sdf-xlm-holdings-sales`, `q-hist-scp-rewrite-2015` |
| protocol-core | `q-protocol-base-reserve-min-balance`, `q-pc-slp-0004-0006-status`, `q-pc-cross-redstone-sep40` |
| retail-consumer | `q-raph-low-xlm-transfer-fail`, `q-raph-xlm-staking`, `q-jutsu-check-account-history` |
| scf-grants-builders | `q-scf-current-round`, `q-scf-history-soroswap`, `q-scf-pitch-prep-live` |
| soroban | `q-soroban-vuln-classes`, `q-passkey-smart-account-architecture`, `q-sor-decode-hosterror-codes` |
| tooling-infra | `q-ti-compute-token-lp-market-data`, `q-tool-go-sdk-ingest`, `q-ti-self-host-retention-backfill` |

## 4. Read as the judge (same 30)

No answer was wrong or stale. Live checks of the most volatile claim, 2026-11-14:

| Case | Claim | Result |
|---|---|---|
| `q-sep6-sep24-sep31-choice` | SEP-6, 24, 31 Active; SEP-38 Draft | `stellar-protocol` `ecosystem/README.md` matches |
| `q-sep-45-contract-auth` | SEP-45 Draft | matches (v0.1.1 not re-checked; notes accept a later version) |
| `q-pc-cross-redstone-sep40` | RedStone Mainnet contract SEP-40; Reflector public feeds | Docs `oracle-providers.md` lists both |
| `q-protocol-base-reserve-min-balance` | 0.5 XLM (5,000,000 stroops) | Horizon `base_reserve_in_stroops` 5000000 |
| `q-pc-slp-0004-0006-status` | SLP-0007: clusters 2 to 3, fees halved, live 2026-10-22 | `limits/slp-0007.md` and the Docs snapshot agree |
| `q-eco-defi-tvl-current` | DeFiLlama about $204.9M on 2026-11-14 | `v2/chains` now reads 202.9 M; `historicalChainTvl` 196.6 M for 11-14. Ordinary drift of a dated example; no key fact carries the figure |
| `q-defi-x402-on-stellar-what` | Linux Foundation stewardship | LF press release 2026-07-14 (x402 Foundation) |
| `q-hist-quantum-preparedness-plan` | June 9 2026 plan; Bell is Protocol 30 | stellar.org plan post and "Bell, Protocol 30 Upgrade Guide" exist |
| `q-scf-current-round` | SCF #46 in Initial Review, deadline Nov 9 | Awards page data says Initial Review; the rendered card is labelled "Submission" with the same deadline (page lags). The audit's A and C evidence agree |
| `q-scf-history-soroswap` | four awards, $346,750 | the four listed amounts sum to 346,750 |
| `q-protocol-ledger-close-time` | 5 s closes | five sampled closes 5 s; see L1 for the over-claim |

Not re-derived by me (read only): the `q-hot-sdf-xlm-holdings-sales` exchange list, Sushi as a Stellar
AMM venue in `q-eco-dex-saturation`, the October paper in `q-raph-xlm-staking`, `stellar-rpc v30.0.1` in
`q-ti-self-host-retention-backfill`. Each is dated or marked "accept later" in the case.

Key facts: I found none a correct agent could not satisfy from another good source. Weakest:
`q-eco-dex-saturation` KF3 and `q-ti-compute-token-lp-market-data` KF4 (formulas required) are
checkable but narrow. Tool names in judge-facing text: only in the tool-lane case
`q-scf-pitch-prep-live` (expected) and in L3. Merge survivors that lost a fact: M4.

## 5. Taxonomy

`eval/qa/taxonomy.json` holds `domains`, `leaves` (id, title, domain, weight, volatility, cases), and
`openSlots` only: what the lint needs, nothing else. 14 domains, 167 leaves, targets sum to 249. 16
open slots, each with a reason. Fourteen say "Awaiting a verified proposal" and name a facet; all 14
of those leaves have at least one proposal on disk (`tooling.version-compat`, weight 3, has three and no
active case, so the most important leaf is open). Three slots carry waivers that name a covering case or test
(`network.upgrade-process` by `q-pc-protocol-upgrade-timing`, `standards.sep31-sep38` partly by
`q-sep-catalog-list`, `behavior.paid-action-refusal` by `test/policy.test.ts`); I confirmed all three
covering files exist. Reasons are honest. 143 of 167 leaves are covered (24 empty: 16 slots and
8 weight-1 leaves).

Ten leaf spot-checks (hash order, salt `leafcheck:`): `q-soroban-simulate-resource-fee`,
`q-smart-wallet-fee-sponsorship`, `q-pc-fee-bump-channel-accounts-feepool`, `q-zk-proof-systems-stellar`,
`q-edge-noinfo-stellar-native-privacy-default`, `q-soroban-contract-build-verification`,
`q-sor-require-auth-propagation`, `q-stellar-recurring-payments`, `q-pc-account-activation-not-found`
fit their leaf; `q-pc-multisig-setup-lifecycle` is the doubtful one (L5).

## 6. Gates

All run bare, in order, from the repo root, no argument added beyond the brief. `git status` was clean
afterwards (the gate logs are in the scratchpad `gates/` directory).

| Command | Exit | Note |
|---|---|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 150 files passed, 1 skipped; 3,393 tests passed |
| `npm run build` | 0 | |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 101 warnings (main: 81); `headline=210; tool=6; leaves=167; covered=143; openSlots=16` |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 | 0 errors, 101 warnings |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:selftest` | 0 | all checks passed |
| `npm run eval:routing -- --gate` | 0 | GATE PASS |
| `npm run eval:qa:sentinels -- --check` | 0 | 21 sentinels, 0 errors, 0 stale |
| `npm run eval:qa:compile` (extra) | 0 | no file changed |
| `npm run secrets:scan -- --tree` (extra) | 0 | clean |

Warnings by kind: 78 key-fact (60 "multiple predicates"), 20 avoid, 2 numeric, 1 corroboration (see L4).

## 7. Docs

- `eval/qa/README.md` and `eval/qa/corpus/README.md` describe current behavior: lint rules, tool lane,
  `truth.leaf` `notes` `lane`, merge as retirement, held-out rule, CI pin list. No history in either.
  Add the M2 line.
- Grep for `CATEGORY_FLOORS`, "category floor", "35%", "scheduled share", "operation floor", "skill
  floor", "cross-service floor", "catalog-note trap", "NEG/soft-empty" across live docs and code (outside
  `research/`, `eval/corpus/`, and dated round notes): one live hit, `ecosystem-skills/README.md:163`
  (M1). `consistency-register.json` `$comment` already says "216-case battery"; no "501" remains in
  `README.md`, `CONTRIBUTING.md`, or `docs/`.
- `.agents/skills/golden-truth/SKILL.md`: M3.
- `.agents/TODO.md` entry exists with a done-when rule; it should also name the M2 gaps.

## Reconciliation note

I wrote only this file. An untracked `gap/verify-gap.json` appeared in the worktree during the review;
it belongs to another lane and I did not touch it.
