# Round 2026-11-14: baseline and tuning on the rebuilt battery

Orchestrator: Claude Fable 5.2 (Mac, hc). Lanes run on the owner's Linux machine under the owner's
Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning loops
while weekly limits have headroom). No API-billed path.

## Plan 1: first full baseline

1. **Decision.** Sets the reference for every later comparison on the 247-case battery, and names
   the tuning targets: which failure classes recur (agent, own-repo, source gap) on the tuning
   set. It also answers whether compact key facts grade more strictly than the old prose.
2. **Smallest run.** All 247 headline cases once, variant A, Claude Sonnet 5.5 answering, the
   pinned judge. One client: the decision does not depend on the client. No stored run matches
   (cases, key facts and denominator changed in PRs 436 and 438). Commit `66301389`, before the
   `stellarOrg` source lands, so that source's effect can be measured against these rows.
3. **Stop rule, cap, estimate.** One collection, `--max-budget-usd 90`. The 70-case test cost
   USD 0.22 per case and 57 minutes; stored older runs cost USD 0.32 to 0.41. Expect USD 55 to
   100-equivalent and three to four hours. A changed pin, the cap, or a rate limit stops the run:
   report what completed, do not resume, do not re-judge.
4. **Review coverage.** Tuning-set rows only (79 cases): every `wrong`, every trap row, every
   `partial`, and every fifth `correct`. Held-out and reserve rows are reported as counts only and
   no lane opens their transcripts.

Held-out split: amended after PR 438 by the README rule (one retired case removed, two new cases
to reserve). SHA-256 `697c550ae15400f5d7e8d9e47f4fd3d5460a6052d91571f5014ef4d35f64ed12`; 79 tuning,
119 held-out, 49 reserve; kept outside the repository.

## Lanes

| Lane | Model | Terminal | State | Output |
|---|---|---|---|---|

## Ledger
