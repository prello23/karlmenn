import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="container relative max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Ekki einn</span>
          </Link>
          <h1 className="text-center text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
