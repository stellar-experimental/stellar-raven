# ADR-0010: The SCF community-fund skills stay unpinned

Status: accepted, 2026-10-01.

Raven does not pin or expose any of the twelve skills in
[`Stellar-Light/awesome-stellar-community-fund`](https://github.com/Stellar-Light/awesome-stellar-community-fund)
at upstream HEAD `b9a1509fb4230a191ab0055c2beca29303c1a30c` (2026-07-23).
The skills stay in the directory snapshot in `ecosystem-skills/catalog.json` and are not served.

The owner asked for this decision only after independent adversarial review by other models.
Three reviews ran on 2026-10-01, and all three concluded "pin none now":
[Claude Fable 5.1](../../.agents/rounds/2026-10-01-backlog-closeout/scf-review-fable.md),
[Grok 4.7](../../.agents/rounds/2026-10-01-backlog-closeout/scf-review-grok.md), and
[GPT-6-Astra](../../.agents/rounds/2026-10-01-backlog-closeout/scf-review-astra.md).
The earlier body read is
[`scf-skill-bodies-astra.md`](../../.agents/rounds/2026-09-30-raven-next/scf-skill-bodies-astra.md).

## Reasons

- **Routing cost.** All twelve descriptions contain `SCF`, so every SCF query admits them.
  A lexical simulation breached the legacy routing band with every multi-skill set tested.
  New skills took first place on SCF fact questions that an operation must answer.
- **Content defects that Raven cannot repair.** Raven serves pinned bytes. `scf-live-context`
  treats an open RFP row as the current round, which contradicts `scout.getRfps` and the pinned
  Scout body. Bodies link to unpinned root `docs/` files and to pages that return 404. Some bodies
  state award medians that a sibling body in the same commit contradicts.
- **Small marginal answer.** Exposed operations already cover positioning, idea vetting, and pitch
  drafting: `scout.scfPitch`, `scout.vetIdea`, `scout.getRfps`, and `scout.searchResearch`. Two
  exposed skills cover them too: `skills.lumenloop.scf-submission-radar` and
  `skills.stellar-light.stellar-scout`.
- **Dormant upstream.** The SCF round and its dated facts changed after the last upstream commit.

## Reopening

Reopen only for a named subset of applicant-side skills. The reviews do not agree on one shortlist.
Fable names `scf-tranche-reporter`, `scf-prescreen-checker`, and `scf-referral-preparer`.
Astra names `scf-claim-verifier` and `scf-tranche-reporter`. Grok names none.
This decision treats the union of those four skills as the only reopening candidates.
`scf-round-reviewer` and `fetch-external-doc` stay out.

A reopening needs all of the following:

1. Upstream corrects round and submission-window semantics with `meta.scfRound`.
   It replaces broken or relative `docs/` links.
   It aligns caps and rules with the handbook.
2. For `scf-claim-verifier`, upstream also meets Astra's precondition P1.
   Status claims use `statusBasis`, `statusAsOf`, and `statusSourceUrl`.
   Award claims use `scfRoundAwards`, `scfSourceUrl`, and `scfAsOf`.
   The body checks project identity, and it explains unnumbered awards and undisclosed amounts.
   It no longer depends on `scf-live-context`.
3. For `scf-tranche-reporter`, upstream also meets Astra's precondition P2.
   The UX wording agrees with the handbook, and the approved deliverables stay the review basis.
   The body states that a draft does not authorize a submission, payment, or access change.
4. The source gets a new source ID, because `stellar-light` already names
   `Stellar-Light/stellar-scout`. It also gets a pick list.
   `unpinnedUpstream` lists every excluded sibling with a reason.
5. Each selected skill gets a host description override.
   A routing comparison keeps every lane inside its band with no threshold change.
   No new skill takes first place on an SCF fact case.
6. Each selected skill needs a `proposed` QA case.
   Activate it after an independent `golden-truth` review.
   Cover status provenance, unnumbered awards, missing evidence, closed windows, and tranche
   deviations where a skill applies.
   Add an `exposed` row in `research/skill-exposure-inventory.json`.
   Record accepted risks in `ecosystem-skills/PIN-REVIEW.md`.
7. An independent review and the owner's approval to deploy.

The full precondition sets are in the
[Fable review](../../.agents/rounds/2026-10-01-backlog-closeout/scf-review-fable.md) ("Preconditions")
and the [Astra review](../../.agents/rounds/2026-10-01-backlog-closeout/scf-review-astra.md)
("Preconditions", P1 to P3).
