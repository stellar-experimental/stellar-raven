import json, re, glob, sys, pathlib
TOK = re.compile(r"[A-Z]{2}\d-\d{3}-[a-z]{6}")
MARK = "… [truncated]"
def text(o):
    c = o.get("content")
    return "".join(p.get("text", "") if isinstance(p, dict) else str(p) for p in c) if isinstance(c, list) else (c or "")
def agg(run):
    f = glob.glob(f"{run}/grokhome/sessions/*/0*/chat_history.jsonl")
    if not f: return None
    rows = [json.loads(l) for l in open(f[0])]
    out = {"instr": {}, "desc": {}, "prop": {}, "result": []}
    for o in rows:
        t = text(o)
        if o.get("type") == "user" and "connected:" in t and "tools)" in t:
            ms = list(re.finditer(r"- (probe\d?) \(\d tools\): ", t))
            for n, m in enumerate(ms):
                stop = ms[n + 1].start() if n + 1 < len(ms) else len(t)
                seg = t[m.end():stop]
                mk = seg.find(MARK)
                if mk >= 0: out["instr"][m.group(1)] = {"kept": mk, "marker": True}
                else:
                    body = seg.split("\n\nCall `search_tool`")[0].rstrip("\n"); out["instr"][m.group(1)] = {"kept": len(body), "marker": False}
        if o.get("type") == "tool_result":
            if '"tool_name"' in t and '"results"' in t:
                try: j = json.loads(t)
                except Exception: continue
                for r in j["results"]:
                    for tl in r["tools"]:
                        d = tl["description"]; k = tl["tool_name"]
                        out["desc"][k] = {"kept": len(d) - (len(MARK) if d.endswith(MARK) else 0), "marker": d.endswith(MARK)}
                        for pv in (tl.get("input_schema") or {}).get("properties", {}).values():
                            if "description" in pv: out["prop"][k] = len(pv["description"])
            elif t.startswith("RS") and TOK.findall(t):
                k = t.find("\n\n[MCP output truncated")
                tk = TOK.findall(t[:k] if k >= 0 else t)
                out["result"].append({"body_chars": k if k >= 0 else len(t), "truncated": k >= 0, "last": tk[-1], "note": t[k+2:k+80] if k >= 0 else None})
    return out
if __name__ == "__main__":
    for d in sorted(glob.glob("runs/grok/*")):
        a = agg(d); print(pathlib.Path(d).name, json.dumps(a) if a else None)
