import { prisma } from "@/lib/prisma";
import type {
  Alumni,
  AlumniStatus as DbAlumniStatus,
} from "@/generated/prisma/client";
import type { AlumniCsvRow } from "@/lib/alumni-csv";

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
  email: string | null;
  phone: string | null;
  countryOfOrigin: string | null;
  stateOfOrigin: string | null;
  town: string | null;
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
  email?: string | null;
  phone?: string | null;
  countryOfOrigin?: string | null;
  stateOfOrigin?: string | null;
  town?: string | null;
  countryOfResidence?: string | null;
  stateOfResidence?: string | null;
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
    email: alumni.email,
    phone: alumni.phone,
    countryOfOrigin: alumni.countryOfOrigin,
    stateOfOrigin: alumni.stateOfOrigin,
    town: alumni.town,
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
    graduationYear: row.graduationYear,
    faculty: row.faculty,
    department: row.department,
    countryOfOrigin: row.countryOfOrigin,
    stateOfOrigin: row.stateOfOrigin,
    town: row.town,
    countryOfResidence: row.countryOfResidence,
    stateOfResidence: row.stateOfResidence,
    email: row.email,
    phone: row.phone,
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

export async function findAlumniByLookup(input: {
  faculty?: string;
  department?: string;
  registrationNumber?: string;
  email?: string;
}) {
  const faculty = input.faculty?.trim() || undefined;
  const department = input.department?.trim() || undefined;
  const registrationNumber = input.registrationNumber?.trim() || undefined;
  const email = input.email?.trim().toLowerCase() || undefined;

  if (!faculty || !department) return null;
  if (!registrationNumber && !email) return null;

  const alumni = await prisma.alumni.findFirst({
    where: {
      AND: [
        registrationNumber ? { registrationNumber } : {},
        email ? { email } : {},
      ],
    },
  });

  if (!alumni) return null;

  if (alumni.faculty && alumni.faculty !== faculty) return null;
  if (alumni.department && alumni.department !== department) return null;

  const view = toAdminAlumniView(alumni);
  return {
    ...view,
    faculty: view.faculty ?? faculty,
    department: view.department ?? department,
  };
}

export async function updateAlumniRecord(id: string, input: AlumniRecordInput) {
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
      email: input.email,
      phone: input.phone,
      countryOfOrigin: input.countryOfOrigin,
      stateOfOrigin: input.stateOfOrigin,
      town: input.town,
      countryOfResidence: input.countryOfResidence,
      stateOfResidence: input.stateOfResidence,
      status: "REVIEW",
    },
  });

  return toAdminAlumniView(alumni);
}

export async function createAlumniRecord(input: AlumniRecordInput) {
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
      email: input.email,
      phone: input.phone,
      countryOfOrigin: input.countryOfOrigin,
      stateOfOrigin: input.stateOfOrigin,
      town: input.town,
      countryOfResidence: input.countryOfResidence,
      stateOfResidence: input.stateOfResidence,
      status: "PENDING",
    },
  });

  return toAdminAlumniView(alumni);
}
