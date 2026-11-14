#!/usr/bin/env python3
import json, os, pathlib, re, shutil, subprocess, sys, time
HERE = pathlib.Path(__file__).resolve().parent
label = sys.argv[1]; mode = sys.argv[2] if len(sys.argv) > 2 else "default"
run = HERE/"runs"/"claude-connector"/label; shutil.rmtree(run, ignore_errors=True); run.mkdir(parents=True)
work = HERE/"work"/f"connector-{label}"; shutil.rmtree(work, ignore_errors=True); work.mkdir(parents=True)
prompt = ("This is a text-delivery measurement. The claude.ai connector MCP server named `Stellar Raven` is connected in this session. It supplied (1) server instructions and (2) tools `search` and `execute`, each with a description. "
 "Copy text only as it actually appears in your own context, verbatim, never from memory or guessing. Do NOT call any Stellar Raven tool. If its tools are deferred, load their definitions with your tool-search tool first (search for `Stellar Raven`).\n"
 "For `instructions`: find the section titled `claude.ai Stellar Raven` in your \"MCP Server Instructions\" and quote the very end of that section (the text just before the next `## ` heading or the end of the instructions); also set `has_micro_map` to true if that section contains a heading `Source Micro-Map`, and `last_heading` to the last `##`/`###` heading inside it. "
 "Reply with exactly one JSON object with the keys `instructions`, `search`, `execute`. Each value is {\"tail\": ..., \"marker\": ...}: `tail` is the final 150 characters you can see of that text, verbatim (include a truncation marker if the text ends with one); "
 "`marker` is true if the text visibly ends with a truncation marker or ellipsis, else false. Use null for tail if you cannot see that text. Output only the JSON object.")
cmd = ["claude", "-p", "--model", "sonnet", "--effort", "low", "--tools", "ToolSearch", "--disable-slash-commands",
       *([] if os.environ.get("PERSIST") else ["--no-session-persistence"]), "--output-format", "stream-json", "--verbose", prompt]
env = dict(os.environ); env["CLAUDE_CODE_MCP_CONNECTOR_PREWAIT_MS"] = "20000"
if mode == "nodefer": env["ENABLE_TOOL_SEARCH"] = "false"
if mode == "defer": env["ENABLE_TOOL_SEARCH"] = "true"
t0 = time.time()
p = subprocess.run(cmd, cwd=work, env=env, capture_output=True, text=True, timeout=600, stdin=subprocess.DEVNULL)
(run/"stdout.txt").write_text(p.stdout); (run/"stderr.txt").write_text(p.stderr)
sys.path.insert(0, str(HERE)); from adapters import final_text; from score import extract_json
text = final_text("claude", p.stdout) or ""; (run/"final.txt").write_text(text)
ans = extract_json(text) or {}
truth = json.load(open(HERE/"raven"/"truth.json"))
T = {"instructions": truth["instructions"], "search": next(t["description"] for t in truth["tools"] if t["name"] == "search"), "execute": next(t["description"] for t in truth["tools"] if t["name"] == "execute")}
res = {}
for k, ft in T.items():
    tail = (ans.get(k) or {}).get("tail"); r = {"truth_len": len(ft), "tail": tail, "marker": (ans.get(k) or {}).get("marker")}
    if tail:
        t = re.sub(r"\n*Today's date is[^\n]*$", "", tail)
        for cut in range(0, 40):
            w = t[: len(t)-cut] if cut else t
            if len(w) < 20: break
            pos = ft.rfind(w)
            if pos >= 0: r["delivered_to"] = pos + len(w); break
        r["full"] = r.get("delivered_to") == len(ft)
    res[k] = r
(run/"score.json").write_text(json.dumps(res, indent=1))
init = next((json.loads(l) for l in p.stdout.splitlines() if '"subtype":"init"' in l), {})
(run/"meta.json").write_text(json.dumps({"rc": p.returncode, "sec": round(time.time()-t0, 1), "mcp_servers": init.get("mcp_servers"), "version": init.get("claude_code_version")}))
print({k: (v.get("delivered_to"), v["truth_len"], v.get("full")) for k, v in res.items()}, "rc", p.returncode, [ (s["name"], s["status"]) for s in (init.get("mcp_servers") or []) if "aven" in s["name"]])
