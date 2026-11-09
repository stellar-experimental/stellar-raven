# Independent sd-100 retirement review — 2026-11-09

**Verdict: retire. No successor needed.** Both reported repetitions are corrected on the deployed production page, the settlement link remains intact, and the linked explanation retains the target-versus-observed-close distinction. The broader source and served-corpus scans found no remaining 5–7-second range. This approves the technical retirement candidate; reference cleanup, resolution comments/readback, the resolver and its validation gates remain coordinator work.

Reviewer: independent `t3cc` (Astra lane), distinct from coordinator/author Claude Opus and the earlier docs author. Read `tmp/review-brief.md` again, the follow-up brief, the current finding and `git show origin/main:improvements/stellar-docs/sd-100-usdt0-launch-ledger-cadence.md`. All live checks below were newly executed. No author's transcript or earlier response was reused. No tracked files changed, upstream comments posted, maintenance jobs dispatched, agents started or paid calls made.

## Direct upstream inspection

- [Issue3078](https://github.com/stellar/stellar-docs/issues/3078): author `kalepail`; closed completed **2026-11-09T20:38:32Z**.
- [PR3080](https://github.com/stellar/stellar-docs/pull/3080): author **stellar-triage-bot[bot]**, merged **2026-11-09T20:38:31Z**, merge commit **b5f22fb71ca0dfa06655b77c42de6773bde1f2a4**. One file, two replacements in `snippets/usdt0-launch.jsx`, lines778 and836. All eight returned head checks succeeded. [ElliotFriend's review](https://github.com/stellar/stellar-docs/pull/3080#pullrequestreview-5832366606) approved at20:38:23Z.
- [Issue comment6749604250](https://github.com/stellar/stellar-docs/issues/3078#issuecomment-6749604250) is by **stellar-triage-bot[bot]**,19:40:11Z: it describes the proposed changes and promises a later live handoff. It is not deployment confirmation.
- [PR comment6750421867](https://github.com/stellar/stellar-docs/pull/3080#issuecomment-6750421867) is by the **same bot author**,20:18:21Z: its verification concerns the preview. It is not independent review or production verification. The [mintlify[bot] comment](https://github.com/stellar/stellar-docs/pull/3080#issuecomment-6749598840) likewise concerns a preview.

Read issue/PR bodies, issue comments/timeline, PR comments/reviews/files directly with `gh api ... --jq .`; returned JSON and request timestamps20:51:12Z are in `tmp/review-astra-sd100-data/`. Read head check-runs separately. I also fetched the original source at `f83baf27c91fdbc54c04872aba603b73d9cd9469` via the GitHub contents API: both old strings exist at the recorded lines, so the original trigger is correctly reconstructed.

## Original trigger and deployed result

Fresh production requests began **2026-11-09T20:51:28Z**, after the merge:

1. `https://developers.stellar.org/launch/usdt0.md`
2. `https://developers.stellar.org/launch/usdt0`
3. `https://developers.stellar.org/launch/usdt0?review=astra-20261109T205128Z`
4. `https://developers.stellar.org/launch/usdt0.md?review=astra-20261109T205128Z`

All returned HTTP200. In all four response bodies, the FAQ now uses **about 5 seconds**, and the settlement value is **~5s**. The production HTML carries the corrected text in the serialized JSX payload. Neither stale range remains. The Markdown settlement link still targets `https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md`; HTML retains `/docs/learn/fundamentals/stellar-stack`. Normal and cache-busted Markdown have the same corrected content; HTML byte hashes differ without changing either relevant claim.

The obsolete defect-presence probe's two strings, `Stellar finalises in 5–7 seconds` and `[5–7s](`, are absent. That is the expected result of this fix, not an endpoint or transport failure.

Fresh [Stellar Stack](https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md) and [Validators](https://developers.stellar.org/docs/validators.md) reads both returned200, estimate approximately five seconds, and explicitly state that the network target can change and one ledger can take longer. Neither contains the old range. Thus the launch page's approximation links to the caveated explanation rather than asserting an exact immutable constant.

Fresh `https://horizon.stellar.org/ledgers?order=desc&limit=200` returned200: **Mainnet ledgers 65394089–65394288**, Protocol 29, **199 adjacent close-time deltas, all 5 seconds**, mean 5.000 seconds. This is a dated observation supporting the approximation, not proof of every interval or a permanent protocol value. It is a different sample from the author's earlier one.

## Adjacent scan and successor decision

Fetched current upstream main, which resolves to the merge commit `b5f22fb71ca0dfa06655b77c42de6773bde1f2a4`, and scanned **1,297 UTF-8 text source files**, including Markdown/MDX, JSX/TSX/JS/TS, HTML, JSON/YAML and text. The scan traversed the downloaded repository archive in memory; it did not alter the worktree. It included pages and snippets and found **zero** ranges matching:

```regex
(?:5\s*(?:[–—−-]|to)\s*7|five\s*(?:[–—-]|to)\s*seven)
```

HTML entities were decoded before matching. Source receipt: `tmp/review-astra-sd100-data/source-scan.json`; archive SHA256 `cd0f6c9d35a8d0a4a895e483151b5571a99171bef807d75c4a8df6c1edb06b55`. The current snippet contains both corrections at the original lines.

Also freshly fetched **https://developers.stellar.org/llms-full.txt**, HTTP200, **5,895,502 bytes**, at20:52:07.679404Z. The same range scan found **zero matches** in this served documentation corpus. Stack and Validators' approximate wording is present. The corpus does not include the launch FAQ's literal text, so it does not replace the four direct launch-page checks above. These checks support no successor for this defect within the inspected source/served corpus; they do not claim that every external mirror or historical cached page was crawled.

The coordinator's fixed call is independently confirmed. The earlier docs-lane still-repro result preceded merge/deployment and is dated evidence, not an unresolved contradictory verdict.

## Persistent references and retirement gates

Executed:

```sh
rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' 'sd-100' .
```

Full results: `tmp/review-astra-sd100-references.txt`. Reconcile:

- `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`: answer and notes currently assert that the USDT0 page still has the old range; update to the deployed correction. Its verified evidence/rootCause points to the soon-deleted finding: pin that source or point to the resolved receipt. Keep approximate/datable grading and historical pre-Protocol 28 evidence; do not impose an exact-five-second guarantee.
- `eval/qa/consistency-register.json`: its live rationale records the sd-100 residual; reconcile with the new correction through the appropriate register workflow.
- Generated `eval/qa/cases.json` and `eval/qa/sample.json`: regenerate from the canonical case; do not edit by hand.
- `.agents/TODO.md`: remove the live sd-100 residual and PR3080 awaiting-review condition; retain unrelated sd-101 work.
- `improvements/INDEX.md`: regenerate after retirement. Delete the finding and its embedded stale-string probe via resolver. The ID scan found no per-finding intake override for sd-100.
- `improvements/resolved.json`: append the sd-100 receipt; the earlier sd-054 receipt's successor reference remains valid historical evidence. Do not rewrite that earlier observation to pretend it was fixed when sd-054 retired.
- `.agents/rounds/2026-11-09-upstream-handoffs.md` and `research/audits/2026-11-09-improvements-sweep/lane-docs.md`: preserve the earlier timed observations; add/currently link the later resolution where these are used as live status.

At inspection, issue/PR comments contained proposal and preview claims, not a Raven production-resolution comment with pinned source. The coordinator must post/read back the resolution evidence on required upstream refs, then use resolver dry-run and final cleanup; required improvements/golden/register/generated-artifact gates follow the actual edits. I did not run code tests for this read-only review.

## Upstream live-recheck paragraph (under 600 characters)

2026-11-09 20:51Z: independently fetched production USDT0 Markdown, HTML and cache-busted variants (all 200). Both estimates are corrected to about 5 seconds / ~5s; no 5–7 range remains and the Stack link is intact. Stack and Validators retain the configurable-target caveat. Mainnet ledgers 65394089–65394288 yielded 199 five-second intervals, a dated sample, not a guarantee. A scan of 1,297 source files at b5f22fb71ca0dfa06655b77c42de6773bde1f2a4 and the live llms-full.txt found no old range. No successor needed.

Character count: 518. Append the commit-pinned Raven source separately when posting.

## Reproducible commands and hashes

Runner: `python3 tmp/review-astra-sd100-fetch.py`. Each HTTP call used `curl -sS -L --max-time 50 -D <headers> -o <body> -w '%{http_code} %{url_effective}' <URL>`. Exact argv, timestamps and hashes are retained in `tmp/review-astra-sd100-data/requests.json` and `llms-full-request.json`.

| Request | UTC start | HTTP | SHA256 |
|---|---|---|---|
| https://developers.stellar.org/launch/usdt0.md | 2026-11-09T20:51:28.192340+00:00 | 200 | `674ca833bb3501364b8bfb02cc743aa71a1f66a6c0698e5648560d37f10d869c` |
| https://developers.stellar.org/launch/usdt0 | 2026-11-09T20:51:28.192426+00:00 | 200 | `b7051659f60a6696e6f1a704573e266385a5a291eaa31ec77659a9b68f7d7624` |
| https://developers.stellar.org/launch/usdt0?review=astra-20261109T205128Z | 2026-11-09T20:51:28.193639+00:00 | 200 | `16e37b15f9ad4352339fefa96e68b0f1769b6d2d7cc6513ebb46726233d8d4c6` |
| https://developers.stellar.org/launch/usdt0.md?review=astra-20261109T205128Z | 2026-11-09T20:51:28.195253+00:00 | 200 | `674ca833bb3501364b8bfb02cc743aa71a1f66a6c0698e5648560d37f10d869c` |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md | 2026-11-09T20:51:28.196827+00:00 | 200 | `eb896b368c86eff88e9b8bef31fe38f410432738ace4106405a1130136ef655e` |
| https://developers.stellar.org/docs/validators.md | 2026-11-09T20:51:28.197085+00:00 | 200 | `84a4b7b8e61a6082348907390271e5493a745803fdda39090e1925bfd921037c` |
| https://horizon.stellar.org/ledgers?order=desc&limit=200 | 2026-11-09T20:51:28.201181+00:00 | 200 | `7e8fa105b4def9904947286760bc069801b39959c9f4fb514783b45756d83092` |
| https://developers.stellar.org/sitemap.xml | 2026-11-09T20:51:28.203588+00:00 | 200 | `6e65b0276f42b63efa0c9c94aec20531481cbbbd2a36e38e2a546346624106e1` |
| https://developers.stellar.org/llms-full.txt | 2026-11-09T20:52:07.679404+00:00 | 200 | `d323bea6fd326f98b4c9bcc5bc9dcbe0c78990740babd773f3beb8c8b3f38ad5` |

Direct GitHub command forms (all read-only):

```sh
gh api repos/stellar/stellar-docs/issues/3078 --paginate --jq .
gh api repos/stellar/stellar-docs/issues/3078/comments --paginate --jq .
gh api repos/stellar/stellar-docs/issues/3078/timeline --paginate --jq .
gh api repos/stellar/stellar-docs/pulls/3080 --paginate --jq .
gh api repos/stellar/stellar-docs/issues/3080/comments --paginate --jq .
gh api repos/stellar/stellar-docs/pulls/3080/reviews --paginate --jq .
gh api repos/stellar/stellar-docs/pulls/3080/files --paginate --jq .
gh api repos/stellar/stellar-docs/commits/7423bc52d2bf026cccc61a6954b59646bb01f646/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api 'repos/stellar/stellar-docs/contents/snippets/usdt0-launch.jsx?ref=f83baf27c91fdbc54c04872aba603b73d9cd9469' --jq .
gh api repos/stellar/stellar-docs/commits/main --jq '{sha,commit:{committer:.commit.committer}}'
gh api repos/stellar/stellar-docs/tarball/b5f22fb71ca0dfa06655b77c42de6773bde1f2a4 > tmp/review-astra-sd100-data/source.tar.gz
```
