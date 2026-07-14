import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "[Prisma] DATABASE_URL is not set. Add it to .env.local and restart the dev server."
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // required for Supabase pooler
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton: created once, reused across requests
// Global var survives Next.js hot-reloads in dev
if (!globalThis._prismaClient) {
  globalThis._prismaClient = createPrismaClient();
}

const prisma = globalThis._prismaClient;

export { prisma };
export default prisma;
