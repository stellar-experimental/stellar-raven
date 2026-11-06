# Playground experiments — resume after subscription reset

Owner decision, relayed by root on 2026-11-06: **keep the $200 additional API
cash ceiling and resume after the subscription reset**. A local one-shot LaunchAgent
is registered to resume this same Codex thread at **2026-11-08 19:05 America/New_York**
(`2026-11-09T00:05:00Z`), five minutes after the reported reset. Registration is
verified; execution still requires this Mac and the local Codex daemon to be available.
The schedule queues the task only; it starts no evaluations itself.

Resume the existing two experiments, not a new study. Read this checkpoint,
[the round ledger](2026-11-06-playground-final-resolution.md), current `AGENTS.md`,
and [run-evals](../skills/run-evals/SKILL.md) before work. Read the herdr-core
skill and `hc --skill` before terminal operations. The owner has already chosen
waiting under the existing cap; no API Judge A migration or extra spending is
authorized. The earlier `judge-a-quota-options.md` is cost analysis, not a
regrade authorization or a binding requirement to replace the six errors.

## 1. Recover and verify the checkpoint before spending

All private recovery artifacts below are under `tmp/playground-final/`. If evidence
or frozen commits are missing, recover them from the verified archive; never
recreate a journal, infer costs, or rerun settled answers.

| Recovery artifact | Location / verification |
| --- | --- |
| Evidence archive | `resume-checkpoint/evidence.tar.gz`; SHA-256 `e0d1b226e1aa421357361a08636ad60a727f17d7469daf9596dacea646d89c0f`; 1,819 entries |
| Evidence manifest | `resume-checkpoint/evidence-manifest.json`; SHA-256 `ef7060e0590dda6e4d41f04c1ee2aa127cf01a790d05bacd06769bfcf8388904` |
| Frozen Git revisions | `resume-checkpoint/frozen-source.bundle`; SHA-256 `5254bf37db1ba6ad9f52563353b0e8f322339a34d3256811386a21ee93e572cd`; verified bundle through `2bcecb740d8802bf3769d41af7b6470d5e8d47ae` |
| Conditional route patch | `route-evidence/route-repair.patch`; SHA-256 `b98bdd41de2283974e228b48aadae04277b6efa41e0928e31a0974dfe91f9d9c`; artifact manifest `route-evidence/manifest.json` |
| Pinned Judge A binary backup | Independent copy `resume-checkpoint/claude-2.1.319.bin`; SHA-256 `1f53587e92dee8e089fa349188a4cda64fa34ace6e7b0ca2ee278ddaa3cc2ebd` |
| Interim release | [PR387](https://github.com/stellar-experimental/stellar-raven/pull/387); verify merge/deployment from `resume-checkpoint/interim-release.json` and GitHub before treating it as released |
| Worktree cleanup | `resume-checkpoint/worktree-cleanup.json`: four owned worktrees removed after preserving exact revisions and the unreviewed route patch |
| Schedule receipt | `resume-checkpoint/schedule-install.json`; registered label `org.kalepail.raven-playground-resume-20261108`; thread `01a1ae61-ee04-7223-9aa0-728cf3d22fba` |
| Schedule script / prompt | `resume-checkpoint/resume-once.py`; SHA-256 `a2114ff06f18ffd891ec964ef8f688b288ff7cd55e8daaad15c26a55c83ff3c4`; exact prompt is its `MESSAGE` constant |

The evidence archive excludes the `resume-checkpoint` directory itself; retain the
bundle, binary, schedule and cleanup receipts separately. It predates the final
release receipt and last upstream handoff review. Original evidence remains in
place. If recovery is needed, extract to a separate directory and compare the
manifest before restoring anything; never overwrite a newer journal blindly.

The bundle preserves the pre-squash frozen objects even after release branch
removal. Verify it with `git bundle verify`; restore missing objects with
`git fetch tmp/playground-final/resume-checkpoint/frozen-source.bundle HEAD`.
Restore detached frozen worktrees at the exact paths below. Each needs a
`node_modules` symlink to the root installation, the root generated `env.d.ts`,
and the local `.dev.vars` copied without printing its contents. Restore the old
answer checkout at `.claude/worktrees/playground-measurement-2026-11-06` and
`e800eef8d543599bf8561e84353cedada4d330fd` only if its diagnostic review needs it.
If the pinned Claude version was cleaned up, restore a missing executable from
the verified independent backup; do not overwrite an unexpected binary.

After the scheduled handoff, inspect `resume-claim.json` and `resume-result.json`
under `resume-checkpoint`. A successful queue command alone does not prove an agent
resumed. Do not retry an ambiguous claim automatically. Remove this task's one-shot
job with `launchctl bootout gui/501/org.kalepail.raven-playground-resume-20261108`
and remove its exact plist from `/Users/kalepail/Library/LaunchAgents/` after
confirming the handoff. The plist filename is the label plus `.plist`. Leave
other jobs alone. The script refuses pre-reset execution and expires after seven days.

The interim release contains reviewed harness changes and findings. Preserve the
shipped primary/fallback unless the complete study and promotion gates justify a
change. The conditional route patch remains unreviewed and outside production.

The era uses absolute paths rooted at
`/Users/kalepail/Desktop/stellar-raven-codemode`. Restore the exact clean frozen
checkouts at their bound paths if root removed them. A new HEAD, checkout path,
shell identity or regenerated pin file is not an equivalent restoration. Any
necessary binding migration needs independent review before paid work; do not
edit frozen helpers, pins or journal to make a changed environment pass.

Verification complete means: archive hashes match, all evidence is readable,
both frozen checkout revisions and cleanliness match, all 31 code pins and era
bindings validate, and journal accounting equals the saved checkpoint. Do not
run `prepare-freeze.mjs` or `init-restart` again.

## 2. Settled state at pause

Read-only snapshot: **2026-11-06T18:30:56.016Z**. Journal:
`eval/local-lanes/playground-final-transport-fixed/journal.json`, SHA-256
`1a3207f39350494bb67f3760c1a758e509a7425fed96ec6a319003f41b9e945b`.
Root's later checkpoint supersedes this hash only with an explained, reviewed
change; it never erases prior evidence.

- `state: ready`, `server: null`, no reserved or unresolved method, no external
  methods yet. The operator quota hold still prevents launches.
- All ten m1 Luna native methods are settled: **202 first-attempt answers and
  202 A attempts**, both repeats. Do not recollect any m1 answer.
- **200 eligible m1 B calls are pending** across its ten native sources. The two
  failed answers remain in the 202-cell denominator with failure treatment.
- m2–m8 remain planned: **70 native methods / 1,414 answer cells**; both repeats
  and both judges remain in scope. Full fresh matrix: **1,616 cells**.
- Current-era answer API cash: **$1.00290804**. Current A subscription notional:
  **$14.3179634**, including one $0.0653676 consistency error. These are distinct
  from API cash; the notional amount is not charged again to the cash ledger.
- Whole-study known cash: **$1.89442464**; ceiling consumed: **$9.83170263**;
  reserved: **$0**; available: **$190.16829737**, before the separate $20 buffer.
- Immutable prior cohort: **85 diagnostic-only answers**, $8.82879459 opening
  ceiling debit, $0.8915166 known cash, $7.97 conservative charges; both failed
  provider costs/counts remain unknown. Prior counts: 83 collection A attempts,
  seven calibration A attempts, 27 B calibration calls, 337 known answer-provider
  calls. Never credit those 85 to the fresh matrix, reset the budget, release
  their holds, or add their known prefixes twice.

Old journal/evidence remains under `eval/local-lanes/playground-final-resolution/`.
New raw receipts, completions, attestations and exact Gateway proofs remain under
`eval/local-lanes/playground-final-transport-fixed/native/`. Keep both cohorts and
their raw files intact through archive/restore and final review.

## 3. Resolve review and ownership gates before continuation

**Six quota errors are preserved judge attempts.** The saved first-party 429
`usage_limit_reached` envelopes report zero tokens/cost; they are not missing
answer attempts. Exact cells and prompt hashes are in
`tmp/playground-final/transport-fixed/judge-a-quota-hold.json`. Ledger disposition
P1 requires both judge attempts on completed answers and retains an error.
`research/audits/2026-11-06-playground-final-resolution/decision.mjs` accepts
`judgeA: "error"` with a resolved, reasoned blinded adjudication. Agreement counts
only paired real grades. **No six regrades are authorized or necessarily required.**

Before spend, have an eligible independent reviewer confirm that this predeclared
interpretation permits continuation with the original error attempts and normal
full-transcript adjudication, including matrix-reader admission. Record its
evidence and reconcile findings. Preserve the separate consistency error too.
If the reviewer finds an actual contract blocker, stop for a bounded root
decision; do not rewrite errors, silently extend call bounds, or recollect answers.

Use the actual invoking `HC_TERMINAL_ID`. Historical root was `t1d1`, collection
lane `t346`, m1 server `t33x`; these IDs do not confer ownership after cleanup.
Never adopt old descendants, restart their work, or set the invoking ID to an old
owner. Re-read actual hc metadata for every newly created child.

**m1 B comes before m2.** A new invoking owner may need an independently reviewed
quiescent **B-only authorization rollover**: all ten native tasks already settled,
no server/reservations, old children finished with logs retained, no pending old
queue/action/ambiguity. Preserve old config/state, bind an exclusive new config
to the actual owner and immutable measurement, import no children, and prove its
first plan is eligible `reserve-b`, not native launch or server control. Treat
the old server field as historical only if the reviewed mechanism requires it;
it never grants authority over that terminal. This B-only rollover is not yet
reviewed or authorized by the Astra R2 proposal. If the current owner can safely
use existing state, document the actual ownership proof instead.

Verify the pinned Judge A subscription executable/auth/environment after reset
without launching an unallocated paid probe. The clock alone does not prove
capacity is restored. Freeze the actual accepted continuation/owner config and
raw authorization hash before the first bounded action. Root's explicit START
M2 remains outstanding until m1 B and these gates are resolved.

Outstanding independent work (Fable `t2x9` hit the same weekly limit):

- **Old-85 score-contract audit:** finish blind review of both original review
  sets against the exact rubric guide, keeping original `review-1.json`,
  `review-2.json` and `joined.json` unchanged. Write separate amendments and
  confirmations; audit reviewers must not read the root-only sidecar/join.
  Partial work is not a completed review. See
  `tmp/playground-final/frozen-rubric-guide-review.md` and `aborted-review/`.
- **Astra R2 rollover:** root accepted the principle; independent review is
  unfinished. See `transport-fixed/astra-r2-rollover-proposal.md`, its offline
  test and 8/8 passing evidence. Review before m8; require a fresh dated forecast
  after all five R1 settlements, zero active/queued work, an exclusive two-field
  config rollover, unchanged server/owner, and no adopted children.
- **Conditional route patch:** implementation and offline checks exist, but
  independent review is unfinished. Read `tmp/playground-final/route-implementation-report.md`,
  `per-attempt-transport-analysis.md`, and root's patch archive. Keep it outside
  the frozen collection surface. Apply only if selection requires it and review
  confirms each deployed tuple member preserves its measured route and effort.

## 4. Complete collection within the existing cap

Use only the unchanged `tmp/playground-final/transport-fixed/` helpers and the
dated `orchestrate.mjs`; use `collect-model.mjs plan CONFIG` before each reviewed
`step CONFIG --authorized-sha256 RAW_CONFIG_SHA`. Run through hc's real environment
so offline B preparation also receives the accepted PATH. Use `hc wait`, not
poll/sleep. Retain actual returned IDs and logs; clean only owned children.

| Order | Model | Effort |
| --- | --- | --- |
| m1 B first | Saved Luna sources only | Frozen B high |
| m2 | `anthropic/claude-haiku-5.5` | `none` |
| m3 | `openai/gpt-6.1-terra` | `none` |
| m4 | `openai/gpt-6.1-sol` | `low` |
| m5 baseline | `openai/gpt-5.6-terra` | `none` |
| m6 | `anthropic/claude-sonnet-5.5` | `none` |
| m7 | `openai/gpt-5.6-sol` | `none` |
| m8 | `openai/gpt-6-astra` | `low` |

Per model: R1 safety then four quality shards, R2 safety then four quality shards;
settle all ten native methods, stop the sole owned server, complete eligible B,
then advance. Maximum quality width four, Astra two; B starts two and expands
only under the frozen no-429 rule. Use frozen caps and keep $20 unreserved.
Read actual server URL, require free MCP initialize 200 with pinned revision and
signed invalid-body preflight 400 before native collection. Preserve spaced
`--port 8787`, gateway `default`, and exact model/effort/Responses bindings.

Reforecast the complete remaining matrix after each model and before Astra R2,
using model-specific historical answer costs plus observed B distributions.
At pause, subscription continuation projects about $173.78 total at mean B,
or $193.78 including reserve, before production verification; high-B scenario
is $211.73 including reserve. These are scenarios, not authority or guarantees.
If full coverage cannot fit, stop for root; no smaller matrix or buffer waiver.
On new quota/429, unknown cost, transport/identity failure, ambiguous step,
missing proof or unreconciled error: stop launches, drain already authorized
known siblings, preserve allocations/evidence and report. No automatic retry,
partial recovery or continuation is allowed by the halt-only era.

## 5. Full adjudication, decision and release gates

Every future blind reviewer **must read the exact**
`tmp/playground-final/frozen-rubric-guide.md` before grading (SHA below), and use
the packet's actual ordinary/trap branch and full ordered transcript. Fable
verified the guide against the frozen v2.11 builder. Truncation/pack omission
does not prove missing evidence; trap-required behavior must follow the exact
golden. Failed answers retain null score; safety is assessed separately.
Preserve raw A/B grades, all error attempts, and reason every adjudication change.

Finish review of **all 1,616 fresh cells** and the separate 85-cell diagnostic
obligation. Validate exact receipt/selection/repeat completeness and every safety
assessment before calling the frozen matrix reader and `decision.mjs`. No
unresolved method/review/safety cell can disappear. Report raw A, raw B and
adjudicated outcomes separately; no synthetic average. Apply the predeclared
case-clustered paired tests, Holm correction, repeat-direction, reliability,
safety and fallback-vendor requirements from the ledger. Equal evidence retains
the shipped primary. A completed no-switch result is valid; partial data is not.

Promotion requires complete independent decision review and reconciliation of
all findings, then measured-route/effort fidelity for the proposed production
tuple. Review any conditional route patch before applying it. Follow the reviewed
production-gauntlet plan, fresh allocations within this same cap and buffer,
read-only gateway checks, required primary/fallback transport gates, and exact
Gateway settlement. A single-model gauntlet proves tuple behavior only with
the corresponding production route/effort equivalence tests. No gateway limits
are changed. No model is promoted before these checks pass.

Root owns release: verify already-shipped harness/findings, avoid duplicate
upstream filings, complete applicable tests/CI and secret scanning, commit/PR/
merge/deploy only the reviewed final change, verify deployment, then clean newly
owned terminals/worktrees/branches while preserving retained evidence. Publish
both experiment outcomes and remaining limitations. Until then, keep this TODO
open and the paused study distinct from the interim harness/findings release.

## Frozen identities and evidence map

All local paths below are relative to the fixed repository root unless absolute.
These ignored evidence files must be present in root's archive; Git alone does
not preserve them.

| Item | Frozen value |
| --- | --- |
| Answer checkout | `.claude/worktrees/playground-measurement-transport-fixed-2026-11-06` at `092ce4231869356ef1e081a5ef07a7051c19336c` |
| Answer generation | `e78f9441488d86728958325752e67541ca37e684ac07841e1935f12c33426166` |
| B checkout | `.claude/worktrees/playground-judge-2026-11-06` at `44048cc64f2f659871d7d44b86aad13e365933f5` |
| A | `claude-sonnet-5`, v2.11/p9, first-party Max subscription, `/Users/kalepail/.local/share/claude/versions/2.1.319` |
| A executable SHA | `1f53587e92dee8e089fa349188a4cda64fa34ace6e7b0ca2ee278ddaa3cc2ebd` |
| A hc collection-shell environment SHA | `7b26b0adb405f85c1a54a2205fe34c511155a18a6807e6543e1b5a92f676cd14` |
| B | `gpt-6.1-sol` / high; identity `3df87dfeb6b0eec32c83fb7a7f165f181e9099916db6c5c1fe4bd6e64cf4820e` |
| Era-context SHA | `f3e53d37e1c7ef6ab6bec8eb25533b6f6cc91264254519344237188e7a6ced5f` |
| 31-file `collection-code-pins.json` SHA | `7ee9209e274d47e98b58a67b8754008c1b8f870a0ceffefcf153c03e8c9a62bb` |
| `collection-identity.json` SHA | `2232727637a97a3f2a46acec3da53f42c5752a27768782ff876586a8aff6ebe0` |
| `collection-budget.json` SHA | `1bb7f04b5ebc9a32e730ac4bae6acf63539ffb2c79cd5bd7f44574a44d3df722` |
| Exact rubric-guide SHA | `0e8212b0a7dd70a4df3cb986a78acf4e01e1b5758b338512cd3f83e366fa26f1` |

The accepted shell prepends `tmp/playground-final/collection-bin` to PATH and
sets `DISABLE_AUTOUPDATER=1`. Tool-shell `3c3c…` environment is not a replacement.
Existing host credentials remain memory-only; restore required local setup
silently and verify auth without printing tokens. B uses its frozen documented
API route; A remains subscription. No auth or model-pin workaround is authorized.

| Helper under `tmp/playground-final/transport-fixed/` | SHA-256 |
| --- | --- |
| `era-binding.mjs` | `2ea580ce53cac909cf44a0236d87a8906190f7bd3416d83ede11f31246af8a59` |
| `collect-model.mjs` | `6566266f2ff790e15cd1986bf04fa171319f8c3b181a033eb44c6b4dc4ae7c07` |
| `collection-shell.sh` | `aa6f2da039f9a26d8c67747a2737664d2f1ef28ec3f3cdc0e830803a8e3af326` |
| `run-final-task.mjs` | `bfb9b76aa79c49e424137166144450cd76ae8c7fb2af2ffdac0c2e04a148f1d7` |
| `reconcile-native.mjs` | `fd4db60530ea1f7ce7942d1f07065e3ff49bfcec1c769650e000182a1e3f74a1` |
| `prepare-final-judge.mjs` | `fc553767b241c3aaba86317adfe34621dc701ef6915622111348980be96465d9` |
| `run-final-judge.sh` | `cf4353c76069ebd97dc74ff22b460eec21d8568e2497e1046455e72670540018` |

Other essential local evidence: `tmp/playground-final/restart-design-review.md`
Parts F/H/K/L; `restart-implementation-result.md`; `transport-fixed/era-context.json`,
`freeze-report.json`, `prior-cohort-import.json`, `historical-helpers/`,
`model-m1.json`, original `supervisor/` state, `collection-bin/` (under
`tmp/playground-final/`), quota hold/cost evidence, and both complete local-lane
directories. Read `collection-agent-ready.md` for command details, superseding
its old unsettled-m1 snapshot with this checkpoint. Calibration evidence and
selection/decision/coordinator contracts live under
`research/audits/2026-11-06-playground-final-resolution/`; original blind packets,
reviews and root-only mapping live under `tmp/playground-final/aborted-review/`.
Use root's final archive manifest to verify the complete required inventory.
