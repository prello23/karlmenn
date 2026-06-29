"use client";

import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { saveSettings, type SettingsState } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "@/components/forum/submit-button";

type SettingsValues = {
  verify_email_subject: string;
  verify_email_body: string;
  admin_notification_email: string;
  site_tagline: string;
  about_text: string;
  contact_email: string;
  new_registrations: string;
  require_email_verify: string;
  forum_min_post_length: string;
  welcome_message: string;
  maintenance_mode: string;
};

function Toggle({
  name,
  label,
  helper,
  defaultChecked,
}: {
  name: string;
  label: string;
  helper?: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      htmlFor={name}
      className="flex items-start gap-3 rounded-lg border border-border bg-surface/30 p-3 cursor-pointer"
    >
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {helper && (
          <span className="block text-xs text-muted-foreground">{helper}</span>
        )}
      </span>
    </label>
  );
}

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, formAction] = useFormState<SettingsState, FormData>(
    saveSettings,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Almennt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Almennt</CardTitle>
          <CardDescription>Grunnupplýsingar um síðuna.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="site_tagline">Undirfyrirsögn forsíðu</Label>
            <Input
              id="site_tagline"
              name="site_tagline"
              defaultValue={values.site_tagline}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="about_text">Um síðuna (stutt lýsing)</Label>
            <Textarea
              id="about_text"
              name="about_text"
              defaultValue={values.about_text}
              className="min-h-[90px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_email">Netfang tengiliðar</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={values.contact_email}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skráning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skráning</CardTitle>
          <CardDescription>Stýrðu aðgangi nýrra notenda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            name="new_registrations"
            label="Leyfa nýskráningar"
            helper="Slökktu á þessu til að loka fyrir nýjar skráningar."
            defaultChecked={values.new_registrations !== "false"}
          />
          <Toggle
            name="require_email_verify"
            label="Krefjast staðfestingar á netfangi"
            helper="Notendur þurfa að staðfesta netfang áður en þeir geta birt efni."
            defaultChecked={values.require_email_verify !== "false"}
          />
        </CardContent>
      </Card>

      {/* Vettvangsreglur */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vettvangsreglur</CardTitle>
          <CardDescription>Reglur um þræði og skilaboð.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="forum_min_post_length">
              Lágmarkslengd þráðs (stafir)
            </Label>
            <Input
              id="forum_min_post_length"
              name="forum_min_post_length"
              type="number"
              min={0}
              defaultValue={values.forum_min_post_length}
              className="max-w-[160px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="welcome_message">
              Velkomskilaboð (sýnt nýjum notendum)
            </Label>
            <Textarea
              id="welcome_message"
              name="welcome_message"
              defaultValue={values.welcome_message}
              className="min-h-[90px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tölvupóstur og tilkynningar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tölvupóstur og tilkynningar</CardTitle>
          <CardDescription>
            Texti staðfestingarpósts og netfang fyrir admin-tilkynningar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="verify_email_subject">
              Staðfestingarpóstur — efni (subject)
            </Label>
            <Input
              id="verify_email_subject"
              name="verify_email_subject"
              defaultValue={values.verify_email_subject}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="verify_email_body">Staðfestingarpóstur — texti</Label>
            <Textarea
              id="verify_email_body"
              name="verify_email_body"
              defaultValue={values.verify_email_body}
              className="min-h-[220px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Notaðu <code className="text-primary">{"{{link}}"}</code> þar sem
              staðfestingarlinkurinn á að birtast.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin_notification_email">
              Netfang fyrir admin-tilkynningar
            </Label>
            <Input
              id="admin_notification_email"
              name="admin_notification_email"
              type="email"
              defaultValue={values.admin_notification_email}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kerfið */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kerfið</CardTitle>
          <CardDescription>Stillingar sem hafa áhrif á alla síðuna.</CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle
            name="maintenance_mode"
            label="Viðhaldshamur (lokar aðgang)"
            helper="Þegar kveikt er á þessu er síðunni lokað fyrir almenna notendur."
            defaultChecked={values.maintenance_mode === "true"}
          />
        </CardContent>
      </Card>

      {state?.success && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Stillingar vistaðar.
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Vista stillingar</SubmitButton>
    </form>
  );
}
