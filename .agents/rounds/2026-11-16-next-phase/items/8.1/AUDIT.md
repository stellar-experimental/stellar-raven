# Item 8.1 audit: `.agents/TODO.md` dispositions

Audited against `origin/main` `bb171055` on 2026-11-18 by the executor (Claude Sonnet 5.5), from
[PLAN.md](PLAN.md) and its "Review reconciliation". K is keep, R rewrite, M merge, D delete, N new.
Items are named by their heading in the new TODO, never by row number. Every R, M, D and N has a
line with its reason. For a deleted fact, the line says where the fact lives now. K items are listed
at the end so that every item has a disposition.

## Rewritten (R) and merged (M)

- **Priorities** (R). Rewritten to the state after round items 6.x and 7.x: dated runs, one
  2026-11-25 Mac session, owner decisions, free fixes. Dropped the 3.2 and 3.3 history and "No
  mechanism here is pending". Kept the "Round item N" definition, the holds sentence, and added
  "Everything not named here is a hold ...".
- **First-principles round follow-ups intro** (R). Trimmed to its links and the ADR-0011 line. The
  owner's acceptance of the live-data loss now links decision 5 in DECISIONS.md.
- **Held-out status** (R, now its own `##` section). Kept the current split (path, SHA-256, 93/109/45),
  the stale-split rule, the tuning-scan flag, the battery-test line with its ids link, the
  held-out-reads line (119 rows), the case-naming rule, the maintenance exception and the
  confirmation-only paragraph. Deleted the v2 to v11 amendment history (hashes, reasons, and the
  moves of single cases in 2026-11-16 and 2026-11-17): each hash and reason is in the
  [round ledger](../../../2026-11-16-next-phase.md) rows for D2, 1.1, 1.4, 3.5, 5.1, 5.2, 6.1 and 6.2
  and in DECISIONS.md ("Answers" 2(b), "Follow-up answers (2026-11-17)"). Fixed "pairs on v6's 113"
  to the current split's 109 held-out rows.
- **Audit source coverage** (R, M, then deleted). The owner's source choice moved to Owner decisions,
  decision 1. The class summary became one sentence plus the CLASSIFICATION.md and LEAVES.md links.
  The Pi Network sentence (`sd-113`) moved to decision 1. The contract-id derivation bullet merged
  into "Fix Docs search misses on canonical pages". Deleted the finding list (`sd-111`, `sd-112`,
  `sd-113`, `ll-039`, `sls-121`, `sls-122`) and the count of "not re-run" leaves: the 1.3
  CLASSIFICATION.md and the Improvements follow-up item hold them.
- **Caps audit follow-ups intro and "Ship the cap decisions from the production read"** (R, renamed
  "Decide the `execute` timeout from one more Workers Logs read"). Deleted the three decided caps
  (`MAX_SEARCH_LIMIT` keep 50, the 24-second operation budget shipped in #462, artifact caps
  keep) as done. The decisions and reasons are in `items/3.1/EXEC.md`, the 3.1 ledger row and
  `items/3.2/REPORT.md`; the figures are private. One line of standing values stays in the section
  intro. The `execute` timeout and the Mac follow-up read stay, with every question the read
  answers listed once.
- **Re-verify each external client limit** (R, renamed "... before changing model-facing text").
  Recorded the current agentpc versions (Claude Code 2.1.327, Codex 0.169.0, Grok 1.0.88) against the
  measured ones and said the re-check is due. The old trigger, "whenever its client version
  changes", fires every week; the new one is a text change or a release note that names an MCP text
  limit. Named the cheapest check (the audit table's method for Grok's 2,033-character cut).
- **Hold the sealed FAM confirmation rows** (R). Trimmed the decision history to one sentence with a
  link to DECISIONS.md "Follow-up answers (2026-11-17)". The hash, use rule and done condition stay.
- **Look at the Freighter and Scout SDK-status goldens** (R). Dropped "(round items 1.1 and 1.3 do
  not take it)". Next step is one `golden-truth` lane whose brief claims the maintenance exception and
  names the trigger. No condition on a case's set.
- **Prove the stellar.org source** (R). Deleted "Audit register (done)" (`sd-111` and `sd-077`
  reported upstream 2026-11-17: in the 1.3 record and the Improvements follow-up) and "Anchor
  Directory (done)" (no golden edit: in the 1.3 record and #469). Cut the routing-reach bullet to
  its standing numbers and the reopen trigger. The deleted description-reword result (reach 8 to 6
  of 40) is in the 3.3 MEASURE.md.
- **Preserve structured routing intent across extraction caps and gate tiers** (R). The RWA bullet
  now says #167 closed on 2026-11-18 as "decided: excluded by measurement". The 6.3 and 7.2 results
  shrank to one sentence with three links. The re-open triggers live here. #223 stays mapped here.
- **Re-check the upstream codemode short-token repair** (R). Deleted the last paragraph about #167
  (closed; the fact is in the routing item and DECISIONS.md).
- **Re-evaluate Scout exposure after a routing-contract change** (R). Cut "Fired 2026-11-16 ..." to
  one "Last fired" line. The lane deltas (+1 legacy, -1 extended, -1 protocol-history) are in
  `items/0.2/SCOUT-EXPOSURE.md`.
- **Triage the runtime and client gaps from the HackMeridian telemetry** (R, M, split). The
  `matchPartners` bullet became its own item (N). The skill-scrub bullet became its own item (N).
  The Docs-ranking bullet merged into "Fix Docs search misses on canonical pages". Deleted the
  Playground output-cap bullet as "no change": the 3.1 read found cap stops rare, and the decision
  is in DECISIONS.md "Follow-up answers (2026-11-18)" for owner veto. Deleted the `errorName`
  "Shipped" line (done in #462). The `recoveryHint` bullet points at the `execute` timeout item. The
  client-loop bullet says the oauth-provider 1.x deploy changed the OAuth path and points at the
  sign-in watch. The production-read paragraph shrank to what the first two bullets now say.
- **Explain the soft-empty and skipped-write anomalies from the production read** (R). The next step
  points at the `execute` timeout item's read. No other change.
- **Fix the `getChangelog` ranking trap for release questions** (R, renamed from "Add a release and
  package-version source"). The owner's source choice and the Dashboard lumens API moved to Owner
  decisions, decision 2. The item keeps the own-repo part, the probes Q5, R23, R33 and R35 as the
  test, the gate (`npm run eval:routing -- --gate`, no holdout loss), and the 3.1 finding that the
  fix is low value.
- **Watch sign-in rejects after the oauth-provider 1.x deploy** (R, from "Re-check Devin CLI
  sign-in after the oauth-provider 1.x deploy"). A general post-deploy watch. Fixed "The owner
  accepted": the orchestrator accepted the loss under the owner's delegation. Added the denominator
  rule, the known-class sentence, the non-native `redirect_refused` classes and the 2026-11-25 date
  with its reason (7-day log retention).
- **Stabilize the timing-ratio assertion in `test/qa-judge-evidence.test.mjs`** (R). Names the run
  (44223760712 on the final head `997f8e30`, attempt 1 failed, attempt 2 passed), names the test by
  title, and keeps assert lines 1518 and 1519. Dropped the block line range, which was not the
  block.
- **Wait for a picomatch release that fixes GHSA-fc5q-39xc-vjpf** (R). Re-measured on 2026-11-18:
  `npm run build` from `bb171055` gives a `dist/server.js` with 0 matches for `picomatch`, and npm
  `latest` is still 4.0.7. Added the `@cloudflare/vitest-plugin@0.0.0` downgrade from #481's body.
  Done condition unchanged.
- **Move `wrangler`, `miniflare`, and `@cloudflare/vitest-plugin` together** (R). Already current after
  #483 and #485. Added a done condition: delete when the plugin no longer pins `wrangler` exactly.
- **Move the demo off the deprecated `workers-ai-provider`** (R). cloudflare/agents#2790 was closed
  as not planned on 2026-11-03, so `createAI` keeps stream resume and the reviewed-decision clause
  stands. Named `cs-010` as cloudflare/agents#2809 (open). Recorded the npm deprecation of 4.0.1.
- **Obtain a written exception for the accepted two-tool endpoint** (R). The revoke step now points
  at the `mcp-key` check ("Confirm `npm run mcp-key` on wrangler 4.164.0").
- **Owner decisions** (R). "None open" replaced by six decisions with a question and safe default
  each, plus a pointer list of owner-blocked actions.

## New (N)

- **Re-expose `scout.matchPartners` when `sls-123` is fixed.** Taken from the triage item's first
  bullet: trigger, four steps and holdout ceiling, unchanged.
- **Narrow the skill scrub so an excluded operation keeps the skill's workflow.** Taken from the
  triage item's second bullet.
- **Fix Docs search misses on canonical pages.** Merges the contract-id derivation evidence with the
  HackMeridian Docs-ranking bullet. Keeps the two mechanisms apart, starts with one free re-probe
  after the #474 titles, and states that the contract-id miss is not filed (`sd-112` precedent).
- **Confirm the WorkOS GitHub sign-in recovery and decide its record.** Required change 3 of the
  note. Names no person, email or WorkOS ID.
- **Flush the uncited golden-round JSON.** Item 7.1, proposal 1 (84 files at 7.1: 24 cited by the
  corpus, 1 by `sd-108`).
- **Move the compiled case files into `eval/qa/compiled/`.** Item 7.1, proposal 2. The trigger is a
  state (no `raven-dated` or `raven-watchdog` timer unit), not a date.
- **Wire the case-search guard into Codex and Grok.** Item 7.1, proposal 3.
- **Confirm `npm run mcp-key` on wrangler 4.164.0.** The note's `mcp-key` starting point. The free
  read-only remote list runs in the 2026-11-25 Mac session.
- **Owner decision 3, the MCP Skills extension** (required change 2 of the note).
- **Owner decision 5, install ripgrep on agentpc** (item 7.1, proposal 4).
- **Owner decision 6, a production bearer credential for post-deploy checks** (item 7.3 PR 3 report:
  `live-host-check.mjs` was not run after the deploys).

## Deleted (D)

Every deletion is on a line above: the cap decisions, the Playground output-cap bullet, the
`errorName` "Shipped" line, the audit register and Anchor Directory bullets, the amendment history,
the finding list of Audit source coverage and the #167 paragraph of the codemode item.

## Kept (K)

Header; Check what the judge saw before changing how it weighs cited text; Carry the guard to
absence-of-standard statements; Watch required-service coverage on the 58-row panel; Test the
`stellarOrg` result rule for the corroboration guard; the Family decider intro; Re-verify the
event-tied goldens after SCF #46 Panel Review and the Bell vote (frozen, byte-identical); Close the
register entries the dated runs leave open (frozen, byte-identical); Golden follow-ups from the
sls-024 and sls-029 cap review; Resolve held source ownership and bounty policy; the Improvements
follow-up list (the frozen Software Versions bullet byte-identical; `sls-116` already maps #427);
Monitor the Horizon protocol-ceiling note; the Routing intro; Stop schema enum values and example
tokens from admitting new Scout operations; Bind the `scout_hackathon_detail` card to its
operation; `search` does not surface the research lane for protocol-history questions; Stop
identity substitution on spelling-corrected matches; Revisit general directory admission after the
rejected D3 experiment; Point agents at the page when a docs hit has no body; Clarify the
model-facing `codemode.describe` response shape; Repair the `test/live/` suites against current code;
Method note: same-surface verdict noise, and the judge-tier cap; Keep OpenCode out of client
diagnostics; Close the remaining claim-support gaps of judge pack p9; Decide whether a sourced
summary error matches must-avoid "unsupported memory"; Reconcile the QA answering prompt with
out-of-scope goldens; Monitor Raven capability-boundary offers; Monitor Friendbot network-context
synthesis; Move the pinned judge-stability register out of the `gca-eval` worktree; Verify that
xAI accepts the explicit tool `strict` field; Keep `sources.locate` deferred; A future `retrieve`
or `read` tool; Consider consolidating the auxiliary Workers; Remove the OpenAI domain
verification Worker after approval.

## Issue map

#481 maps to "Wait for a picomatch release that fixes GHSA-fc5q-39xc-vjpf". #427 maps to the
`sls-116` bullet of the Improvements follow-up. #223 maps to "Preserve structured routing intent
across extraction caps and gate tiers". #167 is closed and recorded there too.
