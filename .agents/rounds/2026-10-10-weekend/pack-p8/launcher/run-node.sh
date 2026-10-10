#!/bin/sh
# Frozen environment for the p7 and p8 re-judges. Only the pinned Claude link is first on PATH.
exec /usr/bin/env -i \
  HOME=/Users/kalepail \
  USER=kalepail \
  LOGNAME=kalepail \
  SHELL=/bin/zsh \
  TMPDIR=/var/folders/j9/g5kf8n6j6js86_zvj2lcr8kh0000gn/T/ \
  PATH=/private/tmp/claude-501/w1010/r-pin/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  DISABLE_AUTOUPDATER=1 \
  /usr/local/bin/node "$@"
