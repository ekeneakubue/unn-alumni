import type { Metadata } from "next";
import {
  listAlumniFacultiesForSelect,
  listVerifyFacultiesForSelect,
} from "@/lib/alumni";
import VerifyRecordClient from "./VerifyRecordClient";

export const metadata: Metadata = {
  title: "Verify / Update Your Record | UNN Alumni",
  description:
    "Find your University of Nigeria alumni record and update your details.",
};

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const [lookupFaculties, formFaculties] = await Promise.all([
    listAlumniFacultiesForSelect().catch((error) => {
      console.error("listAlumniFacultiesForSelect", error);
      return [] as Awaited<ReturnType<typeof listAlumniFacultiesForSelect>>;
    }),
    listVerifyFacultiesForSelect().catch((error) => {
      console.error("listVerifyFacultiesForSelect", error);
      return [] as Awaited<ReturnType<typeof listVerifyFacultiesForSelect>>;
    }),
  ]);

  return (
    <VerifyRecordClient
      lookupFaculties={lookupFaculties ?? []}
      formFaculties={formFaculties ?? []}
    />
  );
}
