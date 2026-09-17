# Pilot trace review — M1-B1 (two cases)

- Artifact: `/tmp/raven-routing-audit-2026-09-17/repo/eval/qa/results/2026-09-17T01-33-03-variantA.json`
  - Variant A, surface `search-execute`.
  - Answer model `claude-sonnet-5`; judge `claude-sonnet-5`, rubric v2.10, pack p6.
  - Run 2026-09-17T01:12:13Z to 01:33:03Z.
- Cases: `q-tool-soroban-auth-audit-live`, `q-tw-escrow-api-auth-custody`.
- Mode: read-only. No paid calls, writes, corpus edits, Git, servers, external messages, or holdout access.
- Safe live re-reads:
  - one public `GET https://stellarlight.xyz/api/research` pair (2026-09-17T01:55:19Z);
  - three `raw.githubusercontent.com` reads of the pinned Trustless Work skill.
- Extracted rows and live responses: `/tmp/raven-routing-audit-2026-09-17/code/m1b1/`.
- The proposed Scout disposition-field finding stays **unfiled** until root reconciles the trace with the
  original Veridise source.

## Verdict

| Case | Score | Primary cause | Contributing | Golden conflict |
|---|---|---|---|---|
| `q-tool-soroban-auth-audit-live` | wrong (panel 3/3) | Synthesis: the agent projection clipped the invalid disposition, then presented header labels as current status | Possible upstream metadata gap (unverified) | None blocking; one retrieval-mechanics key fact |
| `q-tw-escrow-api-auth-custody` | wrong (panel 3/3) | Source: every Raven-served skill file forbids Bearer; current Core API docs and SDK allow it (`sk-025`) | Synthesis dropped the V1 qualifier; golden does not scope Bearer by host | Yes, minor: host or version scope |

---

## Case 1 — q-tool-soroban-auth-audit-live

Question: "What do the currently indexed primary audits say about Soroban authorization recursion or reentrancy risk?"

### Golden (excerpt)

> V2 labels the investigated authorization-recursion item **V-SOR-VUL-002** with severity Critical, but its
> valid-vulnerability summary counts zero Critical issues. V2 already judges the item invalid inline because
> error propagation makes work linear in trackers and constructing many trackers is costly. V2.1 relocates the
> same write-up to Appendix A.2.2 as **V-SOR-APP-VUL-003**. Do not present it as an active confirmed
> vulnerability or as generic EVM reentrancy.

Avoid #1: "Calls it a confirmed active critical bug while omitting the invalid disposition or zero valid-Critical count."
Avoid #2: "Claims it remains unfixed merely because no fix hash is listed."

Golden `truth.status` is `confirmed`, `asOf` 2026-08-30. Sources: the Veridise PDF (class A) and
stellarsecurityportal reports 28 and 42 (class D).

### Trace

| Step | Tool | Input summary | resultChars |
|---|---|---|---|
| 0 | ToolSearch | select Raven tools | 0 |
| 1 | search | `smart contract audit`, service `scout` | 20,598 |
| 2 | search | `Soroban authorization reentrancy recursion` | 17,483 |
| 3 | execute | 3× `scout.searchResearch` (two with `source: "audit"`) + `scout.listAudits`; projection `snippet: (x.content\|\|'').slice(0,500)` | 26,616 (host-truncated; artifact `044de08c-8126-4081-8baf-2a53fdd085c4` offered, never read) |
| 4 | execute | 4× `scout.searchResearch` (`source: "audit"`, `protocol: "Stellar Soroban Core"` for core1); projection `content:(x.content\|\|'').slice(0,1500)` | 25,821 (`artifact: absent (not-truncated)`) |

Keyword census of the stored step 3 and step 4 results:

- present: `V-SOR-VUL-002`, `APP-VUL`, `Critical`, `Investigated`, `report/28`, `report/42`;
- step 4 only: `Appendix` (2 occurrences, from other rows);
- absent: `invalid`, `Invalid`, `linear`, `A.2.2`.

### Source passages the agent received (step 4, clipped at 1,500 characters)

`report/28` row, section `V-SOR-VUL-002:`, `severity: "critical"`:

> ## V-SOR-VUL-002: # DenialofService # During # Authorization Severity Critical Commit 2674d86 Type Denial of
> Service Status Investigated File(s) rs-soroban-env/src/auth.rs Location(s) require_auth_enforcing() Conﬁrmed
> Fix At N/A … it is usually frowned upon for the function to call require auth on its own address, as this can
> lead to inﬁnite recursion. The concern here is that an attacker can abuse this frowned upon behavior … very
> little of which is metered to the caller. … 3 // The only scenario in which re-borrow might occur is when
> 4 // ‘require auth‘ is called within ‘ check auth‘ call. The tracker

The `report/42` row, section `V-SOR-APP-VUL-003:`, `severity: "critical"`, has the same header and ends at the
same clip point ("…The tracker").

### Full source passages (live re-read 2026-09-17T01:55Z, same rows)

- `report/42` `V-SOR-APP-VUL-003:` has 5,688 characters, `chunkIndex` 16, `severity: "critical"`,
  `publishedAt` 2025-09-26.
- `report/28` `V-SOR-VUL-002:` has 5,703 characters.

Past the agent's 1,500-character clip, the `report/42` row contains the page footer:

> © 2023 Veridise Inc. Veridise Audit Report: Stellar Soroban Core A.2 Invalid Issues 49

It then continues with:

> Impact An attacker could use this vulnerability to perform a denial of service attack. Why Invalid It turns out
> that a failed call to require auth in check auth will return an Err . As shown in the loop above, Err s are
> propagated up, meaning the number of iterations of this loop will be linear in the number of trackers. Because
> constructing a large number of trackers is costly to the attacker in other ways, this would be a costly attack
> to perform, and thus likely not worth it. Veridise Audit Report: Stellar Soroban Core © 2023 Veridise Inc. 50 A
> Appendix A.2.3 V-SOR-APP-VUL-004: Signature Replay Attack

The `report/28` row has the same "Why Invalid … likely not worth it" passage, followed by
"4.1 Detailed Description of Issues 15 4.1.3 V-SOR-VUL-003".

Neither retrieved row contains the valid-vulnerability summary table with zero Critical issues. That fact lives
in another chunk, and no call retrieved it.

The live response for `q=V-SOR-APP-VUL-003&source=audit&protocol=Stellar Soroban Core` has no `meta.exactMiss`.
Its `matchMode` is `vector`.

### Answer passages

> Two Veridise reports on Stellar Soroban Core — the V2 audit (report #28, published 2024-01-02) and a later one
> (report #42, published 2025-09-26) — flag essentially the same **Critical**-severity finding, tracked as
> **V-SOR-VUL-002 / V-SOR-APP-VUL-003**, "Denial of Service During Authorization" (… status "Investigated," no
> confirmed fix at time of report)

> it was still marked "Investigated"/no confirmed fix as of the later report.

> (a) **self-referential `require_auth`/`check_auth` recursion causing unmetered compute DoS** at the
> core-protocol level (Veridise, Critical, still open as of the 2025 report)

The answer correctly avoids generic EVM reentrancy framing and cites both report versions. It never mentions
the invalid disposition, the appendix relocation, or the zero valid-Critical count.

### Verdict record

- score `wrong`, coreAnswer `incorrect`, avoidMatches `[1, 2]`.
- wrongClaims: "states the Critical DoS/auth-recursion finding was 'still open as of the 2025 report' and had
  'no confirmed fix at time of report,' presenting it as an unresolved active Critical issue".
- Panel 3, no disagreement; escalation `unstable-register`, stability score 0.
- The rationale agrees with the trace.

### Root cause

1. **Synthesis (primary).**
   - Retrieval returned the correct primary rows, and the rows contain the disposition.
   - The agent's own projection (`slice(0,1500)`; `slice(0,500)` in step 3) removed "Why Invalid" and the
     "A.2 Invalid Issues" footer.
   - The agent ignored the artifact offered for step 3.
   - The answer then read the header labels (`Severity Critical`, `Status Investigated`,
     `Conﬁrmed Fix At N/A`) as current status and added "still open". That claim appears in neither source.
2. **Upstream metadata (contributing; proposed, unverified, unfiled).**
   - Scout marks the invalid appendix item `severity: "critical"` and exposes no validity or disposition field
     (`docKind`, `docVersionStatus`, and `capStatus` are null).
   - The disposition exists only as prose deep in the chunk.
   - This may be a faithful copy of Veridise's own label, so it is not yet a defect.
   - Before any filing, root must reconcile the trace with the original Veridise PDF
     (`https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf`) and the stellarsecurityportal
     report API.
   - No active improvements finding covers it; `improvements/resolved.json` holds only the earlier Veridise
     exactMiss fix.
3. **Retrieval:** no defect. The correct rows ranked first under the audit and protocol filters.
4. **Golden:** no conflict with the source.
   - The inline invalid disposition is confirmed in both rows.
   - The zero valid-Critical count was not re-read in this review.
   - Design note: key fact 4 ("Scout now retrieves V-SOR-APP-VUL-003 without `meta.exactMiss`") grades
     retrieval mechanics rather than audit content. It did not decide the score.
5. **Judge:** no defect.

---

## Case 2 — q-tw-escrow-api-auth-custody

Question: "How do requests to the Trustless Work escrow API authenticate, and who signs and submits the escrow transactions it builds?"

### Golden (excerpt)

> As of 2026-09-16, authentication depends on the Trustless Work API surface. The pinned skill says to send
> `x-api-key` on every request. The current Core API documentation and JavaScript SDK also permit a
> wallet-session token in `Authorization: Bearer <jwt>`. … The pinned V1 skill uses `/helper/send-transaction`;
> the pinned V2 skill and current Core API use `/stellar/send-transaction`. The API does not sign transactions
> for the caller.

Avoid #1: "All current Trustless Work API requests must use x-api-key, and bearer authentication is never accepted."

Notes: "Naming x-api-key as a valid documented method satisfies the authentication part unless the answer
falsely claims exclusivity. Bearer support is not a required key fact."

- `truth.status`: `disputed`, `asOf` 2026-09-16.
- Class A sources: `https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/introduction` and `…/stellar/send-transaction`.
- Class B sources: the SDK `http-transport.ts` at `4121f925`, and the pinned skill `constitution.md`,
  `skills/api/core-concepts.md`, and `skills/api/v2/core-concepts.md`.

### Trace

| Step | Tool | Input summary | resultChars |
|---|---|---|---|
| 0 | ToolSearch | select Raven tools | 0 |
| 1 | search | `Trustless Work escrow API authentication` → top hit `skills.trustless-work.trustless-work-dev` | 22,451 |
| 2 | search | `Trustless Work escrow sign transaction` → same top hit | 16,285 |
| 3 | execute | `codemode.skill.read("skills.trustless-work.trustless-work-dev", { sections: ["common-transaction-flow", "api-base-urls", "gotchas", "file:skills/api/core-concepts.md"] })` | 16,077 |

`availableSections` in the step 3 result included `file:skills/api/v2/core-concepts.md`,
`file:skills/js-sdk/js-sdk.md`, and `file:skills/protocol/v2.md`. None were read.

### Source passages the agent received (step 3, pin `634f32bd4be6769b0cae52e72db4899d5f5a069c`)

`gotchas` (SKILL.md):

> - **Header is `x-api-key`**: Not `Authorization: Bearer` for the V1 API-key requirement. This is the single most common auth mistake.

`api-base-urls` (SKILL.md):

> All endpoints require: `x-api-key: YOUR_API_KEY` header

`common-transaction-flow` (SKILL.md):

> 1. Call API endpoint → Get unsigned XDR transaction 2. Sign with the signer authorized for that operation → Create signed XDR 3. Submit via `/helper/send-transaction` → Broadcast to Stellar

`file:skills/api/core-concepts.md`:

> **Protocol version: V1.** This file documents the production V1 integration — the only version deployed on
> mainnet. The V2 Core API is documented separately in [skills/api/v2/](v2/) …
> ## API Authentication All API requests require an API key header: ``` x-api-key: YOUR_API_KEY ```

### Pinned sources not read by the agent (safe re-read, same pin)

`trustless-work-dev/skills/api/v2/core-concepts.md`:

> line 30: `x-api-key` on **every** request, including reads. Never `Authorization: Bearer`.
> line 50: 3. **Submit** — `POST /stellar/send-transaction` with the signed XDR.
> line 52: The submit route differs from V1, which documents `/helper/send-transaction`. In the v2 API there is no `helper` controller.

`trustless-work-dev/skills/js-sdk/js-sdk.md` line 42: "`apiKey` | `string` | Sent as `x-api-key`. Required for writes."

So every Raven-served skill file, V1 and V2, forbids or omits Bearer. Bearer support appears only in the official
Core API documentation and the JS SDK source cited by the golden and by `sk-025`. Raven does not serve those.

### Answer passages

> Every request to the Trustless Work escrow API is authenticated with a static API-key header: … `x-api-key: YOUR_API_KEY`

> This applies uniformly to mainnet (`https://api.trustlesswork.com`) and testnet
> (`https://dev.api.trustlesswork.com`) — there's no `Authorization: Bearer` scheme (that's flagged in the
> skill's "gotchas" as the most common auth mistake).

> 3. **The signed XDR is submitted back to the API** via `POST /helper/send-transaction`, which broadcasts it to the Stellar network.

> The API itself never holds custody or signs anything — it's non-custodial.

**The answer does not claim V1-only scope.** It never mentions V1, V2, or the beta host. It drops the source's
qualifier "for the V1 API-key requirement". It states exclusivity as a general rule, "Every request … there's no
`Authorization: Bearer` scheme", and names only the V1 mainnet and development hosts. The custody and signing
content is correct.

### Verdict record

- score `wrong`, coreAnswer `correct`, avoidMatches `[1]`.
- wrongClaims: "Claims there is no Authorization: Bearer scheme for the Trustless Work API at all, stated as a
  general/current fact rather than scoped to the pinned V1 skill".
- missingFacts: Core API and SDK Bearer permission.
- Panel 3, no disagreement; escalation `boundary-wrong-claim`.
- Rationale error: it says the answer gave "submission via /helper/send-transaction scoped to V1". The answer
  contains no V1 scope.

### Root cause

1. **Source (primary): already tracked as `sk-025`**
   (`improvements/skills/sk-025-trustless-work-beta-auth-scope.md`, `reported-upstream`, Trustless-Work/trustlesswork-skill issue #6).
   - The pinned skill forbids Bearer in V1 and V2 guidance.
   - The official Core API introduction and SDK transport permit a wallet-session Bearer token.
   - The answer's exclusivity claim matches every Raven-served source.
   - In the candidate worktree, root has already added this run (row `q-tw-escrow-api-auth-custody`) as
     `sk-025` recurrence evidence.
2. **Synthesis (secondary).**
   - The agent generalized a V1-qualified gotcha into a universal rule ("applies uniformly").
   - It did not read the listed V2 section.
   - Reading it would not have produced Bearer support, but it would have exposed the V1/V2 route difference.
3. **Golden conflict (minor, host or version scope).**
   - `sk-025` says the evidence "does not establish bearer support for the separate V1 mainnet or development
     hosts". Bearer documentation applies to the Core API beta profile (`beta.api.trustlesswork.com`).
   - The golden answer ("The current Core API documentation and JavaScript SDK also permit … Bearer") and
     avoid #1 ("All current … requests … bearer authentication is never accepted") do not name the host or
     version. An answer correctly limited to the V1 hosts could still trigger avoid #1.
   - Here the answer's unscoped "Every request … no Bearer" makes the match defensible.
   - A `golden-truth` pass should scope the Bearer statement and the avoid item to the Core API beta host or
     V2 profile. It should also state that V1 host Bearer acceptance is unestablished.
4. **Judge (minor).** The rationale contains one false description of the answer ("scoped to V1"). The score
   follows correctly from the avoid match.
5. **Retrieval:** no defect. The correct skill ranked first, and the relevant sections were read.

---

## Follow-up proposals (not executed)

- **Own-repo (`.agents/TODO.md`):** agent-facing composition guidance should say not to clip row content before
  checking disposition or status markers (for example "Why Invalid", "Invalid Issues"). When a host artifact is
  offered, the agent should read it. Measure through the eval gates; no per-query rule.
- **`golden-truth`:**
  - Scope the Trustless Work Bearer statement and avoid #1 to the Core API beta host or V2 profile.
  - Consider replacing the Soroban audit case's retrieval-mechanics key fact with an audit-content fact.
- **`improvements-pipeline`:** a candidate Scout finding, "invalid appendix audit items carry
  `severity: critical` with no validity/disposition field", stays **unfiled and unrecorded** until root
  reconciles this trace with the original Veridise PDF and stellarsecurityportal report 28 and 42 data.
- **`sk-025`:** no new filing. Local recurrence evidence only; follow the no-noise rule on issue #6.

## Coordinator disposition

The audit finding is an answer-side projection failure. The retrieved source includes the invalid disposition.
No Scout contract requires a separate validity field, so this trace does not establish an upstream defect.
Do not add finding-specific markers or a new truncation prompt from this single case.
The existing artifact and source-inspection guidance remains applicable.

The Trustless Work answer lacks a V1 qualification and states broad authentication exclusivity.
The golden already names separate API surfaces and does not require Bearer as a key fact.
This trace does not establish Bearer support on V1 hosts or justify another golden change.
The source defect remains sk-025, with no duplicate filing.
