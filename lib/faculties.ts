export const FACULTIES = [
  {
    name: "Arts",
    departments: [
      "English",
      "History",
      "Fine & Applied Arts",
      "Music",
      "Theatre",
    ],
  },
  {
    name: "Biological Sciences",
    departments: [
      "Biochemistry",
      "Microbiology",
      "Zoology",
      "Plant Science",
    ],
  },
  {
    name: "Business Administration",
    departments: [
      "Accountancy",
      "Banking & Finance",
      "Marketing",
      "Management",
    ],
  },
  {
    name: "Education",
    departments: ["Arts Education", "Science Education", "Adult Education"],
  },
  {
    name: "Engineering",
    departments: [
      "Civil",
      "Electrical",
      "Mechanical",
      "Electronic Engineering",
    ],
  },
  {
    name: "Environmental Studies",
    departments: [
      "Architecture",
      "Estate Management",
      "Urban & Regional Planning",
    ],
  },
  {
    name: "Law",
    departments: [
      "Public & Private Law",
      "International & Comparative Law",
    ],
  },
  {
    name: "Medicine",
    departments: [
      "Medicine & Surgery",
      "Anatomy",
      "Physiology",
      "Medical Lab",
    ],
  },
  {
    name: "Pharmaceutical Sciences",
    departments: ["Clinical Pharmacy", "Pharmacognosy", "Pharmacology"],
  },
  {
    name: "Physical Sciences",
    departments: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
  },
  {
    name: "Social Sciences",
    departments: ["Economics", "Political Science", "Sociology", "Psychology"],
  },
  {
    name: "Veterinary Medicine",
    departments: ["Veterinary Surgery", "Pathology", "Public Health"],
  },
] as const;

export function getDepartmentsForFaculty(facultyName: string) {
  const faculty = FACULTIES.find((item) => item.name === facultyName);
  return faculty ? [...faculty.departments] : [];
}
