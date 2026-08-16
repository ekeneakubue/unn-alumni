"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminFacultyView } from "@/lib/faculty";

const buttonClass =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold transition";
const fieldClass =
  "h-11 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green";

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export default function FacultiesAdminClient({
  initialFaculties,
}: {
  initialFaculties: AdminFacultyView[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [faculties, setFaculties] = useState(initialFaculties);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setFaculties(initialFaculties);
  }, [initialFaculties]);

  const departmentCount = useMemo(
    () =>
      faculties.reduce(
        (sum, faculty) => sum + faculty.departmentNames.length,
        0,
      ),
    [faculties],
  );
  const publishedCount = faculties.filter((faculty) => faculty.published).length;
  const alumniTotal = faculties.reduce(
    (sum, faculty) => sum + faculty.alumniCount,
    0,
  );

  const filtered = faculties.filter((faculty) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      faculty.name.toLowerCase().includes(q) ||
      faculty.departmentNames.some((dept) => dept.toLowerCase().includes(q))
    );
  });

  function openAddModal() {
    setName("");
    setPublished(true);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setFormError("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const response = await fetch("/api/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          published,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Could not create faculty.");
        return;
      }

      const faculty = data.faculty as AdminFacultyView;
      setFaculties((current) => [...current, faculty]);
      setModalOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setFormError("Create failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(faculty: AdminFacultyView) {
    setTogglingId(faculty.id);
    try {
      const response = await fetch(`/api/faculties/${faculty.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !faculty.published }),
      });
      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Could not update faculty.");
        return;
      }

      const updated = data.faculty as AdminFacultyView;
      setFaculties((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      startTransition(() => router.refresh());
    } catch {
      window.alert("Update failed. Check your connection and try again.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Faculties
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Faculties & departments
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Maintain faculty listings, department groupings, and what appears on
            the public alumni site.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex h-11 items-center justify-center bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
        >
          Add Faculty
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Faculties
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {faculties.length}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Departments
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {departmentCount}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Published
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {publishedCount}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Linked alumni
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {formatCount(alumniTotal)}
          </p>
        </article>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-unn-muted">
          {filtered.length === 1
            ? "1 faculty shown"
            : `${filtered.length} faculties shown`}
        </p>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search faculties</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search faculty or department…"
            className="h-10 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
          />
        </label>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((faculty) => (
          <article
            key={faculty.id}
            className="flex flex-col border border-unn-line bg-white p-5 transition hover:border-unn-green/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-unn-ink">
                  {faculty.name}
                </h2>
                <p className="mt-1 text-sm text-unn-muted">
                  {faculty.departmentNames.length} departments ·{" "}
                  {formatCount(faculty.alumniCount)} alumni
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                  faculty.published
                    ? "bg-unn-green-soft text-unn-green"
                    : "bg-unn-mist text-unn-muted"
                }`}
              >
                {faculty.published ? "Live" : "Draft"}
              </span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {faculty.departmentNames.map((dept) => (
                <li
                  key={dept}
                  className="border border-unn-line bg-unn-mist/60 px-2.5 py-1 text-xs text-unn-ink"
                >
                  {dept}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex gap-2 pt-5">
              <button
                type="button"
                disabled={togglingId === faculty.id}
                onClick={() => togglePublished(faculty)}
                className="inline-flex h-9 flex-1 items-center justify-center bg-unn-green-soft text-xs font-semibold text-unn-green transition hover:bg-unn-green hover:text-white disabled:opacity-60"
              >
                {togglingId === faculty.id
                  ? "Saving…"
                  : faculty.published
                    ? "Unpublish"
                    : "Publish"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="border border-unn-line bg-white px-5 py-12 text-center">
          <p className="font-display text-2xl text-unn-ink">No matches</p>
          <p className="mt-2 text-sm text-unn-muted">
            {faculties.length === 0
              ? "Add a faculty to get started."
              : "Try another faculty or department name."}
          </p>
        </div>
      ) : null}

      <section className="border border-unn-line bg-white">
        <div className="border-b border-unn-line px-5 py-4">
          <h2 className="font-display text-2xl text-unn-ink">Faculty table</h2>
          <p className="mt-1 text-sm text-unn-muted">
            Compact view for visibility
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Faculty</th>
                <th className="px-5 py-3 font-semibold">Departments</th>
                <th className="px-5 py-3 font-semibold">Alumni</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faculty) => (
                <tr
                  key={faculty.id}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5 font-medium text-unn-ink">
                    {faculty.name}
                  </td>
                  <td className="max-w-md px-5 py-3.5 text-unn-muted">
                    {faculty.departmentNames.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {formatCount(faculty.alumniCount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                        faculty.published
                          ? "bg-unn-green-soft text-unn-green"
                          : "bg-unn-mist text-unn-muted"
                      }`}
                    >
                      {faculty.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      disabled={togglingId === faculty.id}
                      onClick={() => togglePublished(faculty)}
                      className="text-xs font-semibold text-unn-muted hover:text-unn-ink disabled:opacity-60"
                    >
                      {faculty.published ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal overlay"
            className="absolute inset-0 bg-unn-green-deep/45"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-faculty-title"
            className="relative z-10 w-full max-w-lg border border-unn-line bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-unn-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                  Faculties
                </p>
                <h2
                  id="add-faculty-title"
                  className="mt-2 font-display text-3xl text-unn-ink"
                >
                  Add Faculty
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 px-6 py-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">
                  Faculty name <span className="text-rose-600">*</span>
                </span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Engineering"
                  className={fieldClass}
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-unn-ink">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="h-4 w-4 accent-unn-green"
                />
                Publish on the public site
              </label>

              {formError ? (
                <p className="text-sm text-rose-700">{formError}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green disabled:opacity-60`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                >
                  {saving ? "Saving…" : "Create faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
