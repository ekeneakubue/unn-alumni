"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminAlumniView, UiAlumniStatus } from "@/lib/alumni";
import UploadAlumniCsvButton from "./UploadAlumniCsvButton";

function StatusPill({ status }: { status: UiAlumniStatus }) {
  const tone =
    status === "Approved"
      ? "bg-unn-green-soft text-unn-green"
      : status === "Pending"
        ? "bg-amber-50 text-amber-800"
        : "bg-unn-mist text-unn-muted";

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

export default function AlumniAdminClient({
  initialAlumni,
}: {
  initialAlumni: AdminAlumniView[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UiAlumniStatus>(
    "All",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialAlumni.filter((person) => {
      const matchesStatus =
        statusFilter === "All" || person.status === statusFilter;
      const matchesQuery =
        !q ||
        person.fullName.toLowerCase().includes(q) ||
        (person.email?.toLowerCase().includes(q) ?? false) ||
        (person.registrationNumber?.toLowerCase().includes(q) ?? false) ||
        (person.department?.toLowerCase().includes(q) ?? false) ||
        (person.stateOfOrigin?.toLowerCase().includes(q) ?? false);
      return matchesStatus && matchesQuery;
    });
  }, [initialAlumni, query, statusFilter]);

  function handleImported() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Alumni
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Alumni directory
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Manage member profiles, approvals, and bulk imports from CSV.
          </p>
        </div>

        <UploadAlumniCsvButton onImported={handleImported} />
      </div>

      <section className="border border-unn-line bg-white">
        <div className="flex flex-col gap-3 border-b border-unn-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl text-unn-ink">Members</h2>
            <p className="mt-1 text-sm text-unn-muted">
              {filtered.length === 1
                ? "1 member shown"
                : `${filtered.length} members shown`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="block w-full sm:max-w-xs">
              <span className="sr-only">Search alumni</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, reg. no…"
                className="h-10 w-full rounded-[10px] border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
              />
            </label>
            <label className="block w-full sm:w-44">
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "All" | UiAlumniStatus,
                  )
                }
                className="h-10 w-full rounded-[10px] border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Review">Review</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Reg. No.</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Grad. year</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr
                  key={person.id}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5 text-unn-muted">
                    {person.registrationNumber ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-unn-ink">
                    {person.fullName}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {person.email ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {person.department ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {person.graduationYear ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={person.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-2xl text-unn-ink">No alumni found</p>
            <p className="mt-2 text-sm text-unn-muted">
              {initialAlumni.length === 0
                ? "Upload a CSV or add members to get started."
                : "Try another search or status filter."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
