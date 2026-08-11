---
name: improvements-pipeline
description: Maintain the improvements/ upstream-findings pipeline for stellar-raven-codemode. Use when filing or updating service-improvement findings, resolving intake targets, maintaining improvements/intake.json, interpreting improvements lint failures, running recurrence probes, regenerating improvements/INDEX.md, reviewing upstream issues or PRs opened from findings, or handling eval-round and drift-refresh improvement maintenance.
---

# Improvements pipeline

Use this skill when work touches `improvements/`: filing upstream findings, changing statuses,
running probes, updating intake targets, regenerating the index, or interpreting lint failures.
Read `improvements/README.md` first; it is the charter.

## Status lifecycle

Statuses are evidence bars:
- `proposed`: plausible finding, usually from an eval transcript or review, but not yet live-proven.
- `verified`: live re-execution proves the finding against the upstream surface; record the command,
  service response, result stamp, or other reproducible evidence.
- `reported-upstream`: filed with the service owner; evidence must include the durable filed ref.
- `declined-upstream`: the trigger still reproduces but the owner explicitly declined, classified it
  as legacy, or rejected the recommendation as overfit. Keep the record, include the decline ref and
  a non-empty `disposition`, do not re-file/pester, and revisit only on drift or materially new evidence.
- `fixed-upstream`: live re-check confirms the upstream fix. If a residual remains, create or update a
  successor finding instead of stretching the old one. This is a transient deletion-candidate queue,
  not an archive state.

The terminal resolved transition is deletion from the active collection plus an entry in
`improvements/resolved.json`. IDs are unique across the active tree and resolved ledger and are never
reused; choose the next numeric id from the maximum across both. Git history, the resolved receipt,
and the upstream resolution comment preserve evidence without retaining stale finding files.

Findings are for upstream service/data/content/spec gaps only. Own-repo fixes go to Solo todos.

GitHub state is not truth by itself. An upstream issue being closed or a PR being merged is
evidence to inspect; a finding moves to `fixed-upstream` only after re-running the original
trigger, recurrence probe, or live repro and observing the fix.

## Filing workflow

Dedupe first: search existing finding ids, titles, and recurrences before adding a file. A new finding
needs a concrete owner-facing recommendation, quantified prevalence when possible, and evidence a
stranger can reproduce. Use the next id in the service prefix sequence:

- `lumenloop` -> `ll-NNN`
- `stellar-light-scout` -> `sls-NNN`
- `stellar-docs` -> `sd-NNN`
- `skills` -> `sk-NNN`

For a web-surface finding, classify the failing surface before choosing a collection or owner:

- `docs-content` — canonical developer documentation is wrong, stale, contradictory, or omits a
  fact its existing page actually undertakes to explain;
- `docs-search` — the Docs Algolia/crawler/ranking layer fails even though suitable canonical
  content exists;
- `site-content` — a broader `stellar.org` page makes a stale or incorrect claim, or an existing
  site section has a clear reader-facing omission;
- `site-search` — the broader site's Algolia/search layer fails over suitable site content; and
- `canonical-source` — the defect belongs in the specification, implementation, product, or other
  authority that owns the fact, not in Docs or the marketing site.

Keep these as routing categories, not speculative empty directories. Create a new service collection
only when the first verified finding has an identified owner, reproducible evidence, and a lifecycle
that cannot be represented by an existing collection. Search absence alone is not a content defect:
identify the canonical source, show why the selected surface undertakes to expose that truth, and
name the smallest reader-facing correction. A maintainer's refusal is evidence about placement and
scope, not evidence that the underlying fact is false.

Use the standard frontmatter plus `Finding`, `Evidence`, and `Recommendation` sections. Keep
`discovered` as `YYYY-MM-DD`. Evidence must be a non-empty list. If evidence contains a GitHub issue
or PR URL, the status must be `reported-upstream`, `declined-upstream`, or `fixed-upstream`; otherwise
lint fails.

When the consumer-side workaround for a finding is a golden change (a grader caution, avoid
trap, or disputed-truth encoding), it lands directly in the owned case file
(`eval/qa/corpus/battery/<category>/<id>.json`) through the `golden-truth` skill — cite the
case file and its `truth.verified` entry in the finding's evidence, and have the case's
`truth.verified.rootCause` point back at the finding. The two references keep the defect and
its eval-side patch mutually auditable.

Resolve intake through `improvements/intake.json`: per-finding override wins, then a service repo,
then an explicit service-level `unclear` or `mixed` rule. Use honest unclear when no public owner can
plausibly receive it; do not file to this repo just to close the loop. The drafter script renders and
scrubs the upstream issue body, resolves the repo from intake when unambiguous, and refuses unclear or
mixed targets unless a human supplies `--repo`.

File through the script so every issue has the same durable source and resolution contract:

```sh
# Inspect the exact title/body and resolved owner before the write.
npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run

# Post, append the durable URL to evidence, move to reported-upstream, and regenerate INDEX.md.
npm run improvements:file -- --file improvements/<collection>/<finding>.md
```

The filer applies the `raven` label when the target repository exposes it. Do not hand-file merely
to work around a missing label; the standardized body still identifies Raven as source.

Before the write, read the rendered issue as an upstream maintainer: the title and first paragraph
must state the affected surface and concrete defect without eval IDs, internal workflow language, or
a clipped transcript sentence. Put the smallest correction before optional context. Corpus/eval
provenance belongs in compact evidence, not in the owner-facing ask.

Read `references/upstream-writing-style.md` before drafting or filing upstream text. Use its
ASD-STE100-inspired rules for owner-facing text. Preserve exact technical tokens.

Before filing content/code drift, apply three cheap calibration checks:
- distinguish the version where drift was observed from the version that introduced it; verify the
  first bad release/commit when the timeline matters, and cite the live successor repo rather than an
  archived monorepo;
- run any allegedly broken snippet against the stated current dependency and name the actual failure
  stage; fix independent failures in the same snippet before calling the recommendation complete; and
- grep adjacent and repeated prose for the same claim so the smallest fix does not leave another page
  or later paragraph contradictory. Keep optional editorial expansion separate from verified defects.

The generated issue body must open with the automated-content notice and its
`generated-by-stellar-raven` marker, then retain all five sections: `Finding`, `Evidence`,
`Recommendation`, `Source Record`, and `Resolution Handoff`. `Source Record` links the exact public
`improvements/...` file on `stellar-experimental/stellar-raven` and, when committed, its immutable blob snapshot;
`Resolution Handoff` directs the owner to the
repo's `upstream-improvement-ready.yml` issue form with the finding id, resolving issue/PR, deployed
version or timestamp, and smallest live recheck. Do not hand-file a shortened body that drops either
link. An upstream maintainer who prefers a patch can use
`.github/PULL_REQUEST_TEMPLATE/upstream-improvement-handoff.md` for an evidence-only PR. The filing
script refuses to re-file `reported-upstream`, `declined-upstream`, or `fixed-upstream` records: search and dedupe first,
and use a successor finding when the remaining defect is materially different.

An immutable snapshot is valid only when the committed blob exactly matches the finding being
rendered. If the finding has uncommitted edits, publish the commit first or omit the snapshot; never
label an older version of the record immutable evidence for the current filing.

A finding can legitimately become `fixed-upstream` before anyone files it. If the original trigger no
longer reproduces, do not create a ceremonial issue merely to make every record have a URL. Add dated
live evidence and, when discoverable, record the pre-existing upstream issue/PR that explains the fix.

Current owner map (confirmed 2026-07-13): `lumenloop/lumenloop-backend` owns Lumenloop API and
content-pipeline findings, while `lumenloop/stellar-ecosystem-db` owns committed directory-record
corrections. For Stellar Light, `Stellar-Light/stellarlight` owns API/data/discovery behavior,
`Stellar-Light/stellar-scout` owns the Scout skill, and `Stellar-Light/scout-mcp` owns the MCP wrapper.
Official Stellar skill findings target `stellar/stellar-dev-skill`.

When adding or editing a finding, run:

```sh
npm run improvements:index
npm run improvements:lint
```

Use `npm run improvements:lint -- --live` when intake repos were added, renamed, or questioned.

## Direct Algolia remediation (stellar-docs search-mechanism findings)

`stellar-docs` findings split into content gaps and search-mechanism gaps. Content gaps (a page is
stale/wrong/missing) stay upstream on the docs repo. Search-mechanism gaps (ranking, tokenization,
synonym/vocabulary, crawler config) are now directly remediable with the operator Algolia
credentials in `.env` — write, crawler, and analytics tiers documented in
`research/services/stellar-docs-algolia.md`. Reach for the direct lever only when it clears the bar:

- **General mechanism only.** No per-page/per-query rules or synonyms — the same anti-overfitting
  rule the eval loop enforces. The single load-bearing rule (`raven-promote-stellar-cli-install`) is
  the ceiling of an acceptable single-target mechanism, not a template.
- **Measured win first.** Prove it on the read-only A/B harness (`npm run eval:algolia-raven`,
  `scripts/eval-algolia-raven.mjs`) before landing. A change that only helps its own case does not ship.
- **Lowest-risk rung.** Analytics read < rule/settings write < crawler/index write; the corpus also
  serves the real DocSearch frontend, so prefer reads and coordinate content-shaped changes upstream.
- **Record it like a fix.** Put the change, the A/B before/after, and the live re-check in the
  finding's `evidence`; keep any GitHub ref when a content/crawler cause also concerns the docs owner.
- **Never print or commit an Algolia key**, and never wire the operator keys into the `execute`
  sandbox — a model-invokable write is a gated side-effecting op, not a maintenance lever.

Analytics/usage keys are also a low-risk **evidence** source: real user query and no-result streams
quantify a finding's prevalence better than the eval corpus. Cite the analytics query and window.

## Upstream issue and PR follow-up

Use this loop when reviewing issues/PRs that were opened from findings, during drift refresh,
or when a user asks whether previous improvements were resolved.

1. Enumerate durable refs from frontmatter/evidence:
   - `rg -n "github.com/.+/(issues|pull)/" improvements`
   - include `reported-upstream` and non-fixed `verified` findings first, then fixed findings
     if a regression/recurrence is suspected.
   - also enumerate inbound `upstream-improvement-ready.yml` issues in `stellar-experimental/stellar-raven`;
     they are notification signals to verify, not proof of a fix.
2. Build a deterministic state table in a Solo scratchpad:

```
| finding | trigger evidence | upstream ref | ref state | PR checks/reviews | live re-check | action |
|---|---|---|---|---|---|---|
```

3. For each issue/PR, inspect current upstream state with the GitHub MCP tools or `gh`:
   title, open/closed/merged state, close reason, linked PRs/issues, latest maintainer
   comments, review decision, unresolved requested changes, failing checks, and last update.
   For PRs this repo opened, also check whether it needs author action, review response,
   rebase, CI fix, or abandonment.
   Confirm that every GitHub URL recorded as evidence resolves to the intended issue, PR, or comment.
   A locally printed URL is not durable evidence until it has been read back from GitHub. Remove or
   correct dangling refs; never describe an unposted draft as a public comment.

   **Check WHO wrote a comment you cite, not just that it resolves.** A comment URL resolving proves
   the comment exists, not that it says what the evidence line claims. An evidence bullet reading
   "maintainer triage accepted …" that links one of *our own* comments inverts who validated whom,
   and it carries that inversion into every issue body generated from the finding. Record the author
   and the direction: who corrected whom.

   **For byte-exact claims, use `gh api … --jq .body`, not the GitHub MCP `issue_read` tool.** That
   tool HTML-escapes bodies and strips autolinks and HTML comments, so a lane checking exact text
   through it will report phantom missing URLs and phantom `&gt;`/`&#39;` entities that are not in
   the real body. Two such false positives were raised and disproved during the 2026-07-31
   verification round.

   **Silence is the default on untouched open issues.** Do not add reminder, status-chasing,
   backlink-only, recurrence-only, or "still reproducible" comments when there is no indication that
   anyone has attempted to act on the issue. Keep routine recurrences local. Comment only for:
   - substantive maintainer activity that needs a direct response;
   - a claimed or deployed fix that needs a verification result;
   - materially new evidence, a regression, or a correction that changes the proposed action; or
   - author-owned PR work such as requested changes, CI repair, or rebase.

   Missing source-record links on an already-filed untouched issue do not override this no-noise
   rule. Preserve the backlink locally and ensure future filings contain it in the original body.
4. Re-run the original trigger:
   - finding with `probe` frontmatter: `npm run improvements:probes` or a targeted equivalent.
   - eval-origin finding: use the stored transcript only to reconstruct the original claim,
     then re-run the smallest live `execute` or direct service call that can prove current
     upstream state.
   - drift-origin finding: compare the refreshed inventory/catalog/service response that
     originally exposed the gap.
5. Classify the outcome:
   - `fixed`: live trigger no longer reproduces; update status to `fixed-upstream`, add dated
     evidence, and note the resolving issue/PR.
   - `still-repro`: keep status and add a local recurrence with date and evidence. Comment upstream
     only if the ref claims to be fixed or the new evidence materially changes the requested action.
   - `closed-unfixed`: keep or return to `reported-upstream` while the GitHub ref remains in
     evidence, record why closure did not resolve it, and open a successor or follow-up ref
     only when the owner path is clear.
   - `superseded`: link the successor finding or upstream ref; do not stretch the old finding.
   - `inconclusive`: do not change status; record the missing evidence and create a Solo todo or
     timer for the next concrete check.
   - inbound handoff issue/PR: acknowledge with the live-recheck result, update the finding only
     when the evidence bar is met, and close the Raven notification after recording the resulting
     finding/status/ref. An evidence-only PR may append refs or reproduction evidence, but must not
     claim `fixed-upstream` without a reproducible live check.
6. Drain genuinely resolved records. The author-side `fixed-upstream` classification is not enough;
   a distinct reviewer must re-derive every deletion candidate by:
   - reading the finding and current upstream issue/PR directly;
   - confirming the change is deployed, not merely merged or closed;
   - freshly executing the original trigger rather than accepting the author's transcript;
   - scanning adjacent behavior for residuals and creating a self-contained successor when needed;
   - running `rg -n "<finding-id>" .` and reconciling golden, register, research, Algolia-rule,
     intake, and other persistent references;
   - verifying cleanup removes the file, its probe and intake override, regenerates the index, and
     appends a complete resolved receipt;
   - confirming a resolution comment with the live result and commit-pinned source was posted on
     every upstream ref, or recording why that is not applicable for a never-filed fix.

   Then use the resolver, first as a dry run:

```sh
npm run improvements:resolve -- --file improvements/<collection>/<finding>.md \
  --live-recheck "<dated command/URL/result>" \
  --review-evidence "<distinct reviewer and evidence>" \
  --references-reviewed --upstream-commented --dry-run
```

   Omit `--dry-run` only after the printed upstream comment is posted. Use
   `--upstream-comment-na` only when the finding was never filed. Pass each resolving issue/PR with
   `--resolving-ref`. The resolver appends `improvements/resolved.json`, removes any per-finding
   intake override, deletes the active file, and regenerates `INDEX.md`.

   Superseded records with an open upstream issue do not delete until that ref is commented/closed
   with a successor link and the successor restates the evidence. Partial fixes follow the same rule.
   A regression after deletion gets a new id and cites the resolved ledger entry; never resurrect or
   reuse the retired id.

7. Regenerate and verify after edits:

```sh
npm run improvements:index
npm run improvements:lint
npm run improvements:lint -- --live
npm run improvements:probes
```

Use Solo timers for a concrete future verification event instead of memory. Do not schedule a timer
whose only outcome would be another reminder on an untouched issue. A timer body should include the
finding ids, upstream refs, scratchpad id, and the exact re-check or maintainer signal to inspect.
When an authorized filing or verification lane is blocked by an upstream capacity or rate limit,
use a repeating 10-minute retry timer until the service recovers; cancel it immediately after a
successful probe. A longer watchdog deadline is not the retry cadence.

## Probes and recurrences

Probe frontmatter is optional and shaped as:
`probe.type: http-text`, `probe.url`, and `probe.expect.status`, `contains`, or `excludes`.
Run `npm run improvements:probes` to re-check non-fixed, non-declined findings with probes. A recurring hit should
be converted into a structured `recurrences` entry with a date and evidence; probe failures or
inconclusive results are review signals, not automatic status changes.
Use `npm run improvements:probes -- --include-declined` only on a drift round or when materially new
evidence warrants revisiting an accepted owner decision.
Use repeatable `--service <service>` or `--exclude-service <service>` filters when the task has an
explicit collection boundary; for example,
`npm run improvements:probes -- --exclude-service stellar-docs`. Do not touch an excluded upstream
surface merely because the unfiltered cadence command normally covers it.

## Regeneration and lint

`improvements/INDEX.md` is generated. Never hand-edit it; run `npm run improvements:index`
after finding/frontmatter/status changes.
`npm run improvements:lint` is the gate. It fails when finding frontmatter is malformed, status/service
values are invalid, declined disposition/evidence is missing, resolved-ledger receipts are malformed
or collide with active IDs, evidence or recurrence fields are missing, the generated index bytes differ from
the committed file, intake services do not cover the four collections exactly, an override points to a
missing finding id, a repo string is not `owner/repo`, or a finding cannot resolve to a repo, mixed
rule, or explicit unclear marker. `npm run improvements:lint -- --live` additionally checks each
distinct intake repo and every recorded GitHub issue/PR/comment evidence URL. The base lint also
rejects duplicate top-level frontmatter keys so a later block cannot silently shadow earlier
evidence. Live lint fails on stale, inaccessible, redirected, or dangling refs.

## Intake maintenance

When adding or renaming repos, update `improvements/intake.json`, keep repo strings canonical, and run
the live lint. Add per-finding overrides when the service rule is too broad. Leave intake unclear only
when the public owner is genuinely unknown; include the rule or reason so future agents understand why.

## Cadence

During eval rounds, file or update findings before closing the round. On drift-refresh days, run probes,
refresh statuses for upstream fixes with live evidence, and run live intake lint. Ad hoc edits to
findings, probes, or intake always end with index regeneration if needed and lint.

For broad cadence work, use the `truth-maintenance` skill as the coordinator: it creates the
Solo scratchpad/todo, fans out issue/PR, drift, eval, and golden reviewers, and reconciles the
lane verdicts before closeout.
