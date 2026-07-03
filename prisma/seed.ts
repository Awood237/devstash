import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Built-in system item types (userId = null, isSystem = true). We upsert by a
// stable `id` because the @@unique([userId, name]) constraint cannot dedupe
// system types — Postgres treats a null userId as distinct.
const systemItemTypes = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280" },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "type_url", name: "link", icon: "Link", color: "#10b981" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check your .env file.");
  }

  console.log("🌱 Starting seed...\n");

  // 1. System item types --------------------------------------------------
  console.log("📦 Seeding system item types...");
  const typeIds: Record<string, string> = {};
  for (const type of systemItemTypes) {
    const record = await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color, isSystem: true },
      create: { ...type, isSystem: true },
    });
    typeIds[type.name] = record.id;
  }
  console.log(`   ✓ ${systemItemTypes.length} types`);

  // 2. Demo user ----------------------------------------------------------
  console.log("\n👤 Creating demo user...");
  const hashedPassword = await bcrypt.hash("12345678", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`   ✓ ${demoUser.email}`);

  // 2b. Clean out this user's existing collections/items so re-seeding is
  //     idempotent (items first — collections would otherwise just null out
  //     their collectionId via onDelete: SetNull).
  console.log("\n🧹 Cleaning up existing demo data...");
  await prisma.item.deleteMany({ where: { userId: demoUser.id } });
  await prisma.collection.deleteMany({ where: { userId: demoUser.id } });

  // 3. Collections --------------------------------------------------------
  console.log("\n📁 Creating collections...");
  const collectionSeeds = [
    { key: "react", name: "React Patterns", description: "Reusable React patterns and hooks", isFavorite: true },
    { key: "ai", name: "AI Workflows", description: "AI prompts and workflow automations", isFavorite: true },
    { key: "devops", name: "DevOps", description: "Infrastructure and deployment resources", isFavorite: false },
    { key: "terminal", name: "Terminal Commands", description: "Useful shell commands for everyday development", isFavorite: false },
    { key: "design", name: "Design Resources", description: "UI/UX resources and references", isFavorite: false },
  ];
  const collectionIds: Record<string, string> = {};
  for (const c of collectionSeeds) {
    const created = await prisma.collection.create({
      data: { name: c.name, description: c.description, isFavorite: c.isFavorite, userId: demoUser.id },
    });
    collectionIds[c.key] = created.id;
    console.log(`   ✓ ${c.name}`);
  }

  // 4. Items --------------------------------------------------------------
  // Links use contentType `text` (the default) with the `url` field set — our
  // ContentType enum only has `text`/`file`, no dedicated URL type yet.
  console.log("\n📝 Creating items...");
  const items = [
    // --- React Patterns (3 snippets) ---
    {
      title: "useDebounce Hook",
      description: "Debounces a value by a delay. Useful for search inputs and API calls.",
      language: "typescript",
      typeId: typeIds.snippet,
      collectionId: collectionIds.react,
      isPinned: true,
      content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
    },
    {
      title: "useLocalStorage Hook",
      description: "Persist state to localStorage with SSR support.",
      language: "typescript",
      typeId: typeIds.snippet,
      collectionId: collectionIds.react,
      content: `import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStored(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [stored, setValue] as const;
}`,
    },
    {
      title: "Compound Component Pattern",
      description: "Flexible compound component with context for accessible UI.",
      language: "typescript",
      typeId: typeIds.snippet,
      collectionId: collectionIds.react,
      content: `import { createContext, useContext, useState, ReactNode } from 'react';

const AccordionContext = createContext<{
  openItems: string[];
  toggle: (id: string) => void;
} | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('useAccordion must be used within Accordion');
  return ctx;
}

export function Accordion({ children }: { children: ReactNode }) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const toggle = (id: string) =>
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      {children}
    </AccordionContext.Provider>
  );
}`,
    },
    // --- AI Workflows (3 prompts) ---
    {
      title: "Code Review Assistant",
      description: "Comprehensive code review prompt for catching issues and improving quality.",
      typeId: typeIds.prompt,
      collectionId: collectionIds.ai,
      isFavorite: true,
      content: `You are a senior software engineer performing a code review. Analyze the provided code and give feedback on:

1. Code Quality — is it clean, readable, and well-organized?
2. Best Practices — does it follow language/framework conventions?
3. Performance — any potential performance issues?
4. Security — any vulnerabilities?
5. Testing — what tests would you recommend?

Give specific line references and actionable suggestions.`,
    },
    {
      title: "Documentation Generator",
      description: "Generate JSDoc and markdown documentation from code.",
      typeId: typeIds.prompt,
      collectionId: collectionIds.ai,
      content: `Generate comprehensive documentation for the following code. Include:

1. Overview — what the code does
2. Parameters/Props — inputs with types and descriptions
3. Return Value — what it returns
4. Usage Examples — 2-3 practical examples
5. Edge Cases — limitations to be aware of

Use JSDoc for functions and markdown for components.`,
    },
    {
      title: "Refactoring Assistant",
      description: "Actionable refactoring suggestions with before/after examples.",
      typeId: typeIds.prompt,
      collectionId: collectionIds.ai,
      content: `Analyze the following code and suggest refactoring improvements. Focus on:

1. DRY — extract repeated code
2. Single Responsibility — functions doing too much
3. Naming — unclear names
4. Complexity — simplify nested conditionals
5. Modern Patterns — suggest modern language features

For each suggestion, show the original, the refactored version, and the benefit.`,
    },
    // --- DevOps (1 snippet, 1 command, 2 links) ---
    {
      title: "Docker Compose — Node.js + PostgreSQL",
      description: "Docker Compose setup for a Node.js app with PostgreSQL.",
      language: "yaml",
      typeId: typeIds.snippet,
      collectionId: collectionIds.devops,
      content: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5`,
    },
    {
      title: "Deploy to Production",
      description: "Pull latest, install deps, build, and restart PM2 processes.",
      typeId: typeIds.command,
      collectionId: collectionIds.devops,
      content: `git pull origin main && npm ci && npm run build && pm2 restart all`,
    },
    {
      title: "Docker Documentation",
      description: "Official Docker docs — containers, images, compose, and more.",
      typeId: typeIds.link,
      collectionId: collectionIds.devops,
      url: "https://docs.docker.com/",
    },
    {
      title: "GitHub Actions Documentation",
      description: "CI/CD workflows with GitHub Actions.",
      typeId: typeIds.link,
      collectionId: collectionIds.devops,
      url: "https://docs.github.com/en/actions",
    },
    // --- Terminal Commands (4 commands) ---
    {
      title: "Git Undo Last Commit (Keep Changes)",
      description: "Undo the last commit but keep all changes staged.",
      typeId: typeIds.command,
      collectionId: collectionIds.terminal,
      isPinned: true,
      content: `git reset --soft HEAD~1`,
    },
    {
      title: "Docker Cleanup",
      description: "Remove all unused Docker resources: containers, networks, images, volumes.",
      typeId: typeIds.command,
      collectionId: collectionIds.terminal,
      content: `docker system prune -af --volumes`,
    },
    {
      title: "Kill Process on Port",
      description: "Find and kill any process running on port 3000.",
      typeId: typeIds.command,
      collectionId: collectionIds.terminal,
      content: `lsof -ti:3000 | xargs kill -9`,
    },
    {
      title: "Check Outdated Packages",
      description: "List outdated npm packages with current, wanted, and latest versions.",
      typeId: typeIds.command,
      collectionId: collectionIds.terminal,
      content: `npm outdated --long`,
    },
    // --- Design Resources (4 links) ---
    {
      title: "Tailwind CSS Documentation",
      description: "Utility classes, configuration, and best practices.",
      typeId: typeIds.link,
      collectionId: collectionIds.design,
      isFavorite: true,
      url: "https://tailwindcss.com/docs",
    },
    {
      title: "shadcn/ui Components",
      description: "Accessible components built with Radix UI and Tailwind CSS.",
      typeId: typeIds.link,
      collectionId: collectionIds.design,
      url: "https://ui.shadcn.com/",
    },
    {
      title: "Radix UI Primitives",
      description: "Unstyled, accessible UI primitives for building design systems.",
      typeId: typeIds.link,
      collectionId: collectionIds.design,
      url: "https://www.radix-ui.com/primitives",
    },
    {
      title: "Lucide Icons",
      description: "Beautiful, consistent open-source icons.",
      typeId: typeIds.link,
      collectionId: collectionIds.design,
      url: "https://lucide.dev/icons/",
    },
  ];

  await prisma.item.createMany({
    data: items.map((item) => ({ ...item, userId: demoUser.id })),
  });
  console.log(`   ✓ ${items.length} items`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   • ${systemItemTypes.length} system item types`);
  console.log(`   • 1 demo user (demo@devstash.io / 12345678)`);
  console.log(`   • ${collectionSeeds.length} collections`);
  console.log(`   • ${items.length} items`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
