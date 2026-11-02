# Golden freshness probe trial — 2026-11-02

Observed at: 2026-11-02.
Question: can Parallel's `web_decisions` tool act as a cheap trigger that flags stale goldens before
their `truth.reverifyBy` date?
Verdict: **no**. The trial failed the value bar that was fixed before the run. Nothing ships to the
golden QA flows or skills.

Spend: none. Every call used the free, keyless Parallel MCP at `https://mcp.parallel.ai/mcp`.
No golden, register, or lifecycle file changed.

## Method

`web_decisions` answers typed questions (`noul` probability, `choice`, `score`) from a live-web
retrieval. Its request shape is the System One shape that the Jev CLI sends to TypeSafe Jev, plus
web grounding.

- **Current set** ([`probes.json`](probes.json)): 35 probes. Each restates one closed-ended,
  volatile fact of a scheduled battery case as a typed question. `expect` is the golden's value.
  `caseAsOf` pins the case's `truth.asOf`, so a re-verified case invalidates its probe.
- **Positive controls** ([`controls.json`](controls.json)): 5 probes built from real
  `freshness-drift` corrections (#310 and #291). Each `expect` is the stale value that the golden
  held before its correction. A control is detected only when the tool contradicts that stale value.
- **Calls**: one question per call. The state named the subject and today's date. A batched call
  shares one retrieval of about 10 citations across all questions. In an earlier 8-question batch,
  an unrelated question fell from p=0.97 to p=0.36.
- **Verdict rule**: `agree` needs probability ≥ 0.8 on the golden's value; `contradict` needs
  probability ≥ 0.8 on another value. A refusal, an `unknown` choice, or a weaker probability is
  `no-signal`.
- **Value bar** (fixed before the run): at most 2 confirmed false alarms in the current set, at
  least 3 of 5 controls detected, and no spend.

## Results

Full rows, with citations: [`results.json`](results.json).

| Set | agree | no-signal | contradict |
|---|---|---|---|
| Current goldens (35) | 26 | 7 | 2 — **both false alarms** |
| Stale-value controls (5) | 2 — **endorsed the stale value** | 2 | 1 — detected |

### The two contradictions in the current set

| Probe | Golden | Tool | Ground truth on 2026-11-02 |
|---|---|---|---|
| `scf-46-submission-deadline` | 2026-11-09 | 2026-11-08, p=1.000 | Official `communityfund.stellar.org/awards` card: "Deadline to submit: November 9, 2026". The tool cited that page but answered from an older snapshot. The stale November 8 date also circulates in third-party posts that the golden's `truth.sources` already records. |
| `contract-wasm-size-cap` | 128 KiB | 64 KiB, p=0.978 | `stellar network settings` on Mainnet: `contract_max_size_bytes` 131072. 65536 is `contract_data_entry_size_bytes`, the confusion that the golden's avoid clause targets. |

### Controls

| Control | Stale value | Tool | Outcome |
|---|---|---|---|
| `control-meridian-upcoming` | Meridian 2026 still upcoming | p=0.028 | detected |
| `control-scf-45-phase` | SCF #45 in Notification and Award Distribution | same, p=0.807 | **endorsed stale** (official: Ended) |
| `control-scf-46-deadline` | 2026-11-08 | same, p=0.999 | **endorsed stale** (official: 2026-11-09) |
| `control-rpc-archive-count` | 7 RPC Archive providers | `unknown` | missed |
| `control-no-mainnet-perps` | no live Mainnet perp DEX | p=0.507 | missed |

## Why it fails

- Detection was 1 of 5. The bar was 3 of 5.
- An `agree` verdict does not certify freshness. Two controls agreed with values that the official
  source had already replaced.
- The false alarms are not noise. Both came from stale web circulation at high confidence, which is
  the trap class that goldens already encode in `golden.avoid`. Each alarm would cost a full
  golden-truth re-verification and would find nothing.
- Niche ecosystem facts mostly return `no-signal`: provider counts, advisory counts, and SLP status.
- The free tier returned HTTP 429 after about 23 calls in under a minute. The 12 remaining probes
  succeeded on a sequential re-run.

The tool did well on widely covered facts: 26 agreements and the Meridian control. Those facts are
also the least likely to go stale unnoticed.

## What would change the verdict

The failures share one cause: the tool answers from an index snapshot, even when it cites the
current page. A useful trigger must read the golden's own primary sources live. The class-A refs in
`truth.sources[]` already name them. `.agents/TODO.md` tracks that design under "Eval instruments".
A future candidate must pass the same bar against these probes and controls.

## Incidental observation

Mainnet reported `protocolVersion` 29 at ledger 65270160 (`getLatestLedger`, 2026-11-02). No battery
golden asserts an undated current protocol version. Every Protocol 28 mention carries a date, so this
trial found no stale golden from that upgrade.
