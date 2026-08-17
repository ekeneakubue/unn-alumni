import { listUsers } from "@/lib/users";
import UsersAdminClient from "@/app/super-admin/users/UsersAdminClient";

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

export default async function AdminUsersPage() {
  try {
    const users = await listUsers({ excludeSuperAdmin: true });
    return (
      <UsersAdminClient
        initialUsers={users}
        assignableRoles={["Admin", "VC", "Secretary", "Staff"]}
        canManageSuperAdmin={false}
      />
    );
  } catch (error) {
    console.warn(
      "AdminUsersPage",
      error instanceof Error ? error.message : error,
    );
    return (
      <UsersAdminClient
        initialUsers={[]}
        loadError={toLoadErrorMessage(error)}
        assignableRoles={["Admin", "VC", "Secretary", "Staff"]}
        canManageSuperAdmin={false}
      />
    );
  }
}
