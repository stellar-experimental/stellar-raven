# Skill-source license audit — 2026-08-22

Lane: safe license-audit sub-task of Solo todo 1874 ("CD-03 — Upstream proxy
authorization"). Question: do the licenses of every pinned third-party skill source permit
Raven to retrieve, render, and expose the committed skill content?

Author: ox-alpha research worker (`ox-alpha-skill-license-audit`, Solo process 5023).
Repaired after independent adversarial review (todo 1874 comment 5213, same day).

Method: primary sources only — `ecosystem-skills/MANIFEST.json` at audited commit `5f31ad2`,
license files fetched from `raw.githubusercontent.com` at each exact pinned commit,
recursive git-tree listings and commit metadata from the GitHub API at those commits, skill
frontmatter read at those commits, and `catalog/manifest.json` plus `src/skills/store.ts`
read locally. Every external fetch used the pinned SHA, not a moving ref.

**Scope statement.** This report separates what each license text says from how it may apply
to Raven's implementation. It records explicit grants and conditions as license facts and
marks every application question to Raven's API behavior as unresolved. **This report is
evidence for counsel; it is not legal advice.** No compliance attestation should rely on it.

## 1. Canonical source inventory (discovered, not assumed)

The canonical inventory is [`ecosystem-skills/MANIFEST.json`](../ecosystem-skills/MANIFEST.json)
(`synced_at` 2026-08-19T21:16:50Z, `status: complete`). It pins **20 public skills across 4
upstream repositories**, one commit SHA per repository and one git blob hash per file. Bodies
are referenced, never vendored ([PLAN.md](../PLAN.md) §3;
[THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)).

Reconciled against the generated [`catalog/manifest.json`](../catalog/manifest.json) at the
audited commit. Operations and skills are separate surfaces; every skill entry uses the catalog
service `skills`, so no operation count belongs to any skill source.

**Exposed operations by service:**

| Service | Exposed operations |
| --- | --- |
| `lumenloop` | 18 |
| `scout` | 29 |
| `stellarDocs` | 12 |
| **Total** | **59** |

**Skill sources (pins vs exposure):**

| Skill source | Pinned skills | Exposed skills | Exposed skill-sections |
| --- | --- | --- | --- |
| `lumenloop` | 8 | 7 | 61 |
| `openzeppelin-stellar` | 3 | 3 | 13 |
| `stellar-dev` | 8 | 8 | 83 |
| `stellar-light` | 1 | 1 | 16 |
| **Total** | **20** | **19** | **173** |

The single pinned-but-unexposed skill is `skills/lumenloop-mcp-connect`
(`skills.lumenloop.lumenloop-mcp-connect`); ADR-0003 build-time exposure filtering excludes it
([PLAN.md](../PLAN.md) §3, [scripts/exposure.mjs](../scripts/exposure.mjs)). Its body is never
served. The remaining 19 exposed skills map 1:1 onto the pins listed in §2.

## 2. Per-source audit

### 2.1 `lumenloop` — lumenloop/lumenloop-skills @ `d92c56b`

| Field | Value |
| --- | --- |
| Repository | https://github.com/lumenloop/lumenloop-skills |
| Pinned revision | `d92c56bda17ab702d3202335cfe814d64e70e191` (2026-06-16T03:06:57Z, verified via GitHub API) |
| License identifier | **MIT** (verbatim "MIT License", © 2026 LumenLoop) |
| License file at pin | `LICENSE` — https://github.com/lumenloop/lumenloop-skills/blob/d92c56bda17ab702d3202335cfe814d64e70e191/LICENSE |
| Tree scan at pin | 41 files, recursive, not truncated; found only the recorded license-like filename, root `LICENSE`. No per-skill inline declarations in SKILL.md frontmatter |
| Covered exposed skills | `skills.lumenloop.scf-submission-radar`, `.stellar-builder-quickstart`, `.stellar-content-auditor`, `.stellar-ecosystem-digest`, `.stellar-ecosystem-scout`, `.stellar-integration-finder`, `.stellar-project-dossier` |

**License text facts.** The MIT text grants use, copy, modify, merge, publish, distribute,
sublicense, and sell rights without restriction. Its condition: the copyright notice and this
permission notice must be included "in all copies or substantial portions of the Software."

**Application to Raven — unresolved for counsel.** Whether request-time forwarding through
Raven's API produces "copies" or copies of "substantial portions" is an open legal question
(§3). Whether section reads copy a substantial portion is likewise open. The grant is broad;
the condition's application here is not settled by the license text alone.

Partner-tier LumenLoop skills are not pinned and are out of this audit's scope; they exist here
only as name-only inventory stubs ([PLAN.md](../PLAN.md) §3).

### 2.2 `openzeppelin-stellar` — OpenZeppelin/openzeppelin-skills @ `6f215af`

| Field | Value |
| --- | --- |
| Repository | https://github.com/OpenZeppelin/openzeppelin-skills |
| Pinned revision | `6f215af60eb60017ab1a933ce9d22a479cd42b26` (2026-07-15T13:00:58Z, verified via GitHub API) |
| License identifier | **AGPL-3.0-only** — full GNU Affero General Public License v3 text in `LICENSE`; each SKILL.md frontmatter declares `license: AGPL-3.0-only`; `NOTICE` names © 2026 Zeppelin Group Ltd |
| License files at pin | `LICENSE`, `NOTICE` — https://github.com/OpenZeppelin/openzeppelin-skills/tree/6f215af60eb60017ab1a933ce9d22a479cd42b26 |
| Tree scan at pin | 33 files, recursive, not truncated; found only the recorded license-like filenames, root `LICENSE` and `NOTICE`. Inline frontmatter declarations exist separately in all three SKILL.md files (§5) |
| Covered exposed skills | `skills.openzeppelin-stellar.develop-secure-contracts`, `.setup-stellar-contracts`, `.upgrade-stellar-contracts` |

**License text facts.** What the pinned sources state explicitly: the project-level `README`
identifies the repository as licensed under AGPL-3.0-only, and all three `SKILL.md` files
declare `license: AGPL-3.0-only` in their frontmatter. Whether broader file coverage follows
from the repository-level statement — including the companion Markdown playbooks — is a
repository-level inference for counsel; this report does not assert it. Three clauses matter
as written:

- **§4 (verbatim-copy conveyance):** verbatim copies of the Program's source code may be
  conveyed as received, provided the conveyor (1) publishes an appropriate copyright notice
  on each copy, (2) keeps intact all notices stating that this License and any §7-added
  non-permissive terms apply to the code, (3) keeps intact all notices of the absence of any
  warranty, and (4) gives all recipients a copy of this License along with the Program.
- **§5 (modified source versions):** conveying a work based on the Program, or the
  modifications producing it, in source-code form under §4's terms requires meeting all of:
  (a) the work carries prominent notices stating that it was modified, with a relevant date;
  (b) the work carries prominent notices stating that it is released under this License and
  any §7-added conditions (modifying §4's keep-notices-intact requirement); (c) the entire
  work, as a whole, is licensed under this License to anyone who comes into possession of a
  copy, which then applies to the whole work and all its parts however packaged; (d) if the
  work has interactive user interfaces, each displays Appropriate Legal Notices, except where
  the Program's own interfaces do not display them.
- **§13 (remote network interaction):** if you modify the Program, your modified version must
  prominently offer all users interacting with it remotely through a computer network an
  opportunity to receive its Corresponding Source.

**Raven's technical transformations (implementation facts, from
[`src/skills/store.ts`](../src/skills/store.ts)):**

- Whole skill reads strip YAML frontmatter before returning content — `stripFrontmatter`
  at [store.ts:101-105](../src/skills/store.ts), applied at [store.ts:315](../src/skills/store.ts).
  For these three skills, that removed frontmatter is where the `license: AGPL-3.0-only`
  declaration lives.
- Section reads return only the requested `##` heading's text — a subset of the body.
- Companion-file reads (`file:` sections) also strip frontmatter and trim —
  [store.ts:395](../src/skills/store.ts).
- `scrubRetiredSkillRefs` removes list items referencing non-exposed skills; per
  [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md) it currently touches 7 LumenLoop files
  and 1 Stellar Light file, and no OpenZeppelin file.

**Application to Raven — unresolved for counsel.** Frontmatter removal means served content is
not byte-for-byte upstream, whether that makes it a "modified version" under §5 or defeats
"verbatim" status under §4 is an open classification. Section responses are excerpts; their
coverage under §4 or §5 is open. Whether §13 applies to this network interaction given the
transformations is open. The redistribution permission exists in the license text; none of the
compliance conditions can be attested today without counsel review. Do not treat this source
as closed on the strength of "open source" alone.

### 2.3 `stellar-dev` — stellar/stellar-dev-skill @ `1f4b94e`

| Field | Value |
| --- | --- |
| Repository | https://github.com/stellar/stellar-dev-skill |
| Pinned revision | `1f4b94e01ca24a2c00cb3b2cb3fcf6d07ad76462` (2026-08-19T20:57:20Z, verified via GitHub API) |
| License identifier | **Apache-2.0** (© 2026 Stellar Development Foundation) |
| License file at pin | `LICENSE` — https://github.com/stellar/stellar-dev-skill/blob/1f4b94e01ca24a2c00cb3b2cb3fcf6d07ad76462/LICENSE |
| Tree scan at pin | 128 files, recursive, not truncated; found only the recorded license-like filename, root `LICENSE`. No `NOTICE` file, so Apache §4(d)'s NOTICE duty does not arise. No inline declarations in SKILL.md frontmatter |
| Covered exposed skills | `skills.stellar-dev.agentic-payments`, `.assets`, `.cross-chain`, `.dapp`, `.data`, `.smart-contracts`, `.standards`, `.zk-proofs` |

**License text facts.** Apache-2.0 §2 grants a perpetual, worldwide, non-exclusive, no-charge,
royalty-free copyright license to reproduce the Work, prepare Derivative Works, publicly
display, publicly perform, sublicense, and distribute the Work and Derivative Works in Source
or Object form. Apache-2.0 §3 grants a separate patent license to make, have made, use, offer
to sell, sell, import, and otherwise transfer the Work. Apache-2.0 §4 conditions distribution
on: (a) giving recipients a copy of the License; (b) causing any modified files to carry
prominent notices stating that You changed the files; (c) retaining, in the Source form of any
distributed Derivative Works, all copyright, patent, trademark, and attribution notices from
the Source form of the Work — excluding only notices that do not pertain to any part of the
Derivative Works; (d) including NOTICE contents if a NOTICE file exists (none does here).

**Raven's technical transformations (implementation facts):** whole skill reads strip YAML
frontmatter ([store.ts:315](../src/skills/store.ts)); companion-file reads also strip
frontmatter and trim ([store.ts:395](../src/skills/store.ts)). So Raven serves transformed
text, not unmodified files — any claim that it distributes content unchanged would be wrong.

**Application to Raven — unresolved for counsel.** Whether frontmatter removal makes served
files "modified files" engaging §4(b), whether an API response constitutes public display or
distribution, whether whole-file responses include "substantial portions," and how §4(a)'s
License-copy requirement must be delivered through an API are all open questions.

**Provenance gap (recorded fact):** companion-file responses currently return the main
`SKILL.md`'s pinned URL, not the requested companion file's own address — both result shapes
use `ref.url`
([store.ts:363](../src/skills/store.ts), [store.ts:432](../src/skills/store.ts)). Exact
companion provenance is therefore missing from responses today.

Note: the upstream is the Stellar Development Foundation, the same organization behind the
production route `raven.stellar.org` ([PLAN.md](../PLAN.md) §7); whether that relationship
changes anything is a business question for Tyler, folded into the existing open questions.

### 2.4 `stellar-light` — Stellar-Light/stellar-scout @ `2eebd98`

| Field | Value |
| --- | --- |
| Repository | https://github.com/Stellar-Light/stellar-scout |
| Pinned revision | `2eebd982dc31c20198f59b40e29c83dcf71f688b` (2026-08-18T22:42:00Z, verified via GitHub API) |
| License identifier | **MIT** (© 2026 Stellar Light); the SKILL.md frontmatter additionally declares `license: MIT` |
| License file at pin | `LICENSE` — https://github.com/Stellar-Light/stellar-scout/blob/2eebd982dc31c20198f59b40e29c83dcf71f688b/LICENSE |
| Tree scan at pin | 6 files, recursive, not truncated; found only the recorded license-like filename, root `LICENSE` |
| Covered exposed skills | `skills.stellar-light.stellar-scout` |

**License text facts:** same MIT grant and notice condition as §2.1. **Application to
Raven:** same unresolved questions; additionally, `scrubRetiredSkillRefs` touches 1 file of
this source ([THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)), and whole/companion reads
strip frontmatter like every other source.

## 3. Cross-cutting findings

### 3.1 Technical transformations apply to all four sources

Implementation facts from [`src/skills/store.ts`](../src/skills/store.ts):

- Whole skill reads strip YAML frontmatter ([store.ts:315](../src/skills/store.ts)).
- Companion-file reads strip frontmatter and trim ([store.ts:395](../src/skills/store.ts)).
- Section reads return only the requested `##` heading's text.
- `scrubRetiredSkillRefs` removes list items referencing non-exposed skills — currently 7
  LumenLoop files and 1 Stellar Light file, no OpenZeppelin file
  ([THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)).

These are technical descriptions of the code. Their legal classification — verbatim copy,
modified version, excerpt, or otherwise — is unresolved and listed for counsel in §4.

### 3.2 The forward-not-store posture vs notice delivery

[THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md) records the owner decision of 2026-07-30:
Raven forwards skill content, it does not store it, and "`skill.read` returns the markdown as
fetched. No license text, notice, header, or wrapper is attached, by decision." The posture
answers the security and provenance questions well (commit pins, dual hash verification,
re-pinning attestations in [PIN-REVIEW.md](../ecosystem-skills/PIN-REVIEW.md)).

If counsel concludes that qualifying responses require license/notice carriage, a possible
delivery design is a provenance-and-license footer naming the upstream repository, commit,
license, and license-file link. **This report does not claim that such a footer, link, or
response header satisfies any license text.** Whether it does is a counsel determination:
each text states its duties (MIT: copyright + permission notice in qualifying copies;
Apache-2.0 §4(a): recipients receive a copy of the License; AGPL §4/§5: intact notices and
license carriage), and none names an API-footer mechanism. Any design must also fix companion
provenance (§2.3): responses must identify the exact companion file served, not only the main
SKILL.md URL.

## 4. Summary verdicts and unresolved counsel questions

Each pinned source carries an explicit conditional grant relevant to retrieval, rendering,
and exposure. None lacks a license, and no license text prohibits what Raven does outright.
Whether Raven's specific operation satisfies each grant's conditions cannot be concluded from
the texts alone. **No compliance attestation should be made without counsel review.**

Unresolved questions requiring counsel:

1. Does request-time forwarding through Raven's API constitute distribution or conveyance?
2. Does a section response copy a "substantial portion"?
3. Does frontmatter removal create a modified version (AGPL §5; Apache §4(b))? Does it defeat
   AGPL §4 "verbatim" status? Note that for OpenZeppelin skills the stripped frontmatter holds
   the inline `license:` declaration itself.
4. Does an API response constitute public display under Apache-2.0's grant language?
5. Does AGPL §13 apply to this network interaction?
6. What license and notice delivery method satisfies each license text, including delivery
   through an API and correct identification of served companion files?

Per-source status under that framing:

- `lumenloop` (MIT) and `stellar-light` (MIT): broad grants subject to the notice condition.
  Counsel questions 1, 2, 6.
- `stellar-dev` (Apache-2.0): grant includes public display explicitly; §4 conditions attach
  to distribution. Counsel questions 1, 2, 4, 6, plus companion-provenance repair (§2.3).
- `openzeppelin-stellar` (AGPL-3.0-only): grant exists but §§4/5/13 compliance against Raven's
  transformations is entirely open. Counsel questions 1–6. Treat as needing legal review
  before any attestation claims this half closed.

## 5. Inline license declarations and companion-file coverage

The tree scans found only the recorded license-like filenames (root `LICENSE`; `NOTICE` at
OpenZeppelin). A filename scan cannot prove that no other path contains license statements;
it establishes only which recorded files exist at the pins. Separate from those files, inline
declarations exist in exactly four SKILL.md frontmatters:

- All three OpenZeppelin skills declare `license: AGPL-3.0-only`.
- The Stellar Scout skill declares `license: MIT`.

No LumenLoop or stellar-dev SKILL.md carries an inline declaration. No companion file in any
source carries one. Companion-file coverage therefore follows from each repository's root
license statement — an inference from repository-level licensing, not an inline declaration —
and is listed for counsel among the application questions in §4.

## 6. Reconciliation against todo 1874

Todo 1874 corrected the Connectors Directory doc to **59 operations (18 lumenloop / 29 scout /
12 stellarDocs), 19 skills, 173 sections**, noting the doc omitted skills entirely. Verified
today against `catalog/manifest.json` at audited commit `5f31ad2`: **exact match — 59 / 19 / 173, no
drift since the scratchpad measurement.** One refinement to the todo's framing: the todo said
"19 skills"; the pin set is 20, with `lumenloop-mcp-connect` pinned but build-excluded, so 19
is the correct exposed count and the todo numbers stand as written.

Scratchpad 841's per-source split (7 lumenloop, 8 stellar-dev, 3 openzeppelin-stellar, 1
stellar-light) matches both manifests, as do the recomputed per-source section counts
(61 / 83 / 13 / 16 = 173). No mismatch remains between todo, scratchpad, pin manifest, and
generated catalog.

## 7. What this audit does not cover

- npm dependencies, vendored Cloudflare codemode files (MIT, already noticed in
  [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)), inventory JSONs, and eval corpora —
  outside this lane's question.
- The Lumenloop and Stellar Light/Scout **operation APIs** — their proxy authorization is the
  written-permission track of todo 1874, separate from this skill-content audit. A permissive
  license on a skills repo does not authorize proxying the parent API.
- Any partner-tier LumenLoop content — never pinned, never served.

## 8. Verification performed

- License texts fetched at each exact pinned SHA from `raw.githubusercontent.com` (five files:
  lumenloop `LICENSE`; OpenZeppelin `LICENSE` + `NOTICE`; stellar-dev `LICENSE`;
  stellar-light `LICENSE`).
- Recursive tree listings at each pinned SHA via the GitHub API (`truncated: false` for all
  four), confirming the recorded `license_files` are present at each pin. The scans found only
  those license-like filenames; they did not and cannot establish the absence of other
  license-bearing paths.
- Commit existence and author dates confirmed per pinned SHA via the GitHub API; all four match
  `MANIFEST.json` values.
- Frontmatter inspected at pins for inline declarations: three OpenZeppelin SKILL.md files
  (`AGPL-3.0-only`) and the Stellar Scout SKILL.md (`MIT`) — reported separately in §5.
- Transformation behavior confirmed in local code: `stripFrontmatter` and its call sites at
  [store.ts:101-105, 315, 395](../src/skills/store.ts); response URL construction at
  [store.ts:363, 432](../src/skills/store.ts).
- Catalog counts recomputed locally from `catalog/manifest.json`: operations 18/29/12 = 59;
  sections 61/13/83/16 = 173; skills 8+3+8+1 = 20 pinned, 19 exposed.
