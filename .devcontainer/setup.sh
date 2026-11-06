#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/urna-api"
if [ ! -f .env ]; then
  cp .env.example .env
fi
mkdir -p database
touch database/database.sqlite
composer install --no-interaction --prefer-dist
if ! grep -Eq '^APP_KEY=base64:.+' .env; then
  php artisan key:generate --no-interaction
fi
php artisan migrate --force
php artisan db:seed --class=CandidatoSeeder --force

cd "$ROOT/frontend"
npm install
npm run build
