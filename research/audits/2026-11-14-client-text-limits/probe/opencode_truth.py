import sqlite3, glob, json, sys
def truth(run):
    f = glob.glob(f"{run}/xdg-data/**/*.db", recursive=True)[0]
    c = sqlite3.connect(f); out = {"instructions": {}, "namespaces": None, "exec_desc": None}
    for (v,) in c.execute("select value from instruction_blob"):
        try: j = json.loads(v)
        except Exception: continue
        if isinstance(j, list) and j and isinstance(j[0], dict) and "server" in j[0]:
            for e in j: out["instructions"][e["server"]] = {"chars": len(e["instructions"]), "tail": e["instructions"][-40:]}
        if isinstance(j, dict) and "namespaces" in j: out["namespaces"] = j
    return out
if __name__ == "__main__":
    t = truth(sys.argv[1]); print(json.dumps(t["instructions"], indent=1)); print(json.dumps(t["namespaces"])[:1500])
