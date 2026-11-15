#!/usr/bin/env python3
"""raven_run.py CLIENT LABEL [--mode deferred|direct|plain] [--model M] [--url URL]  — quote the ends of Raven's real texts."""
import argparse, json, os, pathlib, shutil, subprocess, sys, time
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
ap = argparse.ArgumentParser(); ap.add_argument("client"); ap.add_argument("label")
ap.add_argument("--mode", default="direct"); ap.add_argument("--model"); ap.add_argument("--effort")
ap.add_argument("--url", default="http://localhost:18791/mcp"); ap.add_argument("--timeout", type=int, default=600)
a = ap.parse_args()
run = HERE/"runs"/f"raven-{a.client}"/a.label; shutil.rmtree(run, ignore_errors=True); run.mkdir(parents=True)
work = HERE/"work"/f"raven-{a.client}-{a.label}"; shutil.rmtree(work, ignore_errors=True); work.mkdir(parents=True)
servers = {"raven": {"url": a.url}}
env = dict(os.environ); names = ["raven"]
PROMPT = ("This is a text-delivery measurement. An MCP server named `raven` is connected. It supplied (1) server instructions, and (2) tools named `search` and `execute`, each with a description. "
  "Copy text only as it actually appears in your own context, verbatim, never from memory or by guessing. Do NOT call any `raven` tool.\n"
  "{hint}"
  "Reply with exactly one JSON object with the keys `instructions`, `search`, `execute`. Each value is an object {{\"tail\": ..., \"marker\": ...}}: "
  "`tail` is the final 150 characters you can see of that text, verbatim (if the text ends with a truncation marker, include the marker in the tail); "
  "`marker` is true if the text visibly ends with a truncation marker or ellipsis, else false. Use null for tail if you cannot see that text. Output only the JSON object.")
if a.client == "claude":
    cfg = run/"mcp.json"; cfg.write_text(json.dumps({"mcpServers": {"raven": {"type": "http", "url": a.url}}}))
    cmd = ["claude", "-p", "--model", a.model or "sonnet", "--effort", a.effort or "low", "--strict-mcp-config", "--mcp-config", str(cfg),
           "--tools", "ToolSearch" if a.mode == "deferred" else "", "--setting-sources", "project", "--disable-slash-commands",
           "--output-format", "stream-json", "--verbose", "@PROMPT@"] if os.environ.get("PERSIST") else ["claude", "-p", "--model", a.model or "sonnet", "--effort", a.effort or "low", "--strict-mcp-config", "--mcp-config", str(cfg),
           "--tools", "ToolSearch" if a.mode == "deferred" else "", "--setting-sources", "project", "--disable-slash-commands",
           "--no-session-persistence", "--output-format", "stream-json", "--verbose", "@PROMPT@"]
    env["ENABLE_TOOL_SEARCH"] = "true" if a.mode == "deferred" else "false"
    hint = "Tools may be deferred: if you do not see the `search` and `execute` tools of `raven`, load them with your tool-search tool first.\n" if a.mode == "deferred" else ""
elif a.client == "codex":
    from adapters import codex_cmd
    class A: pass
    A.model = a.model; A.effort = a.effort; A.mode = "plain"
    cmd, env, _ = codex_cmd(A, run, work, servers, names, env)
    _t = json.load(open(HERE/"raven"/"truth.json")); _i = _t["instructions"][-40:]
    _s = [t for t in _t["tools"] if t["name"] == "search"][0]["description"][-40:]; _e = [t for t in _t["tools"] if t["name"] == "execute"][0]["description"][-40:]
    hint = ("You reach MCP tools through the `exec` JavaScript tool. `ALL_TOOLS` lists the nested tools as {name, description}. Do not print whole descriptions. "
            "In ONE exec call, for the entries whose name ends with `raven__search` and `raven__execute`, print one compact JSON line each: {name, len: description.length, hasInstructionsTail: description.includes(" + json.dumps(_i) + "), hasOwnTail: description.includes(<its own tail>)} where the own tail is " + json.dumps(_s) + " for search and " + json.dumps(_e) + " for execute. "
            "Then in your final JSON, for `instructions` give the tail you can see in your context (the tool catalogue line for raven), and for `search`/`execute` put the printed values in the `tail` field as a short string like `len=NNN instrTail=true ownTail=true` and marker=false.\n")
elif a.client == "grok":
    from adapters import grok_cmd
    class A: pass
    A.model = a.model; A.effort = a.effort; A.mode = "plain"
    cmd, env, _ = grok_cmd(A, run, work, servers, names, env)
    cmd = [c for c in cmd]; 
    hint = "MCP tools may be behind your tool-discovery mechanism (search_tool): use it to look up the `search` and `execute` tools of `raven` (do not call them) and read their descriptions in full.\n"
elif a.client == "opencode":
    from adapters import opencode_cmd
    class A: pass
    A.model = a.model; A.effort = a.effort; A.mode = "plain"
    cmd, env, _ = opencode_cmd(A, run, work, servers, names, env)
    hint = "Your MCP tools may be behind a code-execution sandbox (a `search`/`execute` tool of your own): use it to read the description of the raven `search` and `execute` tools, printing only the last 150 characters of each (do not call the raven tools).\n"
prompt = PROMPT.format(hint=hint)
(run/"prompt.txt").write_text(prompt)
full = [prompt if c == "@PROMPT@" else c for c in cmd]
t0 = time.time()
p = subprocess.run(full, cwd=work, env=env, capture_output=True, text=True, timeout=a.timeout, stdin=subprocess.DEVNULL)
(run/"stdout.txt").write_text(p.stdout); (run/"stderr.txt").write_text(p.stderr)
from adapters import final_text
from score import extract_json
text = final_text(a.client, p.stdout); (run/"final.txt").write_text(text or "")
ans = extract_json(text or "") or {}
truth = json.load(open(HERE/"raven"/"truth.json"))
T = {"instructions": truth["instructions"], "search": next(t["description"] for t in truth["tools"] if t["name"] == "search"), "execute": next(t["description"] for t in truth["tools"] if t["name"] == "execute")}
res = {}
for k, full_text in T.items():
    tail = (ans.get(k) or {}).get("tail")
    r = {"truth_len": len(full_text), "marker": (ans.get(k) or {}).get("marker"), "tail": tail}
    if tail:
        import re as _re
        t = _re.sub(r"\n*Today's date is[^\n]*$", "", tail)
        for cut in range(0, 40):
            w = t[: len(t) - cut] if cut else t
            if len(w) < 20: break
            pos = full_text.rfind(w)
            if pos >= 0: r["delivered_to"] = pos + len(w); r["tail_trim"] = cut; break
        r["full"] = r.get("delivered_to") == len(full_text)
    res[k] = r
(run/"score.json").write_text(json.dumps(res, indent=1)); (run/"meta.json").write_text(json.dumps({"cmd": cmd, "rc": p.returncode, "sec": round(time.time()-t0,1), "args": vars(a)}))
print(a.client, a.label, {k: (v.get("delivered_to"), v["truth_len"], v.get("full")) for k, v in res.items()}, "rc", p.returncode)
