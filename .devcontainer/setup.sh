#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/${CODESPACE_NAME%%-*} 2>/dev/null || cd "$(dirname "$0")/.."
ROOT="$(pwd)"
cd "$ROOT/urna-api"
if [ ! -f .env ]; then cp .env.example .env; fi
mkdir -p database
touch database/database.sqlite
composer install --no-interaction --prefer-dist
php artisan key:generate --no-interaction
php artisan migrate --force
php artisan db:seed --class=CandidatoSeeder --force
cd "$ROOT/frontend"
npm install
npm run build
