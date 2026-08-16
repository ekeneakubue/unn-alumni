"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AdminAlumniView } from "@/lib/alumni";
import { FACULTIES, getDepartmentsForFaculty } from "@/lib/faculties";

const fieldClass =
  "h-11 w-full border border-unn-line bg-white px-3 text-sm outline-none transition focus:border-unn-green";
const labelClass = "grid gap-2 text-sm";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold transition";
const sectionTitleClass =
  "font-display text-xl text-unn-ink md:text-[1.35rem]";
const sectionHintClass = "mt-1 text-sm text-unn-muted";

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from(
  { length: CURRENT_YEAR - 1959 },
  (_, index) => CURRENT_YEAR - index,
);

type FormState = {
  avatarUrl: string;
  registrationNumber: string;
  faculty: string;
  department: string;
  graduationYear: string;
  surname: string;
  firstName: string;
  otherNames: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  stateOfOrigin: string;
  town: string;
  countryOfResidence: string;
  stateOfResidence: string;
};

function emptyForm(partial?: Partial<FormState>): FormState {
  return {
    avatarUrl: "",
    registrationNumber: "",
    faculty: "",
    department: "",
    graduationYear: "",
    surname: "",
    firstName: "",
    otherNames: "",
    email: "",
    phone: "",
    countryOfOrigin: "",
    stateOfOrigin: "",
    town: "",
    countryOfResidence: "",
    stateOfResidence: "",
    ...partial,
  };
}

function toFormState(alumni: AdminAlumniView): FormState {
  return emptyForm({
    avatarUrl: alumni.avatarUrl ?? "",
    registrationNumber: alumni.registrationNumber ?? "",
    faculty: alumni.faculty ?? "",
    department: alumni.department ?? "",
    graduationYear:
      alumni.graduationYear === null || alumni.graduationYear === undefined
        ? ""
        : String(alumni.graduationYear),
    surname: alumni.surname ?? "",
    firstName: alumni.firstName ?? "",
    otherNames: alumni.otherNames ?? "",
    email: alumni.email ?? "",
    phone: alumni.phone ?? "",
    countryOfOrigin: alumni.countryOfOrigin ?? "",
    stateOfOrigin: alumni.stateOfOrigin ?? "",
    town: alumni.town ?? "",
    countryOfResidence: alumni.countryOfResidence ?? "",
    stateOfResidence: alumni.stateOfResidence ?? "",
  });
}

function toPayload(form: FormState) {
  return {
    avatarUrl: form.avatarUrl.trim() || null,
    registrationNumber: form.registrationNumber.trim() || null,
    faculty: form.faculty.trim() || null,
    department: form.department.trim() || null,
    graduationYear: form.graduationYear.trim() || null,
    surname: form.surname.trim() || null,
    firstName: form.firstName.trim() || null,
    otherNames: form.otherNames.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    countryOfOrigin: form.countryOfOrigin.trim() || null,
    stateOfOrigin: form.stateOfOrigin.trim() || null,
    town: form.town.trim() || null,
    countryOfResidence: form.countryOfResidence.trim() || null,
    stateOfResidence: form.stateOfResidence.trim() || null,
  };
}

export default function VerifyRecordClient() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [lookupFaculty, setLookupFaculty] = useState("");
  const [lookupDepartment, setLookupDepartment] = useState("");
  const [lookupRegistration, setLookupRegistration] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [alumniId, setAlumniId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastSaveWasCreate, setLastSaveWasCreate] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const lookupDepartments = useMemo(
    () => getDepartmentsForFaculty(lookupFaculty),
    [lookupFaculty],
  );

  const formDepartments = useMemo(
    () => getDepartmentsForFaculty(form?.faculty ?? ""),
    [form?.faculty],
  );

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modalOpen]);

  function closeModal() {
    setModalOpen(false);
    setSaveError("");
    if (!saved) {
      setForm(null);
      setAlumniId(null);
      setIsNewRecord(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      if (!current) return current;
      if (key === "faculty") {
        return { ...current, faculty: value as string, department: "" };
      }
      return { ...current, [key]: value };
    });
    setSaved(false);
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !form) return;

    setUploadingAvatar(true);
    setSaveError("");

    try {
      const body = new FormData();
      body.set("avatar", file);
      const response = await fetch("/api/alumni/avatar", {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error ?? "Could not upload avatar.");
        return;
      }

      updateField("avatarUrl", data.url as string);
    } catch {
      setSaveError("Avatar upload failed. Check your connection and try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupError("");
    setNotFound(false);
    setSaved(false);
    setIsNewRecord(false);
    setModalOpen(false);
    setLookingUp(true);

    try {
      const params = new URLSearchParams();
      params.set("faculty", lookupFaculty.trim());
      params.set("department", lookupDepartment.trim());
      if (lookupRegistration.trim()) {
        params.set("registrationNumber", lookupRegistration.trim());
      }
      if (lookupEmail.trim()) {
        params.set("email", lookupEmail.trim());
      }

      const response = await fetch(`/api/alumni/lookup?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setAlumniId(null);
        setForm(null);
        setModalOpen(false);
        setLookupError(data.error ?? "Could not find that record.");
        setNotFound(response.status === 404);
        return;
      }

      const alumni = data.alumni as AdminAlumniView;
      setAlumniId(alumni.id);
      setForm(toFormState(alumni));
      setNotFound(false);
      setIsNewRecord(false);
      setSaved(false);
      setSaveError("");
      setModalOpen(true);
    } catch {
      setLookupError("Lookup failed. Check your connection and try again.");
      setNotFound(false);
    } finally {
      setLookingUp(false);
    }
  }

  function openNewRecordForm() {
    setAlumniId(null);
    setIsNewRecord(true);
    setSaved(false);
    setSaveError("");
    setForm(
      emptyForm({
        faculty: lookupFaculty,
        department: lookupDepartment,
        registrationNumber: lookupRegistration,
        email: lookupEmail,
      }),
    );
    setModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    if (!form.faculty.trim() || !form.department.trim()) {
      setSaveError("Faculty and department are required.");
      return;
    }

    setSaveError("");
    setSaving(true);
    const creating = !alumniId;
    const payload = toPayload(form);

    try {
      const response = await fetch(
        alumniId ? `/api/alumni/${alumniId}` : "/api/alumni",
        {
          method: alumniId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alumniId ? payload : { alumni: payload }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error ?? "Could not save your updates.");
        return;
      }

      const alumni = data.alumni as AdminAlumniView;
      setAlumniId(alumni.id);
      setForm(toFormState(alumni));
      setIsNewRecord(false);
      setNotFound(false);
      setLookupError("");
      setLastSaveWasCreate(creating);
      setSaved(true);
    } catch {
      setSaveError("Save failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const canLookup =
    Boolean(lookupFaculty.trim()) &&
    Boolean(lookupDepartment.trim()) &&
    Boolean(lookupRegistration.trim() || lookupEmail.trim());

  return (
    <div className="min-h-svh overflow-x-hidden bg-unn-mist">
      <header className="border-b border-unn-line bg-unn-green-deep text-white">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-5 md:h-[4.75rem] md:px-8">
          <Link href="/" scroll={false} className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="University of Nigeria crest"
              width={44}
              height={44}
              className="h-10 w-10 object-contain md:h-11 md:w-11"
              priority
            />
            <span className="leading-tight">
              <span className="block font-display text-xl tracking-wide md:text-[1.35rem]">
                UNN Alumni
              </span>
              <span className="hidden text-[0.68rem] uppercase tracking-[0.18em] text-white/70 sm:block">
                University of Nigeria
              </span>
            </span>
          </Link>
          <Link
            href="/"
            scroll={false}
            className="text-sm font-medium text-white/85 transition hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-10 md:px-8 md:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-unn-green-mid">
          Alumni records
        </p>

        <form
          onSubmit={handleLookup}
          className="mt-10 border border-unn-line bg-white p-6 md:p-8"
        >
          <h2 className="font-display text-2xl text-unn-ink">Find your record</h2>
          <p className="mt-2 text-sm text-unn-muted">
            Faculty and department are required. Also enter a registration
            number or email.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              <span className="font-medium text-unn-ink">
                Faculty <span className="text-rose-600">*</span>
              </span>
              <select
                required
                value={lookupFaculty}
                onChange={(event) => {
                  setLookupFaculty(event.target.value);
                  setLookupDepartment("");
                }}
                className={fieldClass}
              >
                <option value="">Select faculty</option>
                {FACULTIES.map((faculty) => (
                  <option key={faculty.name} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              <span className="font-medium text-unn-ink">
                Department <span className="text-rose-600">*</span>
              </span>
              <select
                required
                value={lookupDepartment}
                onChange={(event) => setLookupDepartment(event.target.value)}
                disabled={!lookupFaculty}
                className={`${fieldClass} disabled:bg-unn-mist disabled:text-unn-muted`}
              >
                <option value="">
                  {lookupFaculty ? "Select department" : "Select faculty first"}
                </option>
                {lookupDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              <span className="font-medium text-unn-ink">Registration number</span>
              <input
                value={lookupRegistration}
                onChange={(event) => setLookupRegistration(event.target.value)}
                placeholder="e.g. 2015/001234"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              <span className="font-medium text-unn-ink">Email</span>
              <input
                type="email"
                value={lookupEmail}
                onChange={(event) => setLookupEmail(event.target.value)}
                placeholder="email@unn.edu.ng"
                className={fieldClass}
              />
            </label>
          </div>

          {lookupError ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rose-700">{lookupError}</p>
              {notFound ? (
                <button
                  type="button"
                  onClick={openNewRecordForm}
                  className={`${buttonClass} border border-unn-green bg-white text-unn-green hover:bg-unn-green-soft`}
                >
                  Update record
                </button>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={lookingUp || !canLookup}
            className={`${buttonClass} mt-6 bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
          >
            {lookingUp ? "Searching…" : "Find record"}
          </button>
        </form>

        {modalOpen && form ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close modal overlay"
              className="absolute inset-0 bg-unn-green-deep/45"
              onClick={closeModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="update-alumni-records-title"
              className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[10px] border border-unn-line bg-white shadow-xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-unn-line px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                    Alumni records
                  </p>
                  <h2
                    id="update-alumni-records-title"
                    className="mt-2 font-display text-3xl text-unn-ink"
                  >
                    Update Your Alumni Records
                  </h2>
                  <p className="mt-2 text-sm text-unn-muted">
                    {isNewRecord
                      ? "No matching record was found. Fill in your details to submit a new alumni record."
                      : "Review and update your details. Changes are marked for review."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5">
                  <section>
                    <h3 className={sectionTitleClass}>Upload avatar</h3>
                    <p className={sectionHintClass}>
                      Add a clear profile photo (JPEG, PNG, WebP, or GIF, up to
                      2MB).
                    </p>
                    <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-24 w-24 overflow-hidden border border-unn-line bg-unn-mist">
                        {form.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={form.avatarUrl}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-unn-muted">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          onChange={handleAvatarChange}
                        />
                        <button
                          type="button"
                          disabled={uploadingAvatar}
                          onClick={() => avatarInputRef.current?.click()}
                          className={`${buttonClass} border border-unn-green bg-white text-unn-green hover:bg-unn-green-soft disabled:opacity-60`}
                        >
                          {uploadingAvatar
                            ? "Uploading…"
                            : form.avatarUrl
                              ? "Change photo"
                              : "Upload photo"}
                        </button>
                        {form.avatarUrl ? (
                          <button
                            type="button"
                            onClick={() => updateField("avatarUrl", "")}
                            className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-unn-line pt-8">
                    <h3 className={sectionTitleClass}>Academic records</h3>
                    <p className={sectionHintClass}>
                      Your registration and programme details.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Registration number
                        </span>
                        <input
                          value={form.registrationNumber}
                          onChange={(event) =>
                            updateField(
                              "registrationNumber",
                              event.target.value,
                            )
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Year of graduation
                        </span>
                        <select
                          value={form.graduationYear}
                          onChange={(event) =>
                            updateField("graduationYear", event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option value="">Select year</option>
                          {GRADUATION_YEARS.map((year) => (
                            <option key={year} value={String(year)}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Faculty <span className="text-rose-600">*</span>
                        </span>
                        <select
                          required
                          value={form.faculty}
                          onChange={(event) =>
                            updateField("faculty", event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option value="">Select faculty</option>
                          {FACULTIES.map((faculty) => (
                            <option key={faculty.name} value={faculty.name}>
                              {faculty.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Department <span className="text-rose-600">*</span>
                        </span>
                        <select
                          required
                          value={form.department}
                          onChange={(event) =>
                            updateField("department", event.target.value)
                          }
                          disabled={!form.faculty}
                          className={`${fieldClass} disabled:bg-unn-mist disabled:text-unn-muted`}
                        >
                          <option value="">
                            {form.faculty
                              ? "Select department"
                              : "Select faculty first"}
                          </option>
                          {formDepartments.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </section>

                  <section className="border-t border-unn-line pt-8">
                    <h3 className={sectionTitleClass}>Personal records</h3>
                    <p className={sectionHintClass}>
                      Your identity and contact details.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">Surname</span>
                        <input
                          value={form.surname}
                          onChange={(event) =>
                            updateField("surname", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          First name
                        </span>
                        <input
                          value={form.firstName}
                          onChange={(event) =>
                            updateField("firstName", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={`${labelClass} sm:col-span-2`}>
                        <span className="font-medium text-unn-ink">
                          Other names
                        </span>
                        <input
                          value={form.otherNames}
                          onChange={(event) =>
                            updateField("otherNames", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Phone number
                        </span>
                        <input
                          value={form.phone}
                          onChange={(event) =>
                            updateField("phone", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Country of origin
                        </span>
                        <input
                          value={form.countryOfOrigin}
                          onChange={(event) =>
                            updateField("countryOfOrigin", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          State of origin
                        </span>
                        <input
                          value={form.stateOfOrigin}
                          onChange={(event) =>
                            updateField("stateOfOrigin", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">Town</span>
                        <input
                          value={form.town}
                          onChange={(event) =>
                            updateField("town", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={labelClass}>
                        <span className="font-medium text-unn-ink">
                          Country of residence
                        </span>
                        <input
                          value={form.countryOfResidence}
                          onChange={(event) =>
                            updateField(
                              "countryOfResidence",
                              event.target.value,
                            )
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className={`${labelClass} sm:col-span-2`}>
                        <span className="font-medium text-unn-ink">
                          State of residence
                        </span>
                        <input
                          value={form.stateOfResidence}
                          onChange={(event) =>
                            updateField("stateOfResidence", event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                    </div>
                  </section>

                  {saveError ? (
                    <p className="text-sm text-rose-700">{saveError}</p>
                  ) : null}
                  {saved ? (
                    <p className="text-sm text-unn-green">
                      {lastSaveWasCreate
                        ? "Your record was submitted."
                        : "Your record was updated and marked for review."}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-unn-line px-6 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
                  >
                    {saved ? "Close" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingAvatar}
                    className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                  >
                    {saving
                      ? "Saving…"
                      : isNewRecord
                        ? "Submit record"
                        : "Save updates"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
