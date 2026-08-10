import Image from "next/image";
import Link from "next/link";

const stories = [
  {
    title: "Homecoming Weekend returns to Nsukka",
    excerpt:
      "Three days of reunions, campus tours, and the annual alumni lecture under the trees of the Lion's Den.",
    date: "12 Mar 2026",
    category: "Events",
    image: "/images/news-1.jpg",
  },
  {
    title: "Mentorship cohort pairs 120 students with alumni",
    excerpt:
      "Industry leaders across tech, health, and law open doors for undergraduates seeking clarity and confidence.",
    date: "28 Feb 2026",
    category: "Programmes",
    image: "/images/news-2.jpg",
  },
  {
    title: "Alumni fund launches new scholarship for first-gens",
    excerpt:
      "A diaspora-led endowment will support twenty first-generation students each academic year starting next session.",
    date: "04 Feb 2026",
    category: "Giving",
    image: "/images/news-3.jpg",
  },
];

export default function News() {
  return (
    <section id="news" className="section-pad bg-unn-mist">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-unn-green-mid">
              News & Updates
            </p>
            <h2 className="section-title mt-3">What the network is building</h2>
            <p className="section-lead">
              Stories from chapters, campuses, and alumni making an impact at
              home and abroad.
            </p>
          </div>
          <Link
            href="#contact"
            className="text-sm font-semibold text-unn-green transition hover:text-unn-green-mid"
          >
            Get news in your inbox →
          </Link>
        </div>

        <ul className="mt-12 grid gap-10 lg:grid-cols-3">
          {stories.map((story) => (
            <li key={story.title}>
              <article className="group h-full">
                <div className="relative aspect-[16/10] overflow-hidden bg-unn-green-soft">
                  <Image
                    src={story.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
                  <span className="text-unn-green">{story.category}</span>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-unn-line" />
                  <time dateTime={story.date}>{story.date}</time>
                </div>
                <h3 className="mt-3 font-display text-2xl leading-snug text-unn-ink transition group-hover:text-unn-green">
                  {story.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-unn-muted">
                  {story.excerpt}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
