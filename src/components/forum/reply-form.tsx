"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

import { createReply, type ThreadState } from "@/app/samfelag/actions";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function ReplyForm({
  threadId,
  categorySlug,
}: {
  threadId: string;
  categorySlug: string;
}) {
  const [state, formAction] = useFormState<ThreadState, FormData>(
    createReply,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful submit (no error returned).
  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <div className="grid gap-2">
        <Label htmlFor="reply-content">Svara</Label>
        <Textarea
          id="reply-content"
          name="content"
          placeholder="Skrifaðu svar..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Vinsamlegast ekki nafngreina fólk. Svör sem innihalda nöfn eru merkt og
          yfirfarin af umsjónarmönnum.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Senda svar</SubmitButton>
    </form>
  );
}
