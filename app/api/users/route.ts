import { NextResponse } from "next/server";
import { createUser, listUsers, type UiUserRole } from "@/lib/users";

const roles: UiUserRole[] = [
  "Super Admin",
  "Admin",
  "VC",
  "Secretary",
  "Staff",
];

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const role = body.role as UiUserRole | undefined;

    if (!name || !email || !role || !roles.includes(role)) {
      return NextResponse.json(
        { error: "name, email, and a valid role are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const user = await createUser({ name, email, role, password });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users", error);
    const message =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
        ? "A user with this email already exists"
        : "Failed to create user";
    return NextResponse.json(
      { error: message },
      { status: message.includes("email") ? 409 : 500 },
    );
  }
}
