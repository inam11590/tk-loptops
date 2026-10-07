import { SettingsFormClient } from "@/app/admin/settings/SettingsFormClient";
import { requireAdminPage } from "@/lib/admin/guard";
import { getSettings } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const settings = getSettings();

  return <SettingsFormClient initialSettings={settings} />;
}
