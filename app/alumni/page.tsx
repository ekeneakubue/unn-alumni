import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AdminAlumniView } from "@/lib/alumni";
import { alumniInitials } from "@/lib/alumni-display";
import { resolveAvatarSrc } from "@/lib/avatar-url";
import { getSessionAlumni } from "@/lib/alumni-auth";

function statusClass(status: AdminAlumniView["status"]) {
  if (status === "Approved") {
    return "bg-unn-green-soft text-unn-green";
  }
  if (status === "Review") {
    return "bg-amber-50 text-amber-800";
  }
  return "bg-unn-mist text-unn-muted";
}

export default async function AlumniOverviewPage() {
  const alumni = await getSessionAlumni();
  if (!alumni) redirect("/login");

  const initials = alumniInitials(alumni);
  const firstName = alumni.firstName?.trim() || alumni.fullName.split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
        Overview
      </p>
      <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
        Welcome, {firstName}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
        Your alumni portal for profile, events, and news from the University of
        Nigeria network.
      </p>

      <div className="mt-8 flex flex-col gap-6 border border-unn-line bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-unn-line bg-unn-mist">
            {alumni.avatarUrl ? (
              <Image
                src={resolveAvatarSrc(alumni.avatarUrl)}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-unn-green">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-unn-ink">{alumni.fullName}</p>
            <p className="mt-0.5 truncate text-sm text-unn-muted">
              {[alumni.faculty, alumni.department].filter(Boolean).join(" · ") ||
                "Faculty not set"}
            </p>
            <span
              className={`mt-2 inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${statusClass(alumni.status)}`}
            >
              {alumni.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/verify"
            className="inline-flex h-11 items-center justify-center bg-unn-green px-5 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
          >
            Update record
          </Link>
          <Link
            href="/alumni/profile"
            className="inline-flex h-11 items-center justify-center border border-unn-green bg-white px-5 text-sm font-semibold text-unn-green transition hover:bg-unn-green-soft"
          >
            View profile
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-unn-ink">Your details</h2>
        <p className="mt-1 text-sm text-unn-muted">
          A quick look at your academic and contact information.
        </p>
        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              Registration number
            </dt>
            <dd className="mt-1 text-sm text-unn-ink">
              {alumni.registrationNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              Graduation year
            </dt>
            <dd className="mt-1 text-sm text-unn-ink">
              {alumni.graduationYear ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              Email
            </dt>
            <dd className="mt-1 truncate text-sm text-unn-ink">
              {alumni.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              Phone
            </dt>
            <dd className="mt-1 text-sm text-unn-ink">{alumni.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              Country of residence
            </dt>
            <dd className="mt-1 text-sm text-unn-ink">
              {alumni.countryOfResidence || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
              State of residence
            </dt>
            <dd className="mt-1 text-sm text-unn-ink">
              {alumni.stateOfResidence || "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
