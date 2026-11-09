# Independent retirement review — 2026-11-09 improvements sweep

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), high. Authors: Codex `gpt-6.1-sol` lanes.
Coordinator: Claude Opus (hc t2dn). Brief: `tmp/review-brief.md`; skill step 6 of
`.agents/skills/improvements-pipeline/SKILL.md`.

All times are UTC on 2026-11-09. Every check below was run by this reviewer; no author output
was reused. Scratch bodies live outside the repo in the session scratchpad
(`/private/tmp/claude-501/-private-tmp-claude-501-raven-wt-impr/3d26a3c1-26b3-4d5c-a876-718087595a57/scratchpad/{sk039,sd064,devskill,compile}`).
No tracked file was edited. No GitHub comment, commit, push, deploy, paid call, or agent start.

| Candidate | Verdict | Blocking before the non-dry-run resolver |
|---|---|---|
| sk-039 | **retire** (no successor) | Final resolution comments are not yet posted on issue180, PR181 and handoff388; the three existing kalepail comments say the finding is *retained*. |
| sd-064 | **retire** (no successor) | No Raven comment exists on PR2945, and the resolver requires `--upstream-commented` because the finding records that ref. One golden case needs a `golden-truth` edit. |

---

## Batch 1 — sk-039 (author report `tmp/lane-skills.md`)

**Verdict: `retire`. No successor needed.** The original two wrong types are corrected on every
surface, including the ordinary Docs copy that kept the finding open on November 6. The fix is
deployed, not merely merged.

### 1. Finding and upstream refs, read directly

Finding: working copy and `git diff origin/main -- improvements/skills/sk-039-assets-token-interface-types.md`.
The diff is the status change `reported-upstream` → `fixed-upstream`, one new dated evidence line,
and a "Delivery verification, 2026-11-09" section. No earlier evidence was rewritten.

GitHub reads at 20:36:53–20:36:56 with `gh api repos/<repo>/pulls/181 --jq …`,
`…/pulls/181/files`, `…/pulls/181/reviews`, `…/issues/{180,181}/comments`,
`repos/stellar-experimental/stellar-raven/issues/388` and its comments.

| Ref | State | Who wrote what |
|---|---|---|
| [stellar-dev-skill PR181](https://github.com/stellar/stellar-dev-skill/pull/181) | merged 2026-11-06T18:41:20Z by `stellar-triage-bot[bot]`; head `ceeb2f17a0fd1da3f47e28c6a73a026883020c09`; merge commit `fb63412da70102edb527baf4cf3068f25713cd14`; 2 files | Author `stellar-triage-bot[bot]`. Zero formal reviews. Comments: `github-actions[bot]` preview notice (6692563800); `stellar-triage-bot[bot]` self-verification (6692578554), which is the bot reviewing its own diff, not an independent review; `kalepail` (6693081152), Raven's own **partial** result. |
| [stellar-dev-skill issue180](https://github.com/stellar/stellar-dev-skill/issues/180) | closed/completed 2026-11-06T18:41:22Z by `stellar-triage-bot[bot]` | Opened by `kalepail` (Raven filing). Three `stellar-triage-bot[bot]` comments (ack, "fix is in #181", "now live on skills.stellar.org"). Last comment by `kalepail` (6693080712) is Raven's **partial** result. |
| [stellar-raven issue388](https://github.com/stellar-experimental/stellar-raven/issues/388) | closed/completed 2026-11-06T19:06:50Z by `kalepail` | Handoff opened by `stellar-triage-bot[bot]`. One comment, by `kalepail` (6693081643): the same **partial** result. |

PR181's patch to `skills/assets/SKILL.md` changes exactly the recorded defect: `transfer` destination
`Address` → `MuxedAddress`, `symbol()` return `Symbol` → `String`. It also adds the `transfer_from`
entry, renames `approve`'s last parameter to `live_until_ledger`, and adds the generated-client note.
It adds an upstream eval scenario `evals/scenarios/assets/06-sep41-interface-types.json`.

**Author-report gap (not a verdict blocker).** The lane report names PR181, issue180 and
handoff388 only. The change that actually cleared the retained Docs residual is
[stellar/stellar-docs PR3072](https://github.com/stellar/stellar-docs/pull/3072), "skills: sync from
stellar-dev-skill@fb63412": author `stellar-triage-bot[bot]`, **approved by `ElliotFriend`
2026-11-09T15:33:53Z** and merged by `ElliotFriend` at 2026-11-09T15:34:01Z, merge commit
`5b0be48949367e76b8c6f035286f6b9feaa98ad1`, 8 files. Its only comment is a `mintlify[bot]` preview
notice. This is the one human-reviewed step in the chain. Found with
`gh api "repos/stellar/stellar-docs/commits?path=.mintlify/skills/assets/SKILL.md&per_page=5"`
(previous sync was `380f362e`, from `stellar-dev-skill@248c4ca`, 2026-11-06T15:15:33Z — the
pre-fix source, which is why the Docs copy was stale on November 6).

### 2. Deployed, not merely merged

- skills.stellar.org: `gh api "repos/stellar/stellar-dev-skill/actions/runs?head_sha=fb63412d…"`
  shows "Deploy site to GitHub Pages" run 42272963111 success (2026-11-06T18:41:59Z);
  `…/actions/runs/42273084054` is "pages build and deployment" on `gh-pages`, success at 18:42:40Z.
  Live response header `last-modified: Fri, 06 Nov 2026 18:42:35 GMT`.
- Docs: `gh api "repos/stellar/stellar-docs/compare/5b0be489…...main"` → `ahead`, `behind_by: 0`
  (the sync commit is in `main`). The live Docs response carries
  `source: https://github.com/stellar/stellar-dev-skill/tree/fb63412da70102edb527baf4cf3068f25713cd14/skills`
  in its frontmatter and is byte-identical to `stellar-docs` `main` `.mintlify/skills/assets/SKILL.md`.

### 3. Fresh trigger execution

`curl -sS -L -o <file> -D <headers> <url>`, then `shasum -a 256` and `git hash-object`. No query
parameters unless stated. All at 20:37:09 unless stated.

| URL | HTTP / bytes | SHA-256 | Git blob |
|---|---|---|---|
| https://developers.stellar.org/.well-known/agent-skills/assets/skill.md | 200 / 22768 | `2eb7c204a64a3db48178ef3ca546bcf973048f76aa33060e7e048d5a9b481c7e` | `2041064eddf91504433b83af62beee88ad399dce` |
| https://skills.stellar.org/skills/assets/SKILL.md | 200 / 19663 | `c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146` | `e6493237cbc9c236a7ec9f5bfb179faf3d105cde` |
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/assets/SKILL.md | 200 / 19663 | `c88cc424…1146` | `e6493237…` |
| https://raw.githubusercontent.com/stellar/stellar-dev-skill/ceeb2f17a0fd1da3f47e28c6a73a026883020c09/skills/assets/SKILL.md (Raven pin) | 200 / 19663 | `c88cc424…1146` | `e6493237…` |
| https://raw.githubusercontent.com/stellar/stellar-docs/main/.mintlify/skills/assets/SKILL.md (20:37:49) | 200 / 22768 | `2eb7c204…1c7e` | `2041064e…` — `cmp` identical to the ordinary Docs body |

Ordinary Docs body, lines 373 and 380–391 (the other three copies have the same text one line earlier):

```
373:    token.transfer(&from, &to, &amount);
381:- `transfer(from: Address, to: MuxedAddress, amount: i128)`
382:- `transfer_from(spender: Address, from: Address, to: Address, amount: i128)`
383:- `approve(from: Address, spender: Address, amount: i128, live_until_ledger: u32)`
386:- `name() -> String`
387:- `symbol() -> String`
389:Only `transfer` takes a `MuxedAddress` destination. The generated
390:`TokenClient` accepts `impl Into<MuxedAddress>` there, so pass an `&Address`
391:as `&to` (as above), never `&to.into()`, which fails to compile (E0283).
```

Neither `to: Address` on `transfer` nor `symbol() -> Symbol` appears in any of the five bodies.

**Cache check.** The ordinary Docs response had `cache-control: public, max-age=86400`, `age: 370`
and `last-modified: Mon, 09 Nov 2026 20:30:58 GMT` — the cached object was created by the author's
own 20:30:57 request. To rule out a lucky cache entry I also requested, at 20:38:22:
`…/agent-skills/assets/skill.md?rv=<epoch>` (cache-busted), `/.well-known/skills/assets/SKILL.md`
and `/.well-known/skills/assets/skill.md`. All three: HTTP 200, 22768 bytes, SHA-256 `2eb7c204…1c7e`.
`https://developers.stellar.org/.well-known/agent-skills/index.json` (20:38:11, HTTP 200) publishes
the assets digest `sha256:2eb7c204…1c7e`, matching the body. The origin, the index, the alternate
paths and the Docs repo source all agree, so this is a real publication, not a cache artifact.

**Authority, re-derived.**
- https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0041.md
  (20:37:09, 200 / 13308 bytes, SHA-256 `c9742e8dd6bfc925d73df0284712f9f09b2adc14be708b8c19b34da098e4abaf`,
  Version 0.5.2): line 97 `approve(… live_until_ledger: u32)`, 123 `transfer(… to: MuxedAddress …)`,
  145 `transfer_from(… to: Address …)`, 186 `name … -> String`, 189 `symbol … -> String`.
- https://raw.githubusercontent.com/stellar/rs-soroban-sdk/main/soroban-sdk/src/token.rs
  (20:38:34, 200 / 19026 bytes, SHA-256 `9473b99a6056c3d169f2f8bec36e94e1b3db6f20bc85b26034edf3c0f3138e65`):
  lines 128, 160, 186, 243, 250 declare the same five signatures. Latest release is v29.0.1
  (2026-10-12T22:19:44Z). `muxed_address.rs` has `impl From<&Address> for MuxedAddress` (line 188).

**Fresh compile (offline, local registry, soroban-sdk `=29.0.1`).** The fix added a new compile
claim, so I tested it rather than trust the bot's or Raven's November 6 transcripts.
`cargo check --offline` in two scratch crates that differ in one token:
- `token.transfer(&from, &to, &amount);` plus `token::Client::…symbol() -> String` — 20:38:46, **exit 0**.
- `token.transfer(&from, &to.into(), &amount);` — 20:39:02, **exit 101, E0283**: "multiple `impl`s
  satisfying `soroban_sdk::MuxedAddress: From<&_>`" (`From<&Address>` and `From<&MuxedAddress>`).

The retained client example is valid, `symbol()` returns `String` in a real build, and the added
"never `&to.into()`" note is true in the untyped context it shows.

### 4. Adjacent scan

Downloaded the skill repo at the merge commit
(`https://codeload.github.com/stellar/stellar-dev-skill/tar.gz/fb63412d…`, 20:38:08) and ran `rg`
across every skill for the same two wrong types and for every `transfer(`, `transfer_from(`,
`symbol(`, `MuxedAddress` and `to.into()` mention.

- No other `symbol() -> Symbol` and no other SEP-41 interface line with an `Address` transfer
  destination anywhere in the repo.
- `skills/smart-contracts/development.md:98` and `:309` already state the `MuxedAddress` destination
  and the same `&to` / E0283 guidance. They agree with the corrected assets list.
- `skills/smart-contracts/development.md:120` and `:278` show `pub fn transfer(env, from: Address,
  to: Address, amount: i128)`. These are generic contract-function examples in the Authorization and
  Errors sections. Neither claims to implement SEP-41. **Not a residual.**
- `skills/smart-contracts/development.md` "Allowances expire" bullet writes the informal call shape
  `approve(from, spender, amount, expiration_ledger)`. SEP-41 and the SDK name that parameter
  `live_until_ledger`, and PR181 renamed it in the assets list. This is an untyped parameter *name*
  in prose in another file; a positional Rust caller is unaffected. It is outside sk-039's defect
  (two wrong types) and too thin to stand alone. **No successor**; do not file it by itself. Carry
  it only if a later finding touches that paragraph.
- The assets list still omits `burn`, `burn_from`. The list was always a partial summary and the
  finding never asked for completeness. Not a residual.

Not checked: whether Raven production currently serves the pinned blob. That is an own-repo
deployment question, not an upstream-finding gate. `catalog/manifest.json` and
`ecosystem-skills/MANIFEST.json:225` in this worktree do pin blob `e6493237…` at commit `ceeb2f17…`.

### 5. Persistent references (`rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "sk-039" .`, 20:37)

Must change at retirement:
- `improvements/skills/sk-039-assets-token-interface-types.md` — deleted by the resolver.
- `improvements/intake.json:262–265` — per-finding override, removed by the resolver.
- `improvements/INDEX.md:24` — still shows `reported-upstream`; regenerated by the resolver.
- `improvements/resolved.json` — new receipt appended.
- `.agents/TODO.md:57–66` — the whole "Recheck sk-039 after the Docs skill copy updates" entry is
  now done; remove it. If the "Improvements follow-up" heading is left with only the next entry,
  that is fine.
- `.agents/rounds/2026-11-09-improvements-sweep.md:18` — add the outcome for this round.

Leave unchanged (dated records):
- `improvements/resolved.json:2142` — the sk-038 receipt says "sk-039 retains the unrelated type
  residual". True as of 2026-11-06; the new sk-039 receipt closes the loop.
- `.agents/rounds/2026-11-06-assets-type-handoff.md`, `.agents/rounds/2026-11-06-playground-final-resolution.md`.
- `research/audits/2026-11-06-assets-type-handoff/{independent-review.md,public-comments.json}`,
  `research/audits/2026-11-06-playground-final-resolution/handoff-retirement-review.md`.

No reference in `eval/qa/corpus/`, `eval/qa/cases.json`, or any other active finding. The file has
no `probe` block.

### 6. What the coordinator still owes before `improvements:resolve` without `--dry-run`

1. **Resolution comments are not posted.** Each recorded ref's last Raven comment says "We retain
   sk-039 … Please propagate the corrected source to the Docs skill copy." That request is now
   satisfied and the public thread still reads as open. Post the resolver's printed comment (live
   result, 2026-11-09 timestamp, SHA-256 `2eb7c204…1c7e`, commit-pinned source) on issue180, PR181
   and handoff388, then read each back with `gh api … --jq .body` before asserting
   `--upstream-commented`. This is a "deployed fix that needs a verification result", so it is
   within the no-noise rule.
2. **Commit-pinned source.** The `fixed-upstream` version of the finding exists only in this dirty
   worktree. The comment's permalink and the receipt's `sourceCommit` must point at a pushed commit
   whose blob matches the file being resolved.
3. **Resolving refs.** Pass `--resolving-ref` for
   `https://github.com/stellar/stellar-dev-skill/issues/180`,
   `https://github.com/stellar/stellar-dev-skill/pull/181` and
   `https://github.com/stellar/stellar-docs/pull/3072`. Without explicit flags the resolver defaults
   to every recorded ref, which would list the Raven handoff388 as resolving work and omit the Docs
   sync that actually cleared the residual. Name PR3072 in `--live-recheck` or `--review-evidence`
   text rather than adding its URL to the finding: a URL in the finding becomes a commentable ref
   and would oblige a comment on a routine bot sync PR.

Suggested `--live-recheck`: "2026-11-09T20:37:09Z ordinary GET
https://developers.stellar.org/.well-known/agent-skills/assets/skill.md HTTP200 SHA256
2eb7c204a64a3db48178ef3ca546bcf973048f76aa33060e7e048d5a9b481c7e: transfer destination MuxedAddress,
symbol() -> String, transfer_from destination Address; cache-busted and /.well-known/skills/ copies
and stellar-docs main .mintlify source identical; skills.stellar.org, source main and pin ceeb2f17
SHA256 c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146."

---

## Batch 2 — sd-064 (author report `tmp/lane-docs.md`)

**Verdict: `retire`. No successor needed.** Every old meeting-author URL now redirects to the
meetings index and ends HTTP 200. That is the fix the finding itself named as the smallest
acceptable one, and its recorded smallest recheck passes.

### 1. Finding and upstream ref, read directly

Finding: working copy and `git diff origin/main -- improvements/stellar-docs/sd-064-meeting-author-pages-404-after-migration.md`.
The diff is the status change and one new evidence line. The 2026-11-06 recurrence is kept.

`gh api repos/stellar/stellar-docs/pulls/2945 …`, `/files`, `/reviews`, `issues/2945/comments`,
`pulls/2945/comments` at 20:39:25; check runs at 20:41:15.

- [stellar-docs PR2945](https://github.com/stellar/stellar-docs/pull/2945), "fix(redirects): redirect
  old Docusaurus meeting listings". Author `ElliotFriend` (opened 2026-10-22, before Raven's
  finding). **Raven did not open it and has never commented on it.**
- Merged 2026-11-09T17:05:10Z by `ElliotFriend`; head `5187629cf2b6c0c054587e34edb45624c5246a5d`;
  merge commit `88c539971e605d01e5f1ee7f71efd1669ca1db5e`. One file, `redirects.json`, +24/−0.
- Review: `kaankacar` APPROVED at 17:04:52Z on the merged head.
- Check runs on the head, all `success`: complete, CodeQL, Socket Security: Pull Request Alerts,
  Mintlify Deployment, Socket Security: Project Report, checks, Analyze (actions),
  Analyze (javascript-typescript). The author's "all eight head checks successful" is correct.
- Comments: `mintlify[bot]` preview (6349703248); `gre3n3yes34` (6355174769), an off-topic
  mailing-list reply; `ElliotFriend` (6746164895) answering that off-topic reply. No comment claims
  or disputes the fix. No review comments.

The patch adds six rules, all to `/meetings`: `/meetings/archive`, `/meetings/authors`,
`/meetings/authors/:slug*`, `/meetings/page/:slug*`, `/meetings/tags`, `/meetings/tags/:slug*`.

### 2. Deployed, not merely merged

`gh api "repos/stellar/stellar-docs/compare/88c53997…...main"` → `ahead`, `behind_by: 0`.
`https://raw.githubusercontent.com/stellar/stellar-docs/main/redirects.json` (20:40:21, HTTP 200)
contains all six rules. The live site answers the old paths with 308 (below), served by Vercel
deployment `x-version: dpl_42LwxxU1kGN114H4XzwGYXa9ZDah`, `x-mintlify-client-version: 0.0.4094`.

### 3. Fresh trigger execution

Per path: `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' <url>` for the first hop, then
`curl -sS -L …` to the end. Window 20:39:36–20:39:55. Base `https://developers.stellar.org`.

| Path | First response | After following | 
|---|---|---|
| `/meetings/authors/kalepail` (original trigger) | 308 → `/meetings` | 200, 1 hop, `/meetings` |
| `/meetings/authors/kalepail/` | 308 → `/meetings/authors/kalepail` | 200, 2 hops, `/meetings` |
| `/meetings/authors` | 308 → `/meetings` | 200, 1 hop |
| `/meetings/authors/` | 308 → `/meetings/authors` | 200, 2 hops |
| `/meetings/authors/elliotfriend`, `carstenjacobsen`, `anataliocs`, `naman`, `julian`, `kaankacar` (the other six keys from the pre-migration `authors.yml`) | 308 → `/meetings` each | 200, 1 hop each |
| `/meetings/authors/kalepail/page/2` | 308 → `/meetings` | 200, 1 hop |
| `/meetings/authors/nonexistent-zzz` | 308 → `/meetings` | 200, 1 hop |

Every followed response is the same body: 421040 bytes, SHA-256 prefix `258d65c903554861`,
`<title>Meeting Notes - Stellar Developer Docs</title>`, with 90 distinct `/meetings/YYYY/MM/DD`
links. It is the real index, not a soft 404.

The finding's own smallest recheck, `curl -sIL https://developers.stellar.org/meetings/authors/kalepail`:
`HTTP/2 308`, `location: /meetings`, then `HTTP/2 200`. **Passes.**

The author checked 4 URLs. I extended to all seven author keys, both trailing-slash forms, a
paginated author path and an unknown key. Same result everywhere.

### 4. Adjacent scan

- Sibling Docusaurus listings from the same PR, same window: `/meetings/archive`, `/meetings/tags`,
  `/meetings/tags/soroban`, `/meetings/page/2`, `/meetings/page/8` — each 308 → `/meetings` → 200.
- Old `/meeting-notes` (200 after 2 hops) and `/meeting-notes/tags` (200 after 1 hop) still resolve.
- Feeds (20:40:26): `/meetings/rss.xml` 200, `/meetings/atom.xml` 200, `/meetings/feed.json` 404.
  I have no evidence the Docusaurus site ever served `feed.json` (it is opt-in there), and PR2945's
  body accounts for all 25 old-sitemap 404s as listing pages. Not a residual; do not file.
- **Per-author roster is not restored.** The finding's impact sentence says readers "lose the
  author's post list", and that remains true: the redirect lands on the undifferentiated index.
  The finding's Recommendation offered "add the author pages back … **or** add redirects", called
  the redirect "the smallest fix", and defined the recheck as "HTTP 200 after a redirect or
  directly". The owner chose the redirect deliberately (PR body: "The listings go to `/meetings`").
  The recorded bar is met. A successor asking for author pages would re-litigate an accepted owner
  choice with no new evidence. **No successor.**
- The content the lost roster pointed to is intact: `/meetings/2024/01/26`, `/2024/02/08`,
  `/2024/02/22`, `/2024/06/13` each return 200 with the "Tyler van der Hoeven" byline (20:40:21),
  and the index links all of them.

### 5. Persistent references (`rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "sd-064" .`, 20:39)

Must change at retirement:
- `improvements/stellar-docs/sd-064-meeting-author-pages-404-after-migration.md` — deleted by the resolver.
- `improvements/INDEX.md:57` — still `reported-upstream`; regenerated.
- `improvements/resolved.json` — new receipt.
- **`eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json`** (through the
  `golden-truth` skill), then regenerate **`eval/qa/cases.json`** (line 4944) with its owner script:
  - `golden.notes` cites the active path `improvements/stellar-docs/sd-064` as the reason "an answer
    need not cite" the author index. After deletion that pointer dangles. Reword it to the resolved
    state: since 2026-11-09 the old author URL redirects (308) to the generic `/meetings` index; no
    per-author list exists; the seven dated meeting pages remain the source; cite the resolved
    ledger entry for sd-064.
  - Add a dated `truth.verified` entry for this change (`rootCause` `freshness-drift`). The current
    one, dated 2026-11-03, records "HTTP 404 … Remove the dead author index from current sources".
  - `golden.answer` says "on 2026-11-02 it returned HTTP 404". That sentence is dated and still
    true. I do not require an answer change; the author report's "update the active 404 wording"
    is satisfied by the notes edit. If the coordinator does touch the answer, keep the dated 404
    observation and add the redirect as a later dated fact, so a model that reports the redirect
    and a model that reports the historical 404 both grade correctly.
  - The `truth.corroboration` entries that cite the author URL carry dated observations
    (2026-07-13, 2026-09-30, 2026-11-02 16:31:54Z). Keep them as history.
  - Gates for this edit: `npm run eval:qa:lint -- --stale --enforce-floors`,
    `npm run eval:qa:register -- --check`, and the generated-artifact sync check. Check the
    paired-run freeze before changing a golden case.
- `.agents/rounds/2026-11-09-improvements-sweep.md:17` — add the outcome.

Leave unchanged (dated records): `.agents/rounds/2026-11-02-golden-audit/pass3/peer-handoff.json`,
`.agents/rounds/2026-11-02-upstream-filing.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`,
`.agents/rounds/2026-11-05-truth-maintenance/docs.md`,
`.agents/rounds/2026-11-06-remaining-sweep/{docs.md,docs-actions.json}`,
`research/audits/2026-11-03-qa-followup/case-dispositions.json`,
`research/audits/2026-11-06-remaining-sweep/{docs-evidence.json,docs-live.py}`.

No reference in `.agents/TODO.md` or `improvements/intake.json`. No `probe` block. No other active
finding cites sd-064.

### 6. What the coordinator still owes before `improvements:resolve` without `--dry-run`

1. **Upstream comment gate.** Raven never filed an issue for sd-064, but the finding records PR2945,
   so `scripts/improvements-resolve.mjs` (lines 56–58) demands `--upstream-commented`;
   `--upstream-comment-na` is only accepted when the finding records no ref. No Raven comment exists
   on PR2945 today. Post one short verification result there (a deployed fix that needs a
   verification result is an allowed comment) and read it back. Keep it to the live result and the
   commit-pinned source; the thread already has an off-topic exchange, so do not add more than that.
2. **Commit-pinned source**: same as sk-039 — the `fixed-upstream` file is uncommitted.
3. **Evidence-line precision** (optional, not blocking): the new evidence line is dated
   "2026-11-09 sweep" with no time, and says the trailing-slash URL is "HTTP308 → /meetings". It is
   two hops (308 → slashless path → 308 → `/meetings`). Put a timestamp in `--live-recheck`.

Suggested `--live-recheck`: "2026-11-09T20:39:36Z–20:39:55Z GET
https://developers.stellar.org/meetings/authors/kalepail HTTP308 location /meetings → HTTP200
'Meeting Notes' index; same for /meetings/authors, the trailing-slash forms, and all seven
pre-migration author keys. stellar-docs main redirects.json holds the six PR2945 rules (merge
88c539971e605d01e5f1ee7f71efd1669ca1db5e, 2026-11-09T17:05:10Z)."

---

## Reviewer record for the receipts

Tier/model/effort: Claude Fable / `claude-fable-5-2` / high. Differs from the authors
(Codex `gpt-6.1-sol`) and from the coordinator (Claude Opus). Evidence file: this document. Like
every file under `tmp/`, it is gitignored; promote the parts the receipts cite into the round
ledger or `research/audits/` before the resolver records it as review evidence.
