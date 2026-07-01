"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Eye, ShieldCheck, Loader2, AlertTriangle, Wand2 } from "lucide-react";

import {
  createThread,
  previewAnonymize,
  type ThreadState,
} from "@/app/samfelag/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function NewThreadForm({ categorySlug }: { categorySlug: string }) {
  const [state, formAction] = useFormState<ThreadState, FormData>(
    createThread,
    undefined,
  );
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<{
    anonymized: string;
    namesFound: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [autoSubmit, setAutoSubmit] = useState(false);

  function handlePreview() {
    startTransition(async () => {
      const result = await previewAnonymize(content);
      setPreview(result);
    });
  }

  // Accept the [Nafn] suggestion: replace the text and resubmit for re-check.
  function acceptSuggestion() {
    if (!state?.suggestion) return;
    setContent(state.suggestion);
    setAutoSubmit(true);
  }

  // After the content state has been applied to the DOM, submit the form.
  useEffect(() => {
    if (autoSubmit) {
      setAutoSubmit(false);
      formRef.current?.requestSubmit();
    }
  }, [autoSubmit, content]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <input
        type="hidden"
        name="pendingThreadId"
        value={state?.pendingThreadId ?? ""}
      />

      {state?.pendingReview && (
        <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            Þráðurinn bíður samþykktar
          </p>
          <p className="text-sm text-foreground/90">
            Sjálfvirk yfirferð fann atriði sem þarf að laga áður en þráðurinn
            birtist:
          </p>
          {state.reasons && state.reasons.length > 0 && (
            <ul className="list-inside list-disc text-sm text-amber-200">
              {state.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}

          {/* Tillaga — name replacement suggestion */}
          {state.suggestion && state.suggestion !== content && (
            <div className="rounded-md border border-amber-500/30 bg-background/40 p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                📝 Tillaga — nöfn skipt út fyrir <code>[Nafn]</code>:
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                {state.suggestion}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  <Wand2 className="h-4 w-4" />
                  Samþykkja tillögu
                </button>
                <button
                  type="button"
                  onClick={() => contentRef.current?.focus()}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-secondary"
                >
                  Breyta sjálf/ur
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Þú getur líka notað dulnefni eða skammstafanir (t.d. &quot;J.&quot; eða
            &quot;fyrrverandi mín&quot;) og sent aftur.
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="title">Titill</Label>
        <Input id="title" name="title" placeholder="Um hvað viltu ræða?" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Skilaboð</Label>
        <Textarea
          id="content"
          name="content"
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Deildu reynslu þinni eða spurningu..."
          required
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Nöfn eru sjálfkrafa fjarlægð úr textanum áður en hann birtist.
          </p>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isPending || content.trim().length < 1}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            Forskoða nafnleynd
          </button>
        </div>
      </div>

      {preview && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            {preview.namesFound.length > 0
              ? "Nafn/nöfn hafa verið fjarlægð til að vernda nafnleynd"
              : "Engin nöfn fundust — textinn birtist óbreyttur"}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            {preview.anonymized}
          </p>
        </div>
      )}

      {/* Private fields — never shown publicly */}
      <div className="rounded-lg border border-border bg-surface/40 p-4">
        <p className="text-sm font-medium">Trúnaðarupplýsingar (valfrjálst)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="victimName">Nafn þolanda</Label>
            <Input id="victimName" name="victimName" maxLength={120} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="perpetratorName">Nafn geranda</Label>
            <Input id="perpetratorName" name="perpetratorName" maxLength={120} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Þessar upplýsingar eru einungis notaðar til lögfræðilegrar aðstoðar ef
          fleiri mál um sama geranda berast til okkar. Þær verða aldrei sýnilegar
          á þræðinum.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isAnonymous"
          defaultChecked
          className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
        />
        Birta þráðinn nafnlaust
      </label>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Senda inn</SubmitButton>
    </form>
  );
}
