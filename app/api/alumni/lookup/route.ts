import { NextResponse } from "next/server";
import { findAlumniByLookup } from "@/lib/alumni";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const faculty = searchParams.get("faculty") ?? "";
    const department = searchParams.get("department") ?? "";
    const registrationNumber = searchParams.get("registrationNumber") ?? "";
    const email = searchParams.get("email") ?? "";

    if (!faculty.trim() || !department.trim()) {
      return NextResponse.json(
        { error: "Faculty and department are required" },
        { status: 400 },
      );
    }

    if (!registrationNumber.trim() && !email.trim()) {
      return NextResponse.json(
        { error: "Provide a registration number or email" },
        { status: 400 },
      );
    }

    const alumni = await findAlumniByLookup({
      faculty,
      department,
      registrationNumber,
      email,
    });

    if (!alumni) {
      return NextResponse.json(
        { error: "No alumni record matched those details" },
        { status: 404 },
      );
    }

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("GET /api/alumni/lookup", error);
    return NextResponse.json(
      { error: "Failed to look up alumni record" },
      { status: 500 },
    );
  }
}
