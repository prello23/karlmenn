import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const page = await prisma.page
    .findUnique({ where: { id: numId } })
    .catch(() => null);
  if (!page) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Breyta síðu</h1>
      <p className="mt-1 text-muted-foreground">{page.menuTitle}</p>
      <div className="mt-6">
        <PageEditor
          page={{
            id: page.id,
            slug: page.slug,
            title: page.title,
            menuTitle: page.menuTitle,
            metaDescription: page.metaDescription,
            content: page.content,
          }}
        />
      </div>
    </div>
  );
}
