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

## Delta review: `c7dbdc87..aaaf107f`

Reviewer: Claude Sonnet 5.5 (same lane). Scope: `git diff c7dbdc87 aaaf107f` without the `origin/main`
merge (`9b4c9a52`: the catalog search, MCP tools, and their tests are not reviewed here). I checked out
`aaaf107f` for the checks, read `apply/FINAL.md` only to know what to verify, and returned to the branch
afterwards; the branch tip `fc566aaf` adds only ledger and brief files. Scripts are in the same
scratchpad (`act.mjs`, `lifecycle-proof.mjs`); live reads are dated 2026-11-14.

**Verdict: fit to merge.** M1 to M4 and L1 to L3 are fixed as claimed, with two small residues (D1,
D2) that do not block. The 36 activations carry exactly the verify-gap decisions. The register closure
matches the re-sweep. The one post-review correction is right. D1 to D4 are optional.

### Findings

**D1 (low). Two more merge survivors lost a fact their tombstone says to add.** M4 is fixed for the
three cases I named, but my keyword scan missed a second wording ("the orchestrator must add the
avoid ..."). `q-infra-simulate-transaction-howto` says the survivor `q-soroban-simulate-resource-fee`
must carry "Do NOT claim simulation runs through a Horizon endpoint; it is a Stellar RPC method." The
survivor's only avoid item is "Do NOT hand-pick a footprint or claim simulation submits or guarantees
success." Fix: add the avoid item, with a `truth.verified` event. A grep of every tombstone for
"must add" or "must name" returns only this id and `q-infra-secp256r1-passkeys` (fixed).

**D2 (low). Tombstone reasons: 16 still carry audit-process commentary; two instructions are now
stale.** FINAL.md says 90 reasons were rewritten as self-contained sentences. I confirmed it: 90
tombstones changed, nothing else in them changed, no reason matches a score word, none names a round
file or says "see", and the five "Proposal (not active)." reasons now say why (for example "never-
activated proposal ... a Raven-mechanics question with no taxonomy leaf"). Sixteen unchanged reasons
still read as verifier commentary ("Retire is right ... but the named survivor X is itself retired by
the defi lane, so the tombstone must name ..."): `q-builder-content-by-person`,
`q-defi-skill-ecosystem-scout`, `q-gap-digest-soroban-adjacent`, `q-gap-scout-list-skill-directory`,
`q-history-ecosystem-index-freshness-live`, `q-scf-cross-decaf-sep24`, `q-scf-skill-stellar-scout`,
`q-sor-doc-page-sections-followup`, `q-sor-doc-title-discovery`, `q-sor-skill-openzeppelin-setup`,
`q-ti-vocab-content-tags-live`, `q-ti-vocab-project-tags-live`, `q-tool-oracle-repo-live`,
`q-tool-taxonomy-dispatch-live`, plus `q-infra-secp256r1-passkeys` and `q-infra-simulate-transaction-howto`
(both still say "the orchestrator must add ..."; the first is done, the second is D1). They pass the
lint and name evidence. Fix: one self-contained sentence each; drop the instruction in the last two.

**D3 (low). A residue of as-of lag.** L1 is fixed for what it names. `q-protocol-ledger-close-time` now
says "five sampled closes on 2026-11-14 were 5 seconds apart" (I re-sampled: 5, 5, 5, 5, 5 s,
protocol 29). `q-pc-practical-fee-setting` now cites Horizon `fee_stats` (base fee 100) and the Docs
"cannot be lower than 100 stroops per operation". `truth.asOf` moved to 2026-11-14 in the 18 cases
FINAL lists, and the move is evidenced: the 14 sentinels behind them re-ran live (`source-sentinels.mjs
--ids ...`: 14 of 14 `hold`), and the other cases were observed in the audit's rot checks or in the two
stamp fixes. Seven cases still have an answer date later than `asOf`: three because the later date is a
future event (`q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`,
`q-protocol-version-history-list`), four because a rot entry was `unverifiable` or `changed`
(`q-scf-audit-bank`, `q-scf-sdf-bug-bounty`, `q-ti-openzeppelin-relayer`, `q-infra-software-versions-
current-protocol`, whose newer `asOf` is correct and whose date is the Protocol 30 vote). All are
defensible; FINAL's "all 18" counts what moved, not what is left.

**D4 (low). The correction's event overstates its review, and the canonical page contradicts the
answer.** `q-token-xlm-supply-total-circulating` cites `verify-gap.json#...(accept)` as "independent
verification", but verify-gap reviewed the pre-correction answer. This delta review is the independent
check (below). Separately, the Docs `lumens.md` page that the case cites still says "all XLM that has
ever existed and will ever exist was created when the Stellar network went live", a few lines above its
own inflation paragraph. An agent quoting that sentence contradicts the golden; the skill's
canonical-page rule asks for a grading caution in `golden.notes` and a cap tied to an active
`improvements/` finding. Fix (optional): file the Docs contradiction as a finding and add the caution.

### M1 to M4 and L1 to L3: confirmed

| Item | Result |
|---|---|
| M1 | `ecosystem-skills/README.md` step 6 now points to `eval/skills-cases.json` (file exists) and asks for a QA case only for a taxonomy leaf. `skill floor` appears nowhere in live docs. |
| M2 | One paragraph added to `eval/qa/README.md`: the headline battery does not measure operation reach, skill reach, or envelope traps. The four trap gaps remain, by the orchestrator's decision. |
| M3 | `golden-truth` `SKILL.md` now sends unverifiable facts to `truth.notes`, states the compaction rule and `truth.lane`, and extends the Leaf and Retire lines. Timeless: no dates, IDs, or run stamps. |
| M4 | All three answers gained the clause; key facts, avoid, and notes are unchanged. Each carries a `truth.verified` event citing the tombstone and a live source: Docs smart-wallets and W3C WebAuthn L3 (alg -7 and -257), `soroban-examples` `groth16_verifier/README.md`, Docs `control-asset-access.md` ("an issuing account can't actually hold a balance of its own asset"). Answer lengths 98, 78, 72 words. D1 is the one miss. |
| L1 | See D3. |
| L2 | See D2. |
| L3 | `q-defi-blend-alternatives`: the avoid item now says "a directory listing" and the `ll-033` provenance is in `truth.notes`. `q-defi-liquid-staking-whitespace`: the sweep sentence is gone from the answer, now "As of 2026-11-02 no native XLM liquid-staking token was found". The seven cap cases keep finding IDs because `lintCapFindings` needs them. The compile of the battery finds tool or product names in only four headline cases (`q-ai-mcp-servers-connect`, whose subject is Raven; the three cap cases). |

L4 to L8: unchanged or fixed as stated. `isToolLaneCase` is no longer exported (L7); the COMPUTE
caution moved from `avoid` to `notes` (L8, with the avoid list down to two items). Warnings are 100 (78
key-fact, 20 avoid, 1 corroboration, 1 numeric); median headline answer is 60 words, 121 of 246 over 60.

### The 36 activations

`gap/verify-gap.json` holds 36 decisions (29 accept, 7 amend, 0 reject). `act.mjs` compared each
activated case with its proposal at `c7dbdc87` plus the amendment: question, answer, key facts, avoid,
and notes equal the amended text where the decision gives one and the proposal text otherwise; `surface`
and `tags` are unchanged except the two freshness amends (`q-validator-why-run-no-rewards` and
`q-soroban-fee-refundable-rent` are `stable` with no `reverifyBy`); each case sits in the directory
named by `tags.category`; every `truth.leaf` equals the proposal's. Lifecycle records are complete in
all 36: `state: active`, `activation` with date, author (gap-1, gap-2, gap-3), reviewer (verify-gap,
Opus 5.5, never the author), ledger, and evidence. Every `truth.verified` event cites verify-gap, and
the seven amended cases cite the reviewer's decision. `truth.origin` is `authored ...`, which the ledger
exempts. The only deviations from "proposal plus amendment" are the ones FINAL.md names:

- four `reverifyBy` re-spreads (`q-asset-usdt0-layerzero-oft` 2027-02-09 to 02-10,
  `q-token-xlm-supply-total-circulating` 02-09 to 02-11, `q-nft-vault-contract-standards` 02-23 to 02-25,
  `q-pc-core-software-audits` 03-23 to 03-24), which resolve the collisions verify-gap flagged (no
  duplicate date remains among the 36);
- the supply answer correction (below).

Lifecycle proof re-run on the new tree: 0 problems. 252 battery cases (246 headline, 6 tool), 0
proposals, 291 retired, 543 reserved, no id reused, all 36 new ids absent from the old reserved set.
Not carried into any case: `ravenReach` (grep of the battery finds none). Open work this delta does not
do: verify-gap marks 8 proposals `unreachable` and 1 `reachable-not-surfaced` for Raven
(`q-crp-public-sector-cbdc-pilots-stellar`, `q-sdf-2026-strategy-priorities`, `q-net-tier1-roster-current`,
`q-pc-quorum-freeze-cap77`, `q-stellar-vs-xrp-ledger`, `q-signing-safety-website-request`,
`q-scf-service-provider-directories`, `q-infra-version-lag-errors`; `q-pay-merchant-request-detect-
reconcile`). The TODO's done-when needs an `improvements/` finding or a recorded decision for each;
none appears in this diff.

### Register closure

The re-sweep lanes hold 105 entries (57 consistent, 26 text-edit, 12 drop-member, 10 delete-entry).
Applied: all 10 deletions are gone from the register; all 12 drop-member entries lost the named member
(`cluster-008`, `-009`, `-015`, `-016`, `-019`, `-021`, `-042`, `-044`, `-045`, `-090`, `-129`, and the
base-reserve invariant); the text-edit entries changed (the Confidential Tokens trap's
`triggerDateEvent` was rewritten, as FINAL says). `resweep/review.json` has 95 entries (82 clusters, 7
invariants, 6 traps) and the register has 96; the one entry without a review is `cluster-099`, which was
never reopened (`lastChecked` 2026-11-02, not in the re-sweep). Every review entry matches a register
entry, none targets a deleted entry, and each `reSwept.reason` carries the re-sweep text with the
instrument lane's re-check sentence where members changed later. `npm run eval:qa:register -- --check`:
exit 0, up to date. The four new-case cluster additions (`cluster-053`, `-024`, `-009`, `-008`) share a
real fact with the added case (genesis and inflation supply; Protocol 29 and the 2026-11-23 vote;
SEP-31 Active and SEP-38 Draft; CAP-0077 in Protocol 26).

### Re-derived correction: `q-token-xlm-supply-total-circulating`

The answer now says: 100 billion created at genesis, about 5.44 billion added by 1% annual inflation,
Protocol 12 disabled inflation in October 2019, total supply 50,001,786,837 and about 35.4 billion
circulating as of 2026-11-14. Re-derived from primary sources, 2026-11-14:

| Claim | Source | Result |
|---|---|---|
| 100 billion at genesis; 5,443,902,087.35 from inflation | SDF dashboard API `/api/v3/lumens`: `originalSupply 100000000000`, `inflationLumens 5443902087.3472865` | holds |
| 105,443,902,087 ever existed | Horizon `ledgers?order=desc&limit=1`: `total_coins 105443902087.3472865` | holds |
| Inflation ended by validator vote, October 28, 2019 | Docs `lumens.md`: "network inflation was ended by validator vote on October 28, 2019" | holds |
| Protocol 12 disabled it | `stellar-protocol` `core/cap-0026.md`: Status Final, Protocol version 12 | holds |
| Total 50,001,786,837; circulating about 35.4 billion | Dashboard: `totalSupply 50001786837.397`, `circulatingSupply 35407570603.996`, `burnedLumens 55442115249.95` | holds (the answer's figures match the first read of the day; they drift by units) |
| The burn leaves `total_coins` at 105.44 billion (notes) | Docs: burned lumens are "sent to accounts with no signers" | holds |

The correction is right and the earlier "all lumens were created at genesis" wording was wrong. The
fact is corroborated by three source classes (A, B, C). Key fact 3 and the avoid items stand. D4 covers
the verification event and the contradicting Docs sentence.

### Gates (bare, on `aaaf107f`)

| Command | Exit | Result |
|---|---|---|
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 100 warnings; `headline=246; tool=6; leaves=167; covered=164; openSlots=2` |
| `npm test` | 0 | 150 files passed, 1 skipped; 3,398 tests passed, 3 expected fail |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:qa:compile` (extra) | 0 | no file changed |
| `npm run eval:qa:sentinels -- --ids` (14 changed anchors, live, extra) | 0 | 14 of 14 `hold` |

Untracked `qa/` appeared beside the round files during this review (another lane); I did not touch it.

---

# Final delta review: c93f0f94..f956bbd8 (HEAD)

Reviewer: review lane, Claude Sonnet 5.5. Scope: the diff `c93f0f94..HEAD`, the six findings added in
`c93f0f94` (`sd-105` to `sd-108`, `sls-117`, `sls-118`), and the two new `.agents/TODO.md` entries.
Re-derived from the files and live sources on 2026-11-14, not from `apply/CLOSEOUT.md`.

## Verdict

**Fit to merge.** There is no blocking finding. Two low-severity items (F1, F2) and one note (F3) are
worth fixing before merge; none changes a case answer, a finding, or a gate. Nothing was posted
upstream.

## Findings

| # | Severity | Where | What is wrong | Fix |
|---|---|---|---|---|
| F1 | Low | `eval/qa/corpus/retired/q-sor-contract-as-claimable-arbiter.json` `reason` | The tombstone says the survivor `q-sor-classic-dex-from-contract` "absorbs ... 'escrow is a contract holding SAC or SEP-41 balances'". The closeout deleted that key fact from the survivor (the question does not ask for it, and I agree) and the survivor's answer does not state it. The tombstone now claims a fact the battery no longer holds. | Reword the reason: the survivor carries "contracts cannot interact with claimable balances"; the programmable-escrow fact was dropped as unasked. |
| F2 | Low | 11 tombstones in `eval/qa/corpus/retired/` | D2 is fixed for the 16 named reasons, but the same class remains elsewhere: `q-builder-by-region-latam` ("The purpose label is wrong"), `q-comp-cross-moneygram-partnership-sep24`, `q-comp-cross-bitso-sep31`, `q-asset-rwa-tokenized-freshness` ("should be recorded as holds"), `q-edge-fresh-most-recent-news` ("The rot row records ordinary drift"), `q-defi-streaming-payments-prior-art` ("the stated duplicate is wrong"), `q-sor-stale-spec-after-upgrade` ("The lane's 'missing' list"), `q-ti-vocab-project-categories-live`, `q-crp-custodial-vs-noncustodial-wallets` ("reconciler should confirm it survives"), `q-gap-scout-changelog-envelope` ("Retire is right."), `q-protocol-validator-upgrade-vote` ("reasonable to drop"). The lifecycle script's `scoreWordReasons` still prints the last two. They are audit-process commentary, not a score; none is false except as noted in F1. | Reduce each to one self-contained sentence, as the 16 were. Cosmetic. |
| F3 | Note | `.agents/TODO.md`, "Check Docs search for the SEP-7 payment-request page" | The entry's claim reproduces, but it omits what makes the check cheap. `search_docs('web+stellar:pay payment request QR code')` returns no `/wallet/sep7` page (ten hits, none), as the entry says. The bare query `web+stellar:pay` returns `/docs/build/apps/wallet/sep7#pay-operation` first. The miss therefore comes from the added words, not from the index or Raven's scoping. | Add the bare-query contrast to "Next step". It points the check at ranking, so the owner may be upstream. No change needed to "Nothing is filed". |

No other defect found. In particular: no judge-facing text in the 12 edited cases names a tool or a
verdict (scanned question and `golden` for `scout.`, `lumenloop`, `stellarDocs`, `codemode`, `Raven`,
`search_docs`, `RESULT`, `verdict`: no hits).

## D1, D2, D4: confirmed fixed

| Item | Result |
|---|---|
| D1 | `q-soroban-simulate-resource-fee` now carries "Do NOT claim simulation runs through a Horizon endpoint; it is a Stellar RPC method." The Docs page `.../api-reference/methods/simulateTransaction` is an RPC method reference. The merged tombstone `q-infra-simulate-transaction-howto` now says the survivor carries it. |
| D2 | The 16 reasons are one sentence each. Every `q-` id, `eval/` path and `test/` path they name exists (script over all 291 tombstones: 0 unknown ids, 0 missing files). `q-infra-secp256r1-passkeys` says the survivor carries "WebAuthn permits algorithms other than P-256" and "a separate G account submits and pays": both are in the `q-passkey-smart-account-architecture` answer. Residue: F2. |
| D4 | The supply case's event now cites this file's "Re-derived correction" as the independent check and says verify-gap predates it. `golden.notes` names the Docs sentence as a partial-capped quote while `sd-105` stands. `sd-105` is `verified`, so the lint accepts the cap. |

## The 12 edited cases

Rule: each change must (a) rest on a defect in the case itself (a key fact the question does not
ask for, a bundled predicate, or a claim the sources do not support), not on a verdict; (b) keep every
fact that matters; (c) be true. I read all 12 diffs.

| Case | (a) Independent defect | (b) Fact kept | (c) Checked |
|---|---|---|---|
| `q-comp-yieldblox-oracle-incident` | Yes: one key fact bundled a causal claim with a list | Split in two; nothing dropped | Facts unchanged |
| `q-defi-agent-identity-stellar-experimental` | Yes: ERC-8004's payment scope is not asked | Kept in the answer; the Draft key fact stays | eips.ethereum.org/EIPS/eip-8004 shows "Draft" (live) |
| `q-defi-blend-alternatives` | Yes: disclaimers about unasked systems | Moved to two avoid items; classification guard kept | Classification unchanged |
| `q-defi-blend-audit-record` | Yes: the question needs one place, the fact required two | "Docs, repositories or the Security Portal" | `docs.blend.capital/audits-and-bug-bounties.md` shows V2 Audits, Certora, Code4rena (live). The Security Portal rests on an existing corroboration row, not on this page |
| `q-hist-meridian-2026-corrected-venue` | Yes: bundled dates and an announcement date | Superseded plan kept; dates in the answer; avoid unchanged | Unchanged |
| `q-pay-anchor-msb-licensing` | Yes: the question names no jurisdiction and `golden.notes` says none is asserted | US example and Travel Rule stay in the answer | Jurisdiction-neutral wording holds. I did not re-fetch fincen.gov (the page did not return text to `curl`) |
| `q-sor-classic-dex-from-contract` | Yes: programmable escrow is not asked | Dropped; the claimable-balance fact stays | Overview page quote unchanged. See F1 for the tombstone |
| `q-stellar-vs-xrp-ledger` | Yes: three of four key facts were XRP Ledger-side, which no Raven source covers | XRP Ledger facts stay in the answer as attributed context; `notes` says a false XRP claim is still wrong | See below |
| `q-ti-parse-raw-ledger-data` | Yes: `getTransactions` types are not asked | Removed from answer and key facts | Corroboration kept |
| `q-ti-testnet-usdc-faucet` | Yes: SAC clause is not asked | Reserve and trustline fact kept | Issuer unchanged |
| `q-soroban-simulate-resource-fee` | Yes (D1) | Avoid item added | RPC method page (live) |
| `q-token-xlm-supply-total-circulating` | Yes (D4) | Answer unchanged | See "Re-derived correction" above |

### `q-stellar-vs-xrp-ledger`: changed claims against primary sources

| Claim | Source (read 2026-11-14) | Result |
|---|---|---|
| Each SCP validator chooses its own quorum set | Docs `stellar-consensus-protocol.md`: "A node's trusted set of nodes is called a quorum set" (and "a node's opinion ... depends on the opinions of its quorum set") | Holds |
| Stellar replaced its Ripple-derived consensus with SCP in 2015 | `stellar.org/blog/developers/upgraded-network-is-here`, dated 2015-11-03: "It uses the Stellar Consensus Protocol (SCP)" | Holds. The Ripple-derived start rests on the carried SEC filing row; causation of the fork is not asserted, consistent with `q-hist-scp-rewrite-2015` |
| Fees go to a locked account no one can spend | Docs `fees-resource-limits-metering.md`: "go into a locked account and are not given to or used by anyone" | Holds |
| Every asset but XLM has an issuer; holders opt in with a trustline | Docs `assets.md`: "must establish a trustline with the issuing account"; `lumens.md`: "The lumen is the only token that doesn't require an issuer or trustline." | Holds; "classic assets" scopes it correctly against contract tokens |

A correct agent can satisfy all four key facts from Stellar Docs alone. The XRP Ledger half of the
answer is now unscored context, as the audit intended.

## The six findings

Each live trigger was run once on 2026-11-14.

| Finding | Trigger result | Gap real | Owner right | Form |
|---|---|---|---|---|
| `sd-105` | `lumens.md` line 49 holds "all XLM that has ever existed and will ever exist was created when the Stellar network went live"; line 76 holds the inflation definition (the finding cites the `.mdx` lines 48 and 75; the rendered `.md` is one line later) | Yes | `stellar/stellar-docs` (docs content) | Pass; `probe` present |
| `sd-106` | Page text: 0 hits for Blockdaemon or Franklin Templeton. `stellar-core.cfg` prints the ten `HOME_DOMAIN` values named | Yes | `stellar/stellar-docs` | Pass; recurrence entry in the pipeline form |
| `sd-107` | Docs overview line 71 has only "should match the version of the host functions supported"; `parsed_module.rs` line 382 holds "contract protocol number is newer than host", with the "Future protocols we don't allow" comment above it (main `5fdf6e62`, as cited) | Yes | `stellar/stellar-docs` (the rule belongs in the docs; the host is correct) | Pass; `probe` present |
| `sd-108` | `gh search code` for "blind signing" and "unsolicited" in `stellar/stellar-docs`: 0 results each | Yes. It is an absence claim | `stellar/stellar-docs`, "missing guidance" as `improvements/README.md` allows; the finding states the placement is a judgment | Pass. It has no `probe`, which is right: an absence of a page has no stable string to match |
| `sls-117` | Both `sdf-org` queries: HTTP 200, 25 rows, the same nine URLs; none of `foundation/strategy`, `foundation/roadmap`, `service-providers`, `stellar.org/community` | Yes | Stellar-Light (Scout research corpus) | Pass |
| `sls-118` | `SLP-0006` query: 200, rows from `audit, cap, dev-docs, incident, sdf-blog, sep`; no `limits/` row. `limits/` holds `slp-0001` to `slp-0008`; `slp-0006` is "Freeze YieldBlox Exploit Stellar Accounts", Final, 2026-05-07; `slp-0008` is "Freeze Mercado Bitcoin Exploit Stellar Account", Final, 2026-11-02 | Yes | Stellar-Light | Pass; recurrence entry present |

Nothing was posted upstream: no finding is `reported-upstream`, no evidence line holds an issue or pull
request URL, `intake.json` only adds four `stellar/stellar-docs` per-finding targets, and a
`generated-by-stellar-raven` marker search on `stellar/stellar-docs` and the `Stellar-Light`
organization since 2026-11-13 returns nothing. `npm run improvements:lint` exits 0 (83 findings).

## TODO entries

| Entry | Sound? |
|---|---|
| Decide whether `stellar.org` pages outside Docs belong in a Raven source | Yes. It states an owner decision, not a finding, with three options, a next step and a done-when under "Owner decisions" (section exists at line 774). The `RESULT.md` link and the "Corpus-coverage diagnostics" anchor exist. The scope split with `sls-117` is correct: `sls-117` names strategy, roadmap and service-providers pages; the Audit Bank page is not in it. It names no case ID. |
| Check Docs search for the SEP-7 payment-request page before filing | Yes, with F3. `/docs/build/apps/wallet/sep7.md` exists and holds `web+stellar:pay` three times. Scout returns the page for the long query, as stated. The done-when has three exits, including "no defect". |

## Gates

Run bare in this worktree at `f956bbd8`, clean tree.

| Command | Exit | Result |
|---|---|---|
| `npm test` | 0 | 150 files pass, 1 skipped; 3,398 tests pass, 3 expected fail, 1 skipped |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors; `headline=246; tool=6; leaves=167; covered=164; openSlots=2` |
| `npm run improvements:lint` | 0 | 83 findings |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:qa:compile` | 0 | wrote no tracked change (`git status` clean) |
| Lifecycle proof script | 0 problems | 210 headline + 6 tool + 291 retired; 543 reserved ids; 36 new ids, none retired |

## Open, as the closeout states

Two unreachable cases, `q-stellar-vs-xrp-ledger` and `q-crp-public-sector-cbdc-pilots-stellar`, are
recorded in `gaps/GAPS.md` only as "outside Raven's scope". That is the lane's judgment, not a
recorded owner decision. The TODO "Finish the audit" done-when stays open until the owner records it.
This does not block merging the branch, because that entry stays in the queue.

---

# Reconcile review: f3a2607f..5b4db31a (HEAD)

Reviewer: review lane, Claude Sonnet 5.5. Scope: `git diff f3a2607f..HEAD`, the five case edits in
`apply/RECONCILE.md` "Cases changed". Each changed claim was re-derived on 2026-11-14 from the
primary source, not from the reconcile report or `reconcile-review.json`.

## Verdict

**Fit to merge.** All five edits are true, justified, and lose nothing that matters. There is no
blocking finding. Two low-severity notes follow; neither needs a code or case change before merge.

## The five edits

| Case | Edit | True? | Justified? | Loses nothing that matters? |
|---|---|---|---|---|
| `q-pc-protocol-27-zipper` | Grader note: the SDF guide says `SOROBAN_CREDENTIALS_ADDRESS` stays valid only until Protocol 28; it stays valid; an answer saying it stopped working is wrong | Yes | Yes: adds a guard against a real source conflict; no key fact, answer or avoid changed | Yes: nothing removed |
| `q-soroban-require-auth` | Grader note: `require_external_auth` and `require_external_auth_for_args` are a Draft CAP-0089 proposal for Protocol 31; naming them as that is accurate, presenting them as shipped is wrong | Yes | Yes: a correct answer that cites the proposal would otherwise read as fabrication | Yes: nothing removed |
| `q-hot-sdf-xlm-holdings-sales` | Grader note scoped to the Developer Docs lumens page; SDF's mandate page does show dated per-bucket balance tables | Yes | Yes: the old note ("docs page lists accounts without balances") could be read as "no source shows balances", which the mandate page contradicts | Yes: the guard on undated and summed balances stays |
| `q-org-sdf-board-directors` | Removed key fact "Dates the leadership roster it cites" | Yes (roster unchanged) | Yes: a phrasing requirement, not a world fact | Yes: the answer still dates the roster, and the notes accept later official changes with an observation date |
| `q-edge-noinfo-stellar-native-privacy-default` | Removed key fact "Dates each privacy product's network and audit status" | Yes (no world fact changed) | Yes: in a fabrication-bait trap a missing phrasing fact grades the case wrong | Yes: the avoid item "Do NOT present unaudited Testnet previews as audited Mainnet products" and the dated answer remain |

## Re-derived claims

| Claim | Source (read 2026-11-14) | Result |
|---|---|---|
| CAP-0071-02 keeps `SOROBAN_CREDENTIALS_ADDRESS` valid | `stellar-protocol/core/cap-0071-02.md`: Status Final, Protocol version 27. Section "No deprecation of `SOROBAN_CREDENTIALS_ADDRESS`": "we keep the existing credential type and preimage type valid ... there is no rush to update clients". It adds only that a later protocol (28 or later) "may want to consider deprecating" | Holds. "No deprecation scheduled" is a fair reading: the CAP schedules nothing |
| The Zipper guide says otherwise | `stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide`: "The existing SOROBAN_CREDENTIALS_ADDRESS type remains valid until the Protocol 28 upgrade" and "AddressV2 will replace V1 in Protocol 28" | Holds. The conflict is real |
| Protocol 28 did not remove it | Horizon `ledgers?order=desc&limit=1`: ledger 65470502, `protocol_version` 29. `rs-soroban-env` `main` `auth.rs` lines 2366, 2375: `SorobanCredentials::Address` is matched beside `AddressV2` and `AddressWithDelegates`, with no protocol gate (the note cites `5fdf6e62`; `main` agrees) | Holds. The source reading is inference, not a ledger submission, and it is enough: a removal would have had to delete the match arm |
| CAP-0089 is a Draft for Protocol 31 | `stellar-protocol/core/cap-0089.md`: "Host functions for invoker-less authorization", Status Draft, Created 2026-10-16, Protocol version 31; it defines `require_external_auth` and `require_external_auth_for_args`. Mainnet is Protocol 29 | Holds |
| SDF mandate page shows dated per-bucket tables and promises balances "imminently" | `stellar.org/foundation/mandate`: Growth "Total 5,208,204,928 Last updated: November 14, 2026 at 1.08 AM UTC"; other buckets updated November 11 and 13; "the real-time public balances of XLM held by SDF will be made available again on this page imminently" | Holds. The differing timestamps also show why the existing "do not sum mixed-timestamp bucket rows" guard stays right |
| Docs lumens page lists accounts without balances | `developers.stellar.org/docs/learn/fundamentals/lumens.md`: "The on-chain accounts in each bucket, as of July 2026, are listed below — balances change continuously, so refer to the mandate page ..." | Holds |
| Board and CEO unchanged | `stellar.org/foundation/team`: Denelle Dixon, Jed McCaleb, Lin-Hua Wu, Ronaldo Lemos, Ginger Baker, Asiff Hirji all present | Holds |
| The two removed key facts were dating-only | Read both cases in full: each answer still carries the date ("As of 2026-11-14") and the world facts are unchanged | Holds |

## Notes

| # | Severity | Where | Note |
|---|---|---|---|
| R1 | Low | `q-pc-protocol-27-zipper` `truth.verified` event | It says "The golden states no deprecation and is right". The golden answer does not mention deprecation; it names the V2 credential only. The grader note is correct and needed, but the event overstates what the golden says. Judge-blind text only. Fix by wording: "The golden is silent on deprecation; the note guards against the guide's claim." |
| R2 | Note | same case, record | The note carries no cap because no finding covers the guide: it is `stellar.org` content (class `site-content`), and Raven holds no `improvements/` collection for it. The note's own text records this. If the owner files it, the cap form follows. No action needed before merge. |

The removal of `freshness-drift` from two events' `rootCause` lists is consistent: each remaining
root cause is the TODO entry, and the lint accepts both.

## Gates

Run bare at `5b4db31a`, clean tree.

| Command | Exit | Result |
|---|---|---|
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 98 warnings (unchanged); `headline=246; tool=6; leaves=167; covered=164; openSlots=2` |
| `npm run eval:qa:register -- --check` | 0 | up to date (the 15 reopened entries are closed) |
| `npm run eval:qa:compile` | 0 | no tracked file changed |
| Lifecycle proof script | 0 problems | 291 retired; no id added, retired or reused; only the five case files changed under `battery/` |
