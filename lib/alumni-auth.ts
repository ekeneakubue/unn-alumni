import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { toAdminAlumniView, type AdminAlumniView } from "@/lib/alumni";

export const ALUMNI_SESSION_COOKIE = "alumni_session";

export async function loginAlumniByEmailPassword(
  email: string,
  password: string,
): Promise<
  | { ok: true; alumni: AdminAlumniView }
  | { ok: false; error: string; status: number }
> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      ok: false,
      error: "Email and password are required",
      status: 400,
    };
  }

  const alumni = await prisma.alumni.findFirst({
    where: {
      email: { equals: trimmedEmail, mode: "insensitive" },
    },
  });

  if (!alumni || !alumni.passwordHash) {
    return {
      ok: false,
      error: "Invalid email or password",
      status: 401,
    };
  }

  const valid = await compare(trimmedPassword, alumni.passwordHash);
  if (!valid) {
    return {
      ok: false,
      error: "Invalid email or password",
      status: 401,
    };
  }

  return { ok: true, alumni: toAdminAlumniView(alumni) };
}

export async function getSessionAlumni(): Promise<AdminAlumniView | null> {
  const cookieStore = await cookies();
  const alumniId = cookieStore.get(ALUMNI_SESSION_COOKIE)?.value?.trim();
  if (!alumniId) return null;

  try {
    const alumni = await prisma.alumni.findUnique({ where: { id: alumniId } });
    if (!alumni) return null;
    return toAdminAlumniView(alumni);
  } catch (error) {
    console.error("getSessionAlumni", error);
    return null;
  }
}

export { alumniInitials } from "@/lib/alumni-display";
