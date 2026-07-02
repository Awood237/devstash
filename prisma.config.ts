import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 config. The datasource URL lives here (not in schema.prisma).
// DATABASE_URL should point at the Neon **development** branch locally and
// the **production** branch in production. We always create migrations
// (`prisma migrate dev` / `prisma migrate deploy`) — never `db push`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
