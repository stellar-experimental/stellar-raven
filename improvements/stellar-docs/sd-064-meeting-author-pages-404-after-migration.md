---
id: sd-064
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Restore or redirect the meeting author pages that the Mintlify migration removed
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/meetings/authors/kalepail returned HTTP 404
  - 2026-11-02 golden case q-builder-content-by-person records the same 404 at 2026-11-02T16:31:54Z, also for /meetings/authors/kalepail/ and /meetings/authors, while /meetings returns HTTP 200 with x-mintlify-client-version 0.0.4044
  - the same golden case recorded the page as live on 2026-07-13 and on 2026-09-30T21:31Z, with seven author posts dated 2024-01-26 through 2024-06-13
  - stellar/stellar-docs commit 17f2d69198a803d2c5d986583229df1dfc4a398f (parent of the Mintlify migration commit 700ed32d, 2026-10-22) meetings/authors.yml defines seven authors (carstenjacobsen, elliotfriend, kalepail, anataliocs, naman, julian, kaankacar); three entries set page true
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 has no meetings/authors.yml, and redirects.json has no rule for /meetings/authors
  - Raven eval golden case q-builder-content-by-person, audited 2026-11-02
  - 2026-11-02 pre-existing upstream PR https://github.com/stellar/stellar-docs/pull/2945 (OPEN, opened 2026-10-22 by ElliotFriend) proposes this fix; Raven did not file a separate issue
recurrences:
  - date: 2026-11-06
    evidence: "Fresh author root, kalepail and elliotfriend URLs all404; meetings200. Proposed redirect PR2945 open review-required, checks green, BLOCKED. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-064"
---

## Finding

The Mintlify migration removed the meeting author index pages. It added no redirect. Old links
such as `/meetings/authors/kalepail` now return HTTP 404.

Before the migration, the Docusaurus meetings blog generated an author page for each author entry
with `page: true`. Three authors had such a page. The page for `kalepail` listed seven meeting
posts. After the migration, the repository has no author data and no redirect rule for the old
paths.

Readers and tools that follow an old author link get a 404 page and lose the author's post list.

This is a migration regression.

## Evidence

On 2026-07-13 and on 2026-09-30, `https://developers.stellar.org/meetings/authors/kalepail`
returned an author page with seven posts. On 2026-11-02 the same URL returns HTTP 404. The
meetings index `/meetings` returns HTTP 200.

At the parent of migration commit `700ed32d`, `meetings/authors.yml` defines seven authors.
Three of them set `page: true`. The current `main` has no `meetings/authors.yml`. The current
`redirects.json` has no rule that matches `/meetings/authors`.

## Recommendation

Add the author pages back to the meetings section, or add redirects for the old
`/meetings/authors/<key>` paths. A redirect to the meetings index `/meetings` is the smallest fix.

Smallest recheck: `curl -sIL https://developers.stellar.org/meetings/authors/kalepail` returns
HTTP 200 after a redirect or directly.

The open upstream PR stellar/stellar-docs#2945 adds redirects from `/meetings/authors` and
`/meetings/authors/:slug*` to `/meetings`.
