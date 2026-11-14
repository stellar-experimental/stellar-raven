# OpenAI domain verification

A separate Worker that serves Raven's OpenAI domain challenge. It holds no part of Raven's MCP
server and none of its secrets.

- Its only route is `raven.stellar.org/.well-known/openai-apps-challenge` on the `stellar.buzz`
  zone. The route wins only at that exact path; `raven.stellar.org/*` still goes to
  `stellar-raven-codemode`.
- The challenge is public verification content, not a credential. Do not replace it with another
  submission's challenge without checking the saved portal connection.
- Keep this directory outside the `stellar-raven/` plugin ZIP.
- [The work queue](../../../.agents/TODO.md) says when to remove this Worker.

## Deploy

Use Node 24.22 or later in the Node 24 line.

```sh
npm ci --ignore-scripts
cf deploy          # with an SDF Cloudflare credential, from this directory
```

Never copy the credential into a file or a command argument. After a deploy, check the challenge
response and the shared Raven deployment independently. The
[verification notes](../VERIFICATION.md) record the first deployment (version
`27edfddf-6649-44a3-b8c2-177010eb2cfe`, route `8376ade148734b419cb2ba89c012441d`) and both checks.

## Local validation

`npm ci --ignore-scripts`, `npm run typecheck`, `npm run build`, and `npm audit`. The last
recorded run (2026-11-06, Node 24.22.0, after a toolchain refresh) passed with zero audit
findings; it deployed nothing and says nothing about the current portal or route state. The
compiled Worker contains only the fixed-response handler.
