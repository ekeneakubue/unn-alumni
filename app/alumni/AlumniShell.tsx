"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/alumni", label: "Overview", exact: true },
  { href: "/alumni/profile", label: "Profile" },
  { href: "/alumni/events", label: "Events" },
  { href: "/alumni/news", label: "News" },
];

type AlumniShellProps = {
  children: React.ReactNode;
  alumniName: string;
  alumniInitials: string;
};

export default function AlumniShell({
  children,
  alumniName,
  alumniInitials,
}: AlumniShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/alumni/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-svh bg-unn-mist text-unn-ink">
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
            <p className="font-display text-lg leading-none">Alumni Portal</p>
            <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.16em] text-white/55">
              UNN Alumni
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Menu
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

        <div className="space-y-2 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full rounded-sm border border-white/20 px-3 py-2.5 text-center text-sm text-white/85 transition hover:border-white hover:bg-white/10 disabled:opacity-60"
          >
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
          <Link
            href="/"
            className="block rounded-sm px-3 py-2 text-center text-sm text-white/55 transition hover:text-white"
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
                Alumni member portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-unn-line py-1.5 pl-1.5 pr-3">
            <span className="inline-flex h-7 w-7 items-center justify-center bg-unn-green-deep text-[0.7rem] font-semibold text-white">
              {alumniInitials}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">
              {alumniName}
            </span>
          </div>
        </header>

        <main className="animate-fade-up px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
