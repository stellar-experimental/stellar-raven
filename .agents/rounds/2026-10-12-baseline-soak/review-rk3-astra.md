# RK3 delta review

Reviewed `107f7211..85acef6b` on `w1012/k`.
No blocking findings remain from RK2.
The delta adds no material overclaim to the causal conclusions or measurement summaries.

## Reconciliation

- **Causal exclusions: resolved.** The README now records that the fatal sweep used the same server after token expiry.
  It states that every run retained the token and remote binding.
  The TODO and day ledger make the same limited inference about a fixed-time expiry explanation.
  Evidence: `.agents/rounds/2026-10-12-baseline-soak/README.md:17`, `.agents/TODO.md:677`, and `.agents/rounds/2026-10-12-weekday.md:24`.
- **Race attribution: resolved.** The runtime description refers to a request near the timing boundary.
  The proposed upstream report explicitly calls the race suspected.
  The record keeps the runtime crash cause unknown.
  Evidence: `.agents/rounds/2026-10-12-baseline-soak/README.md:53` and `:176`.
- **Section-result scope: resolved.** The ledger records 26 section-result misreads across 199 skill-read scripts.
  It separates the 16 historical results from the 10 current-envelope results.
  Evidence: `.agents/rounds/2026-10-12-weekday.md:31`.
- **Pack coverage: resolved.** The ledger states improved coverage and explicitly retains the incomplete 65-of-70 result.
  It no longer claims complete coverage for every entity list.
  Evidence: `.agents/rounds/2026-10-12-weekday.md:38`.

The earlier probability qualifications remain intact.
The owner decision, measurement requirement, and new signed-plan requirement also remain intact.

## Minor timing note

The phrase “about 1 s to 2 s” at `.agents/rounds/2026-10-12-baseline-soak/README.md:53` does not describe every observed interval.
Run 3's last successful request started at `16:06:56.367Z` and took 12 ms.
Its runtime WebSocket closed at `16:07:01.023Z`, about 4.6 s later.
Evidence: `evidence/run3-wrangler-4.149.0-repeat/race-sweep.jsonl:48` within the soak folder.
The raw closure entry is `/private/tmp/claude-501/w1012/k-soak/run3-wrangler-4.149.0-repeat/wrangler-debug.log:1192`.

“Within a few seconds after a request near the 5 s gap” avoids unsupported precision.
This minor wording issue does not change the observed failure, unknown cause, or launch recommendation.
It does not block this record's approval.

## Verification

The default summary output equals explicit `--every 10` output byte for byte.
It contains 21 samples, from minute 0 through minute 200, at 10-minute intervals.
Explicit `--every 1` reproduces the committed per-minute table byte for byte.

These checks passed:

- `node --check .agents/rounds/2026-10-12-baseline-soak/summarize.mjs`
- `git diff --check HEAD~1..HEAD`
- `npm run secrets:scan -- --tree`

The delta contains three documentation files, all under `.agents/`.
I found no new secret or partner-detail disclosure.
No server, model call, Wrangler process, or upstream call ran.
Only this review file changed.

RECORD: APPROVE
