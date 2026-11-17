# Review: item 3.1 plan and `tmp/3.1/workers-logs.mjs`

Reviewer: Claude Fable 5.2 (tier: Claude Fable, plan review), high effort, 2026-11-17. Read-only.
No production system was queried. The script's request shapes were checked against the public
Cloudflare OpenAPI spec (documentation only). Nothing below was run, so every "would fail" is a
reading of the spec and the emitters, not an observed failure.

Check 1, summary: every event, field and value the plan names exists as emitted. `source: "tool"`
(`src/mcp/tools.ts:297`) and `"codemode"` (`src/executor/providers.ts:1047`); `requestedLimit`,
`effectiveLimit`, `top` (`src/observability-search.ts:56-66`, not `src/catalog/search.ts`);
`responseChars` (`tools.ts:305`); `op` `id`/`outcome`/`ms`/`caveat` (`providers.ts:573-613`);
`reason` `info-cap` and `read-cap` (`providers.ts:1167`, `:1235`); `artifactReadCount`,
`resultTruncated` (`tools.ts:444-448`); `accessMode` (`src/server.ts:245`). The problems are in
how they are queried and what the rules conclude.

## Blocking (fix before the one run)

1. **The token permission the plan asks for will 403 again.** The spec lists only "Workers
   Observability Write" for `telemetry/query`, `keys` and `values`; QUESTION.md's own probe names
   `workers-observability.write`. PLAN.md:143 and QUESTION.md:16 ask for "Workers Observability:
   Read". Change: ask for Write, short expiry, and say so. The script header's "Read-only" is true
   of its intent, not of the permission.

2. **Key discovery sends the wrong body.** `keysFor` (script:148-151) posts
   `timeframe: {from, to}`. The `keys` schema has top-level `from` and `to` and no `timeframe`.
   Either the call is rejected (the script exits, safely) or the window silently defaults, and a
   short default window can miss keys. `topKey`, `uaOnAppRows` and `platformRequestId`
   (script:172-174) are decided from that result, so `search-top` and the whole per-client read can
   be skipped without an error. Change: send `from: start, to: end`.

3. **No key or type is verified before 1,000 queries depend on it.** Types are hardcoded
   (script:86-92) and keys are discovered only for `search`, `execute`, `mcp_request` and platform
   rows, not `op`, `artifact_read`, `artifact_write` or `skill_read`. A wrong type or key returns
   zero rows, which reads as "never happens". Two specific risks:
   - `source = "tool"` underlies every cap 1 query (script:204). The skill warns that the raw
     event nests app JSON under `source.*` (SKILL.md:108-109); an app field itself named `source`
     may not resolve as key `source`. Unverified either way.
   - Grouping by a nullable field may drop the null rows: `resultTruncated` is null on a failed
     `execute` (`tools.ts:444`, script:213), `reason` is null on an artifact hit
     (`observability.ts:78`, script:219), `skipped` on a good write (script:220), `effectiveLimit`
     on a refusal (script:205).

   Change: (a) a preflight that checks every key used against `keys` for its event family, takes
   the type from discovery, and stops before the slice loop on a miss; (b) add `search` grouped by
   `[source, requestedLimit]` with no `source` filter, as the fallback; (c) for each nullable
   group, add a sibling grouped only by non-null fields (`execute` by `ok`; `artifact_read` by
   `kind`; `artifact_write` by `ok`); (d) stop if the whole-window `evt` counts show no `search`,
   `execute` or `op`.

4. **The API-key and surface splits cannot be made from this output.** `accessMode` is only on
   `mcp_request`; child events join by `$metadata.requestId` (SKILL.md:41-42). The script collects
   the join only in the branch where the user-agent is absent from app rows (script:232-239), and
   never for `op`, `skill_read` or `artifact_read`. If the user-agent is on app rows, PLAN.md:71-72
   ("exclude them by join") is not executable. Separately, the Playground uses the same runner
   (`src/demo/tools.ts:79`), so `op`, `skill_read`, `artifact_read`, `skill_run` and
   `source = "codemode"` searches mix `/mcp` and `/playground/chat`; the plan does not say so.
   Change: discover keys for `op`; if `$workers.event.request.path` is on app rows, group `op`,
   `skill_read` and `artifact_read` by it. Decide the API-key question before the run from D1,
   which already has it by tool response (finding 9); if D1 says exclude, the join queries must run
   unconditionally and include `op`.

5. **Queries the decisions need that the script does not make.** It cannot be re-run, so add:
   - Cap 4: platform rows for `POST /mcp` grouped by the invocation outcome key and a wall-time
     threshold (names from the platform key discovery). A client that gives up at its own 60 s
     tool timeout cancels the invocation before `logEvent("execute")` (`tools.ts:435`) runs, so
     the losses cap 4 is about are absent from `execute` events. `platform-mcp` (script:193) groups
     only method and status.
   - Item 3.4 and M2 (TODO.md:166-167 names telemetry as the source): `execute` threshold counts
     on `resultOriginalChars` over 16,000, 18,000 and 24,000, and `resultReturnedChars` over
     20,000, by `ok` and by client family.
   - Failed `execute` class: `ok = false` grouped by `operationSummary.total` (`tools.ts:450`).
     Zero operations separates script failures from service failures; no error class is logged.
   - Item 4.1 and the HackMeridian client bullets: platform rows grouped by user-agent, method and
     status (401 and 404 loops need no app row), and `auth_reject` by `reason`.
   - HackMeridian bullets the "next item" ranking names (PLAN.md:110-113): `execute` with
     `ok = true` by presence of `recoveryHint`; `demo-chat` by `finishReason`.
   - Cap 3 headroom: `artifact_read` by `[kind, readCount]` (`readCount` is the ordinal,
     `providers.ts:1168`). `skill_run` by `[id, outcome]`. Tool `search` by `hits` (zero-hit share).
   - Cap 2: thresholds 7,500 and 12,000 on `op` (finding 7), and `op-pct` grouped by
     `[id, outcome]`, not `id` alone (script:182, :198).

## Should-fix

6. **Cap 4's rule measures the wrong share.** "1% run past 50 s" (PLAN.md:107-109) lumps runs a
   55 s limit would not touch (50 to 55 s), runs it would newly kill (successes at 55 to 60 s) and
   runs it would rescue (timeouts, and cancelled invocations). Change: T = `ok = false` over
   59,000 ms plus cancelled `POST /mcp` invocations near 60 s; S = `ok = true` over 55,000 ms.
   Keep 60 s if T is zero; lower to 55 s if T is at least S; otherwise keep and record both.
   Report T split by whether cap 2 would have ended the run first, since a per-call timeout
   removes most hung-call timeouts. `usage_receipts.outcome` (`usage/migrations/0002`) may give
   the cancelled count over 30 days; check it in step 1. Add `clientDisconnected` to the GraphQL
   statuses (PLAN.md:58-60).

7. **Cap 2's rule is underspecified and its input is censored.**
   - "P99" must be of `outcome = "ok"` rows. Validation refusals log `outcome: "error"` at about
     0 ms (`providers.ts:573`) and pull a mixed quantile down.
   - Slices cannot give a 7-day P99; the script rightly uses threshold counts. Restate the rule on
     that grid: timeout = the smallest of 10, 15, 20, 24 s for which at most 1% of ok calls exceed
     half of it. A grid value also keeps a production quantile out of the committed constant.
   - Add a guard: if more than 1% of ok calls exceed the chosen timeout (a legitimately slow
     operation), record it for 3.2 as a question, not a value.
   - State the censoring: a call still pending when the script hits 60 s never logs an `op` event,
     so the hung calls this cap exists for are missing from the tail. Under 100 calls, "P99" is
     the maximum.

8. **W7 is not one regime.** PLAN.md:45-46 says no deploy in W7 changed a cap. Commits in the
   window did: `SEARCH_DEFAULT_LIMIT` went 5 to 7 and the `stellarOrg` source was added
   (`986ffbaa`, 11-15), and the search card was trimmed (`e3d0cd55`, 11-13). `responseChars`, the
   meaning of a null `requestedLimit`, and `stellarOrg` volume all change mid-window. Change:
   record the deploy times, read cap 1's size figures from slices after the last one, and state
   how many days `stellarOrg` covers. Also PLAN.md:41 pins W7 to 11-10..11-17 while the script
   rolls to the run time; adopt the script's window and end W30 at the same instant.

9. **The 5% API-key rule uses the wrong unit.** `mcp_request` counts every protocol message and
   every `oauth-rejected` 401 (`server.ts:241`), so the share says little about tool events.
   Change: decide from D1's API-key share of tool responses for the same days (step 1 already
   reads it), before the script runs.

10. **Small and concentrated samples can decide a cap.** The owner's OAuth traffic is
    inseparable (`usage/README.md:16`). Change: the family veto in cap 1 applies only to a family
    with at least 20 searches and 3 distinct `clientHash`; and step 1 computes, in SQL and without
    exporting hashes, the largest single account's share of W7 tool responses. If one account is
    the majority, caps 1 and "next item" are recorded as "not decided: one account".

11. **User-agent families are allowed; two guards are missing.** Family is software, not identity
    or organization, and the skill lists the header as a grouping key (SKILL.md:96-98); the bans
    are on identity and organization (SKILL.md:22-25, `usage/README.md:23`). Add: fold a family
    with fewer than 3 distinct clients into "other"; a null `clientHash` stays "unattributed" and
    is never split by user-agent (SKILL.md:45-46). Raw user-agent strings stay in the output
    folder. The script computes no distinct-client count; add `uniq` on `clientHash` if the plan
    keeps that figure.

12. **6(b) and the area map promise more than op ids can show.**
    - Dashboard demand has no proxy at all: `stellarOrg` is two generic operations (`search_site`,
      `get_page`) and arguments are not logged. Record "not measurable here", distinct from the
      release proxy's "silent".
    - `scout.searchResearch` volume is driven by the server instructions, which name it for
      history (`tools.ts:187`); `source: "release"` is an argument and invisible. The proxy can
      show an upper bound only. Use search `top` containing `scout.getChangelog` beside it.
    - `stellarDocs.*` is not application development alone, and
      `skills.stellar-dev.smart-contracts` sits in two areas while the map says one (PLAN.md:77-80).
      Report operations under a "shared" area rather than force them; "audit pages on stellarOrg"
      cannot be identified from an op id.
    - 6(b) should cite the committed evidence that can decide it (the 1.3 classification, the
      HackMeridian probes), and say the read added nothing if so.

13. **Output handling.** The script writes to `cwd/workers-logs-out` with default modes
    (script:25-26); run from a checkout on the Mac, that is untracked production data outside
    `/tmp/`. Require an explicit output path, refuse a path inside a git work tree, use 0700 and
    0600. A failed slice is stored as `null` (script:123) and sums silently low: make the
    summariser refuse nulls and add a way to re-run one named query and slice, which the stop rule
    permits. `atGroupLimit` is recorded but ignored by `perSlice` (script:118-126); use the
    adaptive split for user-agent groups.

## Nits

14. `responseChars` is UTF-16 length, not bytes; say "characters" against Grok's 20,000-byte cut.
15. PLAN.md:86 writes `items/3.1/DECISIONS.md` and PLAN.md:150 a `REPORT.md`. Use `REPORT.md`
    only, as other items do; a second `DECISIONS.md` reads like the owner's.
16. The skill asks for Ray IDs in the ledger (SKILL.md:10-11); `usage/README.md` forbids
    committing request identifiers. The plan follows the stricter rule; say that it does.
17. The TODO cap text still says "default 5, max 50" (TODO.md:187); fix it in the step 8 edit.
18. PLAN.md:144 carries an account-id fragment. It is already in `usage/wrangler.jsonc`, so
    harmless; drop it anyway.
19. A non-`dry` query is persisted by the API. Do not switch to `dry: true` untested; note it.

Verdict: do not run the script yet; fix findings 1 to 5 (an hour of edits), adopt 6 to 9 in the
rules, and the single read can then decide caps 1 to 4, with 6(b) honestly "not measurable".
