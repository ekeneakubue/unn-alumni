import Link from "next/link";

export default function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl border border-unn-line bg-white px-6 py-12 text-center md:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
        Super Admin
      </p>
      <h1 className="mt-3 font-display text-3xl text-unn-ink md:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-unn-muted">
        {description}
      </p>
      <Link
        href="/super-admin"
        className="mt-8 inline-flex h-11 items-center bg-unn-green px-5 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
      >
        Back to overview
      </Link>
    </div>
  );
}
