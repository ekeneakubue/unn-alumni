import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  dashboardHomeForRole,
  getSessionStaff,
} from "@/lib/staff-auth";
import StaffLoginClient from "./StaffLoginClient";

export const metadata: Metadata = {
  title: "Staff Login | UNN Alumni",
  description: "Sign in to the UNN Alumni staff dashboard.",
};

export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  const staff = await getSessionStaff();
  if (staff) {
    redirect(dashboardHomeForRole(staff.dbRole));
  }

  return <StaffLoginClient />;
}
