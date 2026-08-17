import type { Metadata } from "next";
import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { requireStaffSession, staffInitials } from "@/lib/staff-auth";

export const metadata: Metadata = {
  title: "Admin | UNN Alumni",
  description: "UNN Alumni association admin dashboard.",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaffSession(["ADMIN"]);

  return (
    <DashboardShell
      basePath="/admin"
      title="Admin"
      userName={staff.name}
      userInitials={staffInitials(staff.name)}
    >
      {children}
    </DashboardShell>
  );
}
