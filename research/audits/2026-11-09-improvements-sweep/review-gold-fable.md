# Independent golden review — sls-099, sls-100, sd-064, sd-100 reconciliation

Reviewer: Claude Fable 5.2 (high), distinct from the author (Codex workhorse `gpt-6.1-sol`) and the
coordinator (Claude Opus). Date: 2026-11-09. Base: `origin/main` = `be3e1f41`; reviewed tree at
`433b3848` plus working-tree changes. Workflow: `.agents/skills/golden-truth/SKILL.md`.
I changed no tracked file, posted nothing, started no agent and spent nothing.

## Verdicts

| File | Verdict |
|---|---|
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-phoenix-what-is.json` | **approve** |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-what-is.json` | **approve** |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-vs-stellarx.json` | **approve** |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-provide-liquidity-impermanent-loss.json` | **approve** |
| `eval/qa/corpus/battery/defi-ecosystem/q-eco-hana-wallet-scf.json` | **approve** |
| `eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json` | **fix-needed** (F1 required; F2 recommended) |
| `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json` | **fix-needed** (F3 required, small; F4 recommended) |
| `improvements/stellar-light-scout/sls-029-*`, `sls-039-*`, `sls-115-*` cross-references | **approve** |
| `eval/qa/consistency-register.json` reasons (clusters 012, 014, 017, 022, 030, 038, 046, 065, 073, 128) | **approve** |

Both required fixes are one-sentence note edits. Every new current-state claim I checked is true
now. Nothing loosens or tightens a key fact or an avoid item.

## Required fixes

### F1 — `q-builder-content-by-person.json`, `golden.notes`: a verdict word in a note

Exact text:

> An answer that reports the earlier 404 or the later redirect, with its own date, is correct.

Replacement:

> An answer that reports the earlier 404 or the later redirect, with its own date, makes a true dated observation, not a wrong claim.

Why: `correct` is a rubric verdict. As written, a judge can read the sentence as licensing a
`correct` verdict for the whole answer on one URL observation, past the four key facts. The live
facts justify only "do not penalize this observation". The same note already uses that form two
sentences earlier ("makes a true source-scoped observation, not a wrong claim").

### F3 — `q-protocol-ledger-close-time.json`, `golden.notes`: pointer does not name the ledger

Exact text:

> the USDT0 launch page repeated it until its 2026-11-09 correction (sd-100, resolved).

Replacement:

> the USDT0 launch page repeated it until its 2026-11-09 correction (sd-100, resolved; see improvements/resolved.json).

Why: brief check 4. The `rootCause` entry already names the ledger; the judge-facing pointer does
not. The other six cases name it in their notes.

After F1 and F3: re-run `npm run eval:qa:compile`, then `npm run eval:qa:register`. Clusters 017,
065, 073 and 128 will reopen on the new member hashes. Their current reasons stay accurate and can
be re-applied unchanged. Then `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`.

## Recommended, not blocking

### F2 — `q-builder-content-by-person.json`, `truth.verified.evidence[0]`: no re-walkable ref

"stellar-docs PR2945" carries no URL, and `by` names a Fable review with no path. Suggested
replacement for the first evidence line:

> https://developers.stellar.org/meetings/authors/kalepail (HTTP 308 to /meetings, then HTTP 200 Meeting Notes index, 2026-11-09T20:39Z): https://github.com/stellar/stellar-docs/pull/2945 (merged 2026-11-09T17:05:10Z as 88c539971e605d01e5f1ee7f71efd1669ca1db5e) redirects every pre-migration author URL to the generic index. No per-author list is restored; the seven dated meeting pages remain the source. Independent live re-derivation: research/audits/2026-11-09-improvements-sweep/review-fable.md, Batch 2. Notes now point at the resolved sd-064 receipt instead of the deleted active finding. Judge-facing answer, key facts and avoids are unchanged.

Also consider a `confirmed-as-of` corroboration row for the 2026-11-09 redirect, as the Codex lane
added for its five cases. The existing row 2 ("stopped resolving") has only 2026-11-02 evidence.

### F4 — `q-protocol-ledger-close-time.json`: no corroboration row for the 2026-11-09 Docs state

The answer now carries two claims dated 2026-11-09 (Stack and Validators wording; the USDT0
correction). Their evidence sits only in `truth.verified.evidence`. The newest corroboration rows
still end at "Official Docs pages still say every 5-7 seconds" (2026-10-01) and the 2026-11-02 row.
Suggested row:

```json
{
  "claim": "As of 2026-11-09, the Stellar Stack, Validators and USDT0 launch pages say about 5 seconds; no served Docs page states 5–7 seconds.",
  "verdict": "confirmed-as-of",
  "evidence": [
    { "class": "A", "ref": "https://developers.stellar.org/launch/usdt0.md", "observedAt": "2026-11-09T20:51Z", "note": "'Stellar finalises in about 5 seconds'; settlement '~5s'. No 5–7 range." },
    { "class": "A", "ref": "https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md", "observedAt": "2026-11-09T20:51Z", "note": "'update the ledger about every 5 seconds. The target close time is a network setting that can change, and a single ledger can take longer to close.' docs/validators.md carries the same sentence." },
    { "class": "B", "ref": "https://github.com/stellar/stellar-docs/pull/3080", "observedAt": "2026-11-09", "note": "Merged 2026-11-09T20:38:31Z as b5f22fb71ca0dfa06655b77c42de6773bde1f2a4; one file, snippets/usdt0-launch.jsx." },
    { "class": "A", "ref": "https://developers.stellar.org/llms-full.txt", "observedAt": "2026-11-09T20:52Z", "note": "No 5–7 or five-to-seven second range in the served corpus." }
  ]
}
```

## Owner decision to queue, not part of this change

`q-protocol-ledger-close-time` key fact 1 still reads "States about 5 seconds, or the documented
5–7 seconds, with a date or source", and the notes still say "Accept either figure when the answer
dates it or names its source." Neither changed in this diff, so the edit itself neither loosens nor
tightens grading. But after the sd-100 fix no served Docs page documents 5–7 seconds. An answer that
says "5–7 seconds per the Stellar docs" now names a source that no longer says it, and still meets
key fact 1. My recommendation: leave it today, because third-party corpora and caches can still
carry the figure, and add a `.agents/TODO.md` item to decide whether the 5–7 acceptance should
require a pre-Protocol-28 or pre-2026-11-09 date. Any such change is its own `golden-truth` pass.

## What I checked

### 1. Judge-facing fields (parsed JSON against `origin/main`)

| Case | Changed paths outside `truth` | `truth` paths outside `verified`/`corroboration` | Old corroboration rows |
|---|---|---|---|
| q-defi-phoenix-what-is | `golden.notes` | none | 3 intact, 1 added |
| q-defi-soroswap-what-is | `golden.notes` | none | 3 intact, 1 added |
| q-defi-soroswap-vs-stellarx | none | none | 4 intact, 1 added |
| q-defi-provide-liquidity-impermanent-loss | `golden.notes` | none | 1 intact, 1 added |
| q-eco-hana-wallet-scf | none | none | 2 intact, 1 added |
| q-builder-content-by-person | `golden.notes` | none | 3 intact, 0 added |
| q-protocol-ledger-close-time | `golden.answer`, `golden.notes` | none | 8 intact, 0 added |

No question, key fact, avoid, tag, `truth.asOf` or `truth.reverifyBy` changed in any case. The
author's report says the same for its five cases, and that is correct.

Note changes, judged for grading effect:

- **Phoenix, Soroswap what-is, impermanent loss.** Present-tense Scout claims became dated past
  tense, and one `RECHECK 2026-11-09` line was added. The line adds no requirement and no penalty.
  "Code presence does not establish an active API venue" restates the existing Soroswap avoid item
  and binds to no new avoid in the other two cases. The "do not require a Phoenix aggregation claim"
  rule is unchanged.
- **Builder.** The dated redirect fact is true (below). F1 is the one loosening risk.
- **Ledger close time.** The answer sentence changed from "retains an older 5–7-second estimate
  (sd-100)" to "repeated the older 5–7-second estimate until it was corrected to about 5 seconds on
  2026-11-09". True, dated, and it removes a finding id from answer text. The grading rule is
  unchanged.

### 2. Current-state claims, fetched myself

Scout, 2026-11-09T20:53:22Z, `https://stellarlight.xyz/api/projects/search?q=<term>&limit=100`, all HTTP 200:

- **soroswap**: "Its Aggregator API prices the Soroban venues Soroswap AMM, Aquarius, SushiSwap V3
  and Comet … and quotes the Stellar classic DEX (SDEX) as a separate classic path payment when
  asked to." No Phoenix in the venue list. The row still opens "Soroswap is the first decentralized
  exchange (DEX) and DEX aggregator on Stellar Soroban", so the unchanged `SOURCE NOTE 2026-09-17`
  is still true. `scfTotalAwardedUSD` 346750.
- **phoenix**: "Soroswap's Aggregator v3 contract defines a Phoenix hop type, but Phoenix is not in
  the venue list of Soroswap's Aggregator API (checked 2026-11-04)." `scfTotalAwardedUSD` 394500.
- **hana**: `links.website` `https://hanawallet.io/`; `statusSourceUrl` `https://www.hanawallet.io/`;
  `lifecycle.note` ends "The old hana.money domain no longer serves Hana (sls-100)."
  `scfTotalAwardedUSD` 132000. The short description still says "the Freighter API", so the
  evidence line calling that a separate identity matter is accurate; sls-095 is in the ledger,
  resolved 2026-11-06.
- `https://stellarlight.xyz/api/partners/hana-wallet`: HTTP 200 without credentials; `websiteUrl`
  `https://www.hanawallet.io`. The case reproduces only that URL.
- **chainlink** (sls-029 cross-reference): two `oracle-feed` products, mainnet and testnet proxies.
- **blend** (sls-039 cross-reference): `tvlMethodUrl` `https://defillama.com/protocol/blend`.

Operator pages, same window:

- `https://docs.soroswap.finance/aggregator/supported-amms.md`: venues `soroswap`, `aqua`, `sushi`,
  `comet`, `sdex`; SDEX row "Classic path payment". No Phoenix row.
- `https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md`:
  `pub enum Hop` includes `Phoenix(PhoenixHop)`; prose names Soroswap, Aquarius, SushiSwap V3 and
  Comet; `CAYP3…TXTO` marked deprecated.
- `https://hanawallet.io/`: 308 to `https://www.hanawallet.io/`, then 200, title "Hana |
  Non-Custodial Multi-Chain Crypto Wallet", page names Stellar.
- `https://hana.money/` and `https://www.hana.money/`: 307 to `https://www.wendmoney.com.au/`, then
  200, title "Wend | Send money to GCash or Maya in minutes".
- `https://developers.stellar.org/meetings/authors/kalepail`: 308, `location: /meetings`, then 200,
  title "Meeting Notes - Stellar Developer Docs". The index has no author links.
  `gh api repos/stellar/stellar-docs/pulls/2945`: merged 2026-11-09T17:05:10Z, so "Since 2026-11-09
  it redirects" is right.

Ledger cadence, 2026-11-09T20:55:31Z:

- `https://developers.stellar.org/launch/usdt0.md`: "Stellar finalises in about 5 seconds";
  settlement "~5s". No 5–7 range.
- `stellar-stack.md` and `validators.md`: "update the ledger about every 5 seconds. The target close
  time is a network setting that can change, and a single ledger can take longer to close."
- `https://developers.stellar.org/llms-full.txt` (5,895,502 bytes): zero matches for a 5–7-second
  range.
- `gh api repos/stellar/stellar-docs/pulls/3080`: merged 2026-11-09T20:38:31Z as
  `b5f22fb71ca0dfa06655b77c42de6773bde1f2a4`, one file. Matches the evidence line.
- `https://horizon.stellar.org/ledgers?order=desc&limit=200`: ledgers 65394138–65394337, protocol
  29, 199 deltas all 5 s, mean 5.000. Consistent with the cited 20:51Z sample 65394089–65394288.

Other corpora, one Raven `execute` at 20:56Z, as a check that no caution is owed:
`lumenloop.get_project` for `phoenix` and `soroswap` carries no "aggregated by Soroswap" Phoenix
claim; two `stellarDocs.search_docs` queries returned no 5–7-second snippet. Bounded to those four
calls.

### 3. Historical claims

Kept and dated in every case. The 2026-06-22, 2026-06-29 and 2026-11-02 Scout quotes stay in notes
as dated observations. The Hana answer's "as of 2026-11-02, hana.money redirects to the Wend
remittance site" is unchanged and still true. The builder answer's "on 2026-11-02 it returned HTTP
404" is unchanged. The ledger answer keeps its 2026-11-02 sample and the pre-Protocol-28 5–7 history.
All earlier corroboration rows are byte-identical. `truth.verified` was replaced by the latest event
in each case, which is the skill's rule; the older evidence lines are in git history.

### 4. Pointers

- `improvements/resolved.json` now holds sls-099, sls-100, sls-102, sls-112, sls-114, sd-064,
  sd-100 and sd-054, each resolved 2026-11-09 with a resolving ref. The five active files I checked
  for are deleted in the working tree. When I started, the entries did not exist yet; they do now.
- No scoped file contains a `tmp/` path. The builder case's old `tmp/urls/sibling-sweep.json`
  pointer is gone.
- Every retired-finding pointer names `improvements/resolved.json`, except the ledger note (F3).
- The brief names "sls-064". The retired finding is **sd-064**; `sls-064` is an unrelated entry
  resolved 2026-08-19. The case text uses the right id.
- `review-astra.md` and `review-astra-sd100.md` are tracked. Their claims match the evidence lines:
  fetches started 2026-11-09T20:40:31Z, "independently frozen before reading the lane report", both
  Scout searches and both operator pages listed. Out of scope but worth knowing: each of those two
  reports points its raw receipts at `tmp/` paths seven times, so the receipts are local only. The
  request tables inside the reports are the durable part.

### 5. Register reasons

All ten applied reasons are specific to their cluster's claim, and their member counts are right:
cluster-012 has 12 members; cluster-022 has six ("the other five"); cluster-046 has four ("the other
three"); cluster-073 has four ("the three DeFi members"); cluster-128 has seven. The cluster-012
amounts match live Scout. The cluster-017 and cluster-065 text in the register equals
`tmp/register-review-3.json`. Sibling checks behind them hold: `q-asset-path-payment-ops` still says
"roughly one ledger close (~5 s)"; only `q-protocol-ledger-close-time` contains a 5–7-second
figure; only `q-builder-content-by-person` mentions `meetings/authors` or sd-064.

One loose end, not blocking: cluster-065's standing `note` still reads "As of 2026-11-02 … official
Docs still say every 5–7 seconds". It is dated, and the new reason says it is superseded. Refresh
the note at the next edit of that cluster.

### 6. Finding cross-references

- sls-029: "resolved sls-112; improvements/resolved.json entry sls-112" — entry exists; Chainlink
  products confirmed live.
- sls-039: "improvements/resolved.json entry sls-102" — entry exists; Blend parent URL confirmed.
- sls-115: body now says sls-114 "was resolved separately … (see `improvements/resolved.json`,
  entry sls-114); its fix does not resolve this answer-selection defect" — entry exists. Earlier
  recurrences are kept.
- Cosmetic only: the 2026-11-09 evidence line in sls-115 has run-together tokens ("dated2026-10-08",
  "scannedRef6a13f418…", "scan2026-11-07", "at20:33:21Z"). The SHA still greps.

### 7. Gates I ran (read-only)

- `npm run eval:qa:register -- --check`: exit 0, "up to date".
- `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`: exit 0, 0 errors, 81
  warnings, none new for the seven cases.

I did not run `eval:qa:compile` because it writes tracked files.

## Attribution note

`q-builder-content-by-person` and `q-protocol-ledger-close-time` already name "Claude Fable high" as
the independent golden reviewer in `truth.verified.by`. That is this review. It holds once F1 and F3
are reconciled. This file is under `tmp/` and cannot be cited from a committed file; copy it into
`research/audits/2026-11-09-improvements-sweep/` if a durable pointer is wanted.
