import json, os, pathlib

def final_text(client, stdout):
    if client == "claude":
        txt = None
        for line in stdout.splitlines():
            try: o = json.loads(line)
            except Exception: continue
            if o.get("type") == "result": txt = o.get("result")
        return txt
    if client == "codex":
        txt = None
        for line in stdout.splitlines():
            try: o = json.loads(line)
            except Exception: continue
            it = o.get("item") or {}
            if o.get("type") == "item.completed" and it.get("type") == "agent_message": txt = it.get("text")
        return txt
    if client == "grok":
        return grok_final(stdout)
    if client == "opencode":
        return opencode_final(stdout)
    raise NotImplementedError

def toml_str(s): return json.dumps(s)

def codex_cmd(a, run, work, servers, names, env):
    home = run / "codexhome"; home.mkdir(exist_ok=True)
    src = pathlib.Path.home() / ".codex"
    for f in ("auth.json", ".credentials.json", "installation_id"):
        if (src / f).exists() and not (home / f).exists(): (home / f).symlink_to(src / f)
    env = dict(env); env["CODEX_HOME"] = str(home)
    cmd = ["codex", "exec", "--ignore-user-config", "--skip-git-repo-check", "--json",
           "-C", str(work), "-s", "read-only",
           "-m", a.model or "gpt-6.1-terra", "-c", f'model_reasoning_effort="{a.effort or "low"}"']
    for n, s in servers.items():
        if "url" in s:
            cmd += ["-c", f"mcp_servers.{n}.url={toml_str(s['url'])}", "-c", f'mcp_servers.{n}.default_tools_approval_mode="approve"']
            continue
        cmd += ["-c", f"mcp_servers.{n}.command={toml_str(s['command'])}",
                "-c", "mcp_servers." + n + ".args=[" + ",".join(toml_str(x) for x in s["args"]) + "]",
                "-c", "mcp_servers." + n + ".env={" + ",".join(f"{k}={toml_str(v)}" for k, v in s["env"].items()) + "}",
                "-c", f'mcp_servers.{n}.tools.result_probe.approval_mode="approve"',
                "-c", f"mcp_servers.{n}.startup_timeout_sec=30"]
    hint = ("Tools may be deferred. Use your tool-search mechanism (tool_search) to load the tools named desc_a, desc_b, desc_c, schema_probe and result_probe of each server before answering.\n\n")
    if a.mode == "nohost":
        cmd[2:2] = ["--disable", "code_mode_host"]
    cmd.append("@PROMPT@")
    return cmd, env, hint

def grok_final(stdout):
    out = []
    for line in stdout.splitlines():
        try: o = json.loads(line)
        except Exception: continue
        if o.get("type") == "text": out.append(o.get("data", ""))
    return "".join(out)
def opencode_final(stdout):
    out = []
    for line in stdout.splitlines():
        try: o = json.loads(line)
        except Exception: continue
        if o.get("type") == "text":
            p = o.get("part") or o
            out.append(p.get("text") or o.get("text") or "")
    return "\n".join(out)
def grok_cmd(a, run, work, servers, names, env):
    home = run / "grokhome"; home.mkdir(exist_ok=True)
    src = pathlib.Path.home() / ".grok"
    for f in ("auth.json", "agent_id"):
        if (src / f).exists() and not (home / f).exists(): (home / f).symlink_to(src / f)
    lines = []
    for n, s in servers.items():
        lines.append(f"[mcp_servers.{n}]")
        if "url" in s:
            lines.append(f"url = {toml_str(s['url'])}\n"); continue
        lines.append(f"command = {toml_str(s['command'])}")
        lines.append("args = [" + ", ".join(toml_str(x) for x in s["args"]) + "]")
        lines.append("env = { " + ", ".join(f"{k} = {toml_str(v)}" for k, v in s["env"].items()) + " }")
        lines.append("startup_timeout_sec = 30\n")
    (home / "config.toml").write_text("\n".join(lines))
    env = dict(env); env["GROK_HOME"] = str(home)
    fake = run / "home"; fake.mkdir(exist_ok=True); env["HOME"] = str(fake)
    cmd = ["grok", "-p", "@PROMPT@", "--model", a.model or "grok-4.7", "--reasoning-effort", a.effort or "low",
           "--output-format", "streaming-json", "--no-subagents", "--no-plan",
           "--allow", "mcp__probe*", "--allow", "use_tool", "--allow", "search_tool", "--permission-mode", "bypassPermissions"]
    hint = ("MCP tools may be deferred behind your tool-discovery mechanism (search_tool / use_tool). Use it to look up the tools named desc_a, desc_b, desc_c, schema_probe and result_probe of each server, "
            "read their full descriptions and input schemas, and call result_probe via use_tool.\n\n")
    return cmd, env, hint
def opencode_cmd(a, run, work, servers, names, env):
    cfgdir = run / "xdg-config" / "opencode"; cfgdir.mkdir(parents=True, exist_ok=True)
    mcp = {n: ({"type": "remote", "url": s["url"]} if "url" in s else {"type": "local", "command": [s["command"], *s["args"]], "environment": s["env"]}) for n, s in servers.items()}
    (cfgdir / "opencode.json").write_text(json.dumps({"mcp": {"servers": mcp}}))
    env = dict(env)
    env["XDG_CONFIG_HOME"] = str(run / "xdg-config"); env["XDG_DATA_HOME"] = str(run / "xdg-data")
    env["XDG_STATE_HOME"] = str(run / "xdg-state"); env["XDG_CACHE_HOME"] = str(run / "xdg-cache")
    cmd = ["opencode", "run", "--standalone", "--auto", "--format", "json", "-m", a.model or "opencode/big-pickle", "@PROMPT@"]
    hint = ("Some tools may be deferred. If your tool list lacks the probe tools, use your tool-search mechanism to load the tools named desc_a, desc_b, desc_c, schema_probe and result_probe of each server before answering.\n\n")
    return cmd, env, hint
