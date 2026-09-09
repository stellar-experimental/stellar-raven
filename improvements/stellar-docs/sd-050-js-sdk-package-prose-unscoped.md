---
id: sd-050
service: stellar-docs
status: reported-upstream
discovered: 2026-09-04
upstreamTitle: JavaScript SDK page names the deprecated unscoped stellar-sdk package
evidence:
  - 2026-09-09 independent Grok review found the existing open issue https://github.com/stellar/stellar-docs/issues/2561, authored by oceans404. Root read back its body and state. It explicitly requests the scoped package name throughout the same section. No duplicate issue or reminder comment was posted.
  - 2026-09-08 fresh stellar/stellar-docs main read reproduced the unscoped prose at commit db501fe9; source SHA-256 fd57c064ac74c436e30ad1e5f4eb92941a0cfffda1f3a785d153f27bbe562fa2. npm still serves deprecated `stellar-sdk` 13.3.0 from 2025-04-21 and scoped `@stellar/stellar-sdk` 17.0.1 from 2026-08-25. Full metadata SHA-256 values are 155b0eac26b840ce952f7045de875e0b6319b9e7e541570f2a0d22ec131590df and 63d5addf201cfc919e2d788df1f2ca7f71211b888dc1466f52fa356deef9513b.
  - 2026-09-04 live read of https://developers.stellar.org/docs/tools/sdks/client-sdks says `stellar-sdk` is the JavaScript library
  - 2026-09-04 live read of https://github.com/stellar/js-stellar-sdk shows npm install --save @stellar/stellar-sdk
  - 2026-09-04 npm registry read shows stellar-sdk latest 13.3.0 published 2025-04-21 with a deprecation notice that points to @stellar/stellar-sdk, and @stellar/stellar-sdk latest 17.0.1 published 2026-08-25
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-tool-js-sdk-package copied the unscoped name and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-review-opus.md records the independent review and this correction
---

## Finding

The JavaScript SDK section calls the package `stellar-sdk`.
The official SDK repository installs `@stellar/stellar-sdk`.

The page links to the scoped npm package.
Its prose still names the unscoped package as the library.
A reader can use that name as an npm package name.

## Evidence

On 2026-09-04, the Client and XDR SDKs page said `stellar-sdk` is the JavaScript library.
The current official SDK repository said `npm install --save @stellar/stellar-sdk`.

The page itself shows no install command.
The unscoped name is still installable on npm.
The install succeeds and returns the deprecated package.
No error tells the reader about the stale result.

On 2026-09-04, npm served `stellar-sdk` 13.3.0 from 2025-04-21 with a deprecation notice.
It served `@stellar/stellar-sdk` 17.0.1 from 2026-08-25.
A reader who uses the prose name gets a package four major versions behind.

The source page was last updated on 2026-09-02.

## Recommendation

Name `@stellar/stellar-sdk` whenever the page refers to the npm package.
If `stellar-sdk` remains the library label, define it as a display name.
Do not present it as an installable package name.
