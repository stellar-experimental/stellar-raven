# Item 8.13 lane `todoslim` — Report

- **PRs (split by sub-area per `8.13-SLIM.md`, disjoint and mergeable in either order):**
  - Part 1 (`.agents/TODO.md` + lane records): https://github.com/stellar-experimental/stellar-raven/pull/531 (`np/8.13-todoslim`)
  - Part 2 (`ideas/**`): https://github.com/stellar-experimental/stellar-raven/pull/532 (`np/8.13-todoslim-ideas`)
- **Merge window:** PR #531 must merge before `2026-11-23 18:00 UTC` (dated run 2.1 reads `.agents/TODO.md` from `origin/main`).
- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty on both branches).
- **Model-facing:** No (records and `ideas/` notes only). No deploy needed.
- **TODO items closed / merged:**
  - **Deleted:** `"A future \`retrieve\` or \`read\` tool"` (design rules already recorded verbatim in [ADR-0011](../../../../../../research/decisions/0011-tool-surface-stays-code-mode-trimmed.md) and `research/audits/2026-11-12-first-principles-round.md:156`; no open task, trigger, or done-when).
  - **Merged:** `"Check what the judge saw before changing how it weighs cited text"` folded into `"Close the remaining claim-support gaps of judge pack p9"` (removing the empty `## First-principles round follow-ups` section while preserving the owner's decision-5 live-data reopen rule in `## Priorities`).
  - **Merged:** `"Stop schema enum values and example tokens from admitting new Scout operations"` folded into `"Preserve structured routing intent across extraction caps and gate tiers"` (preserving the three operations, builder root cause, 544-row corpus non-hackathon bar, and 22 negative probes).
  - The lane assignment itself (`item 8.13 todoslim`) had no separate TODO queue entry.

## Line and block counts (before → after)

| File | PR | Lines before | Lines after | Delta | Blocks before | Blocks after | Blocks removed |
|---|---|---:|---:|---:|---:|---:|---:|
| `.agents/TODO.md` | #531 | 1,500 | 1,152 | −348 | 304 | 274 | −30 |
| `ideas/README.md` | #532 | 21 | 19 | −2 | 5 | 4 | −1 |
| `ideas/observability-r2-retention.md` | #532 | 78 | 64 | −14 | 16 | 16 | 0 |
| `ideas/partner-doc-live-sources.md` | #532 | 207 | 92 | −115 | 21 | 13 | −8 |
| `ideas/playground-chatgpt-subscription-login.md` | #532 | 202 | 94 | −108 | 45 | 21 | −24 |
| `ideas/retrieval-demand-report.md` | #532 | 120 | 63 | −57 | 38 | 18 | −20 |
| `ideas/shareable-durable-playground-sessions.md` | #532 | 460 | 158 | −302 | 99 | 31 | −68 |
| `ideas/skill-discovery-without-bundling.md` | #532 | 99 | 70 | −29 | 22 | 19 | −3 |
| `ideas/source-delivery-ranked-references.md` | #532 | 496 | 238 | −258 | 87 | 52 | −35 |
| `ideas/user-controlled-personalization.md` | #532 | 48 | 40 | −8 | 11 | 10 | −1 |
| **Total** | | **3,231** | **1,990** | **−1,241 (−38%)** | **648** | **458** | **−190** |

## `.agents/TODO.md` item-by-item audit

All six frozen dated-run anchors (`## Held-out status`, `"Re-verify the event-tied goldens..."`, `"Close the register entries the dated runs leave open"` + `none recorded yet`, the `Software Versions (not filed)` bullet, `## Dependencies`, `"Re-verify each external client limit..."` heading) and both orchestrator-protected Priority 4 items remain **byte-identical** to `origin/main`.

| Item | Verdict | Evidence |
|---|---|---|
| `## Held-out status` | **Frozen (unchanged)** | Dated-run anchor (`items/8.12/todo/REPORT.md`); byte-identical. |
| `Check what the judge saw before changing how it weighs cited text` | **Merged** | Folded into `"Close the remaining claim-support gaps of judge pack p9"` (same held trigger plus non-`execute` prototype revival / committed-judge dispute); removes empty `First-principles round follow-ups` section. Decision 5's live-data reopen rule moved to `## Priorities`. |
| `Decide the execute timeout from one more Workers Logs read` | **Keep (slimmed)** | Priority 2 (2026-11-25 Mac Workers Logs session); kept all 4 query checks and Codex 60s timeout context. |
| `Re-verify each external client limit before changing model-facing text` | **Keep (slimmed)** | Standing pre-edit trigger; heading frozen (`test/helpers/mcp-tool-metadata.ts:30`). Verified exact lengths (`1,899`, `1,960`, `1,964` chars). |
| `Carry the guard to absence-of-standard statements` | **Keep (slimmed)** | Legit held item with clear trigger (next guard revision or repeated absence claims). |
| `Watch required-service coverage on the 58-row panel` | **Keep (slimmed)** | Standing monitor (tripwire `<= 53/58` on next panel run). |
| `Test the stellarOrg result rule for the corroboration guard` | **Keep (slimmed)** | Legit held item (untested guard/over-hedge rule; trigger `>= 5` `stellarOrg` claim answers). |
| `Hold the sealed FAM confirmation rows` | **Keep (slimmed)** | Owner-held single-use sealed dataset (SHA-256 + backup paths retained). |
| `Prove the stellar.org source` | **Keep (slimmed)** | Legit unproven source item + accepted routing reach + held Algolia `pages` trigger. |
| `Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote` | **Frozen (unchanged)** | Dated-run anchor; byte-identical. |
| `Close the register entries the dated runs leave open` | **Frozen (unchanged)** | Dated-run anchor (including `none recorded yet` and post-2.2c corpus-guide audit); byte-identical. |
| `Golden follow-ups from the sls-024 and sls-029 cap review` | **Keep (slimmed)** | Concrete edit waiting on next deliberate live-contract revision; dropped already-done market-map parenthetical. |
| `Resolve held source ownership and bounty policy` | **Keep (slimmed)** | Legit held primary-evidence corrections (RWA, Phoenix, HackerOne bounty). |
| `Review the codegen-adjacent goldens by case id` | **Keep (slimmed)** | Legit held corpus-coverage item (6 case-id concerns + 4 unowned Soroban codegen topics). |
| `## Improvements follow-up` bullets (`sls-116`, `sls-121`/`sls-122`, Docs PRs, `ll-022..024`, `cs-006`, `sk-031`, Coins.ph) | **Keep (slimmed)** | Active upstream recheck triggers verified against `improvements/`; `Software Versions (not filed)` bullet kept **byte-identical**. |
| `Monitor the Horizon protocol-ceiling note` | **Keep (slimmed)** | Standing free monitor for improvements/drift rounds + repository-recovery reopen bar. |
| `Probe the malformed-input gap in the pinned smart-contracts skill` | **Protected (unchanged)** | Left byte-identical per orchestrator instruction (`#521` filed `sk-040`; orchestrator updates TODO). |
| `Preserve structured routing intent across extraction caps and gate tiers` | **Keep (slimmed + absorbed Scout builder item)** | Core held routing debt, `eval/gates.json` bounds (`12`/`26`/`11`/`30`), `test/drift-141-routing.test.ts` (`it.fails.each`), fixed stale `test/search.test.ts:1039` -> `rfp` case, FAM dev rows bundle pointer, 12 acceptance checks + 544-row/22-probe hackathon bar. |
| `Stop schema enum values and example tokens from admitting new Scout operations` | **Merged** | Explicitly treated with the general routing repair under the same 12 checks; folded into `"Preserve structured routing intent..."` with full 544-row corpus + 22 negative probes done-when. |
| `search does not surface the research lane for protocol-history questions` | **Keep (slimmed)** | Owner decision 6(a) hold, `eval:protocol-history` diagnostic rule, PH3/PH4 reopen rules, identifier-pointer archive pointer and fixes. |
| `Stop identity substitution on spelling-corrected matches` | **Keep (slimmed)** | Legit held residual risk (`unverified-match`). |
| `Re-check the upstream codemode short-token repair` | **Keep (slimmed)** | Triggered by `@cloudflare/codemode > 0.5.6` for `cs-001` (#2296) and `cs-012` (#2897/#2898). |
| `Revisit general directory admission after the rejected D3 experiment` | **Keep (slimmed)** | Legit held item with independent trigger (routing defect traced to directory field-placement exception). |
| `Re-evaluate Scout exposure after a routing-contract change` | **Keep (slimmed)** | Triggered by Scout contract changes on `GET /api/quality` or `GET /api/verify`. |
| `Re-expose scout.matchPartners when sls-123 is fixed` | **Keep (slimmed)** | Triggered by live 200 on `sls-123` (`stellarlight#1976`); 4 re-exposure steps preserved. |
| `Recheck sd-059 after upstream action on Mintlify Discovery search` | **Keep (slimmed)** | Triggered by upstream action on `stellar/stellar-docs#2995`; dropped duplicated 2026-11-03 metrics held in `sd-059`. |
| `Fix Docs search misses on canonical pages` | **Protected (unchanged)** | Left byte-identical per orchestrator instruction (`#523` filed `sd-114`; orchestrator updates TODO). |
| `Clarify the model-facing codemode.describe response shape` | **Keep (slimmed)** | Legit held shape-consistency item. |
| `Triage the runtime and client gaps from the HackMeridian telemetry` | **Keep (slimmed)** | Active triage fed by 2026-11-25 Workers Logs session + item 4.1 Codex/Grok findings. |
| `Explain the soft-empty and skipped-write anomalies from the production read` | **Keep (slimmed)** | Active triage fed by 2026-11-25 Workers Logs session. |
| `Fix the getChangelog ranking trap for release questions` | **Keep (slimmed)** | Held independently of Owner decision 2; removed duplicated item-3.1 paragraph while preserving all triggers and no-exception ban. |
| `Watch sign-in rejects after the oauth-provider 1.x deploy` | **Keep (slimmed)** | Priority 2 (2026-11-25 Mac session); preserved deploy `9f01ae3e`, rollback `fe3708cb`, 3 event checks, denominator/positive-control rule. |
| `Keep 30 days of observability data, including queries and responses` | **Keep (slimmed)** | Owner decision 5 item (2026-11-18); preserved owner quote, 6 design questions, hard never-capture rule for secrets, `/terms` boundary, done-when. |
| `Method note: same-surface verdict noise, and the judge-tier cap` | **Keep (slimmed)** | Standing note; preserved all 3 rules, enforced checks (`paired-verdict.mjs`, `run-qa.mjs`), remaining sub-100 gaps. |
| `Keep OpenCode out of client diagnostics` | **Keep (slimmed)** | Owner hold (2026-11-17) with clear reopen trigger and OAuth probe rule. |
| `Build a subscription second judge on OpenCode when a decision needs one` | **Keep (slimmed)** | Triggered by vendor-diversity need; preserved 3-CLI tool-blindness table and 4 calibration steps. |
| `Close the remaining claim-support gaps of judge pack p9` | **Keep (slimmed + absorbed cited-text check)** | Preserved all `p9` limits + pre-flight trigger before another model-selection round + absorbed `fp-2026-11-12` cited-text check. |
| `Decide whether a sourced summary error matches must-avoid "unsupported memory"` | **Keep (slimmed)** | Legit held rubric `v2.11` item. |
| `Reconcile the QA answering prompt with out-of-scope goldens` | **Keep (slimmed)** | Legit held item (2026-10-01 adjudication, owner veto open). |
| `Monitor Raven capability-boundary offers` | **Keep (slimmed)** | Owner-mandated monitor. |
| `Monitor Friendbot network-context synthesis` | **Keep (slimmed)** | Standing monitor. |
| `Move the compiled case files into eval/qa/compiled/` | **Keep (slimmed)** | Priority 4 (triggered after dated runs merge and agentpc timers clear). |
| `Tag confirmation-only rows in the agent discovery runner and the agentic workflow` | **Keep (slimmed)** | Legit held item with verified file list. |
| `Run the judge self-test on the resolved judge model` | **Keep (slimmed)** | Triggered by first headline judged run / comparable verdicts. |
| `Bump the Playground catalog IDs when the AI Gateway lists a newer model` | **Keep (slimmed)** | Standing trigger (`DEMO_CATALOG_LATEST`, `DEMO_ANTHROPIC_5X_MODEL` guard). |
| `Apply the item 8.2 deferred documentation changes after run 2.2c merges` | **Keep (slimmed)** | Triggered post-2.2c with orchestrator approval; removed brittle `eval/qa/README.md` line count. |
| `Move wrangler, miniflare, and @cloudflare/vitest-plugin together` | **Keep (slimmed)** | Standing toolchain note under frozen `## Dependencies`; fixed exact-pin claim (root `zod` is ranged `^4.6.7`). |
| `Move the demo off the deprecated workers-ai-provider` | **Keep (slimmed)** | Blocked on `cs-010` (`cloudflare/agents#2809`); preserved stream-resume decision, 3 test files, `wai-001` lifecycle rule. |
| `Verify that xAI accepts the explicit tool strict field` | **Keep (slimmed)** | Triggered before next Grok control-model lane (`DEMO_TOOL_STRICT = false` verified). |
| `Confirm npm run mcp-key on wrangler 4.164.0` | **Keep (slimmed)** | Priority 2 (2026-11-25 Mac session); prerequisite for revoking `openai-review-20261007`. |
| `Write ADRs for the per-origin OAuth design and the stellar.org admission` | **Keep (slimmed)** | Owner-set trigger (2026-11-18). |
| `Keep sources.locate deferred` | **Keep (slimmed)** | Owner-deferred (2026-08-28), linked to `ideas/source-delivery-ranked-references.md` §8. |
| `A future retrieve or read tool` | **Deleted** | Pure design-lesson summary already recorded verbatim in ADR-0011 and `research/audits/2026-11-12-first-principles-round.md:156`; no open task, trigger, or done-when. |
| `Consider consolidating the auxiliary Workers` | **Keep (slimmed)** | Owner-asked question (2026-10-25); all 4 design questions preserved. |
| `Read the skill_read shape distribution` | **Keep (slimmed)** | Priority 2 (2026-11-25 Mac session); points to `ideas/skill-discovery-without-bundling.md` without paraphrasing rules. |
| `Measure long-horizon codegen with Raven installed` | **Keep (slimmed)** | Legit held measurement item. |
| `Obtain a written exception for the accepted two-tool endpoint` | **Keep (slimmed)** | Active owner-blocked OpenAI submission under referenced `## OpenAI plugin submission`. |
| `Remove the OpenAI domain verification Worker after approval` | **Keep (slimmed)** | Triggered by OpenAI approval or withdrawal. |
| `## Owner decisions` (1–5 + 3 owner-blocked pointers) | **Keep (slimmed lightly, no decision made)** | Preserved all 5 open decisions, options, safe defaults, and 3 owner-blocked pointers. |

## `ideas/` file-by-file audit

| File | Verdict | Evidence |
|---|---|---|
| `ideas/README.md` | **Keep (exact index)** | All 8 notes indexed with accurate state, inclusive triggers, and exact TODO heading cross-references. |
| `ideas/observability-r2-retention.md` | **Keep (slimmed + accuracy fixes)** | Referenced by `wrangler.jsonc:116` and TODO `"Keep 30 days..."`. Fixed 90-day lifecycle to 30 days to match `/terms` (`src/site.ts:1145-1147`), clarified Owner decision 5 starts the design study (not a build), and retained all triggers including compliance/privacy. |
| `ideas/partner-doc-live-sources.md` | **Keep (slimmed)** | Reviewed 2026-11-19 (hold stands). Cut verbose fact enumerations; preserved 2026-11-19 metrics, operational drift (Alchemy `max-age=0`, OZ `1.8.x`), reopen triggers, `--raven-url` rerun command, and Phase 3 ship bar (`>= 3` net wins, zero unsupported claims). |
| `ideas/playground-chatgpt-subscription-login.md` | **Keep (slimmed)** | Viable held research note with 4 reopen triggers and 4 concrete production blockers; preserved single-refresh-winner / no-replay and consent-copy review ship gates. |
| `ideas/retrieval-demand-report.md` | **Keep (slimmed + accuracy fixes)** | Viable held note distinct from raw-log R2 archive and monthly usage report. Fixed `demo-chat-start` logged fields (`src/demo/output.ts:115-121`) and MCP caller-text phrasing; preserved scheduled and post-7-day triggers. |
| `ideas/shareable-durable-playground-sessions.md` | **Keep (slimmed)** | Viable deferred D1 fork-on-send design; cut verbose UX walkthroughs and effort prose (460 → 158 lines) while preserving D1 schema, bounded trace array, access matrix, validated login return, abort-on-disconnect, headers, and 4 deferred choices. |
| `ideas/skill-discovery-without-bundling.md` | **Keep (slimmed + accuracy fixes)** | Active measuring note referenced by `src/observability.ts`, `src/executor/providers.ts`, `test/executor-providers.test.ts`, and Priority 2 TODO. Fixed missing `--out <path>` on `--skills-form A` (`scripts/build-catalog.mjs:1322`) and fixed stale `ok: false` / `error` fields to `outcome: "ok" | "error" | "soft-empty"` (`src/observability.ts:108-117`, `cloudflare-observability-review` skill). |
| `ideas/source-delivery-ranked-references.md` | **Keep (slimmed + accuracy fix)** | Owner-deferred (2026-08-28), referenced by TODO `"Keep sources.locate deferred"` for §8. Cut review narration (496 → 238 lines), kept §8 numbering and full reopen/descriptor/scoring contracts, fixed `sd-044` status from active to resolved (`improvements/resolved.json`). |
| `ideas/user-controlled-personalization.md` | **Keep (slimmed + header fix)** | Viable deferred note; added explicit status and reopen-trigger line per `ideas/README.md`. |

## Gates (post-reconciliation, all run bare)

| Gate | Exit code | Result |
|---|---:|---|
| Frozen anchors, relative links/anchors, cross-refs, Worker-byte diff | 0 | All 6 frozen/protected blocks byte-identical to `origin/main`; 146/146 relative links & anchors valid; 0 Worker bytes changed on both branches |
| `npm run typecheck` | 0 | Clean |
| `npm run build` | 0 | Clean (`wrangler deploy --dry-run --outdir dist`) |
| `npm run secrets:scan -- --tree` | 0 | Clean |
| `npm test` | 0 | 174 test files passed, 5 skipped (179); 4,165 tests passed, 3 expected fail, 5 skipped (4,173) |

## Independent review and challenge

- **Review:** [SOL-REVIEW.md](SOL-REVIEW.md) — Codex CLI (`0.169.0`), resolved model `gpt-6.2-sol`, effort `high`, sandbox `read-only`, reviewing `0e618d4b` (PR #531) and `dfb1b75f` (PR #532). Reported 19 findings (H1–H2, M1–M11, L1–L6).
- **Challenge:** [CHALLENGE.md](CHALLENGE.md) — every finding independently verified against `origin/main`, `src/observability.ts`, `src/demo/output.ts`, `src/demo/chat.ts`, `package.json`, `package-lock.json`, `eval/partner-docs/README.md`, `research/partner-doc-source-onboarding.md`, `.agents/skills/cloudflare-observability-review/SKILL.md`, and `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`.
- **Verdict counts by class:**
  - **Valid (fixed):** 17 (`H1`, `H2`, `M1`–`M11`, `L1`, `L2`, `L5`, `L6` — fixed in `cc4a04be` on PR #531 and `3d0148cc` on PR #532)
  - **Valid but not worth fixing unilaterally:** 1 (`L4` — pre-registered threshold overlap in `ideas/skill-discovery-without-bundling.md:38`, escalated below)
  - **Invalid (out of scope / forbidden):** 1 (`L3` — orchestrator explicitly ordered the two Priority 4 items left unchanged)

## Model calls made

| CLI | Resolved model ID | Purpose |
|---|---|---|
| Antigravity | Gemini 4 Neon (High) | Lane `todoslim` audit, slimming, Sol challenge, reconciliation, and reporting |
| Codex CLI (`0.169.0`, subscription) | `gpt-6.2-sol` (`high` effort, `read-only`) | Independent review of PR #531 (`np/8.13-todoslim`) and PR #532 (`np/8.13-todoslim-ideas`) (`SOL-REVIEW.md`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Questions for the owner

1. **Pre-registered 90%/10% boundary overlap in `ideas/skill-discovery-without-bundling.md:38-41` (Sol finding L4):**
   - **Exact text:** `>= 90% whole (sections + files + mixed < 10%): delete section entries...` vs. `10%–25%: inconclusive; keep and re-read with more data.`
   - **Issue:** At exactly 90% `whole` and 10% `sections + files + mixed`, `>= 90%` and `< 10%` contradict each other and overlap `10%–25%`. Left unchanged because Priority 2 ("Read the `skill_read` shape distribution") requires applying the pre-registered rules as written.
   - **Recommendation:** Clarify the delete threshold to **`> 90%` `whole` (`< 10%` `sections + files + mixed`)** before the 2026-11-25 Workers Logs read so `10%–25%` is cleanly inconclusive.
2. **Orchestrator follow-up (no owner decision needed):** Both protected Priority 4 items were left byte-identical per orchestrator instruction; `#521` already filed `sk-040` (closing `"Probe the malformed-input gap in the pinned smart-contracts skill"`) and `#523` filed `sd-114` (narrowing `"Fix Docs search misses on canonical pages"` to the remaining Raven routing misses).
