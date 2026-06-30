import Link from "next/link";
import Image from "next/image";

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
          <Link
            href="/"
            aria-label="EkkiEinn.is — forsíða"
            className="mb-6 flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="EkkiEinn.is"
              width={358}
              height={273}
              className="h-12 w-auto"
            />
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
