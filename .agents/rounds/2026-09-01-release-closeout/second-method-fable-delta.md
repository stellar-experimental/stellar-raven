# Bounded delta re-review: corrections C1, C2, A1, A2

- Reviewer: Claude Fable 5.1, high effort
- Author and orchestrator under review: Codex GPT-5.6 Sol
- Ledger: `.agents/rounds/2026-09-01-release-closeout.md` (modified, uncommitted; last commit `003ae4e`)
- Prior review: `/tmp/release-eval-fable-retry.md`, copied byte-identical to
  `.agents/rounds/2026-09-01-release-closeout/second-method-fable.md`
- Scope: only the lines the revision changed, checked against C1, C2, A1, and A2
- Mode: read-only. No repository file was edited. No paid call ran.

## Reconciliation table

| # | Required correction | Revised ledger text | Status |
| --- | --- | --- | --- |
| C1 | Say the killed CLI reported no cost, that real unrecorded provider spend occurred, that it counts against neither cap, and that the true lane total is two caps plus that unknown amount | "The killed CLI process reported no cost, so cost completeness failed." "Unrecorded provider spend occurred across three assistant turns." "27,713 cache-creation tokens and 80,092 cache-read tokens." "six output tokens." "That unknown amount does not enter the first `$1.50` ledger total." "The two method caps total `$3.00`." "The true lane spend also includes the unknown first-method provider amount." | Reconciled |
| C2 | Name the novelty and the provider-versus-CLI ambiguity; keep monitor-only | "T5 records one answering-side timeout." "The harness cannot distinguish a provider stream stall from a Claude CLI stall." "This is the first timeout class across 2,207 stored answering rows." "One answering-side timeout remains diagnostic and monitor-only." | Reconciled |
| A1 | Qualify the top-level one-run and no-rerun sentences as first-method terms and point to the second section | Authorization: "This first authorization limits the first method to one run and `$1.50` total cost." "The first authorization permits no rerun." "The separate second authorization appears below." Stop rules: "Stop after the first authorized run." "Do not launch a repair rerun under the first authorization." "The separate second authorization appears below." | Reconciled |
| A2 | Name where and when the owner authorized continued paid work | "The owner wrote “all spend is fine” on 2026-09-01." "The current release request also asks for appropriate eval work." | Reconciled as a receipt line; see note |

## Verification notes

**C1 numbers.** The token figures match the artifact's per-turn usage exactly: 27,713
cache-creation input tokens, 80,092 cache-read input tokens, 6 output tokens over three assistant
turns. The `$3.00` figure is the sum of the two `$1.50` caps. The ledger now separates the
counted caps from the uncounted first-method spend, which is what the skill's "define counted
costs" rule needs.

**C2 count.** The count of 2,207 stored answering rows with zero prior `timeout` rows matches my
scan of the main checkout's `variantA` results. "Answering-side" replaces "answering-provider"
throughout the section, including the monitor-only sentence.

**A1 consistency.** No sentence in the ledger now says the brief as a whole authorizes one run.
Both the Authorization and Stop rules sections scope their limits to the first method and cross-
reference the second section. The second section still says "permits no third method run" and
"Do not launch a third method under any current authorization." The document is internally
consistent.

**A2 receipt.** The owner quote and date are recorded. The quote appears nowhere else in the
repository, so I cannot verify it from files. That is expected for an owner instruction given in
conversation. The line satisfies the requirement to state where and when. The owner can confirm
or deny it at the final Opus gate.

**Recommended items from the prior review.** The revision also took two of the three
recommendations: "It uses a fresh `run-qa.mjs` collection. It never changes the first artifact
through stored judging or re-judging." and "The server log shows no Raven call in flight after
the completed search." The server-log sentence is author-attested. I did not read the Wrangler
pane, which I do not own. The claim is consistent with the artifact, which records no second tool
call. The third recommendation, naming the second receipt's location, was not taken. It stays a
recommendation. The clean-tree stop rule catches a misplaced receipt before spend.

**Unchanged text.** Every other line in the two sections is byte-identical to the version
reviewed in `/tmp/release-eval-fable-retry.md` and stays outside this delta.

## Remaining before launch

None that block. The ledger, both prior reviews, this delta, and the retry review copy must enter
the one clean commit the ledger already requires. The tree is currently dirty with the modified
ledger and the untracked `second-method-fable.md`, which is the expected pre-commit state.

## Result

PASS
