# Approved free repository-recovery probe

- Date: 2026-08-31
- Server: existing local server at port 8788
- Method: `/tmp/repo_recovery_free_probe.mjs`
- Scope: two free `execute` calls

| Probe | Question | Repository | generatedAt | answerSource | scannedRef | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| Horizon freshness | Which Horizon ingestion constant pins the highest supported protocol version, and what is its value? | `stellar/stellar-horizon` | `2026-08-31T01:42:10.098Z` | `deepwiki` | `82660510ecda7fd365a14d08badb9d85fa22bc32` | Returned `MaxSupportedProtocolVersion = 25`. The `sls-080` recurrence is recorded. The freshness trigger did not fire. |
| Stellar CLI local config | How does local_config find the local Stellar CLI configuration directory, including the fallback when no ancestor contains .stellar or .soroban? | `stellar/stellar-cli` | `2026-08-31T01:42:31.077Z` | `deepwiki` | `null` | Returned the ancestor search and the `<cwd>/.stellar` fallback. The unverified candidate is removed from the active queue. |

The probe records no recovery receipt or full response payload.
The Docs-versus-repository synthesis pattern remains monitor-only.
No paid rerun may occur until the Horizon probe returns `28`.
The stored v2 result remains a FAIL.
