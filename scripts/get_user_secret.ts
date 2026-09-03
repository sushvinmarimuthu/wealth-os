import { prisma } from '../src/lib/prisma.js';
import argon2 from 'argon2';

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const email = getArg('-e');
  const password = getArg('-p');

  if (!email || !password) {
    console.error('Usage: npx tsx script.ts -e <email> -p <password>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('Invalid email or password');
    process.exit(1);
  }

  const passwordValid = await argon2.verify(user.password, password);

  if (!passwordValid) {
    console.error('Invalid email or password');
    process.exit(1);
  }

  console.log(user.secret_key);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
