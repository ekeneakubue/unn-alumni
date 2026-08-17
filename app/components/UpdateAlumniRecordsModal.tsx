"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminAlumniView } from "@/lib/alumni";
import { getAllCountries, getStatesForCountry } from "@/lib/locations";
import { resolveAvatarSrc } from "@/lib/avatar-url";

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
const COUNTRIES = getAllCountries();

type FormState = {
  avatarUrl: string;
  registrationNumber: string;
  faculty: string;
  department: string;
  graduationYear: string;
  surname: string;
  firstName: string;
  otherNames: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  stateOfOrigin: string;
  homeTown: string;
  countryOfResidence: string;
  stateOfResidence: string;
  password: string;
  confirmPassword: string;
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
    dateOfBirth: "",
    email: "",
    phone: "",
    countryOfOrigin: "",
    stateOfOrigin: "",
    homeTown: "",
    countryOfResidence: "",
    stateOfResidence: "",
    password: "",
    confirmPassword: "",
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
    dateOfBirth: alumni.dateOfBirth ?? "",
    email: alumni.email ?? "",
    phone: alumni.phone ?? "",
    countryOfOrigin: alumni.countryOfOrigin ?? "",
    stateOfOrigin: alumni.stateOfOrigin ?? "",
    homeTown: alumni.homeTown ?? "",
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
    dateOfBirth: form.dateOfBirth.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    countryOfOrigin: form.countryOfOrigin.trim() || null,
    stateOfOrigin: form.stateOfOrigin.trim() || null,
    homeTown: form.homeTown.trim() || null,
    countryOfResidence: form.countryOfResidence.trim() || null,
    stateOfResidence: form.stateOfResidence.trim() || null,
    password: form.password.trim() || null,
  };
}

type FacultyOption = {
  name: string;
  departments: string[];
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

export type UpdateAlumniRecordsModalProps = {
  open: boolean;
  onClose: () => void;
  alumni: AdminAlumniView;
  formFaculties: FacultyOption[];
  onSaved?: (alumni: AdminAlumniView) => void;
};

export default function UpdateAlumniRecordsModal({
  open,
  onClose,
  alumni,
  formFaculties,
  onSaved,
}: UpdateAlumniRecordsModalProps) {
  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const avatarCameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const avatarPreviewObjectUrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  const formDepartments = useMemo(() => {
    const faculty = formFaculties.find(
      (item) => item.name === (form?.faculty ?? ""),
    );
    const departments = faculty?.departments ?? [];
    if (form?.department && !departments.includes(form.department)) {
      return [form.department, ...departments];
    }
    return departments;
  }, [formFaculties, form?.faculty, form?.department]);

  const facultyOptions = useMemo(() => {
    if (
      form?.faculty &&
      !formFaculties.some((item) => item.name === form.faculty)
    ) {
      return [
        { name: form.faculty, departments: formDepartments },
        ...formFaculties,
      ];
    }
    return formFaculties;
  }, [formFaculties, form?.faculty, formDepartments]);

  const originStates = useMemo(
    () => getStatesForCountry(form?.countryOfOrigin ?? ""),
    [form?.countryOfOrigin],
  );

  const residenceStates = useMemo(
    () => getStatesForCountry(form?.countryOfResidence ?? ""),
    [form?.countryOfResidence],
  );

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
    setCameraError("");
  }

  function clearAvatarPreviewObjectUrl() {
    if (avatarPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewObjectUrlRef.current);
      avatarPreviewObjectUrlRef.current = null;
    }
  }

  function resetTransientState() {
    stopCamera();
    setSaveError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearAvatarPreviewObjectUrl();
    setAvatarPreviewUrl("");
    setForm(null);
  }

  function handleClose() {
    resetTransientState();
    onClose();
  }

  useEffect(() => {
    if (!open) {
      resetTransientState();
      return;
    }

    clearAvatarPreviewObjectUrl();
    setAvatarPreviewUrl(resolveAvatarSrc(alumni.avatarUrl));
    setForm(toFormState(alumni));
    setSaveError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync form when modal opens for this alumni
  }, [open, alumni.id]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  function setLocalAvatarPreview(file: File) {
    clearAvatarPreviewObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarPreviewObjectUrlRef.current = objectUrl;
    setAvatarPreviewUrl(objectUrl);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      if (!current) return current;
      if (key === "faculty") {
        return { ...current, faculty: value as string, department: "" };
      }
      if (key === "countryOfOrigin") {
        return {
          ...current,
          countryOfOrigin: value as string,
          stateOfOrigin: "",
        };
      }
      if (key === "countryOfResidence") {
        return {
          ...current,
          countryOfResidence: value as string,
          stateOfResidence: "",
        };
      }
      return { ...current, [key]: value };
    });
  }

  async function uploadAvatarFile(file: File) {
    setUploadingAvatar(true);
    setSaveError("");
    setLocalAvatarPreview(file);

    try {
      const previousUrl = form?.avatarUrl?.trim() || "";
      const body = new FormData();
      body.set("avatar", file);
      if (previousUrl) {
        body.set("previousUrl", previousUrl);
      }
      const response = await fetch("/api/alumni/avatar", {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error ?? "Could not upload avatar.");
        return;
      }

      if (!data.url || typeof data.url !== "string") {
        setSaveError("Upload succeeded but no image URL was returned.");
        return;
      }

      updateField("avatarUrl", data.url);
      setAvatarPreviewUrl(resolveAvatarSrc(data.url));
      clearAvatarPreviewObjectUrl();
    } catch {
      setSaveError("Avatar upload failed. Check your connection and try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeAvatar() {
    const previousUrl = form?.avatarUrl?.trim() || "";
    setSaveError("");
    setUploadingAvatar(true);

    try {
      if (previousUrl) {
        const response = await fetch("/api/alumni/avatar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousUrl }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setSaveError(
            (data as { error?: string }).error ??
              "Could not remove avatar from storage.",
          );
          return;
        }
      }

      updateField("avatarUrl", "");
      clearAvatarPreviewObjectUrl();
      setAvatarPreviewUrl("");
    } catch {
      setSaveError("Could not remove avatar. Try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !form) return;
    await uploadAvatarFile(file);
  }

  async function openCamera() {
    setCameraError("");
    setSaveError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      avatarCameraRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError("");
      avatarCameraRef.current?.click();
    }
  }

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
  }, [cameraOpen]);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !form) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Mirror to match the preview (scale-x-[-1])
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      setSaveError("Could not capture photo. Try again.");
      return;
    }

    stopCamera();
    await uploadAvatarFile(
      new File([blob], "avatar.jpg", { type: "image/jpeg" }),
    );
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    if (!form.faculty.trim() || !form.department.trim()) {
      setSaveError("Faculty and department are required.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setSaveError("Enter a valid email address.");
      return;
    }

    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();
    if (password || confirmPassword) {
      if (!password) {
        setSaveError("Password is required for account login.");
        return;
      }
      if (password.length < 6) {
        setSaveError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setSaveError("Password and confirm password do not match.");
        return;
      }
    }

    setSaveError("");
    setSaving(true);
    const payload = toPayload(form);

    try {
      const response = await fetch(`/api/alumni/${alumni.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { alumni?: AdminAlumniView; error?: string } = {};
      try {
        data = await response.json();
      } catch {
        setSaveError(
          response.ok
            ? "Saved, but the server response could not be read."
            : "Could not save your updates. Please try again.",
        );
        return;
      }

      if (!response.ok) {
        setSaveError(data.error ?? "Could not save your updates.");
        return;
      }

      if (!data.alumni) {
        setSaveError("Save succeeded but no alumni record was returned.");
        return;
      }

      stopCamera();
      onSaved?.(data.alumni);
      resetTransientState();
      onClose();
    } catch {
      setSaveError("Save failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !form) return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-unn-green-deep/45"
        onClick={handleClose}
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
              Review and update your details. Changes are marked for review.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSave}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5">
            <section>
              <h3 className={`${sectionTitleClass} text-center`}>
                Upload avatar
              </h3>
              <p className={`${sectionHintClass} text-center`}>
                Add a clear profile photo (JPEG, PNG, WebP, or GIF, up to 2MB).
              </p>

              <div className="mt-6 flex flex-col items-center">
                <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-unn-line bg-unn-mist shadow-sm">
                  {cameraOpen ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full scale-x-[-1] object-cover"
                    />
                  ) : avatarPreviewUrl || form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        avatarPreviewUrl || resolveAvatarSrc(form.avatarUrl)
                      }
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-10 w-10 text-unn-muted/60"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-3.6 0-6.75 1.8-6.75 4.05V20h13.5v-1.7c0-2.25-3.15-4.05-6.75-4.05Z" />
                      </svg>
                      <span className="text-xs text-unn-muted">No photo</span>
                    </div>
                  )}
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-unn-green-deep/55 text-xs font-semibold text-white">
                      Uploading…
                    </div>
                  ) : null}
                </div>

                <input
                  ref={avatarUploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
                <input
                  ref={avatarCameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {cameraOpen ? (
                    <>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={capturePhoto}
                        className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                      >
                        Capture
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={() => avatarUploadRef.current?.click()}
                        className={`${buttonClass} border border-unn-green bg-white text-unn-green hover:bg-unn-green-soft disabled:opacity-60`}
                      >
                        Upload photo
                      </button>
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={openCamera}
                        className={`${buttonClass} border border-unn-green bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                      >
                        Take picture
                      </button>
                      {form.avatarUrl || avatarPreviewUrl ? (
                        <button
                          type="button"
                          disabled={uploadingAvatar}
                          onClick={() => void removeAvatar()}
                          className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green disabled:opacity-60`}
                        >
                          Remove
                        </button>
                      ) : null}
                    </>
                  )}
                </div>

                {cameraError ? (
                  <p className="mt-3 text-sm text-rose-700">{cameraError}</p>
                ) : null}
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
                      updateField("registrationNumber", event.target.value)
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
                    {facultyOptions.map((faculty) => (
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
                  <span className="font-medium text-unn-ink">First name</span>
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">Other names</span>
                  <input
                    value={form.otherNames}
                    onChange={(event) =>
                      updateField("otherNames", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">Date of birth</span>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      updateField("dateOfBirth", event.target.value)
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
                  <span className="font-medium text-unn-ink">Phone number</span>
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
                  <select
                    value={form.countryOfOrigin}
                    onChange={(event) =>
                      updateField("countryOfOrigin", event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="">Select country</option>
                    {form.countryOfOrigin &&
                    !COUNTRIES.some(
                      (country) => country.name === form.countryOfOrigin,
                    ) ? (
                      <option value={form.countryOfOrigin}>
                        {form.countryOfOrigin}
                      </option>
                    ) : null}
                    {COUNTRIES.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">
                    State of origin
                  </span>
                  <select
                    value={form.stateOfOrigin}
                    onChange={(event) =>
                      updateField("stateOfOrigin", event.target.value)
                    }
                    disabled={!form.countryOfOrigin}
                    className={`${fieldClass} disabled:bg-unn-mist disabled:text-unn-muted`}
                  >
                    <option value="">
                      {form.countryOfOrigin
                        ? originStates.length > 0
                          ? "Select state"
                          : "No states listed"
                        : "Select country first"}
                    </option>
                    {form.stateOfOrigin &&
                    !originStates.includes(form.stateOfOrigin) ? (
                      <option value={form.stateOfOrigin}>
                        {form.stateOfOrigin}
                      </option>
                    ) : null}
                    {originStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  <span className="font-medium text-unn-ink">Home town</span>
                  <input
                    value={form.homeTown}
                    onChange={(event) =>
                      updateField("homeTown", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">
                    Country of residence
                  </span>
                  <select
                    value={form.countryOfResidence}
                    onChange={(event) =>
                      updateField("countryOfResidence", event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="">Select country</option>
                    {form.countryOfResidence &&
                    !COUNTRIES.some(
                      (country) => country.name === form.countryOfResidence,
                    ) ? (
                      <option value={form.countryOfResidence}>
                        {form.countryOfResidence}
                      </option>
                    ) : null}
                    {COUNTRIES.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">
                    State of residence
                  </span>
                  <select
                    value={form.stateOfResidence}
                    onChange={(event) =>
                      updateField("stateOfResidence", event.target.value)
                    }
                    disabled={!form.countryOfResidence}
                    className={`${fieldClass} disabled:bg-unn-mist disabled:text-unn-muted`}
                  >
                    <option value="">
                      {form.countryOfResidence
                        ? residenceStates.length > 0
                          ? "Select state"
                          : "No states listed"
                        : "Select country first"}
                    </option>
                    {form.stateOfResidence &&
                    !residenceStates.includes(form.stateOfResidence) ? (
                      <option value={form.stateOfResidence}>
                        {form.stateOfResidence}
                      </option>
                    ) : null}
                    {residenceStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-unn-line pt-8">
              <h3 className={sectionTitleClass}>Account login details</h3>
              <p className={sectionHintClass}>
                Leave blank to keep your current password, or enter a new one.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="Leave blank to keep current"
                      className={`${fieldClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-unn-muted transition hover:text-unn-green"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </label>
                <label className={labelClass}>
                  <span className="font-medium text-unn-ink">
                    Confirm password
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                      placeholder="Re-enter password"
                      className={`${fieldClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-unn-muted transition hover:text-unn-green"
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                </label>
              </div>
            </section>

            {saveError ? (
              <p
                role="alert"
                className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {saveError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-unn-line px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
            >
              {saving ? "Saving…" : "Save updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
