#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if ! pgrep -f 'artisan serve --host=0.0.0.0 --port=8000' >/dev/null; then
  cd "$ROOT/urna-api"
  nohup php artisan serve --host=0.0.0.0 --port=8000 > /tmp/eleicaolab-laravel.log 2>&1 < /dev/null &
fi
if ! pgrep -f 'vite --host 0.0.0.0' >/dev/null; then
  cd "$ROOT/frontend"
  nohup npm run dev > /tmp/eleicaolab-vite.log 2>&1 < /dev/null &
fi
