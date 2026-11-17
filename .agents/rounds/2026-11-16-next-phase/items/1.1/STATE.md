# Item 1.1 state table

One row per finding, read and re-run on 2026-11-17 (Scout OpenAPI 1.9.150). The columns follow
the `improvements-pipeline` skill. Thirteen findings, plus sls-120, which this item filed.

| finding | trigger | upstream ref | ref state | PR checks or blocker | live re-check | repo action | next check |
|---|---|---|---|---|---|---|---|
| sls-033 | `type=Wallet` platform facts lacked `sourceUrl` | stellarlight #519, #742, PR #1967 | #519, #742 closed; #1967 merged 2026-11-14 | none | fixed: 74 rows, 123 facts, 0 without `sourceUrl`, 0 unavailable without a URL | retired to the receipt; resolution comments posted on #519, #742 and #1967 | none |
| sls-107 | stablecoin rows named a brand as issuer; no asset class | stellarlight #1900, PR #1944 | #1900 closed; #1944 merged 2026-11-12 | none | fixed: 35 of 37 rows `named` with source and date; 0 null `assetType`; filter and 400 path work | retired to the receipt; comments posted on #1900 and #1944 name sls-119 and sls-120 | none |
| sls-116 | SCF earlier-round awards missing | stellarlight #1952; raven #427 | #1952 open; no maintainer reply since 2026-11-13 | none | still reproduces: bax page on no row, no public 27-award baseline, `peer` source null | dated recurrence | TODO entry names the three checks |
| sd-105 | Lumens page contradicts itself | stellar-docs #3143 | open; fix PR #3147 open | triage-bot PR, not merged | probe: recurring | dated recurrence | after #3147 deploys |
| sd-106 | Tier 1 page names no organizations | stellar-docs #3144 | open; fix PR #3148 open | triage-bot PR, not merged | probe: recurring | dated recurrence | after #3148 deploys |
| sd-107 | newer-protocol rejection undocumented | stellar-docs #3145 | open; fix PR #3149 open | triage-bot PR, not merged | probe: recurring | dated recurrence | after #3149 deploys |
| sd-108 | no signing-review guidance | stellar-docs #3146 | open; "Decision needed" for Docs maintainers | owner decision | `gh search code` for both terms: 0 results | dated recurrence | after the Docs decision |
| sd-109 | passkeys page says Friendbot cannot fund contracts | stellar-docs #3150 | open; fix PR #3152 open | triage-bot PR, not merged | probe: recurring | dated recurrence | after #3152 deploys |
| sd-110 | Lab page lists JSON, Python, Java as CLI binding languages | stellar-docs #3151 | open; fix PR #3153 open | triage-bot PR, not merged | probe: recurring | dated recurrence | after #3153 deploys |
| sls-117 | `sdf-org` source omits strategy pages | stellarlight #1969 | open, 0 comments | none | probe: recurring | dated recurrence | on an owner reply or release |
| sls-118 | research corpus omits Limits Proposals | stellarlight #1970 | open, 0 comments | none | probe: recurring | dated recurrence | on an owner reply or release |
| sls-119 | EURC issuer of record names the reseller | stellarlight #1971 | open, 0 comments | none | still reproduces: `issuerOfRecord` "Circle Internet Financial, LLC" | dated recurrence; dedupe line now points to the sls-107 receipt | on an owner reply or release |
| sd-081 | restoration example fails to parse | stellar-docs #2562 | open | none | partly fixed by PR #3083: fences parse and type-check; `Api` redeclaration (`TS2440`) remains | finding body rewritten to current state; verification comment posted on #2562 (see EXEC.md) | after the owner changes `restore-data` line 42 |
| sls-120 (new) | BRLT row has all five issuer-of-record fields null | stellarlight #1973 | open (filed 2026-11-17) | none | verified: four reads re-run by the executor | filed through `improvements:file` | on an owner reply or release |
