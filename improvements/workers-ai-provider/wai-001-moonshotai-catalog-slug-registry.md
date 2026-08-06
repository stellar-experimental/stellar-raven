---
id: wai-001
service: workers-ai-provider
status: verified
discovered: 2026-08-06
upstreamTitle: workers-ai-provider rejects the Unified Billing moonshotai/Kimi catalog slug before AI.run
evidence:
  - workers-ai-provider 4.0.0 installed from npm (latest dist-tag, verified 2026-08-06)
  - deterministic local reproduction: `createWorkersAI({ binding, providers: [openai], resume: false })("moonshotai/kimi-k3")` throws before the mock binding's `run` is called (0 calls)
  - registry exports 26 entries; `moonshotai` is absent, while `findProviderBySlug("moonshotai")` returns undefined
  - source: node_modules/workers-ai-provider/src/gateway-delegate.ts:112-120 resolves slugs and throws the reproduced error
  - consumer impact: src/demo/model-config.ts:148-164 and src/demo/chat.ts:315-360 need a separate providers-less createWorkersAI instance to use the binding run path
---

## Finding

`workers-ai-provider` 4.0.0 cannot delegate the Unified Billing catalog slug
`moonshotai/kimi-k3` when provider plugins are configured. The 26-entry gateway
registry omits `moonshotai`, so model construction throws
`Unknown gateway provider "moonshotai" (from slug "moonshotai/kimi-k3")` before
`AI.run` can dispatch it. The current npm `latest` is also 4.0.0, so this is not
an upgrade-only issue.

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

## Recommendation

Add a `moonshotai` registry entry for the Unified Billing run catalog using the
OpenAI wire format (the default `runWireFormat`) and mark it as having no native
gateway path unless Cloudflare supports one. This keeps the existing delegate
behavior for configured providers and removes the separate binding instance.
