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
`truth.sources[]` already name them. Part 2 tests that design against the same bar.

## Incidental observation

Mainnet reported `protocolVersion` 29 at ledger 65270160 (`getLatestLedger`, 2026-11-02). No battery
golden asserts an undated current protocol version. Every Protocol 28 mention carries a date, so this
trial found no stale golden from that upgrade.

## Part 2 — primary-source sentinels

### Method

A sentinel fetches one primary source of a golden and tests one anchor for a volatile value. The
checks are `present`, `absent`, or `count`. The fetch reads GitHub blob URLs as raw files, decodes
JSON escapes and HTML entities, strips tags from HTML only, and collapses whitespace. The runner is
[`eval/qa/source-sentinels.mjs`](../../../eval/qa/source-sentinels.mjs). It needs no key and no model.

The bar is the Part 1 bar: detect at least 3 of the 5 controls, with at most 2 false alarms in the
current set.

### Controls

[`sentinel-controls.json`](sentinel-controls.json) restates the Part 1 controls as anchors on the
pages that the goldens cite. Each anchor holds the old value as the page stated it before the change.

| Control | Anchor | Result |
|---|---|---|
| `control-scf-45-phase` | "currently in the Notification and Award Distribution phase" | detected: the page now says "SCF #45 Ended" |
| `control-scf-46-deadline` | "Deadline to submit: November 8, 2026" | detected: the page now says November 9 |
| `control-rpc-archive-rows` | 7 archive-tier rows in `providers.mdx` | detected: 9 rows |
| `control-zenex-testnet` | the Zenex FAQ testnet statement | detected: the server-rendered FAQ no longer states it |
| `control-meridian-upcoming` | "Meridian 2026 is a two-day in-person conference taking place" | missed: the event page did not change after the event |

Detection is 4 of 5. The miss is a property of the source: a page that never changes cannot signal.

### False alarms

The 22 sentinels in [`eval/qa/source-sentinels.json`](../../../eval/qa/source-sentinels.json) all
hold on 2026-11-02. That result shows only that each anchor fits its page today: an author confirms
every anchor live before it lands, so the Part 1 false-alarm count cannot be measured on this set.
The sentinels cover 18 of the 35 Part 1 probe cases. The other 17 state a dated or settled fact, or
need a source that a plain fetch cannot read. Examples are the live network settings behind
`q-soroban-wasm-size-limit` and `q-protocol-max-tx-set-size`, and the HackerOne program profile
behind `q-comp-security-disclosure-programs`.

A durability proxy estimates the rate over time. [`quote-sweep.json`](quote-sweep.json) re-reads
every exact quote in the newest class A and B evidence notes of the battery: 154 quotes. Of these,
75 were recorded in July to October 2026 and fetched without error. Three of the 75 come from a PDF,
which the plain fetch cannot read. Of the other 72 quotes, 68 hold. The quotes were 18 to 97 days
old, with a median of 27 days. The 4 drifts:

| Source | Class | Reason |
|---|---|---|
| `noether.exchange` | matcher artifact | A period became a semicolon. The fact holds. |
| `agentic-commerce-protocol` README | matcher artifact | The sentence is unchanged inside Markdown link and bold syntax. |
| `stellar-mpp-sdk` README | reworded | The session-mode text was rewritten. |
| MetaMask non-EVM networks page | source changed | MetaMask now lists Stellar. |

Three of 72 quotes failed while their fact still held, about 4 percent at a median age of 27 days.
These quotes were not written as anchors, so the rate is an estimate for authored anchors, not a
measurement of them. A false alarm costs one anchor edit, not a full re-verification.

### Decision

Adopted. Sentinels detect 4 of 5 controls, cost nothing to run, and give the same result on each
run. The false-alarm side of the bar rests on the quote-sweep estimate above. Freeform
quotes in evidence notes are not usable anchors without change: markdown, PDF, and page chrome break
them. Each sentinel is therefore written as a structured entry and confirmed live when it lands.
The daily workflow `.github/workflows/golden-sentinels.yml` keeps one `golden-sentinels` issue in
step with the drift set. The `truth-maintenance` skill queues each drifted case into the
`golden-truth` lane.

### Incidental observations

- SLP-0006 now shows status Final. Its golden states the status as of July 11, 2026, so it stays true.
- Protocol 29 went live on Mainnet on October 1, 2026. It is a security release with no CAPs.

### Independent review

An independent review of PR #314 (Codex `gpt-6-astra`, Grok `grok-4.7`, and Kimi `kimi-k3`, each at
high effort) changed the set and the runner on the same day:

- `x402-no-sep` now reads the SEP list in `ecosystem/README.md` instead of the repository README.
- `ledger-operation-limits` and `sdf-bug-bounty-hackerone` were removed. The first matched a
  sentence dated July 2026, and the second matched a landing page that its golden ranks below the
  HackerOne policy. No plain fetch reads the live values.
- `mazieres-chief-scientist` binds the title to his team card, and `go-sdk-module` binds the module
  to the docs' package location.
- `mpp-payment-intents` requires the Session section after Charge.
- `rpc-archive-provider-names` counts the nine named archive rows, so a replaced provider drifts
  even when the row count stays at nine. Both archive sentinels guard on the table header.
- `zenex-xlm-usd-market-active` checks the market status, not only the deployment introduction.
- A check that can hold on an empty page (`absent`, or a count of 0) must name a `guard` pattern. A
  failed guard is a read error, so a challenge page or an empty response cannot pass as a hold.
- The runner reads stale sentinels with `--ids` and reports them as unread in report mode. A drift
  stays in the issue while its source is unreadable. The workflow fails while any sentinel is
  unread, and it runs only on the default branch.

### A missed drift: ML-DSA

The first ML-DSA sentinel, `ml-dsa-not-shipped`, checked that the software-versions page did not
name ML-DSA. stellar-core v30.0.0 shipped CAP-0087 (ML-DSA verification host functions) on
2026-10-16. On 2026-11-02 the page still listed no Protocol 30 release, so the sentinel held for
17 days after the release. Adding `CAP-0087` to the pattern would not have helped: the page was the
lag, not the pattern.

`mainnet-protocol-29` replaces it. It checks that Mainnet Horizon reports
`"current_protocol_version": 29`, and it guards on the Mainnet network passphrase. It drifts when
Mainnet activates Protocol 30 (vote set for 2026-11-23), whatever the release notes call the change.
A sentinel on a docs page that copies a release is only as fresh as that copy. Anchor on the system
of record when one exists.
