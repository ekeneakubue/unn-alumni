import { NextResponse } from "next/server";
import { createFaculty, listAdminFaculties } from "@/lib/faculty";

export async function GET() {
  try {
    const faculties = await listAdminFaculties();
    return NextResponse.json({ faculties });
  } catch (error) {
    console.error("GET /api/faculties", error);
    return NextResponse.json(
      { error: "Failed to fetch faculties" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      departments?: string[] | string;
      published?: boolean;
    };

    const name = body.name?.trim() ?? "";
    if (!name) {
      return NextResponse.json(
        { error: "Faculty name is required" },
        { status: 400 },
      );
    }

    const departments = Array.isArray(body.departments)
      ? body.departments
      : typeof body.departments === "string"
        ? body.departments.split(/[\n,]/).map((item) => item.trim())
        : [];

    const faculty = await createFaculty({
      name,
      departments,
      published: body.published ?? true,
    });

    return NextResponse.json({ faculty }, { status: 201 });
  } catch (error) {
    console.error("POST /api/faculties", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A faculty with this name already exists"
        : error instanceof Error
          ? error.message
          : "Failed to create faculty";
    return NextResponse.json(
      { error: message },
      { status: message.includes("already") ? 409 : 400 },
    );
  }
}
