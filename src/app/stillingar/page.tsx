import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldAlert } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Stillingar",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/innskra?callbackUrl=/stillingar");

  return (
    <>
      <PageHero eyebrow="Aðgangur" title="Stillingar" />
      <section className="py-12">
        <div className="container max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prófíll</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                displayName={user.displayName ?? ""}
                isAnonymous={user.isAnonymous}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aðgangur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Skráð netfang:{" "}
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              {user.role === "ADMIN" && (
                <Button asChild variant="outline">
                  <Link href="/admin">
                    <ShieldAlert className="h-4 w-4" />
                    Opna stjórnkerfi
                  </Link>
                </Button>
              )}
              <form action={logoutAction}>
                <Button type="submit" variant="ghost">
                  <LogOut className="h-4 w-4" />
                  Skrá út
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
