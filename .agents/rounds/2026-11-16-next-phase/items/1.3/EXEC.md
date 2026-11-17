# Item 1.3 execution record

Executor Claude Sonnet 5.5 (`1.3-exec`, `t1rq`), lead Claude Opus 5.5 (`t1rm`). Branch
`np/1.3-source-gap-residue`. Date 2026-11-17. Spend: USD 0 (no model-graded call; the Docs
assistant key made 4 read-only search calls; one `WebSearch` in standard mode located the NBU page).

Files: [CLASSIFICATION.md](CLASSIFICATION.md), [LEAVES.md](LEAVES.md),
[GROK-REVIEW.md](GROK-REVIEW.md), `probes/`, `register-review.json` (the lead's).

## Per plan step

1. **11 leaves.** All probed, each stopped at the first wording that returned the fact. Ten are
   reached or did not reproduce; the `scout.matchPartners` 503 reproduces (TODO bullet updated).
   After the Grok attack none of the 11 is a source gap. See LEAVES.md.
2. **SEP-7.** Arm (a) `pageSize` 50: long query absent from 43 sections, bare query rank 1. Arm (b)
   the same. Rule fired: `sd-112`.
3. **Snippet-only rows.** Both pages answer: contract-id is on the `stellar-transaction` page and the
   SAC page (the TODO claim "no page states it" was wrong); SEP-45 status is in the SEP file and the
   research lane. No finding and no golden edit; a reachability TODO line and a row under the held
   research-lane item. Both TODO items deleted.
4. **Blend register.** 4 of 77 records are "Unnamed record" (`sd-111`, `unclear`, unposted).
5. **Anchor Directory.** Reached: `search_docs("Anchor Directory")` ranks the Anchor Tools page 1.
6. **`q-soroban-cli-bindings`.** Pinned caution and a replaced `truth.verified`, commit `21f14c0a`. The
   compile diff matched the plan's expectation except `sample.json` (below). `cluster-095` and
   `cluster-103` reopened, the lead reviewed, I closed them with `--review` (`dc8ffac6`). #3153 is
   open and unmerged, so the no-caution branch did not apply. Sibling sweep by file name: none.
   Stored verdict: not re-judged; direction not measured.
7. **Decision 6(c).** NBU: `ll-039` (bank.gov.ua statement of 2021-12-15 read live). Scam recovery:
   **no finding**: the held guide gives the victim step (FAQ "I lost money to a scammer. Can you
   help?"). Pi Network: `sd-113`, net-new content request, `unclear`, unposted.
8. **Scout.** Both reads reproduce: `sls-121` (5 stale `Live` wallet rows, cites resolved `sls-033`)
   and `sls-122` (`coca` repeated in `q=wallet`; two runs and three page sizes).
9. **Chain comparisons and regulation.** Classed; nothing filed (xrpl.org owns the first; no
   owner-side position page for the second).
10. **Write-up.** CLASSIFICATION.md, LEAVES.md, TODO rewrites: deleted "Check Docs search for the
    SEP-7 page", "Add a canonical-page caution", and "Two snippet-only rows"; rewrote "Audit source
    coverage", the two stellar.org bullets, the "Scout sweep" bullet, the Freighter re-point, and the
    `matchPartners` bullet; added the contract-id reachability line and the SEP-45 row. GAPS.md is
    unedited.
11. **Grok.** `grok-4.7`, high, child `1.3-grok` (killed and removed). It knocked down three of my
    classes (rows 6, 8, 9); I re-verified each live and reclassed them to reached. It found one
    undercount (`ll-039`, id 4732) and one wording issue (`sd-111`); both fixed. Rows 14 to 17 and 20,
    `sd-112` and `sd-113` stand. Details in CLASSIFICATION.md.
12. **Post.** Not yet. Waiting for the lead's push, then dry run and post of `ll-039`, `sd-112`,
    `sls-121`, `sls-122`. `sd-111` and `sd-113` stay `verified` and unposted (no public tracker).

## Gates (bare, after the last edit)

| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0: 166 files passed, 5 skipped; 3680 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 (dry run) |
| `npm run secrets:scan -- --tree` | clean, all tracked files |
| `npm run improvements:index` | wrote 91 findings; INDEX.md committed |
| `npm run improvements:lint` | ok (91 findings) |
| `npm run improvements:lint -- --live` | ok (91 findings, live intake checked) |
| `npm run eval:qa:lint -- --since origin/main` | 0 errors, 98 warnings (none new for the edited case) |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 errors, 98 warnings |
| `npm run eval:qa:register -- --check` | up to date |
| `npm run eval:selftest` | all checks passed |
| `npm run eval:qa:compile` | no diff after the edit |

No `test:smoke`: `src/` is untouched.

## Upstream URLs posted

None yet.

## Deviations from the plan

1. **`sample.json` diff.** The plan expected only its header hash to change; the generated file also
   changed in the case's body. It is the script's output, not a hand edit.
2. **Gap classes.** Six of the plan's likely outcomes moved: the scam gap closed as reached (the plan
   expected a 6(c) filing); `wallets.landscape`, `sdf-mandate-holdings` and `xlm-staking-rewards`
   moved to reached after Grok; contract-id is not a finding because the pages state it.
3. **Pi Network facts.** `sd-113` asks only for what Pi's white paper supports (separate network
   using SCP). It does not repeat the ledger's "Pi cannot be sent to a Stellar address", which no
   source I read states.
4. **NBU page.** Found with one `WebSearch` (standard) call; the plan lists no web search. It read
   only public pages afterward.
5. **Probe files.** The runner strips every `snip` key, so Lumenloop snippets are not committed
   (ids, titles, URLs and dates stay).
6. **XLM utility PDF** was not read (no PDF reader on the host). Grok's finding made it moot.
7. **Reviewer-side finding 16.** I did not write down the allowlist basis, as the plan says.

## Questions for the owner

- Forward `sd-111`, `sd-113` and `sd-077` to the stellar.org web team? They have no public tracker.
- `scout.matchPartners` still returns 503: remove it from the surface (ADR-0003) or keep it with its
  fallback hint? The TODO bullet states both options.
- `sd-112` is filed under the plan's fixed rule, but the miss needs extra words that the page does
  not hold. If you think the finding is too weak for the docs team, leave it `verified` unposted.
