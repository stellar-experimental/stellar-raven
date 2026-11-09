# Skills author lane — 2026-11-09

14 findings checked: **13 still-repro; sk-039 fixed (retirement candidate)**. The author changed only the 14 existing skills finding files: thirteen dated recurrences and one fixed-upstream status/evidence update. No successor needed, no resolution/deletion/index regeneration, no upstream comments, and no paid or side-effecting call. Distinct reviewer and coordinator cleanup remain outstanding.

## State table

| Finding | Ref state | Live trigger result | Verdict | Proposed action |
|---|---|---|---|---|
| sk-004 | [lumenloop/lumenloop-skills/issues/1](https://github.com/lumenloop/lumenloop-skills/issues/1) open | AV summaries still advertised as verbatim quotes | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-005 | [lumenloop/lumenloop-skills/issues/2](https://github.com/lumenloop/lumenloop-skills/issues/2) open | Audience/transport metadata still absent | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-007 | [lumenloop/lumenloop-skills/issues/3](https://github.com/lumenloop/lumenloop-skills/issues/3) open | Digest still freezes June 8 recency bounds | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-014 | [OpenZeppelin/openzeppelin-skills/issues/13](https://github.com/OpenZeppelin/openzeppelin-skills/issues/13) open | Stellar component triggers and audit exclusion remain absent | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-015 | [OpenZeppelin/openzeppelin-skills/issues/14](https://github.com/OpenZeppelin/openzeppelin-skills/issues/14) open | Generic setup and native-upgrade trigger clauses persist | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-019 | [Stellar-Light/stellar-scout/issues/13](https://github.com/Stellar-Light/stellar-scout/issues/13) open | Default Scout guidance still encourages feedback submission | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-022 | [OpenZeppelin/openzeppelin-skills/issues/14](https://github.com/OpenZeppelin/openzeppelin-skills/issues/14) open; [OpenZeppelin/openzeppelin-skills/issues/16](https://github.com/OpenZeppelin/openzeppelin-skills/issues/16) open | Upgrade skill still recommends retired derives/Internal traits | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-025 | [Trustless-Work/trustlesswork-skill/issues/6](https://github.com/Trustless-Work/trustlesswork-skill/issues/6) open | Beta host authentication documentation still conflicts | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-027 | [Stellar-Light/stellar-scout/issues/14](https://github.com/Stellar-Light/stellar-scout/issues/14) open | Scout catalog guidance remains stale across four files | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-028 | [Stellar-Light/stellar-scout/issues/15](https://github.com/Stellar-Light/stellar-scout/issues/15) open | Fixed Scout builder counts remain wrong: live407 | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-029 | [Trustless-Work/trustlesswork-skill/issues/20](https://github.com/Trustless-Work/trustlesswork-skill/issues/20) open | All four original ungrouped error links remain404 | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-030 | [lumenloop/lumenloop-skills/issues/6](https://github.com/lumenloop/lumenloop-skills/issues/6) open | Eight Freighter prose lines across six skills persist | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-031 | [stellar/stellar-dev-skill/issues/172](https://github.com/stellar/stellar-dev-skill/issues/172) open | Deleted soroban skill remains published unchanged | still-repro | Retain reported-upstream; dated local recurrence; no routine upstream comment |
| sk-039 | [stellar/stellar-dev-skill/pull/181](https://github.com/stellar/stellar-dev-skill/pull/181) merged; [stellar-experimental/stellar-raven/issues/388](https://github.com/stellar-experimental/stellar-raven/issues/388) closed/completed; [stellar/stellar-dev-skill/issues/180](https://github.com/stellar/stellar-dev-skill/issues/180) closed/completed | Ordinary Docs copy now fixed; retirement candidate | fixed | Set fixed-upstream; independent retirement review, then reconcile references and resolver |

## Reproduction and evidence capture

All times below are UTC on 2026-11-09. Direct raw/public GET batch ran at20:30:57–20:30:59 via `hc run --bg --name skills-live --cwd /private/tmp/claude-501/raven-wt/impr python3 tmp/skills-evidence/live.py` (terminal t3bw, exit0). The script uses `urllib.request.urlopen` with GET, follows ordinary redirects, and saves exact bytes plus status/final URL/SHA-256/git blob. `tmp/skills-evidence/live.json` records exact request-start stamps; no cache-busting query was used for Docs. Each source URL below can also be reproduced with `curl -sS -L <URL>`.

GitHub reads ran via `python3 tmp/skills-evidence/fetch.py`: for every ref the exact commands are `gh api repos/<owner>/<repo>/issues/<N> --jq .` (or `pulls/<N>`) and `gh api repos/<owner>/<repo>/issues/<N>/comments --jq .`; PR181 also received `pulls/181/reviews` and `pulls/181/comments`. The complete byte-preserving JSON bodies are under `tmp/skills-evidence/*__state.json` and `*__comments.json`; `refs.json` records check times. No MCP-transformed text was used to decide exact prose.

Additional direct reads ran via `hc run --bg --name skills-extras --cwd /private/tmp/claude-501/raven-wt/impr python3 tmp/skills-evidence/extras.py` (t3c1, exit0), including `gh api repos/<repo>/commits/main --jq '{sha:.sha,date:.commit.committer.date,message:.commit.message}'`, deleted PR18, historical issue16 comments, PR181 checks/reviews, and SEP-41 at the repository's **master** branch. The initial speculative main SEP path404 was corrected to master200 and is not a source defect.

Current source heads:

| Repo | Main commit | Commit date |
|---|---|---|
| OpenZeppelin/openzeppelin-skills | `584262af9eed516bdb1d2d897246502218e3917a` | 2026-10-26T15:36:01Z |
| OpenZeppelin/stellar-contracts | `c98fb34192a83b4bbe6901ad20449a491383c450` | 2026-11-09T11:54:00Z |
| Stellar-Light/stellar-scout | `0f3040cf41bc9a120148f11c37c4f60f3cf8ae39` | 2026-11-07T02:28:08Z |
| Stellar-Light/stellarlight | `a593b59d6b3213f6510bf5d31cea21792cb57b62` | 2026-11-09T19:08:49Z |
| Trustless-Work/trustlesswork-sdk-js | `f95b5b1ae8c6eda1874420478bde3640c48bfd3d` | 2026-09-28T21:27:07Z |
| Trustless-Work/trustlesswork-skill | `80e2467f34041b9f70e66d6c2f567fc76ba9b1bb` | 2026-09-27T01:44:59Z |
| lumenloop/lumenloop-skills | `a87ca95730d2a4015c884defebd66b44ea01d3b2` | 2026-10-12T15:01:38Z |
| stellar/stellar-dev-skill | `fb63412da70102edb527baf4cf3068f25713cd14` | 2026-11-06T18:41:19Z |

## sk-004 — still-repro

Fresh read-only passage query returns three rows with summary/long_summary and offsets, no transcript text. Source dossier:51,151-160 and digest:240-241 still promise direct/verbatim quotes. Adjacent integration-finder:99, content-auditor:77 and ecosystem-scout:136-137 also recommend this operation for direct quotes. This expands the same defect to five playbooks; it is not a separate successor or a newly fixed portion.

- Direct ref read 2026-11-09T20:30:25.991751+00:00: https://github.com/lumenloop/lumenloop-skills/issues/1, **open**, author `kalepail`, last updated 2026-07-07T21:22:12Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

Fresh authenticated read-only query: `node --env-file=.env tmp/skills-evidence/ll-probe.mjs` at 2026-11-09T20:31:29.209Z; POST https://api.lumenloop.com/v1/tools/find_av_passages with `{"query":"passkeys smart wallets on Soroban","limit":3}`; HTTP200, success true, three rows. All rows have keys `av_id,title,url,channel,summary,long_summary,slug,created_at,start_offset,similarity`. No transcript/verbatim/chunk-text field. Response saved in `tmp/skills-evidence/ll-probe.json`; headers/key are never saved.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-project-dossier/SKILL.md | 2026-11-09T20:30:57.271008+00:00 | HTTP200 / 10719 bytes | `8bcbb1b3c1d551990a32c508181070fae699229b11ca2ad39777441b97e71040` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-digest/SKILL.md | 2026-11-09T20:30:57.271477+00:00 | HTTP200 / 10869 bytes | `99c0d4a751a014b710c2885e4b2b1a1aa19aaddf281519f971766cec99c3d8da` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-integration-finder/SKILL.md | 2026-11-09T20:30:57.271593+00:00 | HTTP200 / 10436 bytes | `6af265802089a6126958cb6cc7a04ad79394f6b3c4978fea5937cc49843e44b0` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-content-auditor/SKILL.md | 2026-11-09T20:30:57.272045+00:00 | HTTP200 / 6538 bytes | `53cea348ce785cec09ebe1782c3fb2881fc9a5d475302d74808f5912f7fa4375` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-scout/SKILL.md | 2026-11-09T20:30:57.271893+00:00 | HTTP200 / 10702 bytes | `96830eed43e8985f6410893c46410aa9542e7fdc88d4e12cfa8df1980a8380cf` |

## sk-005 — still-repro

The dossier frontmatter has only name, description, user-invocable. Adjacent checks of all seven playbooks and lumenloop-mcp-connect find no audience or transport marker. The connector description remains transport onboarding while playbooks use bare tool names.

- Direct ref read 2026-11-09T20:30:25.991934+00:00: https://github.com/lumenloop/lumenloop-skills/issues/2, **open**, author `kalepail`, last updated 2026-07-09T23:45:06Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-project-dossier/SKILL.md | 2026-11-09T20:30:57.271008+00:00 | HTTP200 / 10719 bytes | `8bcbb1b3c1d551990a32c508181070fae699229b11ca2ad39777441b97e71040` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/lumenloop-mcp-connect/SKILL.md | 2026-11-09T20:30:57.271808+00:00 | HTTP200 / 10145 bytes | `5bc1969b27993fd5889194f31152b0c43e00158f87c1029039ecd0890048be59` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-digest/SKILL.md | 2026-11-09T20:30:57.271477+00:00 | HTTP200 / 10869 bytes | `99c0d4a751a014b710c2885e4b2b1a1aa19aaddf281519f971766cec99c3d8da` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-integration-finder/SKILL.md | 2026-11-09T20:30:57.271593+00:00 | HTTP200 / 10436 bytes | `6af265802089a6126958cb6cc7a04ad79394f6b3c4978fea5937cc49843e44b0` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-builder-quickstart/SKILL.md | 2026-11-09T20:30:57.271697+00:00 | HTTP200 / 10833 bytes | `b5ab7b8010c03cea3ce24e22e2db708f7890b6d90b0e55d5589ffbc9712404f3` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-scout/SKILL.md | 2026-11-09T20:30:57.271893+00:00 | HTTP200 / 10702 bytes | `96830eed43e8985f6410893c46410aa9542e7fdc88d4e12cfa8df1980a8380cf` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/scf-submission-radar/SKILL.md | 2026-11-09T20:30:57.271969+00:00 | HTTP200 / 8516 bytes | `324eddf083cce670fd69eae75584c599d2f9571585c77715d40e4d75a63f0db8` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-content-auditor/SKILL.md | 2026-11-09T20:30:57.272045+00:00 | HTTP200 / 6538 bytes | `53cea348ce785cec09ebe1782c3fb2881fc9a5d475302d74808f5912f7fa4375` |

## sk-007 — still-repro

Digest:186 still reads Today is 2026-06-08. Query bounds at105,133,152,193,197,199,201 and output header217 still use that date. The worked example and earlier query examples share the defect; no substitute-current-date or frozen-example convention was added.

- Direct ref read 2026-11-09T20:30:25.992049+00:00: https://github.com/lumenloop/lumenloop-skills/issues/3, **open**, author `kalepail`, last updated 2026-07-09T23:45:08Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-digest/SKILL.md | 2026-11-09T20:30:57.271477+00:00 | HTTP200 / 10869 bytes | `99c0d4a751a014b710c2885e4b2b1a1aa19aaddf281519f971766cec99c3d8da` |

## sk-014 — still-repro

develop-secure-contracts description:3 still lists ERC20/ERC721/ERC1155, Ownable/AccessControl/AccessManager, Pausable/ReentrancyGuard and generic governance/accounts. It names supported chains and library-first integration but no explicit audit/security-review exclusion or Stellar component triggers. Its body names stellar-fungible:173; the companion setup body lists stellar-tokens, stellar-access, stellar-contract-utils and other Stellar crates. Generic library-first wording predates this sweep and does not fulfill both requested changes. No fresh routing-failure or security-audit claim is made.

- Direct ref read 2026-11-09T20:30:25.996248+00:00: https://github.com/OpenZeppelin/openzeppelin-skills/issues/13, **open**, author `kalepail`, last updated 2026-08-11T17:30:42Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/develop-secure-contracts/SKILL.md | 2026-11-09T20:30:57.433024+00:00 | HTTP200 / 14509 bytes | `f9b1b31e6da1e54d2f40159982b8d80198b9aa505b5ec3427677e8727b95ce28` |
| https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/setup-stellar-contracts/SKILL.md | 2026-11-09T20:30:57.435840+00:00 | HTTP200 / 3616 bytes | `86ab688baf8d47e06945c13a956fd2d4a4d8ca92474b1767d053fca575c0eb44` |

## sk-015 — still-repro

setup description items1-2 still claim CLI/Rust installation and new Soroban project creation; upgrade item1 still claims native WASM replacement. The OpenZeppelin-prefixed introductions have not qualified those generic trigger clauses. Adjacent body and setup dependency list remain OpenZeppelin-specific. No fresh routing score is inferred from source text.

- Direct ref read 2026-11-09T20:30:25.996330+00:00: https://github.com/OpenZeppelin/openzeppelin-skills/issues/14, **open**, author `kalepail`, last updated 2026-08-11T17:30:44Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/setup-stellar-contracts/SKILL.md | 2026-11-09T20:30:57.435840+00:00 | HTTP200 / 3616 bytes | `86ab688baf8d47e06945c13a956fd2d4a4d8ca92474b1767d053fca575c0eb44` |
| https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/upgrade-stellar-contracts/SKILL.md | 2026-11-09T20:30:57.440012+00:00 | HTTP200 / 8385 bytes | `80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71` |

## sk-019 — still-repro

SKILL:254 retains feedback POST in its endpoint table. api-reference:268-293 documents the write and explicitly encourages it;380-381 retains GET schema guidance. Canonical public/skills/stellar-scout.md and public/skills/references/api-reference.md match the distribution copies byte-for-byte. Raven filtering is a consumer workaround, not an upstream fix. No feedback read or write was called.

- Direct ref read 2026-11-09T20:30:25.996399+00:00: https://github.com/Stellar-Light/stellar-scout/issues/13, **open**, author `kalepail`, last updated 2026-08-19T20:36:48Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/SKILL.md | 2026-11-09T20:30:57.443457+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/references/api-reference.md | 2026-11-09T20:30:57.448674+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/stellar-scout.md | 2026-11-09T20:30:57.452650+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/references/api-reference.md | 2026-11-09T20:30:57.592114+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |

## sk-022 — still-repro

Description:3, module table41-44, examples48-60, access control104, version metadata132 and checklist145 still teach the retired APIs. Current upgradeable Docs explicitly say implement the trait directly with #[contractimpl] and contain Why There Is No Migratable Trait. Current stellar-contracts macros/lib.rs exposes attribute macros, no upgrade derives; upgradeable/mod.rs defines the current trait. These direct source reads reproduce the API mismatch without treating the prior compile transcript as a fresh run. Adjacent Upgrader example still exists; the same obsolete claim spans access control and metadata.

- Direct ref read 2026-11-09T20:30:25.996330+00:00: https://github.com/OpenZeppelin/openzeppelin-skills/issues/14, **open**, author `kalepail`, last updated 2026-08-11T17:30:44Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.
- Direct ref read 2026-11-09T20:30:26.776397+00:00: https://github.com/OpenZeppelin/openzeppelin-skills/issues/16, **open**, author `kalepail`, last updated 2026-09-09T03:35:50Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-skills/main/skills/upgrade-stellar-contracts/SKILL.md | 2026-11-09T20:30:57.440012+00:00 | HTTP200 / 8385 bytes | `80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71` |
| https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable | 2026-11-09T20:30:58.432449+00:00 | HTTP200 / 326708 bytes | `46930fc2139b82e942179b2744c08e30d93870a646743b8411796dfe2fc718e5` |
| https://raw.githubusercontent.com/OpenZeppelin/stellar-contracts/main/packages/macros/src/lib.rs | 2026-11-09T20:30:57.790529+00:00 | HTTP200 / 8198 bytes | `ca05c94e063b34f7e012e7c52004a319e210c1fa3a82daa9d2906730b7a2c068` |
| https://raw.githubusercontent.com/OpenZeppelin/stellar-contracts/main/packages/contract-utils/src/upgradeable/mod.rs | 2026-11-09T20:30:57.801843+00:00 | HTTP200 / 10539 bytes | `d7187d0df93a89558ac9940f99751c3969f674ef3299a6ec9d2dee9e612884b1` |

## sk-025 — still-repro

Beta skill:3,23 names beta.api.trustlesswork.com and:30 requires x-api-key on every request, forbidding Bearer. Core API introduction names the same beta host and says every request carries either API key or wallet-session token, with Authorization: Bearer example. SDK transport:92-94 constructs Authorization from getAccessToken. Adjacent constitution:88,114 applies the API-key-only rule to both versions; V1 core-concepts retains its separate key examples. No authenticated bearer acceptance or escrow write was tested. Deleted PR18 still returns404 and provides no deployment evidence.

- Direct ref read 2026-11-09T20:30:26.785241+00:00: https://github.com/Trustless-Work/trustlesswork-skill/issues/6, **open**, author `techrebelgit`, last updated 2026-10-03T03:27:57Z.
  Comment by **kalepail** (2026-09-16T19:25:45Z): https://github.com/Trustless-Work/trustlesswork-skill/issues/6#issuecomment-5703275444 — The beta authentication guidance still conflicts with the current Core API documentation. At `634f32bd4be6769b0cae52e72db4899d5f5a069c`, `skills/api/v2/core-concepts.md` identifies `https://beta.api.trustlesswork.com`. Its authentication section requires `x-api-key` on every requ

The cited surviving correction is by `kalepail` (our own report), not a maintainer endorsement.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/main/trustless-work-dev/skills/api/v2/core-concepts.md | 2026-11-09T20:30:57.616999+00:00 | HTTP200 / 13189 bytes | `1d248819f60320c20dbf3f96fda218e24286f433676af4dbd68f4b922ae4a507` |
| https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/main/trustless-work-dev/constitution.md | 2026-11-09T20:30:57.629542+00:00 | HTTP200 / 14534 bytes | `fef3ca569af7f4b536abf801dcfeb39855cd48840b916c933710b0fd75485a83` |
| https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/main/trustless-work-dev/skills/api/core-concepts.md | 2026-11-09T20:30:57.631623+00:00 | HTTP200 / 9513 bytes | `76237e14c0a782eabec852efb2d086956acb23077508860b5953eb24301199d2` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/introduction | 2026-11-09T20:30:58.383075+00:00 | HTTP200 / 702450 bytes | `5256335a672df7291fd439667761b260fc772bfe31fd1c5efaea529c71d119ad` |
| https://raw.githubusercontent.com/Trustless-Work/trustlesswork-sdk-js/main/src/transport/http-transport.ts | 2026-11-09T20:30:57.642394+00:00 | HTTP200 / 4677 bytes | `6a9413689b53ea56e98c55b99ba558a1d54137ba850742cb0ba9e9cc425bd218` |

## sk-027 — still-repro

Fresh catalog has82 entries: sdf8,stellarlight15,lumenloop8,external12,community39. Source SKILL:14,90,240-241,312; README:64,76,78; api-reference:204,209,211 and examples:20 still repeat the stale seven-SDF/soroban/fixed-install claims. GET soroban is404; smart-contracts is200; stellar-scout detail is200 with source stellarlight and35398 characters of content (35468 UTF-8 bytes). Old soroban/anchors pages remain404. Canonical skill/reference mirrors match; publication orphan is separately owned by sk-031, not proof that the soroban API slug exists.

- Direct ref read 2026-11-09T20:30:26.787431+00:00: https://github.com/Stellar-Light/stellar-scout/issues/14, **open**, author `kalepail`, last updated 2026-09-30T20:24:54Z.
  Comment by **kalepail** (2026-09-30T20:24:54Z): https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-5919085549 — Correction to the recommendation above. A second review of commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` found more stale locations, and one part of the original fix would create a new stale list. More locations: - `SKILL.md` line 90: "(Soroban / dapp / assets / data / agenti

The cited surviving correction is by `kalepail` (our own report), not a maintainer endorsement.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/SKILL.md | 2026-11-09T20:30:57.443457+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/README.md | 2026-11-09T20:30:57.445500+00:00 | HTTP200 / 7124 bytes | `fb9513ac993261802f93d6a34c6d39c4c12f0b37e04c3f134e0bdbfc74a3269e` |
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/references/api-reference.md | 2026-11-09T20:30:57.448674+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/references/examples.md | 2026-11-09T20:30:57.450639+00:00 | HTTP200 / 14176 bytes | `cda84a40a08735e795ef52cc10465b782512b22996b3bdcae0524a5a2b995172` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/stellar-scout.md | 2026-11-09T20:30:57.452650+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/references/api-reference.md | 2026-11-09T20:30:57.592114+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |
| https://stellarlight.xyz/api/skills | 2026-11-09T20:30:57.988426+00:00 | HTTP200 / 83689 bytes | `97a6cb77fc58b72ae2ca0689dd4c032eb80c0a431bbddec924c040182ca09dea` |
| https://stellarlight.xyz/api/skills/soroban | 2026-11-09T20:30:58.070070+00:00 | HTTP404 / 88 bytes | `1f42aac207ab8e60c6a2ef12d20238650c41df4fdf2d943b0ebdb607c3e8e632` |
| https://stellarlight.xyz/api/skills/smart-contracts | 2026-11-09T20:30:58.087626+00:00 | HTTP200 / 16043 bytes | `a38ba21924475e8544b3206d32ff93d72c30fae93e64733acf89269b37851db5` |
| https://stellarlight.xyz/api/skills/stellar-scout | 2026-11-09T20:30:58.108477+00:00 | HTTP200 / 37347 bytes | `4178a4198f661c1bf5db79097228738065cb571a6edd517c3e9f842266648f37` |
| https://skills.stellar.org/soroban | 2026-11-09T20:30:58.113672+00:00 | HTTP404 / 11575 bytes | `73cb45bd51a27e9f7f94d351f29fbfa915e4616fdd22fb2b61cb04f2363b5871` |
| https://skills.stellar.org/anchors | 2026-11-09T20:30:58.249428+00:00 | HTTP404 / 11575 bytes | `73cb45bd51a27e9f7f94d351f29fbfa915e4616fdd22fb2b61cb04f2363b5871` |

## sk-028 — still-repro

SKILL:91 says currently in the dozens, not hundreds; api-reference:119 says about110. Live status builders source reports407; zero-match builders query independently gives407 in advisory.summary, with builders=[] and no failed reads. Both canonical mirrors match the stale distribution files. The live total is profiles, not matches.

- Direct ref read 2026-11-09T20:30:26.789051+00:00: https://github.com/Stellar-Light/stellar-scout/issues/15, **open**, author `kalepail`, last updated 2026-10-02T02:13:47Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/SKILL.md | 2026-11-09T20:30:57.443457+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/references/api-reference.md | 2026-11-09T20:30:57.448674+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/stellar-scout.md | 2026-11-09T20:30:57.452650+00:00 | HTTP200 / 35469 bytes | `4e53255e11720ccf2e978abc2b57c5c022c4684e11610a2d9be44879d4d4ed8a` |
| https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/public/skills/references/api-reference.md | 2026-11-09T20:30:57.592114+00:00 | HTTP200 / 76862 bytes | `c3e6310fadb15dcdf9bcddcd96f7c963b1bdb83264c492f7822d4abfcbfad076` |
| https://stellarlight.xyz/api/status | 2026-11-09T20:30:57.981086+00:00 | HTTP200 / 5409 bytes | `b307110278738107e3cd6df768ee566f8aed4eebb981a447203bca803c7132ba` |
| https://stellarlight.xyz/api/builders?q=zzzzqqq | 2026-11-09T20:30:57.986264+00:00 | HTTP200 / 4268 bytes | `a6f85044953ca9ace2f90570e7e2b1eebc5c286183e9d79df8525ac05e4af9b2` |

## sk-029 — still-repro

query-too-complex and the three stellar-tx-deploy-* ungrouped paths all return404; each grouped page returns200. Adjacent stellar-tx-failed redirects from ungrouped to grouped and ends200. Skill beta core-concepts:214 still gives errors/<code-in-kebab-case>. Historical maintainer armandocodecr issue16 comment6279830640 confirms this is the intended emitted type path and redirects own the correction. No API error-producing request was made.

- Direct ref read 2026-11-09T20:30:26.795965+00:00: https://github.com/Trustless-Work/trustlesswork-skill/issues/20, **open**, author `kalepail`, last updated 2026-10-27T01:11:01Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

Historical reference read: `gh api repos/Trustless-Work/trustlesswork-skill/issues/16/comments --jq .`. Maintainer **armandocodecr**, https://github.com/Trustless-Work/trustlesswork-skill/issues/16#issuecomment-6279830640, explains stable ungrouped problem URLs and the14 earlier redirects. **kalepail** comment6431221485 is Raven's retirement check and explicitly hands the four remaining links to issue20. This historical predecessor does not establish the four residuals fixed.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/main/trustless-work-dev/skills/api/v2/core-concepts.md | 2026-11-09T20:30:57.616999+00:00 | HTTP200 / 13189 bytes | `1d248819f60320c20dbf3f96fda218e24286f433676af4dbd68f4b922ae4a507` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/query-too-complex | 2026-11-09T20:30:58.511186+00:00 | HTTP404 / 319027 bytes | `3b31bbaa707e628c619435cc62a8576c5578a5d6548ed002e3209471aeca3a48` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/generic-http/query-too-complex | 2026-11-09T20:30:58.556769+00:00 | HTTP200 / 671458 bytes | `9151e0608000ff16885ee29a943d90976867ad1ea1118857bb9f791300c6b458` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar-tx-deploy-fee-above-ceiling | 2026-11-09T20:30:58.606290+00:00 | HTTP404 / 319063 bytes | `350cabf990503836a38533e91a9a73ca38b07e4289e20cb230b8ff003c0c341b` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar/stellar-tx-deploy-fee-above-ceiling | 2026-11-09T20:30:58.673025+00:00 | HTTP200 / 708820 bytes | `9124cbb9f398e3caa1cedd25da8ac32b863ee86ab6b04a2c14afb2497b922a5b` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar-tx-deploy-milestones-over-cap | 2026-11-09T20:30:58.812837+00:00 | HTTP404 / 319067 bytes | `041c8bf7dfca225f58af8a3c973ef972e29b4ac3ceedb2bcc223e3e33c216b3e` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar/stellar-tx-deploy-milestones-over-cap | 2026-11-09T20:30:58.910967+00:00 | HTTP200 / 707278 bytes | `1f9df82b1f1a8ed6ea498a9307398bf56179f5d7424f0ac3c0f40e4c751fbc70` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar-tx-deploy-pre-approved | 2026-11-09T20:30:58.967073+00:00 | HTTP404 / 319053 bytes | `f0072b7be4c2933ca55457cfd1a521033a92743d56b474e00f2f9573f3d11cf5` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar/stellar-tx-deploy-pre-approved | 2026-11-09T20:30:59.098462+00:00 | HTTP200 / 711286 bytes | `d56dadcc899f775f3d2df76b6b10dde3b33e5c207327ff71e96a8aa65aec0b6c` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar-tx-failed | 2026-11-09T20:30:59.160334+00:00 | HTTP200 / 707487 bytes → https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar/stellar-tx-failed | `1fb7d30df1f76ab1642ef73e544222f6a71526e0613050f79ec0b7f120f9e3b5` |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar/stellar-tx-failed | 2026-11-09T20:30:59.235400+00:00 | HTTP200 / 707487 bytes | `1fb7d30df1f76ab1642ef73e544222f6a71526e0613050f79ec0b7f120f9e3b5` |

## sk-030 — still-repro

Source scan finds dossier36, digest34, quickstart39/134, integration-finder34/149, mcp-connect39 and ecosystem-scout33 still say Freighter. All eight downloaded playbook/connector files contain zero Varial lines. Adjacent radar and content-auditor add no wallet-name locations. Fresh stellar/freighter master README starts Varial (formerly Freighter). These are prose names; no SDK failure or migration requirement is alleged.

- Direct ref read 2026-11-09T20:30:26.873122+00:00: https://github.com/lumenloop/lumenloop-skills/issues/6, **open**, author `kalepail`, last updated 2026-11-02T23:24:21Z.
  Comments API returns an empty array; no maintainer acceptance, decline, or claimed fix.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-project-dossier/SKILL.md | 2026-11-09T20:30:57.271008+00:00 | HTTP200 / 10719 bytes | `8bcbb1b3c1d551990a32c508181070fae699229b11ca2ad39777441b97e71040` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-digest/SKILL.md | 2026-11-09T20:30:57.271477+00:00 | HTTP200 / 10869 bytes | `99c0d4a751a014b710c2885e4b2b1a1aa19aaddf281519f971766cec99c3d8da` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-builder-quickstart/SKILL.md | 2026-11-09T20:30:57.271697+00:00 | HTTP200 / 10833 bytes | `b5ab7b8010c03cea3ce24e22e2db708f7890b6d90b0e55d5589ffbc9712404f3` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-integration-finder/SKILL.md | 2026-11-09T20:30:57.271593+00:00 | HTTP200 / 10436 bytes | `6af265802089a6126958cb6cc7a04ad79394f6b3c4978fea5937cc49843e44b0` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/lumenloop-mcp-connect/SKILL.md | 2026-11-09T20:30:57.271808+00:00 | HTTP200 / 10145 bytes | `5bc1969b27993fd5889194f31152b0c43e00158f87c1029039ecd0890048be59` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-ecosystem-scout/SKILL.md | 2026-11-09T20:30:57.271893+00:00 | HTTP200 / 10702 bytes | `96830eed43e8985f6410893c46410aa9542e7fdc88d4e12cfa8df1980a8380cf` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/scf-submission-radar/SKILL.md | 2026-11-09T20:30:57.271969+00:00 | HTTP200 / 8516 bytes | `324eddf083cce670fd69eae75584c599d2f9571585c77715d40e4d75a63f0db8` |
| https://raw.githubusercontent.com/lumenloop/lumenloop-skills/main/skills/stellar-content-auditor/SKILL.md | 2026-11-09T20:30:57.272045+00:00 | HTTP200 / 6538 bytes | `53cea348ce785cec09ebe1782c3fb2881fc9a5d475302d74808f5912f7fa4375` |
| https://raw.githubusercontent.com/stellar/freighter/master/README.md | 2026-11-09T20:30:57.784537+00:00 | HTTP200 / 5289 bytes | `ac2ad69cb990c8f127eee322d25b2533ffdc78beadf901916e3b2b8cf0bf8d4f` |

## sk-031 — still-repro

Ordinary legacy URL remains200/71331 bytes, git blob3c98cb8194d0921ddae7b5a9e1ed895511e968e2, with12 old-target lines and no new-target line. Current smart-contracts file has four wasm32v1-none lines and zero wasm32-unknown-unknown lines. Main source soroban file is404. Current deploy workflow:92 still has keep_files:true. Adjacent current build guidance is corrected, confirming deployment retention rather than source regression. The bot patch in issue172 is a proposal requiring a human workflow change, not a deployed fix.

- Direct ref read 2026-11-09T20:30:27.479913+00:00: https://github.com/stellar/stellar-dev-skill/issues/172, **open**, author `kalepail`, last updated 2026-11-02T23:33:10Z.
  Comment by **stellar-triage-bot[bot]** (2026-11-02T23:30:09Z): https://github.com/stellar/stellar-dev-skill/issues/172#issuecomment-6591157091 — 🤖 _Automated message from the Stellar Triage Bot._ 👀 Picked this up — a review will follow shortly. <!-- automated-triage-bot dispatch-ack item=172 --> 
  Comment by **stellar-triage-bot[bot]** (2026-11-02T23:33:10Z): https://github.com/stellar/stellar-dev-skill/issues/172#issuecomment-6591206077 — 🤖 _Automated message from the Stellar Triage Bot._ I confirmed the finding. `skills/soroban/SKILL.md` still returns HTTP 200 (71331 bytes). It is the only skill directory on `gh-pages` with no source on `main`. The cause is `keep_files: true` in `deploy-pages.yml`. A fix needs a 

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://skills.stellar.org/skills/soroban/SKILL.md | 2026-11-09T20:30:57.943235+00:00 | HTTP200 / 71331 bytes | `281905dcfdedafddcfbc138eb56e23ffe570a744c49e3862081ab143bd2fac97` |
| https://skills.stellar.org/skills/smart-contracts/SKILL.md | 2026-11-09T20:30:57.956513+00:00 | HTTP200 / 13855 bytes | `66558715c8755220cabd748937793a52b78fd9e44422878028755b9dba393ae5` |
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/soroban/SKILL.md | 2026-11-09T20:30:57.779787+00:00 | HTTP404 / 14 bytes | `d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed` |
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/.github/workflows/deploy-pages.yml | 2026-11-09T20:30:57.704555+00:00 | HTTP200 / 3026 bytes | `6676c540b8ee04c7be633c90c0401dfc4f8e6ddc693a417d138e929a3d9a257a` |

## sk-039 — fixed

All four required surfaces now list transfer(to: MuxedAddress), symbol() -> String, transfer_from(to: Address), and retain token.transfer(&from, &to, &amount) plus the generated-client conversion note. Source, canonical published skill and Raven pin are byte-identical. Ordinary Docs contains additional generated content so its whole-file hash differs, but the relevant interface list/client note agrees. Current SEP-41 master independently declares transfer:123, transfer_from:145, symbol:189 with the same types. No residual of the original defect found in the adjacent interface entries, name() -> String, approve live_until_ledger, or client example. No fresh compile was needed because no example changed.

- Direct ref read 2026-11-09T20:30:27.520708+00:00: https://github.com/stellar/stellar-dev-skill/pull/181, **merged**, author `stellar-triage-bot[bot]`, last updated 2026-11-06T19:05:20Z.
  Comment by **github-actions[bot]** (2026-11-06T18:40:32Z): https://github.com/stellar/stellar-dev-skill/pull/181#issuecomment-6692563800 — [PR Preview Action](https://github.com/rossjrw/pr-preview-action) v1.8.1 :---: Preview removed because the pull request was closed. 2026-11-06 18:42 UTC <!-- Sticky Pull Request Commentpr-preview -->
  Comment by **stellar-triage-bot[bot]** (2026-11-06T18:41:16Z): https://github.com/stellar/stellar-dev-skill/pull/181#issuecomment-6692578554 — 🤖 _Automated message from the Stellar Triage Bot._ Verified at ceeb2f1: - The types match SEP-41 v0.5.2 and soroban-sdk 29.0.1 `token.rs`. - A scratch wasm build passed for `&to` and failed with E0283 for `&to.into()`. - The `preview` build is green, and the preview serves the ne
  Comment by **kalepail** (2026-11-06T19:05:20Z): https://github.com/stellar/stellar-dev-skill/pull/181#issuecomment-6693081152 — Raven verified PR181's canonical correction on November 6 at 18:57 UTC. The ordinary [published skill](https://skills.stellar.org/skills/assets/SKILL.md) matches the merged source. It uses `MuxedAddress` for `transfer`, `String` for `symbol`, and `Address` for `transfer_from`. Th
- Direct ref read 2026-11-09T20:30:27.529688+00:00: https://github.com/stellar-experimental/stellar-raven/issues/388, **closed/completed**, author `stellar-triage-bot[bot]`, last updated 2026-11-06T19:06:50Z.
  Comment by **kalepail** (2026-11-06T19:05:22Z): https://github.com/stellar-experimental/stellar-raven/issues/388#issuecomment-6693081643 — Raven verified PR181's canonical correction on November 6 at 18:57 UTC. The ordinary [published skill](https://skills.stellar.org/skills/assets/SKILL.md) matches the merged source. It uses `MuxedAddress` for `transfer`, `String` for `symbol`, and `Address` for `transfer_from`. Th
- Direct ref read 2026-11-09T20:30:27.575251+00:00: https://github.com/stellar/stellar-dev-skill/issues/180, **closed/completed**, author `kalepail`, last updated 2026-11-06T19:05:19Z.
  Comment by **stellar-triage-bot[bot]** (2026-11-06T18:36:34Z): https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6692483628 — 🤖 _Automated message from the Stellar Triage Bot._ 👀 Picked this up — a review will follow shortly. <!-- automated-triage-bot dispatch-ack item=180 --> 
  Comment by **stellar-triage-bot[bot]** (2026-11-06T18:40:06Z): https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6692554965 — 🤖 _Automated message from the Stellar Triage Bot._ I confirmed both types against SEP-41 and soroban-sdk 29.0.1. The fix is in #181. <!-- automated-triage-bot ack state:pr-open:181 ts:2026-11-06T18:40:00Z --> 
  Comment by **stellar-triage-bot[bot]** (2026-11-06T18:43:06Z): https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6692615317 — 🤖 _Automated message from the Stellar Triage Bot._ #181 fixed the `transfer` and `symbol()` types and is now live on skills.stellar.org. I filed the Raven handoff for sk-039 as stellar-experimental/stellar-raven#388. <!-- automated-triage-bot ack state:done ts:2026-11-06T18:42:53
  Comment by **kalepail** (2026-11-06T19:05:19Z): https://github.com/stellar/stellar-dev-skill/issues/180#issuecomment-6693080712 — Raven verified PR181's canonical correction on November 6 at 18:57 UTC. The ordinary [published skill](https://skills.stellar.org/skills/assets/SKILL.md) matches the merged source. It uses `MuxedAddress` for `transfer`, `String` for `symbol`, and `Address` for `transfer_from`. Th

PR181 is merged at2026-11-06T18:41:20Z by `stellar-triage-bot[bot]`; merge commit `fb63412da70102edb527baf4cf3068f25713cd14`, reviewed head `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`. `gh pr view 181 --repo stellar/stellar-dev-skill --json state,mergedAt,mergedBy,mergeCommit,reviewDecision,reviews,statusCheckRollup,headRefOid,baseRefName` confirms no formal reviews, no requested changes, no failing check: preview/CodeQL/Socket succeeded, fork site-ci skipped. Bot comment6692578554 describes its own review; it is not independent human review. Raven's prior partial-fix comments are by kalepail. Their November6 residual is superseded by this fresh ordinary-URL read, not by the closure itself.

Raven MANIFEST pins stellar-dev commit `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`, assets/SKILL.md blob `e6493237cbc9c236a7ec9f5bfb179faf3d105cde`; hashing the fetched pin proves that same blob. This checks the pinned mirror content, not a production deployment claim. Main, canonical published copy, and the pin all have SHA-256 `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146`. Ordinary Docs is22768 bytes, SHA-256 `2eb7c204a64a3db48178ef3ca546bcf973048f76aa33060e7e048d5a9b481c7e`, and its relevant lines381–392 are corrected.

Independent specification GET: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0041.md at20:32:12Z, HTTP200/13308 bytes (`tmp/skills-evidence/sep41-master.body`). Transfer destination MuxedAddress:123, transfer_from Address:145, symbol String:189.

| GET URL | Request start UTC | Result | SHA-256 |
|---|---|---|---|
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/assets/SKILL.md | 2026-11-09T20:30:57.652437+00:00 | HTTP200 / 19663 bytes | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| https://skills.stellar.org/skills/assets/SKILL.md | 2026-11-09T20:30:57.910135+00:00 | HTTP200 / 19663 bytes | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |
| https://developers.stellar.org/.well-known/agent-skills/assets/skill.md | 2026-11-09T20:30:57.920312+00:00 | HTTP200 / 22768 bytes | `2eb7c204a64a3db48178ef3ca546bcf973048f76aa33060e7e048d5a9b481c7e` |
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/ceeb2f17a0fd1da3f47e28c6a73a026883020c09/skills/assets/SKILL.md | 2026-11-09T20:30:57.900051+00:00 | HTTP200 / 19663 bytes | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` |

## Retirement reference reconciliation — sk-039 only

Executed literal reference search `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "sk-039" .`; exact complete output saved at `tmp/skills-evidence/sk-039-references.txt`. No active `eval/qa/corpus/` or register case references this ID. The following persistent references must be handled by the coordinator/reviewer at retirement:

- Remove the active finding, its `improvements/intake.json` override, and generated `improvements/INDEX.md` row through the resolver; append a complete receipt in `improvements/resolved.json` with resolving PR181, current ordinary Docs evidence and distinct review. There is no probe block for sk-039.
- Remove/complete `.agents/TODO.md:57–66` (the ordinary Docs URL recheck); update the current `.agents/rounds/2026-11-09-improvements-sweep.md` classification. The author lane did not edit these files.
- Retain historical references in the sk-038 receipt (`improvements/resolved.json:2142`), `.agents/rounds/2026-11-06-assets-type-handoff.md`, `.agents/rounds/2026-11-06-playground-final-resolution.md`, `research/audits/2026-11-06-assets-type-handoff/{independent-review.md,public-comments.json}`, and `research/audits/2026-11-06-playground-final-resolution/handoff-retirement-review.md`; their November6 partial results describe dated evidence and must not be rewritten as November9 truth.
- Coordinator must arrange fresh independent ordinary Docs/source/pin/adjacency verification and reconcile resolution comments on issue180, PR181 and handoff388 before resolver finalization. This lane made no upstream write.

## Validation

Finding edits are documentation/evidence only. No runtime code, generated catalog, pin, golden case, `.agents/**`, intake, index or resolved receipt was edited by this lane. No baseline code test was needed. The brief forbids improvements:index, so the expected stale-index lint failure is handed to the coordinator after all lanes reconcile.

Evidence assertions passed for all four corrected assets surfaces, the source/published/pin byte equality, canonical/distribution Scout mirrors, thirteen recurrence dates and the fixed status. An initial auxiliary assertion expected the Scout API content length to equal the raw source byte length; fresh measurement is35398 characters/35468 UTF-8 bytes and the report was corrected. No verdict depended on that length. `git diff --check -- improvements/skills` passed.

Final required gate, run bare as `npm run improvements:lint` (exit1):

```text
> stellar-raven-codemode@0.1.0 improvements:lint
> node scripts/improvements-lint.mjs

improvements lint failed (1):
- improvements/INDEX.md is stale; run npm run improvements:index
```
