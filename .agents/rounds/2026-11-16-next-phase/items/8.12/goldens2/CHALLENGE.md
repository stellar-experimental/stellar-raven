# Item 8.12 (`goldens2`) — Challenge of Codex Sol review

Reviewer: OpenAI Codex `v0.169.0`, resolved model `gpt-6.2-sol` (`node scripts/latest-model.mjs sol`), `model_reasoning_effort="high"`, `-s read-only`.
Review file: `.agents/rounds/2026-11-16-next-phase/items/8.12/goldens2/SOL-REVIEW.md`.
Challenger: Gemini 4 Neon (Antigravity).
Date: 2026-11-19 UTC.

## Summary counts

| Verdict | Count | Findings |
|---|---|---|
| **valid** | 5 | Finding 1, Finding 2, Finding 3, Finding 4, Finding 5 |
| **invalid** | 0 | — |
| **valid but not worth fixing** | 0 | — |

Note: Sol's summary independently confirmed the substantive disposition: both `q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery` are unaffected by Scout 1.9.150's SDK-status schema additions and `Repo.codeVerified.versionStatus` redefinition, their corpus files and `truth` dates stay unchanged, compiled parity holds, all three recorded cluster hashes match, neither case has a source sentinel, and no split membership was disclosed. All five findings concerned `VERIFICATION.md` hygiene, reproducibility, or claim precision; every finding was verified against repo rules, git history, and live tagged upstream source, confirmed valid, and fixed in `VERIFICATION.md`.

## Finding-by-finding challenge

### Finding 1 (Sol: High) — `VERIFICATION.md:25` (and lines 23, 26, 27) violates the Maintenance Exception Records rule

- **Sol's claim (`SOL-REVIEW.md:5`):** `VERIFICATION.md:25` reproduced a verbatim excerpt from `q-soroban-cli-bindings`'s `golden.notes` even though attributed to the upstream page, and lines 23, 26, and 27 restated material from `golden.answer` and `golden.keyFacts` across both cases, violating `eval/qa/README.md:261-265`.
- **Verdict:** **valid**
- **Evidence:** Confirmed against `eval/qa/README.md:263-265` ("Outside the corpus and the register, nothing it writes quotes or paraphrases a case's judge-facing text: not its report, review file, ledger row, TODO entry, finding, commit message, pull-request body, or a message to another terminal") and `eval/qa/README.md:351-352` ("cite the case id and field, and never quote judge-facing text"). Although line 25 quoted `contract-explorer.md:84` (which is also quoted in the committed public finding `improvements/stellar-docs/sd-110-lab-contract-explorer-bindings-language-list.md:13`), that exact 7-word phrase appears verbatim inside `q-soroban-cli-bindings`'s `golden.notes`, and lines 23, 26, and 27 echoed upstream prose overlapping `golden.answer` and `golden.keyFacts` of both cases.
- **Action:** Fixed `VERIFICATION.md` — replaced verbatim quotes and overlapping claim summaries in lines 23-32 with structural verification notes (URLs, HTTP statuses, section/line/file anchors, `sd-110` probe-expectation match, and pinned commit SHAs) so no judge-facing text is quoted or paraphrased.

### Finding 2 (Sol: Medium) — `VERIFICATION.md:28` cites moving `main` alongside `v30.0.1` without recording the inspected SHA

- **Sol's claim (`SOL-REVIEW.md:6`):** `VERIFICATION.md:28` inspected `main` alongside release `v30.0.1` without recording the inspected SHA, while `main` already has commits ahead of the tag.
- **Verdict:** **valid**
- **Evidence:** Confirmed via `gh api repos/stellar/stellar-cli/compare/v30.0.1...main`: `main` (`0571268fdce4ac12f5732ff6a9af42a0ea05296b`) is 2 commits ahead of tag `v30.0.1` (`f2a7b74175c34585f3b30a1abf42a2d41cbcc390`), with 0 changed files under `bindings`. `.agents/skills/golden-truth/SKILL.md:87` requires verification notes a stranger can re-walk; citing an unpinned moving branch fails that standard.
- **Action:** Fixed `VERIFICATION.md` — pinned both `v30.0.1` (`f2a7b74175c34585f3b30a1abf42a2d41cbcc390`) and `main` (`0571268fdce4ac12f5732ff6a9af42a0ea05296b`, 2 commits ahead, 0 diff in `bindings`), and similarly pinned the inspected `main` HEAD SHAs for `stellar/js-stellar-sdk` (`5243062fdf7a874d33cbf3089e898eb0777337a8`) and `stellar/go-stellar-sdk` (`4cee025512a603a2f21639160e379251f4f43507`).

### Finding 3 (Sol: Medium) — `VERIFICATION.md:49` turns release-notes silence on `stellar-rpc v30.0.1` into a verified behavior claim

- **Sol's claim (`SOL-REVIEW.md:7`):** `VERIFICATION.md:49` promoted the absence of a retention change in `stellar-rpc v30.0.1` release notes (line 32) into a verified claim about release behavior; an unlisted code change would pass that check.
- **Verdict:** **valid**
- **Evidence:** Confirmed via `gh api repos/stellar/stellar-rpc/compare/v30.0.0...v30.0.1` (`13e53516633c...6b6ec60c8bde`): `v30.0.1` is 211 commits and 300 changed files ahead of `v30.0.0`, including `cmd/stellar-rpc/internal/methods/get_events.go` (312 changed lines) and a rename of `cmd/stellar-rpc/internal/config/options.go` to `cmd/stellar-rpc/internal/rpcv1/config/options.go`. Checking release notes alone did not inspect those files. Direct inspection of tagged `v30.0.1` source (`6b6ec60c8bde5a93984b6290065d3882d384b25d`) now establishes the release-specific behavior directly: `cmd/stellar-rpc/internal/rpcv1/config/options.go:307-312` keeps `history-retention-window` (0 diff across rename) and `cmd/stellar-rpc/internal/methods/get_events.go:139,160-175,269-270` continues to bound queries to `ledgerRange.FirstLedger.Sequence..LastLedger.Sequence`.
- **Action:** Fixed `VERIFICATION.md` — replaced the release-notes-silence claim with the direct tagged `v30.0.1` (`6b6ec60c8bde`) source verification of `rpcv1/config/options.go` and `methods/get_events.go`.

### Finding 4 (Sol: Low) — `VERIFICATION.md:42` and `:48` overclaim which historical grep term matched in `0.2/EXEC.md:155`

- **Sol's claim (`SOL-REVIEW.md:8`):** `0.2/EXEC.md:155` records matching paths only and abbreviates its pattern list with `...`, so attributing which terms caused the historical item 0.2 grep match is unverified even though current field-level inspection is solid.
- **Verdict:** **valid**
- **Evidence:** Confirmed by reading `.agents/rounds/2026-11-16-next-phase/items/0.2/EXEC.md:155` (which uses an ellipsis `...` and lists paths without per-term match counts) and `git log --oneline 0bfbc8f4..HEAD` on both files (`q-soroban-cli-bindings.json` also received PR #458, commit `d596b36f`, after PR #452). Direct file inspection proves only which Scout 1.9.150 terms are present or absent in the current files, not which branch of item 0.2's unlogged grep alternation originally hit.
- **Action:** Fixed `VERIFICATION.md` — scoped both trigger-analysis paragraphs strictly to what direct inspection of each current file proves, and noted that `0.2/EXEC.md:155` did not log the matched pattern.

### Finding 5 (Sol: Low) — `VERIFICATION.md:44` and `:50` claim HTTP 200 for all `truth.sources` URLs without listing per-URL results

- **Sol's claim (`SOL-REVIEW.md:9`):** Both lines claim every HTTP URL in `truth.sources` returned HTTP 200, while omitting per-URL results and several distinct URLs (including historical release tags and compound-row queries) from the verification table.
- **Verdict:** **valid**
- **Evidence:** Confirmed by comparing `VERIFICATION.md`'s observations table against the full HTTP URL sets in both cases (5 HTTP URLs in `q-soroban-cli-bindings`; 18 distinct HTTP URLs / 19 total URL references across 17 URL-bearing rows in `q-tool-indexer-repos-discovery`). Although all 5 URLs of `q-soroban-cli-bindings` and the 17 leading URLs of `q-tool-indexer-repos-discovery` had been fetched live (`fetch(..., { redirect: "manual" })`), the record omitted the per-URL results and had tested the two compound-row second queries (`?q=subquery%2Fstellar-subql-starter` and `?q=obsrvr`) only via local Raven rather than direct HTTP GET. Both compound suffixes were directly fetched on 2026-11-19 and returned HTTP 200.
- **Action:** Fixed `VERIFICATION.md` — added the complete per-URL HTTP-200 ledger covering all 5 URLs in `q-soroban-cli-bindings` and all 18 distinct HTTP URLs (19 total URL references) in `q-tool-indexer-repos-discovery`.
