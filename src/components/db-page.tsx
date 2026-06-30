import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/pages";

/**
 * Builds page metadata from the admin-editable Page record so title/description
 * changes in the dashboard appear live. `title.absolute` bypasses the layout
 * template because Page.title already includes the brand suffix.
 */
export async function getPageMetadata(
  slug: string,
  fallback: { title: string; description?: string },
): Promise<Metadata> {
  const page = await getPage(slug);
  return {
    title: page?.title ? { absolute: page.title } : fallback.title,
    description: page?.metaDescription || fallback.description,
  };
}

/**
 * Renders an editable page: a hero with the DB menu title plus the stored rich
 * HTML content. Falls back to provided defaults when the DB has no record.
 */
export async function DbPageContent({
  slug,
  eyebrow,
  fallbackTitle,
  fallbackDescription,
}: {
  slug: string;
  eyebrow?: string;
  fallbackTitle: string;
  fallbackDescription?: string;
}) {
  const page = await getPage(slug);
  const heading = page?.menuTitle || fallbackTitle;
  const content = page?.content?.trim();

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={heading}
        description={!content ? fallbackDescription : undefined}
      />
      {content && (
        <section className="py-12">
          <div className="container max-w-3xl">
            <div
              className="page-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </section>
      )}
    </>
  );
}
