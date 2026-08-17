import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import type {
  Alumni,
  AlumniStatus as DbAlumniStatus,
} from "@/generated/prisma/client";
import type { AlumniCsvRow } from "@/lib/alumni-csv";
import { resolveAvatarSrc } from "@/lib/avatar-url";
import { withDbRetry } from "@/lib/db-retry";
import { listPublishedFacultiesForSelect } from "@/lib/faculty";

export type UiAlumniStatus = "Pending" | "Approved" | "Review";

export type AdminAlumniView = {
  id: string;
  avatarUrl: string | null;
  registrationNumber: string | null;
  faculty: string | null;
  department: string | null;
  graduationYear: number | null;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  countryOfOrigin: string | null;
  stateOfOrigin: string | null;
  homeTown: string | null;
  countryOfResidence: string | null;
  stateOfResidence: string | null;
  status: UiAlumniStatus;
  fullName: string;
};

export type AlumniRecordInput = {
  avatarUrl?: string | null;
  registrationNumber?: string | null;
  faculty?: string | null;
  department?: string | null;
  graduationYear?: number | null;
  surname?: string | null;
  firstName?: string | null;
  otherNames?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  phone?: string | null;
  countryOfOrigin?: string | null;
  stateOfOrigin?: string | null;
  homeTown?: string | null;
  countryOfResidence?: string | null;
  stateOfResidence?: string | null;
  password?: string | null;
};

const statusToUi: Record<DbAlumniStatus, UiAlumniStatus> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REVIEW: "Review",
};

export function formatAlumniName(
  surname: string | null,
  firstName: string | null,
  otherNames: string | null,
) {
  const name = [surname, firstName, otherNames].filter(Boolean).join(" ");
  return name || "Unnamed alumni";
}

function toDateOnlyString(value: Date | null) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value?: string | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function hashPasswordIfProvided(password?: string | null) {
  const trimmed = password?.trim();
  if (!trimmed) return undefined;
  return hash(trimmed, 10);
}

export function toAdminAlumniView(alumni: Alumni): AdminAlumniView {
  return {
    id: alumni.id,
    avatarUrl: alumni.avatarUrl,
    registrationNumber: alumni.registrationNumber,
    faculty: alumni.faculty,
    department: alumni.department,
    graduationYear: alumni.graduationYear,
    surname: alumni.surname,
    firstName: alumni.firstName,
    otherNames: alumni.otherNames,
    dateOfBirth: toDateOnlyString(alumni.dateOfBirth),
    email: alumni.email,
    phone: alumni.phone,
    countryOfOrigin: alumni.countryOfOrigin,
    stateOfOrigin: alumni.stateOfOrigin,
    homeTown: alumni.homeTown,
    countryOfResidence: alumni.countryOfResidence,
    stateOfResidence: alumni.stateOfResidence,
    status: statusToUi[alumni.status],
    fullName: formatAlumniName(
      alumni.surname,
      alumni.firstName,
      alumni.otherNames,
    ),
  };
}

/** Resolve stored avatar paths to app media URLs for client display. */
export function toPublicAlumniView(alumni: Alumni): AdminAlumniView {
  const view = toAdminAlumniView(alumni);
  const resolved = resolveAvatarSrc(view.avatarUrl);
  return {
    ...view,
    avatarUrl: resolved || null,
  };
}

export async function listAlumni() {
  const alumni = await prisma.alumni.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  return alumni.map(toAdminAlumniView);
}

export async function createAlumniMany(rows: AlumniCsvRow[]) {
  const data = rows.map((row) => ({
    registrationNumber: row.registrationNumber,
    surname: row.surname,
    firstName: row.firstName,
    otherNames: row.otherNames,
    email: row.email,
    faculty: row.faculty,
    department: row.department,
    status: "PENDING" as const,
  }));

  let created = 0;
  let skipped = 0;
  const chunkSizes = [5000, 1000, 200];

  async function insertChunk(
    chunk: (typeof data)[number][],
    sizeIndex: number,
  ): Promise<void> {
    if (chunk.length === 0) return;

    try {
      const result = await prisma.alumni.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      created += result.count;
      skipped += chunk.length - result.count;
    } catch {
      const nextSize = chunkSizes[sizeIndex + 1];
      if (!nextSize || chunk.length === 1) {
        skipped += chunk.length;
        return;
      }

      for (let i = 0; i < chunk.length; i += nextSize) {
        await insertChunk(chunk.slice(i, i + nextSize), sizeIndex + 1);
      }
    }
  }

  for (let i = 0; i < data.length; i += chunkSizes[0]) {
    await insertChunk(data.slice(i, i + chunkSizes[0]), 0);
  }

  return { count: created, skipped };
}

export type AlumniFacultyOption = {
  name: string;
  departments: string[];
};

function mergeFacultyOptions(
  groups: AlumniFacultyOption[][],
): AlumniFacultyOption[] {
  const byFaculty = new Map<string, Set<string>>();

  for (const group of groups) {
    for (const faculty of group) {
      const name = faculty.name.trim();
      if (!name) continue;
      let departments = byFaculty.get(name);
      if (!departments) {
        departments = new Set<string>();
        byFaculty.set(name, departments);
      }
      for (const department of faculty.departments) {
        const trimmed = department.trim();
        if (trimmed) departments.add(trimmed);
      }
    }
  }

  return Array.from(byFaculty.entries())
    .map(([name, departments]) => ({
      name,
      departments: Array.from(departments).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
}

/** Distinct faculty → departments from Alumni records (for /verify selects). */
export async function listAlumniFacultiesForSelect(): Promise<
  AlumniFacultyOption[]
> {
  return withDbRetry("listAlumniFacultiesForSelect", async () => {
    const rows = await prisma.alumni.findMany({
      where: {
        faculty: { not: null },
      },
      select: {
        faculty: true,
        department: true,
      },
    });

    const byFaculty = new Map<string, Set<string>>();

    for (const row of rows) {
      const faculty = row.faculty?.trim();
      if (!faculty) continue;

      let departments = byFaculty.get(faculty);
      if (!departments) {
        departments = new Set<string>();
        byFaculty.set(faculty, departments);
      }

      const department = row.department?.trim();
      if (department) {
        departments.add(department);
      }
    }

    return Array.from(byFaculty.entries())
      .map(([name, departments]) => ({
        name,
        departments: Array.from(departments).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" }),
        ),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  });
}

/** Alumni values merged with published Faculty/Department catalog for /verify. */
export async function listVerifyFacultiesForSelect(): Promise<
  AlumniFacultyOption[]
> {
  const [fromAlumni, fromCatalog] = await Promise.all([
    listAlumniFacultiesForSelect().catch((error) => {
      console.warn(
        "listAlumniFacultiesForSelect failed",
        error instanceof Error ? error.message : error,
      );
      return [] as AlumniFacultyOption[];
    }),
    listPublishedFacultiesForSelect(),
  ]);

  return mergeFacultyOptions([fromAlumni, fromCatalog]);
}

export async function findAlumniByLookup(input: {
  faculty?: string;
  department?: string;
  registrationNumber?: string;
  surname?: string;
  email?: string;
}) {
  const faculty = input.faculty?.trim() || undefined;
  const department = input.department?.trim() || undefined;
  const registrationNumber = input.registrationNumber?.trim() || undefined;
  const surname = input.surname?.trim() || undefined;
  const email = input.email?.trim() || undefined;

  if (!faculty || !department) return [];
  if (!registrationNumber && !surname && !email) return [];

  const alumni = await prisma.alumni.findMany({
    where: {
      AND: [
        { faculty },
        { department },
        registrationNumber ? { registrationNumber } : {},
        surname
          ? { surname: { equals: surname, mode: "insensitive" } }
          : {},
        email
          ? { email: { equals: email, mode: "insensitive" } }
          : {},
      ],
    },
    orderBy: [{ surname: "asc" }, { firstName: "asc" }],
    take: 25,
  });

  return alumni.map(toPublicAlumniView);
}

export async function updateAlumniRecord(id: string, input: AlumniRecordInput) {
  const passwordHash = await hashPasswordIfProvided(input.password);

  const alumni = await prisma.alumni.update({
    where: { id },
    data: {
      avatarUrl: input.avatarUrl,
      registrationNumber: input.registrationNumber,
      faculty: input.faculty,
      department: input.department,
      graduationYear: input.graduationYear,
      surname: input.surname,
      firstName: input.firstName,
      otherNames: input.otherNames,
      dateOfBirth: parseDateOnly(input.dateOfBirth),
      email: input.email,
      phone: input.phone,
      countryOfOrigin: input.countryOfOrigin,
      stateOfOrigin: input.stateOfOrigin,
      homeTown: input.homeTown,
      countryOfResidence: input.countryOfResidence,
      stateOfResidence: input.stateOfResidence,
      ...(passwordHash ? { passwordHash } : {}),
      status: "REVIEW",
    },
  });

  return toAdminAlumniView(alumni);
}

export async function createAlumniRecord(input: AlumniRecordInput) {
  const passwordHash = await hashPasswordIfProvided(input.password);

  const alumni = await prisma.alumni.create({
    data: {
      avatarUrl: input.avatarUrl,
      registrationNumber: input.registrationNumber,
      faculty: input.faculty,
      department: input.department,
      graduationYear: input.graduationYear,
      surname: input.surname,
      firstName: input.firstName,
      otherNames: input.otherNames,
      dateOfBirth: parseDateOnly(input.dateOfBirth),
      email: input.email,
      phone: input.phone,
      countryOfOrigin: input.countryOfOrigin,
      stateOfOrigin: input.stateOfOrigin,
      homeTown: input.homeTown,
      countryOfResidence: input.countryOfResidence,
      stateOfResidence: input.stateOfResidence,
      ...(passwordHash ? { passwordHash } : {}),
      status: "PENDING",
    },
  });

  return toAdminAlumniView(alumni);
}

export async function deleteAllAlumni() {
  const result = await prisma.alumni.deleteMany({});
  return { count: result.count };
}
