# Third-party notices

This repository is licensed under [Apache-2.0](./LICENSE). The third-party content below keeps
its own license.

## Ecosystem skills — served, not stored

Raven forwards skill content. It does not store it. The repository shows this in three ways.

**1. The repository stores no skill body.** Ecosystem skill bodies are the `SKILL.md` playbooks
and their companion files. They are not committed here, and the Worker bundle does not contain
them. The repository commits an address for each file:

- `ecosystem-skills/MANIFEST.json` records the upstream repository and a full commit SHA for each
  source. It records a path and a git blob hash for each file.
- `catalog/manifest.json` also records a SHA-256 for each file.

Raven is never the source of record for this content. A durable mirror is out of scope by
decision. This applies to an R2 bucket, a committed copy, and a bundled copy.

**2. Caches are transport, not a store.** For a read, the Worker fetches the file from
`raw.githubusercontent.com` at the pinned commit. It verifies the file against both recorded
digests and returns it. Three caches hold copies in transit: a colo edge cache, an in-isolate
memo, and a gitignored build cache. They prevent a new fetch of the same bytes for each request.
Upstream remains the source.

**3. Responses carry upstream content and provenance.** Whole-skill reads preserve upstream YAML
frontmatter. Companion-file reads include any upstream YAML frontmatter. Heading-section reads
return only the requested `##` section. The top-level `url` names the pinned main `SKILL.md`. Each
returned section names its exact pinned source in its own `url`. Whether the forwarded metadata and
source URLs satisfy each upstream license is an open question for counsel.

At read time, `scrubNonExposedRefs` (`src/skills/scrub.ts`) removes model-facing references that
are not in Raven's manifest. One pass removes references to retired skills. A second pass removes
complete Markdown sections, rows, or list items that name excluded Scout operations.

| Source | Upstream | License |
| --- | --- | --- |
| `lumenloop` | [lumenloop/lumenloop-skills](https://github.com/lumenloop/lumenloop-skills) | MIT (© 2026 LumenLoop) |
| `openzeppelin-stellar` | [OpenZeppelin/openzeppelin-skills](https://github.com/OpenZeppelin/openzeppelin-skills) | AGPL-3.0-only (© 2026 Zeppelin Group Ltd) |
| `stellar-dev` | [stellar/stellar-dev-skill](https://github.com/stellar/stellar-dev-skill) | Apache-2.0 (SDF) |
| `stellar-light` | [Stellar-Light/stellar-scout](https://github.com/Stellar-Light/stellar-scout) | MIT |
| `trustless-work` | [Trustless-Work/trustlesswork-skill](https://github.com/Trustless-Work/trustlesswork-skill) | Apache-2.0 (Trustless Work) |

`MANIFEST.json` records the names of each source's `LICENSE` and `NOTICE` files (`license_files`)
at the same pinned commit. This record shows that every upstream source has a license. Raven does
not fetch, copy, or serve those files.

The repository commits two derived facts about each skill, because routing needs them:

- The one-line `description` from the skill's YAML frontmatter. `search` scores it.
- The `##` section headings. `skill.read` uses them to address parts of a body.

The repository does not commit section prose, body excerpts, or keyword lists derived from a
body. `test/skill-content-not-vendored.test.ts` guards this rule.

## Vendored code: `src/catalog/vendor/`

`normalize.ts`, `search-scoring.ts`, and `json-schema-types.ts` are copies from
[`@cloudflare/codemode`](https://www.npmjs.com/package/@cloudflare/codemode) **v0.4.2**. Each file
header documents its adaptations. Version 0.4.2 is the snapshot that the copies came from. It is
not the version that the Worker depends on; `package.json` pins that version separately. The
package uses the MIT license:

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

## Fonts

The public site embeds the IBM Plex Serif, IBM Plex Sans, and IBM Plex Mono fonts as base64 WOFF2
data in `src/fonts.ts`. `scripts/gen-og.mjs` also uses these fonts to render `/og.png` (`src/og.ts`).
The fonts are © IBM Corp. and are licensed under the
[SIL Open Font License 1.1](https://openfontlicense.org/open-font-license-official-text/).
`scripts/gen-site-fonts.mjs` fetches them from Google Fonts.

## Other snapshot data

- `ecosystem-skills/catalog.json` — a factual snapshot of the public
  [stellarlight.xyz/api/skills](https://stellarlight.xyz/api/skills) ecosystem directory.
- `inventory/*.json` — interface metadata that the upstream services publish for consumption:
  operation names, descriptions, and schemas. `scripts/refresh-inventory.mjs` regenerates it.
  Partner-tier LumenLoop items are name-only stubs. Partner-tier detail is never committed to this
  repository.
- `eval/corpus/` — project-authored corpora from this project's retired prior-art repositories.
  They include questions adapted from reviewed external collections. See
  [`eval/corpus/PROVENANCE.md`](./eval/corpus/PROVENANCE.md).
- `assets/repo/banner.png` — the README banner image.
