---
id: sd-050
service: stellar-docs
status: verified
discovered: 2026-09-04
upstreamTitle: JavaScript SDK page names an unusable unscoped npm package
evidence:
  - 2026-09-04 live read of https://developers.stellar.org/docs/tools/sdks/client-sdks says `stellar-sdk` is the JavaScript library
  - 2026-09-04 live read of https://github.com/stellar/js-stellar-sdk shows npm install --save @stellar/stellar-sdk
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-tool-js-sdk-package copied the unscoped name and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
---

## Finding

The JavaScript SDK section calls the package `stellar-sdk`.
The official SDK repository installs `@stellar/stellar-sdk`.

The page links to the scoped npm package.
Its prose still leads readers to the unscoped install command.
The candidate answer copied that command and was wrong.

## Evidence

On 2026-09-04, the Client and XDR SDKs page said `stellar-sdk` is the JavaScript library.
The current official SDK repository said `npm install --save @stellar/stellar-sdk`.

The difference is material for an npm installation command.
The source page was last updated on 2026-09-02.

## Recommendation

Name `@stellar/stellar-sdk` whenever the page refers to the npm package.
If `stellar-sdk` remains the library label, define it as a display name.
Do not present it as an installable package name.
