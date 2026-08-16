import type { Metadata } from "next";
import AlumniLoginClient from "./AlumniLoginClient";

export const metadata: Metadata = {
  title: "Alumni Login | UNN Alumni",
  description:
    "Sign in to your University of Nigeria alumni account with email and password.",
};

export default function AlumniLoginPage() {
  return <AlumniLoginClient />;
}
