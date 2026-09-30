# Skill Exposure Inventory

Date: 2026-07-07

Scope: remaining work for solo://proj/49/todo/design-and-implement--852 after the approved narrow
v1. This inventory classifies the current mirror, official upstream source families, legacy
prior-art skill trees, operational repo skills, and duplicate/cache/example paths. The maintainable
table lives in `research/skill-exposure-inventory.json`; it uses the exact plan columns:

- `id` / `aliases`
- `canonicalSource`
- `sourceFamily`
- `currentState`: `exposed`, `internal-guidance`, `removed`, `excluded-duplicate`, or `out-of-scope-operational`
- `rawBodyPublic`: `yes`, `name-only`, or `no`
- `acceptedLesson`
- `rejectedLessons`
- `targetSurface`
- `rationale`
- `evidenceRefs`

## Source Review

Six read-only shards were reviewed sequentially.

1. SDF/OpenZeppelin official build skills: current SDF upstream remains the seven official skills
   (`smart-contracts`, `dapp`, `assets`, `data`, `agentic-payments`, `zk-proofs`, `standards`).
   The old `soroban` id is a legacy duplicate superseded by `smart-contracts`. OpenZeppelin's
   Stellar subset remains exactly `setup-stellar-contracts`, `develop-secure-contracts`, and
   `upgrade-stellar-contracts`; non-Stellar OpenZeppelin skills remain removed.
2. LumenLoop public ecosystem skills: public upstream remains the eight public skills. Seven are
   exposed; `lumenloop-mcp-connect` remains internal-guidance only with no emitted raw-body lesson.
3. LumenLoop partner/private skills: reviewed from name/purpose stubs only, per comments 2254/2255.
   All six `lumenloop-api-*` skills remain removed. No partner bodies were fetched or committed.
4. Stellar Light/Scout and legacy research/application skills: `stellar-scout` remains exposed.
   Current upstream HEAD has drifted from the local pin and adds partner/provider lookup guidance;
   that is recorded as an orchestrator-review candidate, not emitted text. The unique legacy
   `stellar-developer-activity` skill is internal-guidance only; any upstream Scout companion
   cross-link to that non-exposed id is scrubbed from emitted skill text at build time.
5. Repo-operational/project skills: `cloudflare-agents`, `ecosystem-skills`, `eval-improvement`,
   `raven-golden-evals`, `service-skills-updater`, `flue-docs-sync`, `mastra`, and `flue` are
   repo-agent/process guidance, not MCP-delivered user resources.
6. Duplicate/cache exclusion audit: legacy copied skill trees, generated skill outputs, Eve
   workspace/cache/dev-runtime snapshots, example skills (`greet`, `review`), and dependency
   `node_modules` package skills are excluded as source classes, not individually re-reviewed.

## Decisions

Summary counts from the JSON inventory on 2026-07-07. The JSON is the maintained table and has
changed since: `skills.stellar-dev.cross-chain` (2026-08-10) and
`skills.trustless-work.trustless-work-dev` (2026-09-15) raised `exposed` to 20.

| currentState | count |
| --- | ---: |
| exposed | 18 |
| internal-guidance | 2 |
| removed | 7 |
| excluded-duplicate | 7 |
| out-of-scope-operational | 10 |

Accepted Raven-safe lessons that are not already emitted:

| id | lesson | target |
| --- | --- | --- |
| `skills.stellar-light.stellar-scout` | Upstream Scout now has partner/provider lookup guidance: use returned partner directory results only, never invent providers. | Orchestrator review before any mirror refresh, description-note change, or focused eval case. |
| `stellar-developer-activity` | Developer-activity answers should pair numeric activity/leaderboard evidence with a second project/content corroboration hop, and avoid provider-hosted internal URLs. | Recorded only; no hidden endpoint or emitted guidance. Its upstream Scout companion cross-link is scrubbed because the id is not exposed. |

Evidence portability note: legacy sibling-tree and generated/cache/source-class reviews that have
no public or repo-relative source use an explicit `localOnlyEvidence` marker in the JSON inventory.
Normal `evidenceRefs` are portable refs: upstream URLs, pinned commits, Solo comment ids, or
repo-relative paths.

Rejected lesson classes:

- LumenLoop connector setup, Claude Desktop MCP troubleshooting, direct REST/MCP onboarding, bearer
  auth, key minting/rotation, billing/top-up/quota workflows, raw REST envelopes, rate-limit/account
  advice, and paid `request_research` commissioning.
- Legacy `soroban` as a separate exposed terminal skill id; the canonical SDF skill is
  `smart-contracts`.
- Non-Stellar OpenZeppelin skills and framework docs for Flue/Mastra/Cloudflare Agents as Raven
  user-facing skill resources.
- Generated/cache/example/dependency copies as primary sources.

## Exposure Outcome

The existing v1 LumenLoop classification ledger in `scripts/exposure.mjs` remains unchanged. The
only build-time rule added after this inventory is a scrub target for the non-exposed
`stellar-developer-activity` id, so the mirrored Scout companion-skills section cannot advertise a
skill Raven does not expose.

Because emitted text changes when the mirror artifacts are regenerated, the routing gate is required
for this follow-up scrub.
