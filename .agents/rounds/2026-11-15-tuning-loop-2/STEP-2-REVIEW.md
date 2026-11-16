# Review: step 2 of the second tuning loop (delivery text, the `stellarOrg` source, seven cards)

Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), a fresh session, effort high. Author: Claude Sonnet 5.5 (`loop2-impl2`).
Orchestrator: Claude Fable 5.2. Tier: Claude Opus, the stable fallback. The matched tiers were skipped: Fable (product and
API text) is the orchestrator, and Codex frontier (adapter and security) was not used because the orchestrator launched
this lane as a Claude session. The vendor-diverse attack on the adapter that `SORG-REVIEW.md` left open is still open.

Scope: `tune/loop-2` at `79034181`. I read `PLAN.md`, `PLAN-REVIEW.md`, `PLAN-AMENDMENTS.md`, `STEP-1-REVIEW.md`,
`STEP-2-IMPL.md`, the round ledger, `P0.md` and `P1.md` (from `origin/tune/loop-2-runs`), the diffs of `0b07783a`,
`2796299c` and `160cd1fa`, and `SORG-REVIEW.md` on `origin/feat/stellar-org-source`. I made no model call and spent
nothing. I read case metadata for the 58 panel ids only, selected by id from `scans/panel-ids.txt`. I opened no
golden answer, key fact, transcript, held-out row or reserve row. Routing rows were read as aggregate counts only, and
no script of mine printed a routing row id. I made four keyless calls to stellar.org's site search from this
workstation, for the `detail` check (S1), with generic queries that come from no case. Scratch files and a scratch
worktree lived in my scratchpad and were deleted. This file is the only change.

## Verdicts, per commit

| Commit | What | Verdict |
|---|---|---|
| `0b07783a` | Item 4, delivery text | **Fit to measure.** Every length passes, the first lines are whole sentences inside 117 characters, no contract sentence is lost, and R7 holds. Two non-blocking notes (S4) |
| `2796299c` | Item 2, the `stellarOrg` source (merge) | **Fit to measure.** The adapter, spec, adapter tests, `wrangler.jsonc` and `env.d.ts` are byte-identical to the reviewed branch tip `b81e7a03`. Every earlier fix survived, and every adversarial input I re-ran holds. The fetch boundary is unchanged and the merge adds no egress, secret or binding. **Two fixes, preferred before P2 but not blocking:** S1 (the `detail` sentence fires on results that have no page row) and S2 (a zero-row site search is reported as closed-world `no-rows`) |
| `160cd1fa` | Item 3, seven cards | **Fit to measure.** The largest default page is under every measured client clip |
| `b3709f74`, `6523ee6e` | Scans, live checks, guard test | **Fit.** Each selects tuning ids before it reads any other field. The routing comparison is aggregate only |
| P2 command (`STEP-2-IMPL.md` section 8) | | **Fit to launch, with three reading rules added before launch (S5).** If S1 or S2 lands, recompute the surface pin and replace the code-identity commit `160cd1fa` |

**Decisions the orchestrator asked me to make:**

- **R8:** `stellarOrg` stays out of `CORROBORATING_FAMILIES`. The code does not change. The P2 read gets one rule, given
  below.
- **The `detail` edge:** keep it, with S1.
- **The predicted intrusions:** do not change the description before P2. P2 measures it as is, with the watch in S3. The
  implementer's cause is right for one of the three rows only. The other two come from two scorer mechanisms the record
  misses.

## Findings

### S1 (medium; fix before P2 preferred, before the keep commit required). The `detail` sentence fires when no hit has a `path`

The run-time edge check (`detailTargetsFromSources`, `src/catalog/search.ts`) works on operation ids. It never looks at
rows. Every ok `stellarOrg.search_site` result with rows therefore gets this sentence:

> `stellarOrg.search_site` returned page rows, not whole pages. … read the page: `stellarOrg.get_page({ path })` with that hit's `path`.

Only `page` rows carry `path`. Audit, tutorial and partner rows do not. I ran a live keyless check: the query `OtterSec`
returned 8 audit rows and 1 partner row, and no row had a `path`. `Veridise audit` returned 6 audit rows and 1 page row.
An auditor-name query is how audit questions start, and audits are a top owner category. On these results the sentence
calls the rows page rows and points the agent at a `path` that no hit has. The record a reader would want is
`reportUrl`, which no operation reads. At best the agent wastes a call. At worst it reads `/audit-bank/projects`, which
renders only its first page on the server, and takes a partial list for the whole register.

**Fix (general, no source named):** count a call as a `detail` source only when at least one returned row carries
every join key of the edge. Record that fact when the call is logged (for example, a boolean beside `hasServiceData`
in the ledger), and filter `sources` with it in `evidenceRecoveryHint` (`src/executor/run.ts`). Unit cases:

- `search_site` returns only audit rows: no `stellarOrg` detail sentence.
- `search_site` returns a page row: the sentence, as now.
- A Docs search: the result is byte-identical to now. Every Docs search row carries its keys, and the existing pin
  test holds.

The `part` nouns can stay.

### S2 (low; fix with S1 or at the keep commit). A zero-row site search reads as closed-world `no-rows`

When `results` is empty, `search()` returns ok `{ hits: [], meta: { candidates: 0 } }`. The host then marks it
`caveat: "no-rows"`, which the `execute` description defines as "true only at that source's scope".
`SORG-REVIEW.md` (G3) found that the site search sometimes returns an empty list for a valid query: 2 of the 80
snapshot responses, and neither reproduced live. That earlier review asked for a description note. The note was not
added, and the spec text still names only the filter reason.

The hard rule is to keep soft-empty, error and data distinct. **Fix (in `search()` of `src/adapters/stellar-org.ts`):**
when `body.results.length === 0`, return:

```ts
errResult({ service: SERVICE, kind: "soft-empty",
  message: "stellar.org site search returned no rows for this query.",
  hint: "The site search sometimes returns no rows for a valid query. Retry once or use another family; this is not evidence that SDF has no page on the topic." })
```

When rows came back but all were filtered out (`candidates > 0`, `hits` empty), keep ok with `no-rows`. That result is
correct at the source's scope. Add one adapter test for each case.

S1 and S2 must land **before the 12-row reachability record is read**: the amended plan (Q4) freezes the adapter and
the descriptions at that point. If they land, re-run the gates, recompute the P2 surface pin, and change the P2
command's code-identity commit from `160cd1fa` to the new commit.

### S3 (decision). The intrusions: measured, and why the description should not change before P2

**How often a `stellarOrg` operation enters the page, and what it displaces.** I compared the pre-merge catalog
(`0b07783a`) with the tip. Each set below was measured separately:

| Set | Limit 5 | Limit 7 | Limit 8 to 10 |
|---|---|---|---|
| The 58 panel questions, asked as written | **0** rows | 1 row, a source row (`q-raph-official-help-sdf-cannot-recover`, at rank 7, displaces `stellarDocs.search_asset_token_docs`) | — |
| Stored P0 and P1 agent queries (`roles.json`) | — | — | 5 rows, 3 of them non-source, all at the limits the agent chose (8 or 10) |
| Routing rows, aggregate (the implementer's count; the gate exits 0) | 8 of 544 top-five lists gain a `stellarOrg` operation. They displace 5 Docs, 3 Lumenloop and 1 Scout operation. 0 grade changes, 0 top-1 changes | — | — |
| A probe of 30 generic questions I wrote and classified before running (15 security, 10 app development, 5 where SDF's site is plausibly useful) | Non-SDF questions 0 of 25; SDF questions 2 of 5 | Non-SDF 1 of 25; SDF 2 of 5 | Limit 10: non-SDF 3 of 25, SDF 4 of 5 |

On the panel questions and the generic probe, the source does not enter the top five on any question outside its
scope. Above the default, it sometimes does. At limit 10, the probe question "soroban security best practices" loses
the OpenZeppelin `develop-secure-contracts` skill to `search_site`. That is security-category cost, at the tail of the
page, at the limit the agent uses three times in four.

**Causes. The implementer names one; there are three.**

1. **The description's words** ("Soroban Security Audit Bank", "security-audited") pass the lexical gate on Soroban
   security queries. This explains the probe's security displacements and `q-soroban-reentrancy` at limit 5 and 7.
2. **The id token `org`.** The vendor scorer counts a prefix match in either direction (`c.startsWith(token) ||
   token.startsWith(c)`, `src/catalog/vendor/search-scoring.ts`), with no minimum length. The id token `org` therefore
   matches every query word that starts with "org". "which organizations run validators" puts `stellarOrg.get_page`
   at rank 1. `q-protocol-tier1-requirements` ("Tier 1 organization …") gets `get_page` at rank 1 and `search_site` at
   rank 2. Without the word "organization", that query has no `stellarOrg` operation at all. This is a top-1 change on
   a network-operations question. No description edit can remove it. One panel question of 58 contains an `org…`
   word.
3. **Gate fill.** On "soroban reentrancy security" at limit 8, `stellarDocs.search_soroban_contract_docs` scores
   highest of any operation (111). It fails the gate and used to reach the page through tier-2 backfill, which runs
   only when the gated page is short. `search_site` passes the gate with a weak score (47), the gated page fills, and
   the Docs operation drops off. P1's script for `q-soroban-reentrancy` called that Docs operation. Causes 2 and 3 are
   properties of the ranker. Any new family can trigger them.

**A reworded description would not be a clear gain.** I tried replacing "the Soroban Security Audit Bank and its
security-audited projects list" with "the Audit Bank and its audited-projects list", in a scratch worktree, catalog
rebuilt by its script.

- What it fixes: no non-SDF security displacement at limit 7, 1 of 25 non-SDF intrusions at limit 10 (not a security
  question), and the reentrancy page restored.
- What it costs: off-golden reach falls from 8 to 6 of 40 (questions, limit 5) and from 14 to 13 of 40 (keyword form).
  The SDF questions in the probe at limit 10 fall from 4 to 2 of 5. The lost questions are "how do I get my contract
  audited" and "which firms audit Soroban contracts". Those are audit questions too.
- What it leaves: causes 2 and 3.

The reword moves cost from one set of audit-category queries to another, and choosing it means tuning tokens against
the scorer. That is the fitting the owner forbids, not a cure for it.

**Answer to "is this the expense the owner forbids".** It is a real cost in the owner's first category: one or two
displacements per 25 security queries, at page tails, at limits above the default. It is not large enough to block,
and the levers that would remove it are ranking changes (causes 2 and 3), which the plan holds under PH3. **P2
measures it as is.** P2 cannot see an effect this small (T = 5 on 58 rows), so P2 is a check for gross intrusions
only. Pre-register the following before launch:

- Watch rows, read from both transcripts whatever their verdict:
  - `q-soroban-reentrancy`, `q-protocol-tier1-requirements`, `q-ti-parse-raw-ledger-data`;
  - every row whose `search` page in P2 carries a `stellarOrg` card at a rank above a card that the row's P1 script
    called.
- Report the number of source-exposed rows outside the 12, and the rank of each `stellarOrg` card.
- Q6's remedy (scope text in results) fixes a wrong call, not a displaced card. If P2 shows two traced displacements,
  the remedy is a ranker change, not a description edit or result text.

**Forward (for `.agents/TODO.md`; the orchestrator owns that file):**

- Require 4 or more characters for the vendor prefix rule, as `tokensOverlap` already does.
- Let a gate-failed candidate whose score beats the page's weakest gated card keep its slot when the page is full.

Both are general ranker changes. Each needs the routing gate, and the off-golden 40 serve as the source's acceptance
check. If the orchestrator still wants the description changed before P2, the text above is the one I measured.
Changing it reopens the off-golden 40 as the acceptance test, never the 12 rows.

### R8 (decision). SDF's own site and the four claim kinds

**Rule: `stellarOrg` stays out of `CORROBORATING_FAMILIES`, and no code changes.** Every `stellarOrg` result keeps
the 417-character guard line. That is correct in substance:

- The guard covers only audit, incident, governance and standards-authorship claims.
- Its "primary record a result returned (… the decision record)" already admits a page in which SDF states its own
  decision.
- For audit register rows it produces the right answer: "SDF's Audit Bank register lists an audit of P by F (report
  link)", not "P is audited".

Making the site official by data would let SDF's statements about network governance, about its own security record
and about third-party audit scope pass as fact. That is A2's class 3.

**Exact rule for the P2 claim read.** Add it to `eval/qa/claim-read-brief.md` after the support-class list, before P2
is read. Apply it to every run read from now on. It changes no P0 or P1 call, because neither run had a `stellarOrg`
result.

> **stellar.org (`stellarOrg`) results.** A `stellarOrg.get_page` result is class 2 for SDF's own programmes and
> organisation as SDF states them: a programme's terms, eligibility, amounts and process (SCF, the Audit Bank,
> grants), the membership of SDF's own registers as registers ("listed in the Audit Bank's audited projects"), and
> SDF's mandate, strategy, roadmap, structure and team. It is class 3 for anything else SDF says about the four claim
> kinds: a network-governance outcome (a protocol upgrade, a CAP or SEP status, a validator vote), the security or
> incident record of SDF's products or of the network, standards authorship, and any audit conclusion beyond the
> register entry (that P "is audited" today, an audit's scope or findings). A `stellarOrg.search_site` row (a title, a
> description of up to 500 characters, or an audit-register record with a report link) is class 4 for every claim
> kind: it is a listing, and the report it links was not returned. A statement that attributes an audit to the
> register ("SDF's Audit Bank register lists an audit of P by F", with the link or a date) is attributed and is not a
> violation.

P2's over-hedging check (H1, H2 on source-exposed rows) is the test of whether the guard line makes the agent hedge an
SDF programme fact. That is the one way this ruling could cost answers.

### S4 (low, item 4). The first lines read alone

Each line below was read as if the model sees nothing else:

- **Instructions, 133 characters:** "Unified Stellar-ecosystem gateway: `search` discovers service operations and skills.
  `execute` composes them in sandboxed JavaScript." It says what the server is, the domain, and the order (search,
  then execute). Whole in Codex's catalogue line (201 or more).
- **`search`, 116 characters:** "Ranked search over lumenloop, scout, stellarDocs and stellarOrg operations and skills.
  Hits are cards, not evidence." It says what the tool is and gives the evidence contract. It does not say when to use
  it or what comes next. The `execute` opening supplies the order. I measured four rewrites that add the domain or
  the next step: they need 123 to 136 characters, because A5 and R7 require all four family names (44 characters).
  The line is the best that fits. Keep it. A fifth family makes the generator fail loudly, which is intended.
- **`execute`, 115 characters:** "Run one JavaScript async arrow function in a sandbox with no network. It calls only
  operations found with `search`." It says what the tool is, when to use it (after `search`), and the first step. Read
  literally, "calls only operations" excludes the `codemode` helpers. The globals sentence after the break names
  `codemode`, and a model that sees only 117 characters does not call helpers before it opens the description. No
  change.

**Lengths, assembled from the modules at the tip (my measurement agrees with the record):**

| Text | Length | 4,096 | 2,048 | Grok 2,033 | OpenCode 117 (first line) |
|---|---:|---|---|---|---|
| Instructions | 1,899 | pass | pass | pass (134 under) | first line 133; OpenCode does not list it; Codex limit 200 met |
| `search` | 1,960 | pass | pass | pass (73 under) | 116, ends `evidence.`, then a line break |
| `execute` | 1,964 | pass | pass | pass (69 under) | 115, ends `` `search`. ``, then a line break |

**No contract sentence was lost or weakened.** I diffed the descriptions sentence by sentence from the step 1 tip
`42a46274` to the tip:

- `search`, "every exposed service operation (…) and whole skill": the family names now carry the scope. That skill hits
  are whole skills is still stated in the Hits paragraph ("Skill hits list `availableSections`").
- `search`, "Hits are cards to compose in `execute`; they are not evidence" became "Hits are cards, not evidence". The
  composition rule survives in Workflow step 3.
- `execute`, "It can call only the operations found with `search` (`lumenloop.*` …) and the `codemode.*` helpers" became
  "It calls only operations found with `search`". The restriction is unchanged. The namespaces and `codemode` are in
  the globals sentence, which now also names `stellarOrg`.

Every other sentence is byte-identical, and the instructions hash is unchanged (`67a6bd0b…6c00`). R7 holds: the opening
names all four operation families, and it is generated from the manifest.

**Unverified until the probe harness runs against this tip, or until a Codex or Grok runner exists:**

- Delivery, per client: Codex's catalogue line whole; OpenCode's two listings ending at the sentence end; Grok
  receiving both descriptions whole. Each is arithmetic against measured limits, not a session.
- Behaviour, per client: whether any of this changes an answer on Codex, Grok or OpenCode; whether a Codex model
  prints `ALL_TOOLS`; whether an OpenCode model reads past 117 characters; whether those clients pass `limit`, which
  decides how much seven cards matter to them.

The probe uses subscription CLIs. Plan section 6 schedules it after step 2. Run it on this tip before the keep commit,
under its own authorization line, because it calls models.

### S5 (P2 reading; fix the reading before launch). Control = P1 pass 1 can mislead in both directions

- **Regression to the mean, on source rows in particular.** P1 differs from P0 by 8 flips, all untraced or noise.
  Two of them are source rows:
  - `q-hot-sdf-xlm-holdings-sales`: up in P1 by retrieval variance;
  - `q-asset-usdc-eurc-issuer`: down in P1 by judge tier.

  Against P1 alone, a return to P0's verdict reads as source harm (the first row) or source gain (the second).

  **Rule:** for every row that changed between P1 and P2, report the P0, P1 and P2 verdicts and tiers. A row whose P2
  verdict equals its P0 verdict, after a P1 move that the P1 trace classed as noise, is reported as "returned". It
  counts only if the P2 transcript traces it: a fact in a `stellarOrg` result for a gain, or a displaced or wrong call
  for a harm.
- **Tier churn.** 14 of 58 rows changed judge tier between P0 and P1, and 6 of the 8 flips were tier changes. Read the
  tier-matched net first. A result that reaches T only on all rows is "no decision" (A4).
- **Source gain rests on 12 single samples** (A10 cut the repeat passes). Report it as counts. It is not evidence that
  the source improves answers.
- **The reachability record has not run.** The orchestrator has ruled it may run. Run it before P2, after S1 and S2
  land, because reading it freezes the adapter. Otherwise no source row can be marked unreachable, and a row that
  cannot move counts against the source.
- **The cap margin.** USD 14.5 against P1 pass 1's measured USD 12.02 is a 21% margin. A cap stop voids the run with
  no resume. The plan's rate of USD 0.25 per case gives 14.5 for 58 rows, so a higher cap needs the orchestrator's
  word. Keep 14.5 only if the orchestrator accepts that risk.

**What a P2 result must not be read as:**

- Evidence that the source improves answers.
- Evidence that the source causes no displacement harm. S3's page-tail effect is below what P2 can detect, and the
  panel holds one `org…` question.
- Evidence about seven cards' benefit. It was decided on free evidence (Q2), and P2 has 0 or 1 seven-used rows.
- Evidence about delivery or answers on Codex, Grok, OpenCode, the Playground or claude.ai.
- Evidence that Worker egress works through the adapter's own code path. A7 tested the account's Workers, not this
  adapter.
- A separation of the delivery text from item 2's always-on description text (A8).

## The checks

### 1. Item 4

See S4. `test/mcp-instructions.test.ts` replaces the 2,048 and 2,000 constants with Grok's 2,033 and adds three tests:
the 200-character first line, the 117-character first line followed at once by a line break, and the opening naming
every operation family. The generator rejects an overflowing or malformed template. None of these tests was weakened.

### 2. The `stellarOrg` merge

- **Identity.** `git diff b81e7a03 HEAD` is empty for `src/adapters/stellar-org.ts`, `src/adapters/index.ts`,
  `specs/stellar-org.json`, `test/stellar-org-adapter.test.ts`, `wrangler.jsonc` and `env.d.ts`.
- **The earlier fixes, present:**
  - `PATH_RE` without `%`;
  - `TAG_RE` with `[^<>]*` and `(?![\w-])`;
  - the title regex `/<title\b[^<>]*>([^<]*)<\/title>/i`;
  - `OPERATION_BUDGET_MS` of 24 s;
  - `readCapped` on the search body;
  - descriptions cut at 500 characters;
  - the soft-empty for an empty page;
  - the split redirect messages;
  - the lower-case filter for blog, press and events;
  - `reportUrl` rejecting userinfo and capping on `url.href`;
  - the audit, tutorial and partner rows.

  The title cap of 300 that G2 suggested was not applied, and the earlier record discloses that. A 200,000-character
  title still passes through `search_site`. The host's 6k-token return cap bounds it. Low.
- **Adversarial inputs, re-run through `callStellarOrg` with a fake fetch (Node 26).**
  - Path guard: all 26 inputs from F1, the F1 re-run and the generality review are refused **with 0 requests sent**.
    The list: encoded dots and letters (`%2e`, `%2E`, `%61`), double encoding, `%2f` and `%5c`, `%00`, `..;`, an
    interior tab, a zero-width space, a fullwidth solidus, `//evil.com`, `/\evil.com`, `@`, `?`, `#`, `/./`, `/..`, a
    full URL, `/api`, `/api/search`. The known residue holds: `/API/search` sends one request to stellar.org, as
    recorded (G4, the owner's call).
  - Regex timing at 1.5 to 1.9 MB:

    | Input | Time |
    |---|---:|
    | Unterminated comments | 5 ms |
    | `<a ` repeated | 132 ms |
    | `<title ` in the head, and after `<main>` | 16 ms, 5 ms |
    | `<a-a-a…` | 24 ms |
    | `<title-` repeated | 5 ms |
    | `<li>a</li>` repeated | 198 ms |
    | `<svg>` repeated | 82 ms |

    All are linear.
  - `reportUrl`: userinfo (both forms), a 2,014-character U+202E path (whose `href` grows past 2,048), `javascript:`
    and protocol-relative URLs are dropped. An upper-case scheme and host are normalised.
  - Tutorial and partner rows: off-origin, encoded and spaced slugs are dropped. Userinfo on a stellar.org URL is
    rebuilt clean. Two category rows for one partner merge into one hit.
  - Page rows: `/BLOG/x`, `/blog/x`, off-origin and `/api` rows are dropped.
- **Boundary.**
  - `callStellarOrg` receives no `env`, so no secret reaches it.
  - The origin is the constant `https://stellar.org`. Redirects stay same-origin, capped at 3 hops and 24 s.
  - `globalOutbound: null` in both sandboxes.
  - `wrangler.jsonc` and `env.d.ts` are unchanged since `main`.
  - The callable-reference guards include `stellarOrg` (`build-micro-map.mjs:80`, `build-catalog.mjs:1266`).
- **Envelope.**
  - A missing page is soft-empty; a page with no server-side text is soft-empty; a bad path or redirect is an error;
    an off-type or oversize body is an error.
  - A search whose rows were all filtered out is ok with `no-rows`, which is correct at the source's scope. A search
    that returned no rows at all is the gap S2 fixes.

### 3. The intrusions

See S3. I selected the panel questions by id from `scans/panel-ids.txt`, asserted 58, and read only their `question`
field. For routing rows I used the implementer's aggregate.

### 4. R8

See R8 above.

### 5. The `detail` edge and its per-edge nouns

**Keep both.**

- The edge is general: it is the catalog's own `detail` relation, the mechanism loop 1 kept for Docs (#446).
- For page rows it is the right instruction. A site-search row is a title and at most 500 characters of description,
  and strategy, roadmap and programme facts live in the page.
- The optional `part` keeps the Docs sentence byte-identical, and a test pins it. It costs one optional schema field.

The one defect is S1.

### 6. Seven cards

- **Page sizes against each client's clip:**

  | | Mean | p90 | Max |
  |---|---:|---:|---:|
  | Default page, 460 routing questions (the record's measurement) | 8,889 bytes | 11,616 bytes | 16,839 bytes |
  | Panel questions, my measurement | | | 12,520 bytes at limit 7 |

  | Client | Clip | Default page |
  |---|---|---|
  | Grok | 20,000 bytes | under |
  | Claude Code | warns at 10,000 tokens, caps at 25,000 | about 4,200 tokens at most |
  | Codex | 10,000-token print budget | under |
  | OpenCode | 400 lines or 51,200 characters | under; a search result is one line of compact JSON, so the 400-line clip never applies |

  The 51,200-character limit matters only at limit 50: the largest panel page there is 47,960 bytes. That is not
  related to seven cards.
- **Cost per question.** Measured on Claude Code: 0.11% (P0) and 0.14% (P1) of input tokens, at most 1.5% on any row.
  For a client that never passes `limit`, about 1 to 3% (an estimate, as the plan review gave it). Both are under the
  5% bar.
- **Confounding.** The default governed 10 of 58 rows in P0 and in P1. Seven-used: 0 rows in P0, 1 in P1. In both
  sets: 0. Bundling costs the source reading at most a row or two, through the "both" rule. P2 is a harm check for
  seven cards, not a measure of their benefit.

### 7. Generality and leakage

- The lines the step adds under `src`, `scripts`, `specs`, `catalog/manifest.json` and `wrangler.jsonc` (1,464 lines,
  from `42a46274` to the tip) hold no case id.
- Compared with all 247 case questions as an aggregate: no shared 5-word shingle. Three questions share a 4-word
  shingle, and in each it is "the Stellar Development Foundation", the organisation's name.
- The scans select `sets.tuning` ids, or the committed panel ids, before reading any other field
  (`scan-step2-roles.mjs` through `tuningIdsOf` and `selectById`). The page-size test writes aggregates only.
- The routing comparison and the `eval/gates.json` note give counts only. No step 2 artifact names a routing row.

### 8. Gates, bare, on `79034181`

Each gate ran with its output to a file, so the exit code is the command's own. The Worker at `79034181` is
code-identical to `160cd1fa`.

| Command | Exit | Detail |
|---|---:|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 163 files passed, 5 skipped; 3,596 passed, 3 expected fail, 5 skipped |
| `npm run build` | 0 | |
| `npm run test:smoke` | 0 | 9 files, 144 tests |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS — legacy 338 within band, skills lane at/above floor, holdout lane at/above floors …` |
| `npm run secrets:scan -- --tree` | 0 | |

The tree was clean afterwards.

### 9. The P2 comparison

See S5. Once the reading rules there are in the ledger, the command is fit to launch, with the pins recomputed if S1
or S2 lands. The comparison is the right control for a step whose predecessor was kept (A8 and T as ruled). It
measures harm on the step's changes together, on Claude Code with Sonnet 5.5 only.
