import type { Metadata } from "next";
import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { requireStaffSession, staffInitials } from "@/lib/staff-auth";

export const metadata: Metadata = {
  title: "Super Admin | UNN Alumni",
  description: "UNN Alumni association super admin dashboard.",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: LayoutProps<"/super-admin">) {
  const staff = await requireStaffSession(["SUPER_ADMIN"]);

  return (
    <DashboardShell
      basePath="/super-admin"
      title="Super Admin"
      userName={staff.name}
      userInitials={staffInitials(staff.name)}
    >
      {children}
    </DashboardShell>
  );
}
