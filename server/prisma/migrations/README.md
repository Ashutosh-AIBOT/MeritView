# Prisma Migrations

## Prerequisites

- PostgreSQL 16+ with `pgcrypto` extension enabled
- `DATABASE_URL` in `.env` pointing to the MeritView database

## Running Migrations

```bash
# From the server directory:
pnpm db:migrate
```

## Creating a New Migration

```bash
# After modifying server/prisma/schema.prisma:
pnpm --filter ./server db:migrate
```

## Seeding

```bash
pnpm --filter ./server db:seed
```

## Notes

- The schema uses `dbgenerated("gen_random_uuid()")` for UUID primary keys, which requires the `pgcrypto` extension.
- The initial migration enables `pgcrypto` automatically.
- All other table definitions, indexes, and constraints are managed by Prisma.
