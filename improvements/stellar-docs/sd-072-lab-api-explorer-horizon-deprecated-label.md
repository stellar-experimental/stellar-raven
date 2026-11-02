---
id: sd-072
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Lab API Explorer card says Horizon is deprecated; other pages say it is nearing end-of-life
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/tools/lab/api-explorer returned HTTP 200 with the Horizon Endpoints card text "Horizon is considered deprecated."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/tools/lab/api-explorer/index.mdx line 13; the file was last changed by the Mintlify migration commit 700ed32d (2026-10-22)
  - the same docs commit uses "nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs" in docs/data/apis/index.mdx line 30, docs/learn/fundamentals/stellar-stack.mdx line 37, and docs/tools/lab/api-explorer/horizon-endpoint.mdx lines 3 and 8
  - a repository grep of docs/ at the same commit finds "considered deprecated" only in api-explorer/index.mdx
  - predecessor fix stellar/stellar-docs#2592 and stellar/stellar-docs#2620 (merged 2026-07-16; Raven record sd-017) unified the Horizon lifecycle label; this card is a regression from migration commit 700ed32d, which replaced the Docusaurus <DocCardList /> with a hard-coded card
  - 2026-11-02T20:08:06Z recheck - GET https://developers.stellar.org/docs/tools/lab/api-explorer.md returned HTTP 200 with "Horizon is considered deprecated."; stellar/stellar-docs main 5142b219d3ead7605cc1d9dd661582c653664ec5 docs/tools/lab/api-explorer/index.mdx line 13 is unchanged
  - golden case q-infra-horizon-vs-rpc (golden audit pass 2, 2026-11-02)
---

## Finding

The Lab API Explorer index page says "Horizon is considered deprecated." in its Horizon Endpoints
card. Every other current page uses the agreed label: Horizon is nearing end-of-life and will
eventually be deprecated.

The Mintlify migration (stellar/stellar-docs#2941) added the card text. Issue
stellar/stellar-docs#2592 and pull request stellar/stellar-docs#2620 had removed the same
contradiction before.

A reader can tell users that Horizon is already deprecated.

## Evidence

The live card text is "Horizon is considered deprecated." The linked Horizon Endpoints page says:
"Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and
Portfolio APIs." The APIs overview and the Stellar Stack page use the same sentence.

A grep of `docs/` at commit `7cb5e8a4` finds "considered deprecated" in one file only:
`docs/tools/lab/api-explorer/index.mdx`.

## Recommendation

Change the card text to "Horizon is nearing end-of-life and will eventually be deprecated in
favor of Stellar RPC and Portfolio APIs." The Horizon Endpoints page description already has this
text.
