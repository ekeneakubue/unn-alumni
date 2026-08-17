import { listUsers } from "@/lib/users";
import UsersAdminClient from "./UsersAdminClient";

function toLoadErrorMessage(error: unknown) {
  const raw =
    error instanceof Error ? error.message : "Failed to load users";
  const lower = raw.toLowerCase();

  if (
    lower.includes("connection terminated") ||
    lower.includes("can't reach database") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("connection closed") ||
    lower.includes("p1001") ||
    lower.includes("p1017") ||
    lower.includes("timeout")
  ) {
    return "We couldn’t connect to the database. Check your connection and try again.";
  }

  return "Something went wrong while loading users. Please try again.";
}

export const dynamic = "force-dynamic";

export default async function SuperAdminUsersPage() {
  try {
    const users = await listUsers();
    return (
      <UsersAdminClient
        initialUsers={users}
        assignableRoles={[
          "Super Admin",
          "Admin",
          "VC",
          "Secretary",
          "Staff",
        ]}
        canManageSuperAdmin
      />
    );
  } catch (error) {
    console.warn(
      "SuperAdminUsersPage",
      error instanceof Error ? error.message : error,
    );
    return (
      <UsersAdminClient
        initialUsers={[]}
        loadError={toLoadErrorMessage(error)}
        assignableRoles={[
          "Super Admin",
          "Admin",
          "VC",
          "Secretary",
          "Staff",
        ]}
        canManageSuperAdmin
      />
    );
  }
}
