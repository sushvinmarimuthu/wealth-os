import { prisma } from '../src/lib/prisma.js';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

async function main() {
  const name = 'Sushvin Marimuthu';
  const email = 'sushvinmarimuthu@gmail.com';
  const password = 'Sushvin@WOS#246';
  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
  });
  const SECRET_KEY = randomBytes(32).toString('base64url');

  const existing_user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existing_user) return;
  await prisma.user.create({
    data: {
      email: email,
      name: name,
      password: hashedPassword,
      secret_key: SECRET_KEY,
    },
  });

  const allUsers = await prisma.user.findMany();
  console.log('All users:', JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
