# Full-project audit — 2026-07-03

> Historical audit snapshot. Several policy details below predate ADR-0003's build-time exposure
> filtering and later runnable-skill work; use `CLAUDE.md`, `PLAN.md`, `ARCHITECTURE.md`, and
> `research/decisions/0003-build-time-exposure-filtering.md` for current invariants.

Durable record of the full-repo audit run 2026-07-02/03 (Solo project 49). Four parallel
audit lanes: **src/** (runtime code + security invariants), **tests/scripts/CI**
(determinism + gate mechanics), **docs** (truth vs tree), and **artifacts/cruft**
(generated files, dead paths, gitignore hygiene). Every claim below was re-verified against
the working tree while writing this record.

## Headline verdict

- **No high-severity findings.** Nothing exploitable, no secret exposure path, no policy
  bypass found in any lane.
- **8 security invariants verified** (list below) — each one held in code, and most now
  have a test pinning it.
- **Tree is cruft-free.** No orphaned modules, no dead scripts; the two "suspicious"
  directories are deliberate (see "Deliberately not fixed").
- **Generated artifacts rebuild byte-identical.** Verified again while writing this record:
  consecutive runs of `build-catalog.mjs`, `spec:build`, and `skills:bundle` produce
  identical md5s for `catalog/manifest.json`, `specs/super-spec.json`, and
  `src/skills/bundle.json`; `test/catalog.test.ts` now also asserts the *checked-in*
  manifest matches a fresh rebuild.

## The 8 security invariants (verified in-tree)

1. **Sandbox has no network** — `globalOutbound: null` pinned explicitly on both
   executors (`src/executor/run.ts`); model `fetch()` throws.
2. **Secrets never reach the sandbox or the model** — adapters hold keys host-side
   (`src/adapters/*`); every Worker secret (`SECRET_ENV_NAMES`, `src/policy/redact.ts`) is
   scrubbed from serialized results at the provider boundary, the final result/error
   boundary, and per-log-line.
3. **Deny-list is data and enforced at every surface** — `searchCatalog` filters
   `policy.allow === false` before scoring; `guard` refuses execution;
   `codemode.describe` refuses; `readSkill` refuses skills/sections and (new today)
   excises denied sections from whole reads; `codemode.catalog()` is see-but-not-call.
4. **Exact-match id resolution end to end** — Proxy dispatch fails loudly on wrong names;
   `describe`/`skill.read` are exact-id; the single alias (`lumenloop.skill.X` →
   `skills.*.X`) is exact terminal-name equality, refused when ambiguous
   (`src/skills/store.ts`).
5. **Model code never owns endpoints/args/auth** — `validateArgs` against the manifest
   `inputSchema` before any adapter call (`src/policy/guard.ts`); transport/provenance
   stripped from the sandbox catalog view (`catalogEntryView`, `src/executor/providers.ts`).
6. **Paid calls refused** — `cost: "metered"` gate in `guard`; `lumenloop.request_research`
   additionally deny-listed in the manifest.
7. **All three model-facing channels budgeted** — result, logs, and error text each capped
   at ~6k tokens (`src/policy/truncate.ts`, `src/mcp/tools.ts`); advice flags may change
   footer wording only, never the budget or the cut (`TruncateAdvice` invariant).
8. **/mcp is auth-gated with no soft path** — OAuth (workers-oauth-provider + WorkOS),
   admin token as SHA-256 + timing-safe compare (off when unset), and a dev bypass that is
   (new today) loopback-hostname-only, so a mistakenly deployed var is inert
   (`src/auth/gate.ts`, `src/server.ts`).

## Findings fixed in the follow-up wave (all landed 2026-07-03, verified in tree)

### src hardening

- **Skill-section deny enforcement on whole reads** — whole-skill reads previously
  returned deny-listed sections' bodies; `assembleWholeBody` (`src/skills/store.ts`) now
  excises them, keeping the heading plus a `[section omitted: <denyReason>]` marker.
  Pinned by a new test in `test/skills.test.ts`.
- **Fail-closed un-cataloged sections** — a `##` section present in a skill body but
  missing from the catalog (build/read sectioning drift) is now refused on section reads
  and unadvertised, instead of default-allowed. A new builder-invariant test
  (`sectionSlugsOf` export + `test/skills.test.ts`) asserts build-time and read-time
  sectioning agree for every bundled skill, so this path never fires on real data.
- **Redact-before-clip log shaping** — console shaping moved into
  `src/executor/shape-logs.ts` (new module, F2): each line is redacted *first*, then
  clipped at 2,000 chars (clip-first could leak a secret's prefix across the boundary);
  100-line cap; own `execute_logs_shaped` telemetry event. Unit-tested in
  `test/shape-logs.test.ts`.
- **Redaction list refresh** — `SECRET_ENV_NAMES` (`src/policy/redact.ts`) now covers
  every secret the Worker holds: added `MCP_ADMIN_TOKEN`, `MCP_SERVER_SECRET`,
  `WORKOS_API_KEY`; dropped the retired `MCP_BEARER_TOKEN`.
- **Loopback-only dev bypass** — `allowDevUnauthenticated` now requires a loopback
  hostname in addition to the exact-string var (`src/auth/gate.ts`; caller passes
  `url.hostname` in `src/server.ts`); production-hostname inertness is tested in
  `test/auth.test.ts`.
- **Scout non-JSON 404 normalization** — a non-JSON 404 from Scout was `kind: "error"`;
  it now normalizes to `soft-empty` like the JSON 404 branch (`src/adapters/scout.ts`) —
  a miss is not a failure.
- **Manifest uniqueness guards** — `loadManifest` (`src/catalog/search.ts`,
  `refinedCatalogSchema`) now rejects duplicate catalog ids and per-service operation
  terminal-name collisions (which would silently shadow one sandbox fn with another).
- **Helper consolidation (F7)** — the "last id segment" rule now has one definition
  (`src/catalog/id.ts`, used by search scoring, provider fn naming, and the skill alias)
  and the cached-catalog load has one home (`src/catalog/load.ts`, shared by the
  plain-Node tools module and the worker-only runner).

### eval / CI determinism

- **Repo-relative, timestamp-free compiled cases** — `eval/compile-routing.mjs` and
  `eval/qa/compile-qa.mjs` no longer write `generatedAt` wall-clock stamps or absolute
  machine paths into committed artifacts (`eval/routing-cases.json`, `eval/qa/cases.json`);
  paths are now repo-root-relative, so rebuilds are byte-stable across checkouts.
- **CI artifact-sync gate extended** — `.github/workflows/ci.yml` now also rebuilds and
  diffs the eval compiles and `eval/plan/op-classes.json` (op-classes runs after
  build-catalog so it reads the freshly-rebuilt manifest), on top of
  catalog/spec/skills-bundle/mirrors.
- **Dead round-1 descriptor removed** — the authored `STELLAR_DOCS_OPERATIONS` block in
  `scripts/refresh-inventory.mjs` (and its ~96-line echo in `inventory/stellar-docs.json`)
  was a leftover from before the Lane-D authored spec; `specs/stellar-docs.json` is the
  single source for the 12 stellarDocs ops, and the inventory file now carries only the
  live-probed index settings.
- **Catalog staleness assertion** — `test/catalog.test.ts` captures the committed manifest
  bytes before the rebuild-in-`beforeAll` overwrites them and asserts committed == rebuilt
  ("run node scripts/build-catalog.mjs" on failure), mirroring `super-spec.test.ts`.
- **Node 24 pinned in CI** — both workflows moved 22 → 24 with a comment pinning the
  reason (build-catalog.mjs uses native TS type-stripping, stable since 23.6).
- **Judge main-guard fixed** — `eval/qa/judge.mjs`'s `import.meta.url.endsWith(basename)`
  main-detection replaced with a `pathToFileURL(process.argv[1]).href` equality check.

### docs truth pass

Stale statements corrected to match the tree (each verified in the current diff):

- `PLAN.md` — Scout counts (19/20 → 23 paths / 24 ops, 2026-07-02 partner-pipeline
  release); the search-shape section rewritten from "A/B in progress" to settled ADR-0001;
  the §1 sandbox-globals table (retired `skill.run` from the shipped list, `codemode.spec()`
  added); §2 actual catalog counts (374 entries, per-service breakdown); §4 deny-list
  corrected to the real four denied catalog entries + 16 spec-only lumenloop denials;
  §5 refresh outputs (`inventory/`, `test/adapters.test.ts` + CI gate); §6 repo layout;
  §7 status note (all 8 phases live, deferred items enumerated).
- `CLAUDE.md` — stellar-light research-doc pointer updated to 23/24; dead
  `../lumenloop-backend` neighbor removed; `../stellar-raven-next` marked being-retired and
  `../raven-golden-qa` retired (corpora vendored at `eval/corpus/`).
- `README.md` — repo-rename note (repo `stellar-raven`, worker keeps the
  `stellar-raven-codemode` name), `raven.stellar.buzz` alias documented.
- [`research/codemode.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/codemode.md) — ephemeral-sources banner: the scratchpad clone and the
  raven-next `agents-docs/` mirror are gone/transient; re-verify against
  `github.com/cloudflare/agents` directly.
- `research/prior-art.md` — retired-sources banner: siblings retired, reuse shortlist
  fully consumed, no new dependencies on sibling paths.
- [`research/super-spec-design.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/super-spec-design.md) — ADR-0001 status banner (the code-shaped `search` the
  doc was written around is retired; the artifact and its build/test contract are current);
  §5 deltas 4 and 7 updated (two-tool shape; the split throw/warn/write-through guard
  contract); the test-coverage list corrected to the two-tool reality.
- `ecosystem-skills/INDEX.md` + `groups.json` — group descriptions rewritten for this
  server (dropped stale raven ADR-0014 / capability-index references).
- `eval/README.md` — the "separate execute battery (phase 7)" placeholder now points at
  the real `eval/qa/` battery and `eval/EVALS.md`.

### live drift picked up during the audit (stellar-light description enrichment)

The daily refresh pulled Scout `openapi 1.2.1 → 1.3.1`: `builtBy` (org attribution) on
`/api/projects/search` results, a new `Inactive` status enum value, and enriched operation
descriptions — no op-id changes. Effects, all recorded in `eval/gates.json`'s note:

- Legacy routing lane improved **+13 top-1** on the richer descriptions; gates re-baselined
  (`baselinedAt: 2026-07-03T02:32:37Z`, gradingRule v2-twin-aware).
- Skills lane moved **28 → 26** top-1; the two moved cases
  (`q-skill-soroban-testing-strategy`, `q-skill-builder-quickstart-remittance`) were
  investigated — now top-1 scout with skills still in top-3 — and **accepted** per the
  build-questions-pull-both rubric; the gate floor is set accordingly.
- **Rule-v1 (twin-blind) transitional reporting retired** this round per todo 820's
  trigger: the v1 comparison lane and its fixtures were removed from
  `eval/run-routing.mjs` / `eval/self-test.mjs` in the same re-baselining commit-wave, not
  as ambient cleanup.

## Deliberately NOT fixed (with reasons)

| Item | Why it stays |
|---|---|
| `createSpecSearchRunner` + spec-sandbox source generator (`src/executor/run.ts`, `src/executor/spec-sandbox.ts`) — unregistered code path | Kept intentionally per ADR-0001 so the code-shaped search can be re-exposed for future A/Bs (`eval/qa/run-qa.mjs --search-tool`); it is tested (`test/spec-sandbox.test.ts`) and documented, not dead. |
| Rule-v1 grading fixtures (before this round) | Removal was gated on todo 820's trigger (the next re-baseline), which fired with the stellar-light drift — removed then, per the recorded plan, not during the audit. |
| `dist/` directory | `wrangler deploy --dry-run --outdir dist` build output; gitignored (`.gitignore`), not tracked cruft. |
| `eval/corpus/` (~large vendored tree) | Deliberate archival: the raven sibling repos are retired, so the corpora were vendored with provenance + checksums (`eval/corpus/PROVENANCE.md`); EVALS.md declares the corpus archival — growth happens in this repo's own formats. |

## Residual risks / watch items

1. **`eval/gates.json` names a machine-local baseline file.** `baselineResults:
   "routing-2026-07-03T02-32-37-858Z.json"` lives under `eval/results/`, which is
   gitignored — the pointer is not resolvable from a fresh checkout. This is **accepted by
   design** (EVALS.md rule 7: results are local-only evidence; READMEs carry the committed
   record with the exact stamp), but anyone re-baselining on a different machine loses the
   evidence file. Watch: if re-baselining ever becomes multi-machine, commit the cited
   results file alongside.
2. **`src/server.ts`'s composed bypass ordering has no direct test.** The fetch router
   (admin token → dev bypass → OAuth provider) cannot load under plain Node (it imports
   `src/executor/run.ts` → `cloudflare:workers` via `@cloudflare/codemode`). Current
   coverage is via the building blocks in `test/auth.test.ts`: `isAdminAuthorized` /
   `allowDevUnauthenticated` (including production-hostname inertness) unit tests, plus a
   real `OAuthProvider` constructed from `oauthProviderOptions()` around a stub `/mcp`
   handler (401 + WWW-Authenticate, discovery docs, alias rewrites). The *ordering* itself
   is exercised only by live use. Watch: a workerd-based integration test (vitest-pool-
   workers) would close this.
3. **Workers Logs retention is days, not months** (todo 808). The structured telemetry
   (`src/observability.ts`) that eval/debug work leans on ages out of the platform quickly;
   evidence needed later must be exported (or the observability pipeline extended) before
   it expires.
