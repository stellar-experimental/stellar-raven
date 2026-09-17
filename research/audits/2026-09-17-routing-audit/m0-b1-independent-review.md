# M0-B1 re-judge — independent result review

- Reviewer: Fable high (Claude Fable 5.1), independent of author (Opus) and coordinator (Astra).
- Date: 2026-09-17 (local evening). Read-only. No paid calls, repo edits, servers, agents, or
  signed transactions. Judge verdicts are treated as observations, not authority.
- Inputs: `repo/eval/qa/results/2026-09-17T02-24-27-rejudge.json` (three rows; file sha256
  `88a4ec0a2c1a3dc530e5afa8515b1311a0040e9d8713f370d6af6050b29dd030`) and its source
  `repo/eval/qa/results/2026-09-17T01-33-03-variantA.json` (recorded source sha256
  `ef988d64c2070f98196f2981d7028d66158492a85745be558c1c4e0bbf08afa0`). Goldens at HEAD
  `c6968e74` ("Correct audit goldens and track canonical source findings"). Sources previously
  verified in `golden-and-pipeline-review.md` and `lobstr-blind-review.md`.
- Framing: this is a golden-correction overlay. No candidate answer changed. It is not a routing gain.

## 1. Provenance

- For each row I recomputed the judge input hash with `judgeInputSha256({...case, candidateAnswer,
  transcript})` from the committed case in `eval/qa/cases.json` (HEAD blob sha256
  `3b1aef671b56e1de…`) and the unchanged variantA answer. All three match the recorded
  `attempts.judgeCalls[0].inputSha256` exactly:
  - q-defi-aquarius-what-is `f7470ce47ae7ee99…` MATCH
  - q-defi-soroswap-what-is `988d22077074798c…` MATCH
  - q-eco-lobstr-wallet `0a19e01186b321bc…` MATCH
  So the re-judge graded the committed goldens against the original answers.
- Judge tuple unchanged: source and current both `claude-sonnet-5`, rubric `v2.10`, pack `p6`.
  Judge binary and environment identity match before and after (claude 2.1.274, sha256 `3509913f…`).
- `meta.casesSha256` (`94ac7f19…`) differs from the committed `cases.json` (`3b1aef67…`). That is the
  identity guard's own serialization; the input-hash match above is the provenance proof to cite.
- The re-judge result file is not tracked in git (`git ls-files` empty). Commit it or record its
  sha256 in the ledger before relying on it.
- Case-file hashes at HEAD equal the gated hashes: LOBSTR `fe79ce38…`, Aquarius `d78fb98a…`,
  Soroswap `85a819df…`.

## 2. q-eco-lobstr-wallet — original partial → re-judge correct (agreement: false)

### 2.1 Original partial (source run)

`missingFacts`: (a) date not bound to the Stellar+XRPL claim; (b) "Does not disclose the basis for
reconciling the $232,000 vs $267,463 SCF totals, which the grading notes require". `wrongClaims` and
`avoidMatches` empty.

### 2.2 What the correction changed

The old golden framed the two totals as disputed reconstructions with a basis disclosure "pending".
That framing was false (the SCF payload publishes `totalAwarded 232000` and `totalPaid 267462.64`).
The corrected golden makes SCF amounts optional and says: "if an answer cites a LOBSTR SCF total, it
should name the source, its date, and whether the figure is an awarded or a paid total". Its avoid item
2 ends "…or call a paid SCF total an awarded total, or the reverse." Its symmetric caution says:
"Accurately quoting the canonical LumenLoop source's `scf.awarded_total` as an awarded amount … is not
a wrong claim while ll-013 and ll-008 stand; grade caps at partial for those claims".

Reason (b) of the original partial is therefore retired. That part of the transition is supported.

### 2.3 The exact candidate statement that prevents Correct

Verbatim from the variantA answer, "Scale/traction indicators (as of 2026‑09)":

> SCF-funded across 3 rounds (2, 17, 22), totaling ~$232,000–$267,463 depending on source (SDF
> community-fund page vs. reconciled round-award total).

Analysis against verified sources:

- $232,000 is the SCF page's `totalAwarded` (also Scout's `scfTotalAwardedUSD`).
- $267,463 is Lumenloop `scf.awarded_total`, which equals the SCF page's `totalPaid 267462.64`
  rounded (verified live 2026-09-17T01:57Z). It is a paid-basis figure.
- The candidate names two sources and one date. It never names the awarded-or-paid basis.
- The candidate glosses the paid figure as a "reconciled round-award total", i.e., it presents a paid
  total as an awarded (round-award) sum.

### 2.4 Omission versus wrong claim — the distinction that decides the grade

- **Not a wrong claim.** The gloss follows the upstream field name `awarded_total`. The golden's
  symmetric caution (ll-013 open) makes an awarded-labelled quote of that field "not a wrong claim".
  So `wrongClaims` stays empty and avoid item 2 does not fire as a hard trap. The re-judge is right
  that this is not `wrong`.
- **A capped claim, which is an omission of the corrective distinction.** The same caution says
  "grade caps at partial for those claims". Rubric v2.10: "When grader notes cap an accurately
  supported claim at `partial`, the supported claim is not wrong. The judge must put the missing
  corrective distinction that prevents a `correct` verdict in `missingFacts`." The missing corrective
  distinction is: the awarded-or-paid basis is not named, and the $267,463 figure is a paid total
  presented as a round-award total. That belongs in `missingFacts`, and it prevents `correct`.
- The re-judge rationale states the candidate is "presenting a range tied to two named bases". That is
  factually mistaken: the candidate names two sources, not two bases.

### 2.5 Required-fact check (unchanged keyFacts)

1. Identifies Ultra Stellar as operator — present.
2. Identifies LOBSTR as non-custodial — present.
3. Dates Stellar, XRPL, and platform support — the chain-support sentence has no date of its own, but
   it cites the LOBSTR and Ultra Stellar records that the first paragraph dates "as of
   2026‑09‑04/2026‑08‑29", and status is "verified 2026-08-29". I accept adjacency dating as
   satisfying this fact. The original judge did not; the new judge did. The golden did not change
   here, so this is judge variance, not a correction effect.
4. Attributes every scale claim to its source — present.

### 2.6 Reviewer verdict

**partial**, for a corrected reason: `missingFacts` = "names the source and date of the SCF range but
not the awarded-or-paid basis; presents the $267,463 paid total as a 'round-award total' (capped at
partial per the ll-013 caution)". `wrongClaims` = []. `avoidMatches` = [].

The partial→correct transition is **not fully supported**. Supported effect of the golden correction:
a reason change (false dispute framing → unnamed basis / paid-as-awarded gloss), not a grade change.
`correct` is a lenient reading the golden does not require. Because this is the batch's only upward
flip, record the judge score with this reviewer dissent beside it in the round ledger (score-laundering
guard: the defect behind the correction is the SCF payload, independent of the score; the dissent
keeps the grade honest).

No further golden change is recommended from this row.

## 3. q-defi-aquarius-what-is — wrong → wrong (agreement: true). Supported.

- Re-judge: `avoidMatches [1]`; wrongClaims: "Describes a single 'ICE' token as simultaneously boosting
  liquidity rewards and carrying Aquarius governance voting weight".
- Candidate text: "Locking AQUA produces **ICE**, a vote-escrow-style token that boosts a holder's
  liquidity-reward multiplier (up to 2.5x …) and grants weight in Aquarius governance votes." Also:
  "AQUA holders vote on which trading markets/pairs receive reward incentives" (market voting is by
  upvoteICE, not AQUA).
- Verified sources (2026-09-17): docs.aqua.network defines ICE (lock/boost accounting), upvoteICE
  (market voting), governICE (proposal voting); ICE family non-transferable; governance voting
  unrewarded. Avoid item 1 ("collapse ICE, upvoteICE, and governICE into one governance/reward token")
  fires correctly.
- The narrowed avoid item 2 ("casting governance votes earns AQUA emissions") correctly does not fire:
  the candidate's "700,000 AQUA/week … 'bribe' to incentivize votes" describes market voting
  incentives, which the corrected notes accept as attributed program statements.
- Beyond-golden figures (7M AQUA/day, 5M/2M split, "$291,000" SCF, "based in Poland") are unverified
  and ungraded.
- Verdict: **wrong**. The corrected golden neither creates nor removes this failure.

## 4. q-defi-soroswap-what-is — wrong → wrong (agreement: true). Supported.

- Re-judge: `avoidMatches [2]`; wrongClaims empty; missing: layer separation and a dated adapter set.
- Candidate text: the aggregator "scans multiple Soroban AMMs (Soroswap's own pools, Phoenix,
  Aquarius) and even the classic Stellar order-book DEX (SDEX) to find the best execution price".
  Later: "Soroswap layers a routing API on top of itself and those competitors and SDEX".
- Verified sources: `soroswap/docs@1d7a3c8a` `concepts/aggregator.mdx` line 16 "Stellar SDEX is not
  included as it is incompatible with Soroban-based smart contracts"; `api/index.mdx` line 19 quotes
  across "Soroswap, Phoenix, Aqua and SDEX". The candidate attaches SDEX to the on-chain aggregator's
  execution scope, so avoid item 2 ("classic SDEX is directly executed by the on-chain Soroban
  aggregator") fires correctly.
- The "first DEX" wording is attributed to Scout's directory. The corrected SOURCE NOTE accepts
  attributed quoting; the re-judge handled that correctly and did not penalize it.
- Slip the judge missed (beyond golden, not gating): the candidate calls
  `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH` the "Aggregator router contract". My
  `get_adapters` simulation (ledger 64464923, two RPC providers) shows that address is the
  protocol_id 0 (Soroswap AMM) router; the aggregator is
  `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`.
- The original verdict came from a three-judge panel (wrong, wrong, partial); the re-judge panel of
  three also returns wrong. Verdict: **wrong**.

## 5. Correction to this report and ledger summary

- Correction (2026-09-17): M0-B1 used a three-judge panel for every row, including Soroswap. The
  artifact records nine judge calls in total (`meta.judgePanel: 3`; three `judgeCalls` per row). An
  earlier draft of §4 called the Soroswap re-judge a single call; that was wrong.
- Coordinator decision: the LOBSTR dissent is accepted. The paid panel verdict `correct` and the
  reviewer verdict `partial` are preserved side by side. No golden change and no paid retry.

## 5.1 Summary for the ledger

| Case | Source | Re-judge | Reviewer | Correction effect |
|---|---|---|---|---|
| q-eco-lobstr-wallet | partial | correct (panel of 3) | partial (dissent, preserved alongside) | reason change only |
| q-defi-aquarius-what-is | wrong | wrong (panel of 3) | wrong | none |
| q-defi-soroswap-what-is | wrong (panel) | wrong (panel of 3) | wrong | none |

- Net grade change under the reviewer reading: 0 of 3. Under the judge reading: +1 of 3.
- Record the provenance proof as the three input-hash matches, not `meta.casesSha256`.
- Re-judge result file sha256: `88a4ec0a2c1a3dc530e5afa8515b1311a0040e9d8713f370d6af6050b29dd030` (not tracked in git at review time; pin this hash in the ledger).
- No routing gain is supported by this overlay; the 16-case denominator and the original answers are
  unchanged.
