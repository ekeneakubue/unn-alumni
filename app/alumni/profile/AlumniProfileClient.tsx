"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UpdateAlumniRecordsModal from "@/app/components/UpdateAlumniRecordsModal";
import type { AdminAlumniView } from "@/lib/alumni";
import { alumniInitials } from "@/lib/alumni-display";
import { resolveAvatarSrc } from "@/lib/avatar-url";

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-unn-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-unn-ink">{value?.trim() || "—"}</dd>
    </div>
  );
}

type FacultyOption = {
  name: string;
  departments: string[];
};

export default function AlumniProfileClient({
  alumni,
  formFaculties,
}: {
  alumni: AdminAlumniView;
  formFaculties: FacultyOption[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const initials = alumniInitials(alumni);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unn-green-mid">
        Profile
      </p>
      <h1 className="mt-2 font-display text-3xl text-unn-ink md:text-4xl">
        Your alumni record
      </h1>
      <p className="mt-2 text-sm text-unn-muted">
        Review your details. Use Update record to make changes.
      </p>

      <div className="mt-8 flex flex-col gap-4 border-b border-unn-line pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-unn-line bg-unn-mist">
            {alumni.avatarUrl ? (
              <Image
                src={resolveAvatarSrc(alumni.avatarUrl)}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-unn-green">
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-unn-ink">{alumni.fullName}</p>
            <p className="mt-0.5 text-sm text-unn-muted">{alumni.status}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-11 items-center justify-center bg-unn-green px-5 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
        >
          Update your record
        </button>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-unn-ink">Academic records</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Registration number" value={alumni.registrationNumber} />
          <Detail
            label="Graduation year"
            value={
              alumni.graduationYear === null
                ? null
                : String(alumni.graduationYear)
            }
          />
          <Detail label="Faculty" value={alumni.faculty} />
          <Detail label="Department" value={alumni.department} />
        </dl>
      </section>

      <section className="mt-10 border-t border-unn-line pt-8">
        <h2 className="font-display text-2xl text-unn-ink">Personal records</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Surname" value={alumni.surname} />
          <Detail label="First name" value={alumni.firstName} />
          <Detail label="Other names" value={alumni.otherNames} />
          <Detail label="Date of birth" value={alumni.dateOfBirth} />
          <Detail label="Email" value={alumni.email} />
          <Detail label="Phone" value={alumni.phone} />
          <Detail label="Country of origin" value={alumni.countryOfOrigin} />
          <Detail label="State of origin" value={alumni.stateOfOrigin} />
          <Detail label="Home town" value={alumni.homeTown} />
          <Detail
            label="Country of residence"
            value={alumni.countryOfResidence}
          />
          <Detail label="State of residence" value={alumni.stateOfResidence} />
        </dl>
      </section>

      <UpdateAlumniRecordsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alumni={alumni}
        formFaculties={formFaculties}
        onSaved={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
