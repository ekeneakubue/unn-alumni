"use client";

import { useMemo, useState } from "react";

type Faculty = {
  id: string;
  name: string;
  departments: string[];
  alumniCount: number;
  published: boolean;
};

const initialFaculties: Faculty[] = [
  {
    id: "1",
    name: "Arts",
    departments: [
      "English",
      "History",
      "Fine & Applied Arts",
      "Music",
      "Theatre",
    ],
    alumniCount: 1420,
    published: true,
  },
  {
    id: "2",
    name: "Biological Sciences",
    departments: [
      "Biochemistry",
      "Microbiology",
      "Zoology",
      "Plant Science",
    ],
    alumniCount: 1180,
    published: true,
  },
  {
    id: "3",
    name: "Business Administration",
    departments: [
      "Accountancy",
      "Banking & Finance",
      "Marketing",
      "Management",
    ],
    alumniCount: 2105,
    published: true,
  },
  {
    id: "4",
    name: "Education",
    departments: ["Arts Education", "Science Education", "Adult Education"],
    alumniCount: 980,
    published: true,
  },
  {
    id: "5",
    name: "Engineering",
    departments: [
      "Civil",
      "Electrical",
      "Mechanical",
      "Electronic Engineering",
    ],
    alumniCount: 2650,
    published: true,
  },
  {
    id: "6",
    name: "Environmental Studies",
    departments: [
      "Architecture",
      "Estate Management",
      "Urban & Regional Planning",
    ],
    alumniCount: 740,
    published: true,
  },
  {
    id: "7",
    name: "Law",
    departments: [
      "Public & Private Law",
      "International & Comparative Law",
    ],
    alumniCount: 1320,
    published: true,
  },
  {
    id: "8",
    name: "Medicine",
    departments: [
      "Medicine & Surgery",
      "Anatomy",
      "Physiology",
      "Medical Lab",
    ],
    alumniCount: 1890,
    published: true,
  },
  {
    id: "9",
    name: "Pharmaceutical Sciences",
    departments: ["Clinical Pharmacy", "Pharmacognosy", "Pharmacology"],
    alumniCount: 620,
    published: false,
  },
  {
    id: "10",
    name: "Physical Sciences",
    departments: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
    alumniCount: 1540,
    published: true,
  },
  {
    id: "11",
    name: "Social Sciences",
    departments: ["Economics", "Political Science", "Sociology", "Psychology"],
    alumniCount: 1760,
    published: true,
  },
  {
    id: "12",
    name: "Veterinary Medicine",
    departments: ["Veterinary Surgery", "Pathology", "Public Health"],
    alumniCount: 410,
    published: true,
  },
];

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export default function FacultiesAdminPage() {
  const [faculties, setFaculties] = useState(initialFaculties);
  const [query, setQuery] = useState("");

  const departmentCount = useMemo(
    () => faculties.reduce((sum, faculty) => sum + faculty.departments.length, 0),
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
      faculty.departments.some((dept) => dept.toLowerCase().includes(q))
    );
  });

  function togglePublished(id: string) {
    setFaculties((current) =>
      current.map((faculty) =>
        faculty.id === id
          ? { ...faculty, published: !faculty.published }
          : faculty,
      ),
    );
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
                  {faculty.departments.length} departments ·{" "}
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
              {faculty.departments.map((dept) => (
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
                className="inline-flex h-9 flex-1 items-center justify-center border border-unn-line text-xs font-semibold text-unn-ink transition hover:border-unn-green"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => togglePublished(faculty.id)}
                className="inline-flex h-9 flex-1 items-center justify-center bg-unn-green-soft text-xs font-semibold text-unn-green transition hover:bg-unn-green hover:text-white"
              >
                {faculty.published ? "Unpublish" : "Publish"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="border border-unn-line bg-white px-5 py-12 text-center">
          <p className="font-display text-2xl text-unn-ink">No matches</p>
          <p className="mt-2 text-sm text-unn-muted">
            Try another faculty or department name.
          </p>
        </div>
      ) : null}

      <section className="border border-unn-line bg-white">
        <div className="border-b border-unn-line px-5 py-4">
          <h2 className="font-display text-2xl text-unn-ink">Faculty table</h2>
          <p className="mt-1 text-sm text-unn-muted">
            Compact view for editing order and visibility
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
                    {faculty.departments.join(", ")}
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
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs font-semibold text-unn-green hover:text-unn-green-mid"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublished(faculty.id)}
                        className="text-xs font-semibold text-unn-muted hover:text-unn-ink"
                      >
                        {faculty.published ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
