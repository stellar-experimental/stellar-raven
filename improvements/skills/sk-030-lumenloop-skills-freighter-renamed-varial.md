---
id: sk-030
service: skills
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Six Lumenloop skill files still name Freighter after the wallet became Varial
evidence:
  - 2026-11-02 public recheck: curl -sS -L https://codeload.github.com/lumenloop/lumenloop-skills/tar.gz/refs/heads/main returned HTTP 200. gh api repos/lumenloop/lumenloop-skills/commits/main identified a87ca95730d2a4015c884defebd66b44ea01d3b2 (2026-10-12). rg -n -i "freighter|varial" found eight Freighter lines across six SKILL.md files and no Varial line.
  - 2026-11-02 adjacent calibration adds two missed files: skills/lumenloop-mcp-connect/SKILL.md:39 and skills/stellar-ecosystem-scout/SKILL.md:33. The earlier four-file finding omitted both repeated build-stack summaries.
  - 2026-11-02 public recheck: GET https://raw.githubusercontent.com/stellar/freighter/master/README.md and https://stellar.org/blog/foundation-news/freighter-is-now-varial each returned HTTP 200. The README names Varial; the SDF announcement confirms the rename. gh api repos/stellar/freighter/releases/tags/5.50.0 reports published_at=2026-10-29T20:32:42Z. This dates the public announcement, not the earliest rebrand commit.
  - 2026-11-02 calibration: the eight affected lines contain prose wallet names, not executable wallet SDK snippets. The recommendation changes display names only. SDK migration is outside this finding.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among three issues and two PRs in lumenloop/lumenloop-skills. ll-032 concerns the separate directory record. No other active or resolved skill record owns this rename.
  - Golden provenance: q-ti-skill-builder-quickstart and q-ti-skill-integration-finder exposed the stale wording on 2026-11-02. Neither case grades the wallet name.
  - The earlier four-file source verification matched the Raven pin d92c56bda17ab702d3202335cfe814d64e70e191. This correction targets current upstream files.
  - upstream issue filed 2026-11-02: https://github.com/lumenloop/lumenloop-skills/issues/6
---

## Finding

Six Lumenloop skill files still name the wallet Freighter and omit its current name, Varial.
SDF announced the rename on 2026-10-29.
The eight affected lines describe current build stacks.
Users can have difficulty matching the recommended wallet to its current product name.

## Evidence

A fresh download of the source archive returned HTTP 200 on 2026-11-02.
The main commit was `a87ca95730d2a4015c884defebd66b44ea01d3b2`, dated 2026-10-12.
A repository-wide search found these eight lines and no `Varial` line:

| File under `skills/` | Lines |
|---|---|
| `stellar-project-dossier/SKILL.md` | 36 |
| `stellar-ecosystem-digest/SKILL.md` | 34 |
| `stellar-builder-quickstart/SKILL.md` | 39, 134 |
| `stellar-integration-finder/SKILL.md` | 34, 149 |
| `lumenloop-mcp-connect/SKILL.md` | 39 |
| `stellar-ecosystem-scout/SKILL.md` | 33 |

The [SDF announcement](https://stellar.org/blog/foundation-news/freighter-is-now-varial) confirms the new name.
The [wallet README](https://raw.githubusercontent.com/stellar/freighter/master/README.md) identifies Varial as the wallet previously named Freighter.
The source files predate the public rename.
The earlier four-file count missed two repeated build-stack summaries.

## Recommendation

Update all eight prose references across the six files.
Use `Varial (formerly Freighter)` at the first mention in each file.
Use `Varial` for later mentions.
These prose changes do not require an SDK migration.
