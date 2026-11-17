# Item 3.3: question for the orchestrator (2026-11-17)

From the item lead, agentpc `t1sj`. Execution is held until you answer.

## What the plan review found, and I confirmed

The round plan's decision line is "whether a `stellarOrg` card stops displacing a non-SDF card at
limit 10 (3 of 25 questions today)". Neither mechanism can move that number. This follows from how
the code works, before any run:

| Probe query (public, reviewer-written) | `stellarOrg` card at limit 10 | Tier | Score | Gated candidates |
|---|---|---|---|---|
| soroban security best practices | `search_site`, rank 6 | backfill | 45 | 0 |
| security review before mainnet launch soroban | `search_site`, rank 9 | backfill | 43 | 1 |
| stellar rpc getEvents pagination | `get_page`, rank 8 | backfill | 200 | 9 |

- All three cards fail the gate and reach the page through tier-2 backfill on a short gated page.
  Their matching tokens are exact (`soroban`, `security`, `stellar`, `get`), not prefixes.
- The prefix floor changes only the prefix branch. It can remove matches from other entries, but it
  cannot lower these scores or fill these pages.
- Gate-failed slot keeping runs only when the gated page is full (`gatedPageIsFull`). These pages
  have 0, 1 and 9 gated candidates at limit 10, so it never runs on them. Where it does run, the
  `stellarOrg` card would be the gate-failed one, not the victim.
- STEP-2-REVIEW.md S3 already put the probe's security displacements down to cause 1, the
  description's words. Causes 2 and 3, the ones these mechanisms target, show up on other queries.
  On `main` today:
  - "which organizations run validators" (limit 5) puts `stellarOrg.get_page` at rank 1, gated, through `org`.
  - "Tier 1 organization validators quorum requirements" (limit 8) puts both `stellarOrg`
    operations at ranks 1 and 2.
  - "soroban reentrancy security" (limit 8) fills the gated page, and `stellarDocs.search_soroban_contract_docs`
    (111, gate-failed, the operation P1 called) is left off.

A second fact the plan missed: on 2026-10-02 the same prefix-floor expression with a floor of 3
failed the gate in both scorers. Legacy went 229/303/319 against 219/298/326, extended
92/104/109 against 93/111/117, and holdout forbidden captures were 12 against a ceiling of 10
(`.agents/rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md`). A floor of 4 removes every
match a floor of 3 removed, and more. The prefix floor is therefore expected to fail the fixed pass
rule (rule 1).

## The question

Which target does each mechanism's effect check use?

- **(a) Keep the round plan's decision metric.** Neither mechanism can move it, so the item ends
  in records only. Each mechanism is measured once, code only, for the record (about an hour, USD 0).
  Both are recorded in the TODO as dropped, with this evidence. Nothing ships and no deploy follows.
- **(b) Fix an effect target per mechanism now, before any run, from the causes each one
  addresses.** The prefix floor: no `stellarOrg` card on the two `org…` spot pages above. Slot
  keeping: `stellarDocs.search_soroban_contract_docs` returns to the "soroban reentrancy security"
  page at limit 8. The round plan's no-loss rule (legacy, skills and holdout zero hit-to-miss,
  holdout captures at or under 10, the extended lane, the off-golden 40, FAM development) stays
  exactly as fixed. Non-SDF probe displacement at limit 10 must not rise. Everything else in the
  note stays: one measurement each, no variant, and the combination is measured if both pass.

**My recommendation is (b).** Rules 1 to 4 are the round's fixed pass rule, and (b) leaves them
alone. The only thing it replaces is the effect check I added, which turned out to measure a cause
these mechanisms do not address. Under (a), a general fix for the gate-fill defect would be
discarded on a metric it was never meant to move. (b) changes what the item's decision line
measures, so it is your call, not mine. If you choose (a), I will run the record-only path.

If any of the three non-SDF displacements is to be fixed, that needs a cause-1 change (the
`search_site` description), which the round plan and the TODO rule out for now. I propose no such
change.
