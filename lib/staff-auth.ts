import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { withDbRetry } from "@/lib/db-retry";
import { prisma } from "@/lib/prisma";
import {
  getInitials,
  toAdminUserView,
  type AdminUserView,
  type UiUserRole,
} from "@/lib/users";

export const STAFF_SESSION_COOKIE = "staff_session";

export type SessionStaff = AdminUserView & {
  dbRole: UserRole;
};

export const ADMIN_ASSIGNABLE_ROLES: UiUserRole[] = [
  "Admin",
  "VC",
  "Secretary",
  "Staff",
];

export const SUPER_ADMIN_ASSIGNABLE_ROLES: UiUserRole[] = [
  "Super Admin",
  "Admin",
  "VC",
  "Secretary",
  "Staff",
];

export async function loginStaffByEmailPassword(
  email: string,
  password: string,
): Promise<
  | { ok: true; user: SessionStaff }
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

  const user = await withDbRetry("loginStaff.find", () =>
    prisma.user.findFirst({
      where: {
        email: { equals: trimmedEmail, mode: "insensitive" },
      },
    }),
  );

  if (!user || !user.passwordHash) {
    return {
      ok: false,
      error: "Invalid email or password",
      status: 401,
    };
  }

  if (user.status === "SUSPENDED") {
    return {
      ok: false,
      error: "This account has been suspended",
      status: 403,
    };
  }

  const valid = await compare(trimmedPassword, user.passwordHash);
  if (!valid) {
    return {
      ok: false,
      error: "Invalid email or password",
      status: 401,
    };
  }

  await withDbRetry("loginStaff.touch", () =>
    prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date(), status: "ACTIVE" },
    }),
  );

  return {
    ok: true,
    user: {
      ...toAdminUserView({ ...user, status: "ACTIVE", lastActiveAt: new Date() }),
      dbRole: user.role,
    },
  };
}

export async function getSessionStaff(): Promise<SessionStaff | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(STAFF_SESSION_COOKIE)?.value?.trim();
  if (!userId) return null;

  try {
    return await withDbRetry("getSessionStaff", async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.status === "SUSPENDED") return null;
      return {
        ...toAdminUserView(user),
        dbRole: user.role,
      };
    });
  } catch (error) {
    console.warn(
      "getSessionStaff",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function requireStaffSession(allowedRoles: UserRole[]) {
  const staff = await getSessionStaff();
  if (!staff) {
    redirect("/staff/login");
  }
  if (!allowedRoles.includes(staff.dbRole)) {
    if (staff.dbRole === "SUPER_ADMIN") {
      redirect("/super-admin");
    }
    if (staff.dbRole === "ADMIN") {
      redirect("/admin");
    }
    redirect("/staff/login");
  }
  return staff;
}

export function dashboardHomeForRole(role: UserRole) {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if (role === "ADMIN") return "/admin";
  return "/staff/login";
}

export function staffInitials(name: string) {
  return getInitials(name);
}

export function canManageUsersAs(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function assignableRolesFor(role: UserRole): UiUserRole[] {
  if (role === "SUPER_ADMIN") return SUPER_ADMIN_ASSIGNABLE_ROLES;
  if (role === "ADMIN") return ADMIN_ASSIGNABLE_ROLES;
  return [];
}
