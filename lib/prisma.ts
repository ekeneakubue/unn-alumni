import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  pgConnectionString: string | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    globalForPrisma.pgPool &&
    globalForPrisma.pgConnectionString !== connectionString
  ) {
    void globalForPrisma.pgPool.end().catch(() => undefined);
    globalForPrisma.pgPool = undefined;
    globalForPrisma.prisma = undefined;
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 20_000,
      keepAlive: true,
      allowExitOnIdle: true,
      ssl:
        connectionString.includes("sslmode=")
          ? { rejectUnauthorized: false }
          : undefined,
    });

  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", error);
  });

  globalForPrisma.pgPool = pool;
  globalForPrisma.pgConnectionString = connectionString;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;
  // Recreate if HMR/global cache still holds a client from an older schema.
  if (existing && typeof existing.faculty?.findMany === "function") {
    return existing;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Lazy proxy so importing this module during `next build` does not require
 * DATABASE_URL. The real client is created on first property access at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
