import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ── Global singletons survive Next.js hot-reloads in dev ──────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __prismaPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

// Pool: one per process — never recreated
if (!global.__prismaPool) {
  if (!process.env.DATABASE_URL) {
    throw new Error("[Prisma] DATABASE_URL is not set. Add it to .env and restart the dev server.");
  }
  global.__prismaPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Supabase pooler
    max: 3, // safe for Supabase session-mode pooler (limit: 15)
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

// PrismaClient: one per process — never recreated
if (!global.__prismaClient) {
  const adapter = new PrismaPg(global.__prismaPool);
  global.__prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  const modelKeys = Object.keys(global.__prismaClient).filter(
    (k) => !k.startsWith("_") && !k.startsWith("$")
  );
  console.log("[Prisma Singleton] Initialized with models:", modelKeys);
}

const prisma = global.__prismaClient;

export { prisma };
export default prisma;
