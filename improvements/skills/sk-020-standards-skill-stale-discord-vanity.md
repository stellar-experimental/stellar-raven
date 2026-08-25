---
id: sk-020
service: skills
status: reported-upstream
discovered: 2026-08-25
upstreamTitle: The Discord invite in the standards skill now points at an unrelated server
evidence:
  - "pinned body: stellar/stellar-dev-skill @ 1f4b94e01ca24a2c00cb3b2cb3fcf6d07ad76462, skills/standards/resources.md line 233 — `[Stellar Developers Discord](https://discord.gg/stellar)`"
  - "same defect on main: stellar/stellar-dev-skill skills/standards/resources.md line 233 and README.md line 126"
  - "live probe 2026-08-25: GET https://discord.com/api/v10/invites/stellar?with_counts=true returns guild 1035847967111913522 \"Wraith Studio\", vanity_url_code \"stellar\", 4055 members, landing channel \"security-trap\""
  - "live probe 2026-08-25: GET https://discord.com/api/v10/invites/stellardev?with_counts=true returns guild 897514728459468821 \"Stellar Developers\", vanity_url_code \"stellardev\", 32774 members"
  - "canonical use: developers.stellar.org and its llms.txt both link discord.gg/stellardev"
  - "org-wide verification 2026-08-25: all 41 GitHub code-search hits fetched and checked; only 3 lines in 2 repositories carry the stale code"
  - "upstream issue filed 2026-08-25: https://github.com/stellar/stellar-dev-skill/issues/113"
  - "related upstream issue filed 2026-08-25: https://github.com/stellar/ecosystem-resources/issues/9"
---

## Finding

The `standards` skill tells agents that the Stellar Developers Discord is
`https://discord.gg/stellar`. That vanity code no longer belongs to Stellar. It
now resolves to a guild named "Wraith Studio", and the invite lands in a channel
named `security-trap`.

The correct invite is `https://discord.gg/stellardev`, which resolves to the
"Stellar Developers" guild with 32,774 members. `developers.stellar.org` and its
`llms.txt` already use that code.

Raven serves the affected section. An agent that answers "where is the Stellar
Discord?" from this skill sends the user into a third-party server. The listed
section is the community and developer-resources block, so the wrong link
appears exactly where a newcomer asks for help.

This is a link-rot defect, not a typo. A released Discord vanity code can be
claimed by any guild that reaches the required boost level, so the old code now
carries a live destination rather than a 404. That removes the usual link-check
signal.

## Evidence

The live probes above ran on 2026-08-25 against the Discord invites API. Both
codes report a `vanity_url_code`, so both are current vanity claims and neither
is a stale redirect.

The defect reproduces at the commit Raven pins and on `main`, so re-pinning does
not resolve it.

Scope was verified by fetching every file, not by search counts. A GitHub code
search for `discord.gg/stellar` across the `stellar` org returns 41 files, but
that query is a substring match and `discord.gg/stellar` is a prefix of the
correct `discord.gg/stellardev`. After fetching all 41 files from their default
branches, the stale code survives in three lines across two repositories:
`stellar/stellar-dev-skill` (`skills/standards/resources.md:233`,
`README.md:126`) and `stellar/ecosystem-resources` (`learning/README.md:181`).
Every other file already uses `stellardev`.

## Recommendation

In `stellar/stellar-dev-skill`, change `skills/standards/resources.md` line 233
and `README.md` line 126 to `https://discord.gg/stellardev`.

Ask the Discord administrators whether the `stellar` vanity code can be
reclaimed. While another guild holds it, a stale reference is an active
misdirection rather than a broken link.

A prefix-safe pattern is required whenever this class of defect is re-checked.
Match `discord.gg/stellar` only when it is not followed by more word
characters; a plain substring search reports every correct link as a hit.
