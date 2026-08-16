"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
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

export default function UsersAdminClient({
  initialUsers,
}: {
  initialUsers: AdminUserView[];
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
  const [role, setRole] = useState<UserRole>("Staff");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = editingUserId !== null;

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
    setRole("Staff");
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(user: AdminUserView) {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUserId(null);
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
          className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid`}
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
        <div className="flex flex-col gap-3 border-b border-unn-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
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
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="VC">VC</option>
                <option value="Secretary">Secretary</option>
                <option value="Staff">Staff</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
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
            <p className="font-display text-2xl text-unn-ink">No users found</p>
            <p className="mt-2 text-sm text-unn-muted">
              {users.length === 0
                ? "Add a user to get started."
                : "Try another search or role filter."}
            </p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {(
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
        ).map((item) => (
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
            aria-labelledby="user-modal-title"
            className="relative z-10 w-full max-w-lg rounded-[10px] border border-unn-line bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                  Users
                </p>
                <h2
                  id="user-modal-title"
                  className="mt-2 font-display text-3xl text-unn-ink"
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="mt-6 space-y-4">
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
                <input
                  required={!isEditing}
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isEditing
                      ? "Leave blank to keep current password"
                      : "At least 8 characters"
                  }
                  autoComplete="new-password"
                  className="h-11 rounded-[10px] border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Role</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="h-11 rounded-[10px] border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="VC">VC</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Staff">Staff</option>
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
