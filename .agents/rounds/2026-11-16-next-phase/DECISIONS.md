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

## Follow-up answers (2026-11-18)

The owner answered the proposal to audit `.agents/TODO.md` on 2026-11-18. The same section records
the outcomes that the 7.x items decided without a separate owner question.

- **TODO audit** (round item 8.1). Owner: "sounds good, rewrite for watching, put this and the Your
  call items into TODO and audit and ensure that TODO has all the right stuff for the right reasons
  well scoped and detailed and accurate to the current state".
- **RWA (issue #167) closed as excluded by measurement** (round items 6.3 and 7.2). The orchestrator
  closed the issue on 2026-11-18 as "decided: excluded by measurement", on the owner's 7.2
  instruction ("I'd love to be able to reasonably clear the RWA issue if possible"). The three
  re-open triggers (a Scout `/api/rwa` schema change, a general mixed-intent routing mechanism, or
  an owner product need) are in the TODO item "Preserve structured routing intent across extraction
  caps and gate tiers".
- **OAuth provider 1.x, choices D1 and D2** (round item 7.3, PR 4). The orchestrator decided them
  under the owner's "decide and execute what sticks". D1: one provider per served origin. D2: a
  native-callback allowlist (https, loopback http, `claude:`, `cursor:` and `warp:`). The same
  delegation covers the accepted loss of the bare-origin grants (fewer than 10, all Devin CLI); the
  owner does not use Devin. See [DESIGN.md](items/7.3/pr4-oauth/DESIGN.md). The TODO item "Watch
  sign-in rejects after the oauth-provider 1.x deploy" holds the watch.
- **Playground output cap: no change.** The 3.1 production read found replies that stopped at
  `DEMO_CAPS.maxOutputTokens` (4096) rare. Lead's call, open to owner veto.
- **Docs audit** (round item 8.2). Owner: "We should probably work with Fable and Sonnet to audit
  and review all docs around this repo to ensure accuracy, cleanliness, organization, etc."

- **Owner answers to the item 8.2 questions** (2026-11-18):
  - Models. Owner: "don't tune by specific model version anywhere, just those model familes at
    their latest". Agent launch lines, the roster, skills, eval defaults and docs name a model
    family and take its latest model; a run records the model ID it resolved. Round item 8.3 applies
    it.
  - Families everywhere (round item 8.4). Owner (2026-11-18): "We should update all things everywhere
    around this to not name versions but rather familes running the latest version. e.g. there are
    new Sol and Astra versions that came out recently". This supersedes item 8.3's choice to leave
    the dated briefs and `briefs/ITEM-LEAD.md` pinned: they now name families and resolve the newest
    model at launch with `scripts/latest-model.mjs`. Records keep the model they ran on.
  - Partner detail in public history: answered in conversation; no further action recorded.
  - Observability retention. Owner: "30 is an allowance, today we have 7. I'd like to convert to
    actually doing 30 everywhere. Do this work carefully, or plan for it maybe for now in TODO."
    Planned in the TODO item "Keep 30 days of observability data, including queries and responses".
  - ADRs for the per-origin OAuth design and the stellar.org admission. Owner: "just write a TODO
    that says we'll want that if and when we tackle it". Done as a TODO item.
  - Counsel review of skill forwarding. Owner: "nah, I don't want to fiddle with this. We should be
    forwarding or proxy'ing not storing and copying. That's already been approved." Closed: Raven
    serves pinned skills by forwarding and stores no skill body (`THIRD-PARTY-NOTICES.md`,
    "Ecosystem skills — served, not stored").

## Follow-up answers (2026-11-18, subscriptions first)

The owner asked why the repository holds an AI Gateway judge. Round item 8.6 applies the answer.

- **No AI Gateway judging.** Owner (2026-11-18): "I see some stuff around gateway judges, why? There
  should be NO gateway judging, everything possible should be handled by subs and at the very least
  run through opencode vs scripts or something that call raw cloudflare API gateway. We should be
  using subs though via codex, claude, grok and opencode, this is very important for cost and we need
  to make this quite important and standard. There may be times when we utilize AI gateway but not for
  evals or the building and testing of the service except or rare, known, and reasoned exceptions"
- **Standing OpenCode rule** (answer 7, quoted): "I don't want to spend AI credits on evals and tests
  so if you use opencode you need to first probe and find a grok, openai or anthropic sub that you can
  use so you don't spend API tokens."
- **Applied by item 8.6.** The gateway judge is removed; stored verdicts stay readable. AGENTS.md
  holds the rule, and `eval/EVALS.md` "Model-call billing" holds the exception list and the OpenCode
  probe.

## Follow-up answers (2026-11-19, Playground billing)

The owner asked whether the two Playground exceptions (E1 and E2) can run on subscriptions. Round
item 8.7 applies the answers.

- **E1 and E2 scope.** Owner (2026-11-19): "That might be fine unless the models it's testing exist
  and are able to be tested with subs vs ai gateway"
- **Balance.** Owner (2026-11-19), after the orchestrator replied that Terra (Codex), Haiku (Claude
  Code) and Grok (Grok CLI) exist on subscriptions, Kimi (Workers AI) does not, and no subscription
  CLI reproduces the Playground's own system prompt, tool loop and Gateway routing: "These are good
  points and may be a good reason to allow tests to run on cloudflare ai gateway. REview carefully
  and ensure there's the right balance there to ensure we can run fully accurate tests but where
  subs can reasonably and accurately be used, do that"
- **Second judge.** Owner (2026-11-19): "Why use opencode for chatgpt vs just using codex or grok?"
  The orchestrator answered: tool-blindness. Codex has no all-tools-off control, Grok's empty
  `--tools` allowlist is unproven, and OpenCode's deny-all is verified offline.
- **Outcome.** E1 and E2 stay as product exceptions, scoped by question: the Gateway path serves
  only questions about the Playground's own transport, prompt, tool loop, caps, fallback or a
  Gateway-only model. Questions about which model answers Raven questions best, or about the MCP
  tool surface, go to subscriptions (the QA runner, and Codex and Grok `hc` lanes). A shared MCP text
  change adds a Playground E1 sample only when it is about a constraint the Playground caps or
  overrides, or matched stored transcripts show it moves top-level `search` and `execute` calls across
  a cap (the rule in the `eval/EVALS.md` question table). The gauntlet
  default is the shipped tuple, each model alone, not the three eval clients. Q9 and Q10 (model and
  surface questions) run on subscriptions. Second judge: Codex 0.169.0 is not tool-blind at the
  definition level (offline `codex debug prompt-input`, no model call). Grok 1.0.88 is not
  execution-blind on one probe (`--tools ""` restricts nothing). OpenCode stays the candidate. See
  [items/8.7/PLAN.md](items/8.7/PLAN.md), [probes/PROBE.md](items/8.7/probes/PROBE.md) and
  [EXEC.md](items/8.7/EXEC.md).

## Follow-up answers (2026-11-19, no per-run approvals)

The orchestrator asked the owner, after item 8.7: "do you want a standing authorization for the
shipped-tuple smoke (about USD 0.45 per model-path change)?" Round item 8.8 applies the answer.

- **Answer.** Owner (2026-11-19), verbatim: "we can honestly remove all per turn or per request
  approvals, I don't want to be approving things, we should relax these guidelines anywhere and
  everywhere they show up especially for sub use"
- **Effect on earlier answers.** This answer supersedes the second sentence of answer 1 ("No paid QA
  run without a new written authorization"). Its first sentence ("No third tuning loop") stands.
  Answer 1's own text above is unchanged. A QA headline run starts only when a named decision needs
  it (`run-evals` section 1).
- **Applied by item 8.8.** No run needs anyone's approval, signature or confirmation flag.
  Subscription runs need none of any kind. Every API-billed run carries a dollar cap and is
  recorded with its cost, answer count and reason in the round ledger or item record. The
  automatic guards stay: the pre-run billing checks, the exception list for AI Gateway and its
  allowlist test, the identity pins and budget ledgers, and "never in a gate sweep". AI Gateway
  judging stays out without exception (owner, 2026-11-18). An API-billed path outside the exception
  list first joins it in a reviewed pull request.
- **Code.** `--confirm-paid` is removed from the gauntlet (E2) and the Playground evaluation (E1).
  Both require exactly one `--max-budget-usd` on every model-backed launch, with no built-in
  default. `--round-cap-context` is optional on E1 and the run records a single-run context
  without it. The paired-collection launch flag is `--plan-sha256`.
- **Default caps** (documented in `eval/EVALS.md` "Sizing"): E2 shipped-tuple gauntlet USD 1; E2 on
  one candidate USD 1; E1 USD 0.20 per selected case rounded up to a whole dollar, minimum USD 2
  (30 cases: USD 6); one candidate all in is two invocations (gauntlet 1, E1 30 cases 6; expected
  total USD 3.75). A cap above a default is the lead's call and is recorded.
- **Not reached.** Per-request approvals outside runs: the Worker's end-user consent, Lumenloop
  paid research, Mintlify admin, outward-facing posts, merge and deploy gates. See
  [items/8.8/EXEC.md](items/8.8/EXEC.md).

## Timing

The work for the P30 Mainnet vote runs from a one-shot timer on agentpc at
2026-11-23 18:00 UTC. Item 1.4 sets the timer up. It merges before 2026-11-25 00:00 UTC.
