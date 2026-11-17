# Owner decisions on the next-phase plan (2026-11-16)

The owner answered the eight decisions in [PLAN.md](PLAN.md) on 2026-11-16. These answers bind
every lane in this round and override PLAN.md where they differ.

## How the work runs

- Owner: "Do all of these recommendations which are sequential and obvious and well scoped. Just
  do them sequentially in their own Opus plan, Fable review and Sonnet execute."
  - Items run one at a time. Each item gets an Opus lead that writes the item plan, a Claude Fable
    review of that plan, and a Claude Sonnet 5.5 executor.
  - Reviews that a skill or a security boundary requires still run in addition, for example the
    Codex frontier read of skill-pin drift in `live-drift-resolution`.
- Owner: "agentpc should be reachable now, run it all there for what you can." Lanes run on
  agentpc. Only work that needs a Mac-only credential or folder runs on the Mac.
- Owner: "If there's any lack of clarity or conviction, ask questions." A lead that lacks
  conviction writes the question in its report and stops. It does not guess.

## Answers

1. **No third tuning loop. No paid QA run without a new written authorization.** Owner: "fine if
   you have conviction here." The orchestrator has that conviction, so this is adopted.
2. **Held-out integrity without a re-draw.** Owner: "sure." Adopt both parts:
   - (a) Commit the Jaccard ≥ 0.8 overlap list of routing rows against the 247 headline
     questions, and treat those rows as confirmation-only.
   - (b) On agentpc, move the one exposed held-out row to the tuning set by a dated amendment.
3. **Docs titles hold.** Owner: "sounds good." Absorb fresh titles if the free A/B in item 0.2
   passes its rule.
4. **Upstream posting.** Owner: "sure, don't cap the submissions though, submit as many as there
   are and if it's just too many ensure you track them durably in the Improvements so we can
   submit them later. Don't be pedantic but most of these repos are monitored by agents so they
   won't be overwhelmed and hopefully over time the number will go down as the services and
   surfaces get better and more fully covered."
   - Standing authority covers issues and resolution comments, never pull requests.
   - There is no per-repository cap: post every verified finding.
   - Anything not posted stays `verified` in `improvements/` with a note, so it can be posted
     later.
5. **Live-data weakness.** Owner: "I think we can accept the loss ... I like cheaper context
   filling for a little quality loss which we may be able to pick up elsewhere with better tool
   description tuning or endpoint routing."
   - Accepted. Close the TODO item.
   - ADR-0011's reopening rules stand. Rule 3 reads: a fix for the live-data weakness that gives
     back most of the token saving reopens the trim. The owner's intent beside it: a fix that keeps
     most of the token saving reopens the question of the loss.
6. **Sources.** Owner: "sounds good, do it." Adopt all three parts:
   - (a) PH3 stays closed.
   - (b) The Dashboard API and a release source are decided after the 3.1 telemetry read.
   - (c) File the National Bank of Ukraine (NBU), scam-recovery and Pi Network content gaps.
7. **Client diagnostic.** Adopted for after phase 1, on GPT-6.1 Terra (Codex CLI) and Grok 4.7
   (Grok CLI). Cap: USD 8 per client, subscription-equivalent.
   - Owner, on adding OpenCode: "I don't want to spend AI credits on evals and tests so if you use
     opencode you need to first probe and find a grok, openai or anthropic sub that you can use so
     you don't spend API tokens."
   - OpenCode joins only if a subscription login (OpenAI, Anthropic or xAI) works inside it.
     Probe that first. Never use AI Gateway, Workers AI or any per-token API path.
   - Sonnet 5.5 is already the answering client of every QA run, so it is not re-measured here.
8. **Branches.** Owner: "yeah, keep things clean, just be careful never to delete work that hasn't
   been considered or wrapped into the main project. Losing work without careful consideration is
   a big no-no."
   - Before anything is deleted, each branch's content that is absent from `main` gets a written
     disposition: already on `main`, brought into `main`, or archived in the bundle with a reason.
   - This covers remote branches, local branches on the Mac and on agentpc, and agentpc worktrees,
     including their untracked and ignored files.
   - The bundle is verified before any deletion.

## Follow-up answers (2026-11-17)

The owner answered the follow-ups after the round on 2026-11-17. The orchestrator decided the FAM
rows on the owner's deferral.

- **stellar.org findings.** Owner: "Do these even belong? They seem separate to the concerns those
  sites actually serve". `sd-077` and `sd-111` belong, and the owner forwards them to the SDF web
  team. `sd-113` does not belong and is not forwarded.
- **`scout.matchPartners`.** Removed by round item 5.1, on the owner's "isolated rare events likely
  don't constitute making everything call and experience worse, more expensive".
- **stellar.org displacement.** Closed as accepted. Owner: "sounds good if you really believe it and
  there's no clear obvious compromise".
- **FAM rows.** The owner deferred to the orchestrator. Decision: no move, and the sealed set stays
  sealed and unspent.
- **Maintenance exception.** Owner: "sure, if you think that's warranted and worth it". Adopted
  ([`eval/qa/README.md`](../../../eval/qa/README.md), "Held-out split"). It narrows the README rule
  that every seen case moves. Answer 2 is unchanged. An exposure outside a maintenance lane still
  moves the case.
- **OpenCode.** Kept out of client diagnostics. OpenCode 2.2.7 offers Anthropic only through an API
  key. The owner logged OpenCode in with ChatGPT and SuperGrok on 2026-11-17, on the Mac and on
  agentpc, each checked with one trivial prompt, so those subscription logins exist if the item
  reopens.

## Follow-up answers (2026-11-17, assumptions review)

A Fable assessment of the assumptions behind the open holds proposed three changes. It is the source
of the proposals, not a verdict. The owner answered each on 2026-11-17. The items run one at a time,
in the order 6.1, 6.2, 6.3.

- **RWA re-test** (round item 6.3). A free ranking run, then a roughly 20-answer Sonnet 5.5 A/B on the
  subscription CLI. Owner: "do it".
- **Docs titles hold** (round item 6.2). Ended with a one-time re-baseline. Owner: "eval with Fable,
  Opus and Sonnet and decide and proceed".
- **`@cloudflare/codemode` 0.5.1 to 0.5.6** (round item 6.1). Owner: "makes sense, do it, updates and
  progress is good especially if there are new features we can benefit from".

## Follow-up answers (2026-11-17, after item 6.3)

The owner answered three proposals after item 6.3 on 2026-11-17. The items run one at a time, in the
order 7.1, 7.2, 7.3.

- **Keep agents out of the case folders** (round item 7.1). Owner: "review carefully on pros and cons
  and decide against a Fable and Sonnet hc agent and then carry out and if there are files and folders
  or data that should just be flushed or code paths that should be removed, do so, just carefully and
  with consideration".
- **RWA card caveat and A/B** (round item 7.2). Owner: "sounds good, do it, I'd love to be able to
  reasonably clear the RWA issue if possible".
- **Dependency updates** (round item 7.3): routine patches, then `agents` 0.33 and the MCP SDK 2.4,
  then the OAuth provider 1.x with a security review. Owner: "sounds good, research, review, test and
  eval and decide and execute what sticks".

## Timing

The work for the P30 Mainnet vote runs from a one-shot timer on agentpc at
2026-11-23 18:00 UTC. Item 1.4 sets the timer up. It merges before 2026-11-25 00:00 UTC.
