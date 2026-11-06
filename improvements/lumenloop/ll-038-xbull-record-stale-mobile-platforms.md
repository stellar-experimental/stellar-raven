---
id: ll-038
service: lumenloop
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: The xBull directory description advertises mobile platforms with unavailable store listings
evidence:
  - 2026-11-02T22:36:14Z Raven recheck (read-only): POST https://api.lumenloop.com/v1/tools/get_project {"slug":"xbull"} returned HTTP 200. The description still lists "web browsers, Android, and iOS devices".
  - 2026-11-02 independent public recheck: curl -sS -L https://apps.apple.com/us/app/xbull-wallet/id6705122563 returned HTTP 404. GET https://itunes.apple.com/lookup?id=6705122563 returned HTTP 200 with resultCount=0. Google Play package pages app.xbull.wallet and app.xbull.mobile each returned HTTP 404. These checks concern the named listings and the US Apple storefront.
  - 2026-11-02 public source check: GET https://xbull.app/ returned HTTP 200 with web-wallet and Chrome-extension links. GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/xbull.yaml returned HTTP 200 with the Android/iOS sentence. The latest source commit does not date store withdrawal.
  - 2026-11-02 adjacent check: rg -n -i "xbull|Android|iOS" around the directory record found the mobile platform claim in projects/xbull.yaml. The record has no store links. projects/soroban-academy.yaml and contracts/xbull.yaml name xBull but do not repeat that mobile distribution claim.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among four issues and eight PRs in lumenloop/stellar-ecosystem-db. sls-033 concerns Scout wallet availability metadata, not this Lumenloop record. No active or resolved record owns this directory correction.
  - Affected golden case: eval/qa/corpus/battery/retail-consumer/q-eco-xbull-wallet.json (truth.verified 2026-11-02). Its notes say that the Lumenloop Android and iOS platform claim is stale
  - Source record: https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/xbull.yaml. The 2026-06-29 file timestamp does not date mobile store withdrawal.
  - upstream issue filed 2026-11-02: https://github.com/lumenloop/stellar-ecosystem-db/issues/15
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL get_project xbull; YAML; Apple named listing/lookup, both Play package pages,operator site — Still advertises browsers Android iOS; Apple US listing404/lookup0, Play both404; operator web+extension. No claim installed clients stopped working. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-038."
---

## Finding

The `xbull` directory description lists Android and iOS support without qualifying the unavailable mobile store listings.
The checked Apple and Google Play listings return HTTP 404.
The current operator site links to the web wallet and Chrome extension.
Callers can therefore recommend mobile installation through store listings that no longer work.

## Evidence

Raven repeated `POST /v1/tools/get_project` with `{"slug":"xbull"}` on 2026-11-02T22:36:14Z.
The request returned HTTP 200 and retained this description fragment:

```text
web browsers, Android, and iOS devices
```

A fresh public read of `projects/xbull.yaml` returned the same sentence.
These public checks also ran on 2026-11-02:

| URL | Result |
|---|---|
| `https://apps.apple.com/us/app/xbull-wallet/id6705122563` | HTTP 404 |
| `https://itunes.apple.com/lookup?id=6705122563` | HTTP 200, `resultCount: 0` |
| `https://play.google.com/store/apps/details?id=app.xbull.wallet` | HTTP 404 |
| `https://play.google.com/store/apps/details?id=app.xbull.mobile` | HTTP 404 |
| `https://xbull.app/` | HTTP 200; web-wallet and Chrome-extension links |

The Apple checks concern the US storefront and the named app id.
The checks do not establish whether previously installed mobile clients still work.
They also do not establish the withdrawal date.

## Recommendation

Update `projects/xbull.yaml` to name the current web wallet and browser extension.
Qualify the Android and iOS claim with the unavailable store listings, or remove that claim.
Only recommend mobile installation when a current distribution link supports it.
