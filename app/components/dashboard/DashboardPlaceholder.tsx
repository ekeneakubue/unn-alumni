import Link from "next/link";

export default function DashboardPlaceholder({
  title,
  description,
  basePath,
  brand,
}: {
  title: string;
  description: string;
  basePath: "/super-admin" | "/admin";
  brand: string;
}) {
  return (
    <div className="mx-auto max-w-2xl border border-unn-line bg-white px-4 py-10 text-center sm:px-6 sm:py-12 md:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
        {brand}
      </p>
      <h1 className="mt-3 font-display text-3xl text-unn-ink md:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-unn-muted">
        {description}
      </p>
      <Link
        href={basePath}
        className="mt-8 inline-flex h-11 w-full items-center justify-center bg-unn-green px-5 text-sm font-semibold text-white transition hover:bg-unn-green-mid sm:w-auto"
      >
        Back to overview
      </Link>
    </div>
  );
}
