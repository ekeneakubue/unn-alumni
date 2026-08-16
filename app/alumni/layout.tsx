import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { alumniInitials, getSessionAlumni } from "@/lib/alumni-auth";
import AlumniShell from "./AlumniShell";

export const metadata: Metadata = {
  title: "Alumni Portal | UNN Alumni",
  description: "University of Nigeria alumni member dashboard.",
};

export const dynamic = "force-dynamic";

export default async function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const alumni = await getSessionAlumni();
  if (!alumni) {
    redirect("/login");
  }

  return (
    <AlumniShell
      alumniName={alumni.fullName}
      alumniInitials={alumniInitials(alumni)}
    >
      {children}
    </AlumniShell>
  );
}
