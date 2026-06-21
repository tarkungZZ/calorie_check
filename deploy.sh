#!/bin/bash
set -e

APP_DIR="/var/www/calorie-check"
cd "$APP_DIR"

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Updating version ==="
cat > version.json << EOF
{
  "version": "$(git rev-parse --short HEAD)",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF

echo "=== Installing backend dependencies ==="
cd backend
npm install --production
cd ..

echo "=== Building frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Restarting backend (PM2) ==="
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "=== Deploy complete ==="
echo "Version: $(cat version.json)"
