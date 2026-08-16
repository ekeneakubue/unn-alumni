import { NextResponse } from "next/server";
import { updateFacultyPublished } from "@/lib/faculty";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { published?: boolean };

    if (typeof body.published !== "boolean") {
      return NextResponse.json(
        { error: "published must be a boolean" },
        { status: 400 },
      );
    }

    const faculty = await updateFacultyPublished(id, body.published);
    return NextResponse.json({ faculty });
  } catch (error) {
    console.error("PATCH /api/faculties/[id]", error);
    return NextResponse.json(
      { error: "Failed to update faculty" },
      { status: 500 },
    );
  }
}
