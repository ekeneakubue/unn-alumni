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
      max: 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
      ssl:
        connectionString.includes("sslmode=")
          ? { rejectUnauthorized: false }
          : undefined,
    });

  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", error);
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
    globalForPrisma.pgConnectionString = connectionString;
  }

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
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
