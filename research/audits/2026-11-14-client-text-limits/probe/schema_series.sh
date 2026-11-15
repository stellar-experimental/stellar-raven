#!/bin/bash
cd "$(dirname "$0")"
for n in 300 1000 3000 8000; do python3 run.py codex S$n --instr 200 --schema $n --flat; done
