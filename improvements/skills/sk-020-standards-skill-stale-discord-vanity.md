---
id: sk-020
service: skills
status: fixed-upstream
discovered: 2026-08-25
upstreamTitle: The Discord invite in the standards skill now points at an unrelated server
evidence:
  - "pinned body: stellar/stellar-dev-skill @ 1f4b94e01ca24a2c00cb3b2cb3fcf6d07ad76462, skills/standards/resources.md line 233 — `[Stellar Developers Discord](https://discord.gg/stellar)`"
  - "second affected line at the same commit: README.md line 126 (source repo only; Raven does not catalog that file)"
  - "live probe 2026-08-25: GET https://discord.com/api/v10/invites/stellar?with_counts=true returns guild 1035847967111913522 \"Wraith Studio\", vanity_url_code \"stellar\", ~4054 members, landing channel \"🚨・security-trap\""
  - "live probe 2026-08-25: GET https://discord.com/api/v10/invites/stellardev?with_counts=true returns guild 897514728459468821 \"Stellar Developers\", vanity_url_code \"stellardev\", ~32775 members"
  - "canonical use: developers.stellar.org and stellar/stellar-docs static/llms.txt both link discord.gg/stellardev"
  - "upstream issue filed 2026-08-25: https://github.com/stellar/stellar-dev-skill/issues/113 (CLOSED COMPLETED)"
  - "upstream fix merged 2026-08-25T20:41:22Z: PR https://github.com/stellar/stellar-dev-skill/pull/114, merge commit db82b5dec15be462745f6f0da8a0f7779b2cb748"
  - "author-side live re-check 2026-08-25: raw main skills/standards/resources.md line 233 and README.md line 126 both read discord.gg/stellardev"
  - "related upstream issue still open: https://github.com/stellar/ecosystem-resources/issues/9 (learning/README.md line 181)"
  - "independent review 2026-08-25 by three agents (gpt-5.6-sol high, claude-fable-5, grok-4.6 high); all three refuted the original scope wording"
---

## Finding

The `standards` skill told agents that the Stellar Developers Discord is
`https://discord.gg/stellar`. That vanity code does not belong to Stellar. It
resolves to a guild named "Wraith Studio", and the invite lands in a channel
named `🚨・security-trap`.

The correct invite is `https://discord.gg/stellardev`, which resolves to the
"Stellar Developers" guild. `developers.stellar.org` already uses that code.

Upstream fixed both affected lines in PR #114 on 2026-08-25.

Raven re-pinned `stellar-dev` to `b78983c9` in the same change that records
this line, so the catalog no longer carries the old code. The production
deployment still serves the previous pin until this change ships.

The section is `searchable: false`, so it never arrives as a ranked `search`
hit. It stays reachable by exact id through `codemode.skill.read`, and the
parent skill advertises it in `availableSections`.

This is a link-rot defect, not a typo. A released Discord vanity code can be
claimed by another guild. The old code therefore returns a live destination
instead of a 404, and an ordinary link check passes.

## Evidence

The live probes above ran on 2026-08-25 against the Discord invites API. Both
codes report a `vanity_url_code`, so both are current vanity claims. Member
counts are snapshots and move between probes.

Scope was verified by fetching every candidate file, not by counting search
results. A GitHub code search for `discord.gg/stellar` across the `stellar` org
returns tens of files, but that query is a substring match and
`discord.gg/stellar` is a prefix of the correct `discord.gg/stellardev`. An
earlier revision of this record repeated that inflated count. It was wrong.

At the time of filing, three lines on default branches carried the stale code.
After PR #114 merged, one remains: `stellar/ecosystem-resources`
`learning/README.md` line 181, tracked in issue #9.

Independent review also found stale copies outside default branches: four
`stellar-dev-skill` feature branches, and `gh-pages` PR-preview paths under
`skills.stellar.org/pr/`. Those are not Raven's pin surface.

## Recommendation

Upstream is fixed; no further action is required in `stellar/stellar-dev-skill`.

The re-pin and catalog rebuild are done. After this change deploys, confirm by
live `skill.read` that `file:resources.md` returns `stellardev`. Delete this
record only after that check passes and a distinct reviewer confirms it.

Use an explicit character class when re-checking this defect class. Match
`discord\.gg/stellar([^A-Za-z0-9]|$)`. A `\b` word boundary silently matches
nothing under macOS `git grep -E`, and a plain substring search reports every
correct link as a hit.
