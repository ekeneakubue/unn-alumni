import { NextResponse } from "next/server";
import { updateDepartmentPublished } from "@/lib/department";

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

    const department = await updateDepartmentPublished(id, body.published);
    return NextResponse.json({ department });
  } catch (error) {
    console.error("PATCH /api/departments/[id]", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 },
    );
  }
}
