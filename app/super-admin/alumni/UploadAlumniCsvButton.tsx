"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  parseAlumniCsv,
  ALUMNI_CSV_COLUMN_HINT,
  type AlumniCsvRow,
} from "@/lib/alumni-csv";

const buttonClass =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold transition";

const PREVIEW_LIMIT = 50;

const PREVIEW_COLUMNS: { key: keyof AlumniCsvRow; label: string }[] = [
  { key: "registrationNumber", label: "Reg. No." },
  { key: "surname", label: "Surname" },
  { key: "firstName", label: "First name" },
  { key: "otherNames", label: "Other names" },
  { key: "graduationYear", label: "Grad. year" },
  { key: "faculty", label: "Faculty" },
  { key: "department", label: "Department" },
  { key: "countryOfOrigin", label: "Country of origin" },
  { key: "stateOfOrigin", label: "State of origin" },
  { key: "town", label: "Town" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

export default function UploadAlumniCsvButton({
  onImported,
}: {
  onImported?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<AlumniCsvRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function closePreview() {
    setPreviewOpen(false);
    setPreviewRows([]);
    setTotalRows(0);
    setParseErrors([]);
    setImportError("");
    setFileName(null);
    fileRef.current = null;
    resetInput();
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      window.alert("Please select a .csv file.");
      resetInput();
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseAlumniCsv(text, { previewLimit: PREVIEW_LIMIT });
      fileRef.current = file;
      setFileName(file.name);
      setPreviewRows(parsed.rows);
      setTotalRows(parsed.totalRows);
      setParseErrors(parsed.errors);
      setImportError("");
      setPreviewOpen(true);
    } catch {
      window.alert("Could not read that CSV file.");
      resetInput();
    }
  }

  async function confirmImport() {
    const file = fileRef.current;
    if (!file || totalRows === 0) return;

    setImporting(true);
    setImportError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/alumni", {
        method: "POST",
        body: form,
      });
      const data = await response.json();

      if (!response.ok) {
        setImportError(data.error ?? "Import failed.");
        return;
      }

      closePreview();
      onImported?.();
    } catch {
      setImportError("Import failed. Check your connection and try again.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
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
          className="inline-flex h-11 items-center rounded-[10px] bg-unn-green px-4 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
        >
          Upload Alumni CSV
        </button>

        <p className="max-w-md text-right text-xs text-unn-muted">
          Expected Alumni model columns: {ALUMNI_CSV_COLUMN_HINT}
        </p>
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close preview overlay"
            className="absolute inset-0 bg-unn-green-deep/45"
            onClick={closePreview}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="alumni-csv-preview-title"
            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col rounded-[10px] border border-unn-line bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-unn-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unn-green-mid">
                  Alumni CSV
                </p>
                <h2
                  id="alumni-csv-preview-title"
                  className="mt-2 font-display text-3xl text-unn-ink"
                >
                  Preview before upload
                </h2>
                <p className="mt-2 text-sm text-unn-muted">
                  {fileName ? (
                    <>
                      File:{" "}
                      <span className="font-medium text-unn-ink">{fileName}</span>
                      {" · "}
                    </>
                  ) : null}
                  {totalRows} row{totalRows === 1 ? "" : "s"} ready to upload
                  {totalRows > previewRows.length
                    ? ` · showing first ${previewRows.length}`
                    : null}
                  {parseErrors.length > 0
                    ? ` · ${parseErrors.length} note${parseErrors.length === 1 ? "" : "s"} (ignored on import)`
                    : null}
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-unn-line text-unn-muted transition hover:border-unn-green hover:text-unn-ink"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
              {parseErrors.length > 0 ? (
                <div className="mb-4 rounded-[10px] border border-unn-line bg-unn-mist/60 px-4 py-3 text-sm text-unn-muted">
                  <p className="font-semibold text-unn-ink">
                    Notes (will not block upload)
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {parseErrors.slice(0, 8).map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                    {parseErrors.length > 8 ? (
                      <li>…and {parseErrors.length - 8} more</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {previewRows.length > 0 ? (
                <div className="overflow-x-auto rounded-[10px] border border-unn-line">
                  <table className="w-full min-w-[72rem] text-left text-sm">
                    <thead className="bg-unn-mist/80 text-xs uppercase tracking-[0.12em] text-unn-muted">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">#</th>
                        {PREVIEW_COLUMNS.map((column) => (
                          <th
                            key={column.key}
                            className="px-3 py-2.5 font-semibold"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, index) => (
                        <tr
                          key={`${row.registrationNumber ?? "row"}-${index}`}
                          className="border-t border-unn-line/80"
                        >
                          <td className="px-3 py-2.5 text-unn-muted">
                            {index + 1}
                          </td>
                          {PREVIEW_COLUMNS.map((column) => (
                            <td
                              key={column.key}
                              className="max-w-[12rem] truncate px-3 py-2.5 text-unn-ink"
                              title={String(row[column.key] ?? "")}
                            >
                              {row[column.key] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="font-display text-2xl text-unn-ink">
                    Nothing to import
                  </p>
                  <p className="mt-2 text-sm text-unn-muted">
                    Choose another CSV file and try again.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-unn-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              {importError ? (
                <p className="text-sm text-rose-700">{importError}</p>
              ) : (
                <p className="text-sm text-unn-muted">
                  Confirm uploads the full CSV file. Duplicates are skipped.
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closePreview}
                  className={`${buttonClass} border border-unn-line bg-white text-unn-ink hover:border-unn-green`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmImport}
                  disabled={importing || totalRows === 0}
                  className={`${buttonClass} bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
                >
                  {importing
                    ? "Importing…"
                    : `Confirm upload (${totalRows})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
