import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="section-pad bg-unn-mist">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-unn-green-mid">
            About the Association
          </p>
          <h2 className="section-title mt-3">
            Bound by Nsukka. Driven by purpose.
          </h2>
          <p className="section-lead">
            The UNN Alumni Association gathers graduates across continents into
            a living community of mentorship, service, and opportunity — rooted
            in the green-and-white spirit of the University of Nigeria.
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-unn-muted">
            From classroom corridors to boardrooms worldwide, our members uphold
            excellence, open doors for students, and invest in the campuses that
            shaped them. Whether you graduated last year or decades ago, there
            is a seat for you here.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-unn-ink">
            {[
              "Global chapters and regional meetups",
              "Mentorship for current students and young alumni",
              "Scholarships, giving days, and campus projects",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-unn-green"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,#d9e8de,transparent_60%)]" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src="/images/about.jpg"
              alt="Graduates celebrating on campus"
              fill
              className="object-cover transition duration-700 hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <p className="mt-4 font-display text-xl text-unn-green md:text-2xl">
            “To Restore the Dignity of Man”
          </p>
        </div>
      </div>
    </section>
  );
}
