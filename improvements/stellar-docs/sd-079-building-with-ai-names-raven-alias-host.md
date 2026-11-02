---
id: sd-079
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Building with AI page and the For agents card name raven.stellar.buzz; the canonical Raven host is raven.stellar.org"
evidence:
  - "2026-11-02T21:37:18Z stellar/stellar-docs main 85d2d1b8e7a4451b7a6af0931f587ce73109b816 docs/build/building-with-ai.mdx has raven.stellar.buzz on lines 10, 25, 31, 37, 45, 53, 64, 75, and 91, for example line 37 'claude mcp add --transport http stellar-raven \"https://raven.stellar.buzz/mcp\"'."
  - "Same commit for-agents.js line 8: 'var RAVEN_MCP_URL = \"https://raven.stellar.buzz/mcp\";' and line 92: '{ label: \"Try in chat\", href: \"https://raven.stellar.buzz/playground\" }'. The card renders on every docs page; the live anchor-tools page shows 'claude mcp add --transport http stellar-raven \"https://raven.stellar.buzz/mcp\"'."
  - "Same commit docs/tools/cli/agent-cli/reference/architecture.mdx line 141: 'Hosted Model Context Protocol endpoint (`[https://raven.stellar.buzz/mcp](https://raven.stellar.buzz/mcp)`)'."
  - "2026-11-02 GET https://developers.stellar.org/docs/build/building-with-ai.md returned HTTP 200 with the same raven.stellar.buzz lines."
  - "2026-11-02 GET https://developers.stellar.org/llms.txt (55,711 bytes) has no Raven host. That sub-claim of the HackMeridian item does not reproduce. llms-full.txt (5,849,346 bytes) has 10 raven.stellar.buzz and 2 raven.stellar.org mentions; it is generated from the pages above. Its line 117160 (meeting notes) says 'Go to **raven.stellar.org**'."
  - "Canonical host: the Raven README (stellar-experimental/stellar-raven) gives 'Add `https://raven.stellar.org/mcp`'. 2026-11-02 GET https://raven.stellar.org/.well-known/oauth-authorization-server issuer https://raven.stellar.org; the same path on raven.stellar.buzz returns issuer https://raven.stellar.buzz. Both /health return 200. Each host has its own OAuth issuer, so a client configured on the alias holds a different authorization."
  - "Dedupe 2026-11-02: gh search issues and prs on stellar/stellar-docs for raven and raven.stellar.org found only closed #2832 ('Add MCP server card and AI catalog for agent discovery'); no open report of the host."
  - ".agents/TODO.md 'File the HackMeridian upstream findings', stellar-docs bullet ('Building with AI' and llms.txt)."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/3019
---

## Finding

The "Building with AI" page tells readers to connect Raven at `https://raven.stellar.buzz/mcp`.
The "For agents" card on every docs page (`for-agents.js`) uses the same URL and links the playground on that host.
The agent CLI architecture page also names it.

The canonical Raven host is `https://raven.stellar.org`.
The Raven README uses it, and the docs meeting notes say "Go to raven.stellar.org".
`raven.stellar.buzz` still answers, but it is an alias with its own OAuth issuer.
A client set up from the docs authorizes against the alias, not the canonical host.

`llms.txt` does not name a Raven host, so it needs no change.

## Evidence

On `main` at `85d2d1b8`, `docs/build/building-with-ai.mdx` names `raven.stellar.buzz` on 9 lines.
`for-agents.js` line 8 sets `RAVEN_MCP_URL` to the alias.
The OAuth metadata on each host returns its own `issuer`.

## Recommendation

Replace `raven.stellar.buzz` with `raven.stellar.org` in `docs/build/building-with-ai.mdx`, `for-agents.js`, and `docs/tools/cli/agent-cli/reference/architecture.mdx`.
Keep the paths `/mcp` and `/playground` unchanged.
