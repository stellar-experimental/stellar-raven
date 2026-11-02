# Distinct review: retire sd-056 (ledger-header fee units and extension)

- Reviewer: Claude Fable 5.1 (distinct from author Claude Opus 5.5)
- Worktree: /private/tmp/claude-501/raven-sd056-1102, branch improvements/resolve-sd-056, HEAD 4274b6da
- Finding: improvements/stellar-docs/sd-056-ledger-header-fee-units-and-extension.md (status `fixed-upstream`)
- Procedure: .agents/skills/improvements-pipeline/SKILL.md step 6 "Drain genuinely resolved records"
- Review date: 2026-11-02 (all times UTC)
- No repository file was edited. Nothing was posted to GitHub. The resolver ran only with `--dry-run`, and `git status --short` was empty after the run.

## Verdict

**RETIRE.**

Every claim in the Finding and Recommendation sections is resolved on the live production page. The new text matches the XDR source and CAP-38. No residual stale text was found on the page, in the stellar-docs repository, or in the Mintlify docs search index. No golden, register, research, or probe reference depends on the finding id.

## 1. Upstream refs (read directly with `gh`)

### Issue stellar/stellar-docs#2907 — fetched 2026-11-02T21:01:37Z

- URL: https://github.com/stellar/stellar-docs/issues/2907
- `state: CLOSED`, `stateReason: COMPLETED`, `closedAt: 2026-11-02T18:27:16Z`
- Title: "Correct ledger-header fee units and document its extension member"
- Comments: three from `stellar-triage-bot[bot]` (2026-10-30T10:50:46Z, 2026-10-30T10:50:55Z, 2026-11-02T18:31:15Z). The last one says: "#2930 corrected the units: `feePool`, `totalCoins` and `baseReserve` are in stroops. It also added the `ext` field." and "Production served the fix at 2026-11-02T18:30:58Z."
- **No Raven resolution comment is posted yet.** That is expected before this review. The drainer must post the resolver's printed comment before running without `--dry-run`.

### PR stellar/stellar-docs#2930 — fetched 2026-11-02T21:01:46Z

- URL: https://github.com/stellar/stellar-docs/pull/2930
- `state: MERGED`, `mergedAt: 2026-11-02T18:27:15Z`, `mergeCommit: 378944a1c7497eb0aee9bd85aab185d5984321e4`, base `main`, head `3cc2062eb23a81be1a653051dd75960cb8f02534`, author `kaankacar`, review `ElliotFriend APPROVED 2026-11-02T18:25:26Z`.
- Files changed: only `docs/learn/fundamentals/stellar-data-structures/ledgers.mdx`.
- Diff (exact added lines):
  - Total coins: "Total number of lumens in existence. The header stores this amount as an integer number of stroops (10,000,000 stroops = 1 XLM). Horizon shows it in XLM as `total_coins`."
  - Fee pool: "Number of lumens that have been paid in fees. The header stores this amount as an integer number of stroops, like a transaction’s fee field. Horizon shows it in XLM as `fee_pool`." (removed: "Note this is denominated in lumens, even though a transaction’s fee field is in stroops.")
  - Base reserve: appended "Calculated in stroops."
  - New `### Extension` section: "A union reserved for extending the ledger header. Its discriminant is `0` when the header has no extension, or `1` when it holds a `LedgerHeaderExtensionV1`, which carries a `flags` bit mask. Validators can vote to set these flags to disable liquidity pool trading, deposits, or withdrawals in an emergency."

### Merge is on `main`, not only merged in the PR — checked 2026-11-02T21:02:53Z

- `GET repos/stellar/stellar-docs/compare/378944a1...main` → `{"status":"ahead","ahead_by":6,"behind_by":0}` (main contains the merge commit).
- Latest commit touching `ledgers.mdx` on main: `378944a1`, 2026-11-02T18:27:14Z, "Correct ledger header units and document the extension field (#2930)".
- https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx lines 105, 109, 129, 135, 137 carry the new text verbatim.

### Handoff stellar-experimental/stellar-raven#316 — fetched 2026-11-02T21:02:53Z

- URL: https://github.com/stellar-experimental/stellar-raven/issues/316, `state: OPEN`, created 2026-11-02T18:31:09Z by the triage bot.
- States merge 2026-11-02T18:27:15Z, "Mintlify Deployment" check passed 2026-11-02T18:27:43Z, production served the new text 2026-11-02T18:30:58Z. It lists the same four-step live recheck I executed below.

## 2. Fresh execution of the original trigger

### Live production page — fetched 2026-11-02T21:02:06Z

- URL: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers
- Response: `HTTP/2 200`, `date: Mon, 02 Nov 2026 21:02:06 GMT`, `last-modified: Mon, 02 Nov 2026 20:58:46 GMT`, `server: cloudflare`, `x-vercel-cache: BYPASS`, `cf-ray: a5461408192d5fa7-ATL`.
- Rendered text (HTML stripped), exact quotes:
  - "Total coins Total number of lumens in existence. The header stores this amount as an integer number of stroops (10,000,000 stroops = 1 XLM). Horizon shows it in XLM as total_coins ."
  - "Fee pool Number of lumens that have been paid in fees. The header stores this amount as an integer number of stroops, like a transaction’s fee field. Horizon shows it in XLM as fee_pool ."
  - "Base reserve The reserve the network uses when calculating an account’s minimum balance. Calculated in stroops."
  - "Skip list Hashes of ledgers in the past. ... Currently unused. Extension A union reserved for extending the ledger header. Its discriminant is 0 when the header has no extension, or 1 when it holds a LedgerHeaderExtensionV1 , which carries a flags bit mask. Validators can vote to set these flags to disable liquidity pool trading, deposits, or withdrawals in an emergency."
  - SCP value paragraph is unchanged: "This value is stored here and in the following three fields (transaction set hash, close time, and upgrades)." Transaction set hash, Close time, and Upgrades remain under that nested StellarValue explanation, as the Recommendation asked.
- `grep -o -i 'denominated in lumens' ledgers.html | wc -l` → `0`.

### Claim-by-claim

| Claim in Finding / Recommendation | Live page | Result |
| --- | --- | --- |
| Fee pool stored in stroops, not lumens | "stores this amount as an integer number of stroops, like a transaction’s fee field" | Resolved |
| totalCoins stored in stroops; distinguish displayed XLM | "integer number of stroops (10,000,000 stroops = 1 XLM). Horizon shows it in XLM as total_coins" | Resolved |
| Explain conversion to XLM for displayed values | Both sections name the Horizon XLM field; Total coins gives the 10,000,000 factor | Resolved |
| State raw baseReserve units | "Calculated in stroops." | Resolved |
| Add direct `ext` union with discriminants 0 and 1 and LedgerHeaderExtensionV1 | New Extension section with `0`, `1`, `LedgerHeaderExtensionV1`, `flags` | Resolved |
| Keep tx-set hash, close time, upgrades under StellarValue scope | Unchanged SCP value paragraph still explains the nesting | Preserved |

### XDR cross-check — fetched 2026-11-02T21:02:27Z

- stellar/stellar-xdr default branch is `main`; I read the `curr` branch at `579a90b2654e3811e8b672e128a5e094c7325b27`: https://raw.githubusercontent.com/stellar/stellar-xdr/579a90b2654e3811e8b672e128a5e094c7325b27/Stellar-ledger.x
- `int64 totalCoins; // total number of stroops in existence. // 10,000,000 stroops in 1 XLM` → page factor and units correct.
- `int64 feePool; // fees burned since last inflation run` → units implicit; core adds the integer transaction fee directly (finding evidence), and the fresh Horizon decode below confirms stroops.
- `uint32 baseReserve; // account base reserve in stroops` → "Calculated in stroops." correct.
- `union switch (int v) { case 0: void; case 1: LedgerHeaderExtensionV1 v1; } ext;` → discriminants 0/1 correct.
- `struct LedgerHeaderExtensionV1 { uint32 flags; // LedgerHeaderFlags ... }` and `enum LedgerHeaderFlags { DISABLE_LIQUIDITY_POOL_TRADING_FLAG = 0x1, DISABLE_LIQUIDITY_POOL_DEPOSIT_FLAG = 0x2, DISABLE_LIQUIDITY_POOL_WITHDRAWAL_FLAG = 0x4 }` → "disable liquidity pool trading, deposits, or withdrawals" matches all three flags; the page names no flag identifiers, so no wrong flag name is possible.
- `LEDGER_UPGRADE_FLAGS = 5` with `case LEDGER_UPGRADE_FLAGS: uint32 newFlags; // update flags` → "Validators can vote to set these flags" is the correct mechanism.

### CAP-38 cross-check — fetched 2026-11-02T21:04:16Z

- URL: https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0038.md
- Line 1056-1057: "This proposal also adds a `LedgerHeaderExtensionV1` that contains flags for validators to vote on using a new `LedgerUpgradeType` `LEDGER_UPGRADE_FLAGS`."
- Line 1067: "validators vote for them, and they should only be used in case of emergency." → the page's "in an emergency" framing is sourced.

### Fresh Horizon evidence — fetched 2026-11-02T21:04:13Z

- URL: https://horizon.stellar.org/ledgers?order=desc&limit=1 → ledger `65273495`, `closed_at 2026-11-02T21:04:10Z`, `protocol_version 29`.
- Horizon display: `fee_pool "10967002.4642724"`, `total_coins "105443902087.3472865"`, `base_reserve_in_stroops 5000000`.
- `header_xdr` decoded with `stellar 28.1.0` (`stellar xdr decode --type LedgerHeader`): `fee_pool 109670024642724`, `total_coins 1054439020873472865`, `base_reserve 5000000`, `ext v0`.
- Both pairs convert by exactly 10,000,000. The header stores stroops; Horizon shows XLM. The page's new statements are correct against live data.

## 3. Adjacent behavior and residuals

- New-text errors: none found. Every sentence in the Extension section is backed by Stellar-ledger.x and CAP-38. The Fee pool sentence still opens with "Number of lumens that have been paid in fees" and then states the stored unit is stroops; that is a description of the amount followed by its storage unit, not a contradiction. Not a successor-worthy defect.
- Repository-wide stale phrase: `gh api search/code q='repo:stellar/stellar-docs "denominated in lumens"'` at 2026-11-02T21:03:15Z → `total_count: 0`.
- Mintlify docs search index (via production Raven `stellarDocs.search_docs`, observedAt 2026-11-02T21:03:46Z): three queries ("fee pool denominated in lumens", "ledger header feePool stroops", "LedgerHeaderExtensionV1 extension ledger header"). The Ledgers page hit returns the NEW snippet: "Number of lumens that have been paid in fees. The header stores this amount as an integer number of stroops, like a transaction’s fee field. Horizon shows it in XLM as `fee_pool`." and the new Extension snippet. No result anywhere contained "denominated in lumens". The search index is not stale.
- No successor finding is needed.

## 4. Repository references (`rg -n "sd-056" . --glob '!node_modules' --glob '!.git'`, 2026-11-02T21:03:15Z)

```
./improvements/stellar-docs/sd-056-ledger-header-fee-units-and-extension.md:2:id: sd-056
./improvements/intake.json:242:    "sd-056": {
./improvements/INDEX.md:64:| sd-056 | ... | fixed-upstream | 2026-10-09 | 0 |
```

- No hits under `eval/qa/corpus`, `eval/`, `research/`, `improvements/resolved.json`, or any probe file. INDEX shows `0` probes for sd-056, so there is no probe to delete.
- `improvements/intake.json` holds `findings["sd-056"] = {"repo": "stellar/stellar-docs", "reason": "The ledger-header units and field list are source content owned by stellar/stellar-docs."}`. The resolver deletes this override; nothing else references it.
- `INDEX.md` is regenerated by the resolver.

## 5. Resolver dry run (non-mutating; `git status --short` empty afterward), 2026-11-02T21:04:07Z

The dry run produced a complete receipt with `upstreamRefs` = [#316, #2907, #2930], `resolvingRefs` = [#2930], `sourceCommit 4274b6da355a62eb371a95f8082df3ed57b605bd`, and a suggested upstream comment. Two notes for the drainer:

1. The `sourceUrl` pins commit `4274b6da`, which exists only in this worktree branch today. Push the branch (or merge) before posting the comment so the pinned snapshot URL resolves publicly.
2. Post the printed resolution comment on stellar/stellar-docs#2907 (and link it from stellar-experimental/stellar-raven#316) before omitting `--dry-run`; the comment is not posted yet.

## URLs fetched

- https://github.com/stellar/stellar-docs/issues/2907 (via `gh issue view`, `gh api .../issues/2907/comments`) — 21:01:37Z
- https://github.com/stellar/stellar-docs/pull/2930 (via `gh pr view`, `gh pr diff`) — 21:01:46Z
- https://api.github.com/repos/stellar/stellar-docs/compare/378944a1c7497eb0aee9bd85aab185d5984321e4...main — 21:02:53Z
- https://api.github.com/repos/stellar/stellar-docs/commits?sha=main&path=docs/learn/fundamentals/stellar-data-structures/ledgers.mdx — 21:02:53Z
- https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx — 21:02:53Z
- https://github.com/stellar-experimental/stellar-raven/issues/316 (via `gh issue view`) — 21:02:53Z
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers — 21:02:06Z
- https://raw.githubusercontent.com/stellar/stellar-xdr/579a90b2654e3811e8b672e128a5e094c7325b27/Stellar-ledger.x — 21:02:27Z
- https://api.github.com/search/code?q=repo:stellar/stellar-docs+"denominated in lumens" — 21:03:15Z
- Production Raven `stellarDocs.search_docs` x3 (Mintlify discovery search) — 21:03:46Z
- https://horizon.stellar.org/ledgers?order=desc&limit=1 — 21:04:13Z
- https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0038.md — 21:04:16Z
