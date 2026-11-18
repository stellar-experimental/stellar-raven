# Item 7.2 EXEC (phase 1 draft; copied to items/7.2/EXEC.md at the end)

Executor: Claude Sonnet 5.5 (agentpc `t1x1`, `7.2-exec`). Lead: Claude Opus 5.5 (`t1wz`). Brief: briefs/EXEC-BRIEF.md. Plan: PLAN.md.
Terminals I created (all killed and removed when done): see the list at the end.

## Step 1: pre-registration commit P = 666f1784f8111dbb11dfd542db0ab5d81670a2cd
PLAN.md, REVIEW.md, briefs/EXEC-BRIEF.md, briefs/REVIEW-BRIEF.md. Hooks ran (private-usage boundary, secret scan clean).
- `node --check` on ab-run.mjs, blind.mjs, attribute.mjs passed. Selftests passed: `ab-run.mjs --selftest`, `blind.mjs --selftest`,
  `blind.mjs --retest --selftest`, `attribute.mjs --selftest`.
- Dry run: `ab-run.mjs --arm excluded --dry-run --keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --out tmp/7.2/rt/answers-excluded.jsonl --capture-dir tmp/7.2/rt`
  printed "plan: 21 runs, arm excluded, capture dir tmp/7.2/rt". Every default path was moved by flag.
- Blob SHAs at P (git ls-files -s): ab-run.mjs 40637797aaa50a55f185234e70c6138cf2562b7b; blind.mjs f2f48359dea03456688e7f0f8ca57cba0d3a5630;
  attribute.mjs e1019c3d3faa1a2c9847e668ac04946f9b94ca72; questions.json b8c10ade469d2e08806a946c533b9e5bd852461e; verdicts.json
  bd970d647cf64592f30842b60c842428ea68e072. All equal PLAN.md's prefixes.
- `git diff --stat fdddbe26 P -- . ':!.agents'` is empty. Manifest SHA-256 at P `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29`.
- `git status --porcelain=v1 --untracked-files=all` empty after the commit (before this draft; the draft is under ignored tmp/).
- Blob SHAs of the other P files: PLAN.md 721411de2c18, REVIEW.md f49a928b9acf, EXEC-BRIEF.md c906a64ca2da, REVIEW-BRIEF.md b658c0d2aad0.

## Step 2: EXCLUDED arm (tree P)
`rm -rf .wrangler/state`; `npm run dev:eval -- --port 8795` as hc child `72-dev` (t1x2); readiness: `initialize` POST 200. Identity at start and end (`tmp/7.2/probe.mjs`,
saved in `tmp/7.2/rt/probe-excluded-{start,end}.json`): `serverInfo.sourceRevision` = HEAD = P `666f1784…`; manifest SHA-256 `7a4fab76…5caa29`;
`git status --porcelain=v1 --untracked-files=all` empty. Probe top seven (start and end the same): skills.stellar-dev.assets, stellarDocs.search_docs,
stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic, skills.lumenloop.stellar-ecosystem-scout, scout.searchProjects, skills.stellar-dev.standards
(no `scout.getRwaAssets`). Warm-up: one `codemode.skill.read("skills.stellar-light.stellar-scout", { sections: ["when-to-use-this-skill"] })` through `execute`, ok.
Harness (hc child `72-ab-ex`, t1x3): `ab-run.mjs --arm excluded --model claude-sonnet-5-5 --port 8795 --keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --max-attempts 22
--out tmp/7.2/rt/answers-excluded.jsonl --capture-dir tmp/7.2/rt`: 21/21 answered, 21 attempts, no failure or retry; `rwaCalled` 0; cost USD 2.66; window 00:01:55Z to
00:09:32Z; 21 capture files. Server and harness terminals killed and removed; port free.

## Step 3: commit C = 815feb759ee69576ff1d04f4be57b0ed16aa72aa
`git cherry-pick --no-commit 92f71b8d`; replaced the `scout.getRwaAssets` caveat with the pre-registered text (132 characters); narrowed the `card-caveats.mjs` header rule to
"its full description or its output schema"; regenerated in place: `node scripts/build-catalog.mjs`, `npm run spec:build`, `npm run family-text:build` (no change), `node
eval/plan/build-op-classes.mjs`. Diff from `fdddbe26` outside `.agents/` is exactly commit I's six files (`catalog/manifest.json`, `eval/plan/build-op-classes.mjs`,
`eval/plan/op-classes.json`, `scripts/catalog-data/card-caveats.mjs`, `specs/super-spec.json`, `src/policy/scout-exposure.ts`). Manifest SHA-256 `8b655245627eb53bb5b167625e5686501edbb7560d1a95ea71ea68bef7c1aa1e`;
equal to `tmp/7.2/variant-manifest.json` apart from `generatedAt` (and in fact the SHA matches the lead's `8b655245…`). `git diff --stat P C -- .agents` is empty (both arms ran the same
harness and questions). Tests not run at C (per plan).
Routing re-check on C (`npm run eval:routing -- --gate`, stdout `tmp/7.2/routing-C.txt`, aggregates only): identical to the lead's `routing-variant2.txt` line for line apart from the
npm banner, the results path and the gate-failure wording; legacy top3 291, top5 325, card@5 111 and holdout captures 10 against `routing-base.txt` (main), holdout top3 26. Sole gate failure:
the expected manifest-fingerprint mismatch (`8b655245627e` against `7a4fab768750` in eval/gates.json). Every number equals the table.
INCLUDED arm: `rm -rf .wrangler/state` again, hc child `72-dev` (t1x4), identity at start and end: sourceRevision = HEAD = C, manifest `8b655245…`, tree clean. Probe: `scout.getRwaAssets`
rank 1, then skills.stellar-dev.assets, stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic, scout.searchProjects, skills.stellar-dev.standards (start and
end the same). The D3 question `search` at the start returned `scout.getRwaAssets` at rank 3 with the card description "Tokenized real-world assets verified on Stellar. Not a launch or news
timeline: launchedAt is Soroban contract creation only. Includes fiat stablecoins; state is not product status." (the whole caveat; card text saved in `tmp/7.2/rt/probe-included-start.json`).
`scout.getRwaAssets({ limit: 3 })` through `execute`: start ok, `asOfBasis` "observed", 3 rows (469 ms); end ok, "observed", 3 rows (183 ms). Same skill-read warm-up.
Served `stellar-light` skill's RWA reference section (the `GET /api/rwa` section of `file:references/api-reference.md` of `skills.stellar-light.stellar-scout`) saved to
`tmp/7.2/stellar-light-rwa-section.md` for the Codex review (not needed on the exclude branch).
Harness (hc child `72-ab-in`, t1x5): `--arm included --max-attempts 24 --out tmp/7.2/rt/answers-included.jsonl --capture-dir tmp/7.2/rt`: 21/21 answered, 21 attempts, no failure or
retry; `rwaCalled` 9 = `rwaRan` 9 = `rwaMentioned` 9 (C1:1, C2:1-3, C3:2-3, D3:1-3); cost USD 2.68; window 00:10:56Z to 00:17:31Z. Both windows are on 2026-11-18 UTC; neither started between 23:30 and 00:00.
Server and harness killed and removed. `.wrangler/state` cleared before each arm.

## Step 4: blind grading, validation, attribution, scoring
- `blind.mjs --retest --pack --dir /tmp/ab72rt-judge.MYtWRE`: 21 pairs, packet 284 KB plus RUBRIC.md; leak check on the packet (excluded, included, "arm", getRwaAssets, claude-, rwaCalled outside answer
  text; registry URLs in `resultUrls`): none. Key `tmp/7.2/rt/blind-key.json` (mode 600).
- Judge: hc child `7.2-judge` (t1x6), Claude Opus 5.5 (`--model opus`, effort high), the brief's launch line with `systemd-run` memory cap. Trust prompt answered with `hc keys 7.2-judge down enter`
  (own child). The launch line has no `--max-budget-usd` (as 6.3). Verdicts at 00:25Z; killed and removed.
- `blind.mjs --retest --validate`: "grade hash recorded", "verdicts valid"; no completion pass. First-write copy `tmp/7.2/rt/verdicts-first.json`.
- `blind.mjs --retest --score`: pending-attribution, 2 candidates (D3:2, D3:3), no fired clause yet.
- `attribute.mjs --pack --dir /tmp/ab72rt-attrib.8Vx63z`: packed set 3 items (the two candidates and D3:1, an INCLUDED answer with a registry call and a deficiency); hc child `7.2-attrib` (t1x7), Claude Fable
  (`--model fable`, effort high), trust prompt answered likewise; verdicts at 00:26Z. `attribute.mjs --validate`: valid on the first write, no correction pass. Killed and removed.
- `attribute.mjs --score`: outcome **exclude** (D3 clause 2, count 2). Outputs `tmp/7.2/rt/score-retest{,-final}.{json,md}`; un-blinded record `items/7.2/verdicts.json`.

## Deviations and notes
- Drafts stayed under ignored `tmp/7.2/` until both servers stopped; RESULTS.md, EXEC.md and verdicts.json were then copied into the item folder, uncommitted.
- The first INCLUDED start probe's `execute` called `codemode.scout.getRwaAssets`, which the sandbox does not expose ("is not a function"; the namespace is `scout.getRwaAssets`, as the harness regex expects).
  I fixed the probe and re-ran it before the harness started; the recorded start probe is the second (00:10:28Z). No effect on any arm.
- Judge costs not recorded (subscription runs). No commit after C. No push. No test, build or gate beyond the routing re-check, selftests and the dry run (per the brief and plan).
- Terminals created by me (all killed and removed): t1x2 `72-dev`, t1x3 `72-ab-ex`, t1x4 `72-dev`, t1x5 `72-ab-in`, t1x6 `7.2-judge`, t1x7 `7.2-attrib`.

## Spend
Answers: 42 attempts of the 45 cap; USD 2.66 (EXCLUDED) + 2.68 (INCLUDED) = USD 5.34 (per run cap USD 4; per arm cap USD 10). Judges on subscription. No API-billed path used.

# Phase 2: step 6b, exclude (brief: briefs/EXCLUDE-BRIEF.md)
The lead accepted the mechanical outcome, exclude. No model-calling run in this phase.

## Revert
`git revert --no-edit 815feb75`, then the revert's message amended to a plain summary ending with `Refs #167` and the Co-Authored-By line. Revert commit `c03e1164` (the hooks ran: secret scan clean).
- `sha256sum catalog/manifest.json` = `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` (the EXCLUDED arm's hash again).
- `git diff --stat fdddbe26 HEAD -- . ':!.agents'` is empty.

## TODO edits (`.agents/TODO.md`, routing-repair item)
- "Held by this item", RWA bullet: after the 6.3 result-2 sentences and before "The A/B is not re-run on routine drift", added the item 7.2 sentences as the brief gives them (the card-caveat variant, the
  2025-launches loss falling from three of three samples to two and still firing the clause, the RESULTS.md link, and the three re-open triggers). Existing sentences kept.
- Acceptance check 8: "was tested in round item 6.3 and not adopted" became "was tested in round items 6.3 and 7.2 and not adopted". Nothing else changed.

## Gates on the final tree (each run bare, stdout under `tmp/7.2/gate-*.txt`)
Tree = P plus the item folder records, the TODO edit and the revert pair (src, scripts, specs, catalog and eval/plan equal `fdddbe26`).
- `npm run typecheck`: exit 0. The first run failed with `Env` missing members (`MCP_SERVER_SECRET`, `ARTIFACTS`, `OAUTH_KV`, ...) because this fresh worktree had no generated `env.d.ts`; `npm run typegen` (AGENTS.md
  fresh-clone step; the generated file is ignored, no tracked change) fixed it and the rerun passed.
- `npm test`: exit 0; 173 files passed, 5 skipped; 4042 tests passed, 3 expected fail, 8 skipped. (Run before `typegen`; the test lane does not read `env.d.ts`.)
- `npm run build`: exit 0 (wrangler dry run).
- `npm run eval:routing -- --gate`: exit 0, `GATE PASS` (legacy 338 within band, skills at floor, holdout at floors and under the capture ceiling; committed evidence verified).
- `npm run eval:selftest`: exit 0, "all checks passed".
- `npm run secrets:scan -- --tree`: exit 0, "clean — scanned all tracked files".
No `test:smoke` (no `src/executor` or `src/demo` change) and no QA lint.

## Commits on `np/7.2-rwa-caveat` (none pushed)
`666f1784` pre-registration P; `815feb75` commit C (the INCLUDED+CAVEAT arm); `c03e1164` revert of C; the records commit that holds this file (EXEC.md, RESULTS.md, verdicts.json, briefs/EXCLUDE-BRIEF.md, TODO).
No deploy is needed: product paths equal `fdddbe26` and `catalog/manifest.json` is the deployed hash. No `#167` closing keyword in any commit message (`Refs #167`); the lead greps the PR body.
