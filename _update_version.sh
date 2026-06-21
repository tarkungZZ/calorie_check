#!/bin/bash
cd /var/www/calorie-check
HASH=$(git rev-parse --short HEAD)
TIME=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
echo "{\"version\":\"$HASH\",\"buildTime\":\"$TIME\"}" > version.json
cat version.json
