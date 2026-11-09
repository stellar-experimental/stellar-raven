# Improvements sweep — November 9, 2026

Owner request: recheck sls-099, sls-100 and sls-102 with a distinct reviewer, and check every
pending improvement for progress, completion, or resolution. Follows
[the handoff round](2026-11-09-upstream-handoffs.md) the same day.

## Starting state

91 active findings at `origin/main` be3e1f41: lumenloop 37, stellar-docs 18, skills 14,
stellar-light-scout 13, canonical-source 8, workers-ai-provider 1. The coordinator fetched all
104 recorded upstream refs (state, close reason, merge, last commenter) before fan-out.

Signals since the November 5 round:

- Scout: the maintainer closed the issues for sls-099, 100, 101, 102, 107, 112 and 114 on
  November 7–8. sls-111 and sls-115 remain open.
- Docs: sd-064's PR2945 merged on November 9; sd-081's PR2977 merged November 3 (issue 2562 open).
- Skills: sk-039's PR181 merged and its issue closed November 6.
- Canonical source: cloudflare/agents#2790 (cs-010) closed as not planned; cs-009 has a
  third-party comment from November 8. stellar-protocol#2010 (sd-048) closed as not planned.
- Lumenloop: none of the 33 backend refs has a maintainer comment; live triggers were re-run
  with the read key to find silent fixes.

Credentials: lanes received a worktree `.env` with only the Lumenloop and Mintlify assistant read
keys. WorkOS, MCP admin and Mintlify admin secrets were not exposed.

## Lanes

Coordinator: Claude Opus 5.5 (hc t2dn). Worktree `/private/tmp/claude-501/raven-wt/impr`.

| Lane | hc | Tier / model / effort | Scope |
|---|---|---|---|
| sw-scout | t3bq | Codex workhorse / `gpt-6.1-sol` / high | stellar-light-scout |
| sw-lumenloop | t3br | Codex workhorse / `gpt-6.1-sol` / high | lumenloop |
| sw-docs | t3bs | Codex workhorse / `gpt-6.1-sol` / high | stellar-docs, canonical-source, workers-ai-provider |
| sw-skills | t3bt | Codex workhorse / `gpt-6.1-sol` / high | skills |
| rv-fable | t3cb | Claude Fable / `claude-fable` / high | independent review: sk-039, sd-064 |
| rv-astra | t3cc | Codex frontier / `gpt-6-astra` / high | independent review: Scout candidates and partials, sd-100 |
| gold | t3cd | Codex workhorse / `gpt-6.1-sol` / high | golden cases and cross-references for retired Scout findings |
| rv-gold | t3cg | Claude Fable / `claude-fable` / high | independent review of the golden edits |

Reviewer selection: the coordinator (Claude Opus) and the authors (Codex workhorse) are out of the
pool. Codex frontier took the Scout data review (dense analysis). Claude Fable took the skills,
Docs and golden-truth review (product, documentation and grading taste). The golden edits cite the
Astra review, so Fable reviewed them to keep that check independent.

Lane reports and reviews are committed in
[`research/audits/2026-11-09-improvements-sweep/`](../../research/audits/2026-11-09-improvements-sweep/).
Raw JSON fetches (up to 26 MB) stayed local; the reports carry the exact URLs, timestamps and hashes.

## Verdicts

| Collection | Fixed and retired | Partial (kept) | Still reproduces | Inconclusive | Declined (unchanged) |
|---|---|---|---|---|---|
| stellar-light-scout (13) | sls-099, 100, 102, 112, 114 | sls-024, 029, 033, 101, 107, 111 | sls-115 | — | sls-039 |
| lumenloop (37) | — | ll-006, 017, 020 | 30 others | ll-004, 022, 023, 024 | — |
| stellar-docs (18) | sd-064, sd-100 | — | sd-005, 014, 035, 050, 059, 061, 070, 074, 077, 081, 101; sd-048 (closed-unfixed) | — | sd-004, 009, 096, 102 |
| canonical-source (8) | — | — | cs-001, 004, 005, 006, 007, 009, 010 | — | cs-008 |
| workers-ai-provider (1) | — | — | — | — | wai-001 |
| skills (14) | sk-039 | — | 13 others | — | — |

Every still-reproducing finding has a dated recurrence or evidence line. No new findings were
filed and no successors were created.

Decisions:

- **Lumenloop partials (ll-006, 017, 020) keep their records.** Each residual is the unresolved part
  of the original recommendation, and its open issue (no maintainer comment) already states it. A
  successor would duplicate an open, untouched issue.
- **ll-004** passes now (21 authenticated names, 18 anonymous) but was intermittent before; it stays
  open until a second passing check on a later day. ll-022/023/024 keep their explicit uncertainty
  (see the November 5 TODO entry).
- **sd-048:** stellar-protocol#2010 closed as not planned by a stale bot, not by an owner decision.
  CAP-0075 still lists degrees 3, 5, 7, 11 at line 78, and the author-owned PR2059 is open. The
  status stays `reported-upstream`; it does not meet the `declined-upstream` bar.
- **cs-010:** cloudflare/agents#2790 closed as not planned, but #2809 still tracks the same defect,
  and the latest `agents` release still drops Anthropic thinking parts in the mocked-binding repro.
- **sls-101, sls-107:** the issues closed on November 5 with partial deploys. The verification
  results are posted on [1912](https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6751083543)
  and [1900](https://github.com/Stellar-Light/stellarlight/issues/1900#issuecomment-6751084106).
  The records stay active.
- **sd-100:** maintainer bot PR3080 merged at 20:38Z, after the docs lane ran. The coordinator
  rechecked the live page at 20:50Z, and Astra re-derived it before retirement.

## Resolution comments

Each comment was posted from the resolver dry run and read back byte for byte (author kalepail).

| Finding | Comment |
|---|---|
| sls-099 | [stellarlight#1910](https://github.com/Stellar-Light/stellarlight/issues/1910#issuecomment-6751067795) |
| sls-100 | [stellarlight#1911](https://github.com/Stellar-Light/stellarlight/issues/1911#issuecomment-6751068209) |
| sls-102 | [stellarlight#1913](https://github.com/Stellar-Light/stellarlight/issues/1913#issuecomment-6751068643) |
| sls-112 | [stellarlight#1904](https://github.com/Stellar-Light/stellarlight/issues/1904#issuecomment-6751069124) |
| sls-114 | [stellarlight#1906](https://github.com/Stellar-Light/stellarlight/issues/1906#issuecomment-6751069547) |
| sk-039 | [stellar-dev-skill#180](https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6751069952), [#181](https://github.com/stellar/stellar-dev-skill/pull/181#issuecomment-6751070537), [stellar-raven#388](https://github.com/stellar-experimental/stellar-raven/issues/388#issuecomment-6751071061) |
| sd-064 | [stellar-docs#2945](https://github.com/stellar/stellar-docs/pull/2945#issuecomment-6751071543) |
| sd-100 | [stellar-docs#3078](https://github.com/stellar/stellar-docs/issues/3078#issuecomment-6751220529), [#3080](https://github.com/stellar/stellar-docs/pull/3080#issuecomment-6751221016) |

Verification results (records kept): sls-101 on
[stellarlight#1912](https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6751083543),
sls-107 on [stellarlight#1900](https://github.com/Stellar-Light/stellarlight/issues/1900#issuecomment-6751084106).

The resolver then retired all eight findings to `improvements/resolved.json` (resolved 2026-11-09)
and removed the sk-039 intake override. Active findings: 91 → 83.

## Golden and register reconciliation

- sls-099: q-defi-phoenix-what-is, q-defi-soroswap-what-is, q-defi-soroswap-vs-stellarx and
  q-defi-provide-liquidity-impermanent-loss date the old Scout venue wording and point at the
  resolved receipt.
- sls-100: q-eco-hana-wallet-scf (provenance only).
- sd-064: q-builder-content-by-person.
- sd-100: q-protocol-ledger-close-time.
- sls-102: q-edge-fresh-latest-blend-tvl was reviewed and needed no edit.
- No answer key fact, avoid clause or grading rule changed. Judge-facing text changed only where it
  said a corrected source still had the old wording.
- Clusters 012, 014, 017, 022, 030, 038, 046, 065, 073 and 128 were re-swept with specific reasons.

Independent golden review (Claude Fable high,
[review-gold-fable.md](../../research/audits/2026-11-09-improvements-sweep/review-gold-fable.md))
approved the five Codex-lane cases, the cross-references and all cluster reasons. It required two
note fixes (a rubric word `correct` in the builder note; a missing resolved-ledger pointer in the
ledger close-time note) and recommended a re-walkable PR2945 evidence line and dated corroboration
rows for both coordinator cases. All four were applied, and the four affected clusters re-stamped.
Its owner question about the 5–7-second grading acceptance is queued in `.agents/TODO.md`.
