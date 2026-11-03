# 2026-11-03 upstream sweep: state table

Author: Claude Opus 5.5 at high (lane `up-sweep`, `improvements-pipeline` skill, "Upstream issue and
PR follow-up"). Base: branch `improvements/upstream-sweep-1103` at `e530c7f4`.

## Method

- Refs: every `github.com/<owner>/<repo>/(issues|pull)/<n>` URL in an active finding file. The
  count is 118 unique issue and PR refs across 114 findings (comment URLs fold into their issue).
  The 20-issue batch and the other 2026-11-02 filings in
  [`2026-11-02-upstream-followup.md`](../2026-11-02-upstream-followup.md) are all in that set.
- State: one GraphQL `resource(url:)` read for each ref at about 2026-11-03T15:00Z. The read took
  state, close reason, author, the last 30 comments (author, bot or user, association), cross-referenced
  PRs, close events, reviews, and checks. Exact comment text came from `gh api … --jq .body`.
- Live re-check: `npm run improvements:probes` at about 15:05Z (18 recurring, 0 fixed-candidate,
  2 inconclusive for a missing `LUMENLOOP_API_KEY`, 20 run). Direct re-checks for every ref with
  new activity or a claimed fix (see the table).
- Inbound: `stellar-experimental/stellar-raven` has no open `[upstream-ready]` issue. The last five
  (#332 to #335 and #316) are closed.
- Gates after the two status edits: `npm run improvements:index`, `npm run improvements:lint`, and
  `npm run improvements:lint -- --live` all pass (114 findings).

## Ref state counts

| ref state | refs |
|---|---|
| open | 101 |
| closed / completed | 9 |
| closed / not_planned | 4 |
| merged (PR) | 6 |
| closed unmerged (PR) | 1 |
| no ref (`verified`, not filed) | 3 findings |

New activity since the 2026-11-02 sweep (22:20Z): `cs-003`, `cs-008`, `cs-009`, `sd-059`, `sd-074`,
`sk-031`, and the bot PRs listed below. The other refs have no new activity.

## Comment authors since 2026-11-02T00:00Z (non-Raven)

| ref | author | kind | what it says |
|---|---|---|---|
| stellar/stellar-protocol#2056 | `leighmcculloch` | maintainer (MEMBER) | "This doesn't seem significant to fix." Closed not_planned 02:24Z. |
| stellar/stellar-protocol#2055 | `leighmcculloch` | maintainer | No comment. PR #2058 closes the issue as completed. |
| Inferara/soroban-security-portal#256 | `ranjeetprabhatedu-dotcom`, `maxx-GENIUS` | drive-by users (NONE) | Generic "assign me" requests. The second one describes Redis work that does not match the issue. |
| stellar/stellar-dev-skill#172 | `stellar-triage-bot[bot]` | bot | Confirms `sk-031`. Asks `kaankacar` to apply a `deploy-pages.yml` patch (`keep_files: false`). No PR yet. |
| stellar/stellar-docs#2995 | `stellar-triage-bot[bot]` | bot | Agrees with Raven's two-path table. Moves the issue to close-candidate. A maintainer must confirm. |
| stellar/stellar-docs#2708 (PR) | `stellar-triage-bot[bot]` | bot | Answers the `ElliotFriend` review in `6c31502f`. Checks green. Waits for a maintainer merge. |
| stellar/stellar-docs#3009 to #3012, #3022 (PRs) | `stellar-triage-bot[bot]`; `kaankacar` (MEMBER) on #3022 | bot; maintainer `/triage` | Bot self-reviews: "Ready to merge". `kaankacar` added a spec commit to #3022. |
| stellar/stellar-docs#2997 to #3024 (issues) | `stellar-triage-bot[bot]` | bot | Dispatch acknowledgement and PR link. Already in the 2026-11-02 ledger, except #3019 (PR #3023) and #3024 (PR #3025). |

## Bot PRs that claim to fix a Raven issue

None is merged. Each waits for a maintainer review (`REVIEW_REQUIRED`). The live trigger is the
deployed page, so no live re-check can pass before a merge and deploy.

| finding | issue | bot PR | PR state |
|---|---|---|---|
| `sd-060` | stellar/stellar-docs#2997 | #3009 | open; bot review "Ready to merge" 2026-11-03 |
| `sd-062` | #2999 | #3010 | open; bot review "Ready to merge" 2026-11-03 |
| `sd-063` | #3000 | #3011 | open; bot review "Ready to merge" 2026-11-03 |
| `sd-065` | #3001 | #3012 | open; bot review "Ready to merge" 2026-11-03 |
| `sd-066` | #3002 | #3013 | open |
| `sd-067` | #3003 | #3014 | open |
| `sd-068` | #3004 | #3015 | open |
| `sd-069` | #3005 | #3017 | open |
| `sd-071` | #3006 | #3018 | open |
| `sd-072` | #3007 | #3020 | open |
| `sd-073` | #3008 | #3021 | open |
| `sd-078` | #3016 | #3022 | open; `kaankacar` spec commit; bot "Ready to merge" |
| `sd-079` | #3019 | #3023 | open |
| `sd-080` | #3024 | #3025 | open |
| `sk-031` | stellar/stellar-dev-skill#172 | none (bot posted a patch for a maintainer) | — |

Human-authored open PRs that cover a finding: `sd-053` #2899 (`kaankacar`, two failing checks),
`sd-054` #2931, `sd-058` #2932 (`kaankacar`), `sd-064` #2945 (`ElliotFriend`), `sd-070` #2763
(`leighmcculloch`, draft), `sd-074` #2708 (`zachfedor`, bot commits), `sd-032` #2898 (`kaankacar`,
merge conflict). None is merged. Raven has no author-owned PR in this set.

## State table

The status in the first column is the status at the start of the sweep. "not run (untouched)"
means that the ref has no new activity, so the skill's no-noise rule applies and no direct re-check
ran. A probe result is shown where a probe exists.

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `cs-001` (reported-upstream) | source check | cloudflare/agents#2296 | open | none | not run (untouched) | no-op | maintainer activity |
| `cs-003` (reported-upstream) | eval/golden | stellar/stellar-protocol#2055 | closed/completed | PR #2058 merged (leighmcculloch) 2026-11-03T03:39Z, closes #2055 | fixed (2026-11-03T15:06Z, master ded60f56) | status -> fixed-upstream; resolver dry-run ready; golden refs need update | distinct reviewer re-derives, then comment on #2055 and resolve |
| `cs-004` (reported-upstream) | probe | circlefin/stellar-cctp#36 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `cs-005` (reported-upstream) | probe | circlefin/stellar-cctp#37 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `cs-006` (verified) | probe | (none) | - | none | probe recurring (15:0xZ) | no-op | filing decision |
| `cs-007` (verified) | probe | (none) | - | none | probe recurring (15:0xZ) | no-op | filing decision |
| `cs-008` (reported-upstream) | eval/golden | stellar/stellar-protocol#2056 | closed/not_planned | maintainer leighmcculloch: "This doesn't seem significant to fix." | still-repro (cap-0046-06.md line 351) | status -> declined-upstream with disposition | none (revisit only on new evidence) |
| `cs-009` (reported-upstream) | eval/golden | Inferara/soroban-security-portal#256 | open | two drive-by assignment requests (NONE, 22:10Z and 00:08Z); no maintainer | not run | no-op (no reply) | maintainer activity |
| `ll-001` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#21 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-002` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#22 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-003` (reported-upstream) | probe | lumenloop/lumenloop-backend#23 | open | none | probe inconclusive (15:0xZ) | no-op | maintainer activity |
| `ll-004` (reported-upstream) | drift | lumenloop/lumenloop-backend#42 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-005` (reported-upstream) | source check | lumenloop/lumenloop-backend#19 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-006` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#18 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-007` (reported-upstream) | probe | lumenloop/lumenloop-backend#20 | open | none | probe inconclusive (15:0xZ) | no-op | maintainer activity |
| `ll-008` (reported-upstream) | eval/golden | lumenloop/stellar-ecosystem-db#3 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-009` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#25 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-010` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#27 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-011` (reported-upstream) | source check | lumenloop/lumenloop-backend#24 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-012` (reported-upstream) | source check | lumenloop/lumenloop-backend#29 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-013` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#26 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-014` (reported-upstream) | source check | lumenloop/lumenloop-backend#30 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-015` (reported-upstream) | source check | lumenloop/lumenloop-backend#28 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-016` (reported-upstream) | source check | lumenloop/lumenloop-backend#31 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-017` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#36 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-018` (reported-upstream) | source check | lumenloop/lumenloop-backend#34 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-019` (reported-upstream) | source check | lumenloop/lumenloop-backend#35 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-020` (reported-upstream) | source check | lumenloop/lumenloop-backend#32 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-022` (reported-upstream) | source check | lumenloop/lumenloop-backend#38 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-023` (reported-upstream) | source check | lumenloop/lumenloop-backend#39 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-024` (reported-upstream) | source check | lumenloop/lumenloop-backend#33 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-025` (reported-upstream) | source check | lumenloop/lumenloop-backend#37 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-026` (reported-upstream) | source check | lumenloop/lumenloop-backend#40 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-027` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#41 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-028` (reported-upstream) | source check | lumenloop/lumenloop-backend#43 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-029` (reported-upstream) | source check | lumenloop/lumenloop-backend#35 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-030` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#44 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-031` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#46 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-032` (reported-upstream) | eval/golden | lumenloop/stellar-ecosystem-db#13 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-033` (reported-upstream) | eval/golden | lumenloop/stellar-ecosystem-db#14 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-034` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#48 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-035` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#49 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-036` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#50 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-037` (reported-upstream) | eval/golden | lumenloop/lumenloop-backend#51 | open | none | not run (untouched) | no-op | maintainer activity |
| `ll-038` (reported-upstream) | eval/golden | lumenloop/stellar-ecosystem-db#15 | open | none | not run (untouched) | no-op | maintainer activity |
| `sd-004` (declined-upstream) | eval/golden | stellar/stellar-docs#2567 | closed/completed | none | not run (untouched) | no-op | none (declined) |
| `sd-004` (declined-upstream) | eval/golden | stellar/stellar-docs#2572 (PR) | merged | none | not run (untouched) | no-op | none (declined) |
| `sd-005` (reported-upstream) | eval/golden | stellar/stellar-docs#2565 | open | none | not run (untouched) | no-op | maintainer activity |
| `sd-009` (declined-upstream) | eval/golden | stellar/stellar-docs#2575 | closed/not_planned | none | not run (untouched) | no-op | none (declined) |
| `sd-014` (reported-upstream) | eval/golden | stellar/stellar-docs#2611 | open | none | not run (untouched) | no-op | maintainer activity |
| `sd-032` (reported-upstream) | drift | stellar/stellar-docs#2606 | open | stellar-docs#2810 closed (copilot-swe-agent); stellar-docs#2898 open (kaankacar) | not run (untouched) | no-op | maintainer activity |
| `sd-032` (reported-upstream) | drift | stellar/stellar-docs#2410 (PR) | merged | none | not run (untouched) | no-op | maintainer activity |
| `sd-035` (reported-upstream) | source check | stellar/stellar-docs#2609 | open | stellar-docs#2659 merged (ElliotFriend) | not run (untouched) | no-op | maintainer activity |
| `sd-035` (reported-upstream) | source check | stellar/stellar-docs#2659 (PR) | merged | none | not run (untouched) | no-op | maintainer activity |
| `sd-048` (reported-upstream) | source check | stellar/stellar-protocol#2010 | closed/not_planned | stale bot closed not_planned 2026-11-02; no maintainer reply | still-repro (master ded60f56 line 78) | closed-unfixed; one-line PR package drafted | owner opens PR (sd-048-pr.md) |
| `sd-050` (reported-upstream) | eval/golden | stellar/stellar-docs#2561 | open | oceans404 labeled js-sdk-v17 2026-11-01 | not run | no-op | maintainer activity |
| `sd-053` (reported-upstream) | eval/golden | stellar/stellar-docs#2789 (PR) | merged | none | not run (untouched) | no-op | maintainer activity |
| `sd-053` (reported-upstream) | eval/golden | stellar/stellar-docs#2602 | open | stellar-docs#2789 merged (kaankacar); stellar-docs#2899 open (kaankacar) | not run (untouched) | no-op | maintainer activity |
| `sd-054` (reported-upstream) | probe | stellar/stellar-docs#2889 | open | stellar-docs#2931 open (kaankacar) | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sd-058` (reported-upstream) | source check | stellar/stellar-docs#2909 | open | stellar-docs#2932 open (kaankacar) | not run (untouched) | no-op | maintainer activity |
| `sd-059` (reported-upstream) | source check | stellar/stellar-docs#2995 | open | triage bot 23:25Z: close-candidate; a maintainer can confirm the close | not run (sd059 lane owns the Discovery comparison) | no-op here | sd059 lane result |
| `sd-060` (reported-upstream) | eval/golden | stellar/stellar-docs#2997 | open | stellar-docs#3009 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-061` (reported-upstream) | eval/golden | stellar/stellar-docs#2998 | open | none | not run (untouched) | no-op | maintainer activity |
| `sd-062` (reported-upstream) | eval/golden | stellar/stellar-docs#2999 | open | stellar-docs#3010 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-063` (reported-upstream) | eval/golden | stellar/stellar-docs#3000 | open | stellar-docs#3011 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-064` (reported-upstream) | eval/golden | stellar/stellar-docs#2945 (PR) | open | PR #2945 (ElliotFriend) open, checks green, REVIEW_REQUIRED | not run (not merged) | no-op | PR #2945 merge + deploy |
| `sd-065` (reported-upstream) | eval/golden | stellar/stellar-docs#3001 | open | stellar-docs#3012 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-066` (reported-upstream) | eval/golden | stellar/stellar-docs#3002 | open | stellar-docs#3013 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-067` (reported-upstream) | eval/golden | stellar/stellar-docs#3003 | open | stellar-docs#3014 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-068` (reported-upstream) | eval/golden | stellar/stellar-docs#3004 | open | stellar-docs#3015 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-069` (reported-upstream) | eval/golden | stellar/stellar-docs#3005 | open | stellar-docs#3017 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-070` (reported-upstream) | eval/golden | stellar/stellar-docs#2763 (PR) | open | PR #2763 (leighmcculloch) draft, checks green | not run (not merged) | no-op | PR #2763 merge + deploy |
| `sd-071` (reported-upstream) | eval/golden | stellar/stellar-docs#3006 | open | stellar-docs#3018 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-072` (reported-upstream) | eval/golden | stellar/stellar-docs#3007 | open | stellar-docs#3020 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-073` (reported-upstream) | eval/golden | stellar/stellar-docs#3008 | open | stellar-docs#3021 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-074` (reported-upstream) | eval/golden | stellar/stellar-docs#2708 (PR) | open | PR #2708 head 6c31502f; triage bot answered ElliotFriend review 10:32Z; checks green; REVIEW_REQUIRED; diff removes environments.toml | not run (not merged) | no-op | PR #2708 merge + deploy |
| `sd-077` (verified) | eval/golden | (none) | - | none | not run (untouched) | no-op | filing decision |
| `sd-078` (reported-upstream) | eval/golden | stellar/stellar-docs#3016 | open | stellar-docs#3022 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-079` (reported-upstream) | source check | stellar/stellar-docs#3019 | open | stellar-docs#3023 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-080` (reported-upstream) | source check | stellar/stellar-docs#3024 | open | stellar-docs#3025 open (stellar-triage-bot) | not run (untouched) | no-op | maintainer activity |
| `sd-081` (reported-upstream) | source check | stellar/stellar-docs#2562 | open | oceans404 labeled js-sdk-v17 2026-11-01; fork draft kaankacar/stellar-docs#31 (copilot, July) is stale | not run | no-op | maintainer activity |
| `sk-004` (reported-upstream) | source check | lumenloop/lumenloop-skills#1 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-005` (reported-upstream) | probe | lumenloop/lumenloop-skills#2 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-007` (reported-upstream) | probe | lumenloop/lumenloop-skills#3 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-014` (reported-upstream) | probe | OpenZeppelin/openzeppelin-skills#13 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-015` (reported-upstream) | probe | OpenZeppelin/openzeppelin-skills#14 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-019` (reported-upstream) | source check | Stellar-Light/stellar-scout#13 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-022` (reported-upstream) | probe | OpenZeppelin/openzeppelin-skills#16 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-022` (reported-upstream) | probe | OpenZeppelin/openzeppelin-skills#14 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sk-025` (reported-upstream) | eval/golden | Trustless-Work/trustlesswork-skill#6 | open | trustlesswork-skill#4 merged (armandocodecr); trustlesswork-skill#9 merged (armandocodecr) | not run (untouched) | no-op | maintainer activity |
| `sk-027` (reported-upstream) | drift | Stellar-Light/stellar-scout#14 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-028` (reported-upstream) | source check | Stellar-Light/stellar-scout#15 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-029` (reported-upstream) | source check | Trustless-Work/trustlesswork-skill#20 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-030` (reported-upstream) | source check | lumenloop/lumenloop-skills#6 | open | none | not run (untouched) | no-op | maintainer activity |
| `sk-031` (reported-upstream) | source check | stellar/stellar-dev-skill#172 | open | triage bot confirmed; asks kaankacar to apply a deploy-pages.yml patch; no PR yet | still-repro (soroban/SKILL.md HTTP 200, 71331 bytes, 15:06Z) | no-op | deploy-pages.yml PR merge + deploy |
| `sls-024` (reported-upstream) | source check | Stellar-Light/stellarlight#494 | closed/completed | stellarlight#538 merged (theboycoder); stellarlight#1301 merged (theboycoder); stellarlight#1302 merged (theboycoder); stellarlight#1316 merged (theboycoder) | not run (untouched) | no-op | maintainer activity |
| `sls-024` (reported-upstream) | source check | Stellar-Light/stellar-scout#9 | closed/completed | none | not run (untouched) | no-op | maintainer activity |
| `sls-029` (reported-upstream) | source check | Stellar-Light/stellarlight#514 | closed/completed | stellarlight#527 merged (theboycoder) | not run (untouched) | no-op | maintainer activity |
| `sls-029` (reported-upstream) | source check | Stellar-Light/stellarlight#742 | closed/completed | stellarlight#748 merged (theboycoder); stellarlight#842 merged (theboycoder); stellarlight#991 merged (theboycoder); stellarlight#1298 merged (theboycoder) | not run (untouched) | no-op | maintainer activity |
| `sls-033` (reported-upstream) | source check | Stellar-Light/stellarlight#519 | closed/completed | stellarlight#528 merged (theboycoder); stellarlight#540 merged (theboycoder); stellarlight#543 merged (theboycoder) | not run (untouched) | no-op | maintainer activity |
| `sls-033` (reported-upstream) | source check | Stellar-Light/stellarlight#742 | closed/completed | stellarlight#748 merged (theboycoder); stellarlight#842 merged (theboycoder); stellarlight#991 merged (theboycoder); stellarlight#1298 merged (theboycoder) | not run (untouched) | no-op | maintainer activity |
| `sls-039` (declined-upstream) | source check | Stellar-Light/stellarlight#522 | closed/completed | stellarlight#530 merged (theboycoder) | not run (untouched) | no-op | none (declined) |
| `sls-039` (declined-upstream) | source check | Stellar-Light/stellarlight#530 (PR) | merged | none | not run (untouched) | no-op | none (declined) |
| `sls-095` (reported-upstream) | probe | Stellar-Light/stellarlight#1889 (PR) | merged | PR #1889 merged 2026-10-31; production not updated | still-repro (resolve?q=varial found false, 15:07Z) | no-op (comment already on PR #1889) | owner data update |
| `sls-096` (reported-upstream) | probe | Stellar-Light/stellarlight#1907 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-097` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1908 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-098` (reported-upstream) | probe | Stellar-Light/stellarlight#1909 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-099` (reported-upstream) | probe | Stellar-Light/stellarlight#1910 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-100` (reported-upstream) | probe | Stellar-Light/stellarlight#1911 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-101` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1912 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-102` (reported-upstream) | probe | Stellar-Light/stellarlight#1913 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-103` (reported-upstream) | probe | Stellar-Light/stellarlight#1914 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-104` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1915 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-105` (reported-upstream) | probe | Stellar-Light/stellarlight#1916 | open | none | probe recurring (15:0xZ) | no-op | maintainer activity |
| `sls-106` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1917 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-107` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1900 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-109` (reported-upstream) | source check | Stellar-Light/stellarlight#1901 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-110` (reported-upstream) | source check | Stellar-Light/stellarlight#1902 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-111` (reported-upstream) | source check | Stellar-Light/stellarlight#1903 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-112` (reported-upstream) | eval/golden | Stellar-Light/stellarlight#1904 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-113` (reported-upstream) | source check | Stellar-Light/stellarlight#1905 | open | none | not run (untouched) | no-op | maintainer activity |
| `sls-114` (reported-upstream) | source check | Stellar-Light/stellarlight#1906 | open | none | not run (untouched) | no-op | maintainer activity |
| `wai-001` (declined-upstream) | source check | cloudflare/ai#634 | closed/not_planned | ai#639 closed (edenbuilds) | not run (untouched) | no-op | none (declined) |
| `wai-001` (declined-upstream) | source check | cloudflare/ai#639 (PR) | closed | none | not run (untouched) | no-op | none (declined) |
