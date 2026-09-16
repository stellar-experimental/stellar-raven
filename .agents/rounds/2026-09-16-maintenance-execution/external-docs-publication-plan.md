# External Docs repair publication plan

The local patches repair two existing Stellar Docs pull requests.

- [PR #2837](https://github.com/stellar/stellar-docs/pull/2837): remove unsupported audit claims, batch RPC reads, and correct environment and cancellation text.
- [PR #2844](https://github.com/stellar/stellar-docs/pull/2844): apply the two existing maintainer wording suggestions.

Both patches passed formatting and full production builds. Neither patch changes a route.
The [independent patch review](docs-repair-independent-review.md) accepted both final patches.

Proposed publication uses normal commits on the existing branches. It uses no force push.
The current remote heads must still match each reviewed base before publication.
After publication, the exact new heads need passing CI and required upstream approval.
PR #2837 retains its author hold until its author explicitly resolves that hold.
A publication approval must not imply authority to remove that hold.

The [patch identities](docs-repair-patch-identities.json) record the reviewed inputs.
The published patches are [#2837](https://github.com/stellar/stellar-docs/commit/108ba24e0884f46e0c543996e4e94be754709840) and [#2844](https://github.com/stellar/stellar-docs/commit/581b884e20f3ec7e39f9fac64539ff1922d93f6d).
The user authorized both publications. Both normal pushes completed.
PR #2837 now has commit `108ba24e0884f46e0c543996e4e94be754709840`.
PR #2844 now has commit `581b884e20f3ec7e39f9fac64539ff1922d93f6d`.
Both remote heads were read back. CI remains in progress.
The PR #2837 author hold remains unchanged.
Both commits passed the upstream formatting and relative-link hooks.
Gitleaks found no secrets in either patch.
The hook used temporary Corepack `0.34.6`, compatible with the existing Node `24.13.0`.
No global tool or dependency manifest changed.
