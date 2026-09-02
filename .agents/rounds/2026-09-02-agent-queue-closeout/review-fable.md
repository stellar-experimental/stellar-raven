# Closeout audit — agent queue integration — 2026-09-02

Mode: audit only. No repository file was edited.
Author: Claude Fable 5.1, high effort.
Skills applied: `audit-reviewability` (rubric read in full), `writing-for-agents`.

## 1. Scope and fixed point

| Item | Value |
| --- | --- |
| Worktree | `/private/tmp/stellar-raven-agent-queue-integration` |
| Branch | `codex/agent-queue-2026-09-02` |
| HEAD | `1421ffe` (2026-09-02 14:22 -0400) |
| Base | `3428631` (`main`, PR #116) |
| Commits in range | `ce58e6b`, `52f6ae4`, `d6efe5f`, `02af87e`, `1421ffe` |
| Working tree | clean |
| Remote | not pushed; no open pull request |
| Active lane | `/private/tmp/stellar-raven-av-evidence-pack`, branch `codex/av-evidence-pack-date-semantics`, agent `av_evidence_impl` in pane `w1Z:p1`, status working |

Files read in full: `.agents/TODO.md`, `.agents/NEXT.md`, `.agents/README.md`, the five
2026-09-02 ledgers and their review reports, `.agents/rounds/2026-09-01-stale-gospel-refresh.md`,
the range diff for every non-ledger file, and the uncommitted diff in the active lane.
External state read only: `stellar/stellar-docs#2806` OPEN, `#2805` OPEN,
`lumenloop/lumenloop-backend#35` OPEN.

The integration worktree has no `node_modules`. This audit ran no test command there. It relies
on the command records in each ledger and each closure review.

## 2. Verdict

The five commits are complete, reviewed, and internally consistent. The queue files are not.
`.agents/NEXT.md` is unchanged since 2026-09-01 and no longer describes the branch.
`.agents/TODO.md` keeps one completed item and one completed "Permitted now" paragraph.
Two documentation owners named by the repository's own rules lack their 2026-09-02 entries.
The branch carries two undeployed Worker runtime changes.

Counts: 9 findings. 1 High, 5 Medium, 3 Low. Zero unclaimed unconditional machine-ready blocks
remain after the queue closeout in section 8.

## 3. Findings, severity order

### F1 — High. `NEXT.md` ranks a completed block and omits the branch state

Location: `.agents/NEXT.md` lines 3, 6, and the "Agent-actionable block" section.
Evidence: the file says "Updated 2026-09-01" and "One unconditional agent-actionable block
remains". That block is "Harden optional selector flags in both paid runners". Commit `ce58e6b`
implemented it, and commit `02af87e` closed the whole residual class. Both closure reviews
returned `PASS — CLOSED`. The file does not mention PR #115, PR #116, or any of the five commits.
Consequence: the next agent re-executes finished work or reads a false handoff.
Repair: the full rewrite in section 9.1.

### F2 — Medium. `TODO.md` keeps the completed `--ids` item

Location: `.agents/TODO.md`, "Eval instruments", "Harden optional selector flags in both paid
runners".
Evidence: `git diff 3428631..1421ffe -- .agents/TODO.md` shows the item untouched. Commit
`ce58e6b` added a sibling residual item and `02af87e` deleted that sibling. The original item was
never deleted. `eval/qa/run-qa.mjs` and `eval/discovery/run-agent-discovery.mjs` now route
every flag through `assertFailClosedCliSyntax` in `eval/lib/harness-guards.mjs`.
Consequence: a done item stays in the queue against the file's own rule "Delete it when it is
done".
Repair: delete the item. Exact edit in section 9.2, edit B.

### F3 — Medium. `TODO.md` keeps the completed protocol-history "Permitted now" paragraph

Location: `.agents/TODO.md`, "Routing", paragraph starting "Permitted now: build a free
per-control capture matrix".
Evidence: commit `52f6ae4` recorded all three permitted steps in
`.agents/rounds/2026-09-02-protocol-history-free-evidence.md`. The ledger's Outcome says "This
record completes the permitted free evidence."
Consequence: the paragraph invites a repeat of finished free work, and it hides the result that
the owner needs for the PH2 decision.
Repair: replace the paragraph with the result summary and pointer. Exact edit in section 9.2,
edit C.

### F4 — Medium. The routing re-baseline has no `eval/README.md` entry

Location: `eval/README.md`, after "## Re-baseline (2026-08-27, issue #67)".
Evidence: `eval/gates.json` `holdoutNote` says "Historical movements and rationale remain in
eval/README.md". Every prior re-baseline has a dated `## Re-baseline` section there. Commit
`d6efe5f` moved legacy 208/279/311 to 213/279/312, extended 90/109/117 to 90/110/116, and the
holdout floor 25 to 26. `eval/README.md` did not change in the range and contains no 2026-09-02
text.
Consequence: the gate file points at a history that does not hold the latest movement. The
holdout floor change is invisible outside the ledger.
Repair: add the section drafted in section 9.4.

### F5 — Medium. The protocol-history free-evidence ledger is pinned to the superseded manifest

Location: `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`, "Source verification"
and "Per-control capture matrix".
Evidence: the ledger pins `catalog/manifest.json` at `4945c311…6789`. Commit `d6efe5f`, which
landed after `52f6ae4`, moved the manifest to `4cd28f4b…fe8b`. That commit's ledger records the
free diagnostic on the new manifest: original 4/8 positives and 2/4 controls;
`ph-control-validator-vote` moved from a miss to rank five. The blind set stayed at 3/11 and 6/9.
The target description hash is unchanged at `80157277…798e43` on HEAD, so the label review's
inputs still hold. The capture matrix identity columns do not.
Consequence: the matrix's lexical baseline for one control is now wrong on the shipped catalog,
and that control is one of the four disputed labels.
Repair: append the dated reconciliation in section 9.3. Do not rewrite earlier entries.

### F6 — Medium. The stale-gospel ledger status is false

Location: `.agents/rounds/2026-09-01-stale-gospel-refresh.md` line 4 and the last Outcome
sentence.
Evidence: "Status: release ready; merge pending" and "Merge and task-state cleanup remain". PR
#115 merged as `8ee41f3` on `main` before this branch started.
Consequence: an unfinished ledger signals an unfinished round.
Repair: set the status line to "complete; merged as `8ee41f3` (PR #115)" and append one dated
Outcome line. Exact text in section 9.5.

### F7 — Low. `eval/vectorize/README.md` does not record the 2026-09-02 clause artifact rebuild

Location: `eval/vectorize/README.md`; `eval/vectorize/rerank-config.mjs`.
Evidence: `rerank-config.mjs` now pins artifact `d9de7007…002b` and clause set
`bed60846…1ff2`. The README names only the attempt-era artifact `e5f86644…` in dated sections.
It has no 2026-09-02 sentence. The closure review reproduced the new artifact byte for byte.
Consequence: a reader of the README cannot find why the committed artifact differs from every
attempt record.
Repair: one dated paragraph after the attempt-three section. Draft in section 9.6.

### F8 — Low. The catalog closure review opens with a `FAIL` verdict that a later pass reversed

Location: `.agents/rounds/2026-09-02-av-created-at-semantics/review-fable-closure.md` line 16,
and the ledger sentence "The final closure report passed".
Evidence: the file holds three passes. Line 16 says `FAIL`. The final pass at "Final bounded
delta review of F1 and F2" says `PASS` and "All findings … are closed". The ledger's claim is
true only for the last pass.
Consequence: a reader who stops at the first verdict concludes the block failed review.
Repair: in the ledger, cite the section name: "The final bounded delta review passed." Leave
the review file as the dated record.

### F9 — Low. The ids ledger's "Residual optional flags" table now describes closed defects in the present tense

Location: `.agents/rounds/2026-09-02-ids-selector-guards.md`, "Residual optional flags".
Evidence: "The equals forms below remain silently ignored." Commit `02af87e` closed every form
in the table.
Consequence: minor. The ledger is a dated record.
Repair: optional one-line append: "Superseded 2026-09-02 by
`.agents/rounds/2026-09-02-residual-optional-flag-guards.md`."

Verified correct, no finding: the `improvements/` counts in `NEXT.md` (66 active; 60
`reported-upstream`, 3 `proposed`, 3 `declined-upstream`; 29 Lumenloop, 21 Stellar Docs, 9
Stellar Light, 6 skills, 1 provider) match the tree. Corpus lint 0 errors and 62 warnings matches
the residual-guards preflight. `inventory/stellar-light.json` still hashes to `1a261c4a…`, so
PH1 has not fired. `.agents/README.md` is unchanged and accurate. No stray "recording's date"
text remains outside `inventory/lumenloop.json`, `ll-019`, and the research caveat.

## 4. Completed items, mapped to commits

| Queue item | Commit | Ledger | Review |
| --- | --- | --- | --- |
| Harden optional `--ids` in both paid runners (`NEXT.md` block; `TODO.md` item) | `ce58e6b` | `2026-09-02-ids-selector-guards.md` | Opus 5 high, `PASS — CLOSED` |
| Harden residual optional equals-form flags (added by `ce58e6b`, removed by `02af87e`) | `02af87e` | `2026-09-02-residual-optional-flag-guards.md` | Opus 5 high, `PASS — CLOSED` |
| Correct Lumenloop A/V `created_at` semantics (`TODO.md` "Catalog correctness", removed) | `d6efe5f` | `2026-09-02-av-created-at-semantics.md` | Fable 5 high, final pass `PASS` |
| Stop using A/V `created_at` for digest date sorting (added by `d6efe5f`, removed by `1421ffe`) | `1421ffe` | `2026-09-02-av-runtime-date-semantics.md` | Fable 5 high, `PASS` |
| Protocol-history free evidence ("Permitted now" paragraph) | `52f6ae4` | `2026-09-02-protocol-history-free-evidence.md` | Grok 4.6 high blind label review |

Each ledger records the release baseline it ran. Test totals differ by tree: 1,639 after
`ce58e6b`, 1,630 after `d6efe5f`, 1,632 after `1421ffe`, 1,679 after `02af87e`. The last full
baseline on the integrated tree is the residual-guards run. The A/V runtime round also ran
`npm run test:smoke`: 4 files and 82 tests passed.

## 5. Wrong or outdated counts

| Statement | Where | Current value |
| --- | --- | --- |
| "One unconditional agent-actionable block remains" | `NEXT.md` line 6 | Zero unclaimed. One claimed lane in progress. |
| "Updated 2026-09-01" | `NEXT.md` line 3, `TODO.md` line 9 | 2026-09-02 |
| "the 76-case inventory and protocol-history QA family" without the union | `NEXT.md` line 174, `TODO.md` line 114 | 76-case inventory; 4-case family; 2 overlap; 78-case union |
| Manifest `4945c311…` as current | protocol-history free-evidence ledger | `4cd28f4b…` on HEAD |
| Holdout "10/22/25" as current floor | `eval/README.md` last entry | 10/22/26 since `d6efe5f` |
| Original diagnostic controls 1/4 as the lexical baseline | free-evidence matrix identity columns; `eval/vectorize/README.md` tables (dated) | 2/4 on HEAD |

## 6. Protocol-history reconciliation

### 6.1 The four disputed labels

The blind Grok review (`label-review-grok.md`, SHA-256 `4812b5fc…`) read only the two frozen
contracts, the Scout inventory card, and the target manifest entry. It tested each control
against `x-routing.useWhen` and `notFor`.

| Control | Frozen label | Review | Card text that assigns the ask |
| --- | --- | --- | --- |
| `ph-control-validator-vote` | forbid top five | belongs in top five | `useWhen`: `'how does X work'` |
| `ph-control-clawback-cap` | forbid top five | belongs in top five | `useWhen`: `'what does the SEP/spec/audit say about X'` |
| `phb-control-sdk-version-history` | forbid top five | belongs in top five | `source`: `'release' for stellar-core/CLI/SDK release notes` |
| `phb-control-cap-history-sep-support` | forbid top five | belongs in top five | `useWhen`: `'what does the SEP/spec/audit say about X'` |

Nine controls hold with leakage risk. All 19 positive labels hold. The review verdict is
`REJECT` for the combined 13-control exclude-top-five rule as a ship gate. The review changed no
label. Re-adjudication is the PH2 owner decision.

Cross-check against the shipped catalog: on HEAD, `ph-control-validator-vote` reaches rank five
with no mechanism. The lexical baseline now captures one of the four disputed controls. This
supports the review, and it means the frozen 4-control contract already reads 2/4 on the
production candidate.

### 6.2 The 78-case union

- 76-case inventory: battery files whose top-level `surface` contains `scout.searchResearch`.
  Sorted-id SHA-256 `c8894006…08e17a`. Battery size 500.
- Protocol-history QA family: the four `sourceCase` values in
  `eval/protocol-history-cases.json`: `q-comp-yieldblox-oracle-incident`,
  `q-protocol-24-whisk-incident`, `q-protocol-version-history-list`,
  `q-soroban-auth-recursion-dos-audit`. Verified on HEAD. The blind contract has none.
- Overlap: 2 (`q-comp-yieldblox-oracle-incident`, `q-soroban-auth-recursion-dos-audit`).
- Union: 76 + 4 − 2 = 78 unique cases. Exposure count only. No QA result was used.

### 6.3 Pins and the missing attempt-one file

- `inventory/stellar-light.json` `1a261c4a…` and the `x-routing` hash `468a9d98…` are unchanged.
  PH1 has not fired.
- Target description hash `80157277…` is unchanged on HEAD. The label review remains valid.
- `catalog/manifest.json` moved from `4945c311…` to `4cd28f4b…`. The matrix identity columns
  are stale. See F5.
- The attempt-one result JSON (`2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`, hash
  `17e75f0d…`) is absent from every local result location. Its column stays `NA`. This does not
  block closure. Attempts two and three verified against their stamps and the shared score cache.

### 6.4 What the reconciliation does not do

It does not reopen an attempt. It does not change a label, a contract, a gate, or a product
surface. It does not choose PH2 or PH3.

## 7. Unresolved human decisions

1. **Raven capability-boundary surface.** Eval-harness defect, shipped Raven defect, or
   monitor-only. Evidence: `.agents/rounds/2026-09-01-next-actionable-blocks/raven-free-evidence.md`.
   Safe default: monitor-only. Unchanged.
2. **Protocol-history PH2 or PH3.** New evidence: four disputed control labels, a shipped
   lexical baseline that captures one of them, and a 78-case exposure union. Options: stay
   trigger-only; re-adjudicate the four labels under PH2 with a contract-version change; open a
   PH3 non-card box. Safe default: stay trigger-only. The 19-of-19 positive bar is not in
   question.
3. **Paired-QA design.** Denominator, terminal candidate-only T4, and margin. Unchanged. Not
   blocking.
4. **Deployment authorization** for the two runtime changes on this branch. See section 8.1.
5. **Push and pull request** for `codex/agent-queue-2026-09-02`. The branch is local only.
   Pushing is an external write and needs the owner's instruction.
6. **Optional one-row rubric `v2.10` rejudge.** Paid. Unchanged.

## 8. Boundaries

### 8.1 Deployment boundary

Production runs Worker Version `5ea8c1fe…` from source commit `ea01f0d03`. Two changes on this
branch reach production only after a deployment:

- `catalog/manifest.json` and `specs/super-spec.json`: the `lumenloop.find_av_passages`
  contract. The Worker bundles the manifest. `search`, `codemode.catalog()`, and
  `codemode.spec()` change.
- `src/skills/runners/stellar-ecosystem-digest.ts`: A/V rows in the digest now carry
  `date: null` and sort after dated rows. `codemode.skill.run` output changes.

Deployment sequence, each step behind its own authorization: merge to `main`;
`npm run deploy` (the `predeploy` preflight runs); production verification per the `NEXT.md`
evaluation ladder stage 6 (`/playground`, `/health/skills`, MCP initialize, a free `search`, and
one free `codemode.skill.run` digest call that returns an A/V row with `date: null`); then update
the deployment facts in `NEXT.md`.

### 8.2 Paid boundary

No commit in the range made a provider call. The evidence-pack lane changes judge input
serialization. It must not run a paid judge to validate. Deterministic fixtures are the proof.

### 8.3 Ownership boundary

Panes `w1P`, `w1Q`, `w1R`, `w1V`, and `w1Z` belong to the Codex orchestrator in `w16:pG`. This
audit read their worktrees and touched no pane.

## 9. Exact proposed edits

Apply these in one integration commit after the evidence-pack lane lands, or before it if the
lane stalls. Re-read each file immediately before editing.

### 9.1 `.agents/NEXT.md` — full replacement

```markdown
# NEXT — current handoff

Updated 2026-09-02 after the agent-queue integration branch. Read this first.
`TODO.md` holds the full item text.
This file only ranks and sequences. Delete or rewrite this file when the block is done.
No unclaimed unconditional agent-actionable block remains. One claimed lane is in progress.

## State at handoff

- Pull requests #112 to #116 merged into `main`.
- Branch `codex/agent-queue-2026-09-02` holds five reviewed commits after `3428631`:
  `ce58e6b` (ids selector guards), `52f6ae4` (protocol-history free evidence), `d6efe5f`
  (A/V catalog contract), `02af87e` (fail-closed runner flags), `1421ffe` (digest A/V dates).
  The branch is local. It is not pushed and has no pull request.
- Production runs Worker Version `5ea8c1fe-e052-494d-b36b-ee8f5486a662` from source commit
  `ea01f0d03c2bba88f5846922465c6a03af57e41e`. The branch carries two undeployed runtime
  changes: the `lumenloop.find_av_passages` contract in `catalog/manifest.json` and A/V
  `date: null` in `src/skills/runners/stellar-ecosystem-digest.ts`.
- Both paid runners use fail-closed CLI syntax. Every value flag needs the spaced form.
  Equals forms, unknown flags, stray arguments, and duplicate `--ids` fail before any paid call.
- `eval/gates.json` was re-baselined on 2026-09-02 for manifest `4cd28f4b…fe8b`: legacy
  213/279/312, extended 90/110/116, skills 16/23/23, holdout 10/22/26 with 11 forbidden
  captures. Decision record: `.agents/rounds/2026-09-02-av-created-at-semantics.md`.
- The protocol-history free evidence is complete in
  `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`. The blind label review
  disputes four of 13 frozen controls. The product-exposure union is 78 QA cases. On the
  current manifest the original diagnostic reads 4/8 positives and 2/4 controls; the blind
  set reads 3/11 and 6/9. The three-attempt box stays spent.
- `improvements/` contains 66 active findings: 60 `reported-upstream`, three `proposed`,
  three `declined-upstream`. `ll-019` carries the 2026-09-02 A/V `created_at` recurrence.
  Issues stellar-docs#2805, PR #2806, and lumenloop-backend#35 remain open.
- Corpus lint: 0 errors and 62 warnings. Do not chase these counts to zero.
- `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.

## In-progress lane

### Stop treating A/V `created_at` as a QA evidence-pack source date

Use `run-evals`. Worktree `/private/tmp/stellar-raven-av-evidence-pack`, branch
`codex/av-evidence-pack-date-semantics`, Codex author. `TODO.md` holds the item.

Exit gate: pack version bump and `eval/qa/README.md` pack entry; focused deterministic
fixtures for A/V and non-A/V rows; `eval/qa/verify-evidence-pack-fixtures.mjs` still passes;
the release baseline; an independent review; rebase onto the integration branch; ledger
`.agents/rounds/2026-09-02-av-evidence-pack-date-semantics.md`.

## Owner-blocked blocks

### Deploy the integration branch

Push the branch, open the pull request, merge, run `npm run deploy`, and verify production
including one free digest call that returns an A/V row with `date: null`. Then record the new
Worker Version and source commit here.

### Classify the Raven capability boundary

Unchanged. See `TODO.md` "Design a new Raven capability-boundary diagnostic".

## Conditional programs

- Paired QA: free validator design is allowed. No collection without a merged product
  candidate, the owner design decisions, reviewed briefs, and new caps.
- Repository recovery: keep the free monitor in `TODO.md`. Use `sls-082` for a distinct defect.
- Protocol-history routing: trigger-only under PH1 to PH4 in `TODO.md`. The PH2 decision now
  has its evidence.
- `sources.locate`: deferred. Condition 3 cannot fire while no recovery steering is live.
- Friendbot and vendor short-token items remain monitor-only until their recorded bars fire.

## Completed blocks

- Ids selector guards and the residual fail-closed flag class:
  `.agents/rounds/2026-09-02-ids-selector-guards.md` and
  `.agents/rounds/2026-09-02-residual-optional-flag-guards.md`.
- A/V `created_at` catalog contract: `.agents/rounds/2026-09-02-av-created-at-semantics.md`.
- Digest A/V date policy: `.agents/rounds/2026-09-02-av-runtime-date-semantics.md`.
- Protocol-history free evidence: `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`.
- Earlier blocks: agent-discovery paid-run guards (#116), stale-gospel refresh (#115), release
  closeout (#112 to #114), golden metadata remainder (#106), attempts one to three of the
  protocol-history box, and the rejected experiments closeout.

## Owner decisions

### Select the Raven capability-boundary surface

Question: is the observed unsupported lookup offer a QA-harness fidelity defect, a shipped Raven
product defect, or a monitor-only observation?
Evidence: `.agents/rounds/2026-09-01-next-actionable-blocks/raven-free-evidence.md`.
Safe default: monitor-only.

### Keep protocol-history closed or reopen through PH2 or PH3

Evidence: the blind label review in
`.agents/rounds/2026-09-02-protocol-history-free-evidence/label-review-grok.md` disputes
`ph-control-validator-vote`, `ph-control-clawback-cap`, `phb-control-sdk-version-history`, and
`phb-control-cap-history-sep-support`. The card `useWhen` and `source` text assigns each ask to
`scout.searchResearch`. The current manifest captures `ph-control-validator-vote` at rank five
with no mechanism. The exposure union is 78 QA cases.
Options: stay trigger-only; re-adjudicate the four labels under PH2 with a contract-version
change; or open a PH3 non-card box.
Safe default: stay trigger-only. Never lower the 19-of-19 positive bar.

### Resolve paired design only when a product candidate needs a look

Unchanged: denominator above 100, terminal candidate-only T4, and the accepted margin.
Safe default: no spend and no promotion.

## Evaluation ladder

(unchanged from the 2026-09-01 text)

## Suggested sequence

Land the evidence-pack lane. Apply the queue and documentation closeout. Push and open the
pull request when the owner instructs. Deploy under separate authorization and verify
production. Then obtain the PH2 and Raven decisions.
No current item has authorization for evaluation ladder stages 3 or 4.
```

Keep the "Evaluation ladder" section text as it stands today.

### 9.2 `.agents/TODO.md` — three edits

**Edit A — header line 9.**

```
- Updated 2026-09-01 after the reviewed release deployment.
+ Updated 2026-09-02 after the agent-queue integration branch.
```

**Edit B — delete the completed item.** Remove the whole section "### Harden optional selector
flags in both paid runners" under "## Eval instruments" (the heading, three paragraphs, and the
"Done when" line).

**Edit C — replace the "Permitted now" paragraph in "## Routing".**

Remove:

```
Permitted now: build a free per-control capture matrix across the three retained results. Add an
independent label review against the target card's `notFor` and `useWhen`. Count product impact over
the pinned 76-case inventory and the protocol-history QA family. These results inform PH2 or PH3;
they authorize neither path.
```

Insert:

```
The free evidence is complete in `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`.
The blind label review disputes four of 13 frozen controls: `ph-control-validator-vote`,
`ph-control-clawback-cap`, `phb-control-sdk-version-history`, and
`phb-control-cap-history-sep-support`. All 19 positive labels hold. The combined 13-control
exclude-top-five rule is not a ship gate until the owner re-adjudicates those four labels
under PH2. The product-exposure union is 78 QA cases: the 76-case `scout.searchResearch`
inventory plus the four-case protocol-history family, with two shared cases.
The attempt-one result file is absent locally; its matrix column is `NA`.
On manifest `4cd28f4b…fe8b` (2026-09-02) the original diagnostic reads 4/8 positives and 2/4
controls; `ph-control-validator-vote` reaches rank five with no mechanism. The blind set reads
3/11 and 6/9. These results inform PH2 or PH3; they authorize neither path.
```

**Edit D — evidence-pack item, "Done when" line.** Append one sentence:

```
The pack version must bump and `eval/qa/README.md` must record the new pack, because the
selection rule changes.
```

### 9.3 `.agents/rounds/2026-09-02-protocol-history-free-evidence.md` — append only

Add at the end, before or after "## Outcome" as a new dated section:

```
## 2026-09-02 — reconciliation after the A/V catalog commit

Commit `d6efe5f` moved `catalog/manifest.json` from `4945c311…6789` to `4cd28f4b…fe8b` after
this record was written. The target description hash is unchanged at `80157277…798e43`, so
the label review inputs still hold. The identity columns of the capture matrix are stale for
the current manifest. `npm run eval:protocol-history` on the current manifest reads:
original 4/8 positives and 2/4 controls; `ph-control-validator-vote` moved from a miss to
rank five. Blind 3/11 positives and 6/9 controls. `ph-control-validator-vote` is one of the
four disputed controls. The three-attempt box remains spent. This entry changes no label,
contract, or gate.
```

### 9.4 `eval/README.md` — new section after the 2026-08-27 re-baseline

```
## Re-baseline (2026-09-02): Lumenloop A/V contract correction

The model-facing `lumenloop.find_av_passages` contract now states supported video, podcast,
and recorded-talk passage search. It does not promise transcript text, quotes, playback
timestamps, or a recording date from `created_at`. Upstream's `returns` text calls
`created_at` the recording's date; live rows contradict it (`ll-019`). The correction lives in
`scripts/catalog-data/model-contract-corrections.mjs`.

Against the prior baseline, legacy strict routing moves from **208/279/311** to
**213/279/312**. Extended strict moves from **90/109/117** to **90/110/116**. Skills remain
**16/23/23**. The frozen holdout moves from **10/22/25** to **10/22/26**, with 11 forbidden
captures and 21 passed cases. The canonical passkey-talk case stays a direct A/V result at
rank three. `q-ti-video-tutorials` moves from rank four to outside the top five; no
evidence-true wording reaches the gated tier for it. Two wallet cases and one anchor case lose
false service credit from the A/V operation. No scorer, corpus, floor, band, or runner
operation changed. The holdout was not tuned. Decision record:
`.agents/rounds/2026-09-02-av-created-at-semantics.md`. The final passing evidence trace is
`routing-2026-09-02T17-26-17-593Z.json`.
```

### 9.5 `.agents/rounds/2026-09-01-stale-gospel-refresh.md`

Line 4:

```
- Status: release ready; merge pending
+ Status: complete; merged as `8ee41f3` (PR #115)
```

Append to "## Outcome":

```
2026-09-02: PR #115 merged into `main` as `8ee41f3`. Task-state cleanup is complete.
```

### 9.6 `eval/vectorize/README.md` — one dated paragraph after the attempt-three section

```
On 2026-09-02 the A/V catalog correction changed `catalog/manifest.json` to `4cd28f4b…fe8b`.
The clause artifact was rebuilt from the pinned local model cache so `requireCatalogMatch`
holds: artifact `d9de7007…002b`, clause set `bed60846…1ff2`, vectors `c6acd8b8…121f`.
`rerank-config.mjs` pins these values. The attempt-era artifact `e5f86644…` is retained by
hash in the dated sections above and in each result record; it is no longer the committed
artifact. No referee was rerun. Decision record:
`.agents/rounds/2026-09-02-av-created-at-semantics.md`.
```

### 9.7 Ledger wording (F8, F9)

`.agents/rounds/2026-09-02-av-created-at-semantics.md`, "Review status":

```
- The final closure report passed.
+ The final bounded delta review in the closure report passed with no actionable finding.
```

`.agents/rounds/2026-09-02-ids-selector-guards.md`, end of "Residual optional flags" (optional):

```
Superseded 2026-09-02: `.agents/rounds/2026-09-02-residual-optional-flag-guards.md` closed
every form in this table.
```

## 10. Active lane — status and completion gates

Observed read-only in `/private/tmp/stellar-raven-av-evidence-pack`:

- Base: `9d9ed2c` and `09c0959`, which are the pre-integration SHAs of the same two A/V
  commits. The lane lacks `ce58e6b`, `52f6ae4`, and `02af87e`. A rebase onto `1421ffe` is
  needed. The lane's files (`eval/qa/evidence-pack.mjs`,
  `test/evidence-pack-per-operation.test.mjs`) do not overlap the other commits.
- Uncommitted diff: `sourceDate` now takes the item path; `isAvSource` detects `collection`,
  `type`, `kind`, an `av` path segment, or `start_offset`; A/V rows skip `created_at` and skip
  `date` when `dateField === "created_at"`; visible JSON fragments carry their parent key. One
  new test covers semantic, grouped, and direct A/V rows plus article, research, and event
  controls.
- `PACK_VERSION` is still `p5`. `eval/qa/README.md` says a pack bump is required for
  evidence-pack selection changes. This change alters selection.

Completion gates for the lane, in addition to the `TODO.md` "Done when":

1. Bump `PACK_VERSION` to `p6` and add the dated pack entry in `eval/qa/README.md` next to
   the `p5` entry.
2. Run `node eval/qa/verify-evidence-pack-fixtures.mjs`; regenerate any fixture that the
   selection change moves, and record the reason.
3. Focused: `test/evidence-pack-per-operation.test.mjs`, `test/qa-judge-evidence.test.mjs`.
4. Release baseline: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`, `git diff --check`.
5. Independent review by a reviewer other than Codex; Fable high or Opus high.
6. Ledger `.agents/rounds/2026-09-02-av-evidence-pack-date-semantics.md` with commands and
   outputs; delete the `TODO.md` item in the same commit.
7. No paid judge call. Deterministic fixtures are the only proof.

Review points for the reviewer, not queue findings: `"start_offset" in value` is evaluated
after `maybeSourceItem` confirms an object, so it is safe; the path regex matches `av` only as
a whole segment; the `dateField` guard depends on the Lumenloop adapter's canonical `date`
copy in `src/adapters/lumenloop-shape.ts`, so an A/V row that reaches the pack without
`dateField` but with `date` still prints that date. State whether that case is reachable.

## 11. Remaining unconditional machine-ready blocks

After the five commits, one unconditional block remains, and it is this closeout:

- **Queue and documentation closeout** — apply sections 9.1 to 9.7. Files:
  `.agents/NEXT.md`, `.agents/TODO.md`, `eval/README.md`, `eval/vectorize/README.md`, three
  ledgers. Skills: `writing-for-agents` for the queue files. Gates: `npm run improvements:lint`
  is unaffected; run `npm test` because `test/` reads no queue file but CI runs the corpus
  lint; `git diff --check`. No generated artifact changes. No provider call. One reviewer
  other than the author reads the three queue files against this report.

The evidence-pack item is claimed and in progress. It is machine-ready but not unclaimed.

Permitted but speculative, hold: extend the paired validator denominator
(`eval/qa/validate-paired-verdict.mjs`).

## 12. Final queue classification

| Item | Class | Basis |
| --- | --- | --- |
| Queue and documentation closeout (section 11) | unconditional, machine-ready, unclaimed | This audit |
| Stop treating A/V `created_at` as a QA evidence-pack source date | machine-ready, claimed, in progress | pane `w1Z:p1`, uncommitted diff |
| Deploy the integration branch | owner-blocked (push, PR, deploy authorization) | branch local; runtime changes present |
| Classify the Raven capability boundary | owner-blocked | unchanged |
| Protocol-history PH2 label re-adjudication or PH3 box | owner-blocked; evidence complete | label review `REJECT`; 78-case union |
| Paired-QA design (denominator, T4, margin) | owner-blocked; not blocking current work | unchanged |
| Optional `v2.10` one-row rejudge | owner-blocked; paid | unchanged |
| Re-check `sd-047` after PR #2806 merges | trigger-only | #2806 OPEN |
| PH1 dual card-hash change | trigger-only | `1a261c4a…` unchanged |
| PH4 two unrelated live cases | trigger-only | none recorded |
| Recovery selection trigger; `sls-080` free reading each round | monitor-only with a free per-round probe | unchanged |
| Friendbot network-context synthesis | monitor-only | unchanged |
| Vendor short-token prefix matching | monitor-only | hash `718924d1…` unchanged |
| `sources.locate` | deferred | condition 3 cannot fire |
| Extend the paired validator denominator | permitted, speculative, hold | no product candidate |
| Harden optional `--ids` (and the residual class) | completed; delete from `TODO.md` | `ce58e6b`, `02af87e` |
| Correct A/V `created_at` catalog semantics | completed; already removed | `d6efe5f` |
| Digest A/V date sorting | completed; already removed | `1421ffe` |
| Protocol-history free evidence | completed; paragraph still in `TODO.md` | `52f6ae4` |

## 13. Verification performed by this audit

Read-only commands in the two worktrees: `git status`, `git log`, `git diff --stat`,
`git diff` per file, `git show`, `shasum -a 256`, `grep`, and one Python read of the manifest
and the frozen contracts. External reads: `gh pr view`, `gh issue view`, `gh pr list`,
`herdr pane list`, `herdr agent list`. No test command ran because the integration worktree has
no `node_modules`. No file was written outside `/private/tmp/stellar-raven-agent-queue-closeout-audit.md`.
