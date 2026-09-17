# PR #170 final delta — independent review (plus dependency Wrangler-slot validation)

- Reviewer: Fable high. Read-only. No edits, paid calls, or Wrangler.
- Worktree `repo/` at `c6968e74` with the final uncommitted delta; dependency worktree `dependencies/` at the same base.

## 1. Runtime revert — PASS

- `src/catalog/search.ts` and `ARCHITECTURE.md` are byte-identical to `848edec4` (`git diff --quiet 848edec4 -- <file>`). `catalog/` unchanged.
- `test/drift-141-routing.test.ts` vs 848edec4 now contains only the retained RWA changes: collection-time catalog load, `exposesRwa` gating, and the third original control query. The synthetic placement `describe` block is gone and the four-query Soroswap directory block is restored verbatim.
- Retained tests on the reverted runtime: `drift-141-routing`, `eval-discovery-cases`, `improvements-lint` → 3 files, 64 passed, 4 skipped (RWA controls skip on the excluded surface).

## 2. sls-085 and pipeline — PASS with one carry-over

- `improvements/stellar-light-scout/sls-085-soroswap-contract-role.md` present; consumer-impact line now pins the gitignored artifact by sha256 `7ee79dd9…`; raw evidence `research/audits/2026-09-17-routing-audit/soroswap-contract-role.md` exists (6,862 bytes). Both filing blockers from `sls-085-review.md` are cleared. `node scripts/improvements-lint.mjs` → ok (60 findings), INDEX regenerated.
- ll-013: new evidence line links https://github.com/lumenloop/lumenloop-backend/issues/26#issuecomment-5707452339. Read back: author `kalepail`, created 2026-09-17T02:18:49Z, body states the awarded-vs-paid mismatch with the public payload. The evidence line correctly attributes it as the coordinator's own comment, not maintainer validation. It qualifies as "materially new evidence" under the quiet-issue rule.
- Carry-over (Low): sk-022 and sk-025 still cite `2026-09-17T01-33-03-variantA.json` (gitignored) without a sha256; add `ef988d64c2070f98196f2981d7028d66158492a85745be558c1c4e0bbf08afa0`.

## 3. M0-C1 overlay — independently supported

- Artifact `eval/qa/results/2026-09-17T03-28-28-rejudge.json`: sha256 `8c69ce56111a803fc0d5747130d4ad68d5f35cd8b3c23b58906f5fc46623a85a`, 36,185 bytes; source M1-C1 sha256 `9f5fdab8…`; `casesMode: revision`, identity matches (`94ac7f19…` both sides), `nonIdentical: false`; tuple matches; panel 3; 9 judge calls; summed cost $0.5692046 (matches `paid-receipts.json`).
- Provenance: recomputed `judgeInputSha256` from the committed goldens + M1-C1 answers matches all three recorded input hashes (`eb7eb574…`, `fb2a072b…`, `732ffdd4…`).
- Verdicts against the committed goldens:
  - Aquarius **wrong** (3/3): answer says "AQUA is locked into 'ICE' to gain on-chain DAO governance voting power. The community uses these votes to decide which markets … receive AQUA reward emissions" — collapses governICE and upvoteICE; avoid 1 fires. Supported.
  - Soroswap **wrong** (3/3): answer describes the aggregator routing "across multiple on-chain liquidity sources — …, and the classic Stellar DEX (SDEX order book)" and names `CAG5LRYQ…` as the "aggregator router contract" (it is the AMM router; the golden's dated aggregator is `CAYP3UWL…`, cs-002/sls-085). Wrong claim plus avoid 2. Supported. (The M1-B1 baseline made the same address slip, so it was never a loss candidate.)
  - LOBSTR **correct** (3/3): "SCF-funded across three rounds (Round 2, 17, 22), totaling $232,000 in disclosed SDF Community Fund awards (as of 2026-08-12). Source: communityfund.stellar.org/project/lobstr-gcn" — source, date, and awarded basis named; all four key facts present; no avoid fires. Supported. This is the symmetric contrast to the M0-B1 dissent: B1's answer left the basis unnamed and glossed a paid total as a round-award total; C1's answer does not.
- Receipts: `paid-receipts.json` cap $250, spent $24.7944578 across eight methods; M0/M1 cost accounting complete.

## 4. Evidence copies under research/audits — one reconciliation item

- `m0-b1-independent-review.md` copy is identical to the /tmp original.
- `m1-c1-passkeys-loss-review.md` copy is the **pre-correction** version: it still says "five rows" for the baseline and lacks the "Correction and evidence note" (baseline lists four recordings; stored execute `result` bodies exist). Re-copy from `/tmp/raven-routing-audit-2026-09-17/m1-c1-passkeys-loss-review.md`.
- `paid-comparison-review-criteria.md` copy adds a "Post-collection evidence clarification" (stored `result` bodies) — consistent with my correction; keep.
- `d3-stop-decision.json` records "reject D3", the loss reason without causal claim, the stopped methods, and "No unrun method counts as a pass." Consistent with the criteria.

## 5. Still owed by root (ledger/TODO/NEXT/PR body — in progress)

- Ledger line 3 status, line 114 ("Runtime routing remains unchanged from D3"), line 116 (pilot ranking note → historical), M1-C1/M0 outcomes with hashes, spend $24.79.
- PR #170 body: "The candidate removes that rule…" → evaluated and reverted after one verified answer regression; validation numbers post-revert; keep "does not resolve RWA exposure".

## 6. Dependency change — Wrangler-slot validation delta — PASS

Bounded to the approved held-Transformers scope: worktree shows only `.agents/TODO.md`, `eval/vectorize/build-clause-artifact.mjs` (one line), `package.json`, `package-lock.json`, and the untracked `research/audits/2026-09-17-dependency-audit/`. No new code.

Logs under `code/deferred/` verified against `dependency-wrangler-checks.md` and the README Validation section (README sha256 `ab16a58856d9de1ff9782c6bb1d4cd982b5ed8d40fd1c5a875aa9ce9f9672259`):

| Check | Log evidence |
|---|---|
| Typegen | `typegen.log` ends with wrangler's rerun reminder; `env-d-ts.diff` shows only the `.dev.vars` name set/order (`MCP_ADMIN_TOKEN` absent from the CI list) and the header hash |
| Typecheck | `typecheck.log` is empty (tsc prints nothing on success); the exit code is asserted in the checks doc, not captured in the log |
| Build | `build.log`: wrangler 4.133.0, "Total Upload: 7143.89 KiB / gzip: 1414.01 KiB" |
| Hono absence | `hono-bundle-check.txt`: 1,120 sourcemap sources, 0 hono/@hono; 16 `@modelcontextprotocol/sdk` modules; 0 `@hono/` or `hono/` specifiers; 0 Node `streamableHttp` marker. This closes the runtime-exposure claim with bundler output. |
| Smoke | `smoke.log`: 5 files, 94 tests passed |
| Dev bind | `dev.log`: "Ready on http://localhost:8793", `GET /` 200, unauthenticated `POST /mcp` 401 (`accessMode: oauth-rejected`), `/health/skills` 503 (fresh KV, documented) |
| Secrets | `secrets.log`: gitleaks no leaks; scan clean |

Nit: record the typecheck exit code in the log next time (`; echo exit=$?`), since an empty log alone cannot distinguish success from a silent early exit. Not run (documented): usage builds and eval gates; run before merge if CI parity is required.
