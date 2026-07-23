#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%Y%m%d-%H%M%S)
pg_dump "$DATABASE_URL" > "backup-${TS}.sql"
echo "Backup written to backup-${TS}.sql"
