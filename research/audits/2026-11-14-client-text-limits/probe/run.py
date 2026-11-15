#!/usr/bin/env python3
"""Run one measurement: client x server-instruction size x copies x tool-loading mode.
usage: run.py CLIENT LABEL [--instr N] [--copies 1|2] [--mode direct|deferred] [--result N] [--model M]
"""
import argparse, json, os, random, shutil, subprocess, sys, time, pathlib
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from prompt import build_prompt, build_prompt_codex
from score import extract_json, score

ap = argparse.ArgumentParser()
ap.add_argument("client"); ap.add_argument("label")
ap.add_argument("--instr", type=int, default=20000)
ap.add_argument("--result", type=int, default=40000)
ap.add_argument("--copies", type=int, default=1)
ap.add_argument("--mode", default="direct")
ap.add_argument("--model", default=None)
ap.add_argument("--effort", default=None)
ap.add_argument("--flat", action="store_true")
ap.add_argument("--only-result", action="store_true")
ap.add_argument("--schema", type=int, default=20000)
ap.add_argument("--timeout", type=int, default=600)
a = ap.parse_args()

run = HERE / "runs" / a.client / a.label
shutil.rmtree(run, ignore_errors=True); run.mkdir(parents=True)
work = HERE / "work" / f"{a.client}-{a.label}"; shutil.rmtree(work, ignore_errors=True); work.mkdir(parents=True)

names = ["probe"] if a.copies == 1 else [f"probe{i+1}" for i in range(a.copies)]
servers = {}
for i, n in enumerate(names):
    seed = random.SystemRandom().randrange(1, 2**31)
    mf = run / f"manifest-{n}.json"
    servers[n] = {"command": "node", "args": [str(HERE / "server.mjs")], "env": {
        "PROBE_SRV": str(i + 1), "PROBE_SEED": str(seed), "PROBE_INSTR_CHARS": str(a.instr),
        "PROBE_RESULT_CHARS": str(a.result), "PROBE_SCHEMA_CHARS": str(a.schema), "PROBE_FLAT": "1" if a.flat else "0", "PROBE_MANIFEST": str(mf)}}

hint = ""
cmd, env, stdin = None, dict(os.environ), None
if a.client == "claude":
    cfg = run / "mcp.json"; cfg.write_text(json.dumps({"mcpServers": servers}))
    allowed = " ".join(f"mcp__{n}__result_probe" for n in names)
    cmd = ["claude", "-p", "--model", a.model or "sonnet", "--effort", a.effort or "low",
           "--strict-mcp-config", "--mcp-config", str(cfg), "--tools", "",
           "--allowedTools", *[f"mcp__{n}__result_probe" for n in names],
           "--setting-sources", "project", "--disable-slash-commands", "--no-session-persistence",
           "--output-format", "stream-json", "--verbose"]
    if os.environ.get("PERSIST"): cmd.remove("--no-session-persistence"); cmd += ["--system-prompt-snapshot", "on"]
    if a.mode == "deferred":
        cmd[cmd.index("--tools") + 1] = "ToolSearch"
        env["ENABLE_TOOL_SEARCH"] = "true"
        hint = ("Some tools may be deferred. Use your tool-search mechanism to load the tools named desc_a, desc_b, desc_c, schema_probe and result_probe of each server before answering.\n\n")
    else:
        env["ENABLE_TOOL_SEARCH"] = "false"
elif a.client == "codex":
    from adapters import codex_cmd
    cmd, env, hint = codex_cmd(a, run, work, servers, names, env)
elif a.client == "grok":
    from adapters import grok_cmd
    cmd, env, hint = grok_cmd(a, run, work, servers, names, env)
elif a.client == "opencode":
    from adapters import opencode_cmd
    cmd, env, hint = opencode_cmd(a, run, work, servers, names, env)
else:
    sys.exit("unknown client")

prompt = build_prompt_codex(names) if (a.client == "codex" and a.mode not in ("plain", "nohost")) else build_prompt(names, hint)
if a.only_result:
    prompt = ("Text-delivery measurement. Call the MCP tool result_probe once, with no arguments, and return its text as the only thing your code returns (do not wrap it in an object or stringify it). "
              "Then reply with exactly one JSON object {\"result\": {\"first\": <first sentinel visible>, \"last\": <last sentinel visible>, \"tail\": <final 80 characters visible, including any truncation notice>}}. "
              "A sentinel looks like `ZZ9-999-xxxxxx`. Copy only what is actually visible to you. Output only the JSON object.")
(run / "prompt.txt").write_text(prompt)
(run / "meta.json").write_text(json.dumps({"client": a.client, "args": vars(a), "cmd": cmd, "names": names,
    "started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}))
full = [c if c != "@PROMPT@" else prompt for c in cmd]
if "@PROMPT@" not in cmd and a.client in ("claude",): full = cmd + [prompt]
t0 = time.time()
p = subprocess.run(full, cwd=work, env=env, capture_output=True, text=True, timeout=a.timeout, stdin=subprocess.DEVNULL)
(run / "stdout.txt").write_text(p.stdout); (run / "stderr.txt").write_text(p.stderr)
meta = json.loads((run / "meta.json").read_text()); meta.update(rc=p.returncode, seconds=round(time.time() - t0, 1))
(run / "meta.json").write_text(json.dumps(meta))

# final model text
from adapters import final_text
text = final_text(a.client, p.stdout)
(run / "final.txt").write_text(text or "")
ans = extract_json(text or "")
(run / "answer.json").write_text(json.dumps(ans))
res = {}
for n in names:
    m = json.loads((run / f"manifest-{n}.json").read_text())
    sub = ans if len(names) == 1 else (ans or {}).get(n)
    res[n] = score(m, sub)
(run / "score.json").write_text(json.dumps(res, indent=1))
for n in names:
    print(n, {s: (r["delivered"], r.get("last_valid")) for s, r in res[n].items()})
print("rc", p.returncode, "sec", meta["seconds"])
