# Evidence for the client text-limits probe

Report: [`../2026-11-14-client-text-limits.md`](../2026-11-14-client-text-limits.md).

- `probe/` is a frozen copy of the throwaway harness. It was written and run outside the repository
  tree and is not part of the build. `server.mjs` is the dependency-free sentinel MCP server. `run.py`
  runs one session; `batch.py` runs a matrix; `raven_run.py` and `connector_run.py` quote the real
  Raven texts. `score.py`, `codex_summary.py`, `grok_agg.py`, `claude_truth.py` and `opencode_truth.py`
  read the answers and each client's own log. The scripts name scratchpad paths of the run that made
  them. Edit those to rerun.
- `runs/<client>/<label>/` holds the model's final answer (`final.txt`) and the scored result
  (`score.json`) for every session. `raven-*` folders are the real-Raven sessions;
  `claude-connector` holds the claude.ai connector sessions. Session logs were large and are not kept.
- `results.json` is the per-session summary that `final_agg.py` builds from the logs.

The per-session run files (184 files, 1.4 MB) are not committed. They are kept on the owner's Linux machine at `~/backups/client-text-limits-2026-11-14/runs/`; `results.json` here holds every measured figure.
