# OpenAI domain verification

This separate Worker serves Raven's OpenAI domain challenge.
It does not contain Raven's MCP server or its secrets.
Its only route is `raven.stellar.org/.well-known/openai-apps-challenge` on the `stellar.buzz` zone.
The route takes precedence only at that exact path.
The existing `raven.stellar.org/*` route continues to use `stellar-raven-codemode`.

The challenge is public verification content, not an authentication credential.
Do not replace it with another submission's challenge without checking the saved portal connection.
Keep this directory outside the `stellar-raven/` plugin ZIP.

Use Node 24.22 or later within the Node 24 release line for this package.
Use an SDF Cloudflare credential with `cf deploy` from this directory.
Use `npm ci --ignore-scripts` to install the pinned build dependencies first.
The initial deployment used the repository's existing Wrangler `sdf` credential host-side.
It did not copy the credential into files or command arguments.

The initial version is `27edfddf-6649-44a3-b8c2-177010eb2cfe`.
The initial route ID is `8376ade148734b419cb2ba89c012441d`.
After deployment, check the challenge response and the shared Raven deployment independently.
The [verification notes](../VERIFICATION.md) record both checks.

## Local validation and toolchain maintenance

On November 6, 2026, the development toolchain was refreshed to resolve its dependency audit
findings. With Node 24.22.0, `npm ci --ignore-scripts`, `npm run typecheck`, and `npm run build`
passed; `npm audit` reported zero vulnerabilities. The compiled Worker contains only the
fixed-response handler. This validation did not deploy or establish current portal or route state.
