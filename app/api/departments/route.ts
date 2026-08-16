import { NextResponse } from "next/server";
import {
  createDepartment,
  listAdminDepartments,
} from "@/lib/department";

export async function GET() {
  try {
    const departments = await listAdminDepartments();
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("GET /api/departments", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      facultyId?: string;
      published?: boolean;
    };

    const name = body.name?.trim() ?? "";
    const facultyId = body.facultyId?.trim() ?? "";

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 },
      );
    }
    if (!facultyId) {
      return NextResponse.json(
        { error: "Faculty is required" },
        { status: 400 },
      );
    }

    const department = await createDepartment({
      name,
      facultyId,
      published: body.published ?? true,
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("POST /api/departments", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A department with this name already exists in that faculty"
        : error instanceof Error
          ? error.message
          : "Failed to create department";
    return NextResponse.json(
      { error: message },
      {
        status:
          message.includes("already") || message.includes("required")
            ? message.includes("already")
              ? 409
              : 400
            : 400,
      },
    );
  }
}
