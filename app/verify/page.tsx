import type { Metadata } from "next";
import VerifyRecordClient from "./VerifyRecordClient";

export const metadata: Metadata = {
  title: "Verify / Update Your Record | UNN Alumni",
  description:
    "Find your University of Nigeria alumni record and update your details.",
};

export default function VerifyPage() {
  return <VerifyRecordClient />;
}
