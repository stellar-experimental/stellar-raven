---
id: sd-045
service: stellar-docs
status: reported-upstream
discovered: 2026-08-14
upstreamTitle: The frontend guide states an unqualified Freighter HTTPS requirement that localhost does not need
evidence:
  - 2026-08-14 read of stellar/stellar-docs docs/build/guides/dapps/frontend-guide.mdx line 78 returned "Freighter wallet requires a secure connection (HTTPS) to interact with your dapp."
  - "2026-08-14 W3C Secure Contexts, section 3.1 \"Is origin potentially trustworthy?\", returns Potentially Trustworthy for a host matching 127.0.0.0/8 or ::1/128, and for the host localhost or localhost. when the user agent follows the name resolution rules in section 5.2 - so http://localhost is already a secure context without HTTPS"
  - https://www.w3.org/TR/secure-contexts/
  - 2026-08-14 read of stellar/freighter extension/public/static/manifest/v3.json shows content_scripts matches "<all_urls>" at document_start, with no scheme restriction
  - 2026-08-14 search of stellar/freighter-developer-docs found no HTTPS requirement and no secure-context statement in extension/README.md, extension/installation.md, or integrations/README.md
  - 2026-08-14 live stellarDocs.search_docs for "Freighter not detected localhost https" returned eight hits and none about wallet detection
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, row q-ti-freighter-localhost-not-detected
  - Solo scratchpad 809, todo 1543 review and todo 1550 root correction round
  - upstream issue filed 2026-08-19: https://github.com/stellar/stellar-docs/issues/2773
recurrences:
  - date: 2026-08-30
    evidence: same-100 row q-ti-freighter-localhost-not-detected and its independent live review confirmed that the frontend guide still states the unqualified HTTPS requirement while the current Freighter manifest matches <all_urls> without a TLS gate
---

## Finding

The dapp frontend guide states one unqualified requirement: "Freighter wallet
requires a secure connection (HTTPS) to interact with your dapp." The guide then
tells the reader to enable HTTPS on localhost with `next dev
--experimental-https`.

The requirement is too broad for local development. The W3C Secure Contexts
specification already treats loopback origins as trustworthy. Section 3.1, "Is
origin potentially trustworthy?", returns `Potentially Trustworthy` for a host
matching the CIDR notations `127.0.0.0/8` or `::1/128`, and for the host
`localhost` or `localhost.` when the user agent follows the name resolution
rules described in section 5.2. `http://localhost` is therefore already a secure
context. It does not need HTTPS to satisfy a secure-context requirement.

Two further sources fail to corroborate the sentence as written. The Freighter
v3 manifest injects its content script on `<all_urls>` at `document_start` and
applies no scheme restriction. The Freighter developer documentation states no
HTTPS requirement in its extension README, its installation page, or its
integrations page.

The guide is also the only Docs page that discusses Freighter detection. It
gives one cause and one fix. A reader whose extension is not detected on
`http://localhost` therefore reaches for a fix that the standard says is not
required, and has no documented next step when it does not help.

## Evidence

The page read, the specification read, the manifest read, the Freighter
developer-docs search, and the live docs search all ran on 2026-08-14.

The manifest read returned this content-script entry:

```json
{ "matches": ["<all_urls>"], "js": ["contentScript.min.js"], "run_at": "document_start" }
```

Two limits on this record are stated deliberately. First, the manifest proves
that the extension applies no scheme restriction; it does not prove which page
conditions cause a detection failure in practice. Second, this record reproduces
no specific alternative failure cause. The troubleshooting items below are
proposed coverage for the owner to verify, not defects observed here.

## Recommendation

Qualify the sentence in `docs/build/guides/dapps/frontend-guide.mdx`. State that
a production dapp must be served over HTTPS, and that `http://localhost` is
already a secure context under the W3C Secure Contexts specification. Cite
https://www.w3.org/TR/secure-contexts/.

Keep the `--experimental-https` instruction as an option for matching production
conditions, not as a prerequisite for local development.

Consider adding a short "Freighter is not detected" section to the same guide.
Confirm each item against current extension behavior before publishing it. Good
candidates to check are the browser profile in use, whether the extension is
enabled and has been reloaded, whether the page needs a reload after install,
the site permission state, whether the dapp runs in a top-level frame, and
whether the page reads the API before the content script injects. The
`isConnected` check from `@stellar/freighter-api` is the natural first step for
a reader.

Confirm the final wording with the Freighter maintainers so Docs and the wallet
documentation state one requirement.
