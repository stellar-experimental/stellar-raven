---
id: wai-001
service: workers-ai-provider
status: declined-upstream
disposition: Accept the owner's decision to freeze workers-ai-provider. Do not re-file. A Raven migration to createAI from agents/models/ai-sdk (.agents/TODO.md) removes Raven's dependency but does not fix this package; closing the record then needs a reviewed lifecycle decision.
discovered: 2026-08-06
upstreamTitle: workers-ai-provider rejects the Unified Billing moonshotai/Kimi catalog slug before AI.run
evidence:
  - "2026-11-09 sweep (declined): Fresh npm latest4.0.1 remains deprecated. Latest package mock reproduction still throws Unknown gateway provider moonshotai before binding.run (zero calls). PR639 remains closed/unmerged; mattzcarey explicitly feature-froze package. Issue634 closure was Raven’s own acknowledgement, not an independent maintainer fix. Recheck: https://registry.npmjs.org/workers-ai-provider/latest"
  - workers-ai-provider 4.0.0 installed from npm (latest dist-tag, verified 2026-08-06)
  - deterministic local reproduction: `createWorkersAI({ binding, providers: [openai], resume: false })("moonshotai/kimi-k3")` throws before the mock binding's `run` is called (0 calls)
  - registry exports 26 entries; `moonshotai` is absent, while `findProviderBySlug("moonshotai")` returns undefined
  - source: node_modules/workers-ai-provider/src/gateway-delegate.ts:112-120 resolves slugs and throws the reproduced error
  - consumer impact: src/demo/model-config.ts:148-164 and src/demo/chat.ts:315-360 need a separate providers-less createWorkersAI instance to use the binding run path
  - upstream issue filed 2026-08-07: https://github.com/cloudflare/ai/issues/634
  - candidate fix https://github.com/cloudflare/ai/pull/639 remains open at head b57a507cd4a4e0eb8b2330196b75477c8eddfc64 (verified 2026-09-09); review is required and no checks are reported
  - "maintainer decline 2026-10-20: https://github.com/cloudflare/ai/pull/639#issuecomment-6295163611 (mattzcarey closed PR 639 unmerged): workers-ai-provider is deprecated and feature frozen in favor of createAI from agents/models/ai-sdk, which accepts any <author>/<model> catalog id. npm marks workers-ai-provider deprecated ('Use createAI from agents/models/ai-sdk, or ai-search-provider for AI Search'); latest is 4.0.1."
  - "2026-11-02 Raven acknowledged the decline and closed its issue as not planned: https://github.com/cloudflare/ai/issues/634#issuecomment-6590945505."
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: Fresh npm workers-ai-provider4.0.1; original mock-binding construction moonshotai/kimi-k3 with openai provider — GatewayDelegateError Unknown gateway provider moonshotai; binding calls0. npm still deprecated. Issue634 closed not_planned by Raven after maintainer mattzcarey closed639 unmerged; no checks/reviews on639. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row wai-001."
  - date: 2026-11-02
    evidence: "workers-ai-provider 4.0.1 (npm latest, deprecated) with @ai-sdk/openai 4.0.91: the minimal reproduction still throws GatewayDelegateError Unknown gateway provider \"moonshotai\" (from slug \"moonshotai/kimi-k3\") with 0 mocked binding calls. Issue https://github.com/cloudflare/ai/issues/634 is still open."
  - date: 2026-08-11
    evidence: npm latest remains workers-ai-provider 4.0.0. The local minimal reproduction still throws Unknown gateway provider "moonshotai" before the mock binding run method is called; calls remains 0.
  - date: 2026-09-09
    evidence: At 02:44:10.820Z, the installed 4.0.0 package reproduced Unknown gateway provider "moonshotai" with zero mocked binding calls. npm latest remains 4.0.0. PR 639 adds the registry entry but is not merged or published. All 16 Raven demo model-config tests passed; these checks do not validate the candidate package.
---

## Finding

`workers-ai-provider` 4.0.0 cannot delegate the Unified Billing catalog slug
`moonshotai/kimi-k3` when provider plugins are configured. The 26-entry gateway
registry omits `moonshotai`, so model construction throws
`Unknown gateway provider "moonshotai" (from slug "moonshotai/kimi-k3")` before
`AI.run` can dispatch it. On 2026-11-02 the npm `latest` is 4.0.1, which npm marks
deprecated, and the trigger still reproduces there.

## Evidence

Minimal reproduction (no network call):

```ts
import { createWorkersAI } from "workers-ai-provider";
import { openai } from "workers-ai-provider/openai";

let calls = 0;
const binding = { async run() { calls++; throw new Error("should not run"); } };
const workersai = createWorkersAI({ binding, providers: [openai], resume: false });

workersai("moonshotai/kimi-k3");
// GatewayDelegateError: Unknown gateway provider "moonshotai" ...
// calls === 0
```

Expected: the slug selects the run transport and reaches `binding.run`, as it does
when `providers` is omitted. Actual: the delegate rejects it during registry
resolution. Raven keeps a second, providers-less instance solely for this prefix;
that sacrifices the provider-SDK normalization and gateway-delegate features for
Kimi while the primary instance remains configured for other vendors.

PR [#639](https://github.com/cloudflare/ai/pull/639) added the proposed registry entry.
On 2026-10-20 a Cloudflare maintainer closed it unmerged: the package is feature frozen,
and `createAI` from `agents/models/ai-sdk` replaces it. Raven keeps the workaround while the
demo uses this package.

## Recommendation

Add a `moonshotai` registry entry for the Unified Billing run catalog using the
OpenAI wire format (the default `runWireFormat`) and mark it as having no native
gateway path unless Cloudflare supports one. This keeps the existing delegate
behavior for configured providers and removes the separate binding instance.
