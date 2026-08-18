#!/usr/bin/env bash
#
# update.sh — re-pin the Stellar/Soroban ecosystem agent skills.
#
# This resolves a commit per source, walks its tree, and records the pin
# (commit + per-file path/size/git-blob-sha) in MANIFEST.json. It vendors
# NOTHING: skill bodies never enter the repo. It does FETCH bodies at the end —
# to print the old-pin -> new-pin body diff for review, and for build-index.mjs
# to read frontmatter — into the gitignored ecosystem-skills/.cache/. The pin is the whole
# artifact — the builders and the Worker fetch each file from
# raw.githubusercontent.com at the pinned commit and verify it against the
# blob sha recorded here (scripts/lib/skill-mirror.mjs, src/skills/source.ts).
#
# Sources, each grouped under <source>/<skill>/ in the manifest:
#
#   lumenloop            github  lumenloop/lumenloop-skills        (8 public skills)
#   openzeppelin-stellar github  OpenZeppelin/openzeppelin-skills  (3 Stellar skills, cherry-picked)
#   stellar-dev          github  stellar/stellar-dev-skill         (7 SDF skills)
#   stellar-light        github  Stellar-Light/stellar-scout       (1 skill, repo root)
#
# Public sources ONLY, no credentials. The lumenloop-api partner source (6
# partner skills from the private lumenloop-api-skills repo, fetched via the
# credentialed /v1/skills/archive/partner endpoint) was REMOVED 2026-07-06:
# the skills were retired from catalog exposure 2026-07-03 (Solo todo 825,
# RETIRED_ONBOARDING_SKILLS in scripts/exposure.mjs), their description
# harvest is complete, and partner-tier content must not live in this public
# repo. Do NOT re-add a credentialed source here — this script staying
# keyless is what guarantees future agent-run syncs can never pull
# partner-confidential content into the repo.
#
# Each GitHub source's upstream LICENSE/NOTICE file NAMES are recorded in the
# manifest (provenance, not redistribution — nothing is copied here). See
# THIRD-PARTY-NOTICES.md at the repo root for the source-by-source license map.
#
# It also snapshots the stellarlight.xyz/api/skills DIRECTORY (≈30 ecosystem
# entries across sources/kinds) into catalog.json — the "what exists in the
# ecosystem" map, NOT downloaded as skills.
#
# Each source pins its own commit/ref + synced_at in MANIFEST.json. INDEX.md is
# regenerated via build-index.mjs.
#
# Usage:
#   ./update.sh            # re-pin every source at its default branch
#
# Requires: gh (authenticated), jq, node, curl, git. No API keys.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/MANIFEST.json"
CATALOG="$SCRIPT_DIR/catalog.json"

command -v gh    >/dev/null || { echo "error: gh CLI not found" >&2; exit 1; }
command -v jq    >/dev/null || { echo "error: jq not found" >&2; exit 1; }
command -v node  >/dev/null || { echo "error: node not found" >&2; exit 1; }
command -v curl  >/dev/null || { echo "error: curl not found" >&2; exit 1; }
command -v git   >/dev/null || { echo "error: git not found" >&2; exit 1; }

# Every source is public and every step fails closed, so a run that reaches the
# swap has pinned everything. (The credentialed partner source and its
# ALLOW_PARTIAL escape hatch were removed 2026-07-06; see the header note.)
MIRROR_STATUS="complete"
MISSING_SOURCES="[]"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
SRC_DIR="$WORK/sources"   # one <id>.json per re-pinned source
# Everything is staged under $WORK and only moved into place AFTER all sources
# succeed, so a mid-run failure never leaves a half-written MANIFEST.json.
MANIFEST_TMP="$WORK/MANIFEST.json"
CATALOG_TMP="$WORK/catalog.json"
mkdir -p "$SRC_DIR"

NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------------------
# pin_github <id> <owner> <repo> <src_path> <ref> [skill ...]
#
#   src_path  ""            -> the repo root is ONE skill (named by the 6th arg)
#             "skills" etc. -> each child dir under it is a skill
#   skill...  optional allow-list of skill names to cherry-pick (subdir mode)
#             OR, when src_path is "", the single skill name for the repo root.
# Records every *.md blob under the selected skill(s) at the pinned commit.
# ---------------------------------------------------------------------------
pin_github() {
  local id=$1 owner=$2 repo=$3 src_path=$4 ref=$5; shift 5
  local pick=("$@")
  local prefix=""; [ -n "$src_path" ] && prefix="$src_path/"
  echo "Pinning ${id}: ${owner}/${repo}${src_path:+/$src_path} @ ${ref} ..."

  local cq="repos/${owner}/${repo}/commits?sha=${ref}&per_page=1"
  [ -n "$src_path" ] && cq="${cq}&path=${src_path}"
  local commit commit_date
  commit="$(gh api "$cq" --jq '.[0].sha')"
  commit_date="$(gh api "$cq" --jq '.[0].commit.committer.date')"

  local tree
  tree="$(gh api "repos/${owner}/${repo}/git/trees/${commit}?recursive=1")"

  # Per-file rows: { skill, relpath (within the skill), size, sha, src (raw path) }.
  local pick_json files
  pick_json="$(printf '%s\n' ${pick[@]+"${pick[@]}"} | jq -R . | jq -s 'map(select(length>0))')"
  if [ -z "$src_path" ]; then
    # Root mode: the whole repo is one skill; its name is the single pick entry.
    local root_skill; root_skill="$(echo "$pick_json" | jq -r '.[0]')"
    files="$(echo "$tree" | jq --arg s "$root_skill" '
      [ .tree[]
        | select(.type=="blob")
        | select(.path|endswith(".md"))
        | { skill: $s, relpath: .path, size: .size, sha: .sha, src: .path } ]
      | sort_by(.relpath)')"
  else
    files="$(echo "$tree" | jq --arg p "$prefix" --argjson pick "$pick_json" '
      [ .tree[]
        | select(.type=="blob")
        | select(.path|startswith($p))
        | select(.path|endswith(".md"))
        | { rel: (.path|ltrimstr($p)), size: .size, sha: .sha, src: .path }
        | . + { skill: (.rel|split("/")[0]) }
        | select(($pick|length)==0 or (.skill as $s | $pick|index($s)))
        | { skill, relpath: (.rel|sub("^[^/]+/";"")), size, sha, src } ]
      | sort_by(.skill+"/"+.relpath)')"
  fi

  # Record which upstream LICENSE/NOTICE files exist at the pinned commit.
  # Names only — nothing is downloaded (THIRD-PARTY-NOTICES.md maps each source
  # to its license and links to the file upstream).
  local license_files="[]" notice_name
  for notice_name in LICENSE LICENSE.md LICENSE.txt LICENSE-APACHE LICENSE-MIT NOTICE NOTICE.md COPYING; do
    if echo "$tree" | jq -e --arg n "$notice_name" '.tree[] | select(.type=="blob" and .path==$n)' >/dev/null; then
      license_files="$(echo "$license_files" | jq --arg n "$notice_name" '. + [$n]')"
    fi
  done

  # Group flat file rows into per-skill objects.
  local skills_json
  skills_json="$(echo "$files" | jq '
    group_by(.skill)
    | map({ name: .[0].skill,
            files: (map({path: .relpath, size, sha}) | sort_by(.path)) })')"

  jq -n \
    --arg id "$id" --arg owner "$owner" --arg repo "$repo" \
    --arg path "$src_path" --arg ref "$ref" \
    --arg commit "$commit" --arg commit_date "$commit_date" \
    --argjson skills "$skills_json" --argjson license_files "$license_files" '
    { id:$id, type:"github", owner:$owner, repo:$repo, path:$path, ref:$ref,
      commit:$commit, commit_date:$commit_date,
      url:("https://github.com/"+$owner+"/"+$repo+"/tree/"+$commit+($path|if .=="" then "" else "/"+. end)),
      license_files:$license_files,
      skills:$skills }' > "$SRC_DIR/$id.json"

  echo "  pinned ${id} @ ${commit:0:12} ($(echo "$skills_json" | jq length) skills)."
}

# ---------------------------------------------------------------------------
# fetch_catalog — snapshot the stellarlight.xyz ecosystem directory.
# ---------------------------------------------------------------------------
fetch_catalog() {
  echo "Fetching catalog: stellarlight.xyz/api/skills ..."
  local raw
  # FAIL CLOSED. Silently keeping the previous snapshot let a run advance every
  # skill pin, print "Done", and exit 0 while leaving a stale ecosystem catalog
  # behind — a mixed-age result reported as a complete refresh, which is exactly
  # what an operator resolving a drift issue would then believe was resolved.
  raw="$(curl -fsS "https://stellarlight.xyz/api/skills")" || {
    echo "error: could not fetch the stellarlight catalog — refusing to re-pin." >&2
    echo "       Nothing was changed. Retry when the directory is reachable." >&2
    exit 1
  }
  echo "$raw" | jq --arg now "$NOW" '
    { source: "https://stellarlight.xyz/api/skills",
      fetched_at: $now,
      counts: .meta.counts,
      validKinds: .meta.validKinds,
      entries: ( .skills
        | map({ name: (.slug // .name), title: .name, source, kind,
                tagline, install, repository, homepage })
        | sort_by(.source+"/"+.name) ) }' > "$CATALOG_TMP"
  echo "  catalog: $(jq '.entries|length' "$CATALOG_TMP") entries across $(jq -r '.counts.bySource|keys|join(", ")' "$CATALOG_TMP")."
}

# ===========================================================================
# Re-pin every source. With `set -e`, any failure here aborts BEFORE the swap
# below, so MANIFEST.json is never left clobbered.
# ===========================================================================
pin_github lumenloop            lumenloop   lumenloop-skills    skills main
pin_github openzeppelin-stellar OpenZeppelin openzeppelin-skills skills main \
            setup-stellar-contracts upgrade-stellar-contracts develop-secure-contracts
pin_github stellar-dev          stellar     stellar-dev-skill   skills main
pin_github stellar-light        Stellar-Light stellar-scout     ""     main stellar-scout

fetch_catalog

# Assemble MANIFEST.json (staged) from every per-source pin object.
SOURCES="$(jq -s 'sort_by(.id)' "$SRC_DIR"/*.json)"
TOTAL_SKILLS="$(echo "$SOURCES" | jq '[.[].skills|length]|add')"

jq -n --arg now "$NOW" --arg status "$MIRROR_STATUS" --argjson missing "$MISSING_SOURCES" \
      --argjson sources "$SOURCES" --argjson total "$TOTAL_SKILLS" '
  { synced_at:$now, status:$status, missing_sources:$missing,
    skill_count:$total, sources:$sources }' > "$MANIFEST_TMP"

# ---------------------------------------------------------------------------
# BODY DIFF — the review gate, not a convenience.
#
# Skill bodies are prompt input. When they were vendored, a re-pin put the text
# change straight into `git diff` and a human could not avoid seeing it. Pinning
# by hash removed that surface: the commit shows sha changes only. So before the
# swap, print a real unified diff of every file whose sha moved, old pin vs new
# pin, fetched from upstream. Nothing here is written to the repo — the diff is
# for the human at the moment of re-pinning.
# ---------------------------------------------------------------------------
if [ -f "$MANIFEST" ]; then
  echo
  echo "=== SKILL BODY DIFF (old pin -> new pin) ==============================="
  node "$SCRIPT_DIR/../scripts/diff-pins.mjs" "$MANIFEST" "$MANIFEST_TMP" || {
    echo "error: body diff failed — refusing to swap pins unreviewed" >&2
    exit 1
  }
  echo "======================================================================="
  echo "Skills are PROMPT INPUT. Read the diff above before committing."
  echo "Then record the attestation in ecosystem-skills/PIN-REVIEW.md (CI checks it)."
  echo
fi

# --- Atomic swap: only now do we touch the real MANIFEST + catalog. ---
mv "$MANIFEST_TMP" "$MANIFEST"
mv "$CATALOG_TMP" "$CATALOG"

echo "Pinned ${TOTAL_SKILLS} skills across $(echo "$SOURCES" | jq length) sources — complete."

# The exact tokens PIN-REVIEW.md must carry for CI to accept this re-pin.
echo
echo "Record these in ecosystem-skills/PIN-REVIEW.md (scripts/check-pin-review.mjs enforces them):"
node "$SCRIPT_DIR/../scripts/check-pin-review.mjs" --digests | sed 's/^/  /'
echo

# Regenerate the themed index (fetches each pinned SKILL.md into the gitignored
# working cache to read its frontmatter).
node "$SCRIPT_DIR/build-index.mjs"

echo "Done. Manifest: $MANIFEST (status: ${MIRROR_STATUS})"
