import { NextResponse } from "next/server";
import { updateAlumniRecord } from "@/lib/alumni";

function emptyToNull(value?: string | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseYear(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      avatarUrl?: string | null;
      registrationNumber?: string | null;
      faculty?: string | null;
      department?: string | null;
      graduationYear?: number | string | null;
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

    const faculty = emptyToNull(body.faculty);
    const department = emptyToNull(body.department);

    if (!faculty || !department) {
      return NextResponse.json(
        { error: "Faculty and department are required" },
        { status: 400 },
      );
    }

    const alumni = await updateAlumniRecord(id, {
      avatarUrl: emptyToNull(body.avatarUrl),
      registrationNumber: emptyToNull(body.registrationNumber),
      faculty,
      department,
      graduationYear: parseYear(body.graduationYear),
      surname: emptyToNull(body.surname),
      firstName: emptyToNull(body.firstName),
      otherNames: emptyToNull(body.otherNames),
      dateOfBirth: emptyToNull(body.dateOfBirth),
      email: emptyToNull(body.email)?.toLowerCase() ?? null,
      phone: emptyToNull(body.phone),
      countryOfOrigin: emptyToNull(body.countryOfOrigin),
      stateOfOrigin: emptyToNull(body.stateOfOrigin),
      homeTown: emptyToNull(body.homeTown),
      countryOfResidence: emptyToNull(body.countryOfResidence),
      stateOfResidence: emptyToNull(body.stateOfResidence),
      password: emptyToNull(body.password),
    });

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("PATCH /api/alumni/[id]", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A record with this email or registration number already exists"
        : "Failed to update alumni record";
    return NextResponse.json(
      { error: message },
      { status: message.includes("already") ? 409 : 500 },
    );
  }
}
