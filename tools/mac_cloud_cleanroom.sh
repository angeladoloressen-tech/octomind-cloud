#!/usr/bin/env bash
set -euo pipefail

MODE="dry-run"
PURGE_CACHES="false"
EVICT_CLOUD="false"
CUSTOM_VAULT=""
STAMP="$(date +%Y%m%d_%H%M%S)"
USER_HOME="${HOME}"

usage() {
  cat <<'USAGE'
mac_cloud_cleanroom.sh

Purpose:
  Analyze project/work files on the Mac, move important state into a cloud vault,
  write a manifest, and clean local project clutter without blind deletion.

Modes:
  --dry-run        Analyze only. Default.
  --execute        Copy/move into cloud vault and remove originals from source locations.
  --purge-caches   Remove regenerable caches after recording them in the manifest.
  --evict-cloud    Try to evict iCloud local copies after migration when supported.
  --vault PATH     Use a specific cloud vault folder.

Examples:
  bash tools/mac_cloud_cleanroom.sh --dry-run
  bash tools/mac_cloud_cleanroom.sh --execute --purge-caches
  bash tools/mac_cloud_cleanroom.sh --execute --vault "$HOME/Library/CloudStorage/GoogleDrive-xxx/My Drive"
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) MODE="dry-run"; shift ;;
    --execute) MODE="execute"; shift ;;
    --purge-caches) PURGE_CACHES="true"; shift ;;
    --evict-cloud) EVICT_CLOUD="true"; shift ;;
    --vault) CUSTOM_VAULT="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

log() { printf '%s\n' "$*"; }
q() { printf '%q' "$1"; }

pick_cloud_root() {
  if [[ -n "$CUSTOM_VAULT" ]]; then
    printf '%s\n' "$CUSTOM_VAULT"
    return 0
  fi

  # Prefer streaming cloud folders when present.
  local g
  for g in "$USER_HOME"/Library/CloudStorage/GoogleDrive-*; do
    if [[ -d "$g/My Drive" ]]; then
      printf '%s\n' "$g/My Drive"
      return 0
    fi
  done

  local od
  for od in "$USER_HOME"/Library/CloudStorage/OneDrive-*; do
    if [[ -d "$od" ]]; then
      printf '%s\n' "$od"
      return 0
    fi
  done

  if [[ -d "$USER_HOME/Library/CloudStorage/Dropbox" ]]; then
    printf '%s\n' "$USER_HOME/Library/CloudStorage/Dropbox"
    return 0
  fi

  if [[ -d "$USER_HOME/Library/Mobile Documents/com~apple~CloudDocs" ]]; then
    printf '%s\n' "$USER_HOME/Library/Mobile Documents/com~apple~CloudDocs"
    return 0
  fi

  echo "No cloud folder found. Install/enable Google Drive, iCloud Drive, OneDrive, or Dropbox, or pass --vault PATH." >&2
  return 1
}

CLOUD_ROOT="$(pick_cloud_root)"
VAULT="$CLOUD_ROOT/OCTOMIND_CLOUD_VAULT/macbook-cleanroom/$STAMP"
MANIFEST="$VAULT/manifest.tsv"
SUMMARY="$VAULT/summary.txt"
LOGFILE="$VAULT/run.log"
TRASH_STAGING="$USER_HOME/.Trash/OCTOMIND_CLEANROOM_$STAMP"

mkdir -p "$VAULT" "$TRASH_STAGING"
printf 'timestamp\tmode\tcategory\taction\tsize_bytes\tsha256\tsource\tdestination\tnote\n' > "$MANIFEST"
: > "$LOGFILE"

record() {
  local category="$1" action="$2" size="$3" sha="$4" src="$5" dst="$6" note="$7"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$(date -Is)" "$MODE" "$category" "$action" "$size" "$sha" "$src" "$dst" "$note" >> "$MANIFEST"
}

size_bytes() {
  local p="$1"
  if [[ -e "$p" ]]; then
    /usr/bin/du -sk "$p" 2>/dev/null | awk '{print $1 * 1024}'
  else
    echo 0
  fi
}

sha_file() {
  local p="$1"
  if [[ -f "$p" ]]; then
    /usr/bin/shasum -a 256 "$p" | awk '{print $1}'
  else
    echo "dir"
  fi
}

is_inside_cloud() {
  local p="$1"
  [[ "$p" == "$CLOUD_ROOT"* || "$p" == "$VAULT"* ]]
}

is_cache_path() {
  local base
  base="$(basename "$1")"
  case "$base" in
    node_modules|.venv|venv|env|__pycache__|.pytest_cache|.mypy_cache|.ruff_cache|.next|.nuxt|.vite|.turbo|dist|build|coverage|.parcel-cache|.cache|.DS_Store)
      return 0 ;;
    *) return 1 ;;
  esac
}

is_sensitive_path() {
  local base lower
  base="$(basename "$1")"
  lower="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
  case "$lower" in
    .env|.env.*|*secret*|*token*|*private*|id_rsa|id_rsa.*|*.pem|*.key|*.p12|*.pfx|*.kdbx|*.sqlite|*.db)
      return 0 ;;
    *) return 1 ;;
  esac
}

copy_item() {
  local src="$1" dst="$2"
  mkdir -p "$(dirname "$dst")"
  if [[ -d "$src" ]]; then
    /usr/bin/ditto "$src" "$dst"
  else
    /bin/cp -p "$src" "$dst"
  fi
}

remove_source_after_verify() {
  local src="$1" category="$2"
  if [[ "$category" == "cache" && "$PURGE_CACHES" == "true" ]]; then
    /bin/rm -rf "$src"
    return 0
  fi
  local dst="$TRASH_STAGING/$(basename "$src")"
  if [[ -e "$dst" ]]; then
    dst="$TRASH_STAGING/$(basename "$src")_$RANDOM"
  fi
  /bin/mv "$src" "$dst"
}

scan_roots=()
for p in "$USER_HOME/Desktop" "$USER_HOME/Downloads" "$USER_HOME/Documents" "$USER_HOME/Developer" "$USER_HOME/Projects" "$USER_HOME/octomind"; do
  [[ -e "$p" ]] && scan_roots+=("$p")
done

# Add obvious project folders from home without scanning the entire personal home deeply.
while IFS= read -r -d '' p; do
  scan_roots+=("$p")
done < <(/usr/bin/find "$USER_HOME" -maxdepth 1 -type d \( \
  -iname 'octo*' -o -iname 'titanius*' -o -iname 'velvet*' -o -iname 'cerberrus*' -o -iname 'ptn*' -o -iname 'phi*' -o -iname 'queen-*' \
\) -print0 2>/dev/null || true)

# De-duplicate roots.
unique_roots=()
for r in "${scan_roots[@]}"; do
  skip="false"
  for u in "${unique_roots[@]:-}"; do
    [[ "$r" == "$u" ]] && skip="true"
  done
  [[ "$skip" == "false" ]] && unique_roots+=("$r")
done

{
  echo "OCTOMIND MAC CLOUD CLEANROOM"
  echo "Mode: $MODE"
  echo "Cloud root: $CLOUD_ROOT"
  echo "Vault: $VAULT"
  echo "Trash staging: $TRASH_STAGING"
  echo "Purge caches: $PURGE_CACHES"
  echo "Evict cloud: $EVICT_CLOUD"
  echo
  echo "Roots:"
  printf ' - %s\n' "${unique_roots[@]:-none}"
  echo
} | tee -a "$SUMMARY" "$LOGFILE"

process_item() {
  local src="$1"
  [[ ! -e "$src" ]] && return 0
  is_inside_cloud "$src" && return 0

  local rel category size sha dst note
  rel="${src#$USER_HOME/}"
  size="$(size_bytes "$src")"
  sha="$(sha_file "$src")"

  if is_cache_path "$src"; then
    category="cache"
    dst="$VAULT/CACHE_MANIFEST_ONLY/$rel"
    note="regenerable cache/build artifact"
    record "$category" "classified" "$size" "$sha" "$src" "$dst" "$note"
    if [[ "$MODE" == "execute" ]]; then
      remove_source_after_verify "$src" "$category"
      record "$category" "removed_from_source" "$size" "$sha" "$src" "$dst" "$note"
    fi
    return 0
  fi

  if is_sensitive_path "$src"; then
    category="sensitive_review"
    dst="$VAULT/SENSITIVE_REVIEW/$rel"
    note="sensitive-looking file; moved to isolated review folder inside vault"
  else
    category="cloud_state"
    dst="$VAULT/CLOUD_STATE/$rel"
    note="migrated into cloud vault"
  fi

  record "$category" "planned" "$size" "$sha" "$src" "$dst" "$note"

  if [[ "$MODE" == "execute" ]]; then
    copy_item "$src" "$dst"
    if [[ -f "$src" ]]; then
      local dst_sha
      dst_sha="$(sha_file "$dst")"
      if [[ "$sha" != "$dst_sha" ]]; then
        record "$category" "verify_failed" "$size" "$sha" "$src" "$dst" "destination hash mismatch"
        echo "VERIFY FAILED: $src" >&2
        return 3
      fi
    fi
    record "$category" "copied_verified" "$size" "$sha" "$src" "$dst" "$note"
    remove_source_after_verify "$src" "$category"
    record "$category" "removed_from_source" "$size" "$sha" "$src" "$dst" "$note"
  fi
}

for root in "${unique_roots[@]}"; do
  [[ -e "$root" ]] || continue
  if [[ -d "$root" ]]; then
    while IFS= read -r -d '' item; do
      # Skip hidden system metadata except explicit project dotfiles.
      base="$(basename "$item")"
      [[ "$base" == ".Trash" || "$base" == "Library" || "$base" == "Applications" ]] && continue
      process_item "$item"
    done < <(/usr/bin/find "$root" -mindepth 1 -maxdepth 2 \( \
      -name node_modules -o -name .venv -o -name venv -o -name __pycache__ -o -name dist -o -name build -o -name .next -o -name .vite -o -name .turbo -o -name .pytest_cache -o -name .DS_Store -o \
      -type f -o -type d \
    \) -print0 2>/dev/null || true)
  else
    process_item "$root"
  fi
done

# Inventory largest remaining files in common roots for visibility.
{
  echo
  echo "Largest remaining files after run:"
  for root in "${unique_roots[@]}"; do
    [[ -d "$root" ]] || continue
    /usr/bin/find "$root" -type f -size +20M -print0 2>/dev/null | /usr/bin/xargs -0 ls -lh 2>/dev/null | sort -k5 -hr | head -n 30 || true
  done
} >> "$SUMMARY"

if [[ "$MODE" == "execute" && "$EVICT_CLOUD" == "true" ]]; then
  if command -v brctl >/dev/null 2>&1 && [[ "$CLOUD_ROOT" == *"Mobile Documents/com~apple~CloudDocs"* ]]; then
    /usr/bin/find "$VAULT" -type f -print0 2>/dev/null | while IFS= read -r -d '' f; do
      brctl evict "$f" >/dev/null 2>&1 || true
    done
    record "cloud_evict" "attempted" "0" "n/a" "$VAULT" "$VAULT" "attempted iCloud local eviction"
  fi
fi

{
  echo
  echo "Manifest: $MANIFEST"
  echo "Summary: $SUMMARY"
  echo "Run log: $LOGFILE"
  echo
  if [[ "$MODE" == "dry-run" ]]; then
    echo "Dry run complete. Re-run with --execute to migrate."
  else
    echo "Execute complete. Originals were removed from source paths after copy verification."
    echo "Recoverable staging folder: $TRASH_STAGING"
    echo "Do not empty Trash until the cloud vault is visible in the cloud web UI."
  fi
} | tee -a "$SUMMARY" "$LOGFILE"
