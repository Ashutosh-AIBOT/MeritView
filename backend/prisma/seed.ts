import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@meritview.app' },
    update: {},
    create: {
      email: 'admin@meritview.app',
      emailVerified: true,
      role: 'admin',
      displayName: 'MeritView Admin',
    },
  });
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
