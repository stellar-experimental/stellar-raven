# Scout hackathon golden coverage — 2026-10-06

## Scope

Golden coverage for the two operations that Scout spec `1.9.71` added and the drift candidate
`c76b517c` exposes: `scout.analyzeHackathonSubmissions` and `scout.getHackathonSubmission`.
`npm run eval:qa:lint -- --stale --enforce-floors` failed with `operation floor 2; found 0` for
each. This lane authors two QA battery cases per operation. It is the "Golden coverage for new
operations" lane of the truth-maintenance round that the coordinator keeps in
`.agents/rounds/2026-10-06-truth-maintenance.md` on branch `drift/2026-10-06-scout`.

Out of scope: paid evaluation lanes, pushes, deploys, GitHub posts, `improvements/` filings, and
any case outside the four new ids.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
| --- | --- | --- | --- | --- |
| Author and primary verification | `fable-goldens` (Claude Fable 5.1 `claude-fable-5-1`, high) | `w3W:p1T` | worktree `../srcm-drift-goldens`, branch `drift/2026-10-06-goldens` | done |
| Independent re-verification | see "Reviewer selection" | split from `w3W:p1T` | `tmp/goldens-review/` (ignored) | see Ledger |

### Reviewer selection

The author is Claude Fable 5.1. The coordinator is Claude Opus 5.5 (`w3W:p1P`). Both Claude tiers
drop out of the pool. The change is fact re-derivation from live sources, so the matched tier is
Codex frontier (`gpt-6-astra`) at high. Effort stays at high: the change is not subtle, and no high
pass has missed a finding.

## Ledger

All probes ran on 2026-10-06 between 14:15Z and 14:25Z. Scout probes are public, read-only GETs.

1. `curl https://stellarlight.xyz/api/hackathons/analyze` with `facet=placement&by=event&top=30`,
   then with `hackathon=stellar-hacks-kale-reflector,stellar-hacks-zk`. Result: 1343 stored
   submissions, 64 placed. KALE x Reflector: field 45, winner 10 (0.222). Real-World ZK: field 319,
   winner 5 (0.016). `GET /api/hackathons/<slug>` agrees (`stats.totalSubmissions` 45 and 319).
2. `curl https://dorahacks.io/hackathon/<slug>/winner` for both events, then parse the embedded
   `__NUXT_DATA__` hackathon record. KALE x Reflector: `buidlsCount` 46, report text "47 approved
   project submissions", ten named winners. Real-World ZK: `buidlsCount` 345, "approving 345
   projects", five named winners with prize amounts. Verdict: winner counts confirmed; submission
   totals disputed (45 / 46 / 47 and 319 / 345). The golden gates the winner counts and the share
   bands that hold under every total.
3. `curl .../analyze?facet=library`, `...&winnersOnly=1`, and `...&by=placement`. Result: 45 of 64
   placed repos read; Stellar JS SDK 35 (0.778), Soroban Rust SDK 26 (0.578), Stellar Wallets Kit
   16 (0.356), Freighter API 7 (0.156). Others known 967: 0.768, 0.664, 0.267, 0.370. Lifts 1.01,
   0.87, 1.33, 0.42. `GET /api/hackathons/builds?winnersOnly=1&limit=100` agrees on the package
   counts (same store; a consistency check only).
4. GitHub REST reads (`gh api repos/<repo>/git/trees/<branch>?recursive=1`, then each
   `package.json` and `Cargo.toml`) for eight placed repos: `poki-tcg/wraith`, `CTX-com/Cards402`,
   `AshFrancis/chickenz`, `AshFrancis/splicers`, `rajkaria/toll`, `tantk/rendergate`,
   `Ridwannurudeen/anchorshield`, `FrankiePower/kale-farmers-market`. Every checked package in
   Scout's `stack` was declared in the repo. Verdict: the per-submission stack data has a real-world
   footprint; the aggregate shares stay corpus-only and the golden labels them as Scout's counts.
5. First draft of the link case. `curl .../builds/46348` and `.../builds/dorahacks-buidl-46348`: identical records. Wraith,
   Stellar Hacks: Real-World ZK, `1st Place - $5,000 in XLM`, repo `poki-tcg/wraith`.
   `https://dorahacks.io/buidl/46348` embedded record and the Real-World ZK winner list agree.
   `gh api repos/poki-tcg/wraith`: public, last commit on `main` 2026-07-03T15:14:19Z.
   `.../builds/99999999` returns 404 with a "not stored is not proof of absence" advisory.
6. `curl .../builds/32593`: xbid.ai, `1st Place`, project `{slug: xbid-ai, basis: website, status:
   Live, scfAwarded: false}`, no `stack`, `repo: null`. `https://dorahacks.io/buidl/32593` and the
   KALE x Reflector winner list agree on identity and placement.
   `GET /api/projects/resolve?q=xbid.ai`: found, status Live, source
   `https://xbid.ai/.well-known/stellar.toml` (HTTP 200). `gh api orgs/xbid-ai`: five public repos.
7. Rejected candidate: Cards402 (BUIDL 42819) as the outcome case. Scout serves `1st Place`, but
   the DoraHacks Agents winner tab renders client-side behind a human-verification check and the
   event has no published summary. No independent placement source was obtained, so the case uses
   xbid.ai instead. The check was not bypassed.
8. Sibling sweep: `grep -rlE -i "xbid|wraith|buidl/|Real-World ZK|stellar-hacks-zk|KALE x Reflector"
   eval/qa/corpus/battery eval/qa/corpus/live`. Hits: `q-scf-kale-winner-live`,
   `q-scf-hackathon-compare-live`, `q-scf-hackathons-active`,
   `q-scf-current-hackathons-compare-live`, `q-gap-compare-hackathons`. All are `live` behavior
   cases that pin no winner name, submission total, or library share. Verdict: no contradiction.

Root cause for the new gospel: coverage floor. Scout `1.9.71` added two exposed operations with no
golden case (live drift issue #223).

9. 14:27Z. Spawned `rev-astra-goldens`: `herdr pane split --current --direction down` returned
   pane `w3W:p1W`; `herdr agent start rev-astra-goldens --kind codex --pane w3W:p1W -- -m
   gpt-6-astra -c 'model_reasoning_effort="high"' -c
   'sandbox_workspace_write.network_access=true' -a never -s workspace-write`. The brief told the
   reviewer not to read the proposals, this ledger, or the proposal commit. Result at 14:36Z:
   `2026-10-06-scout-hackathon-goldens/review-astra.md`. Verdicts: placed-share and Wraith
   `do-not-activate`; xbid and libraries `activate-with-changes`. The reviewer could not read
   DoraHacks (human-verification page) and stopped there.
10. Reconciliation: `2026-10-06-scout-hackathon-goldens/reconciliation.md`. Two real author errors
    were confirmed and fixed: the "shares are a floor" statement in the library case, and
    "confirmed by DoraHacks' published winner lists" used where only DoraHacks-derived witnesses
    existed.
11. Extra probes after the review. A web reader returned
    `https://dorahacks.io/hackathon/stellar-hacks-zk/report`,
    `.../stellar-hacks-kale-reflector/report`, `.../stellar-hacks-blend/report`, and
    `https://dorahacks.io/buidl/27417` with the same winner lists. Searches for a source outside
    DoraHacks that names Wraith as first place found none (`developers.stellar.org/meetings`
    2026-07-02, -16, -23, -30; two web searches). Verdict: the Wraith placement does not meet the
    independent-class bar; the link case moved to BUIDL 27417.
12. `curl .../builds/27417`: Comet x Hoops Finance, Stellar Hacks: Blend, `2nd Place`, repo
    `hoops-finance/cometswap`. The DoraHacks Blend summary and the r/Stellar announcement
    (`/r/Stellar/comments/1lzrofu/`) both give 1st Blend Pool Creator, 2nd Comet x Hoops Finance,
    3rd YieldBack.Cash. `gh api repos/hoops-finance/cometswap`: public, last commit
    2025-07-06T23:23:53Z. Side observation: Scout's Blend record holds 35 submissions and 2 winners;
    DoraHacks and the announcement give 39 submissions and 3 winners. Entry 14 corrects the first
    reading of this gap.
13. The proposal commit was rebuilt before any push: the first local proposal commit (`16c49bfa`)
    held the Wraith id, which would have stayed reserved. The branch was reset to `c76b517c` and the
    four final proposals were committed again.

14. 14:43Z to 14:50Z. Second review pass by the same reviewer on the revised cases:
    `2026-10-06-scout-hackathon-goldens/review-astra-pass2.md`. Verdicts: libraries `activate`;
    Comet x Hoops Finance and xbid.ai `activate-with-changes`; placed-share `do-not-activate`.
    DoraHacks again refused the reviewer (HTTP 405), so its DoraHacks rows rest on the author's
    captures. The reviewer corrected the author: `curl .../builds/27438` (14:51Z) returns Blend Pool
    Creator under `stellar-hacks-paltalabs` with `placement: null`, so Scout holds the submission
    but not its Blend first-place result.
15. Second-pass reconciliation, all accepted. Comet x Hoops Finance: the closing date is removed
    from the answer and the note about the first-place submission is reduced to one sentence.
    xbid.ai: the closing date is removed. Placed-share: the winner-count rows and `truth.status`
    are set to `unverifiable`, and the case stays a proposal.
16. Coordinator note during the second pass: the round holds the Scout `1.9.71` absorb, so these
    cases do not merge this round. No case was activated. Activation changes `cases.json`,
    `sample.json`, and the count contracts, and its dated evidence must be current when the absorb
    lands.

## Outcome

Author lane: four proposals committed on `drift/2026-10-06-goldens`; none active. Review gate:
Codex frontier `gpt-6-astra` at high, two passes, every finding reconciled in
`2026-10-06-scout-hackathon-goldens/reconciliation.md`.

| case | state | review verdict | next step |
| --- | --- | --- | --- |
| `q-scout-hackathon-winner-libraries-vs-field` | proposed | activate | re-probe the counts, then activate |
| `q-scout-hackathon-submission-link-comet-hoops` | proposed | activate after edits (applied) | activate; facts are historical |
| `q-scout-hackathon-submission-xbid-outcome` | proposed | activate after edits (applied) | re-probe the directory link and status, then activate |
| `q-scout-hackathon-placed-share-kale-vs-zk` | proposed, `unverifiable` | do-not-activate | find an organizer winner announcement outside DoraHacks, or rewrite as a Scout snapshot and review again |

Gates on the final commit are in the lane report
(`tmp/2026-10-06-maintenance/goldens-fable.md` in the coordinator's checkout). The coverage floor
for both operations stays unmet until activation. Open work is in `.agents/TODO.md`: activation
after the absorb lands, the winner-path overlap in two existing cases, and the Scout store gaps.

Retained evidence: `review-astra.md`, `review-astra-pass2.md`, `reconciliation.md`, and
`dorahacks-captures.json`. The four proposal files cite them in `truth.verified.evidence`.
