import Link from "next/link";
import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  FolderTree,
  Settings,
  FileText,
  ShieldAlert,
  Home,
  Mail,
  ScrollText,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  // Badge counts (best-effort; never block the admin shell on a DB hiccup).
  const [pendingUsers, needsReview] = await Promise.all([
    prisma.user
      .count({ where: { approvalStatus: "PENDING_APPROVAL", role: { not: "ADMIN" } } })
      .catch(() => 0),
    prisma.thread
      .count({ where: { needsReview: true } })
      .then((t) =>
        prisma.reply
          .count({ where: { needsReview: true } })
          .then((r) => t + r)
          .catch(() => t),
      )
      .catch(() => 0),
  ]);

  const nav = [
    { href: "/admin", label: "Yfirlit", icon: LayoutDashboard, badge: 0 },
    { href: "/admin/pages", label: "Síður (texti)", icon: FileText, badge: 0 },
    { href: "/admin/threads", label: "Þræðir", icon: MessagesSquare, badge: 0 },
    {
      href: "/admin/moderation",
      label: "Nafnagreining",
      icon: ShieldAlert,
      badge: needsReview,
    },
    { href: "/admin/notendur", label: "Notendur", icon: Users, badge: pendingUsers },
    { href: "/admin/flokkar", label: "Flokkar", icon: FolderTree, badge: 0 },
    { href: "/admin/nafnaskra", label: "Nafnaskrá", icon: ScrollText, badge: 0 },
    { href: "/admin/stillingar", label: "Stillingar", icon: Settings, badge: 0 },
    {
      href: "/admin/settings",
      label: "Tölvupóstur & API",
      icon: Mail,
      badge: 0,
    },
  ];

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Stjórnkerfi
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/"
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Á vefinn
            </Link>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
