#!/bin/bash
set -e

APP_DIR="/var/www/calorie-check"
cd "$APP_DIR"

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Updating version ==="
HASH=$(git rev-parse --short HEAD)
TIME=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
echo "{\"version\":\"$HASH\",\"buildTime\":\"$TIME\"}" > version.json
cat version.json

echo "=== Installing backend dependencies ==="
cd backend
npm install --production
cd ..

echo "=== Building frontend ==="
cd frontend
npm install
NODE_OPTIONS='--max-old-space-size=512' npm run build
cd ..

echo "=== Restarting services (PM2) ==="
pm2 restart ecosystem.config.js --update-env 2>/dev/null || pm2 start ecosystem.config.js

echo "=== Deploy complete ==="
