# Solo agent orchestration research — 2026-07-15

> [!IMPORTANT]
> **Superseded 2026-08-25. Solo is no longer used by this repository.** Agent, pane, and worktree
> orchestration runs on Herdr; durable working state lives in `.agents/TODO.md` and
> `.agents/rounds/`. The recursive-ownership conclusion below survived the move and now governs
> panes — see `AGENTS.md` “Coordination” and the global `herdr` skill. Everything else here is a
> dated record of Solo-era reasoning. Do not treat any `solo://` reference as a live path.

## Scope and method

This review asked how Solo should coordinate project processes and cross-lab coding agents, and
which durable instructions belong in `AGENTS.md` versus a triggered skill.

Evidence classes:

1. Live Solo MCP catalog/help and Solo Docs snapshot generated
   `2026-07-15T15:33:15.013Z`.
2. Current local runtime commands and `research/agent-model-roster.md`.
3. Four Parallel CLI advanced searches covering lab architectures, software-team practice,
   empirical failure research, videos/posts, and current model/effort documentation.
4. Primary-page extraction for sources that materially affected policy.

Search artifacts:

- `/tmp/multi-agent-orchestration-patterns.json`
- `/tmp/agentic-software-teams.json`
- `/tmp/multi-agent-failure-evidence.json`
- `/tmp/model-routing-depth-2026.json`
- `/tmp/orchestration-primary.json`
- `/tmp/coding-workflow-primary.json`
- `/tmp/model-primary-2026.json`
- `/tmp/coordination-papers.json`

These files are research scratch, not committed truth.

## Solo findings

Solo is a local orchestration control plane, not merely terminal launcher. Enabled MCP surface in
project 49 contained 95 tools spanning project/process control, agents, output, readiness, timers,
scratchpads, todos, locks, KV, prompt templates, and setup. Solo Docs describes centralized
lead-worker workflow: interview/plan, durable scratchpad, todos and blockers, bounded worker
prompts, timer-based wake-ups, real-output inspection, deliberate integration, durable handoff,
then cleanup ([Solo orchestration workflow](https://soloterm.com/api/v1/docs/workflows/agent-orchestration)).

Solo-launched agents can spawn agents from different providers; child does not inherit parent's
judgment, so every worker needs explicit scope and handoff contract
([agents spawning agents](https://soloterm.com/api/v1/docs/workflows/agents-spawning-agents)).

Important tool distinctions:

- Idle timers detect worker quiet; port tools detect service readiness
  ([timers](https://soloterm.com/api/v1/docs/mcp-tools/timers),
  [services](https://soloterm.com/api/v1/docs/mcp-tools/services)).
- Scratchpads hold durable Markdown; todos hold concrete work, blockers, comments, and locks
  ([scratchpads](https://soloterm.com/api/v1/docs/mcp-tools/scratchpads),
  [todos](https://soloterm.com/api/v1/docs/mcp-tools/todos)).
- Session identity and selected project normally resume across Solo restarts through reconnecting
  stdio helper; bounded requests can be buffered
  ([MCP integration](https://soloterm.com/api/v1/docs/integrations/mcp-server)).
- Idle classification is heuristic, not completion evidence
  ([idle detection](https://soloterm.com/api/v1/docs/agents/idle-detection)).

Observed operational failure: current saved Grok tool command launched interactive directory-trust
screen before prompt delivery despite bypass configuration. This validates mandatory post-spawn
status/output check and headless preflight for generic tools.

## External findings

### Multi-agent helps only when task structure supports it

Google evaluated 180 configurations across single-agent, independent, centralized, decentralized,
and hybrid topologies. Centralized coordination improved parallelizable Finance-Agent performance
by 80.9%, while all multi-agent variants degraded sequential PlanCraft performance by 39–70%.
Tool-heavy tasks increased coordination tax; centralized architecture contained error amplification
better than independent aggregation (4.4× versus 17.2×). Its task-feature model selected optimal
architecture on 87% of held-out configurations
([Google Research](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)).

Policy implication: default one agent for sequential shared-state work; centralized lead-worker
fan-out only for decomposable lanes. Never equate agent count with quality.

### Research breadth is strongest fan-out case

Anthropic's production research system uses lead-worker orchestration, durable plan memory,
specialized independent searches, and lead synthesis. Internal research eval improved 90.2% over
single-agent Opus 4, but multi-agent work used roughly 15× chat tokens. Anthropic explicitly says
many coding tasks have fewer parallel lanes and that subagents need objective, output format,
tools/sources, and boundaries. Its 3–5 agent/tool parallelism cut complex research time by up to
90% ([Anthropic Engineering](https://www.anthropic.com/engineering/multi-agent-research-system)).

Policy implication: research fan-out can be broad; coding fan-out stays small and file-owned.
Persistent scratchpads/reports protect lead context from raw worker history.

### Manager ownership is correct default here

OpenAI distinguishes handoffs from agents-as-tools. Manager-style specialists fit when manager
must synthesize final answer and specialist performs bounded task. It recommends starting with one
agent and splitting only when capability, policy, prompt clarity, or trace legibility materially
improves
([OpenAI orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration)).

Policy implication: root retains user conversation and integration. Solo workers act as bounded
specialists, not autonomous final-answer owners.

### Scripted mass fan-out is separate mechanism

Claude Code dynamic workflows move orchestration into code and can scale to dozens or hundreds of
agents, but documentation warns about token cost and recommends testing small slice first. That is
useful for repeatable many-item transforms, not default interactive repo work
([Claude workflows](https://code.claude.com/docs/en/workflows)).

Policy implication: Solo skill does not invent workflow engine. Use Solo lead-worker fan-out for
handful of long-running peers; codify mass deterministic sweeps only after repeated need.

Search included current YouTube and community workflow material. One relevant orchestration video
was found, but extraction returned metadata/recommendations rather than substantive transcript, so
no policy claim relies on it
([video](https://www.youtube.com/watch?v=RWT3sh68PWE)).

## Model and reasoning conclusions

Official releases position GPT-5.6 Sol as hardest-work tier and Terra as balanced tier; OpenAI
separately defines Ultra as multi-agent execution rather than ordinary reasoning depth
([GPT-5.6](https://openai.com/index/gpt-5-6/)). Anthropic positions Fable 5 above Opus 4.8 for
frontier reasoning and long-horizon work, while Opus remains capable fallback; current API notes
document adaptive thinking and effort controls
([Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5),
[Claude release notes](https://docs.anthropic.com/en/release-notes/api)). xAI positions Grok 4.5
for coding/agentic tasks and publishes mixed results across software benchmarks rather than a
universal win ([Grok 4.5](https://x.ai/news/grok-4-5)).

Public benchmarks remain harness- and effort-specific. Adopted roles therefore combine callable
local evidence and user preference:

- Sol high: hard implementation/analysis; max only for frontier or failed high pass.
- Terra high: routine implementation and bounded independent verification; medium only for
  low-risk mechanical first passes with stronger review before consequential integration.
- Fable xhigh/high: plan, product/API/taste, and adversarial review.
- Opus high: stable Claude second opinion and Fable fallback.
- Grok high: vendor-diverse assumption attack, not taste authority.
- Ultra: separate delegated topology, never shorthand for “more thinking.”

Local calibration outranks launch tables. Track intervention, retries, elapsed time, and blind
quality judgments before changing house roles.

## Instruction placement

- `AGENTS.md`: short mandatory pointer, project binding, lifecycle ownership, completion gate.
- Global `fan-solo` family: triggered router plus focused agent, process, state, and automation
  workflows.
- `research/agent-model-roster.md`: callable runtimes, exact launch mechanics, and dated external
  evidence.
- `research/`: dated evidence and rejected alternatives; never instruction layer.
- `CLAUDE.md`: unchanged because it already imports canonical `AGENTS.md`.

## Rejected patterns

- Always fan out: contradicted by sequential-task degradation and tool-coordination cost.
- Flat peer swarm: harder ownership, more context traffic, weaker error containment.
- Majority vote as truth: model errors can correlate; root must inspect source artifacts.
- One giant `AGENTS.md`: wastes context and mixes durable hard rules with conditional runbook.
- Benchmark-derived total ordering: does not measure house taste, allowance cost, or repo behavior.
- Automatic process adoption/cleanup: violates recursive lifecycle ownership.

## Primary sources

- [Solo orchestration workflow](https://soloterm.com/api/v1/docs/workflows/agent-orchestration)
- [Solo MCP integration](https://soloterm.com/api/v1/docs/integrations/mcp-server)
- [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Google science of scaling agent systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)
- [OpenAI orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)
- [Claude Code dynamic workflows](https://code.claude.com/docs/en/workflows)
- [OpenAI GPT-5.6](https://openai.com/index/gpt-5-6/)
- [Anthropic Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Anthropic API release notes](https://docs.anthropic.com/en/release-notes/api)
- [xAI Grok 4.5](https://x.ai/news/grok-4-5)
