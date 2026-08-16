import { NextResponse } from "next/server";
import {
  createAlumniMany,
  createAlumniRecord,
  listAlumni,
} from "@/lib/alumni";
import { parseAlumniCsv } from "@/lib/alumni-csv";

export async function GET() {
  try {
    const alumni = await listAlumni();
    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("GET /api/alumni", error);
    return NextResponse.json(
      { error: "Failed to fetch alumni" },
      { status: 500 },
    );
  }
}

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

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "CSV file is required" },
          { status: 400 },
        );
      }

      const text = await file.text();
      const parsed = parseAlumniCsv(text);
      const rows = parsed.rows;

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "No alumni rows provided" },
          { status: 400 },
        );
      }

      const result = await createAlumniMany(rows);
      return NextResponse.json(
        {
          count: result.count,
          skipped: result.skipped,
        },
        { status: 201 },
      );
    }

    const body = (await request.json()) as {
      rows?: ReturnType<typeof parseAlumniCsv>["rows"];
      alumni?: {
        avatarUrl?: string | null;
        registrationNumber?: string | null;
        faculty?: string | null;
        department?: string | null;
        graduationYear?: number | string | null;
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
    };

    if (body.alumni) {
      const faculty = emptyToNull(body.alumni.faculty);
      const department = emptyToNull(body.alumni.department);

      if (!faculty || !department) {
        return NextResponse.json(
          { error: "Faculty and department are required" },
          { status: 400 },
        );
      }

      const alumni = await createAlumniRecord({
        avatarUrl: emptyToNull(body.alumni.avatarUrl),
        registrationNumber: emptyToNull(body.alumni.registrationNumber),
        faculty,
        department,
        graduationYear: parseYear(body.alumni.graduationYear),
        surname: emptyToNull(body.alumni.surname),
        firstName: emptyToNull(body.alumni.firstName),
        otherNames: emptyToNull(body.alumni.otherNames),
        email: emptyToNull(body.alumni.email)?.toLowerCase() ?? null,
        phone: emptyToNull(body.alumni.phone),
        countryOfOrigin: emptyToNull(body.alumni.countryOfOrigin),
        stateOfOrigin: emptyToNull(body.alumni.stateOfOrigin),
        town: emptyToNull(body.alumni.town),
        countryOfResidence: emptyToNull(body.alumni.countryOfResidence),
        stateOfResidence: emptyToNull(body.alumni.stateOfResidence),
      });

      return NextResponse.json({ alumni }, { status: 201 });
    }

    const rows = body.rows ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No alumni rows provided" },
        { status: 400 },
      );
    }

    const result = await createAlumniMany(rows);
    return NextResponse.json(
      {
        count: result.count,
        skipped: result.skipped,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/alumni", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A record with this email or registration number already exists"
        : "Failed to import alumni";
    return NextResponse.json(
      { error: message },
      { status: message.includes("already") ? 409 : 500 },
    );
  }
}
