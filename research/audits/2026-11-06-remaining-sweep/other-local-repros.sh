#!/bin/sh
# Run from the repository root. Package experiments stay outside Vitest discovery.
set -eu
repo_root="$PWD"
repro_dir=$(mktemp -d /tmp/raven-other-repros.XXXXXX)
evidence_dir="$repo_root/tmp/sweep-2026-11-06/other"
mkdir -p "$evidence_dir"
cp research/audits/2026-11-05-improvements/other-search-repro.mjs "$repro_dir/search-repro.mjs"
cp research/audits/2026-11-05-improvements/other-createai-repro.mjs "$repro_dir/createai-repro.mjs"
cp research/audits/2026-11-05-improvements/other-wai-repro.mjs "$repro_dir/wai-repro.mjs"
cd "$repro_dir"
printf '%s\n' '{"type":"module","private":true}' > package.json
curl -fsSL --retry 2 https://raw.githubusercontent.com/cloudflare/agents/main/packages/codemode/src/connectors/search.ts -o search.ts
npm install --ignore-scripts agents@0.33.0 ai@7.0.137 @ai-sdk/anthropic@4.0.78 workers-ai-provider@4.0.1 @ai-sdk/openai@4.0.91 @stellar/stellar-sdk@17.4.0 > install.log 2>&1
node search-repro.mjs > "$evidence_dir/search-result.txt"
node createai-repro.mjs > "$evidence_dir/createai-result.jsonl"
node wai-repro.mjs > "$evidence_dir/wai-result.json"

printf 'Reproduction directory: %s\n' "$repro_dir"
