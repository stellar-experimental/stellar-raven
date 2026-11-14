import json, re, sys
TOK = re.compile(r"[A-Z]{2}\d-\d{3}-[a-z]{6}")
SURF = ["instructions","desc_a","desc_b","desc_c","schema","result"]

def extract_json(text):
    # take the last top-level {...} that parses
    best = None
    depth = 0; start = None
    for i,ch in enumerate(text):
        if ch == '{':
            if depth == 0: start = i
            depth += 1
        elif ch == '}':
            if depth: 
                depth -= 1
                if depth == 0 and start is not None:
                    try:
                        o = json.loads(text[start:i+1]); best = o
                    except Exception: pass
    return best

def locate_tail(text, tail, k, tok, seg=128):
    """Exact delivered length: the end position e inside the last-seen segment k at which the model's
    quoted tail (marker stripped) matches the text. Repeated filler makes an unanchored search ambiguous."""
    if not tail or k is None: return None
    lo_e = k*seg + len(tok)
    hi_e = min((k+1)*seg, len(text))
    for cut in range(0, min(len(tail)-20, 40)):
        t = tail[: len(tail)-cut] if cut else tail
        for lead in (0, 10, 20, 30, 40):
            w = t[lead:]
            if len(w) < 20: continue
            hits = [e for e in range(lo_e, hi_e+1) if text[:e].endswith(w)]
            if hits: return hits[-1], cut, lead
    return None

def score(manifest, answer):
    out = {}
    for s in SURF:
        sf = manifest["surfaces"][s]
        a = (answer or {}).get(s) or {}
        toks = sf["tokens"]
        first, last, tail = a.get("first"), a.get("last"), a.get("tail")
        r = {"length": sf["length"], "first": first, "last": last, "jslen": a.get("jslen")}
        r["first_valid"] = first in toks if first else None
        r["last_valid"] = last in toks if last else None
        if last in toks:
            k = toks.index(last)
            r["last_idx"] = k
            r["lo"] = k*manifest["seg"] + len(last)           # at least this many chars delivered
            r["hi"] = min(sf["length"], (k+1)*manifest["seg"] + len(toks[k+1]) - 1) if k+1 < len(toks) else sf["length"]
        loc = locate_tail(sf["text"], tail, r.get("last_idx"), last) if tail else None
        if loc: r["tail_end"], r["tail_trim"], r["tail_lead"] = loc
        r["tail"] = tail
        # best estimate
        if loc: r["delivered"] = loc[0]
        elif "lo" in r: r["delivered"] = f'{r["lo"]}..{r["hi"]}'
        else: r["delivered"] = None if not last and not first else "?"
        out[s] = r
    return out

if __name__ == "__main__":
    m = json.load(open(sys.argv[1])); a = extract_json(open(sys.argv[2]).read())
    print(json.dumps(score(m, a), indent=1))
