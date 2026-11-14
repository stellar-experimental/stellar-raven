"""Ground truth for Claude Code from the persisted transcript: what was sent in the API request."""
import json, glob, re, sys, pathlib
TOK = re.compile(r"[A-Z]{2}\d-\d{3}-[a-z]{6}")
MARK = "… [truncated]"
def walk(o, p=""):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, p + "/" + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, p + f"[{i}]")
    elif isinstance(o, str): yield p, o
def find_transcript(workdir):
    key = re.sub(r"[^A-Za-z0-9]", "-", str(workdir))
    for d in glob.glob(str(pathlib.Path.home() / ".claude/projects/*")):
        if d.endswith(key) or pathlib.Path(d).name == key:
            fs = glob.glob(d + "/*.jsonl")
            if fs: return fs[0]
def truth(workdir):
    f = find_transcript(workdir)
    rows = [json.loads(l) for l in open(f)]
    out = {"instructions": {}, "tools": {}, "schema": {}, "deferred_listing": None}
    for o in rows:
        if o.get("type") == "attachment":
            for p, v in walk(o.get("attachment", {})):
                for m in re.finditer(r"## ([A-Za-z0-9_.\- ]+)\n", v):
                    pass
            for blk in (o.get("attachment") or {}).get("addedBlocks", []) or []:
                m = re.match(r"## ([^\n]+)\n", blk)
                if m:
                    body = blk[m.end():]
                    out["instructions"][m.group(1)] = {"chars": len(body), "marker": body.endswith(MARK), "kept": len(body) - (len(MARK) if body.endswith(MARK) else 0)}
        if o.get("type") == "api-request-shape":
            sh = o["shape"]
            for t in sh.get("tools", []):
                d = t.get("description", "")
                e = {"chars": len(d), "marker": d.endswith(MARK), "kept": len(d) - (len(MARK) if d.endswith(MARK) else 0)}
                for pn, pv in ((t.get("input_schema") or {}).get("properties") or {}).items():
                    if "description" in pv: e["prop_" + pn] = len(pv["description"])
                out["tools"][t.get("name")] = e
    return out
if __name__ == "__main__":
    print(json.dumps(truth(sys.argv[1]), indent=1))
