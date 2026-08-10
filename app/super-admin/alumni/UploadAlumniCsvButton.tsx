"use client";

import { useRef, useState, type ChangeEvent } from "react";

export default function UploadAlumniCsvButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("idle");
      setFileName(null);
      window.alert("Please select a .csv file.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    window.setTimeout(() => {
      setStatus("done");
    }, 900);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={openPicker}
        disabled={status === "uploading"}
        className="inline-flex h-11 items-center bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "done"
            ? "Upload complete"
            : "Upload Alumni CSV"}
      </button>

      {fileName ? (
        <p className="text-xs text-unn-muted">
          Selected: <span className="font-medium text-unn-ink">{fileName}</span>
          {status === "done" ? " — ready to process" : null}
        </p>
      ) : (
        <p className="text-xs text-unn-muted">
          Expected columns: name, email, faculty, graduation_year
        </p>
      )}
    </div>
  );
}
