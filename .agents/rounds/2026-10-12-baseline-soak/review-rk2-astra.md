# RK2 delta review

Reviewed `d7189802..107f7211` on `w1012/k`.
Only this output file changed during the review.
No server, model call, Wrangler process, or upstream call ran.

## Findings by severity

### P2: The revised causal exclusion still exceeds the evidence

Locations:

- `.agents/rounds/2026-10-12-baseline-soak/README.md:17`
- `.agents/TODO.md:677`
- `.agents/rounds/2026-10-12-weekday.md:24`

The text now says uptime, the token, and the remote AI binding are unnecessary for the stop.
My earlier review suggested this wording too broadly; that advice needs correction.

Every documented run retained the remote AI binding and token procedure (`README.md:65`).
The fatal run 1 sweep used the same server after the soak (`README.md:71`).
Its token expired at `13:36:24.219Z`; its fatal exit occurred at `15:56:04Z`.
The four-minute sweep therefore does not reproduce the fatal exit on a fresh, unexpired-token server.
The fresh-server crashes follow the separate path whose cause remains unknown.

The day ledger adds an invalid inference: surviving the soak does not prove that these factors are unnecessary.
The evidence weakens a fixed-time expiry explanation, but does not exclude every contribution from the retained binding or token.

Use this narrower statement in all three files:

> The server survived token expiry and scheduled refresh times. The later sweep reproduced the fatal `ProxyWorker` error path.
> These observations weaken a fixed-time expiry explanation. The review did not isolate the remote binding or token as experimental variables.

Also replace “after the race” at `README.md:51` with an observed timing description.
Describe the proposed upstream race report as a suspected mechanism at `README.md:175`.
These statements should match the corrected uncertainty at `README.md:15` and `README.md:56`.

### P2: Preserve the measured scope in the new day ledger

Locations: `.agents/rounds/2026-10-12-weekday.md:30` and `.agents/rounds/2026-10-12-weekday.md:36`.

The 26 misreads include historical top-level results, not only `data.sections` results.
The RT review reports 16 historical misreads and 10 current-envelope misreads.
Evidence: `/private/tmp/claude-501/w1012/rt-review.md:165` and `:166`.
Write “26 of 199 MCP skill-read scripts misread section results.”
This preserves the correct count without assigning the current result shape to historical scripts.

The claim that p9 keeps sibling records for “every entity list” also exceeds the measured result.
The next sentence reports only 65 of 70 records.
The latest author report retains incomplete coverage from the field limit.
Evidence: `/private/tmp/claude-501/w1012/j-report.md:248` and `:273`.
Write “Pack p9 improves evidence coverage for claims that name multiple records.”
Keep the 65-of-70 result and state that coverage remains incomplete.

## Reconciliation of the first review

| Earlier finding | Delta result |
| --- | --- |
| Causal certainty | Mostly corrected. The record separates the observed failure from the inferred race and leaves the runtime crash cause unknown. The exclusions above remain inaccurate. |
| 27% estimate | Corrected. The text states independence, rate-transfer assumptions, the eight-event limit, and the omitted runtime crashes. It calls the actual next-run probability unknown. |
| Default summary interval | Corrected and verified. Omitting `--every` now selects `10`. |

The updated record also distinguishes server uptime from the main replay duration.
It removes the unsupported random-port claim and limits run 2 to its single refused request.
It correctly attributes the nonfatal 4.149.0 branch to source inspection, not runs 2 and 3.
The retry and connection-policy options include the relevant limits.
The TODO retains the owner decision and new signed-plan requirement.

## Verification

I ran the summary script against the existing run 1 raw files.
The default output equals explicit `--every 10` output byte for byte.
It contains 21 sample rows: minutes `0, 10, 20, ... , 200`.
Explicit `--every 1` still reproduces the committed per-minute table byte for byte.

`node --check .agents/rounds/2026-10-12-baseline-soak/summarize.mjs` passed.
`git diff --check HEAD~1..HEAD` passed.
`npm run secrets:scan -- --tree` passed, including gitleaks.
The delta contains four files, all under `.agents/`.
I found no new secret or partner-detail disclosure in the delta.

RECORD: CHANGES: Narrow the causal exclusions and correct the day ledger's section-result and complete-coverage claims.
