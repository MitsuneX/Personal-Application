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

// Ensure Pool has healthy concurrency and timeout buffers
function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("[Prisma] DATABASE_URL is not set. Add it to .env and restart the dev server.");
  }

  // Dev mode: re-create pool if it was instantiated with older restrictive settings (< 8 max connections)
  const currentMax = (global.__prismaPool as any)?.options?.max;
  const currentTimeout = (global.__prismaPool as any)?.options?.connectionTimeoutMillis;
  const isPoolStale =
    !global.__prismaPool ||
    (typeof currentMax === "number" && currentMax < 8) ||
    (typeof currentTimeout === "number" && currentTimeout < 30000);

  if (isPoolStale) {
    if (global.__prismaPool) {
      try {
        global.__prismaPool.end();
      } catch {
        // ignore error during close
      }
    }
    global.__prismaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Supabase pooler
      max: 10, // handles parallel dashboard queries comfortably without hitting Supabase limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    });
  }

  return global.__prismaPool!;
}

// In development, ensure PrismaClient reflects freshly generated client types
function getPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  if (process.env.NODE_ENV === "production") {
    if (!global.__prismaClient) {
      global.__prismaClient = new PrismaClient({ adapter, log: ["error"] });
    }
    return global.__prismaClient;
  }
  // Dev mode: re-instantiate if cached client instance is missing new schema delegates
  const isClientValid =
    global.__prismaClient &&
    "userAccount" in global.__prismaClient &&
    "emergencyContact" in global.__prismaClient &&
    "pendingEmailRelink" in global.__prismaClient &&
    "gameSyncMetadata" in global.__prismaClient &&
    "softDeleteHistory" in global.__prismaClient &&
    "couple" in global.__prismaClient &&
    "coupleLike" in global.__prismaClient;

  if (!isClientValid) {
    global.__prismaClient = new PrismaClient({ adapter, log: ["warn", "error"] });
  }
  return global.__prismaClient!;
}

// Proxy wrapper ensures all API routes access current PrismaClient instance dynamically
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export { prisma };
export default prisma;
