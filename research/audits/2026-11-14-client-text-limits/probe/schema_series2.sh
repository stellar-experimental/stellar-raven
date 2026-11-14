#!/bin/bash
cd "$(dirname "$0")"
for n in 4000 4100 5500; do python3 run.py codex S$n --instr 200 --schema $n --flat; done
