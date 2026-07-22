import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@meritview.app' },
    update: {},
    create: {
      email: 'admin@meritview.app',
      password_hash: '$2b$12$dummy.hash.for.initial.admin',
      email_verified: true,
      display_name: 'Admin',
      account_type: 'admin',
    },
  });
  console.log('Seed user:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
