import { NextResponse } from "next/server";
import {
  STAFF_SESSION_COOKIE,
  dashboardHomeForRole,
  loginStaffByEmailPassword,
} from "@/lib/staff-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const result = await loginStaffByEmailPassword(
      body.email ?? "",
      body.password ?? "",
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const home = dashboardHomeForRole(result.user.dbRole);
    if (home === "/staff/login") {
      return NextResponse.json(
        {
          error:
            "Your role does not have a dashboard yet. Contact a Super Admin.",
        },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      user: result.user,
      redirectTo: home,
    });
    response.cookies.set(STAFF_SESSION_COOKIE, result.user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("POST /api/staff/login", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
