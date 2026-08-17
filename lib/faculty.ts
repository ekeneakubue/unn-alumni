import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { FACULTIES } from "@/lib/faculties";

export type FacultyDepartmentView = {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
};

export type FacultyWithDepartments = {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
  departments: FacultyDepartmentView[];
};

export type AdminFacultyView = {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
  departments: FacultyDepartmentView[];
  departmentNames: string[];
  alumniCount: number;
};

function toFacultyView(
  faculty: {
    id: string;
    name: string;
    published: boolean;
    sortOrder: number;
    departments: FacultyDepartmentView[];
  },
  alumniCount = 0,
): AdminFacultyView {
  return {
    id: faculty.id,
    name: faculty.name,
    published: faculty.published,
    sortOrder: faculty.sortOrder,
    departments: faculty.departments.map((department) => ({
      id: department.id,
      name: department.name,
      published: department.published,
      sortOrder: department.sortOrder,
    })),
    departmentNames: faculty.departments.map((department) => department.name),
    alumniCount,
  };
}

export async function listFaculties(options?: {
  publishedOnly?: boolean;
}): Promise<FacultyWithDepartments[]> {
  const publishedOnly = options?.publishedOnly ?? false;

  return withDbRetry("listFaculties", async () => {
    const faculties = await prisma.faculty.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        published: true,
        sortOrder: true,
        departments: {
          where: publishedOnly ? { published: true } : undefined,
          orderBy: [{ name: "asc" }],
          select: {
            id: true,
            name: true,
            published: true,
            sortOrder: true,
          },
        },
      },
    });

    return faculties;
  });
}

export async function listAdminFaculties(): Promise<AdminFacultyView[]> {
  const faculties = await listFaculties();
  const alumniCounts = await prisma.alumni.groupBy({
    by: ["faculty"],
    _count: { _all: true },
    where: { faculty: { not: null } },
  });

  const countByName = new Map(
    alumniCounts.map((row) => [row.faculty ?? "", row._count._all]),
  );

  return faculties.map((faculty) =>
    toFacultyView(faculty, countByName.get(faculty.name) ?? 0),
  );
}

export async function listPublishedFacultiesForSelect(): Promise<
  { name: string; departments: string[] }[]
> {
  try {
    const faculties = await listFaculties({ publishedOnly: true });
    return faculties.map((faculty) => ({
      name: faculty.name,
      departments: faculty.departments.map((department) => department.name),
    }));
  } catch (error) {
    console.warn(
      "listPublishedFacultiesForSelect: using static faculty list after DB error",
      error instanceof Error ? error.message : error,
    );
    return FACULTIES.map((faculty) => ({
      name: faculty.name,
      departments: [...faculty.departments],
    }));
  }
}

export async function getDepartmentsByFacultyName(facultyName: string) {
  const faculty = await prisma.faculty.findUnique({
    where: { name: facultyName },
    include: {
      departments: {
        where: { published: true },
        orderBy: [{ name: "asc" }],
      },
    },
  });

  return faculty?.departments.map((department) => department.name) ?? [];
}

function normalizeDepartmentNames(names: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

export async function createFaculty(input: {
  name: string;
  departments?: string[];
  published?: boolean;
}) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Faculty name is required");
  }

  const departments = normalizeDepartmentNames(input.departments ?? []);
  const maxSort = await prisma.faculty.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const faculty = await prisma.faculty.create({
    data: {
      name,
      published: input.published ?? true,
      sortOrder,
      departments: {
        create: departments.map((departmentName, index) => ({
          name: departmentName,
          published: true,
          sortOrder: index,
        })),
      },
    },
    select: {
      id: true,
      name: true,
      published: true,
      sortOrder: true,
      departments: {
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          published: true,
          sortOrder: true,
        },
      },
    },
  });

  return toFacultyView(faculty, 0);
}

export async function updateFacultyPublished(id: string, published: boolean) {
  const faculty = await prisma.faculty.update({
    where: { id },
    data: { published },
    select: {
      id: true,
      name: true,
      published: true,
      sortOrder: true,
      departments: {
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          published: true,
          sortOrder: true,
        },
      },
    },
  });

  const alumniCount = await prisma.alumni.count({
    where: { faculty: faculty.name },
  });

  return toFacultyView(faculty, alumniCount);
}
