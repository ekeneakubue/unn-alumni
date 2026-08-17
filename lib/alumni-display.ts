import type { AdminAlumniView } from "@/lib/alumni";

export function alumniInitials(
  alumni: Pick<AdminAlumniView, "firstName" | "surname" | "fullName">,
) {
  const parts = [alumni.firstName, alumni.surname].filter(Boolean) as string[];
  if (parts.length === 0) {
    return alumni.fullName.slice(0, 2).toUpperCase() || "AL";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
