import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { SettingsForm } from "./settings-form";

interface PlatformSettings {
  boostPriceKobo: number;
  boostDurationDays: number;
}

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isPlatformAdmin) {
    redirect("/dashboard");
  }

  const settings = await apiFetch<PlatformSettings>("/admin/settings");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Platform settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Controls how much a job or company boost costs and how long it lasts, across the whole platform.
        </p>
      </div>
      <SettingsForm boostPriceKobo={settings.boostPriceKobo} boostDurationDays={settings.boostDurationDays} />
    </div>
  );
}
