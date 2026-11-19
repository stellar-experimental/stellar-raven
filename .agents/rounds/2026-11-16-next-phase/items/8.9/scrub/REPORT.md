# Report: item 8.9 lane `scrub`

- **Date:** 2026-11-19
- **Branch:** `np/8.9-scrub`
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/504
- **TODO item closed:** "Narrow the skill scrub so an excluded operation keeps the skill's workflow" (`.agents/TODO.md`, not edited by this lane)
- **Worker bytes change:** **Yes** (model-facing). `git diff origin/main --stat -- src/ package.json package-lock.json wrangler.jsonc` reports `src/skills/scrub.ts | 544 +++++++++++++++++++++--` (`531 insertions(+), 13 deletions(-)`). No generated files changed (`catalog/manifest.json`, `specs/super-spec.json`, `src/mcp/family-text.ts`, `src/policy/corroboration.ts` are byte-identical to `origin/main` after re-running their generators).

## What changed

- **`src/skills/scrub.ts`**:
  - Added a narrower scrub unit — a trailing top-level `or` alternative clause (`stripExcludedAlternativeClause`) — for plain paragraphs and list items in `scrubExcludedScoutOperationRefs`.
  - When a sentence names an excluded Scout endpoint only inside one or more trailing top-level `or` alternative clauses (outside code spans, quotes, parentheses, and brackets), and the remaining prefix is a balanced, self-contained sentence without dangling words, unpaired correlatives (`either/or`, `whether/or`, `neither/nor`, `between/and`, `not only/but`, `one of`, `both`), uncompleted subordinators, gerund subjects, or 3-item serial endpoint splices, and the excluded tail contains no clause break, finite verb/condition, or other `/api/` path, only the excluded alternative clause is removed.
  - List items (`narrowListItem`) preserve the item (line-wise when every line ends a sentence, or re-flowed when wrapped) only when every excluded-path sentence in the item narrows cleanly; otherwise the whole list item drops, including any clean indented child fences and continuation lines so they cannot orphan onto the preceding item.
  - Any excluded path inside a code fence (including indented fences under a kept or dropped list item) or indented code block still fails closed via the unchanged end-of-scrub `containsExcludedScoutPath` check.
  - Bounded narrowing scans (`MAX_NARROW_SENTENCE_CHARS = 2000`, `MAX_NARROW_OR_SPLITS = 16`) so pathological inputs fall back to whole-sentence removal in linear time.
- **`test/skill-scrub.test.ts`**:
  - Added unit tests for trailing `or` alternative narrowing in numbered/wrapped/line-wise list items, paragraphs, wrapped paragraphs, templated paths, and percent-encoded paths.
  - Added negative tests pinning whole-sentence / whole-item fallback for unpaired correlatives, mid-clause subordinators, shared conditions (`when`/`if`), subject-position predicates, serial lists, single/curly quotes, non-lead-in tails, oversized sentences, blockquote/table list continuations, dropped bullets with clean child fences, and fail-closed on dirty indented fences.
  - Pinned the scrubbed `stellar-light/stellar-scout` files (`SKILL.md` step 4 with stablecoin peg guidance, `/api/partners` filters, and `"none listed at our source"`; `references/api-reference.md` `GET /api/partners/{slug}` usage sentence; `POST /api/partners/match` section removed; `assertNoNonExposedRefsInText` and `EXCLUDED_SCOUT_PATHS` clean).

## Served-text verification (`codemode.skill.read` on `http://localhost:8792`)

Read all four files of `skills.stellar-light.stellar-scout` through the local Worker (`npm run dev -- --port 8792`, stopped after verification) via `execute` calling `codemode.skill.read`:

- `SKILL.md`: 35,023 chars (was 34,660 on `origin/main`, `+363` chars) — passes `assertNoNonExposedRefsInText` and `EXCLUDED_SCOUT_PATHS`.
- `file:README.md`: 6,899 chars (`+0`, byte-identical to `origin/main`) — passes both checks.
- `file:references/api-reference.md`: 65,534 chars (was 65,422 on `origin/main`, `+112` chars) — passes both checks.
- `file:references/examples.md`: 14,118 chars (`+0`, byte-identical to `origin/main`) — passes both checks.

Exact served-text diff vs `origin/main`:

```diff
--- origin/main: skills.stellar-light.stellar-scout (SKILL.md)
+++ np/8.9-scrub: skills.stellar-light.stellar-scout (SKILL.md)
@@ -159,6 +159,7 @@
 1. **Vet the idea first.** `/api/vet-idea?q={one-line idea, 3-200 chars}` → `report.competitors` (repos + live directory projects in the detected vertical), `maturity` (verified evidence only: audits + on-chain usage), `priorArt` (hackathon builds; dead prior art is a signal, not a stop sign), `gap`, `funding`. Read `gap` as **supply-side coverage, not demand**: a gap means few things exist, never that anyone wants one. If `vertical` didn't resolve to a Stellar vertical, the idea probably isn't a Stellar idea; say that plainly.
 2. **Pick a starting point, then check it before forking.** `/api/repos/search?q={stack or capability}` for candidates (passkey, x402, sep24-ramp, wallet-kit…), then `/api/repos/trust?repo={owner/name}` for the one you'd fork → `report.codeTruth` (proof, depth, the FULL `contractInterface`; generate calls against *this*, not the README), `usage`, `audits` + `auditDrift`, `succession`, `signals`. `signals` is a closed vocabulary of facts that hold; it is not a safety score and must not be presented as one. A repo absent from the index is "not indexed", not "untrustworthy".
 3. **What's actually live to build against.** `/api/contracts?domain={anchor-ramp|defi-amm|defi-lending|defi-yield|indexer|oracle|payments-x402|wallet-infra}` → verified mainnet contracts with `codeInUse`, `interfacePreview`, per-project `audits`. The registry is evidence-gated and small on purpose; an empty result means *no verified evidence on record*, never *nothing exists on mainnet*; say "no verified contract on record".
+4. **Rails and partners the demo needs.** `/api/stablecoins?peg={USD|EUR|BRL…}` (compare `marketCapUSD`, never raw `supply` across pegs) and `/api/partners?type={anchor|on-off-ramp|audit-firm}&q={country}`. Empty partner results in a region are common and must be reported as "none listed at our source", pointing at the anchor directory, never by inventing one.
 5. **Money after the weekend.** `/api/rfps?status=open&q={keywords}` for a matching brief, then `/api/scf-pitch?q={idea}` → live `round` state (never asserts closed on fetch failure; `source: 'unavailable'` means verify yourself), `fundedPeers` with recorded award totals, deterministic `angles`. Only if the team wants to keep going; don't push funding on a weekend project.
```

```diff
--- origin/main: skills.stellar-light.stellar-scout (file:references/api-reference.md)
+++ np/8.9-scrub: skills.stellar-light.stellar-scout (file:references/api-reference.md)
@@ -280,7 +280,7 @@
 ## `GET /api/partners/{slug}`
-One partner's **full published profile** by slug: services, sectors, regions, docs, contact, `verified` signals, and `freshness`. 404 for unknown or unpublished slugs.
+One partner's **full published profile** by slug: services, sectors, regions, docs, contact, `verified` signals, and `freshness`. 404 for unknown or unpublished slugs. **Use when** you already hold a slug from `/api/partners`; for *finding* a partner use `/api/partners` filters.
```

Across all 65 exposed pinned skill files in `ecosystem-skills/MANIFEST.json`, only those two files change.

## Gates (all run bare on final code)

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 177 passed \| 5 skipped (182 files); 4298 passed \| 3 expected fail \| 5 skipped (4306 tests) |
| `npx vitest run test/skill-scrub.test.ts` | 0 | 1 passed (1 file); 16 passed (16 tests) |
| `npm run test:smoke` | 0 | 10 passed (10 files); 173 passed (173 tests) |
| `npm run build` | 0 | Clean (`wrangler deploy --dry-run --outdir dist`; 6934.20 KiB / gzip 1378.58 KiB) |
| `npm run secrets:scan -- --tree` | 0 | Clean — scanned all tracked files |
| `node scripts/build-catalog.mjs`, `npm run family-text:build`, `npm run spec:build` | 0 | Zero diffs against committed generated artifacts |
| `npm run eval:routing -- --gate` (before) | 0 | GATE PASS — legacy 64.8% / 86.7% / 96.4% (card@5 62.1%), extended 76.2% / 91.8% / 95.9% (card@5 57.1%), skills 73.9% / 100.0% / 100.0% (card@5 100.0%), holdout 24.5% / 53.1% / 61.2%, forbidden captures 11/49 |
| `npm run eval:routing -- --gate` (after) | 0 | GATE PASS — aggregate numbers identical to before across every lane |

## Independent review and reconciliation

- **Reviewer:** Claude Opus 5.5 (`agy --model claude-opus-5-5 --effort high`, `agy` 1.5.12), independent of author (Gemini 4 Neon) and orchestrator.
- **Review file:** `.agents/rounds/2026-11-16-next-phase/items/8.9/scrub/REVIEW.md`
- **Verdict:** Approve, with two medium follow-ups (no critical or high findings).

Reconciliation of every finding:

- **M1 (medium, latent) — Accepted and fixed.** Dropped `when|if` from `ALT_MODIFIER_RE`; added top-level clause/finite-verb rejection on `after` (`TAIL_CLAUSE_WORD_RE`); widened prefix subordinator check from clause-start to anywhere in the active clause without a following comma (`SUBORDINATOR_WORD_RE`); rejected gerund-headed active clauses without a comma and bare code-span prefixes when `,` is absent and `after` is non-empty. Pinned all 6 counterexamples in `test/skill-scrub.test.ts`.
- **M2 (medium, latent; regression vs `main`) — Accepted and fixed.** When a list item is dropped, indented child fences and trailing continuations belonging to that item are now dropped together if every child fence is free of excluded paths; if any child fence contains an excluded path, it stays in the stream so the end-of-scrub check still fails closed. Pinned both cases in `test/skill-scrub.test.ts`.
- **L1 (low) — Accepted and fixed.** Added `MAX_NARROW_SENTENCE_CHARS = 2000` and `MAX_NARROW_OR_SPLITS = 16` fallback caps in `stripExcludedAlternativeClause`, pinned with an oversized sentence test.
- **L2 (low) — Accepted and fixed.** Tracked curly double quotes `“`/`”` in `scanTopLevel`, `isSingleParenthetical`, and `topLevelOrSplits`; added `hasUnclosedSingleQuote` and trailing `['’]` rejection plus `'’"”` bare-path delimiters in `ENDPOINT_REF_RE`. Pinned both single- and curly-quote counterexamples.
- **L3 (low) — Accepted and fixed.** Added `not only/but`, `one of/(and|or)`, and `both` (clause-initial or directly preceding an endpoint without `and`) checks, plus serial comma endpoint-list rejection when `, or` follows two comma-separated endpoint refs. Pinned all four counterexamples.
- **L4 (low) — Accepted and fixed.** Added tests for `neither`/`between`, `>` and `|` list continuations, non-lead-in tails, percent-encoded and templated narrowed tails, the line-wise multi-line list-item branch, and a wrapped narrowed paragraph.
- **N1, N2, N3 (nits) — Accepted and fixed.** Commented the `mentionedPaths` check in `test/skill-scrub.test.ts` (covers `SCOUT_PATHS_ABSENT_FROM_SPEC`), noted wrapped-item re-flow in `narrowListItem`'s docstring, and added `HEAD|OPTIONS` to `ENDPOINT_REF_RE`.
- **N4 (nit) — Noted (no change needed).** Conservative rejection of single-letter `a` as a dangling end word is intentional.
- **P1, P2, P3 (pre-existing, outside this diff) — Declined as out of scope.** Case-sensitivity alignment between `excludedPathPattern` and `emitted-text-guard.mjs`, `/api/repos` in `emitted-text-guard.mjs`, and cross-delimiter fence toggling (`~~~` inside ```` ``` ````) pre-date this change and touch files/behavior outside this lane's scope.

## Model calls made

| CLI | Model ID | Effort | Purpose |
|---|---|---|---|
| `agy` (1.5.12, subscription) | `claude-opus-5-5` | `high` | Independent code review of `git diff origin/main...HEAD` -> `REVIEW.md` (`status: SUCCESS`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open questions / handoff notes

- **Model-facing deploy note:** This change restores dropped prose in served `skills.stellar-light.stellar-scout` (`SKILL.md` step 4 and `references/api-reference.md` `GET /api/partners/{slug}`) while keeping `catalog/manifest.json` and routing identical. Per `AGENTS.md` / `REVIEW.md`, the orchestrator decides whether the free routing gate + served-text verification suffices (as planned for item 8.9 free fixes) or if any answer-quality check is desired before deploying.
- **Pre-existing scrub/guard notes (from `REVIEW.md` P1–P3):** Worth tracking if `scrub.ts` or `emitted-text-guard.mjs` is revisited: (P1) `excludedPathPattern` is case-sensitive while `emitted-text-guard.mjs` lowercases; (P2) `emitted-text-guard.mjs` omits `SCOUT_PATHS_ABSENT_FROM_SPEC` (`/api/repos`); (P3) the outer `inFence` toggle in `scrub.ts` does not match fence delimiter kind/length (`~~~` inside ```` ``` ````).
