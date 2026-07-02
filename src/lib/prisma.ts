import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requires a driver adapter. We use node-postgres (`pg`) against
// Neon; the connection string is provided via DATABASE_URL.
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrismaClient = () =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Reuse a single client across hot reloads in development to avoid
// exhausting the database connection pool.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
