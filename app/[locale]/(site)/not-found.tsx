"use client";

import { useParams } from "next/navigation";
import { ButtonLink, Container, Eyebrow } from "@/components/site/ui";
import { isLocale } from "@/lib/i18n";
import { getSiteMessages } from "@/messages/site";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale && isLocale(params.locale) ? params.locale : "en";
  const t = getSiteMessages(locale).notFound;
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-navy sm:text-6xl">{t.title}</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{t.body}</p>
      <div className="mt-8">
        <ButtonLink href={`/${locale}`} arrow>
          {t.home}
        </ButtonLink>
      </div>
    </Container>
  );
}
