---
id: sd-035
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Replace legacy Wallets Kit v1 references in current tutorials
evidence:
  - re-verified 2026-07-14: docs/build/apps/example-application-tutorial/overview.mdx installs @creit.tech/stellar-wallets-kit (line 199) and lists it in Vite ssr.noExternal (line 254)
  - premise correction 2026-07-27: the maintainer corrected this record on https://github.com/stellar/stellar-docs/issues/2609#issuecomment-5035729421 - the dotted npm scope is not legacy-v1-only; npm dist-tag latest is 2.5.0 (published 2026-06-29), which is exactly why an unpinned install broke against v1 tutorial code
  - upstream stopgap https://github.com/stellar/stellar-docs/pull/2659 merged 2026-07-21 pins the tutorial install to @^1; the issue stays open for the durable v2 migration of this tutorial and stellar/basic-payment-app in lockstep
  - re-verified 2026-07-15: the former Spanish dapp-frontend translation no longer exists on main, so its stale Wallets Kit section is resolved by removal; the English Example Application tutorial still contains the legacy package scope
  - re-verified 2026-07-14: the English docs/build/apps/dapp-frontend.mdx has no @creit, allowAllModules, or StellarWalletsKit reference; the former tools/developer-tools/wallets page is link-out only and is not evidence for this finding
  - current maintainer sources: JSR lists @creit-tech/stellar-wallets-kit 2.5.0 as latest (published 2026-06-29), and the current kit README/init guide uses static StellarWalletsKit.init with defaultModules
  - independent Fable review in Solo scratchpad 639 re-ran the sources and identified the original tools/wallets claim as false while confirming these tutorial/translation residuals
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2609
  - narrowed residual posted and read back 2026-07-15: https://github.com/stellar/stellar-docs/issues/2609#issuecomment-4982273197
  - premise correction acknowledged upstream 2026-07-27: https://github.com/stellar/stellar-docs/issues/2609#issuecomment-5091976739
recurrences:
  - date: 2026-08-11
    evidence: live main source keeps the @^1 pin and explicitly says the tutorial uses new StellarWalletsKit(...) until the joint v2 migration. Issue #2609 remains open; the latest maintainer comment is ElliotFriend's 2026-07-21 stopgap note. PR #2659 remains merged with all recorded checks successful and kaankacar approval.
---

## Finding

One current Docs tutorial surface still teaches the Wallets Kit v1 API. The
English Example Application tutorial installs `@creit.tech/stellar-wallets-kit`
and includes that scope in its Vite SSR configuration, while its example code
uses the v1 constructor form.

An earlier version of this record called that npm scope "legacy" and v1-only.
The docs maintainer corrected that on #2609 and is right: npm still publishes
v2 under the dotted scope (dist-tag `latest` is 2.5.0, published 2026-06-29).
That is precisely why the unpinned install broke — it resolved to v2 against
v1-era tutorial code. PR #2659 landed a stopgap pinning the install to `@^1`.

The durable gap remains: the tutorial teaches the v1 constructor API rather
than static `StellarWalletsKit.init(...)` with `defaultModules()`, and the fix
has to move this tutorial and `stellar/basic-payment-app` together. The former
Spanish `dapp-frontend` translation is no longer present on `main` and is not
an active residual.

## Evidence

Live source re-check on 2026-07-14:

- https://github.com/stellar/stellar-docs/blob/main/docs/build/apps/example-application-tutorial/overview.mdx#L195-L203
- https://github.com/stellar/stellar-docs/blob/main/docs/build/apps/example-application-tutorial/overview.mdx#L252-L257
- https://github.com/stellar/stellar-docs/blob/main/docs/build/apps/dapp-frontend.mdx
- https://jsr.io/@creit-tech/stellar-wallets-kit
- https://github.com/Creit-Tech/Stellar-Wallets-Kit/blob/main/README.md
- https://github.com/Creit-Tech/Stellar-Wallets-Kit/blob/main/docs/files/how-to/init.md

The Wallet Integration page at
https://developers.stellar.org/docs/tools/developer-tools/wallets was separately
checked. It only links to the maintained Kit site and contains no package or
API example; it is deliberately excluded from this finding.

## Recommendation

Migrate the Example Application tutorial and `stellar/basic-payment-app` to the
v2 API in lockstep: static `StellarWalletsKit.init(...)` with `defaultModules()`
or explicitly selected modules, and the JSR distribution the kit maintainer
prefers. The `@^1` pin from #2659 is the right interim state; the durable fix is
the API migration, not a scope swap, since npm serves both major versions.
