import DashboardPlaceholder from "@/app/components/dashboard/DashboardPlaceholder";

export default function AdminSettingsPage() {
  return (
    <DashboardPlaceholder
      brand="Admin"
      basePath="/admin"
      title="Settings"
      description="Admin workspace preferences. Super Admin–only settings stay in the Super Admin console."
    />
  );
}
