import type { Metadata } from "next";
import AdminShell from "./components/AdminShell";

export const metadata: Metadata = {
  title: "Super Admin | UNN Alumni",
  description: "UNN Alumni association super admin dashboard.",
};

export default function SuperAdminLayout({
  children,
}: LayoutProps<"/super-admin">) {
  return <AdminShell>{children}</AdminShell>;
}
