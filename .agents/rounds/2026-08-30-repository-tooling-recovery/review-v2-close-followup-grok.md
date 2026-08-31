# Independent review: repository recovery v2 close follow-up

- Reviewer: Grok 4.6, high effort. Independent of the Terra author, the Sol orchestrator, the Fable planner, and the answering model.
- Date: 2026-08-31
- Mode: audit only. No repository file changed. No paid eval, deploy, push, or merge ran.
- Spec: prior Grok close review of `b659233` (`/tmp/repo-recovery-v2-close-grok.md`), findings B1 and B2, plus the local-only results rule.
- Scope: commits `88c53fab9748a5f199b9878bee3be29e9ac02895` and `3294b7505e96f1d604e3061b709b09a1b2382656` only.
- Parent of this pair is `b659233c0ff3bcc106342d7774648185161399bc`.
- HEAD is `3294b7505e96f1d604e3061b709b09a1b2382656`.

## Summary

The two follow-up commits close B1 and B2. The fifth-collection cost is `$4.5646914`. The prompt hash and collection window are present. The four result files are untracked, local, ignored, and hash-stable. `scripts/scan-secrets.mjs` matches its pre-`b659233` content. The tracked review keeps every finding and the `CHANGES-REQUESTED` verdict. It changes only two public documentation seed lines. The recorded original and redacted hashes are exact. The secret scan passes with no scanner exception. These commits do not change product, measurement, findings, the work queue, or the generated index.

## Verdict

PASS

## Checklist

| Question | Result |
| --- | --- |
| Ledger cost is `$4.5646914` | PASS |
| Prompt SHA-256 is present | PASS |
| Collection window is present | PASS |
| Four result artifacts are untracked | PASS. `git ls-files eval/repo-recovery/results` is empty |
| Four artifacts remain local with exact hashes | PASS. Hashes match the ledger and `b659233` blobs |
| Local-only contract holds | PASS. `.gitignore`, `eval/EVALS.md`, and the recovery README are unchanged |
| `scripts/scan-secrets.mjs` matches pre-`b659233` | PASS. Blob `8371d577956f474464326d6bc463b7184c5c079f` equals `8195f2c` |
| Tracked review preserves findings and verdict | PASS. Only two seed lines change |
| Original review SHA-256 | PASS. `89230001f951e0004bca392a043db2782588398f68a201a0be5a705b8fbee716` |
| Redacted review SHA-256 | PASS. `72ec1ca150b328ecb904465b7bb32cdd567f4325f664583b6624f0bead9bddd8` |
| Secret scan with no exception | PASS. `secret-scan: clean (+ gitleaks)` |
| No unrequested product or measurement change | PASS |
| No unrequested finding, queue, or index change | PASS |
| Worktree clean except ignored local artifacts | PASS. `git status --porcelain=v1` is empty |

## Spec

### B1. Ledger spend, prompt hash, and collection window

`88c53fa` changes one cost line in the fifth-collection section:

```
-It cost `$0.5646914`.
+It cost `$4.5646914`.
```

The same commit adds:

```
- Prompt SHA-256: `3f29c317b416ce00b7cc16f8cb15465053b46d37ae29e46841a5642f6ecfc5d6`.
- Collection window: `2026-08-31T00:44:40.313Z` through `2026-08-31T00:56:44.235Z`.
```

HEAD still has those three facts. The ledger has no remaining `$0.5646914`. The reconciliation paragraph restates `$4.5646914`. Those values match the original close review evidence.

### B2. Local-only result artifacts

`88c53fa` deletes the four tracked result files from the index. The working copies remain.

| Artifact | File SHA-256 | Status |
| --- | --- | --- |
| Collection | `4f4ee34353b236dd6d00ec896fa7888b5c19702a76a0809a67a9f35246e68bb8` | ignored local file |
| Review packet | `08a41ee2cad8822043b5263bfbcc8f28378e0fd85dc1499dd0710e56aefd1c33` | ignored local file |
| Annotations | `08691d62a8f501d57684866d56e00d801474799754544308df2684e3bf24a207` | ignored local file |
| Reviewed result | `e53a83952e5701ef49a33c955e59ebfa002413b542937c22c49a166f8e0a7ac0` | ignored local file |

These hashes match the fifth-collection ledger table. They also match the `b659233` blobs. The untrack did not change bytes.

`.gitignore` still lists `eval/repo-recovery/results/`. `eval/EVALS.md` still says results are local-only evidence. `eval/repo-recovery/README.md` still says result JSON stays local and the ledger holds SHA-256. Those three files are not in this pair of commits.

`git status --porcelain=v1 --ignored` marks the four fifth-collection files `!!`. That is the ignored-local contract.

### Scanner restoration

`git diff 8195f2c HEAD -- scripts/scan-secrets.mjs` is empty. `cmp` against `8195f2c:scripts/scan-secrets.mjs` is identical. HEAD, `88c53fa`, and `3294b75` share blob `8371d577956f474464326d6bc463b7184c5c079f`. `b659233` had blob `4cf29efae0994f9aabb7d6d8b8feabc91ed7d8c7`. `88c53fa` restores the parent file.

HEAD has no `KNOWN_PUBLIC_STELLAR_SEED_SHA256` set and no `isKnownPublicStellarSeed` helper. The scanner has no seed-hash exception.

### Tracked review fidelity

`88c53fa` adds `.agents/rounds/2026-08-30-repository-tooling-recovery/review-v2-close-grok.md`. That blob is byte-identical to `/tmp/repo-recovery-v2-close-grok.md`. SHA-256 is `89230001f951e0004bca392a043db2782588398f68a201a0be5a705b8fbee716`.

`3294b75` changes only these two lines:

```
-`[public documentation seed]` → `fde46e3daefdfb6d9fad0e8176385d591cd2ef5c38771fc686c2ae27b37cb075`
-`[public documentation seed]` → `39926133bc993acf01d3a9753080623c3578ae0d4ecae484902f27d87cba1bde`
+`[public documentation seed redacted]` → `fde46e3daefdfb6d9fad0e8176385d591cd2ef5c38771fc686c2ae27b37cb075`
+`[public documentation seed redacted]` → `39926133bc993acf01d3a9753080623c3578ae0d4ecae484902f27d87cba1bde`
```

`diff -u` of the original report against HEAD shows only that hunk. Line count stays 222. Summary, B1, B2, checklist, verdict, hashes, grade, and the footer `CHANGES-REQUESTED` are unchanged.

The ledger records those hashes. Independent `shasum -a 256` confirms both values.

The ledger states the tracked review is complete except for those two redactions. That statement is true.

### Secret scan

`npm run secrets:scan -- --tree` exited 0. Report: `secret-scan: clean (+ gitleaks) — scanned all tracked files.` `--tree` scans tracked files. The four local result files are not tracked, so they do not enter that scan. The tracked review no longer contains secret-shaped seed literals. No scanner allowlist was added.

### Scope of the follow-ups

`git diff --name-status b659233..HEAD`:

```
M .agents/rounds/2026-08-30-repository-tooling-recovery.md
A .agents/rounds/2026-08-30-repository-tooling-recovery/review-v2-close-grok.md
D eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-annotations.json
D eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-collection.json
D eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-review-packet.json
D eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-reviewed.json
M scripts/scan-secrets.mjs
```

Empty against `src/`, `cases.json`, `contract.mjs`, `improvements/INDEX.md`, `sls-080`, `sls-081`, `.agents/TODO.md`, `.agents/NEXT.md`, catalog, and eval corpora. The pair is record repair plus scanner restore plus untrack. `git diff --check b659233..HEAD` is clean.

### Worktree

`git status --porcelain=v1` is empty. Ignored local artifacts remain under `eval/repo-recovery/results/` and the usual ignored build and env paths. No untracked tracked-path leak exists.

## Verification run in this review

| Command | Result |
| --- | --- |
| `git log --oneline b659233^..HEAD` | `b659233`, `88c53fa`, `3294b75` |
| Ledger cost and identity lines at HEAD | `$4.5646914`, prompt hash, collection window |
| File SHA-256 of four local artifacts | Match ledger and `b659233` |
| `git ls-files eval/repo-recovery/results` | Empty |
| `git rev-parse 8195f2c:scripts/scan-secrets.mjs` vs HEAD | Identical blob |
| `diff` original review vs `88c53fa` review | Empty |
| `diff` original review vs HEAD review | Two redaction lines only |
| `shasum -a 256` original and tracked reviews | Match ledger |
| `npm run secrets:scan -- --tree` | PASS, clean + gitleaks |
| `git diff --name-only` against product and queue paths | Empty |
| `git status --porcelain=v1` | Empty |
| `git diff --check b659233..HEAD` | Clean |

I did not re-run grade, typecheck, build, or a paid collection. Artifact bytes are unchanged, so the stored 9/12 FAIL is unchanged.

## Non-blocking notes

1. Commit `88c53fa` still stores the two public documentation seeds in git history. HEAD redacts them. `--tree` scans HEAD, not that parent blob. History rewrite was not requested.
2. The preserved review still describes `b659233` as HEAD. That is correct provenance for the original close review.

## Exclusions

- No paid collection, no deploy, no push, no merge, no upstream filing.
- No repository file was written in this review.

PASS
