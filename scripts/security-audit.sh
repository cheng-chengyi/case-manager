#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-${TARGET_URL:-https://cheng-chengyi.github.io/case-manager/}}"
TARGET_URL="${TARGET_URL%/}/"

TMP_HEADERS="$(mktemp)"
TMP_BODY="$(mktemp)"
trap 'rm -f "$TMP_HEADERS" "$TMP_BODY"' EXIT

curl -sSIL "$TARGET_URL" > "$TMP_HEADERS"
curl -sSL "$TARGET_URL" > "$TMP_BODY"

status_line="$(head -n 1 "$TMP_HEADERS" | tr -d '\r')"
final_status="$(grep -E '^HTTP/' "$TMP_HEADERS" | tail -n 1 | tr -d '\r')"
server="$(grep -i '^server:' "$TMP_HEADERS" | tail -n 1 | cut -d':' -f2- | xargs || true)"

has_header() { grep -qi "^$1:" "$TMP_HEADERS"; }
meta_exists() { grep -qi "$1" "$TMP_BODY"; }

printf '\n=== Security Audit Report ===\n'
printf 'Target: %s\n' "$TARGET_URL"
printf 'Initial status: %s\n' "$status_line"
printf 'Final status: %s\n' "$final_status"
printf 'Server: %s\n\n' "${server:-unknown}"

print_check() {
  local name="$1"; local ok="$2"; local note="$3"
  if [[ "$ok" == "1" ]]; then
    printf '✅ %s: %s\n' "$name" "$note"
  else
    printf '❌ %s: %s\n' "$name" "$note"
  fi
}

print_warn() { printf '⚠️  %s: %s\n' "$1" "$2"; }

csp_meta=0
ref_meta=0
sw_ref=0
manifest_ref=0
hsts_hdr=0
xfo_hdr=0
xcto_hdr=0

meta_exists 'http-equiv="Content-Security-Policy"' && csp_meta=1
meta_exists 'name="referrer"' && ref_meta=1
meta_exists 'serviceWorker.register(' && sw_ref=1
meta_exists 'rel="manifest"' && manifest_ref=1

has_header 'strict-transport-security' && hsts_hdr=1
has_header 'x-frame-options' && xfo_hdr=1
has_header 'x-content-type-options' && xcto_hdr=1

print_check 'CSP meta' "$csp_meta" 'index.html contains Content-Security-Policy meta'
print_check 'Referrer meta' "$ref_meta" 'index.html contains referrer policy meta'
print_check 'Service Worker hook' "$sw_ref" 'index page registers service worker'
print_check 'Manifest hook' "$manifest_ref" 'index page links manifest.json'

if [[ "$hsts_hdr" == "1" ]]; then
  print_check 'HSTS response header' 1 'Strict-Transport-Security found'
else
  print_warn 'HSTS response header' 'Not found (common on static hosting without edge control)'
fi

if [[ "$xfo_hdr" == "1" ]]; then
  print_check 'X-Frame-Options response header' 1 'X-Frame-Options found'
else
  print_warn 'X-Frame-Options response header' 'Not found (prefer edge/CDN header if required)'
fi

if [[ "$xcto_hdr" == "1" ]]; then
  print_check 'X-Content-Type-Options response header' 1 'X-Content-Type-Options found'
else
  print_warn 'X-Content-Type-Options response header' 'Not found (prefer edge/CDN header if required)'
fi

if [[ "$csp_meta" -eq 0 || "$ref_meta" -eq 0 || "$sw_ref" -eq 0 || "$manifest_ref" -eq 0 ]]; then
  exit 1
fi
