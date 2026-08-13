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
    connectionTimeoutMillis: 15000,
  });
}

// In development, ensure PrismaClient reflects freshly generated client types
function getPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(global.__prismaPool!);
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
    "softDeleteHistory" in global.__prismaClient;

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
