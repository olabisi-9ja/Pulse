import { Blocks, CardLink, H2, PageHeader } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "./_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs">) {
  return docsMetadata(params, "intro");
}

export default async function IntroPage({ params }: PageProps<"/[locale]/docs">) {
  const { locale, t } = await docsPage(params);
  const c = t.intro;
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <Blocks blocks={c.blocks} />
      <H2 id="next">{c.nextTitle}</H2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {c.next.map((n) => (
          <CardLink key={n.slug} href={`/${locale}/docs/${n.slug}`} title={n.title} body={n.body} />
        ))}
      </div>
    </article>
  );
}
