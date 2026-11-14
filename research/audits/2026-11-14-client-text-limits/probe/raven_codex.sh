#!/bin/bash
cd "$(dirname "$0")"
python3 raven_run.py codex r3
python3 raven_run.py codex r4 --model gpt-6.1-sol
