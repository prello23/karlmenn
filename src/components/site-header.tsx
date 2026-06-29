import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { HeaderClient } from "@/components/header-client";

export async function SiteHeader() {
  const session = await auth();
  return (
    <HeaderClient
      isAuthed={Boolean(session?.user)}
      isAdmin={session?.user?.role === "ADMIN"}
      logoutAction={logoutAction}
    />
  );
}
