import { Blocks, PageHeader } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/concepts">) {
  return docsMetadata(params, "concepts");
}

export default async function ConceptsPage({ params }: PageProps<"/[locale]/docs/concepts">) {
  const { t } = await docsPage(params);
  const c = t.concepts;
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <Blocks blocks={c.blocks} />
    </article>
  );
}
