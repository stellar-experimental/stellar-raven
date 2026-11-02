---
id: sd-074
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Scaffold Stellar page documents environments.toml; the current CLI uses scaffold.yml
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/tools/scaffold-stellar returned HTTP 200 with "Explore the environments.toml file to customize your development environment(s)"; the page has no "scaffold.yml" text
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/tools/scaffold-stellar.mdx lines 80, 95, and 115; docs/build/smart-contracts/getting-started/hello-world-frontend.mdx line 168 also names environments.toml
  - stellar-scaffold/cli main 92865100a50288d86552fcf30b6cd275f6f90c07 crates/stellar-scaffold-cli/src/config/mod.rs lines 15-17 "Projects still configured by the deprecated environments.toml are recognized by that file alone"; src/config/source.rs line 36 CONFIG_FILE "scaffold.yml"
  - stellar-scaffold-cli v0.0.31 release (2026-10-21) "config-driven builds with per-checkout deployment state"; v0.0.32 (2026-10-23) "scaffold.yml v2 fast-follows for the 1.0 preview"; latest v0.0.34 (2026-10-25)
  - golden case q-ti-scaffold-stellar (golden audit pass 2, 2026-11-02)
---

## Finding

The Scaffold Stellar page tells readers to configure projects with `environments.toml`. The
current Scaffold CLI uses `scaffold.yml` (schema version 2). The CLI source calls
`environments.toml` deprecated.

The page shows `environments.toml` in the project tree and in the feature list. The Hello World
frontend tutorial repeats the old file name.

A reader of a new project can look for a file that the current `init` does not create.

This is a `docs-content` finding.

## Evidence

The live page says: "Explore the `environments.toml` file to customize your development
environment(s) that's set by your `.env` file." Its project tree lists
`environments.toml   # Configuration per environment (dev/test/prod)`.

In the current CLI source, `config/source.rs` sets `CONFIG_FILE` to `scaffold.yml`. The module
comment in `config/mod.rs` says: "Projects still configured by the deprecated `environments.toml`
are recognized by that file alone". The CLI releases v0.0.31 and v0.0.32 (October 2026) moved to
config-driven builds and `scaffold.yml` v2.

## Recommendation

Replace `environments.toml` with `scaffold.yml` on the Scaffold Stellar page and in the Hello
World frontend tutorial. State the minimum CLI version for `scaffold.yml`. Add one sentence that
older projects with `environments.toml` still build.

Optional: link the CLI changelog migration notes.
