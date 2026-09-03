#!/usr/bin/env bash
# Boots the mock backend, then runs test/validate.mjs against a production
# build of View under each content provider. Requires: npm run build already done.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOGDIR="${TMPDIR:-/tmp}/view-test"
mkdir -p "$LOGDIR"

cleanup() { pkill -f "next-server" 2>/dev/null; pkill -f "test/mock-api" 2>/dev/null; }
trap cleanup EXIT
cleanup; sleep 1

echo "▶ starting mock-api on :4000"
node test/mock-api.mjs > "$LOGDIR/mock-api.log" 2>&1 &
sleep 1

overall=0
run_case() {
  local name="$1"; shift
  echo
  echo "══════════════════════════════════════════════════════════"
  echo "  PROVIDER: $name"
  echo "══════════════════════════════════════════════════════════"
  pkill -f "next-server" 2>/dev/null; sleep 1
  env "$@" npm run start > "$LOGDIR/view-$name.log" 2>&1 &
  # wait for readiness (200 or 401 both mean the server is up behind the gate)
  for i in $(seq 1 40); do
    code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login 2>/dev/null)
    [ "$code" = "200" ] && break
    sleep 0.5
  done
  BASE=http://localhost:3000 node test/validate.mjs || overall=1
}

run_case mock CONTENT_PROVIDER=mock
run_case rest CONTENT_PROVIDER=rest SITE_API_URL=http://localhost:4000
run_case rss  CONTENT_PROVIDER=rss  RSS_FEEDS=http://localhost:4000/feed.xml

echo
if [ "$overall" -eq 0 ]; then
  echo "✅ ALL PROVIDERS PASSED"
else
  echo "❌ SOME CHECKS FAILED (see above)"
fi
exit "$overall"
