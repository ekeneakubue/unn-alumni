import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "#about", label: "About" },
  { href: "#executives", label: "Executives" },
  { href: "#faculties", label: "Faculties" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-unn-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="#home" className="inline-flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="University of Nigeria crest"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-2xl">
                UNN Alumni
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              The global network of University of Nigeria graduates — keeping
              lions connected, and the motto alive.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Motto
            </p>
            <p className="mt-4 font-display text-2xl leading-snug text-white">
              To Restore the Dignity of Man
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UNN Alumni Association. All rights reserved.</p>
          <p>University of Nigeria, Nsukka</p>
        </div>
      </div>
    </footer>
  );
}
