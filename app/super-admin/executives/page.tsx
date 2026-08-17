"use client";

import Image from "next/image";
import { useState } from "react";

type Executive = {
  id: string;
  name: string;
  role: string;
  faculty: string;
  email: string;
  phone: string;
  tenure: string;
  image: string;
  published: boolean;
};

const initialExecutives: Executive[] = [
  {
    id: "1",
    name: "Dr. Adaobi Okeke",
    role: "National President",
    faculty: "Faculty of Medicine",
    email: "president@unn-alumni.org",
    phone: "+234 803 111 0001",
    tenure: "2024 — 2026",
    image: "/images/exec-1.jpg",
    published: true,
  },
  {
    id: "2",
    name: "Engr. Chinedu Eze",
    role: "Vice President",
    faculty: "Faculty of Engineering",
    email: "vp@unn-alumni.org",
    phone: "+234 803 111 0002",
    tenure: "2024 — 2026",
    image: "/images/exec-2.jpg",
    published: true,
  },
  {
    id: "3",
    name: "Barr. Ngozi Umeh",
    role: "General Secretary",
    faculty: "Faculty of Law",
    email: "secretary@unn-alumni.org",
    phone: "+234 803 111 0003",
    tenure: "2024 — 2026",
    image: "/images/exec-3.jpg",
    published: true,
  },
  {
    id: "4",
    name: "Mr. Ifeanyi Nwosu",
    role: "Financial Secretary",
    faculty: "Faculty of Business Administration",
    email: "finance@unn-alumni.org",
    phone: "+234 803 111 0004",
    tenure: "2024 — 2026",
    image: "/images/exec-4.jpg",
    published: true,
  },
  {
    id: "5",
    name: "Vacant",
    role: "Public Relations Officer",
    faculty: "—",
    email: "—",
    phone: "—",
    tenure: "Open",
    image: "",
    published: false,
  },
];

export default function ExecutivesAdminPage() {
  const [executives, setExecutives] = useState(initialExecutives);
  const [query, setQuery] = useState("");

  const publishedCount = executives.filter((e) => e.published && e.name !== "Vacant").length;
  const vacantCount = executives.filter((e) => e.name === "Vacant").length;

  const filtered = executives.filter((person) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      person.name.toLowerCase().includes(q) ||
      person.role.toLowerCase().includes(q) ||
      person.faculty.toLowerCase().includes(q)
    );
  });

  function togglePublished(id: string) {
    setExecutives((current) =>
      current.map((person) =>
        person.id === id && person.name !== "Vacant"
          ? { ...person, published: !person.published }
          : person,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Executives
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            National executives
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Manage leadership profiles shown on the public alumni site and keep
            tenure records current.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid sm:w-auto"
        >
          Add Executive
        </button>
      </div>

      <label className="block w-full lg:hidden">
        <span className="sr-only">Search executives</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, role, faculty…"
          className="h-10 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
        />
      </label>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Total roles
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {executives.length}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Published on site
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {publishedCount}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Vacant seats
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">{vacantCount}</p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filtered
          .filter((person) => person.name !== "Vacant")
          .map((person) => (
            <article
              key={person.id}
              className="overflow-hidden border border-unn-line bg-white"
            >
              <div className="relative aspect-[4/3] bg-unn-green-soft">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                <span
                  className={`absolute left-3 top-3 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                    person.published
                      ? "bg-unn-green text-white"
                      : "bg-white text-unn-muted"
                  }`}
                >
                  {person.published ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl text-unn-ink">
                  {person.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-unn-green">
                  {person.role}
                </p>
                <p className="mt-1 text-sm text-unn-muted">{person.faculty}</p>
                <p className="mt-2 text-xs text-unn-muted">{person.tenure}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 flex-1 items-center justify-center border border-unn-line text-xs font-semibold text-unn-ink transition hover:border-unn-green"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(person.id)}
                    className="inline-flex h-9 flex-1 items-center justify-center bg-unn-green-soft text-xs font-semibold text-unn-green transition hover:bg-unn-green hover:text-white"
                  >
                    {person.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </article>
          ))}
      </section>

      <section className="hidden border border-unn-line bg-white lg:block">
        <div className="flex flex-col gap-3 border-b border-unn-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-unn-ink">
              Executive roster
            </h2>
            <p className="mt-1 text-sm text-unn-muted">
              {filtered.length === 1
                ? "1 role shown"
                : `${filtered.length} roles shown`}
            </p>
          </div>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Search executives</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, role, faculty…"
              className="h-10 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
            />
          </label>
        </div>

        <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Faculty</th>
                <th className="px-5 py-3 font-semibold">Tenure</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr
                  key={person.id}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5 font-medium text-unn-ink">
                    {person.name}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">{person.role}</td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {person.faculty}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">{person.tenure}</td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    <div>{person.email}</div>
                    <div className="text-xs">{person.phone}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                        person.name === "Vacant"
                          ? "bg-amber-50 text-amber-800"
                          : person.published
                            ? "bg-unn-green-soft text-unn-green"
                            : "bg-unn-mist text-unn-muted"
                      }`}
                    >
                      {person.name === "Vacant"
                        ? "Vacant"
                        : person.published
                          ? "Published"
                          : "Draft"}
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
                      {person.name !== "Vacant" ? (
                        <button
                          type="button"
                          onClick={() => togglePublished(person.id)}
                          className="text-xs font-semibold text-unn-muted hover:text-unn-ink"
                        >
                          {person.published ? "Hide" : "Show"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-semibold text-unn-green hover:text-unn-green-mid"
                        >
                          Assign
                        </button>
                      )}
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
