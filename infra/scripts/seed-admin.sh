#!/usr/bin/env bash
set -euo pipefail
cd backend && pnpm prisma:seed && cd ..
