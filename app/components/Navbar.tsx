"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#executives", label: "Executives" },
  { href: "#faculties", label: "Faculties" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          <li>
            <Link
              href="#contact"
              className="inline-flex h-10 items-center rounded-sm bg-white px-4 text-sm font-semibold text-unn-green-deep transition hover:bg-unn-green-soft"
            >
              Join Network
            </Link>
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
          <li className="pt-2">
            <Link
              href="#contact"
              className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-white text-sm font-semibold text-unn-green-deep"
              onClick={() => setOpen(false)}
            >
              Join Network
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
