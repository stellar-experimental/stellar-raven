# Connector Directory item 8 technical review

Revision: `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.

## Evidence sources

Observed on 2026-08-26:

- [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy).
- [Connector review criteria](https://claude.com/docs/connectors/building/review-criteria).
- [Connector submission guide](https://claude.com/docs/connectors/building/submission).
- Repository surfaces at the pinned revision above.

The private SDF Google document informed the round scope. It is not a public verification source.

## Decision

Current descriptions are not narrow enough for Anthropic review.

The local review gives the correct general direction. However, it presents some interpretations as published requirements.

- Anthropic sets no description character limit.
- Policy 5.B concerns tool-call token use and responses.
- Anthropic does not specifically prohibit evidence, attribution, or prior-art guidance.
- Moving those rules to documentation is a reviewer recommendation.
- The API reference rule applies only to custom query tools.

Anthropic says descriptions must state what the tool does and when to invoke it. It also says not to direct Claude's behavior.

## Current architecture

The description layers are separate.

- MCP registration uses `src/mcp/tools.ts:218`.
- Initialization injects `SERVER_INSTRUCTIONS` from `src/server.ts:94`.
- Schemas add model-visible field descriptions.
- Catalog descriptions come from generated upstream metadata.
- Ranking uses catalog entry descriptions, not top-level tool descriptions.
- Search responses add a large `nextSteps` value.
- Execute enforces isolation, validation, envelopes, and output caps.
- Runtime checkpoints add evidence and prior-art reminders.
- The playground imports the production descriptions directly.

Trimming only top-level tool descriptions cannot change catalog ranking.

## Measured sizes

| Surface | Characters | Approximate tokens |
| --- | ---: | ---: |
| `SEARCH_DESCRIPTION` | 4,934 | 1,234 |
| `EXECUTE_DESCRIPTION` | 9,337 | 2,335 |
| Both descriptions | 14,271 | 3,568 |
| `BASE_SERVER_INSTRUCTIONS` | 1,986 | 497 |
| `MICRO_MAP` | 5,885 | 1,472 |
| `SERVER_INSTRUCTIONS` | 7,873 | 1,969 |
| Primary prose total | 22,144 | 5,536 |
| Claude Code clipped prose | 6,144 | 1,536 |
| Serialized `tools/list` | 22,017 | 5,505 |
| Initialize plus `tools/list` | 29,890 | 7,473 |
| Playground prompt plus descriptions | 25,387 | 6,347 |

A five-hit search returned 11,013 characters. Its `nextSteps` value used 2,427 characters.

A zero-hit search returned 11,968 characters. Recovery candidates caused most of that size.

These result sizes relate directly to Policy 5.B. A description rewrite does not reduce them.

## Exact efficacy evidence

Description prose can affect model behavior.

- A broad-to-detail nudge moved progression from 4/11 to 7/11.
- Required coverage stayed at 28/30.
- A later checkpoint returned progression to 4/11.
- The initial recovery diagnostic scored 2 correct, 4 partial, and 1 wrong.
- The candidate reminder probe scored 0 correct, 2 partial, and 1 wrong.
- A checkpoint appeared in 19 of 21 reviewed partial transcripts.
- The prior-art probe scored 0 correct, 3 partial, and 0 wrong.
- Both design targets used prior art.
- The narrow control avoided a prior-art detour.

These results show mechanism effects. They do not prove final-answer gains.

The exact deletion impact remains unmeasured.

## Safe boundary

A first change can modify only `SEARCH_DESCRIPTION`, `EXECUTE_DESCRIPTION`, and their tests.

The first change must preserve:

- Catalog descriptions and search scoring.
- Schemas and server instructions.
- Search `nextSteps`.
- Runtime evidence checkpoints.
- Runtime prior-art reminders.
- Playground recovery policy.

Removing guidance from every layer is unsafe before an A/B test.

## Must-keep semantics

The short descriptions must retain:

- Each tool's function and invocation point.
- Exact operation and skill IDs.
- Plain JavaScript only.
- No `fetch`, Node.js APIs, or TypeScript syntax.
- `{ ok: true, data }` and `{ ok: false, error }`.
- The `r.ok` check and `r.data` access.
- Top-level skill-read content.
- One text result and `isError`.
- Default 6,000-token channel caps.
- Artifact continuation after truncation.
- In-script discovery helpers.
- Target API names or links.

The proposed short pair uses 1,709 characters. The current pair uses 14,271 characters.

This change reduces the description pair by 88.0%.

Keeping current server instructions gives a 56.7% primary-prose reduction.

## Staged A/B

B1 compares current and short descriptions while keeping current server instructions.

Use eight affected targets, six controls, and two repeats for each arm.

This design produces 56 answering runs. Use a $45 hard cap, including judges.

Measure valid JavaScript, method errors, envelope misuse, operation coverage, recovery, attribution, and prior-art routing.

Reject B1 after any reviewed control regression.

B2 compacts base instructions only after B1 passes.

## Go or no-go

- Current submission: no-go for item 8.
- Description-only change: go behind free gates and B1.
- Remove guidance from every layer: no-go.
- Claim preserved efficacy now: no-go.
- Advance B1 after controls pass: go.
- Advance B2 only after B1 passes: go with a gate.

No repository file changed. No paid call ran.
