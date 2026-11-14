---
name: improvements-pipeline
description: Maintain the improvements/ upstream-findings pipeline for stellar-raven-codemode. Use when filing or updating service-improvement findings, resolving intake targets, maintaining improvements/intake.json, interpreting improvements lint failures, running recurrence probes, regenerating improvements/INDEX.md, reviewing upstream issues or PRs opened from findings, or handling eval-round and drift-refresh improvement maintenance.
---

# Improvements pipeline

`improvements/` records upstream service, data, content, and spec gaps for their owners. Own-repo
fixes go to `.agents/TODO.md`. [`improvements/README.md`](../../../improvements/README.md) is the
charter; read it first. After any edit here, run:

```sh
npm run improvements:index   # INDEX.md is generated; never hand-edit it
npm run improvements:lint    # the gate; add `-- --live` when intake repos or GitHub refs changed
```

## Status is an evidence bar

| Status | Requires |
|---|---|
| `proposed` | A plausible finding, usually from a transcript or review; not yet proven live |
| `verified` | Your own live re-execution against the upstream surface, with the command and response recorded |
| `reported-upstream` | The durable filed ref in evidence |
| `declined-upstream` | The trigger still reproduces and the owner declined; a decline ref and a non-empty `disposition`. Do not re-file. Revisit only on drift or materially new evidence |
| `fixed-upstream` | A live re-check that shows the fix. A queue of deletion candidates, not an archive |

- GitHub state is not truth. A closed issue or merged PR is a reason to re-run the original
  trigger; only the live result moves a status.
- A residual after a fix becomes a successor finding. Do not stretch the old one.
- An owner's decline is evidence about placement and scope, not evidence that the fact is false.
- Resolution deletes the active file and adds a receipt to `improvements/resolved.json`. IDs are
  unique across the active tree and that ledger and are never reused: take the next number above
  the maximum of both.

## File a finding

1. **Dedupe.** Search IDs, titles, and recurrences. Update an existing finding before adding one.
2. **Classify the failing surface**, then choose the collection and prefix:

   | Collection | Prefix | | Collection | Prefix |
   |---|---|---|---|---|
   | `lumenloop` | `ll-` | | `skills` | `sk-` |
   | `stellar-light-scout` | `sls-` | | `workers-ai-provider` | `wai-` |
   | `stellar-docs` | `sd-` | | `canonical-source` | `cs-` |

   For a web surface: `docs-content` (the page is wrong, stale, or omits what it undertakes to
   explain), `docs-search` (ranking fails over suitable content), `site-content`, `site-search`, or
   `canonical-source` (the defect belongs to the spec, implementation, or product that owns the
   fact). A `canonical-source` finding with no service collection goes in
   `improvements/canonical-source/` with a per-finding `repo` override. Search absence alone is not
   a content defect: name the canonical source, show why the surface undertakes to expose it, and
   name the smallest correction. Skills findings target the source repos; a re-pin is not a fix.
   Create a new collection only for a verified finding with an identified owner that no existing
   collection can hold.
3. **Write it.** Standard frontmatter, `discovered: YYYY-MM-DD`, a non-empty `evidence` list, and
   `Finding`, `Evidence`, and `Recommendation` sections. Give evidence a stranger can reproduce,
   quantify prevalence ("4 of 11 completed events"), and address the recommendation to the service
   owner. A GitHub issue or PR URL in evidence requires a `reported-upstream`, `declined-upstream`,
   or `fixed-upstream` status.
4. **Calibrate content or code drift** before filing:
   - Separate the version where you saw the drift from the version that introduced it, and cite
     the live successor repo, not an archived one.
   - Run any snippet you call broken against the current dependency and name the failing stage.
   - Search adjacent and repeated prose for the same claim, so the smallest fix leaves no
     contradiction.
5. **Resolve the owner** through `improvements/intake.json`: a per-finding override wins, then the
   service repo, then an explicit `unclear` or `mixed` rule. Leave `unclear` with its reason when
   no public owner can receive the finding. Never file to this repo to close the loop.
6. **File through the script**:

   ```sh
   npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run
   npm run improvements:file -- --file improvements/<collection>/<finding>.md
   ```

   The script renders and scrubs the body, resolves the repo, posts, appends the URL, sets
   `reported-upstream`, and regenerates the index. It refuses `unclear` or `mixed` targets without
   `--repo` and refuses to re-file a filed record. Do not hand-file a shortened body: the body must
   keep the automated-content notice, the five sections (`Finding`, `Evidence`, `Recommendation`,
   `Source Record`, `Resolution Handoff`), and both links. The script adds the `raven` label where
   the target repo has it; a missing label is not a reason to hand-file.
7. **Read the dry run as the maintainer.** The title and first paragraph state the affected surface
   and defect without eval IDs, internal workflow terms, or clipped transcript text. The smallest
   correction comes before optional context. Follow
   [`references/upstream-writing-style.md`](references/upstream-writing-style.md).

More rules:

- An immutable snapshot link is valid only when the committed blob matches the finding being
  rendered. Commit first, or omit the snapshot.
- A finding fixed before anyone filed it needs no ceremonial issue. Add dated live evidence and any
  existing upstream ref that explains the fix.
- A finding that backs a golden partial cap (ADR-0008) does not wait in `verified`: re-check it
  live, dedupe, and file it in the same round, or record why no public owner can receive it.
- When the consumer-side workaround is a golden change, land it through `golden-truth`. Cite the
  case file in the finding's evidence and point the case's `truth.verified.rootCause` at the
  finding.

## Docs search findings

A content gap goes to the docs repo. A search gap splits by owner:

- **Upstream ranking.** The search backend ranks or chunks a page badly. Raven has no write path to
  it. File upstream with the query, the expected page, and the observed hits.
- **Raven scoping.** The adapter's path scopes, candidate window, or query-term guard hide a page
  the backend returned. Fix it in the spec or adapter only as a general mechanism with a measured
  win on a free, read-only, retrieval-level A/B against the golden docs pages.
  [`docs/stellar-docs.md`](../../../docs/stellar-docs.md) defines the scoping contract. Record the
  change, the A/B, and the live re-check in the finding's evidence.

Search analytics read with the maintenance key are good prevalence evidence; cite the query and
window. Never print or commit `MINTLIFY_ADMIN_API_KEY`. It is never a Worker or sandbox binding.

## Follow up on filed findings

Use this loop on a drift refresh, or when asked whether earlier findings were resolved.

1. **Enumerate refs**: `rg -n "github.com/.+/(issues|pull)/" improvements`. Take
   `reported-upstream` and `verified` findings first. Include inbound `upstream-improvement-ready`
   issues on this repo; they are signals to verify, not proof.
2. **Keep one state table** in the round ledger:

   | finding | trigger | upstream ref | ref state | PR checks or blocker | live re-check | repo action | next check |
   |---|---|---|---|---|---|---|---|

3. **Read each ref** with `gh` or the GitHub tools: state, close reason, linked PRs, latest
   maintainer comment, review decision, checks. For a PR this repo opened, also note any author
   action it needs.
   - Read every recorded URL back from GitHub before you treat it as evidence. Remove dangling refs
     and never describe an unposted draft as a comment.
   - Check who wrote a comment you cite. A line that says "maintainer accepted" must not link one
     of our own comments.
   - For byte-exact text use `gh api ... --jq .body`. The GitHub MCP `issue_read` tool HTML-escapes
     bodies and strips autolinks and HTML comments.
4. **Re-run the original trigger**: `npm run improvements:probes` for a finding with a `probe`,
   the smallest live `execute` or service call for an eval-origin finding, or the refreshed
   inventory for a drift-origin finding.
5. **Classify and act**:

   | Outcome | Action |
   |---|---|
   | fixed | Set `fixed-upstream`, add dated evidence and the resolving ref |
   | still reproduces | Keep the status; add a dated local recurrence |
   | closed but unfixed | Keep `reported-upstream`; record why closure did not resolve it |
   | superseded | Link the successor; do not stretch the old finding |
   | inconclusive | No status change; add a dated `.agents/TODO.md` entry that names the next check |
   | inbound handoff | Reply with the live result, update the finding only at the evidence bar, close the notification. An evidence-only PR never sets `fixed-upstream` without a live check |

6. **Stay silent on untouched open issues.** No reminder, status, backlink-only, or "still
   reproducible" comments. Comment only for maintainer activity that needs a reply, a claimed fix
   that needs a verification result, materially new evidence or a correction, or work on our own
   PR.
7. **Drain `fixed-upstream`.** A reviewer other than the author re-derives each deletion candidate:
   reads the finding and the upstream ref, confirms the fix is deployed and not merely merged,
   re-executes the trigger, scans adjacent behavior for residuals, and reconciles every
   `rg -n "<finding-id>" .` reference (goldens, register, research, intake). Then:

   ```sh
   npm run improvements:resolve -- --file improvements/<collection>/<finding>.md \
     --live-recheck "<dated command/URL/result>" \
     --review-evidence "<distinct reviewer and evidence>" \
     --references-reviewed --upstream-commented --dry-run
   ```

   Drop `--dry-run` only after the printed resolution comment is posted on every upstream ref. Use
   `--upstream-comment-na` for a finding that was never filed, `--upstream-ref-gone <url>` for a
   ref that GitHub now answers with 404, and `--resolving-ref` for each resolving issue or PR. The
   resolver appends the receipt, removes the intake override, deletes the file, and regenerates
   the index. A superseded or partly fixed record stays until its open ref carries a successor
   link. A regression after deletion gets a new ID that cites the receipt.
8. **Record a future check** only as a dated `.agents/TODO.md` entry that names the finding IDs,
   refs, and exact re-check, written so a stranger can act on it. Nothing schedules these entries;
   the next round reads the queue. When an upstream rate limit blocks an authorized filing, retry
   in the current session.

## Probes and cadence

In an eval round, file or update findings before the round closes. On a drift refresh, run the
probes, refresh statuses from live evidence, and run the live lint.


Optional frontmatter: `probe.type: http-text`, `probe.url`, and `probe.expect.status`, `contains`,
or `excludes`. `npm run improvements:probes` re-checks findings that are neither fixed nor declined.
A hit becomes a dated `recurrences` entry. A failure or inconclusive result is a review signal, not
a status change. Use `--include-declined` only on a drift round or with new evidence, and
`--service <s>` or `--exclude-service <s>` when the task has a collection boundary.

## Intake

`improvements/intake.json` maps services and per-finding overrides to `owner/repo`. When you add or
rename a repo, keep the string canonical and run `npm run improvements:lint -- --live`, which
checks every intake repo and every recorded GitHub URL.
