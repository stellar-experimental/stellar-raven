# Agent model roster

`raven-next` re-verified the runtime facts on 2026-09-30 against the installed CLIs and their
on-disk model catalogs on this host. The previous pass was 2026-08-25. The external-benchmark
snapshot below is still the 2026-07-09 pass. Nobody re-checked it; the label says so in place.
The launch mechanics are the Herdr mechanics from 2026-08-25, re-run on 2026-09-30.

This is the availability, mechanics, and external-evidence record for repo-work fan-out.
`AGENTS.md` owns the repo's active model/effort policy; the global `herdr` skill owns pane and
agent mechanics. Historical house ratings are not an operational routing surface.

### How to re-verify the runtime facts

Every id, context window, and effort list in the next three sections comes from a catalog the CLI
caches on disk. Read them directly instead of trusting this file:

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, description, context_window, max_context_window, default_reasoning_level, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && grok models && jq '.grok_version, (.models[].info|{id, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A6 -- --model
opencode --version
grep -E '^(model|model_reasoning_effort)' ~/.codex/config.toml
```

`grok models` reaches the network and is the only source for which model is the CLI default. It
can print `Settings fetch failed` warnings first; those are harmless and it still exits zero. The
`jq` read of the cache is offline and covers everything else. The Codex host default comes from
`~/.codex/config.toml`, not from the catalog.

## Callable runtimes

Herdr starts each of these in a pane it does not create: split a pane first, then
`herdr agent start <name> --kind <kind> --pane <id> -- <native args>`. Everything after `--` is
passed to the CLI unchanged, so the model and effort flags below are the CLI's own.

| `--kind` | CLI | Default model | Explicit model syntax |
|---|---|---|---|
| `codex` | `codex` | `gpt-6.1-sol` (host config: high; catalog default: low) | `-m`/`--model <model>` |
| `claude` | `claude` | account/runtime default | `--model <alias-or-id>` (no short flag) |
| `grok` | `grok` | `grok-4.7` | `-m`/`--model <model>` |
| `opencode` | `opencode` | runtime/provider dependent | `-m`/`--model <provider/model>` |

Run `herdr agent` for the installed kind list; it is the authority, not this table.

Installed versions on 2026-09-30: Codex `0.159.2`, Claude Code `2.1.286`, Grok `1.0.44`,
OpenCode `1.18.32`.

The saved commands already contain permission-bypass flags, but generic runtimes can still expose
setup/trust prompts. Inspect
`list_agent_tools` before every fan-out and add a bypass flag only when the saved command lacks
one. In particular, passing a second Codex `--yolo` in `extra_args` kills the spawn.

## Codex models

Installed Codex CLI `0.159.2` exposes these `visibility: list` ids. The second column quotes the
catalog's own one-line description.

| id | catalog description | working context | max context | catalog default effort | reasoning efforts |
|---|---|---:|---:|---|---|
| `gpt-6.1-sol` | latest workhorse model for coding and everyday work | 272k | 872k | low | low, medium, high, xhigh, max, ultra |
| `gpt-6-astra` | frontier intelligence for the most demanding work | 272k | 872k | medium | low, medium, high, xhigh, max, ultra |
| `gpt-6-sol` | previous generation workhorse model | 272k | 872k | medium | low, medium, high, xhigh, max, ultra |
| `gpt-6-luna` | fast and affordable model for easier tasks | 272k | 872k | medium | low, medium, high, xhigh, max |
| `gpt-5.6-sol` | older generation workhorse model | 272k | 872k | low | low, medium, high, xhigh, max, ultra |
| `gpt-5.6-terra` | older balanced model for straightforward work | 272k | 872k | medium | low, medium, high, xhigh, max, ultra |
| `gpt-5.6-luna` | older fast and efficient model | 272k | 872k | medium | low, medium, high, xhigh, max |
| `gpt-daybreak-blue-latest` | latest frontier agentic coding model for broad defensive cybersecurity work | 272k | 872k | low | low, medium, high, xhigh, max, ultra |
| `gpt-5.5` | legacy coding model | 272k | 272k | medium | low, medium, high, xhigh |

The generation moved between the 2026-08-25 pass and this one. `gpt-6.1-sol` replaced
`gpt-5.6-sol` as the workhorse and as this host's configured default. `gpt-6-astra` is the new
frontier tier. The 5.6 line has no Astra, and the 6 line has no Terra.

The 5.6 ids remain callable. The catalog describes them as "Older generation workhorse model",
"Older balanced model for straightforward work", and "Older fast and efficient model".
`AGENTS.md` still routes a Terra lane. Whether that lane moves to a 6-line model is an open owner
decision (`.agents/rounds/2026-09-30-raven-next.md`). This file records the catalog, not the policy.

`gpt-daybreak-blue-latest` is listed as callable but is **not** a house lane. `AGENTS.md` does not
route to it. Treat it as evidence-only until a gauntlet says otherwise. The catalog also carries two
`visibility: hide` entries, `gpt-reserve` and `codex-auto-review`. Codex uses them internally. They
are never fan-out targets.

Herdr examples:

```sh
herdr agent start reviewer --kind codex --pane <id> -- -m gpt-6.1-sol -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write
herdr agent start reviewer --kind codex --pane <id> -- -m gpt-6-astra -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write
```

One-shot equivalents:

```sh
codex exec -s read-only -m gpt-6.1-sol -c 'model_reasoning_effort="high"' "<investigation brief>"
codex exec --yolo -m gpt-6-luna -c 'model_reasoning_effort="medium"' "<bounded edit brief>"
```

The Codex catalog checked on this date has no bare `gpt-6` or `gpt-6.1` id. Use the Sol, Astra,
or Luna slug explicitly.

The Codex `workspace-write` sandbox cannot write under `.agents/` in this repository. Have a Codex
reviewer write its findings to the ignored `tmp/` directory. Then copy the file into the round
directory yourself.

## Grok models

Installed Grok CLI `1.0.44` reports four models; `grok models` names `grok-4.7` as the default:

- `grok-4.7` — **default** frontier model, 256k context, low/medium/high/xhigh reasoning,
  defaulting to high.
- `grok-4.7-build-fast` — the fast variant of 4.7 at twice the price, 256k context, same efforts.
- `grok-4.6` — prior frontier model, 256k context, low/medium/high/xhigh reasoning, defaulting to high.
- `grok-4.5` — older model, 256k context, low/medium/high reasoning, defaulting to high.

Two things changed since the 2026-08-25 pass. `grok-4.7` replaced `grok-4.6` as the default. The
catalog now reports a 256k context for every model; the 2026-08-25 cache reported 500k. Quote 256k
until a newer cache says otherwise.

Grok is the first-class vendor-diverse review arm. This exact line ran on 2026-09-30 and returned
a completed adversarial review:

```sh
herdr agent start <name> --kind grok --pane <id> -- --model grok-4.7 --reasoning-effort high --always-approve
```

Grok needs a real terminal. Redirecting its output to a file fails with `Device not configured`,
and wrapping it in `script` over a socket stdin fails with `tcgetattr`. A Herdr pane supplies the
TTY; a piped `codex exec` or a redirected `grok` does not. That is the reason to launch reviewers
through panes rather than shell redirection.

A pane agent renders on the terminal's alternate screen, so rows that scroll away never reach
Herdr's scrollback and no `--lines` value recovers them. For any review whose findings matter,
instruct the agent to write its findings to a Markdown file and reply with only the path.

## Public evidence snapshot — 2026-07-09

**Neither the 2026-08-25 pass nor the 2026-09-30 pass re-verified this section.** Every figure
below is the 2026-07-09 reading. It describes GPT-5.6 and Grok **4.5**. This file records no public
GPT-6 or Grok 4.7 figure. Do not quote this table as current.

This is directional evidence for calibration if house axes are reintroduced, not a second
operational routing table. Public API prices do not define a house `cost` score; any future score
would reflect what Tyler actually pays under the available plans, including allowance pressure.
Likewise, public
benchmarks do not directly measure the repo's combined UI/UX, code-quality, API-design, and copy
`taste` axis.

The Artificial Analysis model pages label the GPT-5.6 variants below as `max`. OpenAI's launch
table reports the Coding Agent Index figures; Grok's figure comes from Artificial Analysis's Grok
Build evaluation. Do not generalize these numbers to lower reasoning efforts or compare `ultra`
with a single-agent run: `ultra` delegates to subagents and is a different execution system.

| model / external reference config | public API input / output per 1M | AA Intelligence Index | AA Coding Agent Index | calibration role |
|---|---:|---:|---:|---|
| GPT-5.6 Sol (`max`) | $5 / $30 | 58.9 (displayed as 59) | 80 | frontier-intelligence candidate |
| GPT-5.6 Terra (`max`) | $2.50 / $15 | 55 | 77.4 | balanced/prior-frontier candidate |
| GPT-5.6 Luna (`max`) | $1 / $6 | 51.2 (displayed as 51) | 74.6 | fast/high-throughput candidate |
| Grok 4.5 (API default `high`) | $2 / $6 | 54 | 76 | vendor-diverse coding candidate |

The final column explains the role each arm should cover in follow-up gauntlets. Public results are
evidence for calibration if house axes are reintroduced, not substitutes for Tyler's direct
ratings and not a second ranking table.

Relevant external evidence:

- OpenAI's general-availability announcement publishes the GPT-5.6 family prices and evaluation
  table, including Agents' Last Exam, Artificial Analysis Intelligence and Coding Agent indices,
  SWE-Bench Pro, DeepSWE, and Terminal-Bench results. It also defines Sol/Terra/Luna as durable
  capability tiers and `ultra` as a delegated multi-agent mode:
  <https://openai.com/index/gpt-5-6/>.
- The independent Artificial Analysis model pages report Sol 59, Terra 55, and Luna 51 on
  Intelligence Index v4.1, with each page explicitly labeled `max`:
  <https://artificialanalysis.ai/models/gpt-5-6-sol>,
  <https://artificialanalysis.ai/models/gpt-5-6-terra>, and
  <https://artificialanalysis.ai/models/gpt-5-6-luna>.
- Artificial Analysis reports Grok 4.5 at 54 on its Intelligence Index and 76 in Grok Build on its
  Coding Agent Index. It reports $0.31 per
  Intelligence Index task and $2.59 per Coding Agent Index task, driven by both price and token
  efficiency: <https://artificialanalysis.ai/articles/grok-4-5-brings-spacexai-to-the-the-intelligence-frontier>.
- xAI's launch results show why Grok needs task-level calibration rather than one headline score:
  83.3% on Terminal-Bench 2.1 and a leading 29% SWE Marathon result, but 53% on DeepSWE 1.1 and
  64.7% on SWE-Bench Pro. The same announcement gives its $2/$6 price and 80 TPS serving claim:
  <https://x.ai/news/grok-4-5>.
- xAI's model docs confirm the exact `grok-4.5` id and low/medium/high reasoning, defaulting to
  high: <https://docs.x.ai/developers/grok-4-5>.

### Context and effort boundaries

- The installed Codex catalog reports two different context numbers per model: a 272k
  `context_window` and an 872k `max_context_window`, with an `effective_context_window_percent` of
  95. The public API/Artificial Analysis specification reports a 1M model context. Say **272k
  working Codex context** in repo fan-out guidance so these surfaces are not conflated. The
  2026-07-15 pass recorded 372k; that figure was wrong or has since changed, and it is retired.
- The installed catalog exposes low/medium/high/xhigh/max/ultra for the Sol and Astra ids and
  low/medium/high/xhigh/max for the Luna ids. Its catalog defaults are low for `gpt-6.1-sol` and
  medium for `gpt-6-astra`, `gpt-6-sol`, and `gpt-6-luna`. This host's `~/.codex/config.toml`
  selects `gpt-6.1-sol` at high effort. The Codex command inherits that host configuration. The
  repository itself does not set that default.
- Grok 4.7 and 4.6 expose low/medium/high/xhigh and default to high. Grok 4.5 exposes
  low/medium/high and defaults to high. The installed Grok CLI reports 256k context for all four.

### What remains to calibrate

- **House cost:** public token prices do not reveal subscription allowance consumption, throttling,
  retries, or the marginal dollars Tyler actually pays.
- **Taste:** launch posts contain promising frontend, artifact, and Office-work examples, but the
  search found no same-harness independent taste comparison. Keep this axis unscored until a local
  blind review or Tyler's direct ranking supplies it.
- **Effort curves:** most comparable public results are at `max`. This repo's work has no
  controlled low/medium/high/xhigh/max curve yet. The GPT-6 line has no curve at all.

To calibrate the unscored models, run the same representative repo tasks at explicit
configurations. Use Astra `high` and `max`, Sol 6.1 `high` and `max`, Luna `medium` and `max`,
and Grok 4.7 `high` and `xhigh`. Record unsupervised completion quality, retries, wall time, and
allowance or credit consumption. Add a blind paired taste judgment from a reviewer other than the
author. Treat Sol and Astra `ultra` as a separate multi-agent arm.

## Claude aliases

Claude Code `2.1.286` accepts the `fable`, `opus`, and `sonnet` aliases. Invoke Fable as
`--model fable` or with the full model id. `--model fable-5` is not a valid CLI alias. The `fable`
line below ran on 2026-09-30 as an independent reviewer and returned a completed review. The
`opus` line is the launch syntax the owner verified the same day for the orchestrator pane:

```sh
herdr agent start <name> --kind claude --pane <id> -- --model fable --effort high --permission-mode bypassPermissions
herdr agent start <name> --kind claude --pane <id> -- --model opus --effort high --permission-mode bypassPermissions
```

## Evidence boundaries

- GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna, Claude Fable, Claude Opus, and Grok 4.7 are
  **catalog-listed** and selectable from their CLIs. Catalog presence is not proof of a working
  call. The 2026-09-30 skill system audit supplies dated call evidence for four of them.
  `gpt-6.1-sol`, `gpt-6-astra`, `grok-4.7`, and Claude `fable` each ran at high. Each completed
  an independent review of this repository through a Herdr pane
  (`.agents/rounds/2026-09-30-skill-system-audit.md`). Luna stays evidence-only, not an active
  house lane. External benchmarks support interim roles. Local gauntlets or Tyler's direct
  judgment must come before any house cost, intelligence, or taste score returns.
- The public demo's Workers AI/provider models are a separate surface and measurement contract.
  Its current verdict is `research/gauntlets/2026-08-06-primary-selection-summary.md`; the
  2026-07-07 gauntlet is superseded. Do not infer fan-out agent quality from either.
- QA answering and judge defaults are another separate measurement contract (`run-evals` skill).
  A new fan-out model never changes those defaults implicitly.
