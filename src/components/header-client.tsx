"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, Settings, ShieldAlert, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/lib/nav";
import { Button } from "@/components/ui/button";

export function HeaderClient({
  isAuthed,
  isAdmin,
  logoutAction,
}: {
  isAuthed: boolean;
  isAdmin: boolean;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Ekki einn</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">
                    <ShieldAlert className="h-4 w-4" />
                    Stjórnkerfi
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/stillingar">
                  <Settings className="h-4 w-4" />
                  Stillingar
                </Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Skrá út
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/innskra">Innskrá</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/skra">Skrá mig</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Valmynd"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthed ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="outline">
                      <Link href="/admin">
                        <ShieldAlert className="h-4 w-4" />
                        Stjórnkerfi
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/stillingar">
                      <Settings className="h-4 w-4" />
                      Stillingar
                    </Link>
                  </Button>
                  <form action={logoutAction}>
                    <Button type="submit" className="w-full" variant="ghost">
                      <LogOut className="h-4 w-4" />
                      Skrá út
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/innskra">Innskrá</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/skra">Skrá mig</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
