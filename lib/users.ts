import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User, UserRole as DbUserRole, UserStatus as DbUserStatus } from "@/generated/prisma/client";

export type UiUserRole = "Super Admin" | "Admin" | "VC" | "Secretary" | "Staff";
export type UiUserStatus = "Active" | "Invited" | "Suspended";

export type AdminUserView = {
  id: string;
  name: string;
  email: string;
  role: UiUserRole;
  status: UiUserStatus;
  lastActive: string;
  initials: string;
};

const roleToUi: Record<DbUserRole, UiUserRole> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  VC: "VC",
  SECRETARY: "Secretary",
  STAFF: "Staff",
};

const roleToDb: Record<UiUserRole, DbUserRole> = {
  "Super Admin": "SUPER_ADMIN",
  Admin: "ADMIN",
  VC: "VC",
  Secretary: "SECRETARY",
  Staff: "STAFF",
};

const statusToUi: Record<DbUserStatus, UiUserStatus> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  SUSPENDED: "Suspended",
};

export function uiRoleToDb(role: UiUserRole): DbUserRole {
  return roleToDb[role];
}

export function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function formatLastActive(
  status: DbUserStatus,
  lastActiveAt: Date | null,
) {
  if (status === "INVITED" && !lastActiveAt) return "Invite pending";
  if (!lastActiveAt) return "Never";

  const diffMs = Date.now() - lastActiveAt.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export function toAdminUserView(user: User): AdminUserView {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleToUi[user.role],
    status: statusToUi[user.status],
    lastActive: formatLastActive(user.status, user.lastActiveAt),
    initials: getInitials(user.name),
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  return users.map(toAdminUserView);
}

export async function createUser(input: {
  name: string;
  email: string;
  role: UiUserRole;
  password: string;
}) {
  const passwordHash = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: uiRoleToDb(input.role),
      status: "ACTIVE",
      lastActiveAt: new Date(),
    },
  });
  return toAdminUserView(user);
}

export async function updateUserStatus(id: string, status: UiUserStatus) {
  const dbStatus =
    status === "Active"
      ? "ACTIVE"
      : status === "Invited"
        ? "INVITED"
        : "SUSPENDED";

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: dbStatus,
      lastActiveAt: status === "Active" ? new Date() : undefined,
    },
  });
  return toAdminUserView(user);
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    email: string;
    role: UiUserRole;
    password?: string;
  },
) {
  const data: {
    name: string;
    email: string;
    role: DbUserRole;
    passwordHash?: string;
  } = {
    name: input.name,
    email: input.email,
    role: uiRoleToDb(input.role),
  };

  if (input.password) {
    data.passwordHash = await hash(input.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return toAdminUserView(user);
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}
