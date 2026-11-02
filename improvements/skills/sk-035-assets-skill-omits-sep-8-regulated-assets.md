---
id: sk-035
service: skills
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Assets and Standards skills claim regulated-asset coverage but never mention SEP-8 or an approval server"
evidence:
  - "2026-11-02T21:23Z stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 skills/assets/SKILL.md line 3 (description): 'Covers asset issuance, distribution, authorization flags, clawback, regulated assets, trustline management...'. Line 17: 'Building regulated-asset flows (compliance, KYC, freeze)'. The 'SEP Standards for Assets' section (line 483 on) lists SEP-0001, SEP-0010, and SEP-0024 only."
  - "skills/standards/SKILL.md 'High-value SEPs for app developers' lists SEP-0041, 0046, 0048, 0049, 0050, 0055, 0056, 0057, 0010, 0023, 0001, 0006, 0024, 0031, 0012. SEP-0008 is absent."
  - "A grep of all 13 downloaded skill files (smart-contracts, assets, data, dapp, standards) for 'SEP-8', 'SEP-0008', 'sep-0008', and 'approval server' returned 0 matches."
  - "2026-11-02 https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0008.md preamble: 'SEP: 0008', 'Title: Regulated Assets', 'Status: Active', 'Version 1.7.4'. Simple Summary: 'Regulated Assets are assets that require an issuer’s approval (or a delegated third party’s approval, such as a licensed securities exchange) on a per-transaction basis.'"
  - "The assets skill teaches AUTH_REQUIRED and trustline authorization (lines 172-200), which is the classic-asset mechanism that SEP-8 builds on."
  - "2026-11-02T22:03:35Z skills/standards/SKILL.md on main (313832e) line 62: '[SEP-0057](...): Regulated token patterns (T-REX)'; line 101: '3. If regulated, review SEP-0057 patterns.' sep-0057.md on stellar/stellar-protocol master: 'Title: T-REX (Token for Regulated EXchanges)', 'Status: Draft'. SEP-0057 is a smart-contract permissioned-token suite; SEP-0008 is the classic per-transaction approval server. They are different standards."
  - "Review rv-hm 2026-11-02T21:50Z: a grep of every skills/**/*.md file on main for 'SEP-8', 'SEP-0008', and 'approval server' found zero matches."
  - "Dedupe 2026-11-02: no stellar/stellar-dev-skill issue or PR (all states) mentions SEP-8 or regulated assets; no Raven finding covers it."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R30."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-dev-skill/issues/165
---

## Finding

The Assets skill says it covers "regulated assets" and "regulated-asset flows".
No skill in `stellar/stellar-dev-skill` mentions SEP-8 (Regulated Assets, status Active).
No skill mentions an approval server or the per-transaction approval flow.
SEP-0008 is the classic per-transaction approval server, and it is a different standard from SEP-0057 (T-REX), which the standards skill names for regulated tokens.

The assets skill teaches `AUTH_REQUIRED` and trustline authorization only.
SEP-8 adds the issuer approval server, the `approval_server` and `approval_criteria` fields in `stellar.toml`, and the wallet flow.
An agent that routes a regulated-asset task to this skill does not learn the standard.

## Evidence

A grep of every skill file at `main` for `SEP-8`, `SEP-0008`, and `approval server` returns no match.
The SEP-8 preamble on `stellar/stellar-protocol` master says `Status: Active`, `Version 1.7.4`.

## Recommendation

Add a short "SEP-0008 (Regulated Assets)" entry to the "SEP Standards for Assets" section of the assets skill.
State when to use it, and name the `stellar.toml` fields and the approval-server request flow.
Add SEP-0008 to the standards skill list, next to SEP-0057.
