# Verification addendum — rev-grok

Commit: `a6db8c1a915e874b5787818c1220dfb67b883779`
Range: `git diff f65e165d..a6db8c1a`
Ledger: `.agents/rounds/2026-09-30-skill-system-audit.md` Reconciliation and Golden verification record.

## Verdict

accept

## Notes

Finding 1 (`sk-027` locations and the fixed roster) is resolved.
The finding now cites `SKILL.md:90`, `README.md:76-78`, and `references/api-reference.md:196`.
Line 196 at the pin is the install URL `https://skills.stellar.org/skills/{name}/SKILL.md`.
The recommendation removes fixed lists and counts, keeps `smart-contracts` only for a concrete slug, fixes `anchors`, and corrects line 194 to match the multi-source sentence on line 189.
The comment https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-5919085549 (user `kalepail`, `2026-09-30T20:24:54Z`) changes the proposed action and matches that text.
The pipeline allows that comment.
The comment's source-record link points at `main`.
`origin/main` is still `f65e165d`, so that URL still shows the old recommendation until this branch merges.
The comment body itself is the correction.

Finding 2 (Quickstart `/lab`) is resolved.
I agree with the rejection.
My first probe used `stellar/quickstart` branch `master`, tip `258a5b6e0e9978648f9f02a072d38efb4c7dec70` (`2025-03-26`).
The default branch is `main`, tip `8f5dcf166978d2d5da152c37930b666738e6e10e` (`2026-09-29`).
The main README lists `Lab: http://localhost:8000/lab` and `--enable lab`.
`common/nginx/etc/conf.d/lab.conf` at that tip contains `location /lab`.
`common/lab/bin/start` exports `NEXT_BASE_PATH=/lab` and `NEXT_PUBLIC_DEFAULT_NETWORK=custom`.
The answer text did not change.
The new corroboration row records this evidence.
The upload-deploy page (HTTP 200) says sign with "secret key, hardware wallet, extension wallet, or signature."
That sentence supports the signer-category row.
The note's word "match" treats extension wallet as wallet-kit and signature as external.
Those two answer names are a gloss of the page words.
The page quote itself is true.

Finding 3 (Adding a source) is resolved.
`ecosystem-skills/README.md:196-227` now requires `unpinnedUpstream`, states that the drift check enumerates a source only when that map is non-empty, names the routing comparison and the `eval/gates.json` fingerprint, keeps thresholds unchanged unless a separate decision changes them, requires `skill floor 1` and proposal-first activation, and requires a reviewer who differs from the author and the orchestrator.
An unadmitted decision may live in [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md).
I agree with the queued code change in `.agents/TODO.md` ("Make the drift check's cherry-pick mode explicit").
The README now tells the operator the current limit.
The code still infers the mode.

Finding 4 (decision K directory name) is resolved.
[`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) now names upstream directory `skills/fetch-external-doc`, the overlap with the exposed SCF skills, the `2026-07-23` push, and the standard `skills/` layout.
I agree with the queued body read.
The decision still says the fit is name-level.

Additional work 1 is resolved.
`improvements/skills/sk-028-scout-skill-stale-builder-count.md` is a successor, status `verified`, and it does not edit issue 14.
The pin line I re-read is true: `references/api-reference.md:104` says "small and sparse (~110 profiles".
The recommendation removes the fixed counts and points at `/api/status` and the `/api/builders` advisory.
I agree that upstream filing waits for the owner.

Additional work 2 stays correctly unfiled.
The chunk-count pair inside the Scout skill is still unverified.

The new selector and mirror checks introduce no defect that blocks this commit.
`selectGitHubSkillFiles` rejects a missing tree array, `truncated: true`, a named pick with no `SKILL.md`, an empty selection, and a repo-root skill with no root `SKILL.md`.
`ecosystem-skills/update.sh` has `set -euo pipefail` and passes the raw recursive tree, so a truncated tree aborts before the swap.
`check-mirrors.mjs` records a failure when `source.skills` is missing or empty, then iterates `source.skills ?? []`.
`npx vitest run test/skill-source-selection.test.mjs` passed: 7 tests.
A non-array `skills` value still throws inside the loop, and the catch exits 2 before the failure list prints.
An empty pick list still accepts a child directory that has Markdown and no `SKILL.md`.
Both limits are outside the tested fix.
They do not change this verdict.
