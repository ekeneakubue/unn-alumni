"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#faculties", label: "Faculties" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
];

const loginItems = [
  { href: "/login", label: "Alumni Login" },
  { href: "/staff/login", label: "Admin Login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loginRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!loginOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target as Node)
      ) {
        setLoginOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLoginOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [loginOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
        scrolled || open
          ? "bg-[color-mix(in_oklab,var(--unn-green-deep)_92%,transparent)] shadow-lg shadow-black/10 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-5 md:h-[4.75rem] md:px-8">
        <Link
          href="#home"
          className="group flex items-center gap-3 text-white"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="University of Nigeria crest"
            width={44}
            height={44}
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105 md:h-11 md:w-11"
            priority
          />
          <span className="leading-tight">
            <span className="block font-display text-xl tracking-wide md:text-[1.35rem]">
              UNN Alumni
            </span>
            <span className="hidden text-[0.68rem] uppercase tracking-[0.18em] text-white/70 sm:block">
              University of Nigeria
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li ref={loginRef} className="relative">
            <button
              type="button"
              aria-expanded={loginOpen}
              aria-haspopup="menu"
              onClick={() => setLoginOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-white px-4 text-sm font-semibold text-unn-green-deep transition hover:bg-unn-green-soft"
            >
              Login
              <span
                aria-hidden
                className={`block h-0 w-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-unn-green-deep transition ${
                  loginOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {loginOpen ? (
              <ul
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[12.5rem] border border-unn-line bg-white py-1.5 shadow-lg"
              >
                {loginItems.map((item) => (
                  <li key={item.href} role="none">
                    <Link
                      role="menuitem"
                      href={item.href}
                      className="block px-4 py-2.5 text-sm font-medium text-unn-ink transition hover:bg-unn-mist hover:text-unn-green-deep"
                      onClick={() => setLoginOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-full bg-current transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-full bg-current transition ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      <div
        className={`border-t border-white/10 bg-unn-green-deep md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-3 text-base text-white/90"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/45">
              Login
            </p>
            <ul className="mt-2 space-y-2">
              {loginItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-white text-sm font-semibold text-unn-green-deep"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </header>
  );
}
