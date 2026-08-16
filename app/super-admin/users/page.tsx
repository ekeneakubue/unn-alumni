import { listUsers } from "@/lib/users";
import UsersAdminClient from "./UsersAdminClient";

export default async function SuperAdminUsersPage() {
  const users = await listUsers();
  return <UsersAdminClient initialUsers={users} />;
}
