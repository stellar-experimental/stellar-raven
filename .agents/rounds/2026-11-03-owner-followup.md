# Owner follow-up round 2026-11-03

Coordinator: hc terminal t16 (Claude Opus 5.5). This ledger records the owner's answers to the
2026-11-02 waiting list, the lanes, the order of work, and each verdict.

## Owner decisions (2026-11-03)

- **A** (paired measurement): read the overnight round's closeout first. If it answers A, retire A
  and delete the launch tooling. Otherwise find "an accurate but relatively quick and inexpensive
  solution".
- **B** (model call on the search path): explore query embeddings and models "like Jev, Clef,
  Particle-1 as well as other models" before landing anywhere. More evals and improvements are
  fine "as long as it's fast, actually improves things and doesn't cost too much per query".
  Parallel calls may hide latency.
- **D** (Scout hold, #223): revisit once B is decided.
- **#294** (Jev ranking PR): evaluate in light of B. Merge if the value is clear and worth it;
  otherwise close with a kind comment. Use multi-model planning, tests, and evals.
- **#167** (RWA exclusion): wait for B, then proceed under that choice.
- **Pin bump** (`stellar-dev` skill): wait for the other session's QA agents to finish. Then do
  the work with tests and evals, and ship with conviction.
- **Own-repo items** (sd-059, demo provider, golden URLs, HackMeridian goldens, routing): do the
  clear work through Sol agents; fix and merge where conviction stays clear.
- **Upstream**: do clear work in fresh-context Sol or Opus agents, coordinated with other work.

## Holds

- The other session's QA follow-up (`codex/golden-followup-2026-11-03`, hc t54 and its lanes)
  edits golden cases, the consistency register tooling, and upstream patches for sd-087, sd-088,
  and sk-037. It authorizes no push, filing, or deployment. Until it finishes and merges, this
  round does not edit golden cases or the register, does not deploy, and does not file those
  findings.
- Golden URL repair, HackMeridian golden proposals, and the skill pin bump start after that
  session finishes.

## Lanes (wave 1)

| Lane | hc | Model | Worktree / scope | Output |
|---|---|---|---|---|
| b-research | t12g | Grok 4.7 xhigh | research only | ranking-model survey |
| b-design | t12h | Claude Opus 5.5 high | `rv-b`, round folder only | contract, candidates, harness, runtime design |
| a-analysis | t12j | Claude Opus 5.5 high | read-only | decision A recommendation |
| demo | t12k | Codex gpt-6.1-sol high | `rv-demo` | `agents` 0.32.0 + `createAI` migration |
| sd059 | t12m | Codex gpt-6.1-sol high | `rv-sd059`, `tmp/` only | raw Discovery vs. adapter comparison |
| up-sweep | t12n | Claude Opus 5.5 high | `rv-up` | upstream state table, sd-048 patch package |

## Planned order

1. Wave 1 (above).
2. B contract: assumption attack by Gemini 4 Argon (OpenCode) before any candidate runs; the
   coordinator signs the contract and the spend cap.
3. B measurement: Sol lanes build the harness and measure candidate families on both sources.
   Kimi K3.1 Pro and Grok challenge the results; an independent reviewer from another family
   checks the winner.
4. B ship (if a candidate passes): implementation, `AGENTS.md` rule change, PR, review, merge.
   Then #294, #167, and D follow from that result.
5. After the other session finishes: skill pin bump, golden URL repair, HackMeridian goldens,
   deploy.

## Working evidence and decisions

(appended as lanes report)

### Decision A (2026-11-03): retire

Lane a-analysis (Claude Opus 5.5 high, read-only) found that the overnight round does not answer
A: it has one arm, one revision, a different runner and model family, and no aggregate. A cannot
get an accurate answer at any price now. The baseline `90d0ba75` reads the retired Algolia docs
index (48% of the sample), the identity guard no longer covers that source, and the frozen tuple
(pack `p6`) is stale. No ship decision waits on A, and forward-only rules out the rollback that a
`FAIL` could support. Spend so far without a result: $336. Under the owner's rule ("accurate but
relatively quick and inexpensive ... where/if/as possible"), the coordinator retires A. Lane
retire-a (hc t12v, Codex gpt-6.1-sol high, worktree `rv-a`) deletes the launch tooling and edits
the TODO, run sheet, and run-evals skill. A per-change scoped paired check replaces it for future
model-facing changes (report section 3).

### sd-059 raw probe

The coordinator ran `tmp/sd059/raw-probe.mjs` host-side (key loaded from `.dev.vars`, never
printed). All seven queries returned HTTP 200 with 50 candidates. The saved files hold no
credential (two matches are documentation code samples).

### Demo provider migration

Lane demo found two upstream API gaps in `agents` 0.32.0 `createAI`: catalog streams ignore
`resume:false`, and Claude string calls drop adaptive thinking and `xhigh` effort (native Claude
objects keep them but switch to passthrough billing). The lane restored the package files and
keeps `workers-ai-provider` until an option is chosen.

## Decision A retirement — 2026-11-03

The owner delegated retirement of decision A on 2026-11-03.
The August-to-September paired measurement closes without a result.
The retired Algolia baseline cannot support the planned comparison against Mintlify.
The 2026-11-02 diagnostic did not answer decision A.

The change removes eight launch files and two tests listed in
[the retired run sheet](2026-10-01-backlog-closeout/paired-run-sheet.md).
It removes decision A, its priority, its promotion item, and its prompt-change sequencing restriction from `.agents/TODO.md`.
The `run-evals` skill records the retirement.
The dated records, shared test helper, and all `eval/qa/` files stay unchanged.
The coordinator will remove the retired measurement freeze from `merge-and-deploy-as-work-completes`.
This decision authorizes no paid collection.

Validation: install, type generation, type checking, tests, build, and the tree secret scan all exited 0.
The tests passed 144 files and 3019 tests, with three expected failures.
