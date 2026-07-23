#!/usr/bin/env bash
set -euo pipefail
echo "==> Installing frontend dependencies"
cd frontend && pnpm install && cd ..
echo "==> Installing backend dependencies"
cd backend && pnpm install && cd ..
echo "==> Copying .env files"
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env
[ -f backend/.env ] || cp backend/.env.example backend/.env
echo "==> Starting Docker services"
docker compose -f infra/docker-compose.yml up -d postgres redis mailhog adminer
echo "==> Running migrations + seed"
cd backend && pnpm prisma:generate && pnpm prisma:migrate:dev && pnpm prisma:seed && cd ..
echo "==> Done. Run: pnpm --filter meritview-backend dev (backend) and pnpm --filter meritview-frontend dev (frontend)"
