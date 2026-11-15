import json, glob, pathlib, sys, collections
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from codex_summary import summary as codex_summary
from grok_agg import agg as grok_agg
out = {"claude": {}, "codex": {}, "grok": {}, "opencode": {}}
def cfg(label):
    for p in ("A20k", "B4090", "C4090x2", "C20kx2", "D20k", "E-big", "P", "NL", "S", "t"):
        if label.startswith(p): return p
for client in ("claude", "opencode"):
    for d in sorted(glob.glob(f"runs/{client}/*")):
        p = pathlib.Path(d)
        if not (p/"score.json").exists(): continue
        sc = json.load(open(p/"score.json")); m = json.load(open(p/"meta.json"))
        out[client][p.name] = {"args": {k: m["args"].get(k) for k in ("instr", "copies", "mode", "result")}, "rc": m.get("rc"), "seconds": m.get("seconds"),
            "servers": {n: {k: {"delivered": v["delivered"], "last": v["last"], "last_valid": v["last_valid"], "tail_end": v.get("tail_end"), "lo": v.get("lo"), "hi": v.get("hi")} for k, v in s.items()} for n, s in sc.items()}}
for d in sorted(glob.glob("runs/codex/*")):
    p = pathlib.Path(d)
    try: s = codex_summary(d)
    except Exception as e: continue
    m = json.load(open(p/"meta.json"))
    out["codex"][p.name] = {"args": {k: m["args"].get(k) for k in ("instr", "copies", "mode", "result", "schema", "flat", "model")}, "model": s["model"], "catalog": s["catalog"],
        "js": {k: {kk: vv for kk, vv in v.items() if kk in ("len", "schema_len", "first", "last")} for k, v in s["js"].items()}, "printed": s["printed"]}
for d in sorted(glob.glob("runs/grok/*")):
    p = pathlib.Path(d); a = grok_agg(d)
    if a is None: continue
    m = json.load(open(p/"meta.json")); out["grok"][p.name] = {"args": {k: m["args"].get(k) for k in ("instr", "copies", "mode", "result")}, **a}
json.dump(out, open("results.json", "w"), indent=1)
print({c: len(v) for c, v in out.items()})
