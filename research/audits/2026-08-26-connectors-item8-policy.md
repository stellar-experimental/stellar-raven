# Connectors Directory item 8 — product and policy review

- Date: 2026-08-26
- Lane: Product and policy review (`connector-policy`, Fable high), read-only
- Worktree: `sr-wt-connectors-item8` @ `e488c4f`, branch `audit/connectors-item8-20260826`
- No edits, spend, deploy, submission, or delegation were performed.

## 1. Sources

- Private SDF review document: SECDESK-438, reviewed commit `5f31ad2`, Darpan Vedi, 2026-08-20.
- The private document defines the task scope. It is not a public verification source.
- Anthropic Software Directory Policy, updated 2026-04-15: `https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy`
- Pre-submission checklist: `https://claude.com/docs/connectors/building/review-criteria`
- Submission guide: `https://claude.com/docs/connectors/building/submission`
- The older `support.claude.com` Connectors Directory articles (11596036, 11596037, 11596040) now redirect to the developer docs or return 404.
- Round ledger: `.agents/rounds/2026-08-26-connectors-item8-efficacy.md`
- Repo: `src/mcp/tools.ts`, `src/mcp/micro-map.ts`, `src/policy/evidence-checkpoint.ts`, `test/mcp-instructions.test.ts`, `ARCHITECTURE.md` (server section), `src/skills/source.ts`, `src/skills/scrub.ts`, `src/site.ts` (`/docs`), `src/demo/prompt.ts`, `src/demo/tools.ts`.

## 2. Measured sizes at `e488c4f` (characters)

| Text | Now | SDF doc at `5f31ad2` |
| --- | --- | --- |
| `SEARCH_DESCRIPTION` | 4,934 | 4,475 |
| `EXECUTE_DESCRIPTION` | 9,337 | 8,987 |
| `BASE_SERVER_INSTRUCTIONS` | 1,986 | 2,065 |
| `MICRO_MAP` | 5,885 | not counted |
| `SERVER_INSTRUCTIONS` (BASE + micro-map) | 7,873 | not counted |
| `FAMILY_LINE` | 359 | not counted |
| `UPSTREAM_DOC_LINKS` | 213 | absent |
| search `nextSteps` base text, non-empty page | ~2,500 per response | not counted |

Observations:

- The descriptions grew after the review. The doc URLs (`tools.ts:216`) and the prior-art paragraph (`tools.ts:233`, `:280`) landed after `5f31ad2`.
- Item 1 (title, `readOnlyHint`, `destructiveHint`, `openWorldHint`) is done at `tools.ts:336-344` and `:426-434`.
- The item-8 sub-task "add one documentation URL per upstream" is done (`UPSTREAM_DOC_LINKS`).
- `/docs` (item 4) exists at `src/site.ts:1180+`. It does not carry the evidence-sufficiency, attribution, or prior-art rules today. A grep finds one "soft-empty" mention and no "closed-world", "open-world", "prior-art", or "source and date".

## 3. Published Anthropic rules (verified 2026-08-26)

Software Directory Policy (updated 2026-04-15). Section 2 applies to "Instructional Software" — software that gives Claude tools "through natural language descriptions".

- 2.A: "Instructional Software must define each tool or capability through narrow, unambiguous natural language that specifies what it does and when it should be invoked."
- 2.B: "tool or capability descriptions must precisely match actual functionality ... Descriptions must not include unexpected functionality or promise undelivered features."
- 2.C: descriptions "must not create confusion or conflict with other Software in our Directories."
- 2.D: "Instructional Software must not intentionally call or coerce Claude into calling other external software, tools, databases, or resources unless requested and intended by a user. Similarly, ... descriptions must not be written in a way that intentionally leads to other Software extraneously calling them."
- 2.E: "must not attempt to interfere with Claude calling tools from other software, tools, databases, or resources unless requested and intended by a user."
- 2.F: "must not direct Claude to dynamically pull behavioral instructions from external sources for Claude to execute."
- 2.G: "must not contain hidden, obfuscated, or encoded instructions. All behavioral guidance must be human-readable and clearly presented."
- 5.A: "MCP servers must gracefully handle errors and provide helpful feedback rather than generic error messages."
- 5.B: "MCP servers must be frugal with their use of tokens. The amount of tokens a given tool call uses should be roughly commensurate with the complexity or impact of the task. When possible, users should be given options to exclude unnecessary text in the response."
- 5.E: "must provide all applicable annotations for their tools, in particular readOnlyHint, destructiveHint, and title."

Pre-submission checklist (`claude.com/docs/connectors/building/review-criteria`):

- "Write narrow, accurate descriptions. Each tool description should state precisely what the tool does and when to invoke it. The description must match the tool's actual behavior."
- "Reference API docs in custom query tools. If a tool accepts freeform endpoint paths, query strings, or request bodies that the caller constructs, its description must include a link to or explicit name of the target API." `execute` accepts caller-constructed code, so this applies to `execute`. It does not apply to `search`.
- "Tool descriptions are rejected if they: Instruct Claude to call external software or tools the user didn't request; Interfere with Claude calling other tools; Direct Claude to pull behavioral instructions from external sources; Contain hidden, obfuscated, or encoded instructions; Tell Claude to behave in ways unrelated to the tool's function, attempt to override system instructions, or promote products and services. Describe what the tool does. Do not tell Claude how to behave."
- "Keep responses reasonably sized for the task. Do not return a full database dump when a summary was requested."
- Community listing is an automatic policy scan. Verified escalation is Anthropic's own decision and adds a functional test of each tool.

Submission guide:

- The portal syncs "tools, prompts, and resources" from the connected server. Server instructions are not named.
- The listing card description is capped at 2,000 characters. That cap is for the listing, not the tool description.
- No published rule sets a character cap on a tool description or on server instructions.
- The 2,048-character clip is Claude Code client behavior (`ARCHITECTURE.md:83-88`), not a policy.

## 4. Published rule versus SDF reviewer's interpretation

| # | SDF item 8 statement | Status |
| --- | --- | --- |
| a | "Roughly 13.5 KB enters the context of every session" (sums `BASE_SERVER_INSTRUCTIONS` with the two descriptions). | Interpretation. No published rule sets a session total or names server instructions. |
| b | "Policy 5.B asks that token use be commensurate with the task", applied to description size. | Interpretation. 5.B governs "the amount of tokens a given tool call uses", that is, per-call response size. |
| c | "much of it directs how Claude should reason rather than describing what the tools do." | Matches the published sentence "Describe what the tool does. Do not tell Claude how to behave." This is the strongest published basis for item 8. |
| d | "The review criteria ... reject descriptions that tell Claude to behave in ways unrelated to the tool's function." | Published verbatim. Whether evidence-handling rules about the tool's own output are "unrelated to the tool's function" is a judgment call. The reviewer reads them as unrelated. |
| e | "Move the evidence-sufficiency rules, attribution rules and prior-art pass to the documentation page in item 4." | Remedy proposal, not a published rule. |
| f | "Keep the mechanical contract: envelope shape, .data access, the ok check, exact-match ids, no fetch, no TypeScript, the truncation cap." | Remedy proposal. Consistent with 2.A and 2.B. |
| g | "add one documentation URL per upstream ... custom query tools link or name the target API." | Published for `execute` (freeform code). Already done. |
| h | "No hidden instructions (2.G)" listed as already compliant. | Agreed. All guidance is plain text. |

## 5. Can description-only Arm B1 satisfy item 8?

Against the published rules: yes, probably. Every published description rule names the tool description. `BASE_SERVER_INSTRUCTIONS`, `MICRO_MAP`, `nextSteps`, the runtime checkpoint blocks, and the pinned skill bodies are not tool descriptions. 2.G applies to all guidance and all of it is human-readable. 2.D and 2.E concern "other external software"; `lumenloop.*`, `scout.*`, and `stellarDocs.*` are operations of this server.

Against item 8 as the reviewer wrote it: no, not fully. Item 8 counts `BASE_SERVER_INSTRUCTIONS` in its byte total and says to move "the evidence-sufficiency rules, attribution rules and prior-art pass" out. `BASE` (`tools.ts:308`) holds the evidence-sufficiency and attribution rules. B1 leaves them there. Either the reviewer accepts that scope, or Arm B2 is required. This is clarification question 1 in section 9.

## 6. Sentence-level assessment of the descriptions

Legend:

- KEEP: describes function, inputs, outputs, or constraints (2.A, 2.B).
- REMOVE: tells Claude how to reason, or duplicates a schema field description.
- COMPRESS: keep the fact, drop the coaching.

### 6.1 `SEARCH_DESCRIPTION` (`src/mcp/tools.ts:218-247`)

| Line | Sentence | Verdict | Reason |
| --- | --- | --- | --- |
| 218 | "Ranked lexical search over every exposed service operation (lumenloop.*, scout.*, stellarDocs.*) and whole skill." | KEEP | What the tool does. |
| 218 | "Skill sections are exact-read affordances exposed on whole-skill hits through availableSections; they are not independent ranked hits." | KEEP | Output contract. Test pins "not independent ranked hits" (`test:124-130`). |
| 220 | "Returns ranked hits with rendered TypeScript signatures so you can call them from the execute tool without guessing." | KEEP | Output contract. |
| 220 | "Structurally poor operation pages also return bounded widerCandidates that explicitly recommend broad ... operations without changing ranking." | COMPRESS | Output schema `:182-186` already says this. One short clause suffices. |
| 220 | "Pass caller-reported exact attempted ids in recoverFrom (and optionally reason) to receive bounded recovery candidates ..." | COMPRESS | Input schema `:74-86` already says this. |
| 224-226 | "Plan which source families could ground the answer before searching:" + `FAMILY_LINE` | COMPRESS | The family line is "when to invoke" content under 2.A. Reword as a plain statement of what each family covers. Drop "Plan ... before searching". |
| 226 | "Most questions have a primary family and a corroborating one — pick both up front." | REMOVE | Reasoning directive. |
| 227 | "search once per candidate family — searches are cheap: two or three targeted queries ... beat one broad phrase. Vary vocabulary between queries ..." | COMPRESS | Keep "Targeted queries with service/kind filters work best." Drop the rest. |
| 228 | "Read the top hits' signatures and descriptions." | REMOVE | Trivial behavior instruction. |
| 229 | "Write ONE execute script that composes SEVERAL relevant operations — ... Promise.all, then ... follow-up calls ..." | REMOVE | Behavior guidance for `execute`, not `search`. Test pins it in the clipped prefix (`test:146-153`); the test must change. |
| 231 | "Match breadth to the claim: an exact directory/index lookup can answer a closed-world membership question, but an open-world identity, history, or obscure-topic question needs a broad content/research family in the same script." | REMOVE | Evidence-sufficiency rule named by the reviewer. Test pins it (`test:146-153`). Keep in `BASE` under B1; publish on `/docs`. |
| 233 | Prior-art pass paragraph ("For a design-stage request to create a new artifact, include one bounded prior-art pass ... skip it for single-step how-tos and debugging."). | REMOVE | Named by the reviewer. Test pins it (`test:99-110`). The ledger's acceptance rule "Both design targets retain prior-art adoption" then depends on `nextSteps:411` and `BASE`, which do not name the pass; only `nextSteps` does. |
| 237 | "Never guess operation or skill names — always discover them here first (or with codemode.search mid-script)." | KEEP | Exact-match constraint. |
| 238 | "Prefer targeted queries ... over broad ones, and vary vocabulary across candidate families." | REMOVE | Merged into 227. |
| 239 | "Use kind to narrow ... service to narrow ... Filter values are exact-match — an unknown service is rejected with the valid names, never silently empty." | KEEP | Input contract; supports 5.A. |
| 240 | "Each hit's tier says which scorer ranked it ... >=1.6x ... Hit order is authoritative." | COMPRESS | Keep "Hit order is the ranking to trust." Schema `:96` and `:101` already carry the tier and 1.6x rule. Test pins ">=1.6x" in the description (`test:113-121`); the test must change. |
| 241 | "truncated: true means more entries matched (total) than the page shows — if nothing here fits, search again ... before concluding the capability is missing." | COMPRESS | Keep the meaning of `truncated`. Drop "before concluding the capability is missing." Schema `:175` duplicates it. |
| 242 | "Skill hits are operational playbooks and carry availableSections — read those sections via codemode.skill.read(id, { sections }) inside execute." | KEEP | Output contract and read path. Consider "documentation playbooks" (see risk 3). |
| 243 | "A few skills are also RUNNABLE — ... codemode.skill.run("<exact id>", input) ... standard envelope." | COMPRESS | Real functionality. Bound by the leave-with-the-feature rule (`tools.ts:199-205`). |
| 244 | "Operation signatures are compact: ... a very large OUTPUT type is stubbed ... call codemode.describe("<exact id>") inside execute." | COMPRESS | Schema `:108` duplicates it. One clause. |
| 245 | "Deeper or arbitrary discovery lives inside execute: codemode.search, codemode.describe, codemode.catalog, codemode.spec ..." | COMPRESS | One line, or move to `execute` only. |
| 247 | `UPSTREAM_DOC_LINKS` | KEEP | Not required for `search` by the checklist. Harmless. Test pins it (`test:83-95`). |

Estimated size after the edit: 1,700-2,000 characters. That fits the Claude Code 2,048 clip in full.

### 6.2 `EXECUTE_DESCRIPTION` (`src/mcp/tools.ts:249-292`)

| Line | Sentence | Verdict | Reason |
| --- | --- | --- | --- |
| 249 | "Execute JavaScript in a sandboxed Worker isolate with access to the service SDKs discovered via the search tool." | KEEP | What the tool does. |
| 251 | "Calls return one text result; failures set isError. The sandbox result, console output, and thrown errors each have a separate model-boundary cap of roughly 6k tokens by default. Service-call payloads live under .data. The sandbox has no direct network access, and fetch() fails." | KEEP | Output contract and constraints. Test pins ".data" phrase in the prefix (`test:156-165`). |
| 253 | "Write an async arrow function in JavaScript that returns the result." | KEEP | Input contract. |
| 253 | "One script should compose MANY operations: broad discovery calls first (in parallel where independent), then targeted deeper calls parameterized by their results, then return one merged, compact value." | COMPRESS | Keep "A script may compose several service calls." Drop the ordering prescription. |
| 255-268 | Worked example. | KEEP | Shows actual usage. May be shortened. |
| 270-272 | Result envelope paragraph (ok/data, error kinds, soft-empty "NOT evidence", `r.ok` check, `.data` path, envelope warning). | KEEP | Mechanical contract the reviewer listed. Drop "Writes to the envelope are allowed." |
| 276 | "The ONLY globals are lumenloop, scout, stellarDocs, codemode, and standard JavaScript. There is no host, fs, require, process, or Node.js API." | KEEP | Constraint. Test pins it (`test:156-165`). |
| 277 | "Never guess method names — call an operation as <service>.<name>(args) exactly as the spec's operationId / x-execute line ... shows. Unknown names fail; there is no fuzzy resolution." | KEEP | Exact-match constraint. |
| 278 | Mid-script discovery bullet (~1,000 chars: `codemode.spec`, `codemode.search`, `codemode.catalog`, truncated/total semantics, unknown filter errors). | COMPRESS | Keep the helper API surface. Drop the repeated `total`-is-a-floor text and "Use these for follow-ups instead of ending the script early." |
| 279 | `codemode.describe` bullet. | COMPRESS | Keep what it returns. Drop "Reach for it whenever ..." |
| 280 | "Skills are operational playbooks — tested build/integration/recovery procedures: codemode.skill.read(...) ... { sections } is the ONLY option ... content sits at the TOP LEVEL ... RETURN sections or aggregates, not whole bodies." | KEEP (API and result shape) | Real read path and result shape. See risk 3 on the "procedures" framing. |
| 280 | "Pair build skill sections with stellarDocs.search_* for current reference truth." | REMOVE | Reasoning directive. |
| 280 | "When designing a new contract, app, integration, protocol, or infrastructure component, also run one prior-art pass in the SAME script: at most two scout.searchRepos/scout.searchProjects ... It is never API, security, maintenance, or production authority. Skip it for single-step how-tos and debugging; purely factual questions use docs first." | REMOVE | Named by the reviewer. Test pins it (`test:99-110`). |
| 281 | `codemode.skill.run` bullet. | COMPRESS | Real functionality; keep exact-match and envelope facts. |
| 282 | Artifact bullet ("If a returned result is truncated, the visible tail is a source-basis block ... codemode.artifact.info(id) ... codemode.artifact.read(id) ..."). | COMPRESS | Describes real output and a real API. |
| 283 | "Do NOT use fetch — the sandbox has no network access; it will throw." | KEEP | Constraint. |
| 284 | "Do NOT use TypeScript syntax ..." | KEEP | Constraint. |
| 285 | "Do NOT define named functions and then call them — just write the arrow function body directly." | KEEP | Sandbox input constraint, one line. |
| 286 | "Parallelize independent calls with Promise.all; sequence only where a call needs a previous result." | REMOVE | Fold into 253 or drop. |
| 287 | "Directory/list-style results are summaries: most services pair them with a per-item detail operation (...). When the question needs specifics beyond a list row, follow up with the detail call ... — answering detail questions from a broad payload alone is a known failure mode." | COMPRESS | Keep "List results are summaries; per-item detail operations exist." Drop "known failure mode." |
| 288 | Evidence-sufficiency bullet (~900 chars: closed-world versus open-world, wider pass in the same script, preferred broad operations, treat semantic rows as candidates, identity plus source and date). | REMOVE from the description | Named by the reviewer. Keep in `BASE` under B1; publish on `/docs`. |
| 288 | "After a successful profiled broad call, the host may append a standalone conditional checkpoint naming uncalled alternatives from the manifest recovery graph ..." | KEEP one factual sentence | The host really appends EVIDENCE CHECKPOINT and EVIDENCE RECOVERY blocks (`tools.ts:524-551`, `evidence-checkpoint.ts`). 2.B favors stating actual behavior. Suggested: "The host may append an EVIDENCE CHECKPOINT, EVIDENCE RECOVERY, CANDIDATE EVIDENCE, or PRIOR-ART CANDIDATES block after the result." |
| 289 | "Avoid lossy list filtering: inspect row keys, call codemode.describe when output fields are unclear, and filter against raw row JSON ... Projecting first can erase evidence ..." | REMOVE | Reasoning directive. `BASE` keeps a one-line form. |
| 290 | "The final return value is truncated at the configured model-boundary cap (default ~6k tokens) — select fields, slice arrays, aggregate in-script, and read skills by section rather than returning raw payloads or whole skill bodies. console.log output comes back as logs." | KEEP | Output cap and size guidance. Aligned with 5.B. |
| 292 | `UPSTREAM_DOC_LINKS` | KEEP | Required for a freeform-code tool by the checklist. |

Estimated size after the edit: 3,000-3,500 characters. No published cap applies. The Claude Code clip still cuts it; the prefix must still carry the envelope and globals rules (`test:156-165`).

### 6.3 Must-keep outside the descriptions under B1

- `BASE_SERVER_INSTRUCTIONS` (`tools.ts:304-310`): the 2,000-character contract and all pinned phrases (`test:42-58`). No published rule names it.
- `MICRO_MAP` (`src/mcp/micro-map.ts`): source descriptions and workflow archetypes. No published rule names it.
- Search `nextSteps` (`tools.ts:411-418`) and `execute` checkpoint blocks (`tools.ts:524-551`): responses, governed by 5.A and 5.B, not by description rules. See risk 2.
- Pinned skill bodies (`src/skills/source.ts`, `src/skills/scrub.ts`): tool output, not descriptions. See risk 3.

### 6.4 Tests and consumers that the B1 edit touches

- `test/mcp-instructions.test.ts:99-110` (prior-art phrases in both descriptions), `:113-121` (`>=1.6x` in `SEARCH_DESCRIPTION`), `:146-153` ("Match breadth to the claim", "needs a broad content/research family in the same script."). These assertions must move or be dropped with the sentences.
- `tools.ts:199-205` comment: one runnable-skill sentence per surface. Keep one runnable sentence in each description.
- `research/skill-run-design.md` §11 row 13 and `ARCHITECTURE.md:466` reference the description text.
- `src/demo/tools.ts:265,387` reuse both descriptions; `src/demo/prompt.ts:28` reuses `SERVER_INSTRUCTIONS`. The playground changes with B1.

## 7. Policy 2.D, 2.E, 2.F, and 5.B examined against the retained surfaces

- 2.D. `BASE`, `nextSteps`, `MICRO_MAP`, and the checkpoint blocks say "prefer `lumenloop.search_content_semantic`", "use an uncalled exact recovery candidate", and similar. These name this server's own operations. 2.D concerns "other external software". No violation on the plain text. Coupling: item 3 says 42 of 54 operations proxy third-party APIs. A reviewer who treats those as "external" would read it differently. Low risk, but tied to item 3.
- 2.E. Nothing in any surface tells Claude to avoid or override other servers' tools. "Do not conclude the capability is missing" (`nextSteps:412`) concerns this server's own search results. No violation.
- 2.F. Skill bodies are fetched at runtime from `raw.githubusercontent.com` at a pinned commit, verified by SHA-256 and git blob sha (`source.ts:45,99`), scrubbed (`scrub.ts`), and re-verified on cache hits. The description calls them "operational playbooks — tested build/integration/recovery procedures" and tells Claude to read and follow them. A strict 2.F reading could call that "behavioral instructions from external sources". Mitigations: pinned, hash-verified, human-readable, reviewed re-pinning (`ecosystem-skills/PIN-REVIEW.md`). The SDF doc already says to state this in submission notes. Framing the skills as documentation content the tool returns lowers the risk. Moderate, unresolved.
- 5.B. The literal target is per-call response tokens. Descriptions are not tool-call output. The per-call surfaces are: `nextSteps` at ~2,500 characters on every non-empty search response, plus up to one more sentence for wider candidates; `execute` checkpoint blocks at roughly 400-700 characters each when triggered. `nextSteps` restates behavior rules on every call and has no option to exclude it. That is the most literal 5.B exposure in the repo. The reviewer did not raise it. The ledger fixes `nextSteps` unchanged.

## 8. Unresolved risks

1. Scope of item 8 versus B1. Item 8's byte total and remedy include `BASE_SERVER_INSTRUCTIONS`. B1 does not change `BASE`. The reviewer must confirm whether B1 closes the item.
2. 5.B literal reading. `nextSteps` (~2,500 chars per response) and the checkpoint blocks are per-call tokens. Not raised by the reviewer. A verified-tier functional test could raise it. The ledger pins `nextSteps` unchanged, which is a policy exposure as well as an efficacy choice.
3. 2.F and pinned skills. See section 7. The description wording "procedures" that Claude reads and follows is the exposed phrase.
4. 2.D wording and item 3. Retained surfaces name third-party-backed operations. If item 3 stays open, a reviewer may read them as "external software".
5. Efficacy blind spot for the Directory's own client. `ARCHITECTURE.md:80-88` and `research/execute-output-contract-2026-08-20.md:33` record only Claude Code's clip behavior. I found no evidence whether claude.ai web or desktop injects server instructions at all. If it does not, B1 removes the evidence rules entirely for Directory users, and `BASE` protects nothing there. The paired QA must state which client path the runner emulates.
6. Shared constants. `src/demo/prompt.ts:28`, `src/demo/tools.ts:265,387` reuse the same strings. The playground changes with B1. The ledger does not list the playground as an affected target.
7. Automated scan scope. Community listing is an automatic scan. The published text does not say whether it reads server instructions. Unknown.
8. `/docs` is not ready to receive the moved rules. It carries none of the evidence, attribution, or prior-art text today. The reviewer's remedy assumes it will.
9. Acceptance-rule dependency. The ledger requires "Both design targets retain prior-art adoption" and "Narrow controls do not add a prior-art detour". After B1, the only surface that names the prior-art pass is `nextSteps:411`. `BASE` and `MICRO_MAP` do not name it. The prior-art acceptance rule therefore measures `nextSteps` alone.

## 9. Exact clarifications needed before submission

1. To SDF security (item 8 scope): "Item 8 lists `BASE_SERVER_INSTRUCTIONS` in its byte count and asks us to move the evidence-sufficiency and attribution rules out. Does item 8 close if the two tool descriptions state only function, inputs, outputs, and constraints, while the 1,986-character initialize-time server instructions keep those rules? Or must the server instructions change too?"
2. To SDF security (5.B target): "Item 8 cites Policy 5.B. Do you apply 5.B to description size, or to per-call response size? Does the `search` `nextSteps` hint, about 2,500 characters on every non-empty response, fall under it?"
3. To SDF security (item 3 coupling): "Item 3 is open. Does the submission wait for item 3, or does it go with the stellarDocs-only surface first? The answer decides whether the descriptions and server instructions may name `lumenloop.*` and `scout.*` operations."
4. To SDF security (2.F): "Skill bodies are fetched at runtime from a pinned upstream commit with SHA-256 verification. Should the tool description describe them as documentation content the server returns, and should the submission notes state the pinning and verification, to address Policy 2.F?"
5. Internal, for the ledger (efficacy): "Which client path does the paired QA runner emulate: full instruction injection, the 2,048-character clip, or descriptions only?" Risk 5 depends on the answer.
6. Internal, for the ledger (scope): "Is the `/demo` playground an affected target of B1, and does `/docs` gain the moved rules in the same change or a later one?"

## 10. Recap

The published rules apply to tool descriptions only, so B1 can satisfy them. Item 8 as written also reaches `BASE_SERVER_INSTRUCTIONS`, so B1 alone may not close it without the reviewer's agreement. The biggest unraised exposure is `nextSteps` under a literal 5.B reading. The descriptions grew since the review; `/docs` exists but does not yet hold the moved rules. No files in the worktree were changed.
