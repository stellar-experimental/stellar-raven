# sls-080 deletion review — 2026-09-01

Reviewer: Grok 4.6. Distinct from the author lane. This review did not read the Terra report.

Verdict: **DEFER**

The original live trigger no longer reproduces. Source parity holds at the returned `scannedRef`. Upstream issue #1134 is closed complete. Spec `1.9.16` is live. Deletion still fails the pipeline bars.

## Scope

Finding: `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`.

Status in the working tree: `reported-upstream`. Not `fixed-upstream`.

Filed ref: https://github.com/Stellar-Light/stellarlight/issues/1134.

This review did not post comments. It did not edit findings, ledgers, generated files, or queues.

## Independent live recheck

Server: `http://localhost:8787`. Health: `{"status":"ok","service":"stellar-raven-codemode"}`.

Exact monitor question, pinned repo `stellar/stellar-horizon`:

> Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?

Raven `execute` at `meta.generatedAt` `2026-09-01T18:30:08.507Z`:

| field | value |
|---|---|
| `ok` | `true` |
| `repo` | `stellar/stellar-horizon` |
| `routedVia` | `explicit` |
| `answerSource` | `knowledge-note` |
| `answerAsOf` | `2026-09-01T00:00:00Z` |
| `answered` | `true` |
| `scannedRef` | `82660510ecda7fd365a14d08badb9d85fa22bc32` |
| `scannedAt` | `2026-08-14T21:59:19.911Z` |
| `lastCommitAt` | `2026-08-31T23:02:07.000Z` |
| numeric value in `answer` | `MaxSupportedProtocolVersion = 28` |

The answer names `28`. It does not name `25`. `meta.warnings` is present. It tells the reader not to treat the DeepWiki walkthrough as the dated fact.

Direct Scout `GET https://stellarlight.xyz/api/repos/explain` returned the same value, source, `answerAsOf`, and `scannedRef`. Live `/api/status` reports `apiVersion: "1.9.16"`. Live OpenAPI reports `1.9.16`.

The original defect was `answerSource: "deepwiki"` with value `25` and no answer date. That trigger does not reproduce.

## Source at the returned `scannedRef`

Command:

```sh
curl -sS "https://raw.githubusercontent.com/stellar/stellar-horizon/82660510ecda7fd365a14d08badb9d85fa22bc32/internal/ingest/main.go" \
  | rg -n "MaxSupportedProtocolVersion uint32"
```

Result: `internal/ingest/main.go:38` is `MaxSupportedProtocolVersion uint32 = 28`.

The same line is `28` at `2abda012` and at `master`.

Match rule: DeepWiki-or-answer value equals source at the response's own `scannedRef`. Current source is `28`. The live answer is `28`. Source parity holds.

Commit `82660510ecda7fd365a14d08badb9d85fa22bc32` exists. Date: `2026-08-12T18:03:34Z`.

## Upstream issue and linked fixes

Read with `gh api`, not HTML-escaped issue tools.

| ref | state | merged | merge commit | live role |
|---|---|---|---|---|
| [stellarlight#1134](https://github.com/Stellar-Light/stellarlight/issues/1134) | `closed` / `completed` | n/a | n/a | filed finding |
| [PR 1136](https://github.com/Stellar-Light/stellarlight/pull/1136) | merged `2026-08-31T04:11:40Z` | yes | `8fa9e6edd78f8890cd4018babf04493af70d1164` | `answerAsOf` + DeepWiki dating honesty, spec 1.9.8 |
| [PR 1163](https://github.com/Stellar-Light/stellarlight/pull/1163) | merged `2026-09-01T01:16:10Z` | yes | `b195c026f2082a0ab3dedb31b12001c4a5da7413` | knowledge notes + Horizon split-repo routing, spec 1.9.14 |
| [PR 1168](https://github.com/Stellar-Light/stellarlight/pull/1168) | merged `2026-09-01T01:41:24Z` | yes | `887db4d2a808a7c9aa9ebd8ad23a7782945bbac0` | note text puts `28` beside the constant name |
| [PR 1173](https://github.com/Stellar-Light/stellarlight/pull/1173) | merged `2026-09-01T02:46:43Z` | yes | `bdfb6df95a1bb991d605c386d2e274c9afb0b0de` | note-matcher hijack hardening, spec 1.9.15 |
| [PR 1174](https://github.com/Stellar-Light/stellarlight/pull/1174) | merged `2026-09-01T03:02:37Z` | yes | `76cb312d6bcee5260d98720402204feb774a3be6` | plain-English triggers for the monitor sentence, spec 1.9.16 |

Issue title matches the finding. Body contains `generated-by-stellar-raven`, Source Record, Resolution Handoff, and snapshot `b59517d33b48ea663d30fe840bcc949ab25043fc`. That snapshot blob exists.

Closed by `theboycoder` at `2026-08-31T04:11:41Z` after PR 1136. Value fixes landed later as comments on the closed issue.

PR 1174 checks: `vitest`, `contract`, `check`, `spectral` all `success`. Vercel landing deploy is `success` on each listed PR.

GitHub merge is not the live bar. The live bar is the Raven execute plus source read above. Both pass.

## Comment authors

Three comments exist. All are from `theboycoder` (collaborator), not Raven.

1. https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5473501657 — dating fix; optional constant-vs-`scannedRef` check declined.
2. https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5487478364 — value half, spec 1.9.14.
3. https://github.com/Stellar-Light/stellarlight/issues/1134#issuecomment-5488364353 — round 2, spec 1.9.16, exact monitor sentence.

No Raven resolution comment exists. No inbound `upstream-improvement-ready` issue exists on `stellar-experimental/stellar-raven` for `sls-080`.

## Adjacent behavior

These extra reads are not the original trigger. They test residual class.

1. Identifier question `What is MaxSupportedProtocolVersion?` with `repo=stellar/stellar-horizon`. Result: `answerSource=knowledge-note`, value `28`, `answerAsOf=2026-09-01T00:00:00Z`. Same `scannedRef`.
2. Auto-route of the exact monitor sentence with no `repo`. Result: `routedVia=canonical`, `repo=stellar/stellar-horizon`, value `28`, `answerSource=knowledge-note`. Routing no longer sends this question to archived `stellar/go`.
3. Fall-through `how does horizon check protocol versions` with `repo=stellar/stellar-horizon`. Result: `answerSource=stellarlight-code-scan`, `answerAsOf=2026-08-14T21:59:19.911Z`. Answer says DeepWiki has not indexed `stellar/stellar-horizon`. No `22`, `25`, `28`, or `32`. The code-scan prose calls Horizon a deployable Soroban contract. That is a different defect class.

`codeVerified.isDeployableContract` is `true` on the monitor path. Horizon is not a deployable contract. Do not stretch `sls-080` to cover that flag.

Committed Raven catalog still records OpenAPI `1.9.1` from `2026-08-28`. It has no `answerAsOf`. That is own-repo inventory drift. It is not an `sls-080` successor.

## Residuals

Do not file a successor from this review.

The named defect is dated answers versus scanned content. Live answers now carry `answerAsOf`. The monitor value matches source at `scannedRef`.

The maintainer declined per-request numeric checks against `scannedRef`. That decline is explicit. It is not a remaining `sls-080` ask.

Later optional work, new id `sls-082` if verified:

- `isDeployableContract: true` for `stellar/stellar-horizon`.
- Code-scan fallback that calls Horizon a Soroban contract.
- DeepWiki still unindexed for the split Horizon repo.

`sls-081` stays historical. Do not reuse it.

## Intake, probes, index

- `improvements/intake.json` has no `sls-080` override. Service default is `Stellar-Light/stellarlight`. That matches the filed issue.
- Finding has no `probe` frontmatter. `npm run improvements:probes` does not run this id.
- Working-tree `improvements/INDEX.md` lists `sls-080` as `reported-upstream` with 3 recurrences. That count matches the working-tree finding. Both files are dirty. This review did not change them.
- `improvements/resolved.json` has no `sls-080` receipt.

## Repo references

`rg -n sls-080` over the tree, including `.agents/`.

| path | role | deletion action later |
|---|---|---|
| `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md` | active finding | delete only through the resolver |
| `improvements/INDEX.md` | generated index | regenerate after resolve |
| `.agents/TODO.md` | watch + recovery recurrence home | rewrite before resolve; do not leave recurrences in a deleted file |
| `.agents/NEXT.md` | handoff still says `reported-upstream` | update after resolve |
| `.agents/rounds/2026-09-01-free-improvements-maintenance.md` | this round ledger | record the deferral |
| `.agents/rounds/2026-08-31-rejected-experiments-closeout.md` | historical closeout | keep; dated record |
| `.agents/rounds/2026-09-01-remaining-work-adversarial-audit*` | historical audits | keep |
| eval corpus, research, golden, Algolia rules | no hits | none |

The recovery item still writes recurrences into the active `sls-080` file. That home must move to the resolved receipt or to `TODO.md` before deletion.

## Comment requirements

The issue is closed and claims a fix. The skill requires a Raven verification comment before deletion.

Required later comment, not posted by this review:

```
Raven independently rechecked sls-080 on 2026-09-01 and confirmed the original trigger is resolved live.

Live recheck: POST http://localhost:8787/mcp execute scout.explainRepo repo=stellar/stellar-horizon q="Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?" returned MaxSupportedProtocolVersion = 28 with answerSource knowledge-note, answerAsOf 2026-09-01T00:00:00Z, generatedAt 2026-09-01T18:30:08.507Z, scannedRef 82660510ecda7fd365a14d08badb9d85fa22bc32. Source at that scannedRef defines MaxSupportedProtocolVersion uint32 = 28.

The active finding is being retired under the ephemeral improvements lifecycle. Immutable source snapshot: https://github.com/stellar-experimental/stellar-raven/blob/<COMMIT>/improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md
```

Replace `<COMMIT>` with the commit that holds the `fixed-upstream` finding. Do not use `--upstream-comment-na`. This finding was filed. Do not pass `--upstream-commented` until that comment exists and is read back.

## Deletion bars

| bar | result |
|---|---|
| Distinct reviewer re-ran the original trigger | pass |
| Answer matches source at returned `scannedRef` | pass |
| Change is live, not only merged | pass (`apiVersion` `1.9.16`) |
| Adjacent residual does not stretch this id | pass for deletion class; other defects use `sls-082` |
| Status is `fixed-upstream` | fail |
| Evidence body matches GitHub state | fail; body still says issue OPEN |
| Finding committed and matches snapshot | fail; working tree is dirty vs `35b5a385` |
| Raven resolution comment posted and read back | fail |
| Persistent queue refs reconciled | fail; `TODO.md` still uses the active file |
| Resolver can run | fail; resolver requires `fixed-upstream` |

## Exact commands used

Health:

```sh
curl -sS http://localhost:8787/health
```

Live trigger (do not read `r.meta`; that field is on `r.data`):

```sh
python3 - <<'PY'
import json, urllib.request
code = r'''async () => {
  const r = await scout.explainRepo({
    repo: "stellar/stellar-horizon",
    q: "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?"
  });
  if (!r.ok) return { ok: false, error: r.error };
  const d = r.data;
  const cv = d.codeVerified || {};
  const meta = d.meta || {};
  return {
    answer: d.answer,
    answerSource: d.answerSource,
    answerAsOf: d.answerAsOf,
    generatedAt: meta.generatedAt,
    scannedRef: cv.scannedRef,
    repo: d.repo,
    routedVia: d.routedVia,
    warnings: meta.warnings
  };
}'''
body = json.dumps({
  "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": {"name": "execute", "arguments": {"code": code}}
}).encode()
req = urllib.request.Request(
  "http://localhost:8787/mcp", data=body,
  headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream"},
  method="POST")
print(urllib.request.urlopen(req, timeout=90).read().decode())
PY
```

Direct Scout:

```sh
curl -sS -G https://stellarlight.xyz/api/repos/explain \
  --data-urlencode "q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?" \
  --data-urlencode "repo=stellar/stellar-horizon"
```

Issue and comments:

```sh
gh api repos/Stellar-Light/stellarlight/issues/1134 --jq '{state,state_reason,closed_at,closed_by:.closed_by.login,title}'
gh api repos/Stellar-Light/stellarlight/issues/1134 --jq .body
gh api repos/Stellar-Light/stellarlight/issues/1134/comments --jq '.[] | {user:.user.login, html_url, created_at}'
```

## Safe resolver inputs

Do not run this until every bar above is green. Dry-run only, after status is `fixed-upstream`, the finding is committed, the comment is posted, and queue refs are rewritten.

```sh
npm run improvements:resolve -- \
  --file improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md \
  --resolved 2026-09-01 \
  --live-recheck "2026-09-01 POST http://localhost:8787/mcp execute scout.explainRepo repo=stellar/stellar-horizon q='Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?' → MaxSupportedProtocolVersion = 28, answerSource=knowledge-note, answerAsOf=2026-09-01T00:00:00Z, generatedAt=2026-09-01T18:30:08.507Z, scannedRef=82660510ecda7fd365a14d08badb9d85fa22bc32; source at that ref defines MaxSupportedProtocolVersion uint32 = 28" \
  --review-evidence "Independent Grok 4.6 deletion review 2026-09-01: .agents/rounds/2026-09-01-free-improvements-maintenance/grok-sls080-review.md; live Raven execute plus source read at scannedRef; did not use the Terra report" \
  --repo Stellar-Light/stellarlight \
  --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1134 \
  --resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1136 \
  --resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1163 \
  --resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1168 \
  --resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1174 \
  --references-reviewed \
  --upstream-commented \
  --dry-run
```

Unsafe now:

- Omit `--dry-run`.
- Pass `--upstream-commented` with no Raven comment.
- Pass `--upstream-comment-na`.
- Resolve while status is `reported-upstream`.
- Resolve while the finding is uncommitted. `git log -1` today is `35b5a385df6150309bcdb618185b29f232f16aee`. That blob is not the working tree.

PR 1173 is matcher hardening, not a resolving ref for this finding. Keep it out unless the author cites it as required.

## Risks

- Scout caches explain answers. Repeat the Raven execute before any later resolve. Do not copy this stamp blindly.
- Knowledge notes are curated. A later protocol bump can stale the note while source at a new `scannedRef` moves. The match rule is not a permanent literal `28`.
- Resolver snapshot pins the last git commit of the finding. Uncommitted evidence would be dropped from the receipt.
- Recovery still needs a recurrence home after deletion.

## Blockers

1. Status is not `fixed-upstream`. The resolver exits 2.
2. No Raven resolution comment. `--upstream-commented` is not honest.
3. This review must not post that comment.
4. Evidence prose still says issue #1134 is OPEN.
5. Finding and index are dirty and uncommitted.
6. `.agents/TODO.md` still stores monitor recurrences in the active finding.
7. Adjacent `isDeployableContract` false positive is out of scope. Do not fold it into this id.

## Author next steps

This review does not perform them.

1. Move status to `fixed-upstream` with the live fields above.
2. Fix the OPEN prose in the Evidence section.
3. Rewrite the recovery recurrence home in `TODO.md`.
4. Commit the finding. Then post the resolution comment. Read the comment back.
5. Ask a distinct reviewer to confirm the comment URL and the committed blob.
6. Dry-run the resolver. Then resolve.

Until those steps finish, keep `sls-080` in the active queue.
