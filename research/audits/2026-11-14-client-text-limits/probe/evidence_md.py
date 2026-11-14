import json, glob, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from codex_summary import summary as codex_summary
from grok_agg import agg as grok_agg
W = "/tmp/claude-1000/-home-tyler-code-raven-wt-caps/2020e173-0827-45d0-a880-33e05e81e38a/scratchpad/probe/work/"
def esc(s): return "`" + (s or "").replace("`", "'").replace("\n", "\\n") + "`"
def model_block(client, label, title):
    d = pathlib.Path(f"runs/{client}/{label}"); sc = json.load(open(d/"score.json"))
    print(f"**{title}** (`{client}/{label}`, model-reported, checked against the server's token list)\n")
    for n, s in sc.items():
        print("| Surface | Length sent | First sentinel | Last sentinel | Last 60 chars quoted | Delivered |\n|---|---|---|---|---|---|")
        for k, v in s.items():
            t = v["tail"]; t = t[-60:] if t else t
            print(f"| {n}:{k} | {v['length']:,} | {v['first']} | {v['last']} {'(valid)' if v['last_valid'] else '(not in server list)' if v['last'] else ''} | {esc(t)} | {v['delivered']} |")
        print()
for args in (("claude", "A20k-2", "Claude Code, 20,000-char instructions, tools loaded up front"), ("claude", "D20k-1", "Claude Code, tool search on"),
             ("opencode", "A20k-1", "OpenCode, 20,000-char instructions")):
    model_block(*args)
