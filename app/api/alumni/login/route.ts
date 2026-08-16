import { NextResponse } from "next/server";
import {
  ALUMNI_SESSION_COOKIE,
  loginAlumniByEmailPassword,
} from "@/lib/alumni-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const result = await loginAlumniByEmailPassword(
      body.email ?? "",
      body.password ?? "",
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const response = NextResponse.json({ alumni: result.alumni });
    response.cookies.set(ALUMNI_SESSION_COOKIE, result.alumni.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("POST /api/alumni/login", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
