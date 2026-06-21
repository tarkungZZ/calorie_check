import paramiko

HOST = "157.230.244.241"
USER = "root"
PASSWORD = "0LVklm1dXi1WMEhv"

deploy_script = """#!/bin/bash
set -e

APP_DIR="/var/www/calorie-check"
cd "$APP_DIR"

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Updating version ==="
HASH=$(git rev-parse --short HEAD)
TIME=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
echo "{\\"version\\":\\"$HASH\\",\\"buildTime\\":\\"$TIME\\"}" > version.json
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
pm2 save

echo "=== Deploy complete ==="
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

sftp = client.open_sftp()
with sftp.open("/var/www/calorie-check/deploy.sh", "w") as f:
    f.write(deploy_script)
sftp.close()

stdin, stdout, stderr = client.exec_command("chmod +x /var/www/calorie-check/deploy.sh && echo 'deploy.sh updated and executable'")
print(stdout.read().decode().strip())

client.close()
