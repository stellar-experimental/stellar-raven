---
id: sk-031
service: skills
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: skills.stellar.org still publishes the deleted soroban skill with obsolete build guidance
evidence:
  - 2026-11-02 public recheck: curl -sS -L https://skills.stellar.org/skills/soroban/SKILL.md returned HTTP 200, 71331 bytes. The file contains 12 wasm32-unknown-unknown lines and zero wasm32v1-none lines. GET /skills/smart-contracts/SKILL.md returned HTTP 200 with four wasm32v1-none lines and zero wasm32-unknown-unknown lines. The index has no exact skills/soroban/SKILL.md link.
  - 2026-11-02 timeline calibration: gh api repos/stellar/stellar-dev-skill/commits/5907afc601 confirms source removal on 2026-06-29T13:56:20Z. The first following main deployment was gh-pages commit 4f56f67ffeae71dec79a2a8fc8fe168aa6cf082a at 2026-06-29T13:57:14Z. gh api repos/stellar/stellar-dev-skill/contents/skills/soroban/SKILL.md?ref=4f56f67ffeae71dec79a2a8fc8fe168aa6cf082a still returns blob 3c98cb8194d0921ddae7b5a9e1ed895511e968e2. The current live file has that same git blob hash. This establishes the first orphaning deployment.
  - 2026-11-02 adjacent check: rg -n "skills/soroban|wasm32-unknown-unknown" over current source skills and deployment workflows found no legacy skill or old target in current skills. The main publish workflow still sets keep_files: true and preserves pr/<N>/ previews. The current gh-pages file and live orphan are byte-identical.
  - 2026-11-02 calibration scope: this finding concerns continued publication after source deletion. The target comparison establishes obsolete guidance, not a dependency-specific compilation failure. No failing Rust snippet is alleged or added.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among 43 issues and 125 PRs in stellar/stellar-dev-skill. Resolved sk-001 corrected current build guidance; sk-027 concerns Scout references. Issue 21 concerns earlier content defects. This finding owns stale deployment retention.
  - Resolved predecessor sk-001 corrected current smart-contracts build guidance. Its receipt names stellar/stellar-dev-skill issue 44 and PR 45. The stale published soroban file escaped that correction.
  - The consumer reference remains active in sk-027. Stellar-Light/stellar-scout references/api-reference.md builds https://skills.stellar.org/skills/{name}/SKILL.md and names soroban. This finding targets publication retention at stellar/stellar-dev-skill.
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-dev-skill/issues/172
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: GET https://skills.stellar.org/skills/soroban/SKILL.md versus smart-contracts; deploy workflow — Legacy orphan still200/71331bytes with12 wasm32-unknown-unknown lines; current skill wasm32v1-none. keep_files:true persists. Bot confirmed cause and supplied unapplied workflow patch requiring human workflow permission. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row sk-031."
---

## Finding

`skills.stellar.org/skills/soroban/SKILL.md` still returns the deleted `soroban` skill with obsolete build guidance.
The source repository removed the skill on 2026-06-29.
The live file still contains 12 `wasm32-unknown-unknown` lines.
The current `smart-contracts` skill uses `wasm32v1-none` instead.

Callers that request the old file receive HTTP 200 and the stale content.
The current site index does not link to that exact file.

## Evidence

Fresh public requests on 2026-11-02 returned these results:

| URL | Result |
|---|---|
| `https://skills.stellar.org/skills/soroban/SKILL.md` | HTTP 200; 71331 bytes; 12 old-target lines |
| `https://skills.stellar.org/skills/smart-contracts/SKILL.md` | HTTP 200; four `wasm32v1-none` lines; zero old-target lines |

Commit `5907afc60100650305355e74632cb5254e1b90bb` removed the source file at 2026-06-29T13:56:20Z.
The next main deployment, `4f56f67ffeae71dec79a2a8fc8fe168aa6cf082a`, ran at 2026-06-29T13:57:14Z.
That deployment still contained the deleted file.
Its blob hash, `3c98cb8194d0921ddae7b5a9e1ed895511e968e2`, matches the live file today.

The current `.github/workflows/deploy-pages.yml` sets `keep_files: true` for `peaceiris/actions-gh-pages`.
That setting preserves PR preview folders and files that the main build no longer produces.
The old file last changed on 2026-06-11.
The defect began with the later deployment that failed to remove it.

## Recommendation

Delete `skills/soroban/` from the `gh-pages` branch.
Make the main deployment remove files that the main build no longer produces.
Preserve the `pr/` preview folders during that cleanup.
Add a deployment check that rejects published skill paths absent from the current source.
