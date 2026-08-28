# Improvements hygiene sweep — 2026-08-28

## Scope

Block 1 from `.agents/NEXT.md`. In scope: enforce the `upstreamTitle` contract in
`improvements:lint`; live re-check the five stale `reported-upstream` findings (`sd-036`,
`sls-023`, `sls-024`, `sls-029`, `sls-033`); re-check `sd-001` against the settled Algolia index;
dry-run filing for `sls-077` and `sls-078`; retirement review for the seven `fixed-upstream`
findings (`sk-006`, `sk-009`, `sd-008`, `sd-025`, `sls-074`, `sls-075`, `sls-076`). Out of scope
until the owner authorizes: posting upstream issues or comments, deleting finding files, pushing,
merging.

Worktree: `~/.herdr/worktrees/stellar-raven-codemode/lane-improvements-hygiene-20260828`, branch
`lane/improvements-hygiene-20260828`, base `f547656`. The main tree is owned by the concurrent
issue #86 drift round.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Orchestration | Claude Fable 5 (this session) | `w16:p4` | this ledger, `improvements/INDEX.md`, commits | in progress |
| A — lint contract | OpenCode, `@cf/zai-org/glm-5.3-flash` (owner-requested trial of the new model) | `w17:p2` | `scripts/improvements-lint.mjs`, `scripts/improvements-lib.mjs`, `scripts/improvements-file-issue.mjs` (shared constant), `test/improvements-lint.test.ts` | completed |
| B — live re-checks and filing dry-runs | Codex, `gpt-5.6-terra` high (bounded verification) | `w17:p3` | eight finding files named in scope | completed |
| C — retirement review | OpenCode, `@cf/zai-org/glm-5.3-flash` (read-only reviewer, distinct from every author) | `w17:p4` | none (report only) | completed |
| Independent adversarial review | Grok 4.6 high (vendor-diverse; Fable is the orchestrator, so the product lane is excluded) | `w17:p5` | report file only | PASS after two repair rounds |

## Ledger

- `2026-08-28` — `test "${HERDR_ENV:-}" = 1` passed in `w16:p4`.
- `2026-08-28` — `herdr worktree create --branch lane/improvements-hygiene-20260828 --base main`
  returned workspace `w17`, root pane `w17:p1`. Bootstrap: `.dev.vars` copied, `npm ci`,
  `npm run typegen`, `npm run typecheck` -> `BOOTSTRAP_OK`.
- `2026-08-28` — Lane briefs live in the session scratchpad (`hyg-common.md`, `hyg-lint-brief.md`,
  `hyg-recheck-brief.md`, `hyg-retire-brief.md`). Each lane reports to a Markdown file and
  replies with the path only.
- `2026-08-28T13:17Z` — Lane B reported (7 min). `sd-036`: upstream PR
  `stellar/stellar-protocol#1996` merged (`d186cf3`); live CAP-0075 source now reads
  `field: Symbol`, `BLS12_381`/`BN254`, Protocol 25 -> `fixed-upstream`. `sls-023`, `sls-024`,
  `sls-029`, `sls-033`: closed issues, triggers still reproduce (RWA 61 rows / 1 product /
  0 deployments; 63 wallets with 0 `canonicalSlug`, 30 null availability) -> kept
  `reported-upstream` with dated recurrences. `sd-001`: both Algolia indexes updated
  `2026-08-28T12:04:24Z` (14,759 entries); nine regression queries rank one; the one-URL
  DO-NOT-RETIRE reason no longer holds, the repo-cleanup reason still does. Filing dry-runs for
  `sls-077` and `sls-078` passed. Lane gates: typecheck and secrets pass; `improvements:lint`
  and two `improvements-writes` tests fail only on the stale generated `INDEX.md`, which the
  orchestrator regenerates.
- `2026-08-28` — Lane A reported (12 min, GLM 5.3 flash). `UPSTREAM_TITLE_MIN/MAX` and
  `upstreamTitleError()` live in `scripts/improvements-lib.mjs`; the lint and the filer both read
  them; the lint's local GitHub-ref regex became the shared `GITHUB_EVIDENCE_REF_RE`. New
  `test/improvements-lint.test.ts` (9 tests). Grandfather rule: a record past `proposed` without
  `upstreamTitle` passes only when its evidence cites a GitHub issue/PR URL. On the real tree the
  rule flags zero findings (28 titled, 46-119 chars; 43 untitled, all grandfathered). Lane gates:
  lint ok (71), typecheck clean, `npm test` 1,374 passed, secrets clean.
- `2026-08-28T13:26Z` — Lane C reported (15 min, GLM 5.3 flash, read-only). Verdict RETIRE for
  all seven: `sk-006`, `sk-009`, `sd-008`, `sd-025`, `sls-074`, `sls-075`, `sls-076`. Each has a
  dated live re-run, the upstream ref state, a dangling-reference scan, and a draft resolution
  comment. Sequencing notes: `sls-074` after its two golden-file refreshes; `sk-006` and `sd-008`
  need `truth.verified.rootCause` repointed in their QA cases through `golden-truth`;
  `Stellar-Light/stellarlight#1031` is still open and needs the verification comment before the
  maintainer closes it. No deletion or upstream post was made.
- `2026-08-28T13:26Z` — Orchestrator ran `npm run improvements:index` (71 findings), then
  `npm run improvements:lint` (ok, 71), `npm run typecheck` (clean), `npm test` (90 files,
  1,374 passed), `npm run secrets:scan -- --tree` (clean, +gitleaks).
- `2026-08-28` — Grok 4.6 high started in `w17:p5` as the independent adversarial reviewer with
  the brief `hyg-review-brief.md`.
- `2026-08-28T13:26Z` — Exact gate commands and observed output in the worktree, run by the
  orchestrator after `npm run improvements:index` (`wrote improvements/INDEX.md (71 findings)`):
  - `npm run improvements:lint` -> `improvements lint ok (71 findings)`
  - `npm run typecheck` -> `tsc --noEmit`, no output, exit 0
  - `npm test` -> `Test Files  90 passed (90)`, `Tests  1374 passed (1374)`
  - `npm run secrets:scan -- --tree` -> `no leaks found`, `secret-scan: clean (+ gitleaks) — scanned all tracked files.`
- `2026-08-28T13:37Z` — Grok 4.6 high review returned CHANGES-REQUESTED
  (`hyg-review-report.md`). Status decisions and RETIRE verdicts confirmed by independent live
  GETs at `2026-08-28T13:31Z`. Three findings: (1) medium, `sls-078` first paragraph names
  "Raven's measured lexical router" and evidence would publish eval paths; (2) medium, `sd-001`
  recurrence claims all four collateral controls rank first on both indexes, but the replica
  ranks the deployer page first for `stellar cli install command`; (3) low, `sd-036` Finding
  text still reads as open. Nits on `sls-077` (version pin 1.8.109, defect in paragraph 2,
  Raven-unexposed evidence line). Ledger form findings: summarized gate output, stale lanes
  table. All routed to Lane B (`hyg-recheck-repairs.md`) and to this ledger.
- `2026-08-28T13:45Z` — Lane B applied findings 1-3 and the `sls-077` nits with dated live
  rechecks at `2026-08-28T13:38:25Z` (verify and OpenAPI 1.9.1) and `13:38:58Z` (Algolia primary
  and replica). Both filing dry-runs exit 0.
- `2026-08-28T13:52Z` — Grok re-verification: findings 1-3 and the nits applied; one new low
  finding: the `sls-078` first paragraph listed `confidence` and `source`, which are not in the
  live `x-routing.keywords` array. Orchestrator replaced the list with live tokens
  (`trust`, `confidence in the data`, `coverage`, `provenance`, `health`, `limitations`).
- `2026-08-28T13:55Z` — Final gates after `npm run improvements:index`
  (`wrote improvements/INDEX.md (71 findings)`): `npm run improvements:lint` ->
  `improvements lint ok (71 findings)`; `npm run typecheck` -> exit 0; `npm test` ->
  `Test Files  90 passed (90)`, `Tests  1374 passed (1374)` (run before the one-line `sls-078`
  edit; the two improvements suites re-ran after it: `Tests  23 passed (23)`);
  `npm run secrets:scan -- --tree` -> `secret-scan: clean (+ gitleaks)`; `git diff --check` clean.
- `2026-08-28T13:55Z` — PR #87 opened. Copilot flagged unguarded `.some()` on a non-array
  `evidence`; fixed with one test (`Tests  34 passed (34)` across the three improvements suites).
- `2026-08-28T14:05Z` — `main` moved under the lane (issue #86 drift round: `d08212f`,
  `0133653`, `c9b99f7`). `git rebase origin/main` conflicted only on `improvements/INDEX.md`,
  `sls-077`, and `sls-078` frontmatter. Resolution: keep the reviewed evidence lists, keep the
  drift round's `recurrences` blocks, regenerate `INDEX.md`. Gates on the rebased tree:
  `improvements lint ok (71 findings)`; `tsc --noEmit` exit 0; `Test Files  90 passed (90)`,
  `Tests  1375 passed (1375)`; `npm run build` `Total Upload: 7036.53 KiB`; secrets clean;
  `git diff --check` clean; both filing dry-runs exit 0. Force-pushed with lease.
- `2026-08-28T14:20Z` — Owner authorized merge, filing, and retirement. PR #87 squash-merged as
  `5e23340`. `npm run improvements:file` posted `sls-077` as
  https://github.com/Stellar-Light/stellarlight/issues/1086 and `sls-078` as
  https://github.com/Stellar-Light/stellarlight/issues/1087; both moved to `reported-upstream`.
- `2026-08-28` — Lane D (Codex `gpt-5.6-sol` high, pane `w17:p6`, brief `hyg-resolve-brief.md`)
  started for the golden refresh, seven resolution comments, and `improvements:resolve`.
- `2026-08-28T16:27Z` — Lane D posted and read back all seven authorized resolution comments:
  [`sk-006`](https://github.com/stellar/stellar-dev-skill/issues/53#issuecomment-5455029603),
  [`sk-009`](https://github.com/Stellar-Light/stellar-scout/issues/11#issuecomment-5455029882),
  [`sd-008`](https://github.com/stellar/stellar-docs/issues/2574#issuecomment-5455030136),
  [`sd-025`](https://github.com/stellar/stellar-docs/issues/2699#issuecomment-5455030350),
  [`sls-074`](https://github.com/Stellar-Light/stellarlight/issues/1031#issuecomment-5455030587),
  [`sls-075`](https://github.com/Stellar-Light/stellarlight/issues/1030#issuecomment-5455030797),
  and [`sls-076`](https://github.com/Stellar-Light/stellarlight/issues/1055#issuecomment-5455031036).
  Every comment links the HTTP-200 snapshot at commit `5e23340`. Issue 1031 remained open at review.
- `2026-08-28T16:28Z` — Lane D ran every resolver first with `--dry-run`, then live with the
  reviewed evidence and resolving refs. The resolver retired all seven files, removed three intake
  overrides, appended seven `improvements/resolved.json` receipts, and regenerated `INDEX.md`.

## Outcome

- Lane A: landed. `improvements:lint` enforces the 20-120 character `upstreamTitle` cap and
  requires the field past `proposed` unless a GitHub ref grandfathers the record. Shared constants
  in `scripts/improvements-lib.mjs`; nine tests in `test/improvements-lint.test.ts`. Remaining
  risk: a never-filed `fixed-upstream` record with no GitHub ref would need a ceremonial title;
  none exists today.
- Lane B: landed. `sd-036` -> `fixed-upstream` (PR `stellar/stellar-protocol#1996`, live source
  recheck). `sls-023`, `sls-024`, `sls-029`, `sls-033` stay `reported-upstream` with dated
  recurrences against API 1.9.1. `sd-001` stays `fixed-upstream`; the one-URL reason is gone,
  repo cleanup and the `what is in Protocol 23` / `Protocol 27` / `Poseidon Rust SDK` residuals
  remain. `sls-077` and `sls-078` are filing-ready (dry-run exit 0, owner-facing text reviewed).
- Lane C: RETIRE recommended for `sk-006`, `sk-009`, `sd-008`, `sd-025`, `sls-074`, `sls-075`,
  `sls-076`; three of the seven re-run independently by Grok. Sequencing: refresh the two
  `sls-074` goldens first, repoint `rootCause` for `sk-006` and `sd-008` through `golden-truth`,
  post the seven resolution comments, then `npm run improvements:resolve`.
- Independent review: Grok 4.6 high. First pass CHANGES-REQUESTED (three findings, applied);
  re-verification CHANGES-REQUESTED (`sls-078` keyword list, applied, then filed as #1087);
  Lane D review CHANGES-REQUESTED (receipt comment URLs, queue text, this line), all applied
  by the orchestrator before the retirement PR.
- Owner-authorized outward actions completed. Issues `sls-077` and `sls-078` were filed, and the
  seven reviewed findings were commented and retired.
