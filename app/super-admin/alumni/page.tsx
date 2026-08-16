import { listAlumni } from "@/lib/alumni";
import AlumniAdminClient from "./AlumniAdminClient";

export default async function AlumniAdminPage() {
  const alumni = await listAlumni();
  return <AlumniAdminClient initialAlumni={alumni} />;
}
