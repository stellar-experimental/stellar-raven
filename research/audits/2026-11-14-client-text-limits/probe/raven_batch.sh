#!/bin/bash
cd "$(dirname "$0")"
python3 raven_run.py claude r1 --mode direct
python3 raven_run.py claude r2 --mode deferred
python3 raven_run.py claude r3 --mode direct
python3 raven_run.py codex r1
python3 raven_run.py codex r2 --model gpt-6.1-sol
python3 raven_run.py grok r1
python3 raven_run.py opencode r1
