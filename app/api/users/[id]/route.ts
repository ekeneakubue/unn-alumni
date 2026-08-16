import { NextResponse } from "next/server";
import {
  deleteUser,
  updateUser,
  updateUserStatus,
  type UiUserRole,
  type UiUserStatus,
} from "@/lib/users";

const statuses: UiUserStatus[] = ["Active", "Invited", "Suspended"];
const roles: UiUserRole[] = [
  "Super Admin",
  "Admin",
  "VC",
  "Secretary",
  "Staff",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: string;
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    if (body.status) {
      const status = body.status as UiUserStatus;
      if (!statuses.includes(status)) {
        return NextResponse.json(
          { error: "A valid status is required" },
          { status: 400 },
        );
      }
      const user = await updateUserStatus(id, status);
      return NextResponse.json({ user });
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const role = body.role as UiUserRole | undefined;
    const password = body.password?.trim() ?? "";

    if (!name || !email || !role || !roles.includes(role)) {
      return NextResponse.json(
        { error: "name, email, and a valid role are required" },
        { status: 400 },
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const user = await updateUser(id, {
      name,
      email,
      role,
      password: password || undefined,
    });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/users/[id]", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A user with this email already exists"
        : "Failed to update user";
    return NextResponse.json(
      { error: message },
      { status: message.includes("email") ? 409 : 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/users/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
