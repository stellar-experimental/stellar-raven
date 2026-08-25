# Connectors Directory submission — 2026-08-25

## Scope

Prepare an accurate Connectors Directory submission for Stellar Raven.
Do not weaken product behavior for listing approval.

This ledger replaces retired Solo scratchpads `848` revision `6` and `847` revision `7`.
It holds the cross-cutting plan and the submission package.
It does not add an item to `.agents/TODO.md`.
The portal work is not an own-repository fix.

Do not submit, deploy, create credentials, or run paid tests without explicit authority.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| artifact migration and package maintenance | Codex (current session) | current session | this ledger | complete |
| live portal review | unassigned | none | read-only portal review | pending |
| reviewer access and live validation | unassigned | none | external systems only | pending |

## Current status

- Review date: 2026-08-25.
- Branch `main` matched `origin/main` at `270378b` during this review.
- Unrelated worktree changes existed and remained out of scope.
- All seven earlier review units are closed.
- PRs 41, 42, 44, 45, 46, and 47 merged.
- PR 43 closed without a merge.
- Production `/docs` shows 59 operations, 19 skills, and 173 sections.
- A basic live `search` and `execute` check passed.
- No current evidence shows a completed Directory submission.

## Requirement status

| item | status | evidence or next action |
| --- | --- | --- |
| CD-01 tool annotations | complete in Git | Confirm the live portal grouping. |
| CD-02 Cloudflare ownership | decision recorded | Recheck the live account before submission. |
| CD-03 proxy permission | decision recorded | The user confirmed permission for the external services. |
| CD-04 public documentation | verified in production | `https://raven.stellar.org/docs` serves the current page. |
| CD-05 privacy policy | approved | Use `https://stellar.org/privacy-policy`. |
| CD-06 support contact | approved | Use `frontier@stellar.org`. |
| CD-07 legacy aliases | complete in Git | PR 42 clarified the aliases. |
| CD-08a upstream links | verified in production | The live page names all source families. |
| CD-08b description trim | no change planned | Keep measured quality guidance. |
| CD-09 submission package | active | Use this ledger. |

## Reviewer explanation for `execute`

Anthropic rejects tools that hide read and write methods behind one method argument.
Raven does not expose an upstream write operation.
All 59 exposed service operations are reads.
The sandbox sets `globalOutbound: null`.
Model code cannot access the network.
Host adapters hold credentials and validate catalog calls.

`execute` uses `readOnlyHint: false` for one internal artifact case.
An oversized result can create a private R2 artifact for the same OAuth account.
The artifact does not write to an upstream service.
Raven stores OAuth state and temporary owned artifacts.
Do not claim that Raven stores no per-account data.
Explain these facts in the Directory form.

## Approved listing fields

| field | value |
| --- | --- |
| Server URL | `https://raven.stellar.org/mcp` |
| Transport | Streamable HTTP |
| User URL model | All users connect to the same URL. |
| Server name | `Stellar Raven` |
| Permanent slug | `stellar-raven` |
| Tagline | `Stellar docs, ecosystem data, and playbooks in one MCP` |
| Categories | `Code`, `Data`, and `Education` |
| Documentation URL | `https://raven.stellar.org/docs` |
| Privacy URL | `https://stellar.org/privacy-policy` |
| Support contact | `frontier@stellar.org` |
| Icon | `assets/brand/raven-icon-512.png` |
| Company | Stellar Development Foundation |
| Company website | `https://stellar.org` |
| Primary review contact | Confirm in the portal. |

## ASD-STE100 listing description

Character count: 1,384.

Stellar Raven is a read-only gateway to the Stellar ecosystem.
It connects agents to four source families through two tools.
`search` ranks 59 service operations and 19 whole playbooks.
It covers Stellar Docs, Lumenloop, Stellar Light/Scout, and pinned build playbooks.
Operation results and runnable playbooks include a TypeScript signature.
The 173 playbook sections are not ranked.
Each playbook result lists section identifiers for exact reads.
`execute` runs JavaScript inside a Cloudflare Worker sandbox.
The sandbox has no network access and cannot call `fetch`.
Host adapters hold credentials, validate catalog calls, and enforce policy.
An agent never receives an upstream API key.
A script can call several services in parallel.
It can use earlier results in later calls.
Each service call returns a checked envelope.
A successful result appears under `.data`.
The envelope separates errors from empty results.
Discovery helpers return their fields at the top level.
Raven does not write to upstream services.
It does not submit transactions, move funds, or sign data.
All authenticated accounts search the same public catalog.
WorkOS AuthKit provides OAuth sign-in.
Raven supports dynamic client registration and client ID metadata documents.
Access tokens last one hour.
The authorization window lasts 90 days.
The Stellar Development Foundation builds and operates Raven.

## Primary use cases

- Answer Stellar protocol, SDK, CLI, contract, RPC, anchor, asset, or wallet questions.
- Find projects, repositories, builders, partners, hackathons, audits, and stablecoins.
- Read SCF funding context, community research, and editorial content.
- Read tested build and integration playbooks by exact section.
- Answer questions that cross two or more source families in one script.

## Connection prerequisites

- Use an MCP client that supports Streamable HTTP and OAuth.
- Connect to `https://raven.stellar.org/mcp`.
- Complete browser sign-in through WorkOS AuthKit.
- No Raven API key or upstream service credential is normally required.
- Every authenticated account searches the same public catalog.

## Data-handling answers

### Upstream ownership

Raven proxies three service surfaces.
Stellar Docs is an SDF surface.
Lumenloop and Stellar Light/Scout are external services.
The user confirmed proxy permission for the external services.
If the portal allows one option, select proxied with permission.
Explain the mixed source ownership in free text.

### Read and write behavior

Raven reads upstream services.
It does not submit transactions, move funds, or sign data.
`execute` can write a private artifact only after an oversized result.
The artifact belongs to the same OAuth account.
The artifact expires automatically within seven days.
This internal artifact does not change an upstream service.

### Personal health data

Answer `No`.
Raven is not intended for health data.
It does not intentionally collect special-category data.
Users must not submit sensitive data.

### Sponsored content

Answer `No`.
Raven adds no paid ranking or promoted placement.
It makes no claim about sponsorship inside upstream records.

### Conversation data

Raven disables structured content logging and AI Gateway request logging.
Operational logs exclude queries, code, results, answers, and derived content hashes.
Cloudflare can retain platform metadata for no more than seven days.

### AI media and prompt injection

Raven does not create AI media.
Raven treats retrieved content as untrusted evidence.
The host validates every service call against the catalog.

## Reviewer access

Current Anthropic criteria require test credentials for a fully populated account.
Public sign-up alone does not meet the written requirement.

Prepare a dedicated reviewer WorkOS account after explicit authorization.
Use that account for the OAuth artifact test.
Raven has no account-specific catalog data to populate.
Document this product fact for the reviewer.

A named API key can supplement core tool access.
It cannot replace OAuth or artifact verification.
Do not create any credential without explicit authority.

## Example prompts

1. Stellar Docs case `q-asset-trustline-basics`:
   “What is a trustline on Stellar and what does it cost to hold an asset?”
2. Scout case `q-scf-how-to-apply`:
   “How do I apply for an SCF Build Award — what is the step-by-step application process?”
3. Skills case `q-sor-skill-openzeppelin-setup`:
   “What is the best skill workflow for setting up a Soroban contract project with OpenZeppelin Contracts for Stellar?”

These cases passed the pinned 2026-08-19 sample.
Run them again against the deployed submission commit.
Lumenloop has no stable measured passing prompt.
Do not add a Lumenloop prompt without a measured pass.

## Required validation

1. Complete: `https://raven.stellar.org/docs` serves the current documentation.
2. Complete: a basic live `search` and `execute` check passed.
3. Confirm that `tools/list` returns only `search` and `execute`.
4. Confirm that both tools contain the expected annotations.
5. Run both tools through MCP Inspector.
6. Run both tools through a Claude custom connector.
7. Force an oversized result in a same-account OAuth session.
8. Read the returned artifact from the same OAuth account.
9. Run all three approved example prompts.
10. Prepare the dedicated reviewer account after authorization.
11. Confirm that the portal accepts the 512-by-512 PNG icon.
12. Record all results without secrets or user content.

## Submission checklist

| gate | status |
| --- | --- |
| Organization tier and Directory role | Reported available; verify live. |
| Public documentation | Verified in production. |
| Basic live tool call | Passed on 2026-08-25. |
| Privacy URL | Approved. |
| Support contact | Approved. |
| Listing fields | Approved; confirm portal limits. |
| Three prompts | Selected; run again. |
| Reviewer WorkOS account | Required; not prepared. |
| Oversized artifact flow | Not verified after deployment. |
| MCP Inspector test | Not run in this pass. |
| Claude connector test | Not run in this pass. |
| Live portal wording | Not checked in this pass. |
| Portal submission | Not authorized. |

## Open questions

- Has a portal draft already been saved?
- Does the portal allow a mixed upstream ownership answer?
- Who will serve as the primary review contact?
- Who can prepare the dedicated reviewer WorkOS account?
- Which secure channel will deliver the reviewer credentials?
- Does the portal accept a dedicated OAuth account without sample records?

## Authorization limits

Current work permits read-only checks and draft preparation.
The user must authorize a deployment, credential, paid test, or submission.
No portal submission is authorized.

## Ledger

- `2026-08-25T20:36Z` — `parallel-cli extract` checked the production documentation,
  the current submission guide, and the current review criteria.
  The command wrote `/tmp/stellar-raven-directory-check.json` and returned `status: ok`.
  Production `/docs` reported 59 operations, 19 skills, and 173 sections.
- `2026-08-25T20:38Z` — `stellar-raven.search({ query: "Soroban contract storage",
  service: "stellarDocs", limit: 3 })` returned `stellarDocs.search_soroban_contract_docs`
  first with score `261` and tier `gated`.
- `2026-08-25T20:39Z` — `stellar-raven.execute` called that exact operation.
  It returned `{"hitCount":3,"firstUrl":"https://developers.stellar.org/docs/build/guides/dapps/frontend-guide#state-archival","nbHits":138}`.
- `2026-08-25T20:41:29Z` — the migration read scratchpad `848` revision `6` and
  scratchpad `847` revision `7` in full.
  The migration routed both records to this dated round ledger.
- `2026-08-25T20:47:19Z` — direct gitleaks and local-value scans found no secrets
  in this ledger.
  The user confirmed the repository capture and requested retirement.
  Solo scratchpads `848` and `847` were archived, not deleted.
  An active-list query returned no matching scratchpads.

## Evidence

- Production documentation: `https://raven.stellar.org/docs`.
- Current submission guide: `https://claude.com/docs/connectors/building/submission`.
- Current review criteria: `https://claude.com/docs/connectors/building/review-criteria`.
- Catalog source: `catalog/manifest.json`.
- Tool metadata source: `src/mcp/tools.ts`.
- Runtime boundary source: `src/executor/run.ts` and `ARCHITECTURE.md`.

The live documents require test credentials for a fully populated account.
Recheck the portal wording before entry.

## Outcome

The repository now holds the prior scratchpad content in one reviewable ledger.
The engineering prerequisites are complete or verified in production.

The submission round remains active.
The portal, account, Inspector, Claude, artifact, and prompt checks remain incomplete.
No deployment, credential, paid test, or submission occurred during this migration.
