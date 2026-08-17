import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

async function withRetry<T>(label: string, run: () => Promise<T>, attempts = 4) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts || !/timeout|ECONN|terminat/i.test(message)) {
        throw error;
      }
      const delayMs = 400 * attempt;
      console.warn(`${label}: retry ${attempt}/${attempts} in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    max: 2,
    connectionTimeoutMillis: 20_000,
    ssl: connectionString.includes("sslmode=")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const defaultPassword =
      process.env.SEED_STAFF_PASSWORD?.trim() || "ChangeMe123!";
    const passwordHash = await hash(defaultPassword, 10);

    const staffSeed = [
      {
        email: "superadmin@unn-alumni.org",
        name: "Super Admin",
        role: "SUPER_ADMIN" as const,
      },
      {
        email: "admin@unn-alumni.org",
        name: "Admin User",
        role: "ADMIN" as const,
      },
    ];

    for (const account of staffSeed) {
      await withRetry(`seed ${account.email}`, () =>
        prisma.user.upsert({
          where: { email: account.email },
          create: {
            email: account.email,
            name: account.name,
            role: account.role,
            status: "ACTIVE",
            passwordHash,
            lastActiveAt: new Date(),
          },
          update: {
            name: account.name,
            role: account.role,
            status: "ACTIVE",
            passwordHash,
          },
        }),
      );
    }

    console.log(
      `Seeded staff logins (password: ${defaultPassword}):\n` +
        `  - superadmin@unn-alumni.org → /super-admin\n` +
        `  - admin@unn-alumni.org → /admin`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
