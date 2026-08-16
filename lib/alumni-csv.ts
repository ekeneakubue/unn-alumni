export type AlumniCsvRow = {
  registrationNumber: string | null;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  graduationYear: number | null;
  faculty: string | null;
  department: string | null;
  countryOfOrigin: string | null;
  stateOfOrigin: string | null;
  town: string | null;
  countryOfResidence: string | null;
  stateOfResidence: string | null;
  email: string | null;
  phone: string | null;
};

export type AlumniCsvParseResult = {
  rows: AlumniCsvRow[];
  totalRows: number;
  errors: string[];
};

/** Alumni model fields used for CSV import (excludes id/status/timestamps/avatar). */
export const ALUMNI_MODEL_CSV_FIELDS = [
  { key: "registrationNumber" },
  { key: "surname" },
  { key: "firstName" },
  { key: "otherNames" },
  { key: "graduationYear" },
  { key: "faculty" },
  { key: "department" },
  { key: "countryOfOrigin" },
  { key: "stateOfOrigin" },
  { key: "town" },
  { key: "countryOfResidence" },
  { key: "stateOfResidence" },
  { key: "email" },
  { key: "phone" },
] as const satisfies ReadonlyArray<{
  key: keyof AlumniCsvRow;
}>;

export const ALUMNI_CSV_COLUMN_HINT = ALUMNI_MODEL_CSV_FIELDS.map(
  (field) => field.key,
).join(", ");

/** Spreadsheet labels that differ from Alumni model field names. */
const HEADER_ALIASES: Record<string, keyof AlumniCsvRow> = {
  emailaddress: "email",
  phoneno: "phone",
  phonenumber: "phone",
  regno: "registrationNumber",
  registrationno: "registrationNumber",
  middlename: "otherNames",
  othername: "otherNames",
  yearofentry: "graduationYear",
  entryyear: "graduationYear",
  yearofgraduation: "graduationYear",
  graduationyear: "graduationYear",
  nationality: "countryOfOrigin",
  country: "countryOfOrigin",
  lga: "town",
  localgovernment: "town",
  localgovernmentoforigin: "town",
  townoforigin: "town",
};

function normalizeHeaderKey(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveHeaderField(header: string): keyof AlumniCsvRow | undefined {
  const key = normalizeHeaderKey(header);
  if (!key) return undefined;

  const modelMatch = ALUMNI_MODEL_CSV_FIELDS.find(
    (field) => normalizeHeaderKey(field.key) === key,
  );
  if (modelMatch) return modelMatch.key;

  return HEADER_ALIASES[key];
}

function detectDelimiter(headerLine: string) {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const tabs = (headerLine.match(/\t/g) ?? []).length;
  if (tabs > commas && tabs > semicolons) return "\t";
  if (semicolons > commas) return ";";
  return ",";
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseAlumniCsv(
  text: string,
  options?: { previewLimit?: number },
): AlumniCsvParseResult {
  const previewLimit = options?.previewLimit;
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], totalRows: 0, errors: ["CSV file is empty."] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter);
  const fieldIndexes = new Map<keyof AlumniCsvRow, number>();

  headers.forEach((header, index) => {
    let field = resolveHeaderField(header);

    if (!field) {
      const byPosition = ALUMNI_MODEL_CSV_FIELDS[index]?.key;
      if (byPosition && !fieldIndexes.has(byPosition)) {
        field = byPosition;
      }
    }

    if (field && !fieldIndexes.has(field)) {
      fieldIndexes.set(field, index);
    }
  });

  if (fieldIndexes.size === 0) {
    return {
      rows: [],
      totalRows: 0,
      errors: [
        `Could not map any Alumni model columns. Found headers: ${headers.join(" | ") || "(none)"}. Expected: ${ALUMNI_CSV_COLUMN_HINT}`,
      ],
    };
  }

  const rows: AlumniCsvRow[] = [];
  const errors: string[] = [];
  let totalRows = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    if (previewLimit !== undefined && rows.length >= previewLimit) {
      totalRows += 1;
      continue;
    }

    const cells = splitCsvLine(lines[lineIndex], delimiter);

    if (cells.every((cell) => !cell.trim())) {
      continue;
    }

    totalRows += 1;

    const get = (field: keyof AlumniCsvRow) => {
      const index = fieldIndexes.get(field);
      if (index === undefined) return "";
      return (cells[index] ?? "").trim();
    };

    const yearRaw = get("graduationYear");
    const yearParsed = yearRaw ? Number.parseInt(yearRaw, 10) : NaN;
    const graduationYear = Number.isFinite(yearParsed) ? yearParsed : null;
    const emailRaw = emptyToNull(get("email"));

    rows.push({
      registrationNumber: emptyToNull(get("registrationNumber")),
      surname: emptyToNull(get("surname")),
      firstName: emptyToNull(get("firstName")),
      otherNames: emptyToNull(get("otherNames")),
      graduationYear,
      faculty: emptyToNull(get("faculty")),
      department: emptyToNull(get("department")),
      countryOfOrigin: emptyToNull(get("countryOfOrigin")),
      stateOfOrigin: emptyToNull(get("stateOfOrigin")),
      town: emptyToNull(get("town")),
      countryOfResidence: emptyToNull(get("countryOfResidence")),
      stateOfResidence: emptyToNull(get("stateOfResidence")),
      email: emailRaw ? emailRaw.toLowerCase() : null,
      phone: emptyToNull(get("phone")),
    });
  }

  if (totalRows === 0) {
    errors.push("No data rows found in CSV.");
  }

  return { rows, totalRows, errors };
}
