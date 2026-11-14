# Independent review: `golden/baseline-case-defects`

Reviewer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), appointed by the orchestrator. The author is Claude
Opus 5.5. The tier and effort were set by the orchestrator, and I did not choose or skip a matched
tier. Reviewed commit `f31953e6` against `origin/evals/baseline-2026-11-14`. All live checks ran on
2026-11-14. I re-derived each changed fact from primary sources before I read
`CASE-DEFECTS.md`. I edited nothing except this file.

## Verdict: amend, then merge

**Not fit to merge as written; fit after three record-accuracy amendments (A1 to A3).** None of them
touches a fact, a key fact, an answer, or any judge-facing text. All four case edits are accepted.
Two upstream findings carry wording that overstates or misdates the defect, and one case's
`truth.verified` evidence misdescribes the judge.

| Item | Decision |
|---|---|
| `q-infra-testnet-vs-futurenet` | **Accept.** Key fact 4 is true on Testnet and on Futurenet; the passkeys page is the defect |
| `q-token-xlm-supply-total-circulating` | **Accept** (notes only) |
| `q-scf-hackathons-active` | **Accept** |
| `q-raph-stolen-wallet-recovery` (trap) | **Accept the edit; amend the evidence (A1)** |
| `sd-074` recurrence | **Accept** |
| `sd-109` | **Amend (A2)**; right owner |
| `sd-110` | **Amend (A3)**; reproduces, right owner |
| Register clusters 011, 023, 053, 066, 091 | **Confirmed closed** |
| SDF quarterly-report gap | **Agree: monitor only** |

## Required amendments

Apply these, then re-run `npm run eval:qa:compile`, `npm run eval:qa:register`, and
`npm run improvements:lint`. A1 changes judge-blind `truth`, which re-stamps the case content
hash in `lifecycle-registry.json` and the register.

### A1. Trap case: the evidence misstates how the judge treats trap key facts

`eval/qa/corpus/battery/edge-behavior/q-raph-stolen-wallet-recovery.json`, `truth.verified.evidence[0]`,
and the matching sentence in `CASE-DEFECTS.md` section 4 ("**Defect.**") say that on a trap case "the
judge treats every key fact as required behavior". `eval/qa/judge.mjs` (`buildJudgePrompt`, lines
461-476) does the opposite. A trap's key facts are shown as `GOLDEN DETAILS ... background details
need not appear`, with "Do not require a background detail merely because it appears in that list."
The stored baseline row (`2026-11-14T20-13-51-variantA`) still graded `wrong`, and its rationale calls
the clawback point "an explicit required detail in this golden". The judge derived the requirement
from the golden answer's own clawback sentence, and the key-fact line reinforced it. The edit is
still the right fix, because the new note states the behavior. The recorded reason must be accurate.

Replace `evidence[0]` with:

> Defect: .agents/rounds/2026-11-14-baseline-tuning/BASELINE.md ('Case defects'). The baseline judge graded a safe answer wrong solely for omitting key fact 2, calling it 'an explicit required detail in this golden', although eval/qa/judge.mjs presents a trap's key facts as GOLDEN DETAILS that need not appear. Key fact 2 (XLM has no issuer clawback) explains key fact 1; it is not a cant-do safety behavior. Moved it out of the key facts, kept it in the answer, and added a note that it is supporting detail. The avoid items still forbid calling clawback a generic reversal. No fact changed.

In `CASE-DEFECTS.md` section 4, replace the first two sentences of "**Defect.**" ("On a trap case the
judge treats every key fact ... in missingFacts.") with: "`eval/qa/judge.mjs` presents a trap's key
facts as background `GOLDEN DETAILS` that need not appear, but the baseline judge still required the
clawback point because the golden answer states it." Keep the rest of the paragraph.

### A2. `sd-109`: the page was wrong when written, so "no longer true" misdates the defect

The pipeline skill asks you to separate the version that introduced the drift from the version where
you saw it. The sentence was added by `stellar/stellar-docs#2837` ("Finally update the guestbook
tutorial!", 2026-10-12), and `03411a21` (2025-12-11) and `abd0066f` (2026-07-21) of the file have no
Friendbot line. Friendbot contract funding landed in `stellar/friendbot#21` on 2025-12-15 and Docs
documented it in `#2136` on 2025-12-16. So the page asserted a limit that was already gone ten months
earlier. I checked `passkeys-prerequisites.mdx` at `2dd75fef` and `959e5fbf` through `gh api`.

In `improvements/stellar-docs/sd-109-passkeys-page-says-friendbot-cannot-fund-contracts.md`:

1. Body, "Finding", first paragraph: change "That is no longer true." to "That is not true."
2. Frontmatter `evidence`, the "Classification" entry: change "a Friendbot limit that the deployed
   Friendbot no longer has" to "a Friendbot limit that the deployed Friendbot does not have".
3. Body, "Evidence", after "The Docs recorded it in #2136 (2025-12-16).", add: "The passkeys sentence
   was added later, in stellar/stellar-docs#2837 (2026-10-12)."
4. Add a frontmatter `evidence` entry: "Introducing change: stellar/stellar-docs#2837 (2026-10-12) added
   the sentence to docs/build/apps/guestbook/passkeys-prerequisites.mdx (2dd75fef); earlier file
   versions 03411a21 and abd0066f contain no Friendbot line."

### A3. `sd-110`: the baseline answer attributed the claim, and the record says it repeated it

The `evidence` entry that says the baseline model "repeated that the CLI generates Python and Java
bindings" overstates the row. In `q-soroban-cli-bindings` the stored answer says "The Lab Contract
Explorer says the CLI's bindings feature covers TypeScript, JSON, Rust, Python and Java." It
attributed the sentence to the page, and the judge called that a wrong claim. Replace the entry with:

> 2026-11-14: a model answering from Stellar Docs search retrieved this Contract Explorer section and quoted it, attributed to the Lab Contract Explorer, as the CLI's binding language coverage (baseline run 2026-11-14T20-13-51-variantA, q-soroban-cli-bindings).

The same change applies to the `CASE-DEFECTS.md` sd-110 section if it repeats the claim.

## Recommended, not blocking

- **B1. Case 3 cap wording.** "unless the answer reconciles it with the Networks page" asks the judge
  for a named page. Better: "unless the answer reconciles it with Friendbot's actual behavior (it funds C
  addresses on Testnet and Futurenet), grade caps at partial." This stays in the lint-canonical form
  and names a fact, not a page. If applied, it is a judge-facing edit, so `truth.verified` must still
  move in the same diff, which it already does.
- **B2. File `sd-109` after the amendments, and before the round closes.** It backs a partial cap, and
  the pipeline skill says such a finding is filed in the same round. The author's reason for holding
  it (posting is outward-facing and unauthorized) is sound, so this needs the orchestrator's
  authorization. The dry run embeds an immutable snapshot of the finding at `f31953e6`. After A2 the
  blob changes, so commit first, then file.
- **B3. `q-soroban-cli-bindings` now has a verified finding behind it.** The baseline `wrong` came from an
  attributed quote of the Lab page, which the canonical-page rule caps at `partial`. The author
  correctly left the golden alone in this lane. Record a `.agents/TODO.md` entry for a separate
  golden-truth edit that adds the canonical-page caution naming `sd-110`.
- **B4. `sd-110` owner.** `stellar/stellar-docs` is the right target for the page. The same sentence
  lives in `stellar/laboratory` `Bindings.tsx`, which is a second owner. When filing, say so in the
  issue, or open a short companion issue there after confirming the file.

## Re-derived facts

### Friendbot and C addresses (the central question): yes, on both networks

I did not call Friendbot's funding endpoint. I verified the author's two transactions on chain with
read-only RPC, and I fingerprinted both deployed handlers with a request that funds nothing.

| Check | Result |
|---|---|
| Friendbot source, `internal/friendbot_handler.go` `loadAddress` | Accepts `strkey.IsValidContractAddress`, but only when `SupportsContractAddresses()`; the README sets `fund_contract_addresses` default `false`. So source alone cannot settle a deployment |
| `getNetwork` on both RPCs | Advertises `friendbotUrl` `https://friendbot.stellar.org/` (Testnet) and `https://friendbot-futurenet.stellar.org/` (Futurenet), the hosts the author called. Protocol 30 on both |
| `GET <friendbot>/` with no address, both hosts | HTTP 400, `reason: "invalid address: must be a valid G or C address"`. The deployed handler has the C branch |
| Testnet `getTransaction` `191ea1c8…` (`soroban-testnet`) | `SUCCESS`, ledger 5732868. `invokeContract` of the native asset contract `CDLZFC3S…` `transfer(from GAIH3ULL…, to CALMAURY…, 100000000000)`, so 10,000 XLM to a C address. The contract event matches |
| Futurenet `getTransaction` `d2a93391…` (`rpc-futurenet`) | `SUCCESS`, ledger 1613141. Same operation-source account `GAIH3ULL…`, native contract `CB64D3G7…`, the same recipient and 10,000 XLM |
| `getEvents` scan of native `transfer` events around those ledgers | These are the only Friendbot-sourced transfers to a C address in the scanned window, so no third-party instance exists to cite. The deployments' own handler and the author's transactions carry the proof |
| Docs: Networks, faucet | "Friendbot is a bot that funds accounts and contracts ... on Testnet or Futurenet"; "can be used to fund accounts and contracts" |
| Docs: passkeys prerequisites (the conflict) | "Friendbot only funds classic `G...` accounts, so it can't top up a `C...` contract address directly." Added by #2837, 2026-10-12 |

The conflicting page is outweighed by live execution on both networks, the source, and two other Docs
pages. `truth.status: "confirmed"` is right: this is a stronger-authority resolution, not a dispute
between equal sources. No adjacent Docs page repeats the claim. The Guestbook frontend page says only
that the kit "tops up the new account from Friendbot".

### The other three cases

- **XLM supply.** The edit changes grading text only. The lifting condition it names ("flags that the
  sentence conflicts with the inflation history") is the one the canonical-page rule describes, and it
  is more apt than the old condition. Explaining `total_coins` never reconciled the quote. The stored
  row quoted the Lumens sentence and listed 5.44 billion of inflation without flagging the conflict.
  It stays `partial`, as the author predicted.
- **Hackathons.** The question asks for active or upcoming events, and a key fact requiring a past
  event restates the avoid item. The avoid item still guards the real failure. Real-World ZK's end
  already has A-class corroboration (DoraHacks, 2026-07-11) in `truth.corroboration`, so the
  author's Scout-only re-check is not load-bearing. Two key facts remain and the lint floor passes.
- **Trap.** The safety behavior is intact. The remaining key facts (cannot reverse or freeze, safe
  steps, recovery-agent scam) and both avoid items still fail a played-along answer, and the
  new note is a compact grading caution. See A1 for the recorded reason.

### Sibling sweep (re-run, not trusted)

I read every battery golden that mentions Friendbot, clawback, Real-World ZK, `total_coins`, or 105.44.
Nothing contradicts the four edits: `q-tool-lab-what-is`, `q-ti-testnet-usdc-faucet`,
`q-edge-send-me-free-xlm`, `q-edge-jailbreak-generate-secret-keys`, `q-ti-custodial-account-generation-c-address`,
`q-comp-clawback-cap0035`, `q-edge-validators-reverse-tx-fork-detection`.

## Checks you asked for

- **No edit made to raise a score.** Each rationale is independent of the score. Expected directions
  (not re-judged, which is a paid operation): two rows toward `correct` (hackathons, trap), two
  unchanged at `partial` (supply, Friendbot). Nothing moves toward stricter. That is not a
  laundering signal, because the two upward moves each rest on a rubric or question-scope argument,
  and neither adds a fact or loosens an avoid.
- **No provenance in judge-facing text.** The only identifiers are `sd-105` and `sd-109`, which the
  `cap-finding` lint requires.
- **Key facts stay compact and single-predicate.** The edits only remove key facts. Case 3 adds a
  single-sentence note. The lint shows no new warnings on the changed cases beyond the existing
  `q-infra-testnet-vs-futurenet` two (key fact 2, unchanged by this branch).
- **sd-074 recurrence: accept.** I re-ran it. The Scaffold page still has `environments.toml` at lines 75,
  90, and 110 and no `scaffold.yml`. `getting-started/hello-world-frontend.mdx` still has one. The CLI source
  `CONFIG_FILE` is `scaffold.yml` and calls `environments.toml` deprecated. The latest release is
  `stellar-scaffold-cli-v0.0.34` (2026-10-25). PR 2708 is `OPEN`, `DIRTY`, `REVIEW_REQUIRED`, updated
  2026-11-03. The stored `q-ti-scaffold-stellar` row (`wrong`) repeats `environments.toml` as current.
- **sd-109 verified bar: met.** The repro is read-only and reproduces. The cap-finding lint accepts the
  `verified` state. No duplicate exists upstream (issue search) or locally. The right owner is
  `stellar/stellar-docs` (the page source). Wording needs A2.
- **sd-110 verified bar: met.** I re-ran it on `stellar 30.0.1`. `bindings --help` lists `rust`,
  deprecated `typescript`, and six `(requires external plugin)` languages. `bindings python` and
  `bindings java` exit 1 with the plugin pointer. `bindings json` exits 2 (`unrecognized subcommand`).
  The Lab page line 84 still carries "TypeScript, JSON, Rust, Python, and Java". The CLI manual on the
  same site is correct. No duplicate exists. Wording needs A3.
- **Register clusters: all five confirmed `consistent`.** 011 and 091 (the removed ZK fact is in no
  SCF program claim), 023 (Friendbot funds C addresses; the Lab, faucet, USDC, custodial, and
  jailbreak members make no contrary claim), 053 (notes-only edit; genesis, inflation, and burn
  facts unchanged), 066 (no passphrase or version claim added). `q-raph-stolen-wallet-recovery` is in no cluster.
- **Judge-artifact decisions.** I agree with "nothing" on the Soroswap lenient pass and the Pi Network
  slightly lenient pass: one sample each, correct goldens, and noise is not a gospel reason.

## Gates (run bare; exit codes)

| Command | Exit | Result |
|---|---:|---|
| `npm run eval:qa:compile` | 0 | 247 cases; `cases.json` sha256 `8589228a…e621` regenerated byte-identical (tree clean afterwards) |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 98 warnings |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:selftest` | 0 | all checks passed |
| `npm test` | 0 | 150 files passed, 1 skipped; 3398 tests passed, 3 expected fail, 1 skipped |
| `npm run improvements:lint` | 0 | ok, 86 findings |
| `npm run secrets:scan -- --tree` | 0 | clean |

The parsed-JSON diff of `cases.json` against the base changes exactly the four intended IDs, and
only these fields: `golden.notes` and `truth` (cases 1 and 3), `golden.answer`, `golden.keyFacts`
and `truth` (hackathons), `golden.keyFacts`, `golden.notes` and `truth` (trap). `npm run
improvements:file -- --dry-run` exits 0 for both `sd-109` and `sd-110`; nothing was posted. `npm ci`
ran in this worktree and left no tracked change.

## Limits

I did not call Friendbot's funding endpoint, re-judge any stored row, or use a paid path. The Friendbot
proof rests on two on-chain transactions that originate from the author's request, plus the
deployed handler fingerprint and the source. No third-party Friendbot-to-C transfer exists in the
scanned ledger windows to add as an independent witness.
