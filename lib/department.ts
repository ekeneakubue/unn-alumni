import { prisma } from "@/lib/prisma";

export type AdminDepartmentView = {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
  facultyId: string;
  facultyName: string;
  alumniCount: number;
};

export type FacultyOption = {
  id: string;
  name: string;
};

function toDepartmentView(
  department: {
    id: string;
    name: string;
    published: boolean;
    sortOrder: number;
    facultyId: string;
    faculty: { name: string };
  },
  alumniCount = 0,
): AdminDepartmentView {
  return {
    id: department.id,
    name: department.name,
    published: department.published,
    sortOrder: department.sortOrder,
    facultyId: department.facultyId,
    facultyName: department.faculty.name,
    alumniCount,
  };
}

export async function listFacultyOptions(): Promise<FacultyOption[]> {
  return prisma.faculty.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
  });
}

export async function listAdminDepartments(): Promise<AdminDepartmentView[]> {
  const departments = await prisma.department.findMany({
    orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      published: true,
      sortOrder: true,
      facultyId: true,
      faculty: { select: { name: true } },
    },
  });

  const alumniCounts = await prisma.alumni.groupBy({
    by: ["department"],
    _count: { _all: true },
    where: { department: { not: null } },
  });

  const countByName = new Map(
    alumniCounts.map((row) => [row.department ?? "", row._count._all]),
  );

  return departments.map((department) =>
    toDepartmentView(department, countByName.get(department.name) ?? 0),
  );
}

export async function createDepartment(input: {
  name: string;
  facultyId: string;
  published?: boolean;
}) {
  const name = input.name.trim();
  const facultyId = input.facultyId.trim();

  if (!name) {
    throw new Error("Department name is required");
  }
  if (!facultyId) {
    throw new Error("Faculty is required");
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    select: { id: true, name: true },
  });

  if (!faculty) {
    throw new Error("Selected faculty was not found");
  }

  const maxSort = await prisma.department.aggregate({
    where: { facultyId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const department = await prisma.department.create({
    data: {
      name,
      facultyId,
      published: input.published ?? true,
      sortOrder,
    },
    select: {
      id: true,
      name: true,
      published: true,
      sortOrder: true,
      facultyId: true,
      faculty: { select: { name: true } },
    },
  });

  return toDepartmentView(department, 0);
}

export async function updateDepartmentPublished(
  id: string,
  published: boolean,
) {
  const department = await prisma.department.update({
    where: { id },
    data: { published },
    select: {
      id: true,
      name: true,
      published: true,
      sortOrder: true,
      facultyId: true,
      faculty: { select: { name: true } },
    },
  });

  const alumniCount = await prisma.alumni.count({
    where: { department: department.name },
  });

  return toDepartmentView(department, alumniCount);
}
