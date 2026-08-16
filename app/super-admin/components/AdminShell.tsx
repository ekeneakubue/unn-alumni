"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/super-admin", label: "Overview", exact: true },
  { href: "/super-admin/users", label: "Users" },
  { href: "/super-admin/alumni", label: "Alumni" },
  { href: "/super-admin/executives", label: "Executives" },
  { href: "/super-admin/faculties", label: "Faculties" },
  { href: "/super-admin/news", label: "News" },
  { href: "/super-admin/events", label: "Events" },
  { href: "/super-admin/messages", label: "Messages" },
  { href: "/super-admin/settings", label: "Settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-svh bg-unn-mist text-unn-ink [&_button]:rounded-[10px] [&_[role=dialog]]:rounded-[10px]">
      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-unn-green-deep/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col bg-unn-green-deep text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Image
            src="/images/logo.png"
            alt="UNN crest"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div className="min-w-0">
            <p className="font-display text-lg leading-none">Super Admin</p>
            <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
              UNN Alumni
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Management
          </p>
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center rounded-sm px-3 py-2.5 text-sm transition ${
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

        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="block rounded-sm border border-white/20 px-3 py-2.5 text-center text-sm text-white/85 transition hover:border-white hover:bg-white/10"
          >
            View public site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-unn-line bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              className="inline-flex h-10 w-10 items-center justify-center border border-unn-line text-unn-ink lg:hidden"
              onClick={() => setOpen(true)}
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </span>
            </button>
            <div>
              <p className="text-sm font-semibold text-unn-ink">Dashboard</p>
              <p className="hidden text-xs text-unn-muted sm:block">
                Alumni association control center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative hidden h-10 items-center rounded-sm border border-unn-line px-3 text-sm text-unn-muted transition hover:border-unn-green hover:text-unn-green sm:inline-flex"
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
            <div className="flex items-center gap-2 border border-unn-line py-1.5 pl-1.5 pr-3">
              <span className="inline-flex h-7 w-7 items-center justify-center bg-unn-green-deep text-[0.7rem] font-semibold text-white">
                SA
              </span>
              <span className="hidden text-sm font-medium sm:inline">Admin</span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
