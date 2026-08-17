"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserView } from "@/lib/users";

type UserRole = AdminUserView["role"];
type UserStatus = AdminUserView["status"];

const buttonClass =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold transition";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-[10px] transition";

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.475 5.408l2.117 2.117m-8.4 8.4L5.25 18.75l.75-4.942 7.942-7.943a1.5 1.5 0 012.121 0l1.88 1.88a1.5 1.5 0 010 2.122l-7.942 7.942z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7.5h12M9.75 7.5V6.75A1.5 1.5 0 0111.25 5.25h1.5a1.5 1.5 0 011.5 1.5V7.5m2.25 0V18a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V7.5h10.5z"
      />
    </svg>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const styles =
    status === "Active"
      ? "bg-unn-green-soft text-unn-green-deep"
      : status === "Invited"
        ? "bg-amber-50 text-amber-800"
        : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex rounded-[10px] px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function RolePill({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex rounded-[10px] bg-unn-mist px-2.5 py-1 text-xs font-semibold text-unn-ink">
      {role}
    </span>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

export default function UsersAdminClient({
  initialUsers,
  assignableRoles = [
    "Super Admin",
    "Admin",
    "VC",
    "Secretary",
    "Staff",
  ],
  canManageSuperAdmin = true,
  loadError = null,
}: {
  initialUsers: AdminUserView[];
  assignableRoles?: UserRole[];
  canManageSuperAdmin?: boolean;
  loadError?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(
    assignableRoles.includes("Staff") ? "Staff" : assignableRoles[0] ?? "Staff",
  );
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = editingUserId !== null;

  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modalOpen]);

  const roleGuide = (
    [
      {
        role: "Super Admin",
        detail: "Full access to every module and settings",
      },
      {
        role: "Admin",
        detail: "Manage alumni, executives, faculties, and content",
      },
      {
        role: "VC",
        detail: "Executive oversight of association programmes",
      },
      {
        role: "Secretary",
        detail: "Handle records, correspondence, and meeting notes",
      },
      {
        role: "Staff",
        detail: "Day-to-day operational access to assigned modules",
      },
    ] as const
  ).filter(
    (item) => canManageSuperAdmin || item.role !== "Super Admin",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, query, roleFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === "Active").length,
      invited: users.filter((user) => user.status === "Invited").length,
      suspended: users.filter((user) => user.status === "Suspended").length,
    }),
    [users],
  );

  function openModal() {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole(
      assignableRoles.includes("Staff")
        ? "Staff"
        : assignableRoles[0] ?? "Staff",
    );
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(user: AdminUserView) {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setShowPassword(false);
    setRole(
      assignableRoles.includes(user.role)
        ? user.role
        : assignableRoles[0] ?? "Staff",
    );
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUserId(null);
    setShowPassword(false);
    setFormError("");
  }

  async function handleSubmitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (isEditing && editingUserId) {
        const response = await fetch(`/api/users/${editingUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            role,
            ...(password ? { password } : {}),
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setFormError(data.error ?? "Could not update user.");
          return;
        }

        setUsers((current) =>
          current.map((user) =>
            user.id === editingUserId ? (data.user as AdminUserView) : user,
          ),
        );
        closeModal();
        startTransition(() => router.refresh());
        return;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Could not create user.");
        return;
      }

      setUsers((current) => [data.user as AdminUserView, ...current]);
      closeModal();
      startTransition(() => router.refresh());
    } catch {
      setFormError(
        isEditing
          ? "Could not update user. Check your connection and try again."
          : "Could not create user. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user: AdminUserView) {
    const confirmed = window.confirm(
      `Delete ${user.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    const previous = users;

    setUsers((list) => list.filter((item) => item.id !== user.id));

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setUsers(previous);
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setUsers(previous);
    } finally {
      setDeletingId(null);
    }
  }

  async function cycleStatus(id: string) {
    const current = users.find((user) => user.id === id);
    if (!current || current.status === "Invited") return;

    const nextStatus: UserStatus =
      current.status === "Suspended" ? "Active" : "Suspended";

    setUsers((list) =>
      list.map((user) =>
        user.id === id ? { ...user, status: nextStatus } : user,
      ),
    );

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        setUsers((list) =>
          list.map((user) =>
            user.id === id ? { ...user, status: current.status } : user,
          ),
        );
        return;
      }

      const payload = (await response.json()) as { user: AdminUserView };
      setUsers((list) =>
        list.map((user) => (user.id === id ? payload.user : user)),
      );
      startTransition(() => router.refresh());
    } catch {
      setUsers((list) =>
        list.map((user) =>
          user.id === id ? { ...user, status: current.status } : user,
        ),
      );
    }
  }

  return (
    <div className="space-y-6">
      {loadError ? (
        <div
          role="alert"
          className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Users
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Dashboard users
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Manage admin accounts, roles, and access for the UNN Alumni control
            center.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className={`${buttonClass} w-full bg-unn-green text-white hover:bg-unn-green-mid sm:w-auto`}
        >
          Add User
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Total users
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">{stats.total}</p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Active
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {stats.active}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Invited
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {stats.invited}
          </p>
        </article>
        <article className="border border-unn-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
            Suspended
          </p>
          <p className="mt-3 font-display text-3xl text-unn-ink">
            {stats.suspended}
          </p>
        </article>
      </section>

      <section className="border border-unn-line bg-white">
        <div className="flex flex-col gap-3 border-b border-unn-line px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl text-unn-ink">Team access</h2>
            <p className="mt-1 text-sm text-unn-muted">
              {isPending
                ? "Refreshing…"
                : filtered.length === 1
                  ? "1 user shown"
                  : `${filtered.length} users shown`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="block w-full sm:max-w-xs">
              <span className="sr-only">Search users</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, role…"
                className="h-10 w-full rounded-[10px] border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
              />
            </label>
            <label className="block w-full sm:w-44">
              <span className="sr-only">Filter by role</span>
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as "All" | UserRole)
                }
                className="h-10 w-full rounded-[10px] border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green"
              >
                <option value="All">All roles</option>
                {assignableRoles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ul className="divide-y divide-unn-line md:hidden">
          {filtered.map((user) => (
            <li key={user.id} className="space-y-3 px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-unn-green-deep text-xs font-semibold text-white">
                  {user.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-unn-ink">{user.name}</p>
                  <p className="truncate text-xs text-unn-muted">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <RolePill role={user.role} />
                    <StatusPill status={user.status} />
                  </div>
                  <p className="mt-2 text-xs text-unn-muted">{user.lastActive}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  aria-label={`Edit ${user.name}`}
                  className={`${iconButtonClass} h-10 w-10 text-unn-green hover:bg-unn-green-soft`}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(user)}
                  disabled={deletingId === user.id}
                  aria-label={`Delete ${user.name}`}
                  className={`${iconButtonClass} h-10 w-10 text-rose-600 hover:bg-rose-50 disabled:opacity-50`}
                >
                  <DeleteIcon />
                </button>
                {user.status === "Invited" ? (
                  <button
                    type="button"
                    className="min-h-10 rounded-[10px] px-3 py-2 text-xs font-semibold text-unn-muted transition hover:bg-unn-mist hover:text-unn-ink"
                  >
                    Resend invite
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => cycleStatus(user.id)}
                    className="min-h-10 rounded-[10px] px-3 py-2 text-xs font-semibold text-unn-muted transition hover:bg-unn-mist hover:text-unn-ink"
                  >
                    {user.status === "Suspended" ? "Reactivate" : "Suspend"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto overscroll-x-contain touch-pan-x md:block">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last active</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-unn-green-deep text-xs font-semibold text-white">
                        {user.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-unn-ink">{user.name}</p>
                        <p className="truncate text-xs text-unn-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <RolePill role={user.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={user.status} />
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">
                    {user.lastActive}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        aria-label={`Edit ${user.name}`}
                        title="Edit"
                        className={`${iconButtonClass} text-unn-green hover:bg-unn-green-soft`}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user.id}
                        aria-label={`Delete ${user.name}`}
                        title="Delete"
                        className={`${iconButtonClass} text-rose-600 hover:bg-rose-50 disabled:opacity-50`}
                      >
                        <DeleteIcon />
                      </button>
                      {user.status === "Invited" ? (
                        <button
                          type="button"
                          className="rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-unn-muted transition hover:bg-unn-mist hover:text-unn-ink"
                        >
                          Resend invite
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cycleStatus(user.id)}
                          className="rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-unn-muted transition hover:bg-unn-mist hover:text-unn-ink"
                        >
                          {user.status === "Suspended"
                            ? "Reactivate"
                            : "Suspend"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-2xl text-unn-ink">
              {loadError ? "Unable to load users" : "No users found"}
            </p>
            <p className="mt-2 text-sm text-unn-muted">
              {loadError
                ? "Refresh the page once your database connection is stable."
                : users.length === 0
                  ? "Add a user to get started."
                  : "Try another search or role filter."}
            </p>
          </div>
        ) : null}
      </section>

      <section
        className={`grid gap-4 md:grid-cols-2 ${
          roleGuide.length >= 5
            ? "xl:grid-cols-5"
            : roleGuide.length === 4
              ? "xl:grid-cols-4"
              : "xl:grid-cols-3"
        }`}
      >
        {roleGuide.map((item) => (
          <article
            key={item.role}
            className="border border-unn-line bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
              Role
            </p>
            <h3 className="mt-2 font-display text-xl text-unn-ink">
              {item.role}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-unn-muted">
              {item.detail}
            </p>
          </article>
        ))}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close modal overlay"
            className="absolute inset-0 bg-unn-green-deep/45"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[14px] border border-unn-line bg-white shadow-xl sm:rounded-[10px]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-unn-line px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                  Users
                </p>
                <h2
                  id="user-modal-title"
                  className="mt-2 font-display text-2xl text-unn-ink sm:text-3xl"
                >
                  {isEditing ? "Edit user" : "Add new user"}
                </h2>
                <p className="mt-2 text-sm text-unn-muted">
                  {isEditing
                    ? "Update this dashboard account’s details and access role."
                    : "Create a dashboard account and assign an access role."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmitUser}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5"
            >
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Adaobi Okeke"
                  className="h-11 rounded-[10px] border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@unn-alumni.org"
                  className="h-11 rounded-[10px] border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">
                  {isEditing ? "New password (optional)" : "Password"}
                </span>
                <div className="relative">
                  <input
                    required={!isEditing}
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      isEditing
                        ? "Leave blank to keep current password"
                        : "At least 6 characters"
                    }
                    autoComplete="new-password"
                    className="h-11 w-full rounded-[10px] border border-unn-line bg-white px-3 pr-11 outline-none transition focus:border-unn-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-unn-muted transition hover:text-unn-green"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Role</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="h-11 rounded-[10px] border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                >
                  {assignableRoles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {formError ? (
                <p className="text-sm text-rose-700">{formError}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                >
                  {saving
                    ? isEditing
                      ? "Saving…"
                      : "Adding…"
                    : isEditing
                      ? "Save changes"
                      : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
