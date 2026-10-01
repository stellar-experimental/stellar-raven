accept with fixes

1. **Medium — The survey misses a maintainer approval.**

   File: `.agents/rounds/2026-09-30-raven-next.md:51-55,145-146`.
   Claim: PR #2021 has no maintainer review and needs no action.
   Evidence: `gh api repos/stellar/stellar-protocol/pulls/2021/reviews` returns an approval from `leighmcculloch`.
   GitHub identifies the reviewer as `MEMBER`.
   The approval date is `2026-09-29T21:44:44Z`.
   The reviewed commit is `777561b29a8f8350815a2988e16b69e87a7aca5d`, which matches the survey's head.
   This approval predates the survey.
   The [approval](https://github.com/stellar/stellar-protocol/pull/2021#pullrequestreview-5358887566) contradicts the recorded claim.
   The PR remains open and unmerged, with `mergeable_state: blocked`.
   The default-branch README still omits SLPs, and `limits/README.md` still lacks the proposal index.
   Thus, the approval does not establish a deployed fix for `sd-037`.
   Fix: record the approval and correct item 13.
   Inspect the remaining merge blocker under `.agents/TODO.md:150-169`.
   Keep `sd-037` at `reported-upstream` until the original source checks show the fix.
   Do not add an upstream reminder merely because the approval exists.

2. **Medium — The roster changes routing policy before the recorded owner decision.**

   File: [`research/agent-model-roster.md:70-74`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/agent-model-roster.md).
   Claim: agents must treat `gpt-5.6-terra` as a retired lane.
   Evidence: the installed catalog lists this model and supports six reasoning efforts.
   Its description says `Older balanced model for straightforward work.`
   Catalog age does not establish retirement.
   `AGENTS.md` still assigns Terra high to routine implementation and bounded verification.
   The roster itself assigns routing policy to `AGENTS.md` at lines 8-10.
   The round explicitly marks the routing change `needs-decision` at lines 99-104.
   Fix: state the catalog description and retain the routing decision as a proposal.
   Remove the retirement instruction until the owner approves the corresponding `AGENTS.md` change.

3. **Medium — The ranked list omits actionable work from the current queue.**

   File: `.agents/rounds/2026-09-30-raven-next.md:92-149`.
   Claim: the ranked list identifies the work worth doing next across the service and repository.
   Evidence: `.agents/TODO.md:15-40` queues two Stellar Docs adapter tasks.
   These tasks cover the documented `hitsPerPage` default and unnecessary `content` retrieval.
   The adapter and specification still contain the relevant mappings and over-fetching behavior.
   `.agents/TODO.md:488-505` also queues conflicting source-authority instructions for full-description clients.
   `src/mcp/tools.ts` still contains the Docs-first clause.
   [`.agents/NEXT.md:9-12`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) places general routing and source-authority work first.
   Ranked item 13 mentions issue #167 but does not account for this distinct instruction conflict.
   [`.agents/NEXT.md:17`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) and `.agents/TODO.md:737-743` also require private collection and cleanup verification.
   The survey checks the deployed schedule and an hourly health workflow.
   Neither check proves that daily retention cleanup succeeded.
   `scripts/check-usage-health.mjs` checks canary freshness and response gaps, without a cleanup-success field.
   Fix: rank these tasks or give an explicit deferral and reason for each.
   Identify the measurement requirement for the adapter default before a change ships.
   Identify the existing cost-enforcement blocker for a Playground comparison.
   Keep private operational evidence outside this repository.
   Limit the survey conclusion to the behavior its probes tested.

4. **Medium — Item 9 adds an owner gate to already queued golden updates.**

   File: `.agents/rounds/2026-09-30-raven-next.md:130-135,155`.
   Claim: all listed golden freshness work waits for an owner scheduling decision.
   Evidence: `.agents/TODO.md:105-127` already directs four sibling-case updates through `golden-truth`.
   [`.agents/NEXT.md:15`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) also directs the two September 14 freshness updates.
   These entries require source verification, independent review, and corpus checks.
   They do not require another scheduling approval.
   The reserve-date changes also have no future-event dependency.
   Fix: separate the already queued updates from future scheduled checks.
   Label the queued updates `simple`, with their required golden-truth checks.
   Retain the future dates and the prohibition against early closure of the October 8 traps.
   Identify a specific unresolved owner question if any individual case still needs a decision.

5. **Low — The roster evidence uses false blanket statements.**

   Files: `.agents/rounds/2026-09-30-raven-next.md:74,99-101`; [`research/agent-model-roster.md:73`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/agent-model-roster.md).
   Claims: every previous ID, version, and default is stale; every 5.6 description says `older generation`.
   Evidence: previous IDs remain listed in the installed catalog.
   Claude aliases remain `fable`, `opus`, and `sonnet`.
   The 5.6 Sol description contains `Older generation`.
   The Terra description contains `Older balanced`, and the Luna description contains `Older fast and efficient`.
   The roster's table correctly distinguishes these descriptions.
   Fix: name the changed defaults, installed versions, and Grok context figure.
   Describe the 5.6 models as older models, without attributing one exact phrase to every description.

6. **Low — Added prose repeatedly violates the supplied writing rules.**

   Files: the locations below contain sentences longer than 20 words or sentences with several ideas.
   The supplied global `AGENTS.md` instructions require active voice and one idea per sentence.
   They also set a maximum of 20 words per sentence.
   The review brief explicitly applies these rules to every edited sentence.

   | File | Locations requiring sentence review |
   | --- | --- |
   | `.agents/rounds/2026-09-30-raven-next.md` | 9-13, 34-37, 51-55, 61-66, 99-124, 125-135, 148-149, 157-158 |
   | `.agents/rounds/2026-09-30-raven-next/review-brief-a.md` | 20-22, 26-28, 31-32, 41-43 |
   | `.agents/rounds/2026-09-30-skill-system-audit.md` | 211-218, 222-228 |
   | `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md` | 15-16 |
   | [`research/agent-model-roster.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/agent-model-roster.md) | 3-6, 55-56, 70-79, 95-100, 112-115, 193-195, 206-213, 217-220, 229-233 |

   For example, the roster's calibration sentence at lines 209-211 contains 34 words.
   Its call-evidence sentence at lines 230-233 contains 39 words.
   The survey conclusion at lines 148-149 contains 25 words and uses passive voice.
   The roster introduction also uses passive forms such as `was not re-checked` and `is labelled`.
   The receipt starts with passive fragments such as `Recorded` and `Merged by squash`.
   Fix: split the prose into short sentences and identify the actor where the record supports one.
   Preserve commands, identifiers, numbers, catalog descriptions, and quoted upstream text exactly.
   Do not apply prose word limits to command lines or catalog tables.
   The edited `PLAN.md` and [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) sentences need no writing correction.

Review scope and limits:

I reviewed all eight changed files at `HEAD` `8ce44d58de1abaaa566c4e3f8952e07c65d2a333`.
The comparison base was `origin/main` `6dd9439461a286f5ca5f87722fb60f238c610d3d`.
The initial tracked tree was clean.
I changed no tracked repository file and posted nothing upstream.
I ran no paid evaluation, deployment, service start, or pane control command.
The roster's historical public benchmark section remains explicitly unverified; I did not refresh those historical figures.
The prior audit ledger supports the four completed reviewer calls recorded in the refreshed roster.
The cache confirms model availability, rather than successful calls for every listed model.
The connector refused authenticated `execute`: `MCP tool call requires approval, but approval policy is never`.
Thus, I did not independently repeat the receipt's four-call authenticated execution.
The historical `postdeploy` failure and pane release remain attributed to the owner's handoff.
The receipt does not provide a separate retained transcript for those historical events.
I did not treat that attribution as independent verification or permission to control those panes.
The installed-tree `npm audit --json` returned 23 affected packages.
An isolated audit of the committed lockfile reproduced the survey's 10 findings.
The first `npm outdated` attempt failed because its default cache was not writable.
These environment results do not establish an error in the committed dependency snapshot.

Verified and correct:

- Every roster model ID, version, context figure, default, and effort list matches the installed catalogs and CLI help.
  Codex `0.159.2`, Claude Code `2.1.286`, Grok `1.0.44`, and OpenCode `1.18.32` match.
  The Codex table has nine listed models and two hidden models.
  The host selects `gpt-6.1-sol` at high effort; its catalog default is low.
  Listed Codex context figures match, including `gpt-5.5` at 272k maximum context.
  Grok lists four models, selects `grok-4.7`, and reports 256k context for each.
  Its cache describes `grok-4.7-build-fast` as `Fast variant. 2x the price.`
- `sd-052` correctly qualifies as `fixed-upstream` under improvements-pipeline step 5.
  The [live manual](https://developers.stellar.org/docs/tools/cli/stellar-cli) annotates all five original languages and Kotlin Multiplatform.
  The annotations appear in both the command list and each language section.
  [PR #2766](https://github.com/stellar/stellar-cli/pull/2766) merged at `2026-09-29T21:42:53Z` as `d0b26d9f47e72d3ab5949c467cb11d452933cce8`.
  Issue #2722 closed as completed at `2026-09-29T21:42:55Z`.
  The external-tool link remains absent from those descriptions.
  That absence is an unimplemented recommendation, rather than recurrence of the original built-in-capability defect.
  Retaining the finding until the resolver checks pass is correct.
- PR #184 merged at `2026-09-30T20:46:08Z` as `6dd9439461a286f5ca5f87722fb60f238c610d3d`.
  All four recorded checks passed before the merge.
  `npx wrangler deployments status` confirms version `9f5a4151-8fa6-41d9-a68d-776052d6ddd5` at 100% traffic.
  Its version timestamp is `2026-09-30T20:46:26.467Z`; its deployment timestamp is `2026-09-30T20:46:29.652Z`.
- All nine listed public routes returned HTTP 200 during this review.
  GET `/playground/chat` and `/register` returned HTTP 405; unauthenticated POST `/mcp` returned HTTP 401.
  `/health/skills` reported 64 successful checks at `2026-09-30T21:07:19.979Z`.
  Authenticated `search` reproduced the first two operations, score 150, total 31, and truncation at 10.
- The usage deployment check confirmed the tail consumer and daily retention schedule.
  The private usage file-boundary check passed.
  Workflow run `36773447337` logged a successful canary and collection-gap check at `2026-09-30T20:33:27.9633918Z`.
- The committed lockfile audit returned 8 high and 2 moderate findings.
  GitHub lists seven open Dependabot alerts, including the two recorded runtime alerts.
  PR #2837 remains open at `108ba24e0884f46e0c543996e4e94be754709840`, with `REVIEW_REQUIRED`.
  Issue #167 remains open.
- All twelve golden dates through `2026-10-20` match the owned case files.
  The skill-tooling deferrals match the current task queue.
  The corrected maintenance links exist, and the history rewrite closed without rewriting on `2026-09-17`.
- `npm run improvements:lint` passed for 65 findings and verified the generated index bytes.
  `git diff --check origin/main` passed.
  The review output is ignored by Git.
