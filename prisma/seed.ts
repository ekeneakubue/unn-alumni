import "dotenv/config";
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
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
