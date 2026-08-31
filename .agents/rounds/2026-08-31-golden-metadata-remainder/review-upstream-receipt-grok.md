# Upstream filing receipt review — sd-047

Mode: audit. No repository edit except this report.
Checked at: 2026-08-31T14:30:14Z.
Command for the public issue: `gh api repos/stellar/stellar-docs/issues/2805 --jq .body` (exact body; not the HTML-escaped MCP reader).

## Verdict

**PASS**

The public issue matches the committed snapshot. Local status and URL match the issue. The TODO item is gone. NEXT block 1 is complete.

## Public issue (GitHub)

| Field | Value |
|---|---|
| URL | https://github.com/stellar/stellar-docs/issues/2805 |
| Number | 2805 |
| State | open (`closed_at` null) |
| Title | The Validators introduction says ledgers close every 3-5 seconds while the Stellar Stack page says every 5-7 seconds |
| Author | `kalepail` (`MEMBER`) |
| Labels | `raven` |
| Created | 2026-08-31T14:27:45Z |
| Updated | 2026-08-31T14:27:45Z |
| Body length | 6115 |

Title equals local `upstreamTitle`.

## Issue body contract

| Check | Result |
|---|---|
| Generated marker `<!-- generated-by-stellar-raven -->` | present as the first line |
| Automated notice (`[!NOTE]`, Stellar Raven, verify the live surface) | present |
| `## Finding` | present; byte-equal to `0916e09` Finding |
| `## Evidence` | present; starts with the `0916e09` Evidence prose, then `Additional recorded evidence:` listing the 12 snapshot bullets |
| `## Recommendation` | present; byte-equal to `0916e09` Recommendation |
| `## Source Record` | present |
| `## Resolution Handoff` | present |
| Public main link | https://github.com/stellar-experimental/stellar-raven/blob/main/improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md — GitHub contents API returns this `html_url` |
| Immutable snapshot | `0916e09805909f41a34d08abbde1995f7bc94a8e` (`0916e09`); blob sha `607c421758cf6fc802e0e44f9b61e12f22c0db3e`, size 4751; same blob on `main` |
| Handoff | `upstream-improvement-ready.yml` with `sd-047` in the title query |
| `raven` label | present |

`main` HEAD is `0916e09805909f41a34d08abbde1995f7bc94a8e` (PR #106, 2026-08-31T14:26:43Z). The issue was opened 62 seconds later. The snapshot is the committed finding that was filed, not a later local edit.

The snapshot status is `verified` and does not contain the issue URL. That is the correct pre-filing blob. The local file then added the URL and moved status to `reported-upstream`.

## Local finding vs public issue

| Check | Local file | Public issue |
|---|---|---|
| Status | `reported-upstream` | open issue 2805 |
| Evidence URL | `https://github.com/stellar/stellar-docs/issues/2805` | same URL |
| INDEX.md | `sd-047` row `reported-upstream` | n/a |

Match.

## TODO and NEXT

- `.agents/TODO.md` has no Goldens item and no `sd-047` filing task. The prior “File `sd-047` with the Stellar Docs owner” item is deleted. That matches the TODO rule: delete when done.
- `.agents/NEXT.md` states `sd-047` is `reported-upstream` at issue 2805, PR #106 merged as `0916e09`, and Block 1 is complete. Suggested sequence starts at block 2. That is true.

## Round ledger

`.agents/rounds/2026-08-31-golden-metadata-remainder.md` records the merge `0916e09` and the filing at issue 2805, with the `raven` label, generated marker, public source record, immutable snapshot, and resolution handoff. Remaining block-1 action is none.

## Remaining notes (not FAIL)

- The issue Evidence line “No Stellar Docs issue or pull request mentions 3-5 seconds on 2026-08-31” is the pre-filing search result copied from the snapshot. Issue 2805 exists now. Keep that line as dated search evidence.
- The snapshot on `main` still shows `status: verified` until the receipt commit lands. The Source Record links that committed blob, which is the filing source.

## Remaining findings

None.
