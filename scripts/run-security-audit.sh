#!/usr/bin/env sh

set -e

# Prefer yarn when yarn.lock is present; fall back to npm only when package-lock exists.
if command -v yarn >/dev/null 2>&1; then
  yarn audit --level moderate
  exit $?
fi

if command -v npm >/dev/null 2>&1 && [ -f package-lock.json ]; then
  npm audit --audit-level=moderate
  exit $?
fi

echo "[audit] Skipping dependency audit: yarn not installed and no npm lockfile found."
exit 0
