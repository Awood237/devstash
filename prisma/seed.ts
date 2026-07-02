import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Built-in system item types (userId = null, isSystem = true). Ids match the
// UI's mock data so the database lines up with what the dashboard already
// renders. We upsert by `id` because the @@unique([userId, name]) constraint
// cannot dedupe system types — Postgres treats a null userId as distinct.
const systemItemTypes = [
  { id: "type_snippet", name: "Snippets", icon: "Code2", color: "#3b82f6" },
  { id: "type_prompt", name: "Prompts", icon: "Sparkles", color: "#a855f7" },
  { id: "type_command", name: "Commands", icon: "SquareChevronRight", color: "#f97316" },
  { id: "type_note", name: "Notes", icon: "FileText", color: "#eab308" },
  { id: "type_file", name: "Files", icon: "File", color: "#9ca3af" },
  { id: "type_image", name: "Images", icon: "Image", color: "#ec4899" },
  { id: "type_url", name: "Links", icon: "Link", color: "#22c55e" },
];

async function main() {
  for (const type of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color, isSystem: true },
      create: { ...type, isSystem: true },
    });
  }
  console.log(`Seeded ${systemItemTypes.length} system item types`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
