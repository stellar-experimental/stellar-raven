# Security policy

This repository backs a live, internet-facing service: the Stellar Raven MCP gateway at
`raven.stellar.org`, with `raven.stellar.buzz` / `agents.stellar.buzz` as aliases (a Cloudflare
Worker acting as an OAuth authorization server and a sandboxed-code executor). Security reports
are very welcome.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

- Preferred: GitHub **private vulnerability reporting** on this repository
  (Security tab → "Report a vulnerability").
- Alternatively: email **tyler@stellar.org** with a description, reproduction steps, and the
  impact you believe it has.

You can expect an acknowledgement within a few business days. Please give us a reasonable
window to remediate before any public disclosure.

## Scope

- This repository's source and generated artifacts.
- The deployed gateway at `raven.stellar.org` and its `raven.stellar.buzz` /
  `agents.stellar.buzz` aliases (auth flows, the
  `search`/`execute` MCP surface, the `/playground` browser surface and its login/chat routes,
  sandbox isolation/egress).

Out of scope: the upstream services the gateway aggregates (Lumenloop, Stellar Light/Scout,
Stellar Docs) — report those to their respective owners; vulnerabilities requiring a
compromised maintainer machine; volumetric denial of service.

## Notes for researchers

- Model-authored code runs in a Dynamic Worker isolate with **no network egress**
  (`globalOutbound: null`); all service traffic goes through host-side adapters that hold the
  secrets. Sandbox-escape or egress findings are the most valuable class of report here.
- Auth design (WorkOS OAuth + named API-key gate) is documented in `ARCHITECTURE.md` and
  `research/auth-workos.md`; `README.md` links to those operational details. The design does not
  depend on secrecy, and reports that only restate documented behavior (e.g. that a key bypass
  exists) are not vulnerabilities.
