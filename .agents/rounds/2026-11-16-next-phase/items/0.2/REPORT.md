# Item 0.2 report: absorb drift #223

Lead: Claude Opus 5.5, agentpc `t1qp`.

## Pull request and result

[#452](https://github.com/stellar-experimental/stellar-raven/pull/452), branch
`np/0.2-absorb-drift-223`. It has two commits: the absorb (`d6c1df7b`) and the round-ledger row
(`5c451371`). I ran every gate bare in the worktree and each exited 0. CI was pending when this
report was written.

- **Absorbed:**
  - Scout 1.9.135 to 1.9.150: one routing-text change (`analyzeEcosystem`) and schema changes.
  - Docs inventory 979 to 982 pages, and anchors (18 pages changed, 8 removed).
  - Skill re-pins of `stellar-dev`, `stellar-light` and `openzeppelin-stellar`, and the
    `cavos-stellar` directory entry.
- **Routing:** all 544 rows keep their grades and every accepted total is unchanged.
  `eval/gates.json` changes only the fingerprint, `localTrace` and `notes`.
- **Decision 3, Docs titles:** the free A/B fails the rule. Three rows lose a grade (2 legacy, 1 in
  the holdout lane), none of them the known row, and no row gains one. The hold stays, and the
  off-golden sets were not needed.
- **Scout exposure trigger:** the `GET /api/quality` candidate gives +1 legacy, -1 extended and
  -1 protocol-history. It stays excluded.
- **Standing duties:**
  - The Horizon ceiling reading answers 30, which equals the source at Scout's `scannedRef`.
    It passes.
  - `eval:protocol-history` stops with `source-expired`, as expected.
- **Reviews:**
  - Claude Fable 5.2 (high) reviewed the plan: 10 findings, all adopted.
  - Codex frontier, GPT-6 Astra (high), did the required review: PASS, zero findings, every
    skill source PASS.
- **Spend:** USD 0.

## Deploy

Needed after merge, because the catalog, spec, anchors and skill pins change the Worker bytes.
Follow `live-drift-resolution` step 8: `npm run build`, then `npm run deploy`. Then check that the
landing page returns 200 and that unauthenticated `/mcp` returns 401 with `WWW-Authenticate: Bearer`.

## For the orchestrator on the Mac

1. Merge #452 when CI is green, then deploy.
2. Post this comment on #223 with the deploy Version ID. **Do not close the issue**: the titles
   hold and the routing repair still stand.

   > 2026-11-16 drift absorbed in #452 (deploy `<version id>`).
   >
   > - Scout 1.9.150: routing text on `analyzeEcosystem` plus schema changes. No surface or
   >   exposure change.
   > - Stellar Docs: inventory 982 pages, and anchors updated.
   > - Skill re-pins of `stellar-dev`, `stellar-light` and `openzeppelin-stellar`, plus the
   >   `cavos-stellar` directory entry. Codex frontier security review passed.
   > - All 544 routing rows keep their grades; only the fingerprint is re-stamped.
   > - Fresh Docs titles (982) were A/B-tested under owner decision 3. They lose 3 graded rows
   >   with no gain, so the hold stays and this issue stays open for it and the routing repair.
   > - The `GET /api/quality` schema change fired the Scout exposure trigger. The candidate run
   >   was 1 gain and 2 losses, so it stays excluded.
   >
   > Records: `.agents/rounds/2026-11-16-next-phase/items/0.2/`.

   The daily drift CI will keep reporting the held titles file until that hold ends.
3. Inputs for item 0.4, which owns the TODO edits:
   - Titles hold bullet: fresh titles now cost two legacy rows, `q-edge-exhaustive-defi-deep-report`
     (top5) and `q-infra-hubble-vs-rpc-layer` (top1), plus one holdout-lane row by count. The
     `q-tool-wallets-kit` row named there no longer moves.
   - "Re-evaluate Scout exposure": the 2026-11-16 drift fired the trigger. The candidate result is
     in `SCOUT-EXPOSURE.md`, and quality stays excluded.
   - "Monitor the Horizon protocol-ceiling note": the 2026-11-16 reading passed (EXEC.md step 10).
4. Inputs for items 1.1 and 1.3:
   - `sd-081` cites the removed `-js` Docs pages. Run a recurrence probe at the unsuffixed paths
     (item 1.1).
   - QA cases mention Freighter, which Docs now titles "Varial" (`q-tool-freighter-wallet`,
     `q-tool-wallets-comparison`, and entries in `eval/qa/cases.json`), and the new Scout
     SDK-status fields. A golden-truth look is needed; no case was opened here.

## Open questions for the owner

None. Decision 3 settled the titles question by its own rule.

## Housekeeping

- Children `0.2-review` (`t1qq`), `0.2-exec` (`t1qr`) and `0.2-codex` (`t1qs`) were killed and
  removed.
- The worktree `/home/tyler/code/raven-wt/np-0.2` stays until merge. Its `tmp/` holds the raw runs
  and the skill body diff, and is ignored.
