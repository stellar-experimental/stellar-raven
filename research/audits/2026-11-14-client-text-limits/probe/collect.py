import json, glob, sys, pathlib
c = sys.argv[1]
for d in sorted(glob.glob(f"runs/{c}/*")):
    p = pathlib.Path(d)
    if not (p/"score.json").exists(): print(p.name, "no score"); continue
    m = json.load(open(p/"meta.json")); sc = json.load(open(p/"score.json"))
    row = {}
    for n, s in sc.items():
        row[n] = {k: (v["delivered"] if v["delivered"] is not None else "-") for k, v in s.items()}
        row[n] = " ".join(f'{k[:5]}={v}' for k, v in row[n].items())
    print(p.name, m.get("seconds"), m.get("rc"), row)
