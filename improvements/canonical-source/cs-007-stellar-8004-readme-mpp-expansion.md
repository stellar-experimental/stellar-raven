---
id: cs-007
service: canonical-source
status: verified
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
  - "2026-11-02T17:23Z live read of trionlabs/stellar-8004 main 5920792f5fd1467c9bb9f9f801ac579dbfdf59e3 (2026-10-10). README.md:17 says '**x402 and MPP Integration** - Agents advertise x402 and Managed Payment Protocol support in their registration metadata.'"
  - "Same commit, the repository's own code uses the other expansion: webapp/supabase/migrations/037_mpp_column.sql:1 '-- Add MPP (Machine Payments Protocol) support column to agents table'; webapp/apps/web/src/lib/components/register/StepAdvanced.svelte:99 'Enable if your agent uses the Machine Payments Protocol for direct on-chain settlement'; webapp/apps/web/src/lib/mpp-client.ts:3 imports Challenge, Credential, Receipt from 'mppx', the Machine Payments Protocol client."
  - "Dedupe 2026-11-02: trionlabs/stellar-8004 issues (state all) contain no report about the MPP name. The repository has issues enabled."
  - "Golden consumer: eval/qa/corpus/battery/compliance-rwa-payments/q-agent-identity-erc8004-stellar.json cites https://github.com/trionlabs/stellar-8004 for the x402/MPP integration claim."
---

## Finding

The `trionlabs/stellar-8004` README expands MPP as "Managed Payment Protocol". The repository's own
database migration, registration UI, and `mppx` client use "Machine Payments Protocol". The README is
the only place that uses the other name.

## Evidence

At `main` commit `5920792f`:

- `README.md` line 17: "Agents advertise x402 and Managed Payment Protocol support".
- `webapp/supabase/migrations/037_mpp_column.sql` line 1: "MPP (Machine Payments Protocol)".
- `webapp/apps/web/src/lib/components/register/StepAdvanced.svelte` line 99: "Machine Payments
  Protocol".
- `webapp/apps/web/src/lib/mpp-client.ts` line 3: `import { Challenge, Credential, Receipt } from 'mppx';`.

## Recommendation

Change "Managed Payment Protocol" to "Machine Payments Protocol" in `README.md` line 17.
