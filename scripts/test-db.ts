import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Connectivity + sanity check against the database in DATABASE_URL. Fetches the
// seeded demo data and prints it so you can eyeball that everything is wired up.
// Run with: npm run db:test  (or: npx tsx scripts/test-db.ts)
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check your .env file.");
  }

  console.log("Connecting to the database...");
  await prisma.$connect();
  console.log("✓ Connected");

  // --- Row counts ---
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

  // --- System item types ---
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { name: true, icon: true, color: true },
  });

  console.log(`\nSystem item types (${systemTypes.length}):`);
  for (const type of systemTypes) {
    const icon = type.icon ?? "—";
    const color = type.color ?? "—";
    console.log(`  ${type.name.padEnd(9)} ${icon.padEnd(11)} ${color}`);
  }

  // --- Demo user ---
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!demoUser) {
    throw new Error(`Demo user (${DEMO_EMAIL}) not found — run \`npm run db:seed\` first.`);
  }

  console.log("\nDemo user:");
  console.log(`  name:      ${demoUser.name}`);
  console.log(`  email:     ${demoUser.email}`);
  console.log(`  isPro:     ${demoUser.isPro}`);
  console.log(`  verified:  ${demoUser.emailVerified ? "yes" : "no"}`);
  console.log(`  password:  ${demoUser.password ? "set (hashed)" : "none"}`);

  // --- Demo user's collections + items (via Prisma relations) ---
  const userCollections = await prisma.collection.findMany({
    where: { userId: demoUser.id },
    orderBy: { name: "asc" },
    include: {
      items: {
        orderBy: { title: "asc" },
        include: { type: { select: { name: true } } },
      },
    },
  });

  console.log(`\nCollections (${userCollections.length}):`);
  for (const collection of userCollections) {
    const star = collection.isFavorite ? " ⭐" : "";
    console.log(`\n  📁 ${collection.name}${star} — ${collection.items.length} items`);
    console.log(`     ${collection.description ?? ""}`);
    for (const item of collection.items) {
      const badges = [item.isPinned ? "📌" : "", item.isFavorite ? "⭐" : ""].join("");
      console.log(`     • [${item.type.name}] ${item.title} ${badges}`.trimEnd());
    }
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
