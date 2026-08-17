import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Use process.env (not env()) so `prisma generate` works in CI/Vercel
 * when DATABASE_URL is not available during install.
 * Runtime still requires DATABASE_URL via lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
