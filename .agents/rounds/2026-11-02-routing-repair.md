# Routing repair round 2026-11-02

Owner decision B was delegated on 2026-11-02 ("find and navigate a solution ... test a few potential
solutions and then just go with whatever is the best"). The orchestrator is t16 (Claude Opus 5.5).

## Acceptance

[contract.md](2026-11-02-routing-repair/contract.md) was written before any candidate ran (v1
SHA-256 `5fd28eab…4e4a`). Amendment 1 adopts G1–G15 from
[attack-g.md](2026-11-02-routing-repair/attack-g.md) (Grok 4.7 high, written with no candidate
result). The contract records the timing of the one lane status line that arrived first.

## Lanes

| Lane | Model | Scope |
|---|---|---|
| rt-a | Codex `gpt-6-astra` high | 2026-10-28 clean parent (c4p + F4 + F5) and a page-fill variant |
| rt-b | Claude Opus 5.5 high | offline dense diagnostic; pure-function repair for the short-token prefix and substring class |
| rt-g | Grok 4.7 high | assumption attack on the contract (done) |
| rt-c | Codex `gpt-6-astra` high | round 2: combined schema, token, and open-world admission design |

## Round 1 results (2026-11-02)

No design passes, so nothing ships and every floor stays. The lane reports are
[report-rt-a.md](2026-11-02-routing-repair/report-rt-a.md) and
[report-rt-b.md](2026-11-02-routing-repair/report-rt-b.md). Their `tmp/` evidence paths were
lane-local and are not kept. The orchestrator recomputed the lane totals from the raw routing JSON
files; they match both reports.

Baselines at `d6ad7350` (top1/top3/top5/cardHit5): main legacy 218/294/327/113, fresh legacy
219/293/327/113; skills 17/23/23/23 and holdout 12/27/30/30 with 10 forbidden captures on both.

| Design | Lane | Result | Main failing rule |
|---|---|---|---|
| a1 c4p + F4 + F5 | rt-a | reject | G2 and G3 by one row in extended and holdout; G10 18/30 |
| a2 a1 + short-page fill | rt-a | reject | identical pages to a1 |
| a3 a2 + identity slots | rt-a | reject | G2, G3, G7, G11; generic identity tokens promote unrelated entries |
| b1 dense evidence (offline) | rt-b | diagnostic only | G13; also G3 and G7 by one count; W − L +20 main, +21 fresh |
| b2 token boundaries (4 rules) | rt-b | reject | G2, G3, G7 by large margins; G10 passes |

Findings:

- The two defect classes are independent. a1 fixes schema-only admission and keeps the short-token
  defect (G10 fails). b2 fixes the short-token defect and keeps schema-only admission (check 5).
- About 80 of the 101 b2 `short` losses on main are broad retrieval entries that leave the top five,
  mostly `lumenloop.search_content_semantic`. Today those entries pass the gate through stopword
  and prefix evidence (`on` inside `content`). A token fix alone removes that recall.
- Dense evidence is the strongest measured recall signal. A query embedding is a paid model call on
  the search path, so `AGENTS.md` and G13 rule it out until the owner decides otherwise.
- The `skills.stellar-dev.dapp` description override is no longer load-bearing on main (G12: zero
  graded change without it).
- Tooling: `eval:routing --manifest` checks the default checkout fingerprint, not the selected
  manifest's (rt-a).

rt-b found three conflicts inside the rule. Amendment 2 in the contract resolves them (H1–H5).

## Round 2

One lane measures the combined design that round 1 points to: a1's schema rule, b2's `short` or
`morph` token rule, and a general admission rule for open-world retrieval entries (H4). The
results go here.
