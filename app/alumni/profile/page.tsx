import { redirect } from "next/navigation";
import { listVerifyFacultiesForSelect } from "@/lib/alumni";
import { getSessionAlumni } from "@/lib/alumni-auth";
import AlumniProfileClient from "./AlumniProfileClient";

export default async function AlumniProfilePage() {
  const alumni = await getSessionAlumni();
  if (!alumni) {
    redirect("/login");
  }

  const formFaculties = await listVerifyFacultiesForSelect().catch((error) => {
    console.error("listVerifyFacultiesForSelect", error);
    return [] as Awaited<ReturnType<typeof listVerifyFacultiesForSelect>>;
  });

  return (
    <AlumniProfileClient alumni={alumni} formFaculties={formFaculties ?? []} />
  );
}
