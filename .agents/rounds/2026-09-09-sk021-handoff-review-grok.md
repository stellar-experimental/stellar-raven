# sk-021 handoff review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
This reviewer is not the handoff author (`kaankacar`) and is not the orchestrator.
No subagent ran.
No repo file, finding, golden, manifest, or upstream issue was changed.
No paid call, deploy, signing, or funding occurred.

Checks: `2026-09-09T04:04:57Z` through `2026-09-09T04:07:29Z`.
Raven HEAD at review: `677ffe4cf1e526c964feb03f4b80ecd19731cdd1`.

## Verdict

**CHANGES-REQUIRED** for `fixed-upstream` retirement.

Issue `#136` is a valid upstream-ready notice.
The deployed canonical skill and `skills.stellar.org` no longer carry the original defect.
The accepted Raven pin still does.

**Precise safe action:** keep `sk-021` active at `reported-upstream`.
Do not drain it.
Do not re-pin skills in the clean-tree `#109` deploy.
After a later pin refresh that includes merge `711d6e29` or later matching `SKILL.md` bytes, re-run the original trigger against the accepted pin, then drain.

Do not post a comment in this lane.

## Sources

| Surface | State | Evidence |
| --- | --- | --- |
| Raven `#136` | open, author `kaankacar`, no comments | https://github.com/stellar-experimental/stellar-raven/issues/136 created `2026-09-09T03:50:04Z` |
| Upstream `#124` | closed `completed` by `kaankacar` | https://github.com/stellar/stellar-dev-skill/issues/124 filed by `kalepail` |
| PR `#127` | merged `2026-09-09T03:46:52Z` by `kaankacar` | merge `711d6e293b0ba6ae110db0ae307a4d7805a00b8a`; file `skills/smart-contracts/SKILL.md` only |
| PR checks | completed success | preview, CodeQL, Socket, Copilot, Analyze; combined status API is empty/`pending` |
| Pages deploy | success | Actions run `34308521287`, event `workflow_dispatch`, head `711d6e29`, `2026-09-09T03:48:15Z`–`03:49:05Z` |
| GitHub `main` | `d987f9ff8c4b8fcdf6bddd327337628fd9f48def` | later PR `#128` merged; `smart-contracts/SKILL.md` bytes still match `711d6e29` |
| Live skill | fixed | https://skills.stellar.org/skills/smart-contracts/SKILL.md SHA-256 `205faa248dd6c828da4679cee9bfdbf0d71d99269a9a469bafd526756b2a273e` |
| Canonical `main` raw | fixed | same SHA-256 as live and as `711d6e29` |
| Accepted pin `03b2f8e8` | still stale | SHA-256 `2561ecf136096d2418ff17f6eee896aaa1323d4e07fd8ea21e7352dc822835eb` |
| Horizon Mainnet | protocol 27 | `current_protocol_version` 27, `core_supported_protocol_version` 28 |
| Horizon Testnet | protocol 28 | `current_protocol_version` 28 |
| crates.io `soroban-sdk` | stable 27 | `max_stable_version` 27.0.6; `newest_version` `28.0.0-rc.1` |

## Original trigger

The original defect is a Protocol 27 RC example plus a Mainnet Protocol 26 comment.

Independent result at the accepted pin `03b2f8e8c88a42b16551926a938ec8173763b45a`:

```
soroban-sdk = "27.0.0-rc.1"  # protocol 27; pre-releases need the exact version string.
                             # Mainnet is on protocol 26 at the time of writing — use "26" there
```

That pin SHA-256 matches the finding.
`catalog/manifest.json` still serves that same commit for `skills/smart-contracts/SKILL.md`.
`ecosystem-skills/MANIFEST.json` still pins `stellar-dev` at `03b2f8e8`.
**Raven still serves the original defect.**

Independent result on the live deployed skill:

```
soroban-sdk = "27"  # protocol 27, which mainnet runs at the time of writing.
```

Live and `main` contain zero `Mainnet is on protocol 26` strings and zero `27.0.0-rc.1` strings.
Horizon Mainnet still reports protocol 27.

Upstream deployment is confirmed. That is not proof that Raven serves the new pin.

## Larger dependency change

The handoff is right that a comment-only 26→27 edit would contradict `27.0.0-rc.1`.
crates.io has stable `27.0.6`, so protocol 27 no longer needs a pre-release pin.
`soroban-sdk = "27"` is the correct current Mainnet example.
The remaining comment still tells the reader to check crates.io and the live protocol before deploy.

This review did not rerun a wasm `cargo build`.
crates.io metadata is enough to judge the stable-27 change.
Testnet protocol 28 and `28.0.0-rc.1` exist.
Keeping them out of the Mainnet example is correct.

## Residuals

1. Accepted pin `03b2f8e8` still has the original comment and RC pin.
2. Generated catalog URLs still point at that pin.
3. A later `main` commit exists (`d987f9ff`, PR `#128`). It does not change this `SKILL.md`.
4. No other `sk-021` golden `rootCause` link exists.
5. Goldens that mention Protocol 26 are other cases (`sd-008`, Yardstick history). They are not this finding.

## Reference cleanup

Do not clean up now.

When the accepted pin serves the fixed `SKILL.md` bytes, later drain work will need:

- delete `improvements/skills/sk-021-smart-contracts-mainnet-protocol-comment-stale.md`
- remove intake override `sk-021`
- regenerate `improvements/INDEX.md`
- append `improvements/resolved.json`

No golden case cites `sk-021`.
No probe frontmatter exists.
Historical round notes may keep the ID.

A pin refresh is own-repo work.
It needs `ecosystem-skills/update.sh`, a new `PIN-REVIEW.md` `sel:` entry, and catalog rebuild.
Do not do that in the `#109` clean-tree deploy.

## Classification

| Question | Answer |
| --- | --- |
| Is `#136` a real handoff for `sk-021`? | Yes. Author `kaankacar`. Finding ID and refs match. |
| Is upstream source deployed and fixed? | Yes. Pages run `34308521287` succeeded. Live bytes match merge `711d6e29`. |
| Does the original trigger still reproduce on Raven? | Yes. Accepted pin `03b2f8e8` still has the Protocol 26 comment. |
| Eligible for `fixed-upstream` deletion? | No. Remaining accepted-pin/source gate. |
| Own-repo successor needed? | No. Pin refresh is the remaining gate, not a new upstream defect. |

## Safe action

Keep `sk-021` at `reported-upstream` with https://github.com/stellar/stellar-dev-skill/issues/124.
Leave Raven `#136` open until a pin refresh is verified.
Do not comment, close, re-pin, or drain in this window.
After the pin includes `711d6e29` or later matching live `SKILL.md` bytes, re-fetch the accepted-pin skill, confirm the Protocol 26 comment is gone, then retire.
