---
id: ll-032
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: The freighter directory record does not reflect the Varial rename
evidence:
  - "2026-11-02T17:17:22Z authenticated POST https://api.lumenloop.com/v1/tools/get_project with {\"slug\":\"freighter\"}: success true; title \"Freighter\"; other_names []; links.website [\"freighter.app\"]; the description names Freighter only"
  - "2026-11-02T17:18:49Z POST https://api.lumenloop.com/v1/tools/search_directory with {\"query\":\"varial\"}: no substring match; match_mode \"semantic\" fallback"
  - "2026-11-02 committed record https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/freighter.yaml (blob c9fc9dcc28, last commit 187dd86d44 on 2026-06-09): title Freighter, other_names null, website freighter.app"
  - "2026-11-02 primary source: https://raw.githubusercontent.com/stellar/freighter/master/README.md opens \"Varial (formerly Freighter) is a non-custodial wallet extension\"; the README change is commit 8186584326 (2026-10-30, \"Update the README for the Varial rebrand (#3055)\")"
  - "2026-11-02 curl https://freighter.app/ returned HTTP 301 to https://varialwallet.com/; the target page title is \"Varial | Your Everyday Stellar Wallet\""
  - "Affected golden cases: eval/qa/corpus/battery/retail-consumer/q-eco-freighter-wallet.json, eval/qa/corpus/battery/retail-consumer/q-tool-freighter-wallet.json, eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json"
  - "Intake note: this is a committed directory-record correction; the owner repo is lumenloop/stellar-ecosystem-db (intake.json per-finding override still to add)"
---

## Finding

The Lumenloop directory record `freighter` does not reflect the Varial rename.
The record title is `Freighter`. The `other_names` field is empty. The website
is `freighter.app`. The description names Freighter only.

The wallet owner renamed the product to Varial. The `stellar/freighter` README
now says "Varial (formerly Freighter)". The `freighter.app` domain now redirects
to `varialwallet.com`.

A directory search for `varial` finds no substring match. A user who knows only
the new name cannot find the wallet by name. An agent that reads the record
reports a stale product name and a redirecting website.

## Evidence

All calls ran on 2026-11-02 with read-only requests.

| Request | Result |
|---|---|
| `POST /v1/tools/get_project` `{"slug":"freighter"}` | `title: "Freighter"`, `other_names: []`, `links.website: ["freighter.app"]` |
| `POST /v1/tools/search_directory` `{"query":"varial"}` | No substring match; `match_mode: "semantic"` |
| `GET https://freighter.app/` | HTTP 301 to `https://varialwallet.com/` |
| `stellar/freighter` README, commit `8186584326` (2026-10-30) | "Varial (formerly Freighter) is a non-custodial wallet extension" |

The committed source record is `projects/freighter.yaml` in
`lumenloop/stellar-ecosystem-db`. Its last change is commit `187dd86d44` on
2026-06-09. That change is earlier than the rename.

## Recommendation

Update `projects/freighter.yaml`. Set the title to `Varial`. Add `Freighter` to
`other_names`. Set the website to `varialwallet.com`. State in the description
that Varial is the new name of Freighter.

Keep the existing slug, or add a redirect from the old slug. Either choice must
keep `get_project` with slug `freighter` working. Make sure that a substring
search for `varial` returns the record.
