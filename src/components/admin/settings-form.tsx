"use client";

import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { saveSettings, type SettingsState } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function SettingsForm({
  values,
}: {
  values: {
    verify_email_subject: string;
    verify_email_body: string;
    admin_notification_email: string;
  };
}) {
  const [state, formAction] = useFormState<SettingsState, FormData>(
    saveSettings,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
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
