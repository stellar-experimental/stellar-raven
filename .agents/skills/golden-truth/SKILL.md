---
name: golden-truth
description: "Change the golden Q→A corpus without codifying lies: classify the truth domain, triangulate across independent source classes, encode disputed or unverifiable facts honestly, and land provenance-bearing edits to the owned per-case corpus. Use when editing eval golden answers, key facts, avoid clauses, sources, grader notes, or truth metadata."
---

# Golden gospel-truth verification — how to change the golden corpus without codifying lies

This skill is agent-agnostic: a plain-markdown runbook. Claude Code invokes it as a skill;
Codex or any other CLI agent can be pointed at this file directly.

## North star

The golden Q→A corpus is the **gospel every eval round is judged against**. A wrong agent
answer costs one verdict; a wrong golden silently corrupts every future round, every A/B,
every re-judge — and a golden "corrected" from thin evidence is worse than the error it
replaced, because it now carries the authority of a review. Therefore:

> **Never change gospel from a single source class.** Live-probing the corpus, or reading
> one docs page, is discovery — not verification. Gospel changes require multi-source
> triangulation across independent source classes, and disputed facts are encoded as
> disputes, never pinned.

This skill governs ANY change to judge-facing gospel — `question`, `golden.answer`,
`golden.keyFacts`, `golden.avoid`, `golden.notes`, `tags.freshness`, `tags.trap` — and to the
judge-blind `truth` block that carries its provenance. The corpus is **owned**: edits land
directly in the per-case file `eval/qa/corpus/battery/<category>/<id>.json`, reviewed like
code. The CI **gospel-change lint** (`eval/qa/lint-corpus.mjs`, diff-aware against the merge
base) refuses any judge-facing change whose `truth.verified` did not change in the same diff
with non-empty `evidence` + `rootCause` — that lint is the successor to the retired
override-file enforcement, and it moves the check from compile-time bookkeeping to the moment
of change.

The same evidence bar applies to a separately frozen provenance-bearing suite when its contract
invokes this skill. Keep that suite in its contract-owned file. Do not compile it into the battery
or existing routing lanes. Evaluation lanes never merge.

## Step 1 — classify the truth domain (this picks the verification standard)

| Domain | What gospel means | Examples |
|---|---|---|
| **real-world / protocol** | Authoritative primary sources + source code. The corpus/aggregators may lag or be wrong — that's an `improvements/` finding, never an excuse to weaken the golden. | RPC limits, CLI commands, SEP semantics, build targets |
| **corpus-grounded** | What the live community corpora (Scout, Lumenloop) support NOW, **cross-checked against the real world**. Distinguish *real-world-confirmed* from *corpus-only* (in the aggregator, no external footprint). Corpus-only facts may appear in goldens but must be labeled so graders treat them as source-relative. A corpus-vs-world contradiction → `improvements/` finding + grade leniently on both sides. | Regional community events, builder directories, project records |
| **freshness-sensitive** | A *behavior*, never a pinned value. Point-in-time figures require an `asOf` date in the golden text itself, `tags.freshness: "scheduled"`, and a `truth.reverifyBy` date. | SCF amounts, country counts, versions, rosters |

The classification is recorded per case as `truth.domain` (`real-world | corpus-grounded |
mixed`). Most questions mix domains — classify per CLAIM, not per case.

An index or corpus miss does not by itself create a documentation obligation. First identify the
canonical owner of the fact and whether the tested surface undertakes to explain or index it. A case
may intentionally measure cross-source corpus coverage while the truthful answer remains canonical
elsewhere; record that as a coverage diagnostic rather than manufacturing a Docs defect.

An upstream maintainer's decline is evidence about placement, scope, or editorial policy—not proof
that the declined fact is false. Preserve independently corroborated truth, and add a symmetric
grader caution when needed so an answer is not penalized either for accurately stating the canonical
fact or for using the owner's accurate operational phrasing without claiming a stronger invariant.

### Canonical-page conflict grading

When a canonical page conflicts with stronger applicable authority, verify both claims and keep the
truth domain explicit. A reconciled answer may receive `correct`. An attributed but unresolved
canonical-page claim may receive at most `partial`. The same false claim without attribution remains
`wrong`. Put the caution in the affected case's `golden.notes`; do not create a global judge
exception.

Every caution names the conflicting page, its finding or root cause, and its expiry. Remove it
through this workflow when the finding reaches `fixed-upstream` and the live page no longer carries
the wording. A `declined-upstream` finding makes the caution durable until a later owner decision.
Use the lint-canonical form: name the canonical, official, or upstream page or source; state that an
attributed quote is not a wrong claim; and state the partial cap or grade. ADR-0008 fixes the
accepted boundary at three cases. Expansion needs this evidence bar, independent review, and a
later owner decision.

## Step 2 — know your source classes (independence is between CLASSES)

Tool names below are examples from current agent environments, not a Claude-only contract.
Use the available equivalent or tool discovery in the active agent when a named MCP tool is
not present.

- **A. Official primary docs/sites** — developers.stellar.org, service owners' own docs
  (WebFetch, `mcp__parallel-search__web_fetch`).
- **B. Source code / repos** — the implementation is the ground truth for limits and
  behavior (`mcp__github__search_code` / `get_file_contents`, `mcp__deepwiki__ask_question`).
- **C. Live service APIs** — production probes through this server's own `execute`/`search`
  or direct Lumenloop / Stellar Light calls. **The aggregator being checked NEVER counts as
  corroboration for its own claims** — if the claim came from Scout, probing Scout again is
  re-reading the same witness.
- **D. General-web research** — `mcp__perplexity__perplexity_search/ask/research/reason`;
  `mcp__parallel-search__web_search_preview`; `mcp__parallel-task__createDeepResearch` for
  analyst-grade single topics; the `parallel-cli` bin (`~/.local/bin/parallel-cli` —
  search / research / enrich) for scripted sweeps. These are metered/paid — that is the
  point: gospel is worth expensive verification. (Paid **Lumenloop** research stays gated
  and off — that rule is unchanged.)
- **E. Docs search index** — `mcp__stellar-docs__algolia_*`: checks BOTH the fact and its
  discoverability; an authoritative page missing from the index is an `improvements/`
  finding.
- **F. Empirical execution** — for executable claims (CLI commands, address derivation,
  XDR decoding, API parameters), RUN the thing on testnet/live free ops rather than
  reading about it. The strongest evidence class for how-to facts — "the command is real,
  not a doc guess": docs can describe behavior that shipped differently, so run it.

Two perplexity hits are ONE class. Corroboration = agreement across classes. These letters
are the `class` values in `truth.sources[]` and corroboration evidence rows.

## Step 3 — corroboration thresholds by claim criticality

| Claim type | Minimum bar |
|---|---|
| Numeric limits / versions / amounts / dates | ≥2 independent classes, at least one primary (A or B). Docs + the source constant is the gold standard. |
| Entity attribution / status (who built X; is X funded) | Primary source + 1 independent class. |
| Existence / footprint (events, builders, programs) | 1 authoritative source + a no-contradiction web sweep. Corpus-domain: live corpus + a real-world sample check (do ≥5 sampled items have external footprints — lu.ma pages, articles, repos?). |
| **Negative claims** ("X is NOT funded", "no Y exists") | The hardest class — absence from primary records + an explicit web sweep, and even then phrase as of-date and source-relative ("per SCF records as of <date>") rather than absolute. |

**Where the matrix lands.** Corroboration rows live in the case file itself as
`truth.corroboration[]`: `{claim, verdict, evidence: [{class, ref, observedAt, note}]}`.
Verdict enum: `confirmed | confirmed-as-of | disputed | unverifiable | corpus-only |
contradicted` — `confirmed-as-of` for dated point-facts; `contradicted` is legal **only** for
claims mirrored in `golden.avoid` (it documents, with evidence, why an avoid trap exists),
never for claims the golden asserts. The lint **requires** corroboration rows when
`truth.status` is `disputed`/`unverifiable`, when the case is named by a register
`numericInvariants` entry, and for numeric/version/date keyFacts on `real-world` cases;
negative claims are heuristically warned but the hard bar above is this skill's and the
reviewer's to hold.

## Step 4 — fan out verification subagents (parallel by claim cluster)

Group claims into clusters (one topic per agent), assign each agent an explicit source-class
mix, and require a **corroboration matrix** back:

```json
{"claims":[{"claim":"...","verdict":"confirmed|disputed|contradicted|unverifiable",
  "sources":[{"class":"A|B|C|D|E|F","ref":"url or repo path","quote":"exact text","asOf":"date"}],
  "notes":"nuances"}],"overallNotes":"..."}
```

Rules for the fan-out: agents research, they do NOT edit files; exact quotes + URLs + dates
mandatory (a stranger must be able to re-walk the trail); "unverifiable" is an honest,
useful verdict — never stretch weak evidence; when two agents disagree, run a targeted
follow-up probe — never coin-flip, never average.

Route pane and agent mechanics through the global `herdr` skill; split one pane per lane for the
verification lanes and select model/effort explicitly per `AGENTS.md`. Lane-specific rule: create
or reuse the round ledger, assign one independent agent per claim cluster, and have workers append
matrices directly. Author edits owned case files only after reconciling matrices.
For broad corpus-health or drift-refresh work, let `truth-maintenance` coordinate this lane
alongside eval and improvements review.

**Independent re-verification lane (high-stakes changes).** The corroboration matrix is
authored by the agent proposing the change — a matrix review can rubber-stamp its blind
spots. For changes touching disputed facts, negative claims, or high-weight/volatile
truth, add a second agent that re-derives the fact from live sources WITHOUT reading the
proposer's evidence notes ("do not rely on the prior verification — query the sources
yourself, list every URL you hit"). Reviewer ≠ author is the invariant — an independent
re-derivation catches errors (wrong dates, false "X doesn't exist" claims) that a matrix
review of the author's own notes rubber-stamps.

## Step 5 — encode by verdict

| Verdict | What the golden may do |
|---|---|
| confirmed | Pin it — with an `asOf` in the golden text if the fact is volatile. |
| **disputed** | **NEVER pin.** Encode the disagreement: `truth.status: "disputed"` + corroboration rows for both sides, grader caution in `golden.notes` ("sources disagree — do not penalize either figure"), answer-visible sourcing-guard avoid items instead of number traps, and file the reconciliation upstream (`improvements/`). |
| contradicted | Fix the golden AND capture the root cause of the original error (how did the wrong fact get in?). |
| unverifiable | The golden must not claim it. Downgrade to nice-to-have in `golden.notes` or remove; corpus-only community facts get labeled source-relative ("per the Scout corpus"). |

**Durable-fact gating (authoring rule for volatile/contested facts).** When sources
genuinely disagree or a number is contested, never gate the golden on the brittle value —
gate the durable formulation: the protocol version, the CAP/SEP id, "cite a dated primary
source", the behavior of flagging staleness. Record the disagreement in `golden.notes` and
lower the claim's standing. Honesty > false precision.

**Updating `truth.verified` (required on every gospel change).** The case file carries the
LATEST verification event only — git history holds the rest. Set `date`, `by` (who/what
verified — a lane, sweep, or round-ledger ref), `evidence` (live provenance a stranger can
re-walk: URLs, ledger paths), and — whenever the event changed gospel — `rootCause`:
`improvements/` paths for upstream defects, `.agents/TODO.md` entries for eval-side authoring flaws, or
the explicit value `freshness-drift`. The lint rejects rootCause lists that are only
score/result rationales — "the judge failed this case" is never a reason to change truth.
Refresh `truth.asOf` for volatile facts and set a new staggered, quarter-granular
`truth.reverifyBy` on `scheduled` cases so the stale queue drips instead of cliffing.

**Sibling-consistency sweep (required on every change).** The dominant drift mechanism
observed in the ancestor corpora was a correction pass fixing one file while its topical
sibling kept the old fact — producing goldens that cannot both be true. Before closing a
gospel change: enumerate other cases touching the same entity/topic (grep the battery files
for the entity names and key numbers), confirm the changed fact doesn't contradict them, and
record the sweep (cases checked, verdict) in `truth.verified.evidence` or the round
ledger. Then run `npm run eval:qa:register` — it re-stamps consistency-register member
hashes and auto-reopens any cluster whose member content changed.

**Provenance correction.** If the debunked fact also lives in the archival snapshots
(`eval/corpus/` — read-only; mining them for gospel is prohibited), do not edit the archive —
the owned case's `truth` block and, where a finding exists, `improvements/` are where the
correction is recorded so it can't silently resurrect.

## Step 6 — test and close

- `npm run eval:qa:compile` — validation passes; exactly the intended cases changed
  (parsed-JSON diff, not line diff); regenerated `cases.json`/`sample.json` are committed with
  the case edits (CI byte-pins both).
- `npm run eval:qa:lint -- --since <ref>` — the documented pre-push check for every lane:
  runs every deterministic lane **plus** the gospel-change guard against the ref you branched
  from, exactly as CI will against the merge base. Add `--stale` when touching `reverifyBy`
  dates. No new judge-blind avoid items.
- `npm run eval:qa:register` — stamp/reopen consistency clusters (see the sibling sweep).
- `npm run eval:plan -- <last-results>` — plan grades unchanged (goldens don't affect plan
  rules, so any change here means something leaked).
- If a saved run's verdict hinged on the changed golden: re-judge that row
  (`judgeCase` on `rows[].answer`) and record the flip direction in the round record —
  a fix that only ever flips verdicts toward "correct" is a smell (see the score-laundering
  note below).
- Ledger: record the corroboration matrices and every affected case ID in the round ledger; close
  the `.agents/TODO.md` item with commit refs. A later comparison must read this list instead of
  reconstructing it from git history.

## Lifecycle verdicts

Use `truth.lifecycle.state` for `proposed | active | quarantined |
retired` and the orthogonal `truth.lifecycle.reviewState` for `none | queued | in-review |
resolved`. Proposed files stay outside the battery until this workflow verifies and activates them.
Retired tombstones stay outside the battery. The generated registry records digests, permanently
reserves proposed and retired IDs, and rejects ID reuse. After registry genesis, land each new ID
as a proposal in one commit. Activate it in a later commit with activation evidence. The compiler
uses the prior registry from Git history and refuses direct battery additions.

Activate a proposal only after source verification, duplicate and boundary checks, and an
independent reviewer. Retire only for a score-independent reason such as duplication, obsolete
scope, unanswerable wording, or lost product relevance. The tombstone records evidence, reviewer,
date, last digest, and any replacement IDs.

A credible truth or validity conflict triggers quarantine before the next aggregate, after an
independent reviewer confirms a score-independent cause. Judge noise without golden-ambiguity
evidence sets review state `queued` and keeps trusted truth active.

Queue review from verified observability failures, landed improvements, live drift, verified user
failures, and recurrent eval evidence. A trigger changes no gospel by itself. Every quarantine
records its author, independent reviewer, evidence, ledger, start date, and a decision date within
30 days. The deadline cannot precede the start date. That decision corrects, retires, or
independently renews the case. Each renewal records its own evidence, ledger, reviewer, and new
decision date. That deadline cannot precede the renewal date or exceed 30 days. Reactivation is
never automatic.
Score direction never establishes a lifecycle verdict.

Start a frozen mass review when 25 active cases are queued, five percent of active cases are queued,
or one quarter passes. Use the earliest trigger. Bind an open review to the named
`qa-mass-review-rules-v1` digest. Keep reviewers blind to desired score movement, record every
affected ID, and report corpus health separately from system performance.

**Score laundering is the failure mode all of this guards against** — "correcting" a golden
until the agent's answer grades right. The live-evidence bar plus the root-cause pointer keep
every gospel change auditable back to a defect that exists independently of the eval score;
the CI lint enforces the fields exist, the reviewer checks they're true.

## Hard rules

- The aggregator never corroborates itself; a judge's opinion never justifies a gospel
  change; a single source class never suffices.
- Disputed facts are never pinned. Unverifiable facts are never claimed.
- Volatile facts always carry `asOf` in the golden text, `truth.asOf` in metadata, and
  (when `scheduled`) a `truth.reverifyBy` date the CI stale gate can enforce.
- Paid Lumenloop research stays gated/off; perplexity/parallel spend is expected and
  appropriate here. Never print or commit secrets.
- Traps must punish claims that are FALSE per this skill's verification — a trap that
  punishes a possibly-true claim is a judge artifact factory (the avoid-clause artifact
  class the rubric's avoid-binding rules exist to prevent; see "Judging rubric" in
  `eval/qa/README.md`).
- Traps that are true only until a known future event (a scheduled vote, a planned release)
  are **date-contingent**: record them in `eval/qa/consistency-register.json →
  dateContingentTraps` with their trigger, and re-verify when it passes — an expired trap
  punishes the then-true claim.
