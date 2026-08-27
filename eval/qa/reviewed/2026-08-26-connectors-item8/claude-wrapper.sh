#!/bin/sh
set -eu

real_claude=/Users/kalepail/.local/bin/claude

case " $* " in
  *" --max-budget-usd "*)
    echo "wrapper refuses a caller-supplied budget" >&2
    exit 64
    ;;
esac

case " $* " in
  *" --output-format stream-json "*) cap_usd=1.75 ;;
  *" --output-format json "*) cap_usd=0.50 ;;
  *)
    echo "wrapper refuses an unknown output format" >&2
    exit 64
    ;;
esac

exec "$real_claude" --max-budget-usd "$cap_usd" "$@"
