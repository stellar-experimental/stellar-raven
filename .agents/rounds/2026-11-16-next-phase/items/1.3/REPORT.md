# Item 1.3 report: close the source-gap residue

Lead: Claude Opus 5.5, agentpc `t1rm`.

## Pull request and result

[#458](https://github.com/stellar-experimental/stellar-raven/pull/458), branch
`np/1.3-source-gap-residue`. It refs TODO entries only; no issue closes. I re-ran every gate bare on
the final tree and each exited 0, with the tree left clean. CI was pending when I wrote this.

**Classification.** 23 gaps were classed in [CLASSIFICATION.md](CLASSIFICATION.md).

- None of the 11 "not re-run" leaves is a source gap today.
- A Grok 4.7 attack on every absence claim moved three of the executor's classes to "reached":
  - wallet contract support;
  - SDF holdings, through the stellar.org mandate page;
  - XLM staking, through two SDF posts.

**Posted (decision 4)**

| Finding | What it reports | Issue |
|---|---|---|
| `sd-112` | SEP-7 Docs search: an upstream ranking miss under a rule fixed before the read | [stellar-docs#3163](https://github.com/stellar/stellar-docs/issues/3163) |
| `ll-039` | Coverage request for the NBU statement | [lumenloop-backend#52](https://github.com/lumenloop/lumenloop-backend/issues/52) |
| `sls-121` | 5 `Live` wallet rows that contradict their own `availabilityCheck` | [stellarlight#1974](https://github.com/Stellar-Light/stellarlight/issues/1974) |
| `sls-122` | `q=wallet` paging repeats `coca` | [stellarlight#1975](https://github.com/Stellar-Light/stellarlight/issues/1975) |

I read all four issues back from GitHub; all are open.

**Filed, not posted.** `sd-111` (Blend audit register) and `sd-113` (Pi Network FAQ request) are
`verified` with intake `unclear`. stellar.org copy has no public tracker, as with `sd-077`.

**Golden edit.** `q-soroban-cli-bindings` now carries the `sd-110` canonical-page caution.
`cluster-095` and `cluster-103` were closed by my review file. The case was not re-judged.

**Ledger.** The round ledger has the 1.2 Deployed cell as you instructed, and a 1.3 row.

**Spend:** USD 0.

**Deviation from decision 6(c): scam recovery was not filed.** The held SDF guide
(`stellar.org/blog/foundation-news/how-to-protect-yourself-from-scammers`, updated July 2022)
already has the FAQ "I lost money to a scammer. Can you help?". It tells victims to contact law
enforcement (FBI IC3) and says SDF cannot freeze or return tokens. I re-read it live. The gap
ledger's recommendation rested on an unread guide. Filing would ask SDF for content it already
publishes. NBU and Pi Network are filed as decided.

**IDs used:** `sd-111` to `sd-113`, `sls-121`, `sls-122`, `ll-039` (`ll-` was outside the
reservation; items run one at a time). Next free: `sd-114`, `sls-123`, `ll-040`.

## Deploy

None needed. No Worker bytes change: `src/` is untouched.

## For the orchestrator on the Mac

1. Merge #458 when CI is green. `improvements/INDEX.md` is generated. If `main` moves first, merge
   it and re-run `npm run improvements:index`.
2. Nothing else needs the Mac.

## Open questions for the owner

1. **stellar.org findings.** Forward `sd-111`, `sd-113` and `sd-077` to the stellar.org web team?
   None has a public tracker, so they stay `verified` until someone does.
2. **`scout.matchPartners`.** It still returns 503 "AI matchmaking isn't available right now", with
   a hint to fall back to `scout.getPartners`. Remove it from the exposed surface (ADR-0003), or keep
   it with its hint? The TODO bullet "Triage the runtime and client gaps" holds both options.
3. **Source test.** "Audit source coverage" now waits only on your choice of a source to test for
   facts no reached source holds. Decision 6(b) defers that until after 3.1. The one candidate
   left is an other-chain source (XRP Ledger facts).

## Housekeeping

- Fable reviewer `t1rp`, Grok `t1rr` (the executor's child) and the `dev:eval` server `t1rn` are
  killed and removed.
- I kept executor `t1rq` for CI fixes until you reply.
- The worktree `/home/tyler/code/raven-wt/np-1.3` stays until merge. Its `.dev.vars` is mode 600 and
  is ignored.
