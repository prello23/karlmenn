import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { HeaderClient } from "@/components/header-client";
import { MAIN_NAV } from "@/lib/nav";
import { getNavTitles, HREF_TO_SLUG } from "@/lib/pages";

export async function SiteHeader() {
  const [session, titles] = await Promise.all([auth(), getNavTitles()]);

  // Nav labels come from the admin-editable page titles when available, so
  // renaming a page in the dashboard updates the menu live.
  const navItems = MAIN_NAV.map((item) => {
    const slug = HREF_TO_SLUG[item.href];
    return { href: item.href, label: (slug && titles[slug]) || item.label };
  });

  return (
    <HeaderClient
      isAuthed={Boolean(session?.user)}
      isAdmin={session?.user?.role === "ADMIN"}
      logoutAction={logoutAction}
      navItems={navItems}
    />
  );
}
