#!/usr/bin/env python3
"""batch.py CLIENT [--reps 3] [--only a,b,...] [--no-deferred] [--big]"""
import subprocess, sys, argparse, pathlib
HERE = pathlib.Path(__file__).resolve().parent
ap = argparse.ArgumentParser(); ap.add_argument("client"); ap.add_argument("--reps", type=int, default=3)
ap.add_argument("--only", default=""); ap.add_argument("--deferred", action="store_true")
ap.add_argument("--extra", default="")
ap.add_argument("--tag", default="")
a = ap.parse_args()
plan = []
for i in range(1, a.reps+1):
    plan.append((f"A20k-{i}", ["--instr", "20000"]))
    plan.append((f"B4090-{i}", ["--instr", "4090"]))
for i in range(1, a.reps+1):
    plan.append((f"C4090x2-{i}", ["--instr", "4090", "--copies", "2"]))
    plan.append((f"C20kx2-{i}", ["--instr", "20000", "--copies", "2"]))
if a.deferred:
    for i in range(1, a.reps+1): plan.append((f"D20k-{i}", ["--instr", "20000", "--mode", "deferred"]))
plan.append(("E-bigresult", ["--instr", "4090", "--result", "120000"]))
only = [x for x in a.only.split(",") if x]
for label, args in plan:
    if only and not any(label.startswith(o) for o in only): continue
    cmd = [sys.executable, str(HERE/"run.py"), a.client, a.tag + label] + args + (a.extra.split() if a.extra else [])
    print("==", label, flush=True)
    r = subprocess.run(cmd, cwd="/tmp", capture_output=True, text=True)
    print(r.stdout[-1500:], r.stderr[-800:], flush=True)
