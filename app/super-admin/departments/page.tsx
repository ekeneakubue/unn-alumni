import {
  listAdminDepartments,
  listFacultyOptions,
} from "@/lib/department";
import DepartmentsAdminClient from "./DepartmentsAdminClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminDepartmentsPage() {
  const [departments, faculties] = await Promise.all([
    listAdminDepartments(),
    listFacultyOptions(),
  ]);

  return (
    <DepartmentsAdminClient
      initialDepartments={departments}
      faculties={faculties}
    />
  );
}
