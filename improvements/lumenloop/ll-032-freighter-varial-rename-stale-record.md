---
id: ll-032
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: The freighter directory record omits the Varial name and current website
evidence:
  - 2026-11-02T22:36:13Z orchestrator recheck: POST https://api.lumenloop.com/v1/tools/get_project {"slug":"freighter"} returned HTTP 200. title="Freighter", other_names=[], links.website=["freighter.app"]. Raw response: tmp/fl-lk/ll-recheck/ll032-get.json; command receipt: tmp/fl-lk/ll-recheck/INDEX.txt.
  - 2026-11-02T22:36:13Z orchestrator recheck: POST https://api.lumenloop.com/v1/tools/search_directory {"query":"varial"} returned HTTP 200. count=20, match_mode="semantic"; no freighter row appeared. Raw response: tmp/fl-lk/ll-recheck/ll032-search.json.
  - 2026-11-02 public recheck: curl -sS -L -D headers https://freighter.app/ returned HTTP 301, then HTTP 200 at https://varialwallet.com/. GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/freighter.yaml returned HTTP 200 with the stale title and website. The stellar/freighter release 5.50.0 announcement dates the public rename to 2026-10-29; this is not a claimed first source-change date.
  - 2026-11-02 adjacent check: rg -n -i "freighter|varial" over the current stellar-ecosystem-db archive found three other descriptions naming Freighter. They are projects/lumenswap.yaml, projects/latch.yaml, and projects/aha-labs.yaml. Historical repository URLs and image paths need no rename.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among four issues and eight PRs in lumenloop/stellar-ecosystem-db. The active sk-030 concerns separate skill files. sls-095 concerns the separate Scout directory.
  - Affected golden cases: eval/qa/corpus/battery/retail-consumer/q-eco-freighter-wallet.json, eval/qa/corpus/battery/retail-consumer/q-tool-freighter-wallet.json, eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json
  - Source record: https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/freighter.yaml. The latest file change dates to 2026-06-09, before the public rename.
---

## Finding

The `freighter` directory record omits the wallet's current name, Varial, and its current website.
Its title is `Freighter`, its `other_names` field is empty, and its website is `freighter.app`.
A search for `varial` falls back to semantic results and does not return this record.

SDF announced the Varial name on 2026-10-29.
The wallet README uses the current name, and the old website redirects to `varialwallet.com`.
Users who search by the current name cannot find the wallet through a direct name match.

## Evidence

The orchestrator repeated these read-only requests on 2026-11-02T22:36:13Z.
Both requests returned HTTP 200.

| Request | Decisive values |
|---|---|
| `POST /v1/tools/get_project` `{"slug":"freighter"}` | `title: "Freighter"`, `other_names: []`, `links.website: ["freighter.app"]` |
| `POST /v1/tools/search_directory` `{"query":"varial"}` | `count: 20`, `match_mode: "semantic"`, no `freighter` row |

A fresh public read of `projects/freighter.yaml` returned the same stale fields.
The [wallet README](https://raw.githubusercontent.com/stellar/freighter/master/README.md) names Varial and identifies Freighter as its previous name.
The [SDF announcement](https://stellar.org/blog/foundation-news/freighter-is-now-varial) confirms the rename.
A fresh `GET https://freighter.app/` returned HTTP 301 to `https://varialwallet.com/`.

## Recommendation

Update `projects/freighter.yaml` with the title `Varial` and the website `varialwallet.com`.
Add `Freighter` to `other_names` and explain the rename in the description.
Confirm that a substring search for `varial` returns the record.

Check the current wallet name in `projects/lumenswap.yaml`, `projects/latch.yaml`, and `projects/aha-labs.yaml`.
Keep historical repository URLs and image paths when they still identify the correct resource.
