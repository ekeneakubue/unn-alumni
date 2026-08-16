import { listAlumni } from "@/lib/alumni";
import AlumniAdminClient from "./AlumniAdminClient";

function toLoadErrorMessage(error: unknown) {
  const raw =
    error instanceof Error ? error.message : "Failed to load alumni records";
  const lower = raw.toLowerCase();

  if (
    lower.includes("connection terminated") ||
    lower.includes("can't reach database") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("connection closed") ||
    lower.includes("p1001") ||
    lower.includes("p1017")
  ) {
    return "We couldn’t connect to the database. Check your connection and try again.";
  }

  return "Something went wrong while loading alumni records. Please try again.";
}

export const dynamic = "force-dynamic";

export default async function AlumniAdminPage() {
  try {
    const alumni = await listAlumni();
    return <AlumniAdminClient initialAlumni={alumni} />;
  } catch (error) {
    console.error("AlumniAdminPage", error);
    return (
      <AlumniAdminClient
        initialAlumni={[]}
        loadError={toLoadErrorMessage(error)}
      />
    );
  }
}
