# sls-023 independent review — Fable, 2026-09-08

Reviewer: Claude Fable 5.1 (distinct from the round orchestrator and from the finding author).
Scope: decide whether `sls-023` meets the `fixed-upstream` evidence bar in
`improvements/README.md` and `.agents/skills/improvements-pipeline/SKILL.md`.
Method: read-only. No upstream comment, no external write, no repository edit except this file.
Base commit: `a0a398ad447e2845b4a1e9dcf90458c41c222777`. The finding file was last committed in
`76e0bf4d00829e63146be206c1c834db5c22166d` and has no uncommitted edits.

## 1. What I read

- `improvements/stellar-light-scout/sls-023-rwa-product-deployment-status.md` (status
  `reported-upstream`, seven recurrences through 2026-09-08).
- `improvements/README.md` and `.agents/skills/improvements-pipeline/SKILL.md` (lifecycle and
  deletion gates).
- Issue `Stellar-Light/stellarlight#494`: closed 2026-08-11, four owner comments from 2026-09-04
  through 2026-09-05, all by the same maintainer:
  - `#issuecomment-5546570474` (2026-09-04T21:19Z): registry plus `products`, PRs #1298 and #1299.
  - `#issuecomment-5547454129` (2026-09-04T23:05Z): `deployment` fill from the registry, PR #1301.
  - `#issuecomment-5547988441` (2026-09-05T00:19Z): self-correction after an independent audit,
    PR #1302. It withdraws the "fixed and verified live" framing of the first two comments.
  - `#issuecomment-5548777030` (2026-09-05T02:35Z): `controls` on classic rows, PR #1305, and an
    hourly canary, PR #1306.
  All six PRs are merged (#1298 2026-09-04T20:43Z through #1306 2026-09-05T02:34Z).
- Corpus cases `eval/qa/corpus/battery/compliance-rwa-payments/q-rwa-projects-tokenizing-stellar.json`
  and `eval/qa/corpus/battery/defi-ecosystem/q-defi-wisdomtree-crdt.json`.
- Live Scout surfaces, all on API 1.9.48 and read by me, not copied from any transcript.

## 2. What I executed

All calls were plain unauthenticated GETs against production.

| call | time (UTC) | result | SHA-256 |
|---|---|---|---|
| `GET /api/projects/search?q=real%20world%20asset&limit=100` | 2026-09-08T17:14:15Z generated, read 17:18Z | 59 rows | `fe2a0ffa3ab2e219a04e2c0460016ca4f445d02eef03acc4ab4ebb0657eda2ae` |
| `GET /api/rwa?limit=100` | 2026-09-08T17:18:01Z | 97 rows, 52 issuers | `3b36e92e1d8382c740466ae487c22bf46a5ab9fcd83ccaf6e115ab605d6a5f3f` |
| `GET /api/openapi.json` | 2026-09-08T17:23:58Z | version 1.9.48 | `2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639` |
| `GET /api/projects/search?type=RWA&limit=100` | 2026-09-08T17:24Z | 96 rows | not recorded |
| `GET /api/projects/search?q=etherfuse&limit=20` | 2026-09-08T17:23Z | 3 rows | not recorded |
| `GET /api/projects/search?q=ondo&limit=10` | 2026-09-08T17:24Z | 3 rows | not recorded |
| `GET /api/rwa?project=etherfuse&limit=100` | 2026-09-08T17:23Z | 5 rows | not recorded |
| `GET /api/rwa?state=issued-single-holder&limit=100` | 2026-09-08T17:23Z | 34 rows | not recorded |
| `https://etherfuse.com/.well-known/stellar.toml` plus nine Horizon `/assets` lookups | 2026-09-08T17:24Z | 9 issued assets | not recorded |

The OpenAPI hash matches the hash recorded in `sls-082`. The first attempt to fetch the
OpenAPI document truncated at 126976 bytes; the compressed re-fetch is the one hashed above.

Row counts for the broad query vary between reads (owner 61, orchestrator 59, drift lane 60,
this review 59) because the response mixes 33 keyword matches with a semantic tail. This is
expected and does not change any conclusion below.

### Broad "real world asset" search, 59 rows

| measure | value |
|---|---|
| rows with non-null `products` | 11 (38 product records) |
| rows with `products: []` | 0 |
| `deployment.network` mainnet / unknown | 20 / 39 |
| `deployment.basis` onchain-activity / rwa-registry / null | 15 / 5 / 39 |
| `deployment.sourceUrl` set | 5 |
| rows with an `assets` key | 0 (the field no longer exists on the row) |
| rows with non-null `productKind` | 0 |
| status Live / Development / Inactive | 54 / 3 / 2 |
| Live rows whose description carries planned language | 1 (Benji; its `lifecycle.note` explains the "coming soon" footer) |

DTCC row: `status: Development`, `statusBasis: operator-announcement`,
`statusSourceUrl: https://stellar.org/case-studies/dtcc`, `deployment.network: unknown`, one
product `status: announced`, `evidenceUrl: https://stellar.org/case-studies/dtcc`,
`asOf: 2026-08-13`, note "operator states Stellar availability expected H1 2027".

Cross-join of search rows against registry `projectSlug`:

- Every search row whose slug appears in the registry has non-null `products` and a known
  network. No exceptions.
- Registry slugs absent from the broad query: `ondo`, `circle`, `etherfuse`, `rivool-finance`,
  `liqvidxyz`, `bitbond`, `usdm1`, `glo-dollar`, `brale`, `stablecorp`. The exact roster
  `type=RWA` returns Ondo, Etherfuse, Rivool Finance, Liqvid.xyz, Bitbond, and USDM1 with
  products, so this is broad-query recall, not the product model.
- The only product-bearing row outside the registry is DTCC, whose product is `announced`.

### Named examples

| example | project row | registry row |
|---|---|---|
| DTCC | Development, product `announced`, H1 2027 note | absent (correct) |
| WisdomTree GOLD | product `GOLD-GCK75CK…`, live, toml-bidirectional, controls whitelist+revocable+clawback | present, assetClass Commodities |
| WisdomTree EQTY | product `EQTY-GAKODZF…`, live, toml-bidirectional | present, assetClass Stocks |
| WisdomTree CRDT | product `CRDT-GBWMQUG…`, live, toml-bidirectional, `authRequired: true`, `clawbackEnabled: true` | issuer `GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45`, assetClass Diversified Credit |
| Figure YLDS | Figure row: product `YLDS-GAC7MOP…`, live, `deployment.basis: rwa-registry` | present, productKind stablecoin |
| Franklin BENJI | Benji row: BENJI, gBENJI, grBENJI, sgBENJI, all live | four rows, all toml-bidirectional |
| Ondo USDY | Ondo row: USDY live, `authRequired: false` | present, US Treasury Debt |
| Spiko / Amundi SAFO | Spiko row: 8 live Soroban products with `registryState` | 9 rows; chfSAFO is `deployed-no-supply` and is not served as a product |
| Etherfuse | Etherfuse row: 5 live products (USTRY, CETES, TESOURO, EUROB, KTB) | 5 rows |

The CRDT issuer matches the golden case. The registry does not serve the classic SAC id; the
identity contract is code plus issuer, which is sufficient and deterministic.

### Registry `/api/rwa`

97 rows. `byState`: live 62, issued-single-holder 34, deployed-no-supply 1. Every row carries
`evidenceUrl`, `verifiedAt`, `verificationLevel`, and `assetClass`. All 65 classic rows carry
`controls` with `controlsBasis: horizon-issuer-flags`; all 32 Soroban rows carry `null`.
`pairedWith` marks 12 rows (six duplicated real-estate tranches). No row has a legal-class,
prospectus, or transfer-agent field.

### OpenAPI 1.9.48

`getRwaAssets` exists. `Project.products[]` documents `issuer`, `assetId`, `registryState`,
`verificationLevel`, and `controls`. `Project.deployment` documents basis `rwa-registry` and
states that `unknown` means "no evidence either way, never 'not deployed'". The request and
response `state` enums omit `issued-single-holder`; `sls-082` already owns that defect.

## 3. Answers to the five questions

### Q1. Does the original product/deployment defect still reproduce?

No. The finding named two failure modes and both are closed on the live surface.

- False-live: DTCC is `Development` with an `announced` product, a dated evidence URL, and the
  H1 2027 note. No Live row in the 59 turns a planned product into a live claim.
- Under-enumeration through a project row: WisdomTree GOLD and EQTY, Figure YLDS, and the
  Etherfuse Stablebonds that the registry tracks are recoverable from their project rows with
  exact code plus issuer, network, state, evidence URL, verification level, and controls.

The six recommendation bullets map to served fields: product name and issuer (`products[].name`,
`products[].issuer`), network (`products[].network`), state (`products[].status` plus
`registryState`), asOf (`products[].asOf`, registry `verifiedAt`), evidence URL, verification
level, exact identity (`assetId` or `contractId`), product class (`kind`, registry `assetClass`),
and ledger controls (`controls`). The 2026-09-08 recurrence line in the finding says the
registry "does not complete the project-level product and deployment model". I do not accept
that line. It counts 40 unknown rows without checking whether any of them is an issuer, and my
join shows none of the issuer rows are unknown.

### Q2. Are unknown deployment values correct admissions for non-issuers?

Mostly yes, with two named exceptions the owner's statement does not cover.

Of the 39 unknown rows, 37 are tooling, platforms, planned integrations, regional stablecoin
rows with no registry entry, or DTCC. For those, `unknown` is an honest admission and the schema
text says so.

Two unknown rows are asset-level duplicates of issuers that the registry proves on mainnet:

- `GLOUSD` (slug `glousd`): unknown, `products: null`. The registry serves `USDGLO` live under
  `projectSlug: glo-dollar`.
- `QCAD` (slug `qcad`): unknown, `products: null`. The registry serves `QCAD` live under
  `projectSlug: stablecorp`.

Both rows have `canonicalSlug: null`, so the registry join by slug cannot reach them. The same
duplicate pattern appears without an unknown value on `USDY` (slug `usdy`) and `YLDS` (slug
`ylds`): mainnet by on-chain activity, but `products: null` while the parent row carries the
product. None of these rows makes a false claim. The owner's sentence "the 42 still unknown are
not issuers" is therefore over-broad, but the defect it would imply is a duplicate-row join
gap, not the sls-023 product model.

### Q3. Where do the remaining legal-class and transfer-agent facts belong?

Outside Scout's product-discovery scope. Do not carry them in `sls-023` and do not open a
successor for them.

- The fund or share legal class and the transfer-agent record priority are prospectus facts.
  The corpus case `q-defi-wisdomtree-crdt` already sources them from the WisdomTree IR release
  and the SEC filing (class A sources) and does not depend on Scout for them.
- Scout's registry now carries what a discovery layer can verify: exact identity, the issuer's
  own evidence URL, rwa.xyz `assetClass`, and the ledger flags that implement eligibility and
  clawback. An agent that needs the prospectus hierarchy must follow `evidenceUrl` to the issuer.
- A successor would ask Scout to curate legal text it cannot verify on-chain. That fails the
  pipeline's "concrete owner-facing recommendation" bar and the "canonical-source" routing rule.

Two residuals do fall inside Scout's discovery scope and need a home before deletion:

1. Duplicate asset rows without a registry join (Q2). Route this as a dated recurrence on
   `sls-024`, whose finding is exactly "populated deployment qualifiers". It needs no new id.
2. Registry coverage for an issuer already in the registry. The Etherfuse `stellar.toml` declares
   nine currencies from issuer `GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC`.
   Horizon shows all nine issued with authorized trustlines (MEX 28, CETESZ 16, GILTS 13,
   MEXe 10, plus the five tracked). The registry and the Etherfuse row serve five. The registry
   note says absence means untracked, but a non-null five-element `products` array carries no
   "not exhaustive" signal. This is the GT-17 under-enumeration risk at reduced size. It is a
   self-contained successor candidate (next id `sls-083`) with a general recommendation: for an
   issuer already in the registry, verify every toml-declared currency, or mark `products` as
   partial. File it only if the orchestrator agrees it is worth an owner's time; it is low
   severity because the registry declares its scope.

### Q4. Active references that must change before deletion

`rg -n "sls-023" .` returns 22 files. Dated ledgers and research notes stay untouched. The
active references are:

1. `improvements/stellar-light-scout/sls-023-rwa-product-deployment-status.md` — replace the
   2026-09-08 still-repro recurrence with a dated fixed-state recheck (this review's calls and
   hashes), set `status: fixed-upstream`, add the four comment URLs and PRs #1298, #1299,
   #1301, #1302, #1305, #1306 as resolving refs, commit, then let the resolver delete it.
2. `improvements/intake.json` — the `sls-023` override; the resolver removes it.
3. `improvements/INDEX.md` — regenerated by `npm run improvements:index`.
4. `improvements/resolved.json` — receipt appended by the resolver; the id is never reused.
5. `eval/qa/corpus/battery/compliance-rwa-payments/q-rwa-projects-tokenizing-stellar.json` —
   `truth.verified.evidence` lists the sls-023 file path. Replace it with a pointer to the
   resolved ledger entry so the path does not dangle. The golden text needs no change: its
   avoid items still hold and `ll-012` still stands.
6. `eval/qa/corpus/battery/defi-ecosystem/q-defi-wisdomtree-crdt.json` —
   `truth.verified.rootCause` lists the sls-023 file path. Replace it with the resolved ledger
   pointer and keep `ll-012`. The grader note "while the filed upstream defect stands" then rests
   on `ll-012` alone, which is the case's Lumenloop surface; say so in the note so the caution
   is not read as a Scout caution. Both edits go through the `golden-truth` skill.
7. `eval/qa/cases.json` — regenerated by `npm run eval:qa:compile` after items 5 and 6.
8. `.agents/rounds/2026-09-08-improvements-followups.md` — the sls-023 row must record the
   terminal classification, this report path, and the residual routing.
9. `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md` — add the
   duplicate-row recurrence from Q2 with the GLOUSD and QCAD evidence.
10. Own-repo: `.agents/TODO.md` already keeps `GET /api/rwa` excluded until the general scoring
    repair. Nothing changes there, but the resolution comment must not claim that Raven exposes
    `getRwaAssets`; it does not. `searchProjects` passes the `products` and `deployment` fields
    through unchanged (`src/adapters/scout.ts` does not reshape rows).

Leave as dated provenance: `research/qa-deep-dive-2026-08-25/*.md`, `.agents/rounds/2026-08-28-*`,
`.agents/rounds/2026-09-03-truth-maintenance*`, `.agents/rounds/2026-09-08-live-drift-91.md`.

### Q5. Is an upstream resolution comment justified now?

Yes, once item 1 above is committed. The pipeline lists "a claimed or deployed fix that needs a
verification result" as a comment trigger, and the maintainer posted four such claims and one
self-correction. The README also requires the dated live result and the commit-pinned source
snapshot on the upstream ref before the file is retired, and the resolver refuses to run without
`--upstream-commented`. The comment should:

- confirm the original trigger no longer reproduces, with the 2026-09-08 calls and hashes;
- state plainly that the legal-class and transfer-agent facts are out of scope and not requested;
- name the GLOUSD and QCAD duplicate rows as a residual tracked on `sls-024`, and the Etherfuse
  coverage gap if `sls-083` is filed;
- link the commit-pinned finding snapshot.

Do not post it before the finding file is committed in its fixed state; an immutable snapshot of
the current `reported-upstream` text would misstate the record.

## 4. Findings

1. The original sls-023 defect no longer reproduces on Scout 1.9.48: DTCC is `Development`
   with an `announced` product, and WisdomTree GOLD/EQTY/CRDT, Figure YLDS, BENJI, USDY, Spiko,
   and Etherfuse products are recoverable with identity, state, evidence, level, and controls.
   The finding meets the `fixed-upstream` evidence bar for its original trigger.
2. The finding's 2026-09-08 recurrence line overstates the residual. It must be replaced by a
   fixed-state recheck before the status changes; a still-repro line cannot sit under
   `fixed-upstream`.
3. The owner's claim that every unknown deployment row is a non-issuer is over-broad. `GLOUSD`
   and `QCAD` are asset-level duplicate rows with unknown deployment while the registry proves
   both assets live under different slugs. Route this to `sls-024` as a dated recurrence.
4. The registry under-enumerates Etherfuse: five of nine toml-declared, Horizon-issued assets.
   Non-null `products` arrays carry no partial marker. Optional self-contained successor
   `sls-083`; not a reason to hold `sls-023`.
5. Legal class beyond `assetClass` and transfer-agent record priority are prospectus facts and
   fall outside Scout's discovery scope. No successor.
6. Two corpus cases reference the sls-023 file path in truth metadata and one grader note leans
   on "the filed upstream defect". Both need golden-truth edits and a corpus recompile before
   deletion.
7. An upstream resolution comment is justified, but only after the fixed-state finding is
   committed so the snapshot link is immutable and truthful.
8. Raven does not expose `getRwaAssets`; the resolution must not claim consumer-side coverage
   for the registry endpoint. The own-repo exclusion stays in `.agents/TODO.md`.

## 5. Verdict

CHANGES-REQUIRED

## Follow-up 2026-09-08T17:45Z — sls-083 as the authored residual

Reviewer: Claude Fable 5.1, same reviewer as the sections above. Read-only again. No file
changed except this report.

### What I read and re-executed

- `improvements/stellar-light-scout/sls-083-etherfuse-rwa-registry-coverage.md` (untracked,
  status `verified`, `upstreamTitle` present).
- The uncommitted `sls-023` text (status `fixed-upstream`, two new comment refs, this report as
  evidence, a 2026-09-08 entry under `recurrences`).
- Live OpenAPI 1.9.48 at 2026-09-08T17:42:58Z, SHA-256
  `2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639`, unchanged since the first
  pass. Verbatim `Project.products` sentences that matter: "Curated only; every record carries
  evidenceUrl + asOf so the claim is re-verifiable at its source. NULL = no product-level records
  modelled for this project (UNKNOWN, never 'this project ships no products'). Fed by the
  verified RWA registry (/api/rwa, 97 tokens re-verified on-chain 2026-09-04) for the issuers
  that have a project row — WisdomTree, Spiko, Etherfuse, Ondo, Figure, Circle, Paxos,
  Centrifuge and others — plus hand-curated rows; only registry rows in state=live are served
  here". Verbatim `/api/rwa` sentences: "Every tokenized real-world asset rwa.xyz lists on
  Stellar (97 tokens, 52 issuers), each re-verified on-chain: classic assets from the issuer's
  own stellar.toml plus Horizon where the toml declares them (else on-chain-only)" and "Curated
  registry: absence means untracked, never 'not on Stellar'."
- The original GT-17 wording in `sls-023`: "a broad project record does not expose enough
  product-level detail to recover current WisdomTree GOLD/EQTY, Figure YLDS, and six Etherfuse
  Stablebond assets. Provider metadata and read-only Horizon checks confirmed those assets on
  2026-07-10."
- Re-executed at 2026-09-08T17:43Z: `https://etherfuse.com/.well-known/stellar.toml` (SHA-256
  `f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe`, matches `sls-083`);
  `GET https://horizon.stellar.org/assets?asset_issuer=GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC&limit=200`
  (11 records); `GET /api/projects/search?q=etherfuse&limit=20` (five products, unchanged).
- `npm run improvements:lint`: ok, 71 findings. The uncommitted `INDEX.md` lists `sls-023` as
  `fixed-upstream` with 7 recurrences and `sls-083` as `verified`.

### Decision: path A

`sls-083` is a verified, owner-actionable, materially distinct successor.

Materially distinct. The GT-17 defect in `sls-023` was the absence of any product model: a
project row could not name a product at all, so an agent recovered zero of the Etherfuse
assets. The `sls-083` defect starts after that model exists: the row names five products with
exact identity and evidence, and the question is the boundary of that list. The cause differs
(registry source scope versus no model), the reproduction differs (compare a tracked issuer's
toml to its served products versus a null array), and the fix differs (reconcile declared
currencies and mark partial lists versus build the model). Six versus nine Etherfuse assets is a
date difference between 2026-07-10 and 2026-09-08, not a contradiction; both counts were checked
on Horizon at their own dates.

Owner-actionable. Scout already read the Etherfuse toml: every served Etherfuse row is
`toml-bidirectional`. The nine declared currencies are in the file Scout verified against. The
reconciliation needs no new source. The recommendation is general (every tracked issuer), not a
per-row patch.

Verified. The toml hash reproduces byte-for-byte. Horizon returns the four omitted codes as
issued with authorized trustlines (MEX 28, CETESZ 16, GILTS 13, MEXe 10). The Scout surfaces
return five.

Why the existing "curated only" text does not already disclose partial coverage:

1. "Curated only" in `Project.products` describes provenance, not completeness. It sits between
   the sentence that says a Live row never proves a product and the sentence that defines the
   null case. The only completeness statement in the field is for `null`. The description
   defines what an absent array means and says nothing about what a present array omits.
2. The `/api/rwa` description defines the registry boundary as rwa.xyz's list. A reader of a
   project row must know the array is registry-fed, open a second operation, and infer that the
   listing boundary also bounds a tracked issuer's products. Nothing on the row or in the
   `project` parameter ("the rows that feed that project's `products`") states that.
3. The `/api/rwa` text says classic assets are verified "from the issuer's own stellar.toml plus
   Horizon where the toml declares them". A careful reader takes that as toml-driven enumeration
   and expects all nine declared codes. The registry instead enumerates from rwa.xyz and uses the
   toml only to verify. The description discloses the rwa.xyz boundary but not that a tracked
   issuer's toml-declared, Horizon-issued assets can be missing.
4. The Etherfuse row does carry a `coverage` object, but it is anchor coverage
   (`countries`, `currencies`, `seps`, `asOf`), not product-list completeness.

So the partial coverage is disclosed at the registry level and only transitively. A consumer of
`searchProjects` who never calls `getRwaAssets` (which Raven does not expose) gets a five-element
array with no marker. That is the GT-17 under-enumeration risk at reduced size, and it is a
distinct, fixable defect.

### Factual inspection of the uncommitted text

`sls-023`:

- Evidence lines 15 and 16 describe the two comments correctly and name the right authors'
  direction (owner corrected owner).
- The 2026-09-08 line reports the same hashes I recorded and the same join result. No error.
- Structural: the 2026-09-08 entry sits under `recurrences` but describes a non-recurrence.
  `INDEX.md` therefore counts seven recurrences for a fixed finding. Move the fixed-state recheck
  to `evidence` so the count and the label agree.
- Omission: the resolving PRs #1298, #1299, #1301, #1302, #1305, and #1306 are named only inside
  the linked comments. Pass them as `--resolving-ref` at resolution time or list them in
  evidence; the receipt should carry them.
- Omission carried over from the first pass: the `GLOUSD` and `QCAD` duplicate-row residual is
  not recorded on `sls-024` or anywhere else in the uncommitted tree. Deletion of `sls-023`
  requires that residual to have a home or an explicit written decision to drop it.

`sls-083`:

- Evidence line 1 hash `85667958…` is a point-in-time value; the response embeds `generatedAt`,
  so my 17:43Z read hashes differently. Not an error, but the line should say the hash is dated.
- Evidence line 4 says a single Horizon lookup "returned all nine declared assets" with SHA
  `437383b0…` and no URL. With `limit=200` the issuer lookup returns 11 records and hashes
  `849fbb0bf181a52999d93aa896129a4d75517f6ab925bf78cfda2a83eb6ee565`. Horizon embeds the request
  URL in `_links.self`, so the hash depends on the exact query. Record the exact URL. The claim
  "all nine" is true.
- Omission that strengthens the finding: Horizon also lists `USTR` (3 authorized) and `GBPx`
  (2 authorized) for the same issuer, neither declared in the toml. That shows the toml-declared
  set is the right reconciliation bar and that the registry is not merely mirroring Horizon.
  Add it.
- The recommendation asks for "a products coverage field". The project row already has a
  `coverage` field with a different meaning. Name the new field distinctly, for example
  `productsCoverage`, so the owner does not read it as a change to the anchor field.
- Body statements about the registry note, the row's silence, and the five-versus-nine counts
  are correct.

### Findings (follow-up)

1. Path A. `sls-083` is a verified, owner-actionable, materially distinct successor. Keep it.
   Do not reopen `sls-023` as a partial fix.
2. The current "Curated only" and "absence means untracked" texts disclose a registry-level
   boundary only transitively; nothing on a non-null `products` array or the `project` parameter
   says a tracked issuer's list can be partial. `sls-083` names a real gap.
3. `sls-023`: move the 2026-09-08 fixed-state entry from `recurrences` to `evidence`, and carry
   the six resolving PRs into the resolution (evidence or `--resolving-ref`).
4. `sls-023` deletion gate: the `GLOUSD` and `QCAD` duplicate-row residual still has no home.
   Add a dated recurrence to `sls-024` or write down the decision to drop it.
5. `sls-083`: record the exact Horizon URL behind the `437383b0…` hash, note the 11-record
   issuer roster including undeclared `USTR` and `GBPx`, mark the search hash as dated, and
   rename the proposed field away from the existing `coverage`.
6. No factual error found in either file's finding, evidence, or recommendation prose. The
   items above are labeling, provenance, and completeness fixes.

CHANGES-REQUIRED
