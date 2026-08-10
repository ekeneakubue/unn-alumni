import UploadAlumniCsvButton from "./UploadAlumniCsvButton";

const alumni = [
  {
    name: "Chioma Adeyemi",
    email: "chioma.adeyemi@email.com",
    faculty: "Law",
    year: "2019",
    status: "Pending",
  },
  {
    name: "Emeka Obi",
    email: "emeka.obi@email.com",
    faculty: "Engineering",
    year: "2016",
    status: "Approved",
  },
  {
    name: "Fatima Bello",
    email: "fatima.bello@email.com",
    faculty: "Medicine",
    year: "2021",
    status: "Pending",
  },
  {
    name: "Ikechukwu Nnaji",
    email: "ike.nnaji@email.com",
    faculty: "Business Admin",
    year: "2014",
    status: "Approved",
  },
  {
    name: "Ngozi Okoro",
    email: "ngozi.okoro@email.com",
    faculty: "Arts",
    year: "2018",
    status: "Review",
  },
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

export default function AlumniAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
            Alumni
          </p>
          <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
            Alumni directory
          </h1>
          <p className="mt-2 max-w-xl text-sm text-unn-muted md:text-base">
            Manage member profiles, approvals, and bulk imports from CSV.
          </p>
        </div>

        <UploadAlumniCsvButton />
      </div>

      <section className="border border-unn-line bg-white">
        <div className="flex items-center justify-between border-b border-unn-line px-5 py-4">
          <div>
            <h2 className="font-display text-2xl text-unn-ink">Members</h2>
            <p className="mt-1 text-sm text-unn-muted">
              {alumni.length} shown · sample directory
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Faculty</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((person) => (
                <tr
                  key={person.email}
                  className="border-t border-unn-line/80 transition hover:bg-unn-mist/50"
                >
                  <td className="px-5 py-3.5 font-medium text-unn-ink">
                    {person.name}
                  </td>
                  <td className="px-5 py-3.5 text-unn-muted">{person.email}</td>
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
      </section>
    </div>
  );
}
