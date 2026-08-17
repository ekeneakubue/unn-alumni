import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { FACULTIES } from "../lib/faculties";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (let facultyIndex = 0; facultyIndex < FACULTIES.length; facultyIndex += 1) {
      const facultyData = FACULTIES[facultyIndex];

      const faculty = await prisma.faculty.upsert({
        where: { name: facultyData.name },
        create: {
          name: facultyData.name,
          published: true,
          sortOrder: facultyIndex,
          departments: {
            create: facultyData.departments.map((name, departmentIndex) => ({
              name,
              published: true,
              sortOrder: departmentIndex,
            })),
          },
        },
        update: {
          published: true,
          sortOrder: facultyIndex,
        },
        include: { departments: true },
      });

      for (
        let departmentIndex = 0;
        departmentIndex < facultyData.departments.length;
        departmentIndex += 1
      ) {
        const departmentName = facultyData.departments[departmentIndex];
        await prisma.department.upsert({
          where: {
            facultyId_name: {
              facultyId: faculty.id,
              name: departmentName,
            },
          },
          create: {
            name: departmentName,
            facultyId: faculty.id,
            published: true,
            sortOrder: departmentIndex,
          },
          update: {
            published: true,
            sortOrder: departmentIndex,
          },
        });
      }
    }

    const facultyCount = await prisma.faculty.count();
    const departmentCount = await prisma.department.count();
    console.log(
      `Seeded ${facultyCount} faculties and ${departmentCount} departments.`,
    );

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
      await prisma.user.upsert({
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
      });
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
