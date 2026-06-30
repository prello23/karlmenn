import Link from "next/link";
import {
  Users,
  MessagesSquare,
  MessageCircle,
  Flag,
  LifeBuoy,
  Heart,
  Bell,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationRead } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [users, threads, replies, flagged, support, donations, notifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.thread.count(),
        prisma.reply.count(),
        prisma.reply.count({ where: { flagged: true } }),
        prisma.supportRequest.count({ where: { status: "OPEN" } }),
        prisma.donation.count(),
        prisma.notification.findMany({
          where: { isRead: false },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);
    return { users, threads, replies, flagged, support, donations, notifications };
  } catch {
    return {
      users: 0,
      threads: 0,
      replies: 0,
      flagged: 0,
      support: 0,
      donations: 0,
      notifications: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Notendur", value: stats.users, icon: Users, href: "/admin/notendur" },
    { label: "Þræðir", value: stats.threads, icon: MessagesSquare, href: "/admin/threads" },
    { label: "Svör", value: stats.replies, icon: MessageCircle, href: "/admin/threads" },
    { label: "Flögguð svör", value: stats.flagged, icon: Flag, href: "/admin/threads" },
    { label: "Opnar stuðningsbeiðnir", value: stats.support, icon: LifeBuoy, href: "/admin" },
    { label: "Framlög", value: stats.donations, icon: Heart, href: "/admin" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Yfirlit</h1>
      <p className="mt-2 text-muted-foreground">
        Stjórnborð EkkiEinn.is.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {card.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="h-5 w-5 text-primary" />
          Tilkynningar
        </h2>
        <div className="mt-4 space-y-3">
          {stats.notifications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-muted-foreground">
              Engar nýjar tilkynningar.
            </p>
          ) : (
            stats.notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Skoða
                    </Link>
                  )}
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Merkja lesið
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
