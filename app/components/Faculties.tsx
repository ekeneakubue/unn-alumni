const faculties = [
  {
    name: "Arts",
    departments: "English, History, Fine & Applied Arts, Music, Theatre",
  },
  {
    name: "Biological Sciences",
    departments: "Biochemistry, Microbiology, Zoology, Plant Science",
  },
  {
    name: "Business Administration",
    departments: "Accountancy, Banking & Finance, Marketing, Management",
  },
  {
    name: "Education",
    departments: "Arts Education, Science Education, Adult Education",
  },
  {
    name: "Engineering",
    departments: "Civil, Electrical, Mechanical, Electronic Engineering",
  },
  {
    name: "Environmental Studies",
    departments: "Architecture, Estate Management, Urban & Regional Planning",
  },
  {
    name: "Law",
    departments: "Public & Private Law, International & Comparative Law",
  },
  {
    name: "Medicine",
    departments: "Medicine & Surgery, Anatomy, Physiology, Medical Lab",
  },
  {
    name: "Pharmaceutical Sciences",
    departments: "Clinical Pharmacy, Pharmacognosy, Pharmacology",
  },
  {
    name: "Physical Sciences",
    departments: "Physics, Chemistry, Mathematics, Computer Science",
  },
  {
    name: "Social Sciences",
    departments: "Economics, Political Science, Sociology, Psychology",
  },
  {
    name: "Veterinary Medicine",
    departments: "Veterinary Surgery, Pathology, Public Health",
  },
];

export default function Faculties() {
  return (
    <section
      id="faculties"
      className="section-pad relative overflow-hidden bg-unn-green-deep text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-unn-green-mid/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
            Faculties & Departments
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.02em] text-white">
            Every school. Every story.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
            Explore alumni communities organised by faculty — find your cohort,
            reconnect with lecturers&apos; lineages, and support departmental
            causes.
          </p>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-sm bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty) => (
            <li
              key={faculty.name}
              className="bg-unn-green-deep p-6 transition hover:bg-unn-green"
            >
              <h3 className="font-display text-2xl text-white">
                {faculty.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {faculty.departments}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
