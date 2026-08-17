import DashboardPlaceholder from "@/app/components/dashboard/DashboardPlaceholder";

export default function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <DashboardPlaceholder
      brand="Super Admin"
      basePath="/super-admin"
      title={title}
      description={description}
    />
  );
}
