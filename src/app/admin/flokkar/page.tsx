import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category
    .findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { threads: true } } },
    })
    .catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Flokkar</h1>
      <p className="mt-2 text-muted-foreground">
        Bættu við, breyttu nafni eða eyddu umræðuflokkum.
      </p>

      <div className="mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
