# MeritView

AI-powered contract dispute analysis platform.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript 5.4, Tailwind CSS 3.4
- **Backend:** Node.js 20, Express 4.19, TypeScript 5.4
- **Database:** PostgreSQL 16 (Prisma 5.14 ORM)
- **Cache:** Redis 7.2
- **LLM:** Groq SDK 1.3, Google Generative AI SDK 0.21
- **Payments:** Stripe SDK 14
- **PDF:** Puppeteer 21
- **Monitoring:** Sentry 7
- **Testing:** Vitest 1.6, Playwright 1.41
- **Infrastructure:** Terraform 1.7, Docker 24, GitHub Actions
- **Package Manager:** pnpm 8.x

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Documentation

- `plan.md` — Single source of truth for the complete implementation plan
- `PROJECT_OPERATING_PROCEDURES.md` — Operational protocols and quality standards
- `PROJECT_CHECKLIST.md` — Live execution tracker
