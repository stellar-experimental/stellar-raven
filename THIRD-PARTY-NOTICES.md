# Third-party notices

This repository is licensed under [Apache-2.0](./LICENSE) (see `LICENSE`), **except** the
third-party content noted below.

## Ecosystem skills — served, not stored

**Position (owner decision, 2026-07-30): Raven forwards skill content, it does not store it.**
That is the line this design holds, and it is verifiable from this repository:

**1. Nothing is stored.** Ecosystem skill bodies (`SKILL.md` playbooks and their companion files)
are not committed to this repository and are not shipped inside the Worker bundle. What is
committed is an address: `ecosystem-skills/MANIFEST.json` records, per source, the upstream
repository and a full commit SHA, and per file a path and git blob hash; `catalog/manifest.json`
additionally records a SHA-256 per file. Raven is never the source of record for this content and
must not become one — durable mirrors of it (an R2 bucket, a committed copy, a bundled copy) are
out of scope by decision, not by oversight.

**2. What exists while serving is transport, not a store.** A request causes the Worker to fetch
the file from `raw.githubusercontent.com` at the pinned commit, verify it against both recorded
digests, and return it. A colo edge cache, an in-isolate memo, and a gitignored build cache hold
copies in flight so the same bytes are not refetched per request. They are caches on a forwarding
path; upstream remains the source.

**3. Responses carry the content and nothing else.** `skill.read` returns the markdown body, with
the transformations described below. Every response's `url` field names the exact upstream file at
its pinned commit, so a caller can always reach the source and its license. Whether that pointer is
the right notice mechanism for each upstream license is an open question under review; it is not a
settled compliance position.

For completeness, what the service does to the text it forwards: whole reads strip the YAML
frontmatter, section reads return the requested part rather than the whole file, and
`scrubRetiredSkillRefs` removes markdown list items that reference non-exposed skills — currently
7 LumenLoop files and 1 Stellar Light file, and **no OpenZeppelin file**.

| Source | Upstream | License |
| --- | --- | --- |
| `lumenloop` | [lumenloop/lumenloop-skills](https://github.com/lumenloop/lumenloop-skills) | MIT (© 2026 LumenLoop) |
| `openzeppelin-stellar` | [OpenZeppelin/openzeppelin-skills](https://github.com/OpenZeppelin/openzeppelin-skills) | AGPL-3.0-only (© 2026 Zeppelin Group Ltd) |
| `stellar-dev` | [stellar/stellar-dev-skill](https://github.com/stellar/stellar-dev-skill) | Apache-2.0 (SDF) |
| `stellar-light` | [Stellar-Light/stellar-scout](https://github.com/Stellar-Light/stellar-scout) | MIT |

Each source's own `LICENSE`/`NOTICE` file names are recorded in `MANIFEST.json`
(`license_files`) at the same pinned commit, as provenance that every upstream is licensed —
those files are not fetched, copied, or served.

Two derived facts about a skill ARE committed, because routing needs them: the one-line
`description` from a skill's YAML frontmatter (what `search` scores) and its `##` section headings
(how `skill.read` addresses parts of a body). Section prose, body excerpts, and body-derived
keyword bags are not committed — `test/skill-content-not-vendored.test.ts` is the standing guard
on that line.

## Vendored code: `src/catalog/vendor/`

`normalize.ts`, `search-scoring.ts`, and `json-schema-types.ts` are vendored (with documented
adaptations — see each file's header) from
[`@cloudflare/codemode`](https://www.npmjs.com/package/@cloudflare/codemode) **v0.4.2** — the
frozen snapshot the copies were taken from, not the version the Worker depends on (`package.json`
pins that separately). It is distributed under the MIT license:

> MIT License Copyright (c) 2025 Cloudflare, Inc.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software
> and associated documentation files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
> BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
> DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Other snapshot data

- `ecosystem-skills/catalog.json` — a factual snapshot of the public
  [stellarlight.xyz/api/skills](https://stellarlight.xyz/api/skills) ecosystem directory.
- `inventory/*.json` — interface metadata (operation names, descriptions, schemas) published by
  the upstream services themselves for consumption; regenerated by
  `scripts/refresh-inventory.mjs`. Partner-tier LumenLoop items are persisted as name-only stubs;
  partner-tier detail is never committed to this repository.
- `eval/corpus/` — self-authored corpora vendored from this project's own retired prior-art
  repos; provenance in `eval/corpus/PROVENANCE.md`.
- `public/*.png` — AI-generated images; provenance documented in `public/README.md`.
