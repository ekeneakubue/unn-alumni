import Link from "next/link";

const stats = [
  { label: "Registered alumni", value: "18,420", change: "+126 this week" },
  { label: "Pending approvals", value: "47", change: "12 urgent" },
  { label: "Active chapters", value: "32", change: "3 new this year" },
  { label: "Upcoming events", value: "8", change: "Next: 18 Aug" },
];

const recentAlumni = [
  {
    name: "Chioma Adeyemi",
    faculty: "Law",
    year: "2019",
    status: "Pending",
  },
  {
    name: "Emeka Obi",
    faculty: "Engineering",
    year: "2016",
    status: "Approved",
  },
  {
    name: "Fatima Bello",
    faculty: "Medicine",
    year: "2021",
    status: "Pending",
  },
  {
    name: "Ikechukwu Nnaji",
    faculty: "Business Admin",
    year: "2014",
    status: "Approved",
  },
  {
    name: "Ngozi Okoro",
    faculty: "Arts",
    year: "2018",
    status: "Review",
  },
];

const activity = [
  {
    title: "Homecoming Weekend draft published",
    time: "12 min ago",
    type: "News",
  },
  {
    title: "Lagos chapter membership update synced",
    time: "1 hr ago",
    type: "Chapters",
  },
  {
    title: "Contact form: partnership inquiry",
    time: "3 hrs ago",
    type: "Messages",
  },
  {
    title: "Executive profile — VP Engineering edited",
    time: "Yesterday",
    type: "Executives",
  },
];

const quickLinks = [
  { href: "/super-admin/alumni", label: "Approve alumni", detail: "47 waiting" },
  { href: "/super-admin/news", label: "Publish news", detail: "Create post" },
  { href: "/super-admin/events", label: "Schedule event", detail: "Calendar" },
  { href: "/super-admin/messages", label: "Inbox", detail: "9 unread" },
];

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Approved"
      ? "bg-unn-green-soft text-unn-green"
      : status === "Pending"
        ? "bg-amber-50 text-amber-800"
        : "bg-unn-mist text-unn-muted";

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

export default function SuperAdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Overview
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Association at a glance
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Monitor membership, content, and chapter activity across the UNN
            Alumni network.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/super-admin/alumni"
            className="inline-flex h-11 items-center bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
          >
            Review applications
          </Link>
          <Link
            href="/super-admin/news"
            className="inline-flex h-11 items-center border border-unn-line bg-white px-4 text-sm font-semibold text-unn-ink transition hover:border-unn-green"
          >
            New announcement
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="border border-unn-line bg-white p-5 transition hover:border-unn-green/40"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-unn-muted">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-3xl text-unn-ink">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-unn-green">{stat.change}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="border border-unn-line bg-white">
          <div className="flex items-center justify-between border-b border-unn-line px-5 py-4">
            <div>
              <h2 className="font-display text-2xl text-unn-ink">
                Recent registrations
              </h2>
              <p className="mt-1 text-sm text-unn-muted">
                Latest alumni joining the network
              </p>
            </div>
            <Link
              href="/super-admin/alumni"
              className="text-sm font-semibold text-unn-green hover:text-unn-green-mid"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Faculty</th>
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAlumni.map((person) => (
                  <tr
                    key={person.name}
                    className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-unn-ink">
                      {person.name}
                    </td>
                    <td className="px-5 py-3.5 text-unn-muted">
                      {person.faculty}
                    </td>
                    <td className="px-5 py-3.5 text-unn-muted">{person.year}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={person.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-unn-line bg-white">
            <div className="border-b border-unn-line px-5 py-4">
              <h2 className="font-display text-2xl text-unn-ink">Quick actions</h2>
            </div>
            <ul className="divide-y divide-unn-line">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-5 py-4 transition hover:bg-unn-mist/60"
                  >
                    <span className="text-sm font-semibold text-unn-ink">
                      {item.label}
                    </span>
                    <span className="text-xs text-unn-muted">{item.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-unn-line bg-white">
            <div className="border-b border-unn-line px-5 py-4">
              <h2 className="font-display text-2xl text-unn-ink">Activity</h2>
            </div>
            <ul className="divide-y divide-unn-line">
              {activity.map((item) => (
                <li key={item.title} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-unn-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-unn-muted">{item.time}</p>
                    </div>
                    <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-unn-green">
                      {item.type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
