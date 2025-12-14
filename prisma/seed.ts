import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { encodePassword } from '../utils/hash.js'
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    name: "sujoy",
    email: "sujoy@gmail.com",
    password: encodePassword("123"),
    role: "ADMIN"
  }
];

export async function main() {
  for (const u of userData) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existing) {
      await prisma.user.create({ data: u });
      console.log(`User ${u.email} created`);
    } else {
      console.log(`User ${u.email} already exists`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
