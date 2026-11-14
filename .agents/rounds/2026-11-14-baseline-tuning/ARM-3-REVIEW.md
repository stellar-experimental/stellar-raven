# Arm 3 review: `d4919118` (remove the source micro-map from the served instructions)

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), terminal `arm3-review` (`t1pb`), in worktree `raven-wt/arm3rev`, detached at
`d4919118`. Author: Claude Sonnet 5.5. Tier: Claude Opus, the stable Claude fallback, chosen by the orchestrator: the author is
Claude Sonnet and the orchestrator is Claude Fable, so the Fable tier (product, API, documentation) was not available to
review. Effort: high. Read: A6 (and A5, A1, A2) in `TUNING-PLAN-AMENDMENTS.md`, `ARM-3-IMPL.md`, `STEP-0-PRIME.md`,
`research/audits/2026-11-14-client-text-limits.md` (origin/main), and the commit. No model call and no spend.

## Verdict: fit to measure

No blocking finding. The served surface changes in exactly one place: the instructions lose the map, and nothing else changes.
The Playground edit is right. Every gate passes. The commit reverts cleanly. Four stale documentation mentions remain
(findings D1 to D4). None of them is text the measured agent reads. They must be fixed in the keep commit if the map is
deleted, and they leave with the revert if it is kept. Do not amend `d4919118` before the run, because the runbook pins that
revision. Section 7 sets out how the result must be read. The main point there is that this panel can barely see the map's
ecosystem-routing and attribution rules, so a "delete" outcome means only that removal did not cost 6 rows on a Docs-heavy
panel.

## 1. Served text, proven from the assembled Worker

Method: a temporary, untracked smoke test (deleted afterwards) ran in the `test:smoke` workerd lane against the assembled
Worker, on `d4919118` and on its parent `cf874a0f`. It sent a 2026 `@modelcontextprotocol/client` connect plus `tools/list`,
and a raw 2025-06-18 JSON-RPC `initialize` POST. No Wrangler process was started. A Node script compared the dumped JSON.

| Measured | `cf874a0f` (parent) | `d4919118` |
|---|---|---|
| `initialize.instructions`, modern client | 4,066 chars, `5d9244e5…3c2e` | 1,899 chars, `67a6bd0b…6c00` |
| `initialize.instructions`, legacy POST (HTTP 200) | identical to modern | identical to modern |
| Equals `BASE_SERVER_INSTRUCTIONS` from source | n/a | **true** (1,899, `67a6bd0b…`) |
| New text is a strict prefix of the old | | **true**. The removed tail is 2,167 chars and runs from `"\n\n## Source Micro-Map"` to `"…corroborate standards mechanics."` |
| `search` description | 1,930, `1f8a31b5…8478` | **byte-identical** |
| `execute` description | 2,029, `51d3f830…a5` | **byte-identical** |
| Tool names | `search,execute` | `search,execute` |

The hashes match `ARM-3-IMPL.md` section 2. Between the with-map side's revision (`6ce86dce`, step 0-prime) and `cf874a0f`,
`src/mcp/micro-map.ts`, `scripts/catalog-data/` and `src/demo/prompt.ts` have no diff. The `tools.ts` changes in that range
are imports and the arm 2 `withExactEvidence` wrapper only. So the served instruction and description text on the with-map
side is the `cf874a0f` text above.

## 2. Other model-facing text

The diff touches nine files. Only two are model-facing: `src/mcp/tools.ts`, where `SERVER_INSTRUCTIONS = BASE` and the
comment changes, and `src/demo/prompt.ts`, which changes one phrase. `src/mcp/micro-map.ts` is regenerated and loses
`MICRO_MAP`; `FAMILY_LINE` is unchanged (359 chars). `ARCHITECTURE.md`, the scripts and the tests are not served.
`SERVER_INSTRUCTIONS` is consumed only by `src/server.ts` (initialize) and `src/demo/prompt.ts`; it does not reach the
sandbox, the spec or any resource. `npm run build` regenerated `micro-map.ts` with no diff, and the tree stayed clean.

**The Playground phrase is right.** "Follow the production workflow and Source Micro-Map above" became "Follow the
production workflow above". Leaving the old phrase would point the Playground model at a section that no longer exists.
Keeping the map for the Playground alone would need a second instructions string, and the arm should not add one. Note
for the decision: if arm 3 is deleted and merged, the public Playground also loses the map. The run does not measure the
Playground (see 7.4).

## 3. Remaining mentions of the map, classified

Searched with `git grep -i -E 'micro-?map|MICRO_MAP|authority rules|source-family map|family map|SERVICE_FAMILY_PURPOSES|AUTHORITY_RULES|validateFamilyPurposes'`,
plus a sweep of `src/`, `docs/`, `public/`, `ecosystem-skills/`, `plugins/` and the site for authority or corroboration
prose. Dated records (`research/`, `.agents/rounds/`) are excluded by rule.

**Model-facing (served instructions, tool descriptions, nextSteps, error hints, caveats, the evidence checkpoint, the
candidate-evidence block, catalog descriptions, the Playground prompt): none.** The checkpoint and candidate blocks
(`src/policy/evidence-checkpoint.ts`), the exact block (`src/policy/exact-evidence.ts`), `script-hints.ts`,
`source-basis.ts` and the manifest descriptions never mention the map. Skill bodies and `ecosystem-skills/` have none
either. The "micro-skill" hits in `ecosystem-skills/` are unrelated.

**Stale, read by users or repo agents. Fix in the keep commit; none affects the measurement:**

| # | Where | Text | Fix |
|---|---|---|---|
| D1 | `ARCHITECTURE.md:57`. The commit edited this paragraph and it now contradicts itself | "…the per-family source map is gone… The generated source-family map follows the base contract. It names what each family can ground and which is the authority, and it carries no operation chains." | Replace the last two sentences with: "The generated `FAMILY_LINE` names each family's scope inside the `search` description and carries no operation chains." |
| D2 | `README.md:15-16` | "The server instructions also include a generated source-family map. Agents use it to plan which source family can answer a question." | Use: "The `search` description names each source family's scope, so agents can plan which family can answer a question." |
| D3 | `src/site.ts:1389` and `:1403-1404` (public site) | "Raven's guidance tells your agent which to trust", and "Ecosystem facts start with Lumenloop or Scout. Protocol and standards claims stay unverified until official docs confirm them." Without the map, no served text says either rule (see 4) | Change 1389 to "Each family answers different questions:". Delete the 1403-1404 paragraph, or reword it as advice to the reader that does not claim the agent is told this |
| D4 | `.agents/skills/live-drift-resolution/SKILL.md:32` (skill text) | `# catalog + source-family purposes -> src/mcp/micro-map.ts` | `# catalog + family line -> src/mcp/micro-map.ts` |

**Correct as they stand:** `package.json` (`prebuild`, `micro-map:build`), `.github/workflows/ci.yml:122,134`,
`refresh.yml:175,407,420`, `scripts/README.md:20,38`, `test/README.md:31`, `scripts/build-super-spec.mjs:861` and
`scripts/build-micro-map.*`. These are file and script names, which the commit deliberately keeps; a rename is a separate
commit. `test/*`: the new contract assertions. `.agents/TODO.md` M3: the open item this arm answers, to be updated with the
result. `plugins/openai/VERIFICATION.md:257`: a dated verification record.

Non-blocking guard note, only if the map is deleted: `validateFamilyPurposes` used to make `npm run micro-map:build` (and
therefore `prebuild` and `refresh.yml`) fail when a catalog family had no prose. Now only `npm test`
(`test/micro-map.test.mjs`: every family appears as `<family>=` in `FAMILY_LINE`) catches a new family missing from the
family line. CI runs `npm test`, so coverage holds. The failure simply moves from build to test.

## 4. What BASE alone no longer tells an agent

| Map content | Still carried elsewhere? | Guard? |
|---|---|---|
| Per-family counts (18 / 30 / 12 ops; 20 skills, 204 sections) | No served text. The model can see them only by running `codemode.catalog`. **Lost outright** | No. Orientation only |
| Per-family purpose lines | Partly, in `FAMILY_LINE` in the `search` description (lumenloop = community/editorial, research, content, SCF/funding; scout = live graph of projects, repos, people, hackathon builds, audits, stablecoins, partners; stellarDocs = official docs; skills = tested playbooks). BASE names `scout.searchResearch` for history and `lumenloop.find_av_passages` for speech. Lost: meeting notes in Docs; Scout SDF people, leaderboards, clusters, changelog and status; Lumenloop similar-project discovery | No |
| "Primary for / Authority for" per family | Only the word "official" on stellarDocs in `FAMILY_LINE`. **Lost outright** as a ranking | No. A routing preference |
| Rule 1: use the family that can ground the claim, and add a corroborating family across boundaries | **Carried**: the `search` description says "Most questions have a primary family and a corroborating one — pick both up front", and BASE says "plan source families" | Weak |
| Rule 2: Scout research and Lumenloop content are community-aggregated; protocol-governance, standards-authorship, incident and audit claims stay unverified until Docs or skills corroborate them | **Partly.** BASE: "Require exact identity or canonical slug plus source and date before attribution; otherwise say unverified", and "State visible source conflicts". The runtime `--- CANDIDATE EVIDENCE ---` block, appended after any semantic, research, A/V or fallback-directory call, says the rows "are candidates, not identity or absence proof… keep any non-verification source-scoped". Arm 2's exact sentence covers a document named by identifier. **Lost outright: the requirement to corroborate governance, standards-authorship, incident and audit claims in official sources.** No served text and no runtime hint carries it | **Yes, a fabrication guard.** It is the only guard of its kind. The baseline review found it over-broad for SEP and CAP files held in Scout research, and arm 2's exact sentence now handles that case. Its general form is gone |
| Rule 3: Docs are the authority for protocol, standards and API claims; for ecosystem facts, start with Scout or Lumenloop even when the docs mention the topic | The first half survives only as "official" in `FAMILY_LINE`. The site states both halves to users (D3), but the agent does not see the site. **The "even when docs mention the topic" override is lost outright** | No. A routing rule. The baseline review found half of it false ("Docs is the authority for standards status" fails for SEP and CAP status) |

So one fabrication guard is lost (the generic part of rule 2). Two runtime surfaces cover part of it, but no surface
carries it whole. The measurement can see that loss only through rows that make governance, incident, audit or
"first/biggest" claims (see 7.2). The trap read must check those rows on purpose.

## 5. Revert

`git revert --no-commit d4919118` applied cleanly and left a tree equal to `cf874a0f` (`git diff --cached --quiet cf874a0f`
was true). I aborted it afterwards, and HEAD is still `d4919118`.

## 6. Gates (each run bare, output redirected, exit code recorded)

| Gate | Exit | Notes |
|---|---:|---|
| `npm run typecheck` | 0 | The first try exited 1 with 77 `Env` errors (`OAUTH_KV` and others), because this fresh worktree had no generated worker types. That is an environment problem, not the commit. `npm run typegen` (exit 0) fixed it, and the gate then exited 0 |
| `npm test` | 0 | 152 files passed, 2 skipped; 3,429 tests passed, 3 expected fail, 2 skipped. Matches the IMPL |
| `npm run build` | 0 | `prebuild`: `FAMILY_LINE 359 chars`, no diff |
| `npm run test:smoke` | 0 | 9 files, 142 tests |
| `npm run eval:routing -- --gate` | 0 | GATE PASS. The routing eval does not read the server instructions (no consumer under `eval/` for the routing lane), so this pass says nothing about the map's value |
| `npm run secrets:scan -- --tree` | 0 | clean |

## 7. The comparison and the threshold of 6

The design in `ARM-3-IMPL.md` section 4 is sound in its main lines. Both sides run cap 50 with the same register and
judge, and the same pins except surface and revision. `FAMILY_LINE` is on both sides. Arm 2 rows are excluded, and
coverage, trap and cost are named. Using step 0-prime as the with-map side is a deviation from A5's text ("Arm 3's 'with
map' side is the arm 1 run"). It is the right deviation, because arm 1 was reverted and its run carries arm 1's code. The
orchestrator should record it as a ruling.

**7.1 The threshold.** I re-derived the null independently with a normal approximation: each row is +1 or −1 with
probability p/2. The results agree with the IMPL's exact figures. At p = 0.20, sd = 3.16 and P(net ≥ 6) ≈ 4.1%. At
p = 0.12, sd = 2.45 and P ≈ 1.3%. At p = 0.34, sd = 4.12 and P ≈ 9.1%. Keep 6. It is one-sided, as it should be. Two
corrections to the IMPL's reading:

- The test runs on the reduced denominator after the arm 2 exclusion: up to 12 rows, so about 38 to 40 rows. There the
  matched-rate null is tighter (p = 0.20, n = 38: sd ≈ 2.76, 95th ≈ 5, P(net ≥ 6) ≈ 2.3%). So 6 is conservative on the set
  actually tested and leans further toward delete. That is A6's intent. Report n beside the net.
- The null model treats flips as symmetric and independent. They are neither: the 22 correct rows can only go down, the 3
  wrong rows can only go up, and the 17 unstable rows carry most of the flips. With one stored with-map draw, a lucky or
  unlucky step 0-prime moves the net by itself. This is already inside the measured flip rate, so it does not change the
  number, but it is why a net of 4 or 5 is "no decision", not "near-keep".

**7.2 Ways it can mislead toward delete (map has value, test misses it).**

1. **Power on the map's own lever.** By `tags.service`, the panel is 35 stellarDocs-primary rows, 6 Scout, 5 skills, 4 none,
   and 0 Lumenloop. It was built for arm 1 (Docs detail) and arm 2 (research identifiers). The map's distinctive rules,
   "start with Scout or Lumenloop for ecosystem facts even when docs mention the topic" and "governance, incident and audit
   claims need official corroboration", apply to perhaps 6 to 10 rows. A 6-row net loss would need the map to matter on
   most of them, or on Docs rows. A real loss of 2 to 4 rows is invisible. This is acceptable only because A6 makes the
   decision by default.
2. **The lost guard (section 4, rule 2) is barely sampled.** By category, the rows most likely to exercise it
   (not checked against their goldens) are `q-edge-factcheck-soroswap-first-amm` (already `wrong` on step 0-prime), `q-edge-asset-site-scam-detection`,
   `q-hot-fee-pool-burn-deflation`, `q-scf-instawards` and `q-n3-pi-network-wrong-chain`. **Required addition, no spend:** in
   step 5 or 6 of the IMPL's read, review those rows' no-map transcripts for a governance, incident, audit or "first/biggest"
   claim stated from community or research rows without official corroboration. Count any such claim as a traced trap
   failure (it keeps the map under A6), even when the grade does not move.
3. **The plan-coverage test is blunt.** `eval:plan` required-service coverage starts at 49 of 50. A route that keeps the
   required family but drops the corroborating one does not register. Keep the IMPL's per-row read of off-plan touches
   and progression.

**7.3 Ways it can mislead toward keep (no map value, test shows a loss).**

1. **Noise.** About 2 to 4% at the matched rate on the reduced set, and up to about 9% if tier differences creep in. The
   judge tier per row must be reported, and the tier-matched net must be shown beside the all-rows net (IMPL step 3). If
   only the all-rows net reaches 6, that is not a keep.
2. **Exclusion chosen after treatment.** "Exact row on either side" decides some exclusions from the no-map run's own
   behavior, and the with-map side's exposure has to be inferred by live replay. **Required fix: freeze the exclusion
   list before reading any verdict.** Take the step 0-prime rows whose stored `scout.searchResearch` queries the committed
   exposure scan marks as arm 2 exposed, minus those the replay shows get no exact row, and record the list with its
   hash. Then add any no-map row that shows an exact marker. Report the net over that set and over all 50. If the
   decision differs between the two, record "no decision" rather than keep.
3. **Upstream drift.** The two runs are hours or more apart. The remote-identity pin stops a run if its probe vector
   moved, but it does not cover every live corpus (Lumenloop content, the Docs index). A traced down whose cause is
   different upstream rows, not the missing map, is a noise observation under A1.

**7.4 What the result must not be read as.**

- Not that the map has no value. A delete means "no loss of 6 or more rows on a Docs-heavy 50-row panel, one sample per
  side, Sonnet 5.5 on Claude Code 2.1.325".
- Not about other clients. OpenCode delivers the 4,066 chars whole. Codex appends them to every tool entry in `ALL_TOOLS`.
  Grok already cuts the map after its first source line. claude.ai web and Desktop drop instructions. A6 already limits
  the claim to Claude Code 2.1.296 or later.
- Not about the Playground. Its prompt follows `SERVER_INSTRUCTIONS`, and the run does not measure it.
- Not about whether the authority rules are true, or whether a rewritten map (arm B) would win.
- Not about `FAMILY_LINE`. It is on both sides.
- Not that removing the map improves answers, even if the no-map side nets more ups. A6 has no gain rule, and a gain under
  6 is noise by the same model.
- Not evidence that the governance, incident and audit corroboration guard is unneeded (7.2.2). If the map is deleted,
  `.agents/TODO.md` should get an item: carry that guard on a surface the agent sees, such as a sentence in BASE (only
  101 chars are left: BASE is 1,899 of its 2,000 budget) or in the candidate-evidence block. That item needs its own measurement.

## Summary for the orchestrator

- Fit to measure.
- Before the run: freeze and hash the arm 2 exclusion list (7.3.2). Add the governance and attribution transcript read to
  the trap step (7.2.2). Record step 0-prime as the with-map side, a deviation from A5 (7).
- At keep or delete: delete → fix D1 to D4 in the keep commit and add the TODO item for the lost guard. Keep → revert
  `d4919118`; D1 to D4 leave with it.
