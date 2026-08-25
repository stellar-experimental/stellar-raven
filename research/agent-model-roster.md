# Agent model roster

Runtime facts re-verified 2026-08-25 against the installed CLIs and their on-disk model catalogs
on this host. The external-benchmark snapshot below is still the 2026-07-09 pass and was **not**
re-checked; it is labelled in place. Launch mechanics were re-derived for Herdr on 2026-08-25;
the Solo spawn syntax they replace is gone.

This is the availability, mechanics, and external-evidence record for repo-work fan-out.
`AGENTS.md` owns the repo's active model/effort policy; the global `herdr` skill owns pane and
agent mechanics. Historical house ratings are not an operational routing surface.

### How to re-verify the runtime facts

Every id, context window, and effort list in the next three sections comes from a catalog the CLI
caches on disk. Read them directly instead of trusting this file:

```sh
codex --version && jq '.client_version, (.models[]|{slug, visibility, context_window, max_context_window, efforts:[.supported_reasoning_levels[].effort]})' ~/.codex/models_cache.json
grok --version && grok models && jq '.grok_version, (.models[].info|{id, context_window, efforts:[.reasoning_efforts[]|{id, default}]})' ~/.grok/models_cache.json
claude --version && claude --help | grep -A6 -- --model
opencode --version
```

`grok models` reaches the network and is the only source for which model is the CLI default. It
can print `Settings fetch failed` warnings first; those are harmless and it still exits zero. The
`jq` read of the cache is offline and covers everything else.

## Callable runtimes

Herdr starts each of these in a pane it does not create: split a pane first, then
`herdr agent start <name> --kind <kind> --pane <id> -- <native args>`. Everything after `--` is
passed to the CLI unchanged, so the model and effort flags below are the CLI's own.

| `--kind` | CLI | Default model | Explicit model syntax |
|---|---|---|---|
| `codex` | `codex` | `gpt-5.6-sol` (host config: high; catalog default: low) | `-m <model>` |
| `claude` | `claude` | account/runtime default | `--model <alias-or-id>` |
| `grok` | `grok` | `grok-4.6` | `-m <model>` |
| `opencode` | `opencode` | runtime/provider dependent | `-m <provider/model>` |

Run `herdr agent` for the installed kind list; it is the authority, not this table.

Installed versions on 2026-08-25: Codex `0.149.1`, Claude Code `2.1.245`, Grok `1.0.5`,
OpenCode `1.18.22`.

The saved commands already contain permission-bypass flags, but generic runtimes can still expose
setup/trust prompts. Inspect
`list_agent_tools` before every fan-out and add a bypass flag only when the saved command lacks
one. In particular, passing a second Codex `--yolo` in `extra_args` kills the spawn.

## Codex models

Installed Codex CLI `0.149.1` exposes these relevant ids:

| id | catalog positioning | working context | max context | reasoning efforts |
|---|---|---:|---:|---|
| `gpt-5.6-sol` | latest frontier agentic coding model | 272k | 872k | low, medium, high, xhigh, max, ultra |
| `gpt-5.6-terra` | balanced everyday agentic coding model | 272k | 872k | low, medium, high, xhigh, max, ultra |
| `gpt-5.6-luna` | fast/affordable agentic coding model | 272k | 872k | low, medium, high, xhigh, max |
| `gpt-daybreak-blue-latest` | frontier model for broad defensive cybersecurity work | 272k | 872k | low, medium, high, xhigh, max, ultra |

`gpt-daybreak-blue-latest` is listed as callable but is **not** a house lane. `AGENTS.md` does not
route to it. Treat it as evidence-only until a gauntlet says otherwise.

Those four are every model the catalog marks `visibility: list` today. It also lists the
prior-generation `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, and `gpt-5.3-codex-spark`, which are kept
for reference and are not fan-out lanes, plus one `visibility: hide` entry, `codex-auto-review`,
which Codex uses internally for approval review and which is never a fan-out target.

Herdr examples:

```sh
herdr agent start reviewer --kind codex --pane <id> -- -m gpt-5.6-terra -c model_reasoning_effort="high"
herdr agent start reviewer --kind codex --pane <id> -- -m gpt-5.6-luna -c model_reasoning_effort="medium"
```

One-shot equivalents:

```sh
codex exec -s read-only -m gpt-5.6-sol -c 'model_reasoning_effort="high"' "<investigation brief>"
codex exec --yolo -m gpt-5.6-luna -c 'model_reasoning_effort="medium"' "<bounded edit brief>"
```

There is no bare `gpt-5.6` id in the Codex catalog checked on this date; use the Sol, Terra,
or Luna slug explicitly.

## Grok models

Installed Grok CLI `1.0.5` reports exactly two models:

- `grok-4.6` — **default** frontier model, 500k context, low/medium/high/**xhigh** reasoning,
  defaulting to high.
- `grok-4.5` — prior frontier model, 500k context, low/medium/high reasoning, defaulting to high.

Two changes since the 2026-07-15 pass. Grok 4.6 adds an `xhigh` effort that 4.5 does not have, and
`grok-composer-2.5-fast` is gone from the catalog.

Grok is the first-class vendor-diverse review arm. This exact line ran on 2026-08-25 and returned
a completed adversarial review:

```sh
herdr agent start <name> --kind grok --pane <id> -- --model grok-4.6 --reasoning-effort high --always-approve
```

Grok needs a real terminal. Redirecting its output to a file fails with `Device not configured`,
and wrapping it in `script` over a socket stdin fails with `tcgetattr`. A Herdr pane supplies the
TTY; a piped `codex exec` or a redirected `grok` does not. That is the reason to launch reviewers
through panes rather than shell redirection.

A pane agent renders on the terminal's alternate screen, so rows that scroll away never reach
Herdr's scrollback and no `--lines` value recovers them. For any review whose findings matter,
instruct the agent to write its findings to a Markdown file and reply with only the path.

## Public evidence snapshot — 2026-07-09

**Not re-verified in the 2026-08-25 pass.** Every figure below is the 2026-07-09 reading and
describes Grok **4.5**, not the 4.6 that is now the CLI default. No public Grok 4.6 figure has been
recorded here. Do not quote this table as current.

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
- The installed catalog exposes low/medium/high/xhigh/max/ultra for Sol and Terra, and
  low/medium/high/xhigh/max for Luna. Its catalog defaults are low for Sol and medium for
  Terra/Luna. This host's `~/.codex/config.toml` selects Sol at high effort, and the Codex
  command inherits that host configuration; the repository itself does not set that default.
- Grok 4.6 exposes low/medium/high/xhigh and defaults to high. Grok 4.5 exposes low/medium/high
  and defaults to high. The installed Grok CLI reports 500k context for both.

### What remains to calibrate

- **House cost:** public token prices do not reveal subscription allowance consumption, throttling,
  retries, or the marginal dollars Tyler actually pays.
- **Taste:** launch posts contain promising frontend, artifact, and Office-work examples, but the
  search found no same-harness independent taste comparison. Keep this axis unscored until a local
  blind review or Tyler's direct ranking supplies it.
- **Effort curves:** most comparable GPT-5.6 results are at `max`; there is not yet a controlled
  low/medium/high/xhigh/max curve on this repo's work.

To calibrate the currently unscored models, run the same representative repo tasks at explicit configurations:
Sol `high` and `max`, Terra `medium` and `max`, Luna `medium` and `max`, and Grok 4.6 `high`
and `xhigh`.
Record unsupervised completion quality, retries/interventions, wall time, allowance or credit
consumption, and a blind paired taste judgment from a reviewer other than the author. Treat
Sol/Terra `ultra` as a separate multi-agent arm.

## Claude aliases

Claude Code `2.1.245` accepts `fable`, `opus`, and `sonnet` aliases. Fable 5 must be invoked as
`--model fable` (or the full `claude-fable-5` id); `--model fable-5` is not a valid CLI alias.
This exact line ran on 2026-08-25 and returned a completed adversarial review:

```sh
herdr agent start <name> --kind claude --pane <id> -- --model fable --permission-mode bypassPermissions
```

## Evidence boundaries

- GPT-5.6 Sol/Terra/Luna, Claude Fable/Opus, and Grok 4.6 are **catalog-listed** and selectable
  from their CLIs, and are covered by the active routing policy in `AGENTS.md`. Catalog presence
  is not proof of a working call. Three of them carry dated call evidence from this pass: on
  2026-08-25 `gpt-5.6-sol` at high effort, `grok-4.6` at high effort, and Claude `fable` each
  completed an independent review of this repository, every one launched through a Herdr pane.
  The others are listed-and-selectable only. Luna stays
  evidence-only, not an active house lane. External benchmarks support interim roles; local
  gauntlets or Tyler's direct judgment would be required before reintroducing house
  cost/intelligence/taste scores.
- The public demo's Workers AI/provider models are a separate surface and measurement contract.
  Its current verdict is `research/gauntlets/2026-08-06-primary-selection-summary.md`; the
  2026-07-07 gauntlet is superseded. Do not infer fan-out agent quality from either.
- QA answering and judge defaults are another separate measurement contract (`run-evals` skill).
  A new fan-out model never changes those defaults implicitly.
