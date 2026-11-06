---
id: cs-007
service: canonical-source
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "README expands MPP as Managed Payment Protocol; the code and UI use Machine Payments Protocol"
probe:
  type: http-text
  url: https://raw.githubusercontent.com/trionlabs/stellar-8004/main/README.md
  expect:
    status: 200
    contains:
      - "Managed Payment Protocol"
evidence:
  - "2026-11-06 current main still has the README mismatch; registration UI line85 and mppx client confirm Machine Payments Protocol. Owner public/issues-enabled/not-archived, all issues/PRs deduped; .agents/rounds/2026-11-05-truth-maintenance/other.md row cs-007."
  - "2026-11-02T17:23Z live read of trionlabs/stellar-8004 main 5920792f5fd1467c9bb9f9f801ac579dbfdf59e3 (2026-10-10). README.md:17 says '**x402 and MPP Integration** - Agents advertise x402 and Managed Payment Protocol support in their registration metadata.'"
  - "Same commit, the repository's own code uses the other expansion: webapp/supabase/migrations/037_mpp_column.sql:1 '-- Add MPP (Machine Payments Protocol) support column to agents table'; webapp/apps/web/src/lib/components/register/StepAdvanced.svelte:99 'Enable if your agent uses the Machine Payments Protocol for direct on-chain settlement'; webapp/apps/web/src/lib/mpp-client.ts:3 imports Challenge, Credential, Receipt from 'mppx', the Machine Payments Protocol client."
  - "Dedupe 2026-11-02: trionlabs/stellar-8004 issues (state all) contain no report about the MPP name. The repository has issues enabled."
  - "Golden consumer: eval/qa/corpus/battery/compliance-rwa-payments/q-agent-identity-erc8004-stellar.json cites https://github.com/trionlabs/stellar-8004 for the x402/MPP integration claim."
  - upstream issue filed 2026-11-06: https://github.com/trionlabs/stellar-8004/issues/71
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: Fresh trionlabs/stellar-8004 README,registration UI,mpp-client; repo metadata and all issues/PRs — README17 still Managed Payment Protocol; current UI85 says Machine Payments Protocol; mppx client remains. Historical migration path removed (404), so use current UI/client evidence. Repo public,issues enabled,not archived; no matching MPP-name issue/PR found. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row cs-007."
---

## Finding

The `trionlabs/stellar-8004` README expands MPP as "Managed Payment Protocol". The repository's own
registration UI and `mppx` client use "Machine Payments Protocol". The README is
the only place that uses the other name.

## Evidence

Fresh reads on 2026-11-06:

- [README.md](https://github.com/trionlabs/stellar-8004/blob/main/README.md), line 17: `Managed Payment Protocol`.
- [Registration UI](https://github.com/trionlabs/stellar-8004/blob/main/webapp/apps/web/src/lib/components/register/StepAdvanced.svelte), line 85: `Machine Payments Protocol`.
- [MPP client](https://github.com/trionlabs/stellar-8004/blob/main/webapp/apps/web/src/lib/mpp-client.ts) imports `Challenge`, `Credential`, and `Receipt` from `mppx`.

The migration file cited in the historical November 2 evidence is removed from current main.
The current UI and client provide the controls. A fresh all-state issue/PR check found no duplicate.

## Recommendation

Change "Managed Payment Protocol" to "Machine Payments Protocol" in `README.md` line 17.

## Current verification — 2026-11-06

The current README still says `Managed Payment Protocol`. The current registration UI (`webapp/apps/web/src/lib/components/register/StepAdvanced.svelte`, line 85) says `Machine Payments Protocol`; `webapp/apps/web/src/lib/mpp-client.ts` imports `mppx`. The historical migration path cited above is now removed; use the current UI and client as the controls. The public owner repository has issues enabled and is not archived. All current issues and PRs were checked; no duplicate MPP naming report was found.
