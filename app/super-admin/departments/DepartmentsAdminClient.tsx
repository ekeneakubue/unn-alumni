"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminDepartmentView,
  FacultyOption,
} from "@/lib/department";

const buttonClass =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold transition";
const fieldClass =
  "h-11 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green";

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export default function DepartmentsAdminClient({
  initialDepartments,
  faculties,
}: {
  initialDepartments: AdminDepartmentView[];
  faculties: FacultyOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [departments, setDepartments] = useState(initialDepartments);
  const [query, setQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState(faculties[0]?.id ?? "");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  useEffect(() => {
    if (!facultyId && faculties[0]?.id) {
      setFacultyId(faculties[0].id);
    }
  }, [faculties, facultyId]);

  const publishedCount = departments.filter((item) => item.published).length;
  const facultyCount = useMemo(
    () => new Set(departments.map((item) => item.facultyId)).size,
    [departments],
  );
  const alumniTotal = departments.reduce(
    (sum, item) => sum + item.alumniCount,
    0,
  );

  const filtered = departments.filter((department) => {
    const q = query.trim().toLowerCase();
    const matchesFaculty =
      facultyFilter === "All" || department.facultyId === facultyFilter;
    const matchesQuery =
      !q ||
      department.name.toLowerCase().includes(q) ||
      department.facultyName.toLowerCase().includes(q);
    return matchesFaculty && matchesQuery;
  });

  function openAddModal() {
    setName("");
    setFacultyId(faculties[0]?.id ?? "");
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
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, facultyId, published }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Could not create department.");
        return;
      }

      const department = data.department as AdminDepartmentView;
      setDepartments((current) => [...current, department]);
      setModalOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setFormError("Create failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(department: AdminDepartmentView) {
    setTogglingId(department.id);
    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !department.published }),
      });
      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Could not update department.");
        return;
      }

      const updated = data.department as AdminDepartmentView;
      setDepartments((current) =>
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
            Departments
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Departments
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Assign academic departments to faculties and control what appears on
            the public alumni site.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={faculties.length === 0}
          className="inline-flex h-11 items-center justify-center bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid disabled:opacity-50"
        >
          Add Department
        </button>
      </div>

      {faculties.length === 0 ? (
        <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Create a faculty first before adding departments.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Departments
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {departments.length}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Faculties covered
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {facultyCount}
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-unn-muted">
          {filtered.length === 1
            ? "1 department shown"
            : `${filtered.length} departments shown`}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Search departments</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search department or faculty…"
              className="h-10 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
            />
          </label>
          <label className="block w-full sm:w-56">
            <span className="sr-only">Filter by faculty</span>
            <select
              value={facultyFilter}
              onChange={(event) => setFacultyFilter(event.target.value)}
              className="h-10 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
            >
              <option value="All">All faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="border border-unn-line bg-white">
        <div className="border-b border-unn-line px-5 py-4">
          <h2 className="font-display text-2xl text-unn-ink">Department list</h2>
          <p className="mt-1 text-sm text-unn-muted">
            Browse departments by faculty and publish status
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Faculty</th>
                <th className="px-5 py-3 font-semibold">Alumni</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((department) => (
                <tr
                  key={department.id}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5 font-medium text-unn-ink">
                    {department.name}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {department.facultyName}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {formatCount(department.alumniCount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                        department.published
                          ? "bg-unn-green-soft text-unn-green"
                          : "bg-unn-mist text-unn-muted"
                      }`}
                    >
                      {department.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      disabled={togglingId === department.id}
                      onClick={() => togglePublished(department)}
                      className="text-xs font-semibold text-unn-muted hover:text-unn-ink disabled:opacity-60"
                    >
                      {togglingId === department.id
                        ? "Saving…"
                        : department.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-unn-line px-5 py-12 text-center">
            <p className="font-display text-2xl text-unn-ink">No departments</p>
            <p className="mt-2 text-sm text-unn-muted">
              {departments.length === 0
                ? "Add a department to get started."
                : "Try another search or faculty filter."}
            </p>
          </div>
        ) : null}
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
            aria-labelledby="add-department-title"
            className="relative z-10 w-full max-w-lg border border-unn-line bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-unn-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                  Departments
                </p>
                <h2
                  id="add-department-title"
                  className="mt-2 font-display text-3xl text-unn-ink"
                >
                  Add Department
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
                  Faculty <span className="text-rose-600">*</span>
                </span>
                <select
                  required
                  value={facultyId}
                  onChange={(event) => setFacultyId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">
                  Department name <span className="text-rose-600">*</span>
                </span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Computer Science"
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
                  {saving ? "Saving…" : "Create department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
