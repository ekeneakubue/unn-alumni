import Image from "next/image";

const executives = [
  {
    name: "Dr. Adaobi Okeke",
    role: "National President",
    faculty: "Faculty of Medicine",
    image: "/images/exec-1.jpg",
  },
  {
    name: "Engr. Chinedu Eze",
    role: "Vice President",
    faculty: "Faculty of Engineering",
    image: "/images/exec-2.jpg",
  },
  {
    name: "Barr. Ngozi Umeh",
    role: "General Secretary",
    faculty: "Faculty of Law",
    image: "/images/exec-3.jpg",
  },
  {
    name: "Mr. Ifeanyi Nwosu",
    role: "Financial Secretary",
    faculty: "Faculty of Business Administration",
    image: "/images/exec-4.jpg",
  },
];

export default function Executives() {
  return (
    <section id="executives" className="section-pad bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-unn-green-mid">
            Alumni Executives
          </p>
          <h2 className="section-title mt-3">Leaders serving the lions</h2>
          <p className="section-lead">
            Meet the national executives guiding chapters, programmes, and
            alumni engagement across Nigeria and the diaspora.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {executives.map((person) => (
            <li key={person.name} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-unn-green-soft">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl text-unn-ink">
                {person.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-unn-green">
                {person.role}
              </p>
              <p className="mt-1 text-sm text-unn-muted">{person.faculty}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
