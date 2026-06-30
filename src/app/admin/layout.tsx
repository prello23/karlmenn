import Link from "next/link";
import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  FolderTree,
  Settings,
  FileText,
  Home,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth-helpers";

const ADMIN_NAV = [
  { href: "/admin", label: "Yfirlit", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Síður (texti)", icon: FileText },
  { href: "/admin/threads", label: "Þræðir", icon: MessagesSquare },
  { href: "/admin/notendur", label: "Notendur", icon: Users },
  { href: "/admin/flokkar", label: "Flokkar", icon: FolderTree },
  { href: "/admin/stillingar", label: "Stillingar", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

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
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
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
