import { Phone, AlertTriangle } from "lucide-react";

import { CRISIS_LINES } from "@/lib/content";
import { cn } from "@/lib/utils";

export function CrisisResources({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {CRISIS_LINES.map((line) => (
        <a
          key={line.name}
          href={`tel:${line.number.replace(/[^0-9]/g, "")}`}
          className={cn(
            "group flex flex-col rounded-xl border p-5 transition-colors",
            line.urgent
              ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
              : "border-border bg-card hover:bg-surface",
          )}
        >
          <div className="flex items-center gap-2">
            {line.urgent ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Phone className="h-5 w-5 text-primary" />
            )}
            <span
              className={cn(
                "text-2xl font-bold tracking-tight",
                line.urgent ? "text-destructive" : "text-foreground",
              )}
            >
              {line.number}
            </span>
          </div>
          <p className="mt-3 font-medium">{line.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {line.description}
          </p>
        </a>
      ))}
    </div>
  );
}
