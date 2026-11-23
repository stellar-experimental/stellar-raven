# Independent handoff review · 2026-11-23

Nine findings meet the upstream retirement criteria. Keep **sls-116** active. The repair covers SCF citation fields on every served awarded row. The missing round-44 award and the duplicate Peer award remain independently observable.

Reviewer `ho-review`, Codex frontier, assigned `gpt-6.2-astra` at high effort. Reviewed worktree HEAD `bdf810ef39fdd70088c7fad0402bcb32285012b1`. All times below are UTC on 2026-11-23. HTTP observations came from direct GETs using `curl -LsS --compressed`. Relative API paths use `https://stellarlight.xyz`. At 20:56:56Z, `GET /api/status` returned HTTP 200 and API version `1.9.157`. Model-call spend was $0.

## GitHub readback

Each linked handoff, upstream issue and pull request was read with `gh api repos/{owner}/{repo}/issues/{number}` or `pulls/{number}`, including their discussion comments. All ten Raven handoffs were open with zero discussion comments at the time shown. All seven primary PRs were closed and merged. Each head's returned check runs succeeded and each PR review list was empty. The PR comment links below are deployment-bot comments.

| Finding | Raven handoff · read UTC | Upstream issue · state · read UTC | Latest issue comment | Merged PR · read UTC |
| --- | --- | --- | --- | --- |
| sls-122 | [#543](https://github.com/stellar-experimental/stellar-raven/issues/543) · 20:54:31Z | [#1975](https://github.com/Stellar-Light/stellarlight/issues/1975) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1975#issuecomment-7090754848) | [#1985](https://github.com/Stellar-Light/stellarlight/pull/1985) · 20:54:31Z |
| sls-121 | [#544](https://github.com/stellar-experimental/stellar-raven/issues/544) · 20:54:32Z | [#1974](https://github.com/Stellar-Light/stellarlight/issues/1974) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1974#issuecomment-7091041803) | [#1990](https://github.com/Stellar-Light/stellarlight/pull/1990) · 20:54:31Z |
| sls-118 | [#545](https://github.com/stellar-experimental/stellar-raven/issues/545) · 20:54:31Z | [#1970](https://github.com/Stellar-Light/stellarlight/issues/1970) · open · 20:54:33Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1970#issuecomment-7091144619) | [#1988](https://github.com/Stellar-Light/stellarlight/pull/1988) · 20:54:31Z |
| sls-117 | [#546](https://github.com/stellar-experimental/stellar-raven/issues/546) · 20:54:31Z | [#1969](https://github.com/Stellar-Light/stellarlight/issues/1969) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1969#issuecomment-7091144841) | [#1989](https://github.com/Stellar-Light/stellarlight/pull/1989) · 20:54:32Z |
| sls-119 | [#547](https://github.com/stellar-experimental/stellar-raven/issues/547) · 20:54:31Z | [#1971](https://github.com/Stellar-Light/stellarlight/issues/1971) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1971#issuecomment-7091168774) | [#1991](https://github.com/Stellar-Light/stellarlight/pull/1991) · 20:54:31Z |
| sls-120 | [#548](https://github.com/stellar-experimental/stellar-raven/issues/548) · 20:54:32Z | [#1973](https://github.com/Stellar-Light/stellarlight/issues/1973) · closed (completed) · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1973#issuecomment-7091169028) | [#1991](https://github.com/Stellar-Light/stellarlight/pull/1991) · 20:54:31Z |
| sls-116 | [#549](https://github.com/stellar-experimental/stellar-raven/issues/549) · 20:54:31Z | [#1952](https://github.com/Stellar-Light/stellarlight/issues/1952) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellarlight/issues/1952#issuecomment-7091842078) | [#1992](https://github.com/Stellar-Light/stellarlight/pull/1992) · 20:54:32Z |
| sk-019 | [#554](https://github.com/stellar-experimental/stellar-raven/issues/554) · 20:54:31Z | [#13](https://github.com/Stellar-Light/stellar-scout/issues/13) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellar-scout/issues/13#issuecomment-7111482377) | [#1995](https://github.com/Stellar-Light/stellarlight/pull/1995) · 20:54:31Z |
| sk-027 | [#555](https://github.com/stellar-experimental/stellar-raven/issues/555) · 20:54:32Z | [#14](https://github.com/Stellar-Light/stellar-scout/issues/14) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-7111483121) | [#1995](https://github.com/Stellar-Light/stellarlight/pull/1995) · 20:54:31Z |
| sk-028 | [#556](https://github.com/stellar-experimental/stellar-raven/issues/556) · 20:54:31Z | [#15](https://github.com/Stellar-Light/stellar-scout/issues/15) · open · 20:54:31Z | [theboycoder](https://github.com/Stellar-Light/stellar-scout/issues/15#issuecomment-7111483676) | [#1995](https://github.com/Stellar-Light/stellarlight/pull/1995) · 20:54:31Z |

| PR | Merge commit | Merged UTC | Checks passed | Latest PR discussion comment |
| --- | --- | --- | --- | --- |
| [#1985](https://github.com/Stellar-Light/stellarlight/pull/1985) | `5a5070ef0d6a8371f3777f12f7bc68fdd023033f` | 2026-11-23T02:24:14Z | 6/6 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1985#issuecomment-7089771801) |
| [#1990](https://github.com/Stellar-Light/stellarlight/pull/1990) | `fe90eac6af0805c02fc788f0d896723868943462` | 2026-11-23T03:42:42Z | 9/9 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1990#issuecomment-7090886642) |
| [#1988](https://github.com/Stellar-Light/stellarlight/pull/1988) | `ec68a65135588254ed78dd312f972f3b9327edba` | 2026-11-23T03:28:20Z | 9/9 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1988#issuecomment-7090727394) |
| [#1989](https://github.com/Stellar-Light/stellarlight/pull/1989) | `3ecfe38698f7e7a0cb01c33d8917193540b0d0aa` | 2026-11-23T03:35:35Z | 9/9 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1989#issuecomment-7090829501) |
| [#1991](https://github.com/Stellar-Light/stellarlight/pull/1991) | `0391a36fcd9cd4ecd70af8338ddcd564612c5b6f` | 2026-11-23T03:48:43Z | 9/9 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1991#issuecomment-7090981670) |
| [#1992](https://github.com/Stellar-Light/stellarlight/pull/1992) | `a3954b6f3bf87772e557617f316f872c2a1f690f` | 2026-11-23T03:56:46Z | 7/7 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1992#issuecomment-7091061182) |
| [#1995](https://github.com/Stellar-Light/stellarlight/pull/1995) | `bec146c33c3b6d971b9d88ca35dc799a45cb9f57` | 2026-11-23T19:11:36Z | 8/8 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1995#issuecomment-7110397842) |
| [#1962](https://github.com/Stellar-Light/stellarlight/pull/1962) | `ebc53f931d6bd3889f31516bb3f45ead35b7705e` | 2026-11-13T01:02:32Z | 7/7 | [vercel[bot]](https://github.com/Stellar-Light/stellarlight/pull/1962#issuecomment-6840423159) |

PR #1962 is the earlier SCF repair, also cited in #549. Its readback completed at 20:58:00Z.

## sls-122 — RETIRE

Every walk returned exactly its advertised total in distinct IDs and distinct slugs. All pages returned HTTP 200. Append each listed offset to its GET path. The time sequence corresponds to offsets in order.

| GET path (append offset) | Offsets | Read UTC | Page lengths | Rows / distinct IDs / reported total | Coca rank and confidence |
| --- | --- | --- | --- | --- | --- |
| `/api/projects/search?q=wallet&limit=100&offset=` | 0, 100 | 20:55:07Z, 20:55:08Z | 100, 95 | 195 / 195 / 195 | 47 / 0.97 |
| `/api/projects/search?q=wallet&limit=50&offset=` | 0, 50, 100, 150 | 20:55:07Z, 20:55:08Z, 20:55:08Z, 20:55:08Z | 50, 50, 50, 45 | 195 / 195 / 195 | 47 / 0.97 |
| `/api/projects/search?q=wallet&limit=25&offset=` | 0, 25, 50, 75, 100, 125, 150, 175 | 20:55:08Z, 20:55:08Z, 20:55:08Z, 20:55:08Z, 20:55:08Z, 20:55:08Z, 20:55:08Z, 20:55:08Z | 25, 25, 25, 25, 25, 25, 25, 20 | 195 / 195 / 195 | 47 / 0.97 |
| `/api/projects/search?q=stablecoin&limit=100&offset=` | 0, 100, 200 | 20:55:08Z, 20:55:08Z, 20:55:08Z | 100, 100, 7 | 207 / 207 / 207 | absent |
| `/api/projects/search?q=defi&limit=100&offset=` | 0, 100 | 20:55:09Z, 20:55:09Z | 100, 99 | 199 / 199 / 199 | absent |
| `/api/projects/search?type=Wallet&limit=100&offset=` | 0 | 20:55:14Z | 74 | 74 / 74 / 74 | 46 / 0.97 |

## sls-121 — RETIRE

At 20:55:14Z, `GET /api/projects/search?type=Wallet&limit=100&offset=0` returned HTTP 200 and all 74 wallets. All six Live rows with a `none-found` availability result carried an `availability-check` hit dated 2026-11-11, a low confidence score, and a caveat describing the product as unconfirmed. Ben Wallet also carried the caveat despite a lifecycle observation dated 2026-11-12. The original five had August lifecycle dates.

Both detail paths returned HTTP 200 for each slug. Read `/api/projects/resolve?q={slug}` and `/api/verify?type=live&subject={slug}` at the respective times below. Every verify verdict was `supported` for the recorded label. For the six hits the verify statement qualified that verdict and the resolve evidence carried the caveat. The finding offered qualification as an acceptable remedy. A caller using the verdict alone still loses the qualification.

| Slug | Search status check | Confidence | Resolve UTC | Verify UTC | Caveat on both |
| --- | --- | --- | --- | --- | --- |
| spatium | hit | 0.2 | 20:55:49Z | 20:56:15Z | yes |
| sentit | hit | 0.3 | 20:55:49Z | 20:55:49Z | yes |
| freelii | hit | 0.2 | 20:55:48Z | 20:55:48Z | yes |
| elsa | hit | 0.3 | 20:55:49Z | 20:55:50Z | yes |
| ben-wallet | hit | 0.13 | 20:56:16Z | 20:55:51Z | yes |
| bebop | hit | 0.2 | 20:55:50Z | 20:55:51Z | yes |
| blaze | could-not-check | 0.9 | 20:56:17Z | 20:55:52Z | no |

Blaze had a `could-not-check` result. Its verify statement reported its human-verified label. The two Development rows and one Inactive row with availability hits had no Live-label caveat.

## sls-118 — RETIRE

The original unfiltered query now returns both limits proposals ahead of the incident material. The first row names the YieldBlox proposal, source `slp`, Final, created 2026-05-07. Row two names the Mercado Bitcoin proposal, Final, created 2026-11-02. Their primary documents returned the same status and dates.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:55:48Z | `/api/research?q=SLP-0006+freeze+YieldBlox+exploit+accounts&limit=25` | 200 | SLP-0006 #1, SLP-0008 #2 |
| 20:55:51Z | `/api/research?q=SLP-0006&limit=5` | 200 | SLP-0006 #1, exactKeys absent |
| 20:55:49Z | `/api/research?q=SLP-0008&limit=5` | 200 | SLP-0008 #1, exactKeys absent |
| 20:55:49Z | `/api/research?q=CAP-0077+SLP-0006&limit=10` | 200 | CAP-0077 #1, SLP-0006 #2, SLP-0008 #3 |
| 20:55:49Z | `/api/research?q=has+quorum+freeze+been+used+on+mainnet&limit=8` | 200 | SLP-0006 #3, SLP-0008 #8 |
| 20:55:49Z | `/api/research?q=SLP-0004&source=slp&limit=5` | 200 | SLP-0004 #1 |
| 20:58:25Z | `/api/research?q=SLP&source=slp&limit=25` | 200 | All eight proposal URLs present in 25 rows, meta.sourceDocCount 55 |
| 20:56:59Z | `https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0006.md` | 200 | SLP-0006 Final, created 2026-05-07 |
| 20:58:24Z | `https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0008.md` | 200 | SLP-0008 Final, created 2026-11-02 |

The requested outcome for `exactKeys` was exact lookup. The two exact queries each ranked their document first. The deployed schema at 20:57:59Z (`GET /api/openapi.json`, 200) defines the field for verbatim matches on finding IDs, CVE/GHSA IDs and repository-qualified release tags. Its omission on a proposal-number lookup is consistent with that definition. No successor is warranted for the omitted implementation detail.

## sls-117 — RETIRE

All four source pages now occur in `sdf-org` with `observedAt=2026-11-23T17:16:31.786Z`. The strategy title identifies 2026 and the roadmap title identifies the 2025 edition. The strategy query first serves the overview chunk. A targeted query independently located the numerical targets in two additional chunks.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:55:48Z | `/api/research?q=SDF+2026+strategy+priorities&source=sdf-org&limit=25` | 200 | /foundation/strategy #2, 2026 strategy overview |
| 20:55:48Z | `/api/research?q=SDF+product+roadmap&source=sdf-org&limit=25` | 200 | /foundation/roadmap #13, 2025 roadmap. /foundation/north-stars #6 |
| 20:55:48Z | `/api/research?q=service+providers+directory&source=sdf-org&limit=25` | 200 | /ecosystem/service-providers #1, developer services and infrastructure categories |
| 20:55:48Z | `/api/research?q=forgot+memo+exchange+deposit+recover+funds&source=sdf-org&limit=25` | 200 | /community #1, SDF cannot recover funds |
| 20:57:22Z | `/api/research?q=transformational+enterprises+%241+billion&source=sdf-org&limit=25` | 200 | #1 targets 15 new enterprises signed and at least five deployed. #19 targets $1 billion in network asset value growth. |

## sls-119 — RETIRE

Circle EURC `EURC-GDHU6WRG` still names the US LLC in the TOML organization field and links the Circle TOML. Its dated note now cites the EURC terms, names Circle Internet Financial Europe SAS as legal issuer and identifies the US LLC as reseller. This implements the second remedy in the finding. The live `issuerOfRecord` schema describes the disclosure exception.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:55:48Z | `/api/stablecoins?peg=EUR&limit=50` | 200 | 6 EUR rows. Circle EURC named, terms note present. MyKobo EURC named MYKOBO, note null. |
| 20:55:48Z | `/api/stablecoins?limit=100` | 200 | USDC-GA5ZSEJY named Circle Internet Financial, LLC, note null |
| 20:56:59Z | `https://www.circle.com/.well-known/stellar.toml` | 200 | ORG_NAME names Circle Internet Financial, LLC |
| 20:56:59Z | `https://www.circle.com/legal/eurc-terms` | 200 | Terms name the Europe entity as issuer and the LLC as reseller |
| 20:55:48Z | `/api/verify?type=issued&subject=EURC&auditor=Circle+Internet+Financial+Europe+SAS` | 200 | `supported` |
| 20:55:48Z | `/api/verify?type=issued&subject=EURC&auditor=Circle+Internet+Financial%2C+LLC` | 200 | `contradicted` |
| 20:55:48Z | `/api/verify?type=issued&subject=EURC&auditor=MyKobo` | 200 | `supported` |
| 20:57:59Z | `/api/openapi.json` | 200 | verifyClaim serves /api/verify. issuerOfRecord schema names the EURC exception. |

## sls-120 — RETIRE

BRLT `BRLT-GCHQ3F2B` now has `issuerOfRecordCheck=could-not-read` and `issuerOfRecordAsOf=2026-11-23T07:52:50.145Z`. Its note identifies the DNS failure, the alternate Latamex TOML and Relay Tech Services Ltd, and states that the account cannot confirm the link. Both issuer name and issuer source URL are null. The dated read failure correctly distinguishes this situation from a read with no organization name.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:55:48Z | `/api/stablecoins?limit=100` | 200 | 37 checks: 35 named, one could-not-read (BRLT), one not-named (USDT0). No null check. |
| 20:56:59Z | `https://horizon.stellar.org/accounts/GCHQ3F2BF5P74DMDNOOGHT5DUCKC773AW5DTOFINC26W4KGYFPYDPRSO` | 200 | BRLT account home_domain is sep.stablex.cloud |
| 20:56:59Z | `https://dns.google/resolve?name=sep.stablex.cloud&type=A` | 200 | DNS Status 3 (NXDOMAIN) |
| 20:56:59Z | `https://pubnet-sep.latamex.com/.well-known/stellar.toml` | 200 | ORG_NAME Relay Tech Services Ltd, exact account in ACCOUNTS and in BRLT currency entry |

USDT0 had a dated, qualified one-sided link to Everdawn Labs Limited. ARST named Relay Tech Services Ltd and supplied the Latamex TOML as its source. The whole returned population contained no other `could-not-read` or `not-named` row.

## sls-116 — KEEP ACTIVE (PARTIAL)

At 20:55:09Z–20:55:10Z, `GET /api/projects/search?scfAwarded=true&limit=100&offset={offset}` returned 200 at offsets 0, 100, 200, 300, 400, 500, 600 and 700. Offsets 0–400 completed at 20:55:09Z, offsets 500–700 at 20:55:10Z. Counts were 100 on the first seven pages and 11 on the last. All pages advertised 711 total. The walk contained **711 unique IDs, 0 rows missing a source URL or date, and 0 source URLs for the verification-service page**. That official page still reports a round-44 award.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:56:58Z | `https://communityfund.stellar.org/project/soroban-contract-source-verification-service-bax` | 200 | lastAwardedRound 44, buildAwardRounds [SCF #44] |
| 20:56:57Z | `https://communityfund.stellar.org/project/passkey-ui-sj6` | 200 | Passkey UI lastAwardedRound 44 |
| 20:56:57Z | `https://communityfund.stellar.org/project/oz-accounts-policy-builder-by-gatewayfm-mqp` | 200 | Gateway.fm policy builder lastAwardedRound 44 |
| 20:56:58Z | `https://communityfund.stellar.org/project/stellarpay-dy1` | 200 | StellarPay lastAwardedRound 2 |
| 20:56:58Z | `https://communityfund.stellar.org/project/peer-by-honeycoin-inz` | 200 | Peer by HoneyCoin lists rounds 22 and 26 |
| 20:56:59Z | `/api/projects/search?q=Passkey+UI&limit=5` | 200 | soropass cites passkey-ui-sj6 for round 44 |
| 20:56:59Z | `/api/projects/search?q=StellarPay&limit=5` | 200 | stellarpay cites stellarpay-dy1, awarded rounds [2] |
| 20:56:58Z | `/api/projects/search?q=Peer&limit=5` | 200 | peer cites peer-by-honeycoin-inz, rounds [22, 26], scfAsOf 2026-11-23 |
| 20:57:00Z | `/api/projects/search?q=Soroban+Contract+Source+Verification+Service&limit=5` | 200 | No returned row cites the official verification-service award page |

The same source page and same two awards appear on both `peer` and `honey-coin`. At 20:58:45Z, `GET /api/projects/search?q=honey-coin&limit=5` returned both with $145,000 each ($45,000 and $100,000). Gateway.fm serves rounds 16 and 44 against the single `gatewayfm-noq` citation. The separate OZ Accounts Policy Builder page supplies the round-44 evidence. StellarPay's unsupported round-30 award and $148,400 total are gone.

The maintainer reports 866 of 893 earlier-round awards served, leaving 27 operator decisions. The public sync run's Idempotence and Round counts steps succeeded. These totals are upstream reconciliation evidence. The public API independently establishes the named missing award. `GET /api/analyze?dimension=funding` at 20:58:45Z returned 200 with 45 per-round aggregates across 611 awarded projects in its active population, without the expected-page list or the 27 omissions. Do not sum Peer and HoneyCoin as separate awards. Keep the issue and finding open for the missing project, the operator decisions, and the shared-page attribution. [Upstream reconciliation](https://github.com/stellar-experimental/stellar-raven/issues/549) · [Sync run](https://github.com/Stellar-Light/stellarlight/actions/runs/45110655691)

## Shared live evidence for the three Scout skill findings

Public distribution HEAD was `a07d00c456237501ca9470d4470617823c88708e` (`gh api repos/Stellar-Light/stellar-scout/commits/main`). The first five paths below use the GET prefix `https://raw.githubusercontent.com/Stellar-Light/stellar-scout/main/`. The last two are production GETs. The count columns give matching lines. We read the surrounding positive guidance as well as checking the original stale strings.

| Path | UTC | HTTP | /api/feedback | Obsolete catalog claims | Obsolete builder sizes |
| --- | --- | --- | --- | --- | --- |
| `SKILL.md` | 20:55:48Z | 200 | 0 | 0 | 0 |
| `references/api-reference.md` | 20:55:48Z | 200 | 0 | 0 | 0 |
| `references/examples.md` | 20:55:48Z | 200 | 0 | 0 | 0 |
| `README.md` | 20:55:48Z | 200 | 0 | 0 | 0 |
| `references/feedback.md` | 20:55:48Z | 200 | 4 | 0 | 0 |
| `https://stellarlight.xyz/skills/stellar-scout.md` | 20:55:48Z | 200 | 0 | 0 | 0 |
| `https://stellarlight.xyz/skills/references/feedback.md` | 20:55:48Z | 200 | 4 | 0 | 0 |

Catalog checks covered the fixed SDF count/list, Soroban as a recommended skill slug, the roughly 30-entry claim, the SDF-only detail description, dead README targets and the constructed SDF install URL. Builder checks covered the dozens, about 110, and few-hundred-profile claims. SHA-256 matched between distribution and production for the main skill (`a4dd7b5bec2281312e2412d02ac3fdd0721b7fb503b456c99ce5ab9e0b905ee7`) and for the feedback companion (`df677f0f2aba61511f0cac50807f824cd21f15d4a80db8587c828a9ed724fc67`).

## sk-019 — RETIRE

The four default files and the served skill contain zero feedback endpoint paths. `SKILL.md:263` names `references/feedback.md` and explicitly conditions loading it on host write permission and the user's intent to report. `README.md:106` links the companion. Both companion copies have `opt-in: true`, `read-only: false`, and a `side-effects` field explaining that submission creates a curator-queue row. Its four endpoint references are confined to the opt-in file, including the schema helper. At 20:58:24Z, the catalog detail `GET /api/skills/stellar-scout` also returned HTTP 200, zero feedback endpoint paths and one companion pointer. The default read-only selection meets the finding. Verification required only GETs.

## sk-027 — RETIRE

The four distributed files and the production skill pass the stale-text checks above. `SKILL.md:14,90,313` sends readers to the live SDF filter. The API reference describes the merged sources and entry-specific install or fallback fields at lines 206 and 213. Examples line 20 uses `smart-contracts`. The README links to the two actual StellarLight skill pages. The tested catalog details returned populated `.skill.content` for both an SDF and a StellarLight entry.

| UTC | GET URL or path | HTTP | Observed |
| --- | --- | --- | --- |
| 20:56:56Z | `/api/skills?source=sdf` | 200 | 8 entries, all with a working homepage in the table below |
| 20:56:57Z | `/api/skills` | 200 | 84 entries: 8 sdf, 15 stellarlight, 8 lumenloop, 12 external, 41 community |
| 20:57:23Z | `/api/skills/soroban` | 404 | unknown skill: soroban |
| 20:57:59Z | `/api/skills/stellar-scout` | 200 | stellarlight detail, 35,897 content characters |
| 20:57:59Z | `/api/skills/smart-contracts` | 200 | sdf detail, 13,795 content characters |
| 20:58:33Z | `/skills/smart-contracts` | 200 | Stellar Smart Contracts |
| 20:58:33Z | `/skills/dapp` | 200 | Frontend & Wallets |
| 20:57:24Z | `https://skills.stellar.org/soroban` | 404 | former README target |
| 20:57:24Z | `https://skills.stellar.org/anchors` | 404 | former README target |
| 20:57:24Z | `https://skills.stellar.org/skills/soroban/SKILL.md` | 200 | 71,331 bytes. The separate sk-031 publication issue still reproduces. |

| SDF entry | GET homepage from this entry | UTC | HTTP / content |
| --- | --- | --- | --- |
| agentic-payments | `https://skills.stellar.org/skills/agentic-payments/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| cross-chain | `https://skills.stellar.org/skills/cross-chain/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| dapp | `https://skills.stellar.org/skills/dapp/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| data | `https://skills.stellar.org/skills/data/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| standards | `https://skills.stellar.org/skills/standards/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| assets | `https://skills.stellar.org/skills/assets/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| smart-contracts | `https://skills.stellar.org/skills/smart-contracts/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |
| zk-proofs | `https://skills.stellar.org/skills/zk-proofs/SKILL.md` | 20:56:56Z | 200 / SKILL frontmatter |

## sk-028 — RETIRE

The four files and production main skill contain no original fixed-size claim. `SKILL.md:91` and `references/api-reference.md:121` describe opt-in Stellar Passport profiles and point to the builders count in the status response. At 20:56:56Z, `GET /api/status` returned 200 with `sources[name=builders].count=419`, updated 18:41:41.901Z. In the same second, `GET /api/builders?q=zzzzqqq` returned 200, zero matches and an advisory giving the directory size as 419. This checks both the current instructions and the no-match path used in the original finding.

## Repository reconciliation

The searches ran separately as `rg --hidden -g '!.git' -n '<id>' .`. Locations refer to the review worktree before retirement. Each filing record is identified by its ID line. Retirement removes the file and regenerates the index. For each RETIRE verdict, append its receipt to `improvements/resolved.json` through the resolver. The current round ledger, `.agents/rounds/2026-11-23-upstream-handoffs.md:8,31`, carries all ten handoffs. Record the dispositions there. Dated findings from earlier rounds are historical evidence.

| Finding | Active record | Index | Other queue/reference actions |
| --- | --- | --- | --- |
| sls-122 | `improvements/stellar-light-scout/sls-122-project-search-repeats-a-row-across-pages.md:2` | `improvements/INDEX.md:36` | Remove the completed joint wallet bullet at `.agents/TODO.md:310–312` with sls-121. |
| sls-121 | `improvements/stellar-light-scout/sls-121-wallet-live-status-contradicts-availability-check.md:2` | `improvements/INDEX.md:35` | Same joint wallet bullet at `.agents/TODO.md:310–312`. The IDs occur on lines 310 and 311. |
| sls-118 | `improvements/stellar-light-scout/sls-118-research-corpus-omits-limits-proposals.md:2` | `improvements/INDEX.md:32` | Golden-maintenance check below. No intake override. |
| sls-117 | `improvements/stellar-light-scout/sls-117-sdf-org-source-missing-strategy-service-provider-pages.md:2` | `improvements/INDEX.md:31` | Golden-maintenance check below. No intake override. |
| sls-119 | `improvements/stellar-light-scout/sls-119-eurc-issuer-of-record-names-reseller.md:2` | `improvements/INDEX.md:33` | `improvements/stellar-light-scout/sls-120-brlt-issuer-of-record-null-with-readable-toml.md:14` cross-references this ID. Both files retire together. Keep the sls-107 receipt at `improvements/resolved.json:4262,4263`. Golden-maintenance check below. |
| sls-120 | `improvements/stellar-light-scout/sls-120-brlt-issuer-of-record-null-with-readable-toml.md:2` | `improvements/INDEX.md:34` | The sls-107 receipt at `improvements/resolved.json:4262,4263` is historical provenance. No intake override. |
| sls-116 | `improvements/stellar-light-scout/sls-116-scf-earlier-round-award-coverage.md:2` | `improvements/INDEX.md:30` | Keep the record and index entry. Add the dated partial to the record and refresh `.agents/TODO.md:303–309` with #549, the sourced Peer row, the missing page and remaining attribution work. Preserve predecessor receipt at `improvements/resolved.json:4319`. |
| sk-019 | `improvements/skills/sk-019-scout-skill-feedback-workflow-exposure.md:2` | `improvements/INDEX.md:16` | No per-finding intake override. Source pin adoption belongs to the separate drift lane. |
| sk-027 | `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:2` | `improvements/INDEX.md:19` | Remove `improvements/intake.json:194`. Update the present-tense active claim at `improvements/skills/sk-031-skills-site-orphaned-soroban-skill.md:14` to point to the receipt. Its line 12 is dated deduplication evidence. Keep sk-031 and its own TODO. |
| sk-028 | `improvements/skills/sk-028-scout-skill-stale-builder-count.md:2` | `improvements/INDEX.md:20` | Remove `improvements/intake.json:198`. Preserve the dated research receipt and its observed count. |

The two skill overrides above are the only literal ID matches in `improvements/intake.json`. The ten searches found no matches in `docs/`. Old round plans, reports and reviews retain their dated observations. The only hit under `research/` is the dated sk-028 receipt at `research/audits/2026-11-06-remaining-sweep/other-receipt.json:7264`. The worktree still pins distribution commit `f1f781b925a9517d033aee95c5e7572cd5a0705e` at `ecosystem-skills/MANIFEST.json:363`. The drift lane owns Raven’s adoption and deployment of the new pin.

The pre-retirement `npm run eval:qa:lint -- --stale --enforce-floors` exited 0 with 0 errors and 99 warnings. The findings and their dated evidence associate sls-117 with strategy, service providers and missing-memo recovery, sls-118 with SLP status and Quorum Freeze, sls-119 with the EURC issuer, and sk-027 with skill-detail installation. The lead should route those named links to the golden-maintenance lane and rerun the lint after removing the IDs. A clean pre-retirement run alone cannot detect a cap that will become inactive on deletion. This reviewer did not inspect the restricted corpus or register.
