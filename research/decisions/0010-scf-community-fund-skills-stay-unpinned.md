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
- **Small marginal answer.** `scout.scfPitch`, `scout.vetIdea`, `scout.getRfps`, handbook search
  through `scout.searchResearch`, `skills.lumenloop.scf-submission-radar`, and
  `skills.stellar-light.stellar-scout` already cover positioning, idea vetting, and pitch drafting.
- **Dormant upstream.** The SCF round and its dated facts changed after the last upstream commit.

## Reopening

Reopen only for a named subset of applicant-side skills. The reviews name
`scf-tranche-reporter`, `scf-prescreen-checker`, `scf-referral-preparer`, and
`scf-claim-verifier` as the candidates with a real gap. `scf-round-reviewer` and
`fetch-external-doc` stay out.

A reopening needs all of the following:

1. Upstream corrects the selected bodies first: round and submission-window semantics from
   `meta.scfRound`, no broken or relative `docs/` links, and handbook-consistent caps and rules.
2. A new source ID (`stellar-light` already names `Stellar-Light/stellar-scout`), a pick list, and
   `unpinnedUpstream` rows with reasons for every excluded sibling.
3. Host description overrides, and a routing comparison that keeps every lane inside its band with
   no threshold change. No new skill may take first place on an SCF fact case.
4. One `proposed` QA case per skill, activated after an independent `golden-truth` review, an
   `exposed` row in `research/skill-exposure-inventory.json`, and the accepted risks in
   `ecosystem-skills/PIN-REVIEW.md`.
5. An independent review and the owner's approval to deploy.

The Fable review lists the full precondition set.
