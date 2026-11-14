#!/bin/bash
cd "$(dirname "$0")"
export PERSIST=1
python3 run.py claude P2 --instr 20000 --mode deferred
python3 run.py claude P3 --instr 20000 --copies 2
python3 run.py claude P4 --instr 4090 --copies 2
python3 run.py claude P5 --instr 4090 --result 120000
python3 raven_run.py claude PR1 --mode direct
python3 raven_run.py claude PR2 --mode deferred
