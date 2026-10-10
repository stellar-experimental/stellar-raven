# Lane D review: independent drain check for `sls-087`

Reviewer: Claude Fable 5.1, high effort, distinct from the author and the orchestrator.
Date: 2026-10-10. Mode: read-only in the main checkout. No file in the repository changed.
Scratch copies of every live response are in the session scratchpad only.

## Result

The original trigger no longer reproduces. The live Scout answer gives `MaxSupportedProtocolVersion = 29`.
The source at the response's own `scannedRef` also defines `29`. The note links a commit, not a branch.
The upstream change is deployed, not only merged. The `fixed-upstream` classification is correct.

## 1. Finding and upstream refs, read directly

- The finding file is `improvements/stellar-light-scout/sls-087-horizon-protocol-ceiling-note-stale.md`.
  Its status is `fixed-upstream`. It has no `probe` frontmatter.
- Issue https://github.com/Stellar-Light/stellarlight/issues/1738 is `CLOSED` with reason `COMPLETED`.
  It closed at 2026-10-08T17:00:39Z. The issue author is `kalepail` (Raven).
- The only comment is by `theboycoder`, posted 2026-10-08T17:00:36Z. This account has `admin`
  permission on `Stellar-Light/stellarlight`. The maintainer wrote the fix claim, not Raven.
  The comment says the fix is "live since its deploy on 2026-10-08" and gives a `curl` check.
- PR https://github.com/Stellar-Light/stellarlight/pull/1805 is `MERGED` into `main` at
  2026-10-08T16:47:06Z. Merge commit: `f3294b7df703f11c1a12afe5c62d63d31d5258fd`. Author and merger:
  `theboycoder`. It has no linked closing issue, so the maintainer closed issue 1738 by hand.
- The PR changes `src/lib/repo-knowledge.ts`. The Horizon note moves from `= 28` with a
  `blob/master/...` link and `asOf: "2026-09-01"` to `= 29` with the link
  `https://github.com/stellar/stellar-horizon/blob/430a28e79b3b43c213840e45523519ca11251c0a/internal/ingest/main.go#L38`
  and `asOf: "2026-10-08"`. The test file changes three `toContain("= 28")` checks to `"= 29"`.

## 2. Deployment confirmation

- The PR body states that the Horizon note lands "at deploy (the explain route reads the curated notes
  directly)". No separate data lane is needed for this finding.
- The four GitHub Actions runs on the merge commit passed (`Unit tests`, `Contract gate`,
  `consumption-guard`, `PG Atlas data upload`). No deploy workflow runs in Actions, so Actions alone
  does not prove deployment.
- The live proof: both live responses below return the exact new note text and `answerAsOf`
  `2026-10-08T00:00:00Z`. That text exists only in the merged PR. The deployed route therefore
  serves the merged code.
- `GET https://stellarlight.xyz/api/status` at 2026-10-10T13:56:46.078Z reports `apiVersion` `1.9.72`.
  The changelog's latest entry (2026-10-08, `spec@1.9.72`) belongs to `sls-088` (PR 1806), which merged
  7 seconds after PR 1805. The 1.9.72 build therefore includes PR 1805. The changelog has no entry for
  `sls-087` itself. That is expected: PR 1805 is a data fix, not a spec change.
- Current `src/lib/repo-knowledge.ts` on `main` (line 3215) still holds the new `= 29` note.

## 3. Fresh execution of the original trigger

Command (the finding's Evidence section, run by this reviewer):

```sh
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
```

| field | value |
|---|---|
| HTTP status | 200 |
| `meta.generatedAt` | `2026-10-10T13:55:35.982Z` |
| local wall clock | 2026-10-10T13:55:24Z start, 13:55:36Z end (UTC) |
| answer value | `MaxSupportedProtocolVersion = 29` |
| `answerSource` | `knowledge-note` |
| `answerAsOf` | `2026-10-08T00:00:00Z` |
| `codeVerified.scannedRef` | `ee5241ec8d9a3233b574ea432ec313b304b6851d` |
| `codeVerified.scannedAt` | `2026-10-05T22:44:50.106Z` |
| `routedVia` | `explicit` |

Full answer text returned:

```text
Horizon's protocol ceiling: MaxSupportedProtocolVersion = 29 (a uint32 constant defined in internal/ingest/main.go), since the Protocol 29 support commit of 2026-09-23 (verified 2026-10-08 at that commit: https://github.com/stellar/stellar-horizon/blob/430a28e79b3b43c213840e45523519ca11251c0a/internal/ingest/main.go#L38). Horizon split out of the stellar/go monorepo; the monorepo's frozen copy still carries pre-split values, so cite THIS repo for current Horizon constants.

(A fuller mechanism walkthrough exists via sources.deepWikiUrl — an undated index that can LAG the dated fact above; where they disagree, the dated fact wins.)
```

## 4. Source comparison at the exact `scannedRef`

Fetched `https://raw.githubusercontent.com/stellar/stellar-horizon/ee5241ec8d9a3233b574ea432ec313b304b6851d/internal/ingest/main.go`.

| item | value |
|---|---|
| line 38 | `MaxSupportedProtocolVersion uint32 = 29` |
| SHA-256 | `8ea8c735f70863f0df17deaf4452ab0858ca0609d21be6ea0cc046976bd6db59` |
| commit date of `ee5241ec` | 2026-10-03T04:54:07Z |

The answer value and the source value agree. The SHA-256 matches the value recorded in the finding.

Extra checks:

- The note's pinned commit `430a28e79b3b43c213840e45523519ca11251c0a` (merge of `stellar/protocol-next`,
  2026-09-23T16:34:31Z) has the same file bytes. Same SHA-256, same line 38.
- Horizon `main` head `a461e34adbd0b47a0561446af504d8ef2e507004` (2026-10-09T17:55:04Z) still defines
  `29` at line 38. The file SHA-256 differs (`9849bb00…2286c`) because of unrelated filter changes.
  No newer protocol bump exists, so the note is current against the newest source too.
- The Horizon default branch is `main`. The old `master` link is gone from the note.

## 5. Explicit current-value question

Query `q=What is the current value of MaxSupportedProtocolVersion in internal/ingest/main.go?`
against the same endpoint and repo.

| field | value |
|---|---|
| HTTP status | 200 |
| `meta.generatedAt` | `2026-10-10T13:55:44.718Z` |
| answer value | `MaxSupportedProtocolVersion = 29` |
| `answerSource` | `knowledge-note` |
| `answerAsOf` | `2026-10-08T00:00:00Z` |
| `codeVerified.scannedRef` | `ee5241ec8d9a3233b574ea432ec313b304b6851d` |

The answer text is byte-identical to the answer in section 3. `knowledgeNotes[0]` carries the same
note with `source: curated` and `asOf: 2026-10-08`.

## 6. Residual scan

- **Source link pinned to a commit:** yes. The link names `430a28e7…` and `#L38`. No branch name
  remains in the note. The old "scanned ref 82660510" text is gone.
- **"Dated fact wins" guidance:** the route still appends "where they disagree, the dated fact wins",
  and `meta.warnings` repeats it (`src/app/api/repos/explain/route.ts` lines 364 and 381). This
  sentence compares the dated note with the undated DeepWiki index. It does not tell the reader to
  prefer the note over primary source. The note itself says "cite THIS repo for current Horizon
  constants" and pins the source commit. Today the note is current, so the sentence does not point
  at an older value. This is not a live defect.
- **Structural limit, not a defect today:** the note is a hand-curated dated fact. Scout does not
  re-verify constants against `scannedRef` per request. The maintainer states this limit in the
  issue comment. The Scout changelog entry for `spec@1.9.8` (2026-08-31) declines per-request source
  verification on purpose. A future protocol bump (Protocol 30) would recreate the staleness until
  the note is re-curated. I do not recommend a successor finding now. A finding needs a reproducible
  current defect, and re-asking a declined design would be noise. The existing `.agents/TODO.md`
  monitor entry already names the exact per-round check. If that monitor fails again, file a new id
  and cite the `sls-080` and `sls-087` receipts in `improvements/resolved.json`.
- **Out of scope, already owned elsewhere:** `codeVerified.symbols` and `contractInterface` for
  `stellar/stellar-horizon` still list fixture contract symbols (`IncrementContract`, `bulk_transfer`).
  That belongs to `sls-088` (`reported-upstream`, issue 1739), not to `sls-087`.
- No golden case encodes the Horizon constant. `rg --hidden MaxSupportedProtocolVersion` outside
  `improvements/` and `.agents/rounds/` hits only the Scout field description text in
  `catalog/manifest.json` and `inventory/stellar-light.json`. Those are generated upstream schema
  copies and need no change.

## 7. Reference reconciliation (`rg -n --hidden "sls-087" .`)

Note: plain `rg` skips the hidden `.agents/` tree. Use `--hidden` for this step.

| reference | drain action |
|---|---|
| `improvements/stellar-light-scout/sls-087-horizon-protocol-ceiling-note-stale.md` | the resolver deletes it |
| `improvements/INDEX.md:33` | the resolver regenerates the index |
| `improvements/resolved.json` | the resolver appends the receipt (no `sls-087` entry exists yet) |
| `improvements/intake.json` | no `sls-087` override exists; nothing to remove |
| `.agents/TODO.md:48` and `:52` | **must change**: replace the active file path with the `sls-087` receipt in `improvements/resolved.json`, add the 2026-10-10 drain date and the resolution comment URL, and keep the per-round monitor instruction |
| `.agents/rounds/2026-10-09-continuation.md:88` | dated ledger; leave unchanged. Record the drain and comment URL in the 2026-10-10 round ledger instead |
| `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md:56` | dated ledger; leave unchanged |
| `.agents/rounds/2026-09-29-truth-maintenance.md:87` and `:157` | dated ledger; leave unchanged |

No golden, register, research, Algolia-rule, or probe reference exists. The 2026-09-29 and 2026-10-09
evidence JSON files cited in the finding are tracked in git. I re-read the 2026-10-09 files; their
`generatedAt`, `answerSource`, `answerAsOf`, and `scannedRef` match the finding's evidence lines.

## 8. Resolver dry run

I ran the exact command from the brief with the `--live-recheck` string below. Exit code 0.
`git status --porcelain` before and after the run is identical (`?? plugins/` only). The finding
file still exists. The dry run wrote no file.

The printed receipt resolves `repo` to `Stellar-Light/stellarlight`, `upstreamRefs` to issue 1738,
`resolvingRefs` to PR 1805, and `sourceCommit` to `d15a4ce52c997577313779872d9f89de7725debc`. The
working tree copy of the finding equals that commit, so the snapshot link is valid. If the
orchestrator edits the finding before the real run (for example to add 2026-10-10 evidence), commit
first and re-run the dry run. The snapshot commit will change.

Recommended `--live-recheck` string (one line):

```text
2026-10-10T13:55:35.982Z GET https://stellarlight.xyz/api/repos/explain?repo=stellar/stellar-horizon&q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value? returned MaxSupportedProtocolVersion = 29 with answerSource knowledge-note, answerAsOf 2026-10-08T00:00:00Z, and codeVerified.scannedRef ee5241ec8d9a3233b574ea432ec313b304b6851d; internal/ingest/main.go at that ref defines MaxSupportedProtocolVersion uint32 = 29 at line 38, SHA-256 8ea8c735f70863f0df17deaf4452ab0858ca0609d21be6ea0cc046976bd6db59; the note links commit 430a28e79b3b43c213840e45523519ca11251c0a; the explicit current-value query at 13:55:44.718Z also returned 29
```

Draft upstream resolution comment for issue 1738 (the resolver's printed text, verbatim):

```text
Raven independently rechecked sls-087 on 2026-10-10 and confirmed the original trigger is resolved live.

Live recheck: 2026-10-10T13:55:35.982Z GET https://stellarlight.xyz/api/repos/explain?repo=stellar/stellar-horizon&q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value? returned MaxSupportedProtocolVersion = 29 with answerSource knowledge-note, answerAsOf 2026-10-08T00:00:00Z, and codeVerified.scannedRef ee5241ec8d9a3233b574ea432ec313b304b6851d; internal/ingest/main.go at that ref defines MaxSupportedProtocolVersion uint32 = 29 at line 38, SHA-256 8ea8c735f70863f0df17deaf4452ab0858ca0609d21be6ea0cc046976bd6db59; the note links commit 430a28e79b3b43c213840e45523519ca11251c0a; the explicit current-value query at 13:55:44.718Z also returned 29

The active finding is being retired under the ephemeral improvements lifecycle. Immutable source snapshot: https://github.com/stellar-experimental/stellar-raven/blob/d15a4ce52c997577313779872d9f89de7725debc/improvements/stellar-light-scout/sls-087-horizon-protocol-ceiling-note-stale.md
```

The comment carries the live result and two commit-pinned links: the Horizon source commit
`430a28e7…` and the Raven snapshot commit `d15a4ce5…`. Post it on issue 1738 only. PR 1805 needs no
comment; the issue is the filed ref.

## 9. Drain order for the orchestrator

1. Post the comment above on issue 1738. Read it back with `gh api … --jq .body` and record the URL.
2. Run the resolver without `--dry-run`, with the same arguments.
3. Update `.agents/TODO.md` lines 48 and 52 as in section 7. Record the drain in the 2026-10-10 ledger.
4. Run `npm run improvements:index`, `npm run improvements:lint`, and `npm run improvements:lint -- --live`.
5. Run `npm run secrets:scan -- --tree` before the commit.

## Unresolved risks

- The fix is a curated dated fact. A Protocol 30 bump in Horizon will make the note stale again until
  a maintainer re-curates it. The per-round monitor in `.agents/TODO.md` is the control.
- No GitHub Actions deploy run exists to cite. The deployment proof is the live response text that
  only the merged PR contains, plus the maintainer's dated deploy statement.

DRAIN-OK
