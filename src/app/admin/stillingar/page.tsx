import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Stillingar</h1>
      <p className="mt-2 text-muted-foreground">
        Stjórnaðu almennum stillingum, skráningu, vettvangsreglum og tölvupósti.
      </p>

      <div className="mt-8 max-w-2xl">
        <SettingsForm values={settings} />
      </div>
    </div>
  );
}
