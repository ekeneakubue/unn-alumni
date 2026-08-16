import Link from "next/link";
import HeroCarousel from "./HeroCarousel";

export default function Hero() {
  return (
    <section
      id="home"
      className="animate-hero-section relative flex min-h-[100svh] items-stretch overflow-hidden bg-unn-green-deep text-white"
    >
      <div
        aria-hidden
        className="animate-orb-pulse pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-orb-pulse pointer-events-none absolute left-[28%] top-0 h-80 w-80 rounded-full bg-unn-green-mid/20 blur-3xl [animation-delay:2.5s]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 py-28 md:grid-cols-[1fr_1.05fr] md:gap-10 md:px-8 md:py-32">
        <div className="animate-slide-in-left flex flex-col justify-center lg:pr-4">
          <div className="animate-fade-up inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
            <span
              className="animate-rule-grow h-px origin-left bg-white/35"
              aria-hidden
            />
            University of Nigeria
          </div>

          <p className="animate-fade-up delay-1 mt-6 font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.02em]">
            UNN Alumni
          </p>

          <h1 className="animate-fade-up delay-2 mt-6 max-w-md text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl md:text-[1.85rem]">
            One network. Lifelong lions.
          </h1>

          <p className="animate-fade-up delay-3 mt-5 max-w-md text-base leading-relaxed text-white/72 md:text-[1.05rem]">
            Reconnect with classmates, mentor students, and carry forward the
            call to restore the dignity of man.
          </p>

          <div className="animate-fade-up delay-4 mt-9 flex flex-wrap gap-3">
            <Link
              href="/verify"
              scroll={false}
              className="inline-flex h-12 items-center rounded-sm bg-white px-6 text-sm font-semibold text-unn-green-deep transition hover:bg-unn-green-soft"
            >
              Verify/Update Your Record
            </Link>
          </div>
        </div>

        <div className="animate-slide-in-right delay-2 relative w-full">
          <div className="animate-soft-float">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
