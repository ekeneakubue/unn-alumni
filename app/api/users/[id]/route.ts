import { NextResponse } from "next/server";
import {
  assignableRolesFor,
  canManageUsersAs,
  getSessionStaff,
} from "@/lib/staff-auth";
import {
  deleteUser,
  getUserById,
  updateUser,
  updateUserStatus,
  type UiUserRole,
  type UiUserStatus,
} from "@/lib/users";

const statuses: UiUserStatus[] = ["Active", "Invited", "Suspended"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const staff = await getSessionStaff();
    if (!staff || !canManageUsersAs(staff.dbRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      staff.dbRole === "ADMIN" &&
      existing.role === "Super Admin"
    ) {
      return NextResponse.json(
        { error: "Admins cannot manage Super Admin accounts" },
        { status: 403 },
      );
    }

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

    const allowedRoles = assignableRolesFor(staff.dbRole);
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const role = body.role as UiUserRole | undefined;
    const password = body.password?.trim() ?? "";

    if (!name || !email || !role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          error:
            staff.dbRole === "ADMIN"
              ? "name, email, and a valid non–Super Admin role are required"
              : "name, email, and a valid role are required",
        },
        { status: 400 },
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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
    const staff = await getSessionStaff();
    if (!staff || !canManageUsersAs(staff.dbRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      staff.dbRole === "ADMIN" &&
      existing.role === "Super Admin"
    ) {
      return NextResponse.json(
        { error: "Admins cannot manage Super Admin accounts" },
        { status: 403 },
      );
    }

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
