"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { EmailSettings } from "./EmailSettings";
import { ApiKeySettings } from "./ApiKeySettings";
import { AiPromptSettings } from "./AiPromptSettings";
import { RegistrationSettings } from "./RegistrationSettings";

type Tab = "email" | "api-keys" | "ai-prompt" | "registration";

const TABS: [Tab, string][] = [
  ["email", "Tölvupóstur"],
  ["api-keys", "API Lyklar"],
  ["ai-prompt", "AI Prompt"],
  ["registration", "Skráningar"],
];

export default function AdminSettingsV2Page() {
  const [tab, setTab] = useState<Tab>("email");

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Stillingar</h1>
      <p className="mt-2 text-muted-foreground">
        Tölvupóstur, API lyklar og AI kerfis-prompt.
      </p>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-3xl">
        {tab === "email" && <EmailSettings />}
        {tab === "api-keys" && <ApiKeySettings />}
        {tab === "ai-prompt" && <AiPromptSettings />}
        {tab === "registration" && <RegistrationSettings />}
      </div>
    </div>
  );
}
