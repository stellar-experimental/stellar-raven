"""Summarise a Codex run from its rollout (ground truth of what reached the model / its JS runtime)."""
import json, glob, re, sys, pathlib
TOK = re.compile(r"[A-Z]{2}\d-\d{3}-[a-z]{6}")
def summary(run):
    run = pathlib.Path(run)
    f = glob.glob(str(run/"codexhome/sessions/**/rollout*.jsonl"), recursive=True)
    rows = [json.loads(l) for l in open(f[0])]
    out = {"catalog": {}, "js": {}, "printed": [], "model": None}
    for o in rows:
        p = o["payload"]
        if o["type"] == "turn_context" or (o["type"] == "event_msg" and p.get("type") == "thread_settings_applied"):
            out["model"] = out["model"] or (p.get("model") or (p.get("thread_settings") or {}).get("model"))
        if o["type"] == "response_item":
            t = p.get("type")
            if t == "message" and p.get("role") == "developer":
                s = json.dumps(p, ensure_ascii=False)
                for m in re.finditer(r"- mcp__(probe\d?): (IN\d-.*?)\\n(?:</tools>|- mcp__)", s):
                    txt = json.loads('"' + m.group(2) + '"')
                    out["catalog"][m.group(1)] = {"chars": len(txt), "tail": txt[-30:]}
            if t == "custom_tool_call_output":
                for part in p.get("output", []):
                    tx = part.get("text", "") if isinstance(part, dict) else str(part)
                    for line in tx.splitlines():
                        line = line.strip()
                        if line.startswith("{") and '"item"' in line:
                            try: j = json.loads(line)
                            except Exception: continue
                            out["js"].setdefault(j["item"], j)
                    if "truncated output" in tx or TOK.findall(tx) and not tx.lstrip().startswith("{"):
                        m = re.search(r"original token count: (\d+)", tx); m2 = re.search(r"…(\d+) tokens truncated…", tx)
                        tk = TOK.findall(tx)
                        if tk: out["printed"].append({"chars": len(tx), "first": tk[0], "last": tk[-1], "orig_tokens": int(m.group(1)) if m else None, "marker_tokens": int(m2.group(1)) if m2 else None})
    return out
if __name__ == "__main__":
    for d in sys.argv[1:]: print(d, json.dumps(summary(d), indent=1))
