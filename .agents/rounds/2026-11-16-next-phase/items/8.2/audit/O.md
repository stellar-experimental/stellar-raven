# Item 8.2 audit, set O: organization, ownership, duplication, AGENTS.md rules, skills, `ideas/`

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), high effort, read-only, terminal `t1yr`.
Tree: `np/8.2-docs-audit` at `e0ad27d9`. Date: 2026-11-18.

Read in full: every file in `tmp/living.txt` except `.agents/TODO.md` (headings, the "Deferred
programs" and "OpenAI plugin submission" sections, and keyword hits only), `ecosystem-skills/PIN-REVIEW.md`
(header and the three newest entries; the rest are ledger records), the two generated `INDEX.md`
files (first screen), and the ADRs (titles and status only). Also read `.agents/rounds/README.md`,
which the list leaves out.

Labels: `FROZEN` = touches a path or heading COMMON.md freezes until run 2.2c merges.
`AGENTS-RULE` = an AGENTS.md rule change. `SKILL-BEHAVIOR` = a skill change that alters what an
agent does. Confidence is high unless a row says otherwise.

## Summary: the twelve findings that cost a reader most

| # | Finding | Where |
|---|---|---|
| O-01 | Two `ideas/` files carry judge-facing case text and expected-answer paraphrases beside case ids | `ideas/codegen-correctness-substrate.md`, `ideas/source-delivery-ranked-references.md` |
| O-02 | A held idea says "do not expose `stellarOrg`"; the product ships it | `ideas/stellar-org-source-lane.md`, `ideas/README.md:15` |
| O-03 | AGENTS.md says `CLAUDE.md` imports it; no `CLAUDE.md` exists | `AGENTS.md:26` |
| O-04 | Two living docs give different MCP `search` defaults, and two disagree on static assets | `ARCHITECTURE.md:367`, `:69` |
| O-05 | Eval model ids have two owners; `EVALS.md` names the wrong one | `run-evals/SKILL.md:54-60`, `eval/EVALS.md:16` |
| O-06 | The improvements charter and the skill own the same procedure and contradict on one case | `improvements/README.md`, `improvements-pipeline/SKILL.md` |
| O-07 | Three dated reviews in `ideas/` have passed; nothing in the queue fires them | `ideas/` (three files) |
| O-08 | No ADR index; ADR-0004 and ADR-0011 are unlinked from the docs they govern; the stellar.org decision sits in a never-open folder | `research/decisions/` |
| O-09 | `plugins/openai/README.md` sends readers to a "historical record" for a live procedure and restates open work the queue owns | `plugins/openai/` |
| O-10 | Posting and deploy authority are stated three ways | AGENTS.md, two skills, `ecosystem-skills/README.md` |
| O-11 | Living docs cite round ledgers as design records, which pins folders the retention rule says to delete | `ARCHITECTURE.md:36`, `:240`, others |
| O-12 | `eval/qa/README.md` (864 lines) mixes an operator guide, repo-wide agent rules, pack internals, and dated results | `eval/qa/README.md` |

---

## 1. Map and ownership

### O-03 `AGENTS-RULE` `FROZEN` accuracy: the `CLAUDE.md` sentence is false
- `AGENTS.md:26`: "`CLAUDE.md` imports this file; do not duplicate rules there."
- Evidence: `test -e CLAUDE.md` → missing. `git log -1 88659e30` → "Move owner delegations into
  AGENTS.md; drop CLAUDE.md" (2026-11-17). `.claude/` holds only `settings.json` and the `skills`
  symlink. This Claude Code session received AGENTS.md as project instructions with no `CLAUDE.md`.
- Fix: replace the sentence with "There is no `CLAUDE.md`; do not add one."

### O-13 organization: the AGENTS.md map is true but misses five lookups an agent makes
- `AGENTS.md:13-22`. True rows checked: `.claude/skills` is a symlink to `../.agents/skills`;
  `usage/README.md:149-152` names the private folders; `scripts/README.md` lists generated files.
- Missing rows (each target exists and is already the owner):

  | Need | Read |
  |---|---|
  | Which eval instrument, and its contract | `eval/EVALS.md` |
  | Which test suite covers what | `test/README.md` |
  | Generated files and their generators | `scripts/README.md` |
  | A design decision (ADR) | `research/decisions/README.md` (new, see O-08) |
  | Upstream findings charter | `improvements/README.md` |

- `FROZEN` `AGENTS-RULE` (map edit). Confidence: medium that all five earn a row; the first three
  are the ones agents look up most.

### O-14 duplication: four maps, two of which map the same thing
- `PLAN.md:35-46` "Repository layout" and `ARCHITECTURE.md:7-16` "Concern | Source" both map areas
  to source paths (request handling, catalog, adapters, executor, skills, Stellar Docs). README
  "Documentation" (`README.md:83-91`) and the AGENTS.md map are audience-specific and fine.
- Fix: delete `PLAN.md` "Repository layout" and add its three unique rows (service snapshots,
  skill pins, `wrangler.jsonc`) to the ARCHITECTURE table. PLAN keeps scope, what is built, change
  rules, not built. Confidence: medium (taste).

### O-04 ownership: one fact, two docs, two values
- (a) `ARCHITECTURE.md:367` (MCP-only limits): "Search page | Default 5 hits; maximum 50."
  `src/catalog/README.md:22`: "the public MCP `search` tool defaults to 7."
  Code: `src/mcp/tools.ts:55` `SEARCH_DEFAULT_LIMIT = 7`. ARCHITECTURE is wrong.
- (b) `ARCHITECTURE.md:69`: "The project does not use a Wrangler static-assets directory."
  `assets/brand/README.md:6-8`: Cloudflare serves `public/` "as Workers static assets (`assets` in
  `wrangler.jsonc`)". Code: `wrangler.jsonc:8` `"assets": { "directory": "./public" }`.
  ARCHITECTURE is wrong.
- Root cause for (a): `ARCHITECTURE.md` §2 says the catalog README "defines" the rules, yet §7
  restates catalog numbers. Fix: correct both lines; in the §7 MCP row cite
  `SEARCH_DEFAULT_LIMIT` and link `src/catalog/README.md#search-interfaces` for the catalog and
  sandbox defaults instead of restating them.

### O-05 duplication: eval model ids
- Owner by rule: `.agents/model-roster.md` (`AGENTS.md:165-166`: "when a CLI catalog changes,
  update the roster only").
- Second owner: `.agents/skills/run-evals/SKILL.md:54-60` repeats the five-row table with model
  ids and flags (`claude-sonnet-5-5`, `gpt-6.1-terra`, `grok-4.7`, `claude-opus-5-5`,
  `gpt-6.1-sol`). `:62-63` repeats the Haiku and Luna exclusion.
- Wrong pointer: `eval/EVALS.md:16-17`: "The skill holds the model IDs and the two API-billed
  exceptions." The roster holds the ids.
- The same set is named in four places: `AGENTS.md:71-72`, `model-roster.md:30-39`,
  `run-evals/SKILL.md:54-63`, `eval/EVALS.md:15-16`.
- Fix: (1) `run-evals` §2: replace the table and the Haiku bullet with "The client set and its
  flags are in [`.agents/model-roster.md`](../../model-roster.md#models-for-evals-and-tests)";
  keep the behavior bullets. (2) `eval/EVALS.md:12-17`: cut to "Before a paid run, follow the
  [run-evals skill](../.agents/skills/run-evals/SKILL.md) section 1. The client set is in
  [the roster](../.agents/model-roster.md)." (3) `model-roster.md:40-43` ("Run on `hc` agents
  first"): cut; `AGENTS.md:67-70` owns it. No behavior change.

### O-15 duplication: eval rules and pre-spend lines
- `eval/EVALS.md:57-63` "Evaluation rules" 1 to 4 and `run-evals/SKILL.md:244-248` "Hard rules"
  state the same four rules (one headline and three gates; separate denominators; no per-question
  tuning; freshness graded as behavior).
- The pre-spend lines appear in `AGENTS.md:59-62`, `run-evals/SKILL.md:16-27` (owner of the
  procedure), `eval/EVALS.md:12-14`, `truth-maintenance/SKILL.md:22-30`,
  `retrieval-system-audit/SKILL.md:13-16`.
- Fix: `eval/EVALS.md` owns the instrument rules (CONTRIBUTING links it for humans); `run-evals`
  "Hard rules" keeps its last three bullets and replaces the first four with one link. EVALS.md
  drops its copy of the pre-spend lines (see O-05). The two skill restatements are one sentence
  each and already link `run-evals`; leave them.

### O-16 duplication: the QA lint invocation differs by doc
- `CONTRIBUTING.md:41`, `eval/qa/README.md:32`, `ecosystem-skills/README.md:169`:
  `npm run eval:qa:lint -- --stale --enforce-floors` (matches `.github/workflows/ci.yml:101`).
- `run-evals/SKILL.md:115`: `-- --stale`. `truth-maintenance/SKILL.md:44,78`: `-- --stale`.
  `live-drift-resolution/SKILL.md:141`: bare.
- Fix: one owner, `eval/qa/README.md` "Commands". The skills say "the offline checks in
  `eval/qa/README.md` 'Commands'" or use the CI form. `SKILL-BEHAVIOR` (an agent following the
  skill today runs a weaker lint than CI). Confidence: medium that the shorter forms are
  unintended.

### O-06 duplication and contradiction: improvements charter versus skill
- Same content in both: status table (`improvements/README.md:65-71`; skill `:19-25`), the file
  command (`README:120-133`; skill `:69-81`), the silence rule (`README:153-164`; skill
  `:152-155`), the "no ceremonial issue" rule (`README:166-169`; skill `:91-92`), the drain steps
  (`README:76-81`; skill `:156-173`), the docs split (`README:171-184`; skill `:102-112`), the
  admin-key rule (`README:186-189`; skill `:114-115`).
- Contradiction: `README:181-184` says a gap in Raven's own docs scoping "is an own-repo fix, not
  a finding. It goes to `.agents/TODO.md`". Skill `:108-112` files it under "Docs search findings"
  and says "Record the change, the A/B, and the live re-check in the finding's evidence."
- Drift risk: `README:100-118` lists filing repos by hand; `improvements/intake.json` is the
  machine owner (skill `:66-68`).
- Stale framing: title "upstream findings from eval runs" and `README:191-195` "File findings
  after every eval round"; findings also come from drift, audits, and handoffs (skill
  description).
- Fix: README is the charter for people who arrive from a filed issue: principle, collections,
  record format, lifecycle meanings, the maintainer handoff form, how to find Raven-filed issues.
  Move the procedure out: delete `README:120-133` (keep one dry-run line), `:153-169`, `:186-189`,
  and shorten `:100-118` to "`intake.json` resolves the repository; the skill has the rules".
  Resolve the contradiction in favor of the README (own-repo gap goes to TODO) and delete the
  "Raven scoping" bullet's last sentence in the skill. README edits can land now; the skill edit
  is `FROZEN`.

### O-17 duplication: the docs-search change bar has five statements
- `AGENTS.md:197-199` (rule), `docs/stellar-docs.md:217-219` (owner, by the AGENTS link),
  `improvements/README.md:181-184`, `improvements-pipeline/SKILL.md:108-110`,
  `run-evals/SKILL.md:210`.
- Fix: keep AGENTS (rule) and `docs/stellar-docs.md` (owner). The other three become a link.
  Skill edits `FROZEN` for improvements-pipeline.

### O-18 duplication: post-deploy checks and the re-pin command list
- Post-deploy: `docs/operations.md:32-39` (four steps) and `live-drift-resolution/SKILL.md:162-164`
  (a subset: no `/health`, no `/health/skills`). `operations.md:41` says the skill "uses the same
  checks", so the skill should link, not restate. Fix: skill §8 step 3 becomes "Run the
  post-deploy checks in `docs/operations.md` 'Deploy'."
- Re-pin: `ecosystem-skills/README.md:56-88` (owner), `ecosystem-skills/PIN-REVIEW.md:31-38`
  "Procedure", `live-drift-resolution/SKILL.md:46-57`. Fix: PIN-REVIEW "Procedure" keeps only the
  digest command and the entry format and links the README; the skill block becomes "follow
  `ecosystem-skills/README.md` 'Re-pin', then rebuild in the order above".
- `REFRESH_ISSUE_ASSIGNEE` default is explained in `docs/operations.md:80-81` and
  `inventory/README.md:38-39`. Keep operations; inventory links.

### O-19 duplication: setup and baseline checks (low)
- The `.dev.vars` and typecheck fact: `AGENTS.md:32-33`, `CONTRIBUTING.md:21-22`,
  `README.md:62-63`. Acceptable (one line each, three audiences).
- `test/README.md:4`: "See CONTRIBUTING.md for installation and generated type setup", but
  `CONTRIBUTING.md:17` only forwards to README. Fix: link `../README.md#run-locally`.
- "Run each command bare; a pipe hides its exit status": `AGENTS.md:40`, `CONTRIBUTING.md:35`.
  Smoke-lane trigger: `AGENTS.md:34-36`, `CONTRIBUTING.md:40`, `test/README.md:15`. Leave; each is
  one line and AGENTS names CONTRIBUTING as the table owner.

### O-20 ownership: a research record owns a living contract
- `ARCHITECTURE.md:406-408`: stellar.org adapter rules, then
  "`research/services/stellar-org-site.md` records the contract." `eval/plan/README.md:15-18`
  cites `research/services/lumenloop.md` and `stellar-light.md` as the "documented service
  coverage" that justifies plan rules. AGENTS.md calls `research/` "evidence, not an instruction
  layer". Stellar Docs has a living contract (`docs/stellar-docs.md`); stellar.org does not.
- `research/services/stellar-org-site.md:3-5` is dated ("Measured 2026-11-14") and links its
  decision records under `.agents/rounds/2026-11-14-golden-coverage-audit/`, a never-open folder.
- Fix: add a "stellar.org" section to a living doc (a short `docs/stellar-org.md`: origin, the two
  operations, path guard, redirect rule, size cap, excluded row types, result semantics), point
  `ARCHITECTURE.md:408` at it, and leave the research file as the dated measurement. Confidence:
  medium (I did not read the research file's body, by the brief).

### O-21 organization: coverage gaps in the living-doc list
- Living guides the list omits because they sit under excluded paths: `.agents/rounds/README.md`
  (read here), `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` (linked from
  `eval/EVALS.md:51-52`; under never-open paths, so no lane in this item can audit them). Name a
  golden-maintenance lane or an exact-path exception for those two.
- `test/fixtures/golden-compiler/full-source-card.md` is a compiler fixture, not a doc.
  `ecosystem-skills/INDEX.md` and `improvements/INDEX.md` are generated: a defect there is a
  generator or data defect.

---

## 2. Placement and navigation

### O-08 orphan and organization: ADRs
- No index. `research/decisions/` holds 0001 to 0011 without 0006.
  `git log --diff-filter=AD -- 'research/decisions/0006*'`: added in `cc08aa32` ("codify recursive
  Solo process ownership"), deleted in `5038da35` (#195). The gap is a deletion, not a lost file.
- Citations outside `research/` and `.agents/rounds/` (`rg -l "ADR-NNNN|decisions/NNNN"`):
  - ADR-0004 (drop model-facing correlation ids): none. The living statement of that decision is
    `.agents/skills/cloudflare-observability-review/SKILL.md:13-16` and
    `ideas/observability-r2-retention.md:189-193`; neither links it.
  - ADR-0011 (tool surface stays `search` + `execute`, trimmed): `.agents/TODO.md` only.
    `PLAN.md:17` cites ADR-0001 for the two-tool design and omits the newer decision.
  - ADR-0009: `eval/discovery/README.md` only; `eval/EVALS.md:42-43` narrates the Vectorize
    outcome that ADR-0009 records, without the link.
  - ADR-0002: one `ideas/` file plus code comments.
  - `AGENTS.md:181` cites "ADR-0003" and `golden-truth/SKILL.md:49` cites "ADR-0008", each
    with no path.
- The stellar.org admission (PR #447, `986ffbaa`, 2026-11-15) reversed a recorded HOLD and has no
  ADR; its decision records are in a never-open folder (O-20).
- Fix: add `research/decisions/README.md`, one row per ADR: number, title, status, date, the living
  doc that applies it; one line for 0006 ("withdrawn: Solo process ownership, deleted in #195").
  Add links: observability skill `:15-16` → ADR-0004; `PLAN.md:17` → add ADR-0011;
  `eval/EVALS.md:42-43` → replace both sentences with "ADR-0009 records why discovery stays
  lexical." Consider ADR-0012 for the stellar.org admission so the decision has a readable home
  (owner call). The index is a new living file inside a records folder; it rewrites no record.

### O-11 organization: living docs depend on round ledgers
- `ARCHITECTURE.md:36` → `.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md`.
  `ARCHITECTURE.md:240` → `.agents/rounds/2026-10-10-weekend/answer-style/design.md`.
  `ecosystem-skills/README.md:134` → `.agents/rounds/2026-09-16-trustless-work-acceptance.md`.
  `eval/qa/README.md:529` → `.agents/rounds/2026-10-12-pack-p9/replay-p9.mjs` (a script).
  `.agents/README.md:37` → `rounds/2026-11-16-next-phase/items/0.3/DISPOSITION.md`.
- `.agents/README.md:29-34` keeps a ledger only while a current artifact cites it, so each link
  pins a whole round folder. `ls .agents/rounds | wc -l` → 151 entries.
- Fix: a design or decision a living doc cites moves to `research/` when its round closes
  (`.agents/README.md:20` already routes "evidence from a dated investigation" there). For the two
  ARCHITECTURE links: the OAuth audience-binding design is ADR material; the answer-style note is
  history (see O-24) and the link can go. The `replay-p9.mjs` script belongs beside
  `eval/qa/evidence-pack.mjs` or in `research/audits/` (`FROZEN`: `eval/qa/README.md`). Confidence:
  medium on which ledgers are still needed; high that the pattern defeats the retention rule.

### O-22 accuracy: the rounds guide describes one shape; rounds use another
- `.agents/rounds/README.md:3`: "One file per round: `<YYYY-MM-DD>-<slug>.md`." The current round
  is a folder (`2026-11-16-next-phase/items/<n>/` with `PLAN.md`, `briefs/`, `audit/`), and about
  a third of the 151 entries are folders.
- Fix: document the folder form (ledger file, `items/<n>/PLAN.md`, `briefs/`, findings files) in
  "Shape". This is also the right home for the lane-handoff rules that AGENTS.md carries (O-33).

### O-12 `FROZEN` organization: `eval/qa/README.md` holds four documents
- 864 lines. Operator guide (`:1-176`, `:434-463`, `:552-592`, `:631-710`, `:854-864`);
  repo-wide agent rules, the search rule and the hook contract (`:271-335`), which AGENTS.md and
  the hook cite; evidence-pack internals (`:464-517`, 54 lines that restate
  `evidence-pack.mjs`, which `:441` names as the owner); dated results (`:739-751`, the October 9
  planning-text counts); the paired-collection supervisor contract (`:783-852`).
- Fix after run 2.2c: (1) cut `:466-517` to about ten lines (what a claim-support unit is, the
  budget, the notice line) and leave the algorithm in code comments; (2) move `:739-751` to
  `reviewed/2026-10-09-planning-text.json`'s companion note and keep one link; (3) move
  `:783-852` to `eval/qa/paired-collection.md`; (4) keep "Held-out split" and "Maintenance
  exception" headings in place. Value: the file drops to about 650 lines and the search rule
  becomes findable.

### O-23 `FROZEN` dead-link (wrong heading): the search-rule pointer
- `AGENTS.md:205`, `scripts/agent-hooks/case-search-guard.mjs:54`, and the three `.ignore`
  comments point at `eval/qa/README.md`, "Held-out split". The pathspec and the rule are under the
  sibling heading "Searching without reading case text" (`eval/qa/README.md:271`); "Held-out
  split" (`:223`) holds the split and the maintenance exception. The hook's own header comment
  (`case-search-guard.mjs:4`) names the right heading.
- Fix after 2.2c: point all five at "Searching without reading case text". The hook message and
  its test change together.

### O-09 ownership: `plugins/openai/` is a living guide plus a record set
- Living: `README.md`, `domain-verification/README.md`, the `stellar-raven/` package. Records:
  `EXCEPTION-REQUEST.md` ("Historical draft"), `MCP-FINDINGS.md`, `RESUBMISSION.md` ("Historical
  record"), `REVIEW-CASES-2026-10-23.md`, `VERIFICATION.md` ("Historical record"). The README
  table (`README.md:11-18`) separates them well.
- Problem 1: the living README sends readers to a record for a live procedure.
  `README.md:13`: RESUBMISSION holds "the reviewer-access procedure". `RESUBMISSION.md:86-126`
  ("Account preparation", "Portal update", "Draft secure sign-in instructions") are standing
  steps inside a file whose first line says it is not current.
- Problem 2: `README.md:44-62` "Open review requirements" restates open work that
  `.agents/TODO.md:1211-1238` owns (exception, privacy coverage, key revocation). The README says
  at `:8-9` that the queue owns open work.
- Fix: lift the three procedure sections into `README.md` "Review materials" (about 25 lines) and
  leave RESUBMISSION as the dated account; cut "Open review requirements" to the constraints that
  are rules (already in "Rules") and one link to the queue. Optional: move the five records to
  `plugins/openai/records/` so the folder shows package, verification Worker, README. The moves
  need link fixes only. Confidence: high on problems 1 and 2; low on the subfolder (taste).

### O-24 organization: `eval/discovery/README.md` defines miss classes twice
- `:64-68` (under "Inputs and grading") and `:78-84` ("## Miss Classification") define
  `retrieval`, `agent-behavior`, `downstream` with different wording. Fix: delete `:78-84`.

---

## 3. Cleanliness

### O-01 case text outside the corpus (highest impact)
- `ideas/codegen-correctness-substrate.md:180-200` quotes judge-facing text of three named battery
  cases, and `:204-206` quotes the notes of a fourth. `eval/qa/README.md:335`: "cite the case id
  and field, and never quote judge-facing text."
- `ideas/source-delivery-ranked-references.md:34-58` gives, beside four case ids, the facts each
  expected answer turns on.
- `ideas/stellar-org-source-lane.md:35-36` names one case id with its grade movement (an id
  without text; allowed).
- Consequence: any agent told to read `ideas/` sees that text. This reviewer did, as the brief
  required. I do not know which set any of these cases is in and did not look. The lead decides
  whether `eval/qa/README.md:234-238` (a seen held-out or reserve case moves to tuning) applies.
- Also in the first file: `:215-220` carries partner-side detail (a first name, the partner's
  regulatory processes) that `:6-7` says is "deliberately not repeated here". The repository is
  public.
- Fix now: in the codegen note replace each quote with the case id and field name, and delete
  `:213-221` or reduce it to the product question. In the source-delivery note replace the
  per-case detail in §1 with the finding ids that already hold the public evidence (`sd-044`,
  `sd-004`, `sd-043`); keep section numbers (the queue cites "section 8").
- `eval/qa/case-text-baseline.json` lists no `ideas/` path, so the shingle floor did not catch
  these: the quotes are short. Confidence: high that the "never quote" rule is broken; the
  held-out consequence is the lead's call.

### O-25 stale-history: narration in living docs
| Where | Text | Fix |
|---|---|---|
| `ARCHITECTURE.md:32-36` | "A grant issued before audience binding… This migration exception lasts at most one access-token lifetime" | State current behavior: "A grant with no resource binds to the origin that first refreshes it." The access-token half expired one hour after the deploy; delete it and the ledger link (or cite an ADR, O-11). |
| `ARCHITECTURE.md:79` | "(2,048 before v2.1.296)"; "the per-family source map is gone" | Delete both clauses. The same paragraph describes `FAMILY_LINE` twice (third sentence from the end, and the last); keep one. |
| `ARCHITECTURE.md:240` | "The design note records which instruction sentences these signals replace." | Delete; it describes a past edit. |
| `eval/EVALS.md:42-43` | Vectorize NO-SHIP narration | Link ADR-0009 (O-08). |
| `eval/EVALS.md:69-74` | Two dated diagnostics; "Its separate finalization candidate remains unmeasured." | Move to a "Dated evidence" link list with no status prose; open status belongs in the queue. |
| `eval/README.md:7` | "The committed Scout inventory version is `1.9.116`." | Delete. `inventory/stellar-light.json:11` says `spec@1.9.150`; the snapshot owns its version. |
| `eval/plan/README.md` | Title "grading the PLAN, not just the answer"; `:5-6` "the skills bundle"; "Limitations (honest)" | Rewrite the intro in the house voice; "pinned skills". Bodies are not bundled (`ARCHITECTURE.md:296`). |
| `eval/qa/README.md:739-751` | October 9 planning-text counts | Move to the reviewed record (O-12, `FROZEN`). |
| `eval/qa/claim-read-brief.md:1` | Title carries "(tuning loop 2, amendments A2 and A3)" | Instrument text: flag only, per the item plan. |
| `ecosystem-skills/PIN-REVIEW.md:3-5`, `:18` | "the way it did when the bodies were checked in"; "each because the loose version was walkable" | Trim the header to the rule; entries below stay as records. |
| `plugins/openai/README.md:111-113` | "The Claude listing work this package builds on: commits…" | Delete; git holds it. |
| `ideas/shareable-durable-playground-sessions.md:10-25` | "Issue #40 status", "Input-limit decision" (shipped) | Delete (O-51). |
| `ideas/playground-chatgpt-subscription-login.md:27-46` | "What changed from the initial assessment" | Fold the two current facts into "Decision". |

### O-26 stale TODO-like text outside the queue
- `plugins/openai/README.md:44-62` (O-09). `plugins/openai/VERIFICATION.md:260-261` holds an open
  action (revoke the reviewer key) in a record; the queue also has it (`.agents/TODO.md:1223-1224`),
  so no change is needed beyond not treating the record as the owner.
- `ideas/architecture-explorations.md:34-40` "Known deferred hardening leftovers": the
  `extractLossDetail` coupling is a live own-repo defect (`src/policy/source-basis.ts:434`) with
  no queue entry (O-46).
- `ideas/codegen-correctness-substrate.md:174-211`: four golden gaps and one stale cross-case
  pointer, none in the queue (O-47).
- `ideas/skill-discovery-without-bundling.md:50-53`: a pre-registered read "after 2026-09-30"
  (O-07).

### O-07 dated reviews that nothing fires
- `ideas/stellar-org-source-lane.md:3`: re-evaluate on or after 2026-10-16.
  `ideas/partner-doc-live-sources.md:3`: 2026-10-31.
  `ideas/skill-discovery-without-bundling.md:52-53`: 100 organic events or 2026-09-30.
- Today is 2026-11-18. `rg 'ideas/' .agents/TODO.md` returns one hit (`:1180`, `sources.locate`).
  `.agents/rounds/README.md` (last rule): "A future check is a dated `.agents/TODO.md` entry that
  the next round reads." The skill-discovery note says of itself (`:88-90`) that it is "still
  nothing that fires".
- Fix: a dated review lives in the queue's "Deferred programs" section as a trigger line that
  points at the idea file, the way `sources.locate` does (`.agents/TODO.md:1177-1185`). `FROZEN`
  (TODO path). Dispositions per file are in section 6.

### O-27 term: inconsistent terms
| Terms in use | Where | Preferred |
|---|---|---|
| orchestrator / lead / lead session / coordinator / orchestrating agent | `AGENTS.md:114`, `:137-140`, `:170`; `truth-maintenance/SKILL.md:34`; `retrieval-system-audit/SKILL.md:32`; `run-evals/SKILL.md:82`; `eval/qa/README.md:241` | Define once in AGENTS.md "Coordination": **owner** (the person), **lead** (the session the owner started), **orchestrator** (any session that started lanes), **lane**. Skills use "orchestrator" for "coordinator". `FROZEN` for AGENTS.md and qa/README. |
| golden / gospel / expected answer | `golden-truth/SKILL.md` ("gospel" throughout); `eval/qa/README.md:186`, `:199`, `:344`; `run-evals/SKILL.md:102`, `:115` | **golden** for the case's answer block (the field is `golden.*`), **judge-facing text** for the subset the judge reads. Keep "gospel" only in the lint's own name. `FROZEN`. |
| mirror / pin | `ARCHITECTURE.md:306` "daily mirror check", `:413` "missing skill mirrors", `:429` "mirror availability"; versus `:296`, `:309` "does not keep a mirror", "Never mirror" | **pin**, **pinned file** in prose; script names stay. `:306` → "the daily pin check (`check-mirrors.mjs --fetch`)"; `:413` → "missing pinned skill files". |
| the manifest (two files) | `ecosystem-skills/README.md:15-16` "The manifest allowlist applies to both" | **catalog manifest** (`catalog/manifest.json`), **pin manifest** (`ecosystem-skills/MANIFEST.json`), as `src/skills/README.md:3-4` does. |
| Playground / playground / demo | `ARCHITECTURE.md:325` "Shared by demo and MCP"; `eval/playground/README.md` mixed case; observability skill "playground/demo telemetry" | **Playground** for the product; "demo" only in identifiers (`src/demo/`, `DEMO_CAPS`, `demo-chat`). |
| lane (eval) / lane (agent) / instrument | `eval/qa/README.md:7` "Directory / lane map", "live lane"; AGENTS.md "lane" = an `hc` agent | **instrument** for a measuring tool, **case set** for data, **lane** for an agent. Low priority; `FROZEN` in qa/README. |
| round ledger / round record | `run-evals/SKILL.md:196-197`, `:206`, `:209` "Round record"; elsewhere "round ledger" | **round ledger**. |
| alias host / retired hostname | `ARCHITECTURE.md:23` "aliases"; `README.md:38-40` "remain supported"; `SECURITY.md:28` "any retired hostname that still routes to it" | **alias host**. |
| Lumenloop / LumenLoop / Lumen Loop | `README.md:22` (service "Lumenloop", team "Lumen Loop"); `THIRD-PARTY-NOTICES.md:97` "Partner-tier LumenLoop items" | README's usage. Fix `:97`; leave the upstream copyright line at `:39`. |
| terminal / pane | `eval/playground/README.md:7`, `:121` "pane"; AGENTS.md "terminal" | **terminal**. |
| skill (served) / skill (agent procedure) | AGENTS.md uses both senses in one file (`:9`, `:19`, `:39`) | **ecosystem skill** for served content where the sentence could be read either way. Note only. |
| deploy "with the owner's approval" / "go-ahead unless durably authorized" / delegated | see O-10 | One phrase: "under the owner delegation in AGENTS.md". |

---

## 4. AGENTS.md, rule by rule (`AGENTS-RULE`; every change is `FROZEN`)

The file's own bar: "Add a rule here only after recurring friction. A specialized instruction goes
in the nearest skill or directory-level guide." Net effect of the changes below: about 25 fewer
lines, no rule lost.

| # | Rule (line) | Verdict | Reason |
|---|---|---|---|
| O-28 | Intro and map (`:1-26`) | Reword | Fix `:26` (O-03); add map rows (O-13). |
| O-29 | Install; pre-commit hook (`:30-31`) | Keep | Explains a blocked commit. |
| | Fresh clone, `typegen` needs `.dev.vars` (`:32-33`) | Keep | Changes the first action in a new worktree. |
| | Baseline and smoke lane (`:34-36`) | Keep | |
| | CI gates per area, CONTRIBUTING owns the table (`:37-39`) | Keep | Correct ownership. |
| | Run a gate bare (`:40`) | Keep | |
| | No model-calling eval in a gate sweep (`:41-42`) | Keep | Spend safety. |
| | Secrets scan; generated files (`:43-45`) | Keep | |
| | No second Wrangler (`:46-48`) | Keep | |
| | Find a server with `lsof`; `pgrep -fl` prints secrets (`:49-50`) | Keep | The reason is a secret leak. |
| O-30 | `wrangler kv … --remote`, 100-key limit (`:51-53`) | Move | Operator how-to. Move the two usage sentences to `docs/operations.md` (new "Production KV reads" under "Named API keys"); keep "Production KV stays read-only from an assessment task" as one line. |
| O-31 | Spend: least spend; cost counts; run on `hc` first; eval models; paid method authorization (`:59-74`) | Keep | Core. Remove the copies elsewhere (O-05). |
| | "File and response size come second" (`:75-76`) | Reword or cut | It names no action an agent would otherwise get wrong. If the friction was agents trimming output at the cost of evidence, say that; else cut. Owner call. |
| | "Cut what adds no visibility" (`:77-79`) | Keep | |
| O-32 | "Generality beats the golden" (`:80-84`) | Reword | Five lines of source-addition procedure. Keep: "Goldens locate gaps; they are not the generality test. Reject a change that lifts one slice by moving other categories' results." Move the question-set and control-sample detail to `run-evals/references/source-addition.md`, which already holds the capture-slice and denominator rules. |
| | Closing paragraph (`:86-88`) | Keep | |
| | `hc` intro; herdr-core skill; background children; terminal ownership; screen history; substantial-work bullet (`:92-108`, `:111-113`) | Keep | Terminal ownership is a safety rule. |
| | Durable working state (`:109-110`) | Keep | One line; `.agents/README.md` owns the table. |
| O-33 | Lane-brief paragraph (`:114-119`, six facts) | Move | Orchestrator-only handoff detail. Keep one line: "Write each lane brief to a file and send one line that points at it; `.agents/rounds/README.md` has the handoff rules." Move the rest there. Move "Re-run `npm test` outside the Codex sandbox… it denies `ps`" to the Codex bullet in `model-roster.md:59-62`, which already lists sandbox limits. |
| O-34 | Reserve a finding-id range per lane (`:120-122`) | Move | To `improvements-pipeline` "File a finding" (id allocation is at skill `:31-33`). |
| | "Refs #N" (`:123-124`) | Keep | Any agent writes PR bodies. |
| O-35 | `gh pr merge --delete-branch` kills lanes (`:125-127`) | Move | Orchestrator-only; to `.agents/rounds/README.md`. |
| | Never rebase a pinned SHA (`:128-130`) | Keep | Hard to reverse. |
| O-36 | Before deleting a branch, test every line; bundle first (`:131-133`) | Move | From one cleanup (round item 0.3); to `.agents/rounds/README.md` or `.agents/README.md` "Retention", which already describes the bundles (`:35-37`). |
| O-37 | "A requested independent review is a completion gate" (`:134-135`) | Cut one copy | "Definition of done" repeats it (`:219`). Keep the Definition-of-done line. |
| | Owner delegations (`:137-151`) | Keep | Authorization must sit in the instruction layer. Add a third bullet for upstream filing (O-10). |
| | Model routing table, effort rule, reviewer rule (`:153-173`) | Keep | |
| | Forward-only; mirror codemode (`:177-180`) | Keep | |
| O-38 | Manifest is the exposed surface (`:181-186`) | Reword | Keep the rule and the two guard names. Move "`npm run build` does not rebuild the catalog, so `npm test` and CI catch a hand-edited manifest, not the build" to `scripts/README.md`. Link ADR-0003. |
| | Exact-match ids; envelope kinds; secrets; paid Lumenloop; partner tier; paid operations; Mintlify admin (`:187-199`) | Keep | |
| O-39 | Search without opening case text (`:200-206`) | Keep, reword | Fix the heading name (O-23). |
| | Skills are timeless (`:207`) | Keep | Two skill lines break it today (O-42). |
| O-40 | Solo (`:208-209`) | Reword after cleanup | `ideas/` holds 13 Solo references (`rg`: three files plus "todo 808" in a fourth). Once section 6 lands, shorten to "Add no reference to Solo, a retired tracker." |
| | Retired sibling repo; `eval/corpus/` read-only (`:210-212`) | Keep | |
| | Definition of done; closing rule (`:214-222`) | Keep | |

---

## 5. Skills

Eight skills: four lane skills (`live-drift-resolution`, `run-evals`, `golden-truth`,
`improvements-pipeline`), one coordinator (`truth-maintenance`), one audit
(`retrieval-system-audit`), one operations (`cloudflare-observability-review`), one generic
(`audit-reviewability`). **No merge, split, or retirement is warranted.** Each has a distinct
trigger. The findings are overlaps at the edges.

| # | Finding | Evidence | Fix |
|---|---|---|---|
| O-10 | `SKILL-BEHAVIOR` `FROZEN` Posting and deploy authority are stated three ways | Posting: `improvements-pipeline/SKILL.md:93-95` "Posting authority is standing. Post every verified finding upstream"; `AGENTS.md:151` "Outward-facing posts still need the owner's approval"; `retrieval-system-audit/SKILL.md:32` "The coordinator holds Git, spending, deployment, and external filing authority." Deploy: `AGENTS.md:142` "run `npm run deploy` without asking" (lead only); `live-drift-resolution/SKILL.md:161` "needs the owner's go-ahead unless durably authorized"; `ecosystem-skills/README.md:175-176` "deploy with the owner's approval". | AGENTS.md "Owner delegations" gains one bullet: "Upstream filings: the lead posts verified findings and resolution comments under the standing authorization in `improvements-pipeline`; lanes prepare the dry run." The two skills and the README say "under the owner delegation in AGENTS.md; a lane reports to its lead". A lane that reads only the skill today can conclude it may post. |
| O-41 | `truth-maintenance` §2 restates per-case rules that `golden-truth` owns | Stagger rule: `truth-maintenance:51` and `golden-truth:112-113`. Sentinel handling: `truth-maintenance:52-54`, `golden-truth:115-117`, `eval/qa/README.md:337-355`. | `truth-maintenance` keeps the queue (when the gate fires, look-ahead, corpus health) and links `golden-truth` for the per-case rules. Not frozen for `truth-maintenance`; no behavior change. |
| O-42 | `timeless`: a skill points at an idea's open question | `cloudflare-observability-review/SKILL.md:154-155`: "this feeds the open question in `ideas/skill-discovery-without-bundling.md`". Section 6 folds that file away. | Delete the clause. Add the ADR-0004 link at `:15-16` (O-08). |
| O-43 | Event field semantics have two owners | `ARCHITECTURE.md:446-449` and `cloudflare-observability-review/SKILL.md:128-138` describe `sources`, the status buckets, and `errorName` in near-identical words. `docs/operations.md:93-94` names the architecture as the field owner. | The skill keeps only the trap ("a `timeout` bucket is a call that hit the per-call budget"; "a non-Error throw is recorded as `ok: true`") and links §9. |
| O-44 | A trap sits in the wrong skill | `cloudflare-observability-review/SKILL.md:139-141`: the shape of stored eval results (`rows[].transcript`, `verdict.score`). | Move to `run-evals` §6 "Read the result". |
| O-45 | `SKILL-BEHAVIOR` Skills run a weaker QA lint than CI | O-16. | Use the CI form. |
| | `run-evals` §2 model table; "Hard rules" | O-05, O-15. | Link the roster and `EVALS.md`. |
| | `live-drift-resolution` §8 and §1 skill-pin block | O-18. | Link the owners. |
| | `golden-truth` "Lifecycle" versus `eval/qa/README.md:203-221` | Quarantine, mass review (25 cases, five percent, one quarter), retirement, propose-then-activate are in both. | `FROZEN` both. After 2.2c: the skill keeps decisions ("when to quarantine"), the README keeps the schema and enforced thresholds. |
| | `retrieval-system-audit/references/evidence-contract.md:10` | "Source: Lumenloop, Scout, Stellar Docs, or Skills": no stellar.org. | Add it. Accuracy; not frozen. |
| | `audit-reviewability` | Generic and portable; no repo coupling. | Keep as is. |

---

## 6. `ideas/` dispositions

Checked against code and the queue. A fold into `.agents/TODO.md` is `FROZEN`; until it lands,
keep the file and fix its status line.

| # | File | Disposition | Evidence and what to do |
|---|---|---|---|
| O-02 | `stellar-org-source-lane.md` (85 lines) | **Delete: superseded** | Its decision (`:8`) is "Do not expose `stellarOrg` as a root service". Shipped: `specs/stellar-org.json` exists; `catalog/manifest.json` has two `stellarOrg` operations; added by PR #447 (`986ffbaa`, 2026-11-15); `README.md:25` lists the family. Live state: `.agents/TODO.md:248` "Prove the stellar.org source" and `:201`. Its general lessons (capture slice, label review first) are in `run-evals/references/source-addition.md:9-21`. It also holds two `solo://` links (`:82-83`). On delete, fix `ideas/partner-doc-live-sources.md:185-186` and `ideas/source-delivery-ranked-references.md:504-506`, which cite it as precedent. No queue change needed, so this can land now. |
| O-46 | `architecture-explorations.md` (40 lines) | **Fold, then delete** | Item 1 (code-shaped search re-test) duplicates `research/decisions/0001-search-tool-shape.md:73-90`; ADR-0011 "Reopening" holds the current conditions. Item 2 (pre-cap evidence sidecar) folds into `.agents/TODO.md:950` "Close the remaining claim-support gaps of judge pack p9". Item 3 (telemetry-mined live cases) is rejected by current policy: logs hold no query text (`ARCHITECTURE.md:452`) and `eval/discovery/README.md:55` forbids raw user traffic; the held alternative is `ideas/retrieval-demand-report.md`. Item 4 (approval runtime) is already `AGENTS.md:195-196` plus "Mirror Cloudflare's codemode". Item 5 (docs recency) is covered by `docs/stellar-docs.md:217-219`. Leftover `:39-40` (`extractLossDetail` regex coupled to footer wording; still at `src/policy/source-basis.ts:434`) becomes a new queue item under "Executor and tool surface". Leftover `:36-38` is a closed decision; drop. |
| O-47 | `codegen-correctness-substrate.md` (237 lines) | **Fold and move; not an idea** | It is a dated research note on one partner report (2026-08-07, n=1). Its evidence base is "Solo scratchpad 784" (seven references), which no reader can open. Fix O-01 first. Then: move to `research/audits/2026-08-07-codegen-partner-report.md` as a record; fold three residues into the queue: (1) the malformed-input guidance gap in the pinned smart-contracts skill (`:45-51`), a candidate `improvements/skills/` finding that still needs a recurrence probe; (2) the four golden gaps and the stale cross-case pointer (`:174-211`), by case id only, for a golden-maintenance lane; (3) one line in the ideas index: "No instrument measures long-horizon codegen with Raven installed", actionable when the partner's per-round report arrives or the owner funds a with/without codegen A/B (`:145-148`). |
| O-48 | `observability-r2-retention.md` (299 lines) | **Keep, cut to about 70 lines** | The idea and its five trigger conditions (`:226-244`) are live and unbuilt. "Observed state — 2026-07-07" (`:10-117`) is stale: it says `search` logs the query and `execute` logs a code preview (`:23-27`), which the current rule forbids (`ARCHITECTURE.md:452`); it cites dead line numbers (`eval/README.md:673-678`; that file has 138 lines) and "todo 808" (Solo). Stage 3 and `:112-117` rest on `eval/gates.json` `baselineResults`, a field that no longer exists (`rg baselineResults eval/gates.json`: no match). Delete `:10-117`, "Doc drift found" (`:287-299`), Stage 3, and the Solo lines; keep the proposed shape, query fallback, cost pointers, and triggers. Link ADR-0004 at `:189-193`. Actionable when one trigger fires. |
| O-49 | `partner-doc-live-sources.md` (186 lines) | **Keep; add a queue trigger** | Held; the dated review (2026-10-31) has passed with no recorded result; issue #1 closed 2026-08-25. The design owner is `research/partner-doc-source-onboarding.md`; the harness is `eval/partner-docs/`. Add a "Deferred programs" entry like the `sources.locate` one. What makes it actionable now, at no model cost: re-evaluation step 1 (`:148-149`), the paired 12-case `npm run eval:partner-docs -- --raven-url …` against the local server, settles phase 1 and the overdue review; with stellar.org and the newer Scout index in place, the baseline arm is the unmeasured half. Trim the PR-by-PR chronicle (`:83-127`) to its three conclusions. |
| O-50 | `per-user-mcp-observability.md` (48 lines) | **Keep; rename** | Title is "User-controlled personalization"; the filename describes work that shipped as usage reports (`ideas/README.md:10-12`). Rename to `user-controlled-personalization.md` and fix the links (`ideas/README.md:10`, `retrieval-demand-report.md:97`). No trigger exists; it is the lowest-value file here. Actionable only on an owner decision to build personalization. Alternative the owner may prefer: delete, and add its two constraints (separate store; identity stable across secret rotation) to `PLAN.md` "Not built". |
| | `playground-chatgpt-subscription-login.md` (206 lines) | **Keep** | Research note with four reopen triggers (`:186-191`). Fixes: `:170` "the current GPT-5.4 path" → "the shipped Playground model"; fold `:27-46` into "Decision" (O-25). External facts date from 2026-07-15; re-check before any spike. Actionable when a trigger fires. |
| | `retrieval-demand-report.md` (118 lines) | **Keep** | Held, with clear gates (`:77-84`) that match `usage/README.md`. Absorb item 3 of the architecture backlog as one sentence (a possible use of the extract). Actionable when an operator needs question text or a ranking beyond the 7-day window, after purpose, access, retention, and disclosure are written. |
| O-51 | `shareable-durable-playground-sessions.md` (475 lines) | **Keep; delete the shipped part** | `:10-25` describes shipped work: the copy action (PR #70), and the 8,000-character limit (`src/demo/budget.ts:48` `maxUserMessageChars: 8000`; owner: `ARCHITECTURE.md:351`). Issue #40 closed 2026-09-16. Delete those two sections. The durable-session design is unbuilt and `PLAN.md:60` lists it. Actionable on an owner decision plus the four "Deferred choices" (`:450-459`); re-check the D1 choice against `.agents/TODO.md:1194` (Worker consolidation). |
| O-52 | `skill-discovery-without-bundling.md` (101 lines) | **Fold into the queue, then delete** | It is a pending measurement with pre-registered rules, and its read date has passed (O-07). The read is free: one Workers Logs calculation over `skill_read.shape` by the observability skill. Fold the decision rules (`:55-70`) and question 1's gate (`:60-64`) into one queue item ("Read the `skill_read` shape distribution and apply the rules"); the file itself names the exit (`:84-90`). Dead references to fix or drop on the way: `:73` 'SKILL.md "Skill Retrieval"' (the heading is "Skill reads"); `:25` and `:97` cite `eval/README.md` for the skills-form A/B, which that file no longer holds (ADR-0005 does); Solo references at `:34`, `:101`. Checked: `--skills-form` still exists (`scripts/build-catalog.mjs:1314`); `logSkillRead` exists (`src/observability.ts:96`). |
| | `source-delivery-ranked-references.md` (506 lines) | **Keep** | Deferred by the owner 2026-08-28; `.agents/TODO.md:1177-1185` tracks it and cites "section 8", so keep section numbers. Fix O-01 in §1. Dated anchors: "the 2,000-character budget" (`:462`; tests hold 2,033, `ARCHITECTURE.md:79`). Add one line under the status: "Code anchors are as of 2026-08-27." |
| O-53 | `ideas/README.md` (33 lines) | **Rewrite as an index** | Each bullet restates the file's status, so status has two owners, and the `stellarOrg` line (`:15-16`) is stale in both. Replace with a table: idea, state (held, deferred, measuring), reopen trigger or review date, queue item if any. Add the folder rule in three lines: an idea file has a status line and a trigger; a dated review is a queue entry; when an idea ships or is rejected the file is deleted and the decision is recorded in an ADR or the queue. After this section lands the folder holds seven idea files. |

---

## 7. Seen in passing (accuracy; for sets A to D)

Not re-verified beyond the evidence shown.

- `ARCHITECTURE.md:367`, `:69`: O-04.
- `ARCHITECTURE.md:416`: "instruction-map checks reject stale generated outputs". `rg -i
  'instruction-map|instruction map'` over `scripts`, `package.json`, `ci.yml` finds nothing; `:79`
  says the source map is gone.
- `eval/plan/README.md:68`: the documented regex names three services; `eval/plan/grade-plan.mjs:57`
  has four (`stellarOrg`).
- `eval/README.md:7`: Scout `1.9.116`; the snapshot says `1.9.150`.
- `SECURITY.md:34`: the out-of-scope upstream list omits stellar.org.
- `plugins/openai/README.md:57-58` and `.agents/TODO.md:1221`: "`/terms` … describes
  query/response logging for 30 days". `rg -i 'thirty|30 day' src/site.ts` finds nothing;
  `src/site.ts:1433` says "seven days". The discrepancy may be gone. Confidence: low; set D should
  read `/terms`.
- `plugins/openai/domain-verification/README.md:6`: a `raven.stellar.org` route "on the
  `stellar.buzz` zone".
- `inventory/README.md:54-68`, `ecosystem-skills/README.md:37-41`, `:47-48`: hard-coded counts
  (21 tools, 14 skills, 33 operations, 8 public skills). The snapshots own these; a guide that
  repeats them drifts.

## 8. Sequencing

- Can land now (no frozen path): O-01, O-02, O-04, O-06 (README half), O-08, O-09, O-11 (the
  non-qa links), O-14, O-18 (operations, PIN-REVIEW, inventory halves), O-19, O-20, O-22, O-24,
  O-25 (non-frozen rows), O-27 (non-frozen rows), O-41 to O-44, O-48, O-50, O-51, O-53, the
  `ideas/` trims, and the `run-evals` and `live-drift-resolution` edits (those two skills are not
  on the frozen list).
- Deferred until run 2.2c merges: every AGENTS.md change (O-03, O-13, O-28 to O-40), O-10,
  O-12, O-23, the `improvements-pipeline` and `golden-truth` edits, and every fold into
  `.agents/TODO.md` (O-07, O-46, O-47, O-49, O-52).
- For the orchestrator to approve: all `AGENTS-RULE` rows; `SKILL-BEHAVIOR` rows O-10, O-16
  (O-45).

## Checked and correct

- `.claude/skills` is a symlink to `../.agents/skills` (`AGENTS.md:19`, `.agents/README.md:5`).
- `usage/README.md:149-152` names the two private folders, as `AGENTS.md:24-25` says.
- `ideas/README.md` lists all eleven idea files; none is missing or extra.
- `CONTRIBUTING.md:41` matches `.github/workflows/ci.yml:100-102` for the `eval/` gates.
- `.agents/TODO.md` has the "OpenAI plugin submission" section that `plugins/openai/README.md:8-9`
  and `domain-verification/README.md:12` point at, and it carries the key revocation.
- `.agents/TODO.md:1177-1185` links `ideas/source-delivery-ranked-references.md` section 8, and
  that section exists.
- `scripts/README.md` is the single list of generated files; AGENTS.md, CONTRIBUTING.md,
  `inventory/README.md`, and `docs/stellar-docs.md` link it or defer to it.
- `ecosystem-skills/README.md:77-79` defers the rebuild order to `live-drift-resolution`, and
  `docs/operations.md:41` and that skill reference each other.
- `AGENTS.md` and `run-evals` both link `.agents/model-roster.md`; the roster's tier table is the
  only place repo-work tier ids appear.
- The eval READMEs link dated records under `eval/qa/reviewed/` and `research/audits/` instead of
  restating them, apart from the rows in O-25.
- ADR-0006's absence is a deletion (`5038da35`, #195), not a missing file.
- Shipped claims in `ideas/`: the 8,000-character Playground limit (`src/demo/budget.ts:48`);
  `skill_read` telemetry (`src/observability.ts:96`); `--skills-form` (`scripts/build-catalog.mjs:1314`);
  `extractLossDetail` (`src/policy/source-basis.ts:434`); issues #1 and #40 closed.
- `.agents/rounds/README.md` last rule and `improvements-pipeline/SKILL.md:174-176` agree that a
  future check is a dated queue entry.
