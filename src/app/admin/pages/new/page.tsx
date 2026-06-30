import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";

export default function AdminNewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Ný síða</h1>
      <p className="mt-1 text-muted-foreground">
        Búðu til nýja síðu með eigin slóð og efni.
      </p>
      <div className="mt-6">
        <PageEditor />
      </div>
    </div>
  );
}
