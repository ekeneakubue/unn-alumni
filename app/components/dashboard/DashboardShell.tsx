"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type DashboardShellProps = {
  children: React.ReactNode;
  basePath: "/super-admin" | "/admin";
  title: string;
  userName: string;
  userInitials: string;
};

export default function DashboardShell({
  children,
  basePath,
  title,
  userName,
  userInitials,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const nav = [
    { href: basePath, label: "Overview", exact: true },
    { href: `${basePath}/users`, label: "Users" },
    { href: `${basePath}/alumni`, label: "Alumni" },
    ...(basePath === "/super-admin"
      ? [{ href: `${basePath}/executives`, label: "Executives" }]
      : []),
    { href: `${basePath}/faculties`, label: "Faculties" },
    { href: `${basePath}/departments`, label: "Departments" },
    { href: `${basePath}/news`, label: "News" },
    { href: `${basePath}/events`, label: "Events" },
    { href: `${basePath}/messages`, label: "Messages" },
    { href: `${basePath}/settings`, label: "Settings" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/staff/logout", { method: "POST" });
      router.push("/staff/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-unn-mist text-unn-ink [&_button]:rounded-[10px] [&_[role=dialog]]:rounded-[10px]">
      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-unn-green-deep/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,88vw)] flex-col bg-unn-green-deep pt-[env(safe-area-inset-top)] text-white transition-transform duration-300 lg:w-[17.5rem] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:h-16 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="UNN crest"
              width={36}
              height={36}
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-none">{title}</p>
              <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
                UNN Alumni
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-lg text-white/85 lg:hidden"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          <p className="px-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Management
          </p>
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-10 items-center rounded-sm px-3 py-2 text-sm transition ${
                      active
                        ? "bg-white text-unn-green-deep"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1.5 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block min-h-10 w-full rounded-sm border border-white/20 px-3 py-2 text-center text-sm text-white/85 transition hover:border-white hover:bg-white/10 disabled:opacity-60"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href="/"
            className="block min-h-10 rounded-sm border border-white/20 px-3 py-2 text-center text-sm leading-6 text-white/85 transition hover:border-white hover:bg-white/10"
          >
            View public site
          </Link>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-unn-line bg-white/90 px-3 backdrop-blur sm:h-16 sm:px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-unn-line text-unn-ink lg:hidden"
              onClick={() => setOpen(true)}
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-unn-ink">
                Dashboard
              </p>
              <p className="hidden truncate text-xs text-unn-muted sm:block">
                Alumni association control center
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              className="relative hidden h-10 items-center rounded-sm border border-unn-line px-3 text-sm text-unn-muted transition hover:border-unn-green hover:text-unn-green md:inline-flex"
            >
              Search…
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center border border-unn-line text-sm font-semibold text-unn-green"
            >
              3
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-unn-green" />
            </button>
            <div className="flex max-w-[9rem] items-center gap-2 border border-unn-line py-1.5 pl-1.5 pr-2 sm:max-w-none sm:pr-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-unn-green-deep text-[0.7rem] font-semibold text-white">
                {userInitials}
              </span>
              <span className="hidden truncate text-sm font-medium sm:inline">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
