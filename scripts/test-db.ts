import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Quick connectivity + sanity check against the database in DATABASE_URL.
// Run with: npm run db:test  (or: npx tsx scripts/test-db.ts)
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check your .env file.");
  }

  console.log("Connecting to the database...");
  await prisma.$connect();
  console.log("✓ Connected");

  const [users, itemTypes, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("\nRow counts:");
  console.log(`  users:        ${users}`);
  console.log(`  itemTypes:    ${itemTypes}`);
  console.log(`  items:        ${items}`);
  console.log(`  collections:  ${collections}`);
  console.log(`  tags:         ${tags}`);

  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, icon: true, color: true },
  });

  console.log(`\nSystem item types (${systemTypes.length}):`);
  for (const type of systemTypes) {
    console.log(`  ${type.name.padEnd(10)} ${type.icon}  ${type.color}  (${type.id})`);
  }

  console.log("\n✓ Database test passed");
}

main()
  .catch((error) => {
    console.error("\n✗ Database test failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
