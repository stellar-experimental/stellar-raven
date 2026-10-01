# Security policy

This repository runs a live public service: the Stellar Raven MCP gateway at `raven.stellar.org`.
The gateway is a Cloudflare Worker. It is an OAuth authorization server, and it runs model-written
code in a sandbox. We welcome security reports.

## Report a vulnerability

**Do not open a public issue for a security problem.**

- Use GitHub **private vulnerability reporting** on this repository (Security tab, then "Report a
  vulnerability"). This is the preferred channel.
- Or send an email to **frontier@stellar.org**. Include a description, the steps to reproduce,
  and the impact that you expect.

We acknowledge a report within a few business days. Give us a reasonable time to fix the problem
before you disclose it publicly.

For other problems, such as connection problems, catalog questions, or general support, use the
**#raven** channel in the [Stellar Developers Discord](https://discord.gg/stellardev). Do not post
a vulnerability there.

## Scope

In scope:

- The source code and generated artifacts in this repository.
- The gateway at `raven.stellar.org`, and any retired hostname that still routes to it. This
  includes the authentication flows, the `search` and `execute` MCP tools, the `/playground` page
  with its login and chat routes, and sandbox isolation and egress.

Out of scope:

- The upstream services that the gateway uses: Lumenloop, Stellar Light/Scout, and Stellar Docs.
  Report those problems to their owners.
- Attacks that need a compromised maintainer machine.
- Volumetric denial of service.

## Notes for researchers

- Model-written code runs in a Dynamic Worker isolate with **no network egress**
  (`globalOutbound: null`). Host-side adapters make all service calls and hold the secrets.
  Sandbox-escape and egress findings are the most valuable reports.
- [ARCHITECTURE.md](ARCHITECTURE.md) documents the authentication design: WorkOS OAuth, named API
  keys, and a development bypass. The bypass works only on loopback hosts. The design does not
  depend on secrecy. A report that only restates documented behavior is not a vulnerability. An
  example is a report that named API keys or the loopback-only bypass exist.
