---
name: live-drift-resolution
description: Resolve a "Live service drift detected" issue — the daily CI that diffs the committed catalog against the live upstream surfaces (Lumenloop, Stellar Light/Scout, Stellar Docs). Regenerate the artifacts, classify the drift, decide whether it needs a policy or routing-baseline change or is a clean mechanical bump, dual-verify, commit, deploy when authorized, verify production, and close. Use when a drift issue is filed, when refreshing inventory, or when deciding if an upstream version bump is routing-neutral.
---

# Live service drift resolution

The committed catalog (`inventory/*.json`, `catalog/manifest.json`, `specs/super-spec.json`,
`eval/plan/op-classes.json`) is a frozen snapshot of upstream surfaces. Resolving drift is
mechanical regeneration plus one judgment:

> Is this a clean bump to absorb, or does it change the exposed surface or routing behavior, which
> needs a policy or baseline decision in the same change?

Both errors cost: absorbing a bump that added a callable operation ships an unvetted surface, and
re-baselining a gate for a bump that did not touch routing hides a regression. Size the work to the
class: pure provenance drift, the common daily case, needs steps 1, 2, 4, 7, and 8, all free and
local, with no reviewer lanes. For a pass across
evals, goldens, and improvements as well, `truth-maintenance` coordinates and this skill is the
drift lane.

## 1. Regenerate

The issue's diffstat shows the shape of the drift. Derive the class from the diff, not from the
issue text or the upstream changelog. Run in order:

```sh
npm run docs:anchors:build            # sitemap + headings -> src/adapters/stellar-docs-anchors.json
node scripts/refresh-inventory.mjs    # live upstream -> inventory/*.json
node scripts/build-catalog.mjs        # inventory -> catalog/manifest.json, with exposure guards
npm run micro-map:build               # catalog -> src/mcp/micro-map.ts
npm run spec:build                    # catalog -> specs/super-spec.json
node eval/plan/build-op-classes.mjs   # catalog -> eval/plan/op-classes.json
```

- `refresh-inventory.mjs` rewrites a service file only when its surface moved, so the working tree
  isolates the drift. `git status --short` must show only generated artifacts, plus the policy,
  runner, or baseline edits the class below requires. Anything else: stop and investigate.
- **Anchors.** When `stellar-docs-anchors.json` changes, read the summary's changed pages, removed
  pages, and ambiguous headings, then run `test/adapters.test.ts` and the two
  `test/stellar-docs-anchor*` tests. An anchor change does not touch the catalog or routing.
- **Skill pins.** When `ecosystem-skills/` pins move, also run:

  ```sh
  ./ecosystem-skills/update.sh               # re-pin and print the old->new body diff
  node scripts/check-mirrors.mjs --fetch     # every pin resolves upstream and hashes as recorded
  $EDITOR ecosystem-skills/PIN-REVIEW.md     # record the attestation
  node scripts/check-pin-review.mjs --base origin/main
  ```

  then rebuild the catalog, micro-map, spec, and op classes. Skill bodies are fetched and verified
  at read time from the pinned commit, so a re-pin changes what the model reads. Read the body diff
  before you commit it.

## 2. Classify each service

```sh
SERVICE=<svc>
node scripts/diff-inventory.mjs surface "HEAD:inventory/${SERVICE}.json" "inventory/${SERVICE}.json"
node scripts/diff-inventory.mjs text    "HEAD:inventory/${SERVICE}.json" "inventory/${SERVICE}.json"
node scripts/diff-inventory.mjs deep    "HEAD:inventory/${SERVICE}.json" "inventory/${SERVICE}.json"
```

`surface` compares the path and method set, `text` compares `operationId`, `summary`,
`description`, and `x-routing`, and `deep` compares whole operation objects and shared components.
Exit `0` is equal, `1` is drift, `2` is an input error to correct. Run all three.

| Class | What changed | Needs |
|---|---|---|
| Provenance/data | `fetchedAt`, versions, changelog, counts, and nothing else; all three modes equal | Absorb as-is |
| Operation surface | An operation was added, removed, or renamed (`surface` drift) | Policy decision (step 3) |
| Routing text | A `summary`, `description`, `operationId`, or `x-routing` changed (`text` drift) | Baseline decision (step 4) |
| Runner-affecting | Any drift on an operation a runnable-skill runner declares in `ops` | Live runner check (step 5); stacks on the others |

- `operationCount` hides a rename; trust the `surface` mode.
- The four text fields are not sufficient. The whole spec ships into the sandbox, so `parameters`,
  `requestBody`, `responses`, `x-execute`, and `components` are model-visible contract. A `deep`
  drift with equal `text` is at least routing-relevant and can be a surface change.
- Runner-affecting is machine-checked. List the declared operations and intersect them with the
  operations the diff touched:

  ```sh
  node -e 'import("./src/skills/runners/index.ts").then(m => {
    for (const [id, r] of Object.entries(m.RUNNERS)) console.log(id, JSON.stringify(r.ops));
  })'
  ```

## 3. Operation surface: policy decision

The manifest is the exposed surface (ADR-0003). For each new operation, expose it or add it to the
exclusion data in `scripts/exposure.mjs` in the same change. A removed operation that something
still references fails `build-catalog.mjs`; that failure is the signal. Reconcile the reference or
the runner's `ops`, and never loosen the guard. The paid Lumenloop research operations stay
excluded as a unit (`AGENTS.md` "Hard rules"). Record the exposure call and its reason in the
commit body.

## 4. Routing text: baseline decision

```sh
npm run eval:compile
npm run eval:routing -- --gate
```

- Provenance/data drift must pass against the existing baseline unchanged. That pass is the proof
  that the bump is routing-neutral. A gate that moves when the text did not is a regression.
- Re-baseline `eval/gates.json` only when a routing-text change caused an intended improvement.
  Justify it separately in the commit body. Never re-baseline to make a red gate green.

## 5. Runner-affecting: live check

A runner's output schema is self-authored, so it cannot prove an upstream shape. Against the
existing dev server, `execute` a `codemode.skill.run(...)` call for each affected runner with a
representative input. Confirm `ok` as expected, every `data.calls[].ok` true, and no section
unexpectedly `null` or `softEmpty`. Compare each projected field with the live payload. Treat a
`null` section, a spurious `softEmpty`, or `outputSchemaOk: false` as drift to fix in the runner.
Refresh `test/fixtures/skill-runners/` in the same change when shapes moved.

## 6. Check what else consumed the old facts

Search for consumers of what changed and record "no edit needed" with its evidence:

- **Goldens and evals** (`eval/qa/**`, `eval/*cases*.json`, `eval/plan/**`, `eval/gates.json`):
  stale facts, terms, or operation names. Change a golden only through `golden-truth`.
- **Improvements**: a finding the drift fixed, left reproducing, or newly revealed. Use
  `improvements-pipeline` and re-run the original trigger before any status change.
- **Runtime source and docs**: adapters, runners, tests, and runbooks that quote the old behavior.

For pure provenance drift this is a quick search. For a larger drift, give each category to a
reviewer lane that returns file:line evidence.

## 7. Verify, review, commit

- `node scripts/build-catalog.mjs` exits 0 with the expected exclusions.
- The routing gate matches the class: unchanged pass, or the intended movement.
- Run the focused gates for whatever else changed: `npm run eval:qa:lint`; for improvements,
  `npm run improvements:index`, `npm run improvements:lint`, `npm run improvements:lint -- --live`,
  and `npm run improvements:probes`.
- After a skill re-pin, `check-mirrors.mjs --fetch` passes and `catalog/manifest.json` carries the
  new `transport.url` and `sha` for every changed skill file.
- `npm run secrets:scan -- --tree` and `git diff --check` are clean. A regenerated artifact must
  never carry an upstream key.
- **Independent review** is required for surface, routing-text, runner, or skill-pin drift, and not
  for pure provenance drift. Follow `AGENTS.md` "Coordination": a reviewer other than the author
  re-derives the class from `git diff`, re-runs the guards and gate, and returns file:line
  evidence. Reconcile every finding before the commit.
- Commit as `catalog: absorb <service> <version> drift — <class>`, state what was verified in the
  body, and push.

## 8. Deploy and close

The catalog, spec, and skill pins compile into the Worker, and CI does not deploy. Production
serves the old surface until someone deploys.

1. `npm run build` confirms that the bundle builds.
2. `npm run deploy` needs the owner's go-ahead unless durably authorized.
3. Wait about a minute; a fresh route can return 404 while it propagates. Then check that the
   landing page returns `200` and unauthenticated `/mcp` returns `401` with
   `WWW-Authenticate: Bearer`.
4. Close the issue with the commit, the deploy Version ID, and the guard and live-check evidence
   (`gh issue close <n> --comment ...`).
