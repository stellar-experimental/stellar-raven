# OpenAI domain verification

Separate Worker serving Raven's public OpenAI domain challenge (no MCP code or secrets).

- Route: `raven.stellar.org/.well-known/openai-apps-challenge` on the `stellar.buzz` zone (`raven.stellar.org/*` still routes to `stellar-raven-codemode`).
- Do not replace the challenge without checking the saved portal connection. Keep this directory outside `stellar-raven/`.
- [`.agents/TODO.md`](../../../.agents/TODO.md) states when to remove this Worker.

## Deploy and validate

Requires Node `>=24.22` in the Node 24 line. Run from this directory:

```sh
npm ci --ignore-scripts && npm run typecheck && npm run build && npm audit
```

After validation passes, deploy with an SDF Cloudflare credential (never in a file or arg):

```sh
cf deploy
```

After deploying, verify both the challenge response and the main Raven deployment independently (first check recorded in [VERIFICATION.md](../VERIFICATION.md)).
