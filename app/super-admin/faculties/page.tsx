import { listAdminFaculties } from "@/lib/faculty";
import FacultiesAdminClient from "./FacultiesAdminClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminFacultiesPage() {
  const faculties = await listAdminFaculties();
  return <FacultiesAdminClient initialFaculties={faculties} />;
}
