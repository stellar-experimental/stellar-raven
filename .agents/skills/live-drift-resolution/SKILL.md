---
name: live-drift-resolution
description: Resolve a "Live service drift detected" issue — the daily CI that diffs the committed catalog against the live upstream surfaces (Lumenloop, Stellar Light/Scout, Stellar Docs). Regenerate the artifacts, classify the drift, decide whether it needs a policy or routing-baseline change or is a clean mechanical bump, dual-verify, commit, deploy when authorized, verify production, and close. Use when a drift issue is filed, when refreshing inventory, or when deciding if an upstream version bump is routing-neutral.
---

# Live service drift resolution — stellar-raven-codemode

This skill is agent-agnostic: a plain-markdown runbook. Claude Code invokes it as a skill;
Codex or any other CLI agent can be pointed at this file directly.

Boundary: this resolves live **service surface** drift. If the user asks whether repo truth is
current across evals, golden answers, improvements, upstream issues, or PRs, use
`truth-maintenance` as the coordinator and this skill as only the drift lane.

## North star

The committed catalog (`catalog/manifest.json`, `inventory/*.json`, `specs/super-spec.json`,
`eval/plan/op-classes.json`) is a **frozen snapshot** of upstream surfaces that drift on their
own schedule. A daily CI job re-fetches the live surfaces and files a **"Live service drift
detected"** issue when the snapshot no longer matches. Resolving it is mechanical regeneration
plus **one real judgment**:

> Is this a clean mechanical bump (absorb and commit), or does it change the exposed surface
> or the routing behavior (which needs a policy or baseline decision in the SAME change)?

Getting that judgment wrong in either direction is the failure mode: rubber-stamping a bump
that added a callable operation ships an unvetted surface; re-baselining a gate for a bump that
didn't touch routing hides a real regression behind a moved goalpost. The whole skill exists to
make that one call correctly and prove it.

Bindings that change (which CI repo, which secret store) live in
[`AGENTS.md`](../../../AGENTS.md), especially
[`Coordination`](../../../AGENTS.md#coordination) and [`Hard rules`](../../../AGENTS.md#hard-rules),
not here. This runbook is the procedure.

## Step 0 — read the issue, don't trust its summary

The drift issue is auto-filed by a bot and includes a diffstat and the exact regen commands. Read
it for the *shape* (which files, roughly how big), but treat its framing as a starting point, not
a verdict — the whole point of the steps below is to derive the truth from the actual diff.

## Step 1 — regenerate from live services

Run the full pipeline (same order the issue prints). Each step feeds the next:

```
node scripts/refresh-inventory.mjs      # re-fetch live upstream → inventory/*.json
node scripts/build-catalog.mjs          # inventory → catalog/manifest.json (+ exposure guards)
npm run micro-map:build                  # catalog + workflow archetypes → src/mcp/micro-map.ts
npm run spec:build                       # catalog → specs/super-spec.json (ships into sandbox)
node eval/plan/build-op-classes.mjs     # catalog → eval/plan/op-classes.json (broad/detail/meta)
```

If the drift issue also reports an `ecosystem-skills/` pin change, or if you run
`ecosystem-skills/update.sh` while resolving the issue, rebuild the generated artifacts in the
same pass:

```
./ecosystem-skills/update.sh              # re-pin AND print the old->new body diff — READ IT
node scripts/check-mirrors.mjs --fetch    # every new pin resolves upstream and hashes as recorded
# then record the attestation (CI fails without it):
$EDITOR ecosystem-skills/PIN-REVIEW.md
node scripts/check-pin-review.mjs --base origin/main
node scripts/build-catalog.mjs
npm run micro-map:build
npm run spec:build
node eval/plan/build-op-classes.mjs
```

Skill bodies are NOT vendored and NOT bundled into the Worker: `MANIFEST.json` pins each file by
commit + git blob hash, and `codemode.skill.read` fetches and verifies it at read time
(`src/skills/source.ts`). So a re-pin ships the moment `catalog/manifest.json` carries the new
`transport.url`/`sha` — there is no separate bundle to regenerate, and **a re-pin changes what
the model reads**. Read the skill diffs before committing one.

`refresh-inventory.mjs` only rewrites a service file when its live surface actually moved (it
prints `unchanged (kept fetchedAt …)` otherwise), so the working tree isolates the real drift.

Confirm the working tree touched **only generated artifacts** (`git status --short`) unless the
classification below explicitly requires an intentional policy, runner, or baseline-source edit
(for example `scripts/exposure.mjs`, runner `ops`, or `eval/gates.json`). Any other hand-editable
source, doc, or script means something is wrong; stop and investigate. Generated artifacts are
never hand-edited
([`AGENTS.md` “Commands and verification”](../../../AGENTS.md#commands-and-verification)).

## Step 1b — impact audit beyond the generated catalog

Before deciding the change is done, audit every category that could consume the upstream
facts. Do this after regeneration and again after any corrective edits:

- **Inventory/catalog/spec/op classes:** confirm regenerated files match the upstream
  surface and ADR-0003 exposure policy.
- **Runtime source:** check relevant adapters, runners, tests, and generated runtime
  payloads. Skill pin drift changes served content the moment the catalog transports move, so
  read the skill diffs; runner drift may require `src/skills/runners/**` and
  `test/fixtures/skill-runners/**`.
- **Golden/eval files:** search active eval sources (`eval/qa/**`, `eval/corpus/**`,
  `eval/*cases*.json`, `eval/plan/**`, `eval/gates.json`) for facts, terms, operation
  names, or expected answers made stale by the upstream change. Update only when the
  new truth is independently established; use the `golden-truth` skill for golden
  answer changes.
- **Improvements:** reconcile `improvements/**` with the new upstream state: mark fixed
  findings fixed-upstream, add recurrence probes for still-broken issues, and file new
  findings when the drift reveals a live upstream gap. Regenerate `improvements/INDEX.md`.
- **Relevant docs/examples:** check any repo-scoped skills, examples, or runbooks that
  quote the changed behavior and would teach agents the old facts.
- **Upstream issue/PR state:** if this drift may resolve or obsolete existing
  `improvements/` findings, use `improvements-pipeline` to inspect the upstream issue/PR
  state and re-run the original trigger before changing statuses.

For non-trivial drift, split this audit across reviewers in their own panes instead of one agent doing
all checks serially. Use separate reviewer briefs for the categories above, have each
reviewer append a verdict with file:line evidence to the round ledger, then reconcile
every finding before committing. Reviewer briefs should be narrow enough to verify, for
example:

- `golden/eval reviewer`: inspect owned QA battery cases (`eval/qa/corpus/battery/**`),
  live contracts, skill cases, plan/gates, and report any stale expected answers or missing
  eval coverage.
- `improvements reviewer`: inspect fixed/recurring/new upstream findings and lint/index
  state.
- `runtime/source reviewer`: inspect `src/**`, runner declarations/projections, fixtures,
  and generated runtime modules.
- `exposure/routing reviewer`: inspect inventory/catalog/spec/op classes, ADR-0003
  exposure policy, and routing gate evidence.
- `upstream follow-up reviewer`: inspect affected `improvements/` findings and their
  upstream issues/PRs, then re-run the original trigger to decide whether the drift actually
  fixed, superseded, or left them still-repro.

Record when a category is intentionally unchanged. "No edit needed" is a conclusion that
needs evidence, not an assumption.

## Step 2 — classify the drift (this picks the rest of the path)

Diff the source-of-truth inventory first (`git diff inventory/<service>.json`). Sort the change
into one of three classes **per service**:

| Class | What changed | What it needs |
|---|---|---|
| **Provenance/data** | `fetchedAt`, version strings, changelog entries, data-source counts, snapshot dates — **and nothing else**: every operation object must be identical, not merely its four routing text fields (see the warning below) | Absorb as-is. No policy, no routing decision. |
| **Operation surface** | An operation was **added, removed, or renamed** in `openapi.paths` (check the path/method set, NOT just `operationCount` — a rename holds the count constant) | **Policy decision** (Step 3) before commit. |
| **Routing-relevant text** | An operation `summary`/`description`/`operationId`/`x-routing` changed | **Routing-baseline decision** (Step 4) before commit. |
| **Runner-affecting** | ANY of the above touches an operation that a runnable-skill runner declares in its `ops` (schema/response-shape drift on such an op counts too — runners project those payloads) | **Runner re-verification** (Step 4b) before closing. This class stacks on top of the others, it never replaces them. |

> **The four text fields are necessary, not sufficient — do not classify on them alone.**
> `specs/super-spec.json` is serialized in full into the sandbox (`src/executor/run.ts` →
> `serializeSpecForSandbox`), so an operation's `parameters`, `requestBody`, `responses`,
> `x-execute`, and the shared `components` are all model-visible contract. A Scout-only schema
> change that left `operationId`/`summary`/`description`/`x-routing` untouched would pass a
> four-field check and be absorbed as "pure provenance" while genuinely changing what the sandbox
> can call and what it gets back. Step 4b catches schema drift **only** for ops a runner declares,
> and most services have no runner at all — so it is not a backstop for this.
>
> Before claiming provenance/data, diff the **whole** operation object and the components section,
> not just the routing tuple:
>
> ```
> node -e '
> const cp=require("child_process");
> const sortDeep=v=>Array.isArray(v)?v.map(sortDeep):v&&typeof v==="object"
>   ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortDeep(v[k])])):v;
> const load=(rev,p)=>JSON.parse(cp.execFileSync("git",["show",`${rev}:${p}`],{encoding:"utf8",maxBuffer:1e9}));
> const [a,b]=[load(process.argv[1],process.argv[3]),load(process.argv[2],process.argv[3])];
> const eq=(x,y)=>JSON.stringify(sortDeep(x))===JSON.stringify(sortDeep(y));
> console.log("paths identical:",eq(a.openapi.paths,b.openapi.paths));
> console.log("components identical:",eq(a.openapi.components,b.openapi.components));
> ' HEAD WORKING inventory/<service>.json
> ```
>
> Both must print `true`. Anything else is at least routing-relevant and may be operation-surface.

Runner-affecting is machine-checkable, never eyeballed — the runner registry
(`src/skills/runners/index.ts`, `RUNNERS`) is the allowlist-as-data:

```
# declared op ids per runnable skill (node-clean by construction):
node -e 'import("./src/skills/runners/index.ts").then(m => {
  for (const [id, r] of Object.entries(m.RUNNERS)) console.log(id, JSON.stringify(r.ops));
})'
# intersect those op ids with the ops the inventory diff touched (added/removed/renamed,
# schema or description changed) — a non-empty intersection = runner-affecting.
```

A **removed/renamed** declared op will already fail `scripts/build-catalog.mjs` loudly (the
declared-ops drift guard) — that failure is the signal, not a nuisance; reconcile the runner's
declared `ops` as part of the policy decision, never by loosening the guard.

A single bump can be pure-provenance (the common daily case) or mix classes. Never infer the
class from the upstream changelog's self-description ("routing-neutral", "additive") — the
changelog is a *claim to verify*, not evidence. Derive the class from the actual diff:

```
# added/removed/renamed operations — compare the path·method set old vs new:
SERVICE=<svc>
git show "HEAD:inventory/${SERVICE}.json" | node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(0, "utf8"));
const methods = new Set(["get","post","put","patch","delete","options","head"]);
for (const [path, ops] of Object.entries(doc.openapi?.paths ?? {})) {
  for (const method of Object.keys(ops ?? {})) {
    if (methods.has(method)) console.log(`${method.toUpperCase()} ${path}`);
  }
}
' | sort > "/tmp/${SERVICE}.surface.old"
node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const methods = new Set(["get","post","put","patch","delete","options","head"]);
for (const [path, ops] of Object.entries(doc.openapi?.paths ?? {})) {
  for (const method of Object.keys(ops ?? {})) {
    if (methods.has(method)) console.log(`${method.toUpperCase()} ${path}`);
  }
}
' "inventory/${SERVICE}.json" | sort > "/tmp/${SERVICE}.surface.new"
diff -u "/tmp/${SERVICE}.surface.old" "/tmp/${SERVICE}.surface.new"
# empty = no surface change

# routing-relevant text — compare per-op operationId+summary+description+x-routing old vs new:
git show "HEAD:inventory/${SERVICE}.json" | node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(0, "utf8"));
const methods = new Set(["get","post","put","patch","delete","options","head"]);
const norm = v => String(v ?? "").replace(/\s+/g, " ").trim();
const sortDeep = v => Array.isArray(v)
  ? v.map(sortDeep)
  : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortDeep(v[k])]))
    : v;
const stable = v => JSON.stringify(sortDeep(v ?? null));
for (const [path, ops] of Object.entries(doc.openapi?.paths ?? {})) {
  for (const [method, op] of Object.entries(ops ?? {})) {
    if (methods.has(method)) console.log(`${method.toUpperCase()} ${path} :: ${norm(op.operationId)} :: ${norm(op.summary)} :: ${norm(op.description)} :: ${stable(op["x-routing"])}`);
  }
}
' | sort > "/tmp/${SERVICE}.text.old"
node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const methods = new Set(["get","post","put","patch","delete","options","head"]);
const norm = v => String(v ?? "").replace(/\s+/g, " ").trim();
const sortDeep = v => Array.isArray(v)
  ? v.map(sortDeep)
  : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortDeep(v[k])]))
    : v;
const stable = v => JSON.stringify(sortDeep(v ?? null));
for (const [path, ops] of Object.entries(doc.openapi?.paths ?? {})) {
  for (const [method, op] of Object.entries(ops ?? {})) {
    if (methods.has(method)) console.log(`${method.toUpperCase()} ${path} :: ${norm(op.operationId)} :: ${norm(op.summary)} :: ${norm(op.description)} :: ${stable(op["x-routing"])}`);
  }
}
' "inventory/${SERVICE}.json" | sort > "/tmp/${SERVICE}.text.new"
diff -u "/tmp/${SERVICE}.text.old" "/tmp/${SERVICE}.text.new"
# empty diff = the "no routing-relevant text changes" claim is TRUE at our ingest, not just upstream's word
```

## Step 3 — operation surface changed → policy decision

A newly-exposed operation is a **new callable surface**. Do not ship it unexamined:

- **The manifest IS the exposed surface (ADR-0003).** Exposure is filtered at BUILD time; the
  decision to expose/deny/meter an op is exact-match data in `scripts/exposure.mjs`, enforced by
  guards in `scripts/build-catalog.mjs` (`assertNoNonExposedRefs` breaks the build if emitted text
  references a non-exposed op or retired skill). Decide, for each new op: expose it, or add it to
  the exclusion data. A new op that should stay dark is added to `scripts/exposure.mjs` in the
  same change that absorbs the drift.
- A **removed** op that was referenced anywhere must not leave a dangling reference — the build
  guard will fail loud if it does; that failure is the signal, not a nuisance.
- Special case — the paid Lumenloop research lane (`request_research` + its read half
  `research_result`/`list_my_research`) stays excluded as a unit; see
  [`AGENTS.md` “Hard rules”](../../../AGENTS.md#hard-rules) before touching any of the three.

Record the exposure call and its rationale (round ledger / commit body). This is the class the
issue means by "new/removed operations … may need policy (deny/metered) decisions."

## Step 4 — routing-relevant text changed → baseline decision

An operation description and `x-routing` block are lexical routing fuel. If a
`summary`/`description`/`operationId`/`x-routing`
changed, the routing gate may legitimately move:

```
npm run eval:compile && npm run eval:routing
```

- The gate prints `GATE PASS — legacy <N> within band and skills lane at/above floor (baseline …)`
  or fails with the deltas. The baseline it compares against lives in `eval/gates.json`.
- **Re-baseline ONLY when a routing-relevant text change is the cause and the movement is an
  intended improvement** — e.g. a bump that genuinely reworded an operation
  `summary`/`description` or curated `x-routing`.
  Re-baselining is asserting "the new numbers are the new correct floor."
- **Never re-baseline to make a red gate green for a pure-provenance/data bump.** If descriptions
  are byte-identical (Step 2 diff empty) the gate must pass against the *existing* baseline with
  no change — that is the proof the bump is routing-neutral. A gate that moves when descriptions
  didn't is a real regression, not a baseline to bump.

If you do re-baseline, it is a deliberate, separately-justified part of the change, not a
side effect — capture why (round ledger / commit body), same as an exposure decision.

## Step 4b — runner-affecting drift → live runner re-verification

When the Step 2 machine check found a non-empty intersection between the drift diff and any
runner's declared `ops`, the resolution is not closable on regeneration + guards alone. The
runners' output projections are self-authored schemas — they can only prove the projection
matches itself, so upstream shape drift on a declared op must be re-verified against the live
service, not against the runner's own contract:

- **Re-run the affected runners' live smoke**: against a live-serving instance (for example, the
  existing `npm run dev` pane and its bound URL required by
  [`AGENTS.md` “Commands and verification”](../../../AGENTS.md#commands-and-verification) and
  [`Coordination`](../../../AGENTS.md#coordination)), `execute` a `codemode.skill.run(...)` call
  for each affected runnable id with a representative input, and confirm the envelope: `ok`
  as expected, `data.calls[].ok` all true, no section unexpectedly `null` or `softEmpty`.
- **Re-verify projections against the observed shapes**: compare the fields each runner
  projects with what the live payloads actually carry now. A defensive projection that
  half-handles a shape change surfaces as a `null` section, a spurious `softEmpty`, or an
  `outputSchemaOk: false` warn-belt event — treat any of those as drift to reconcile in the
  runner, not noise.
- **Refresh the live-captured fixtures** the offline test lanes share
  (`test/fixtures/skill-runners/`) if observed shapes moved, in the same change.

Only after both the live smoke and the projection re-check pass does the drift close.

## Step 5 — verify before committing

Run the guards that would catch a bad absorb, and confirm the scope:

- `node scripts/build-catalog.mjs` exits 0 and prints the expected exclusions (ADR-0003 leak
  guard green).
- Routing gate result matches the Step 2/4 expectation (PASS unchanged for provenance/data;
  intended movement for a re-baselined text change).
- If `ecosystem-skills/**` changed, `node scripts/check-mirrors.mjs --fetch` passes and the
  rebuilt `catalog/manifest.json` carries the new `transport.url`/`sha` for every changed skill
  file — and the skill diffs themselves were read (they are prompt input).
- If golden/eval files changed, run their focused lint/gate (`npm run eval:qa:lint` and the
  relevant eval lane) in addition to the routing gate.
- If improvements changed, run `npm run improvements:index`,
  `npm run improvements:lint`, `npm run improvements:lint -- --live`, and
  `npm run improvements:probes`.
- `npm run secrets:scan -- --tree` is clean — a regenerated artifact must never carry an upstream
  key/token. Also eyeball the diff for high-entropy strings and secret-shaped assignments.
- `git status --short` shows only regenerated artifacts plus any explicitly justified policy,
  runner, baseline, eval/golden, improvement, or runbook edits required by the drift class;
  `git diff --check` is clean.

## Step 6 — independent adversarial review (default for anything past pure-provenance)

For any drift that touched the operation surface or routing text — and as good hygiene even on a
clean bump — spawn an **independent reviewer** to verify or refute the "safe to commit" call
before committing. This mirrors the repo's independent-review rule in
[`AGENTS.md` “Coordination”](../../../AGENTS.md#coordination).

- Route pane and agent mechanics through the global `herdr` skill; split one pane per lane for the
  reviewer lane and select model/effort explicitly per `AGENTS.md`. Spawn a *different* agent with
  an explicit adversarial brief: do NOT
  trust the maintainer's summary; re-derive the drift class from the actual `git diff`, re-run the
  guards and gate, check ADR-0003 exposure and secrets, and return a verdict with file:line
  evidence. Prefer different vendor from author. Put brief in the round ledger and have reviewer
  append findings.
- Reviewer ≠ author is the invariant. Let it run to completion; reconcile every finding before
  committing. Wait for the reviewer with `herdr agent wait <name>` rather than polling.

## Step 7 — close out

- Commit the regenerated artifacts plus any explicitly justified policy, runner, or baseline-source
  edits required by the drift class. Match the house prefix and name the upstream version and the
  class of change, e.g. `catalog: absorb <service> <version> drift — <one-line class>`. State in
  the body what was verified (op count, description-identity, gate result, guards, secrets) and
  that an independent review agreed. Push.
- If the change involved a policy or baseline decision, record it where the project tracks work
  (round ledger), so the *why* survives — the artifacts only carry the *what*.

## Step 8 — deploy to production (the drift isn't resolved until prod serves it)

Committing and pushing does NOT update the live service. The catalog and spec are compiled *into*
the Worker bundle (`catalog/manifest.json` → `src/catalog/load.ts`, `specs/super-spec.json` →
`src/executor/run.ts`), and CI does **not** deploy — so production keeps serving the OLD upstream
version until a manual deploy. That includes skills: a re-pin does NOT reach users on merge,
because the pinned `transport.url`/`sha` pairs live in the compiled catalog — deployed production
keeps fetching the OLD commit until you deploy the new one. Closing the drift loop requires shipping:

- `npm run build` (`wrangler deploy --dry-run`) first — confirm the bundle builds and bindings are
  intact; it's the same check the review step ran.
- `npm run deploy` (`wrangler deploy`) — pushes the new catalog live to the production routes.
  Deploying to production is outward-facing: get the owner's go-ahead unless durably authorized.
- Verify live: the deploy prints a new Version ID and the updated routes; a quick liveness check
  confirms the roll-out. **Give the edge ~1 minute first.** A just-deployed route can 404 for about
  a minute, including on cache-busted URLs — that is propagation, not a routing bug. Re-check before
  debugging it; the 2026-07-30 `/terms` deploy burned time on exactly that. The public landing pages
  should return `200`; unauthenticated `/mcp`
  should return the expected auth error (`401` JSON), unless the check includes a valid bearer
  token. Note the Version ID in the close-out record.

A drift bump that is committed but never deployed is a *silent* stale prod — the catalog carries
the new upstream version while the gateway still answers as the old one. Treat deploy as part of
resolving the issue, not a separate optional chore.

After production verification, close the drift issue with a comment that records the commit sha,
deploy Version ID, and evidence from the guards/review/live check (`gh issue close <n> --comment …`).

## Hard rules

- Derive the drift class from the actual diff, never from the upstream changelog's self-labels.
- Check the operation path·method **set** for add/remove/rename — `operationCount` alone hides a
  rename.
- The manifest IS the exposed surface (ADR-0003): a newly-exposed op is a policy decision; expose
  or exclude it in `scripts/exposure.mjs` in the same change. Never let emitted text reference a
  non-exposed op or retired skill — the build guard enforces this; a guard failure is the signal.
- Re-baseline the routing gate only for an intended routing-relevant text change, and justify it
  separately. Never re-baseline to hide a provenance/data-bump regression.
- Drift touching any op in a runner's declared `ops` (machine-check against `RUNNERS`,
  `src/skills/runners/index.ts`) is runner-affecting: re-run the runner live smoke and
  re-verify projections against observed shapes before closing (Step 4b). Never close on the
  runner's own output schema as evidence — it is self-authored.
- Generated artifacts (`catalog/manifest.json`, `inventory/*.json`, `specs/super-spec.json`,
  `eval/plan/op-classes.json`, `improvements/INDEX.md`) are rebuilt by scripts, never
  hand-edited.
- Skill pin drift is runtime drift the moment the catalog transports advance — a re-pin is a
  content change to the model surface, not a metadata bump.
- Every drift resolution includes an impact audit for golden/eval files, improvements,
  inventory/catalog/spec, runtime source, and relevant docs/examples; use ledger category
  reviewers for non-trivial drift and record their evidence.
- Never print or commit a secret; `secrets:scan --tree` before every drift commit.
- Independent, adversarial review before committing anything past a pure-provenance bump;
  reviewer ≠ author; let it finish.
